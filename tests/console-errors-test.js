/*
* Author: Kellan Nealy
* Phantomjs test loads page and prints browser console
* gives load time and page title
*/
var url = "http://localhost:3000/users/login"
var page = require('webpage').create();
var t = Date.now();
console.log('testing page at: ' + url);

page.onConsoleMessage = function(msg) {
    console.log('Page title is ' + msg);
};
page.open(url, function(status) {
    if (status !== 'success') {
        console.log('FAIL to load the address');
    } else {
        t = Date.now() - t;
        console.log('Loading ' + url);
        console.log('Loading time ' + t + ' msec');
        //evaluate load time for the page
        page.evaluate(function() {
            console.log(document.title);
        });
    }
    // Exit phantomjs after tests
    phantom.exit();
});
