var express = require('express');
var router = express.Router();

var User = require('../models/user');

/* About */
router.get('/about', function(req, res) {
    res.render('about');
});

/* Register */
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
            console.log('successful new user:\n' + user);
        });
        req.flash('success_msg', 'Thank you ' + name + ' for registering with SocioSearch!');
        res.redirect('/users/login');
    }
    console.log(name);
});

/* Login */
router.get('/login', function(req, res) {
    res.render('login');
});

module.exports = router;
