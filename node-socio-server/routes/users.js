var express = require('express');
var router = express.Router();

/* About */
router.get('/about', function(req, res) {
    res.render('about');
});

/* Register */
router.get('/register', function(req, res) {
    res.render('register');
});

/* Login */
router.get('/login', function(req, res) {
    res.render('login');
});

module.exports = router;
