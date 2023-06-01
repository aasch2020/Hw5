// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {
    // This is the Vue data.
    app.data = {
        // Complete as you see fit.
        query: "",
        results: [],
        following: [],
        onchange: 0,
        whichfeed: 0,
        currfeedL: [],
        newmeow: '',
        replies: [],
        commenting: false,
        currmeow: null,
        replyfield: '',

    };
    app.getfollow = function () {
        axios.get(getfollow_url)
            .then(function (result) {
                app.vue.following = result.data.results;
            });

    }
    app.postmeow = function () {
        // let usr = user.id;
        // app.vue.following.push(usr)
        if (app.data.newmeow != '') {
            axios.post(postmeow_url, { meow: app.data.newmeow }).then(function () {
                app.getmeows(app.data.whichfeed);
                app.data.newmeow = '';
            })
        }
    }
    app.remeow = function (meow) {
        textbody = "RT " + meow.author + ": " + meow.content
        console.log(textbody)
        axios.post(postmeow_url, { meow: textbody }).then(function () {
            app.getmeows(app.data.whichfeed);
        })
    }
    app.replmeow = function (meow) {
        console.log(meow)
        // textbody = "RT " + meow.author + ": " + meow.content
        // console.log(textbody)
        // axios.post(postmeow_url, { meow: textbody }).then(function () {
        //     app.getmeows(app.data.whichfeed);
        // })
        axios.post(replymeow_url, { meow: app.data.replyfield, replyid: meow.id }).then(function () {
            app.data.replyfield = ''
            app.getreplies(meow)
        })
    }
    app.replymenu = function (meow) {
        console.log(meow)
        app.data.currmeow = meow
        app.data.commenting = true
        app.getreplies(meow)
        // textbody = "RT " + meow.author + ": " + meow.content
        // console.log(textbody)
        // axios.post(postmeow_url, { meow: textbody }).then(function () {
        //     app.getmeows(app.data.whichfeed);
        // })
    }
    app.getreplies = function (meow) {
        axios.get(getreplies_url, { params: { id: meow.id } })
        .then(function (result) {
            app.vue.replies = result.data.results;
        });
    }
    app.timefix = function (time) {
        return Sugar.Date(time + "Z").relative();
    }
    app.getmeows = function (selected) {
        console.log("getting meows")
        axios.get(getmeows_url, { params: { pick: selected } })
            .then(function (result) {
                app.vue.currfeedL = result.data.results;
                console.log(app.vue.currfeedL)
            });
    }
    app.setyourfeed = function () {
        app.data.commenting = false
        app.data.whichfeed = 0;
        app.getmeows(0);
    }
    app.setminefeed = function () {
        app.data.commenting = false
        app.data.whichfeed = 1;
        app.getmeows(1);
    }
    app.setrecentfeed = function () {
        app.data.commenting = false
        app.data.whichfeed = 2;
        app.getmeows(2);
    }
    app.setFollow = (user) => {
        let usr = user.id;
        app.vue.following.push(usr)
        axios.post(follow_url, { user: usr })
        // .then(
        // axios.get(getfollow_url)
        // .then(function (result) {
        //     app.vue.following = result.data.results;
        // }));
    }
    app.setunFollow = (user) => {
        let usr = user.id;
        ind = app.vue.following.indexOf(usr)
        app.vue.following.splice(ind, 1)
        axios.post(unfollow_url, { user: usr })

    }

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => { e._idx = k++; });
        return a;
    };
    app.dispstart = function () {
        axios.get(get_users_url)
            .then(function (result) {
                app.vue.results = result.data.results;
            });
    }
    app.clear = function () {
        app.vue.query = ""
        app.search()
    }

    app.search = function () {
        if (app.vue.query.length >= 1) {
            axios.get(search_users_url, { params: { q: app.vue.query } })
                .then(function (result) {
                    app.vue.results = result.data.results;
                });
        } else {
            axios.get(get_users_url)
                .then(function (result) {
                    app.vue.results = result.data.results;
                });
        }
    }
    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        search: app.search,
        set_follow: app.setFollow,
        set_unfollow: app.setunFollow,
        get_follow: app.getfollow,
        clear: app.clear,
        setyourfeed: app.setyourfeed,
        setminefeed: app.setminefeed,
        setrecentfeed: app.setrecentfeed,
        timefix: app.timefix,
        postmeow: app.postmeow,
        remeow: app.remeow,
        replmeow: app.replmeow,
        replymenu: app.replymenu,
        getreplies: app.getreplies,
        // replycount: app.replycount,
        // follows: app.follows,
    };




    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods,
    });

    // And this initializes it.
    app.init = () => {
        // Put here any initialization code.
        app.dispstart()
        axios.get(getfollow_url)
            .then(function (result) {
                app.data.following = result.data.results;
            });
        console.log(app.data.following)
        app.setyourfeed();
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code in it. 
init(app);
