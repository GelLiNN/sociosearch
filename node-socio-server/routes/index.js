var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', ensureLoggedIn, function(req, res) {
    res.render('index');
});

/* Function to ensure content blocked for those not logged in */
function ensureLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'You are not Logged in!');
        res.redirect('/users/login');
    }
}

module.exports = router;
