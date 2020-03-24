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
var yahooFinance = require('yahoo-finance');

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
        // Registration
        var newUser = new User(name, email, password);
        User.createUser(newUser, function(err, user) {
            if (err) throw err;
            console.log('successful new user: ' + user.email);
        });
        req.flash('success_msg', 'Thank you ' + name + ' for registering with SocioSearch!');
        // req.flash('error_msg', 'Registration is currently disabled for SocioSearch');
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

/*
* POST request for searches from the search page
* Returns JSON to be parsed and displayed by client JS
*/
router.post('/search', function(req, res) {
    console.log('body: ' + JSON.stringify(req.body));
    var type = req.body.search_type;
    var query = req.body.search_text;
    var clientStartTime = req.body.search_start_time;
    // Other filter and request params will be added here
    if (type === 'Things') {
        completeThingsSearch(query, clientStartTime, res);
    } else if (type === 'Investments') {
        completeInvestmentsSearch(query, clientStartTime, res);
    } else {
        searchNotImplemented(query, clientStartTime, res);
    }
});

// Helper function for completing 'Things' Search type
function completeThingsSearch(query, clientStartTime, res) {
    // Tweet search docs: https://dev.twitter.com/rest/reference/get/search/tweets
    twitterClient.get('search/tweets',
        {q: query, result_type: 'popular', count: '100'},
        function(error, tweets, response) {

            // google-trends-api docs: https://github.com/pat310/google-trends-api
            googleTrends.interestOverTime({
                keyword: query,
                startTime: new Date(clientStartTime)

            }).then(function(results) {
                    var arr = JSON.parse(results);
                    // pass local variables to the view for rendering
                    res.send({
                        tweetsForClient: tweets.statuses,
                        googleTrends: arr.default.timelineData
                    });
                }).catch(function(err) {
                    console.error(err);
                });
        });
}

// Helper function for completing 'Investments' Search type
function completeInvestmentsSearch(query, clientStartTime, res) {
    var SYMBOL = query;
    var startDate = formatDateYahoo(clientStartTime);
    var endDate = formatDateYahoo(new Date());

    yahooFinance.historical({
        symbol: SYMBOL,
        from: startDate,
        to: endDate,
        period: 'd'
    }, function (err, quotes) {
        if (err) { throw err; }

        if (quotes[0]) {
            console.log(JSON.stringify(quotes));
            // pass local variables to the view for rendering
            res.send({
                quotesForClient: quotes,
                relatedSymbols: {}
            });
        } else {
            console.log('No results found for ' + query + ' Investments search');
        }
    });
}

function formatDateYahoo(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

// Helper function for completing searches that are broken or not implemented
function searchNotImplemented(query, startTime, res) {
    console.log("Search not yet implemented!");
    // pass local variables to the view for rendering
    res.send({
        clientQuery: query,
        clientStartTime: startTime
    });
}

module.exports = router;
