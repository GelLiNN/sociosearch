var express = require('express');
var router = express.Router();
var passport = require('passport');
var request = require('request');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// Certain API variables to avoid reconnecting
var Twitter = null;
var twitterClient = null;
var googleTrends = require('google-trends-api');

/*
* About Routes
*/
router.get('/about', function(req, res) {
    res.render('about');
});

/*
* Register Routes
*/
router.get('/register', function(req, res) {
    res.render('register');
});
router.post('/register', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2;

    // Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
        res.render('register', {
            errors:errors
        });
    } else {
        /* UNCOMMENT TO ENABLE REGISTRATION
        var newUser = new User(name, email, password);
        User.createUser(newUser, function(err, user) {
            if (err) throw err;
            console.log('successful new user: ' + user.email);
        });
        req.flash('success_msg', 'Thank you ' + name + ' for registering with SocioSearch!');
        */
        req.flash('error_msg', 'Registration is currently disabled for SocioSearch');
        res.redirect('/users/login');
    }
});

/*
* Login Routes
*/
router.get('/login', function(req, res) {
    res.render('login');
});

// Serialization and Deserialization for Passport sessions
passport.serializeUser(function(user, cb) {
    cb(null, JSON.stringify(user));
});

passport.deserializeUser(function(packet, cb) {
    cb(null,JSON.parse(packet));
});

// Passport strategy for Login, using email as username
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, function(username, password, done) {
        User.getUserByEmail(username, function(user) {
            if (!user) {
                return done(null, false, {message: 'Oops! Unknown User, please try again.'});
            } else {
                console.log('Found user with input email!');
            }
            User.comparePassword(password, user.password, function(isMatch) {
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Oops! Invalid Password, please try again.'});
                }
            });
        });
    }));

// Login form POST endpoint
router.post('/login',
    passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login', failureFlash: true}),
    function(req, res) {
        res.redirect('/');
    });

/*
* Logout Routes
*/
router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success_msg', 'You are logged out!');
    res.redirect('/users/login');
});

/*
* Search Routes
*/
router.get('/search', ensureLoggedIn, function(req, res) {
    // Twitter client will connect when client is logged in, on Search Page
    Twitter = require('twitter');
    twitterClient = new Twitter({
          consumer_key: 'm3USj4URYqfbkhOuiBaf2zzhY',
          consumer_secret: 'qdlQ5LV0nAhVS09BH9lfV8PTUtaZm2zT4kAvoSfCa3U6jOTY2s',
          access_token_key: '1201654596-OVxltygt0tv4vxWekr4RK7o0cJlNXkCtEBtN0i2',
          access_token_secret: 'WYPNP46Z3mWTAZyfr7qZ1IlEApQKWbbTgYUb9UMKCX9hH'
    });
    res.render('search');
});

/* COPY
Function to ensure content blocked for those not logged in */
function ensureLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'You are not Logged in!');
        res.redirect('/users/login');
    }
}

// POST because we will be storing User searches in DB
router.post('/search', function(req, res) {
    var query = req.body.search_text;
    // Other filter and request params will be added here
    // Tweet search docs: https://dev.twitter.com/rest/reference/get/search/tweets

    twitterClient.get('search/tweets',
        {q: query, result_type: 'popular', count: 100},
        function(error, tweets, response) {

            googleTrends.interestOverTime({keyword: query})
                .then(function(results){
                    var arr = JSON.parse(results);
                    // pass local variables to the view for rendering
                    res.render('search', {
                        tweetsForClient: tweets.statuses,
                        googleTrends: arr.default.timelineData
                    });
                }).catch(function(err){
                    console.error(err);
                });
        });
});


module.exports = router;
