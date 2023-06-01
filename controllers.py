"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

import datetime
import random

from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_username, get_userID


url_signer = URLSigner(session)

# Some constants.
MAX_RETURNED_USERS = 20 # Our searches do not return more than 20 users.
MAX_RESULTS = 20 # Maximum number of returned meows. 

@action('index')
@action.uses('index.html', db, auth.user, url_signer)
def index():
    return dict(
        # COMPLETE: return here any signed URLs you need.
        get_users_url=URL('get_users', signer=url_signer), 
        search_users_url=URL('search_users', signer=url_signer),
        follow_url=URL('set_follow', signer=url_signer),
        unfollow_url=URL('set_unfollow', signer=url_signer),
        getfollow_url=URL('get_following', signer=url_signer),
        getmeows_url=URL('get_meows',signer=url_signer),
        postmeow_url=URL('post_meow',signer=url_signer),
        replymeow_url=URL('reply_meow',signer=url_signer),
        getreplies_url=URL('get_replies',signer=url_signer)
    )

@action("get_users")
@action.uses(db, auth.user)
def get_users():
    results = db((db.auth_user.username != get_username())).select()
    following = db((db.follow.user_id == get_userID())).select()
    followl = [x for x in results if (x.id in [i['following_id'] for i in following])]
    nonfollow = [x for x in results if not (x.id in [i['following_id'] for i in following])]
    sortedl = followl + nonfollow
    # print(results)
    return dict(results=sortedl)

@action("get_following")
@action.uses(db, auth.user, url_signer.verify())
def get_followers():
    results = db((db.follow.user_id == get_userID())).select()
    # print("Get the followings")
    results =[m['following_id'] for m in results]
    results = results[0:20]
    # print(results)
    return dict(results=results)
@action("search_users")
@action.uses(db, auth.user)
def search_users():
    
    q = request.params.get("q")
    thin = len(q)
    results = db((db.auth_user.username[:thin] == q) & (db.auth_user.username != get_username()) ).select()
    following = db((db.follow.user_id == get_userID())).select()
    followl = [x for x in results if (x.id in [i['following_id'] for i in following])]
    nonfollow = [x for x in results if not (x.id in [i['following_id'] for i in following])]
    sortedl = (followl + nonfollow)
    sortedl = sortedl[0:20]
    # print(results)
    return dict(results=sortedl)
@action("set_follow", method="POST")
@action.uses(db, auth.user, url_signer.verify())
def set_follow():
    usradd = request.json.get('user')
    
    assert usradd is not None
    uid = get_userID()
    db.follow.insert(user_id = uid, following_id = usradd)
    db.commit()
    return "ok"

@action("set_unfollow", method="POST")
@action.uses(db, auth.user, url_signer.verify())
def set_unfollow():

    usradd = request.json.get('user')
    assert usradd is not None
    uid = get_userID()
    db(((db.follow.user_id == uid) & (db.follow.following_id == usradd))).delete()
    # print('postdel')
    # getting = db((db.follow.user_id == uid) & (db.follow.following_id == usradd)).select()
    # print(getting)
    # print(db((db.follow.user_id == uid) & (db.follow.following_id == usradd))._delete())
    db.commit()
    return "ok"

@action("post_meow", method="POST")
@action.uses(db, auth.user, url_signer.verify())
def post_meow():
    meowtext = request.json.get('meow')
  # print(meowtext)

    uid = get_userID()
    uname = get_username()
    assert uid is not None
  # print(uid)
  # print(uname)
    db.meow.insert(uid = uid, author = uname, timestamp = datetime.datetime.utcnow(), content=meowtext)
    db.commit()
    return "ok"

@action("reply_meow", method="POST")
@action.uses(db, auth.user, url_signer.verify())
def reply_meow():
    meowtext = request.json.get('meow')
    replyto = request.json.get('replyid')
  # print(meowtext)

    uid = get_userID()
    uname = get_username()
    assert uid is not None
  # print(uid)
  # print(uname)
    db.meow.insert(uid = uid, author = uname, timestamp = datetime.datetime.utcnow(), content=meowtext, comment_ref=replyto)
    db.commit()
    return "ok"
@action("get_replies")
@action.uses(db, auth.user)
def get_replies():
    parentreply = request.params.get('id')
    ret = db(db.meow.comment_ref == parentreply).select()
    return dict(results = ret)

def isofy(meow):
  # print(meow['timestamp'])
    meow['timestamp'] = meow['timestamp'].isoformat()
    return meow
def addreplies(thing):
    thing.update({'replies': db(db.meow.comment_ref == thing['id']).count()})
    return thing
@action("get_meows")
@action.uses(db, auth.user)
def get_meows():
    list2pick = request.params.get('pick')
  # print(list2pick)

    if(list2pick == '0'):
        allmeow = []
        for i in db((db.follow.user_id == get_userID())).select():
            allmeow += list(db(db.meow.uid == i.following_id).select())

        allmeow.sort(key=lambda x: x.timestamp, reverse=True)
      # print(allmeow)
        if len(allmeow) == 0:
            retmeow = db().select(db.meow.ALL, orderby=~db.meow.timestamp)
          # print(retmeow)

            fixl = [isofy(m) for m in retmeow]
            allmeow = fixl
      # print(allmeow)
        dicted = [x.as_dict() for x in allmeow]
      # print(dicted)
        withcount = list(map(addreplies, dicted))
        print(withcount)
        return dict(results=withcount)
    elif(list2pick == '1'):
        userid = get_userID()
        allmeow = list(db(db.meow.uid == userid).select())
        allmeow.sort(key=lambda x: x.timestamp, reverse=True)
      # print(allmeow)
        dicted = [x.as_dict() for x in allmeow]
      # print(dicted)
        withcount = list(map(addreplies, dicted))
        print(withcount)
        return dict(results=withcount)
    else:
      # print("recentmeow")
        retmeow = db().select(db.meow.ALL, orderby=~db.meow.timestamp)
        # print(retmeow)
        fixl = [isofy(m) for m in retmeow]
      # print(allmeow)
        dicted = [x.as_dict() for x in fixl]
      # print(dicted)
        withcount = list(map(addreplies, dicted))
        print(withcount)
        return dict(results=withcount)

