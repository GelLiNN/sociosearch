var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

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
        var newUser = new User(name, email, password);
        User.createUser(newUser, function(err, user) {
            if (err) throw err;
            console.log('successful new user: ' + user.email);
        });
        req.flash('success_msg', 'Thank you ' + name + ' for registering with SocioSearch!');
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

/* Correct serialization using IDs instead of user packet
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(user) {
        done(err, user);
    });
});
*/

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
router.get('/search', function(req, res) {
    res.render('search');
});

module.exports = router;
