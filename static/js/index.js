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
    };    
    app.getfollow = function() {
        axios.get(getfollow_url)
        .then(function (result) {
            app.data.following = result.data.results;
        });
        
    }
    app.setFollow = (user) => {
        let usr = user.id;
        app.vue.following.push(usr)
        axios.post(follow_url, {user: usr}).then(
        axios.get(getfollow_url)
        .then(function (result) {
            app.data.following = result.data.results;
            app.data.onchange += 1;
        }));
        app.data.onchange += 1;
    }
    app.setunFollow = (user) => {
        let usr = user.id;
        ind = app.vue.following.indexOf(usr)
        app.vue.following.splice(ind,1)
        axios.post(unfollow_url, {user: usr}).then(
        axios.get(getfollow_url)
        .then(function (result) {
            app.data.following = result.data.results;
            app.data.onchange += 1;
        }));
        app.data.onchange += 1;
    }
    // }
    // app.follows = (user) => {
    //     console.log(user)
    //     console.log(app.data.following)
    //     console.log(user.id)
    //     if(app.data.following.includes(user.id)){
    //         console.log("following")
    //         return true;
    //     }
    //     return false;
    // }
    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };
    app.dispstart = function() {
        axios.get(get_users_url)
        .then(function (result) {
            app.vue.results = result.data.results;
        });
    }

    
    app.search = function () {
        if (app.vue.query.length >= 1) {
            axios.get(search_users_url, {params: {q: app.vue.query}})
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
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code in it. 
init(app);
