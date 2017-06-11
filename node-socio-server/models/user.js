/* Model for user object */
var loki = require('lokijs');
var bcrypt = require('bcryptjs');

// Load Database
var db = new loki('sociosearch.db');

// User constructor
function User(name, email, password) {
    this.name = name;
    this.email = email;
    this.password = password;
}

// User object
module.exports = User;

// Create user function which offers hashing and generated salts
module.exports.createUser = function(newUser, callback) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            // load db
            db.loadDatabase({}, function(err) {
                if (err) {
                    console.log("error : " + err);
                } else {
                    console.log("database loaded for new user registration.");
                    // insert new user into users collection
                    var curUsers = db.getCollection('users');
                    curUsers.insert({
                        name: newUser.name,
                        email: newUser.email,
                        password: newUser.password
                    });
                    // save db
                    db.saveDatabase(function(err) {
                        if (err) {
                            console.log("error : " + err);
                        } else {
                            console.log("database saved!");
                            callback(err, newUser);
                        }
                    });
                }
            });
        });
    });
}

// Find a user in the Sociosearch db by email
module.exports.getUserByEmail = function(emailToFind, callback) {
    console.log('getting user by email! ' + emailToFind);
    // load db
    db.loadDatabase({}, function(err) {
        if (err) {
            console.log("error : " + err);
        } else {
            console.log("database loaded for user auth.");
            var curUsers = db.getCollection('users');
            var thisUser = curUsers.where(function(obj) {
                return (obj.email === emailToFind);
            });
            callback(thisUser);
        }
    });
}

// Find a user in the Sociosearch session by ID
// TODO so user data isn't stored in the vulnerable session
module.exports.getUserById = function(id, callback) {
    console.log('attempting to find user ID for passport?');
}

// Compare the inputted password at Login to the hashed password in DB
module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function(isMatch) {
        callback(isMatch);
    });
}
