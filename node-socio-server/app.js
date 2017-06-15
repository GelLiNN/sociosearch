var express = require('express');
var exhbs = require ('express-handlebars');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var loki = require('lokijs');

// Test indication variable for server
var isTestEnv = false;
if (process.argv.length == 3) {
    // Store command-line arguments to appropriately load for tests
    if (process.argv[2] === "-test") {
        console.log('======================================');
        console.log('========== TEST ENVIRONMENT ==========');
        console.log('======================================');
        isTestEnv = true;
    }
}

// Initialize LokiJS Database from file system
var db = new loki('sociosearch.db');
db.loadDatabase({}, function(err) {
    if (err) {
        console.log('error : ' + err);
    } else {
        console.log('SocioSearch database loaded!');
        var loadedUsers = db.getCollection('users').name;
        console.log('Collection: ' + loadedUsers);
    }
});

var routes = require('./routes/index');
var users = require('./routes/users');
var app = express();

// view engine pubic access setup
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exhbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport Init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));

// Connect Flash and global vars for flash messages
app.use(flash());
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    // for access to the user anywhere on Node server
    res.locals.user = req.user || null;
    next();
});

app.use('/', routes);
app.use('/users', users);

module.exports = app;
