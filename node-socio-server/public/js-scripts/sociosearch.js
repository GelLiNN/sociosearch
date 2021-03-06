/* Client-side javascript for SocioSearch
 * Author: Kellan Nealy
 */

/* Search variables */
var searchStart = new Date('2004-01-01');
var timeFilter = "Default Filter";
var searchType = "Things"; /* default search type */

/* On document load update active nav element */
$(document).ready(function () {
    var url = window.location;
    $('ul.nav a[href="'+ url +'"]').parent().addClass('active');
    $('ul.nav a').filter(function() {
         return this.href == url;
    }).parent().addClass('active');
});

/* Send Search Request to server for results */
function sendRequest() {
    var queryText = $("#search_text").val();
    $("#search-loading").show();

    // get server request options from search inputs
    var options = JSON.stringify({
        search_text: queryText,
        search_type: searchType,
        search_start_time: searchStart.toJSON() });

    $.ajax({
        type: 'POST',
        data: options,
        contentType: 'application/JSON',
        url: "/users/search"
    }).done(function(data) {
        $("#search-loading").hide();
        clearResults();

        if (data.quotesForClient) {
            printInvestmentsChart(queryText, data);
        } else if (data.googleTrends) {
            printThingsChart(queryText, data);

            var tweetResults = $('#thumbnail-results');
            var html = "";
            var tweets = data.tweetsForClient;
            $(tweets).each(function(index, value) {
                html += "<div class='col-md-3' id='search-result'><h2>" +
                value.user.name + "</h2><p>" + value.text +
                "</p><p><a class='btn btn-primary' href='' role='button'>View details &raquo;</a></p></div>";
            });
            tweetResults.html(html);
        } else {
            var errorResults = $('#thumbnail-results');
            var html = "<div class='alert ss-alert alert-danger'>" + data.clientQuery + " Search Not Implemented!</div>";
            errorResults.html(html);
        }
    });
}

/* Support for enter key for searching */
function inputKeyUp(e) {
    e.which = e.which || e.keyCode;
    if (e.which === 13) {
        sendRequest();
    }
}

/* Switch active search filter in the search UI */
function switchActiveFilter(reference) {
    if (reference != null) {
        var newFilter = document.getElementById(reference);
        var oldFilter = document.getElementById('active_filter');
        var oldText = oldFilter.innerText;
        var newText = newFilter.innerText;
        // Update variable time filter for search, then update
        updateTimeFilter(newText);
        oldFilter.innerText = newText;
        newFilter.innerText = oldText;
    }
}

/* Update search variable for time filter with Date objects */
function updateTimeFilter(filter) {
    if (filter === "Default Filter") {
        searchStart = new Date('2004-01-01');

    } else if (filter === "Earliest To Date") {
        searchStart = new Date('2000-01-01');

    } else if (filter === "One Year") {
        searchStart = new Date();
        searchStart.setFullYear(searchStart.getFullYear() - 1);

    } else if (filter === "Six Months") {
        searchStart = new Date();
        searchStart.setMonth(searchStart.getMonth() - 6);

    } else if (filter === "Today") {
        searchStart = new Date();
        searchStart.setDate(searchStart.getDate() - 1);
    }
    timeFilter = filter;
}

/* Switch active search type in the search UI */
function switchActiveType(reference) {
    if (reference != null) {
        var newType = document.getElementById(reference);
        var oldType = document.getElementById('active_type');
        var oldText = oldType.innerText;
        var newText = newType.innerText;
        // Update variable search type, this corresponds to ID
        searchType = newText;
        oldType.innerText = newText;
        newType.innerText = oldText;
    }
}

/* Print metricsgraphics Chart widget for Investments */
function printInvestmentsChart(queryText, data) {
    var priceData = [];
    $(data.quotesForClient).each(function(index, value) {
        priceData.push({"date": new Date(value.date), "value": value.close});
    });
    MG.data_graphic({
        title: '"' + queryText + '" Closing Share Prices',
        description: "Daily Closing Share Prices",
        data: priceData,
        show_secondary_x_label: true,
        full_width: true,
        height: 300,
        target: "#trendsChart",
        x_accessor: "date",
        y_accessor: "value"
    });
}

/* Print metricsgraphics Chart widget for Things */
function printThingsChart(queryText, data) {
    var chartData = [];
    $(data.googleTrends).each(function(index, value) {
        if (timeFilter === "Today") {
            chartData.push({"date": new Date(value.time * 1000), "value": value.formattedValue[0]});
        } else {
            chartData.push({"date": new Date(value.formattedAxisTime), "value": value.formattedValue[0]});
        }
    });
    MG.data_graphic({
        title: '"' + queryText + '" Popularity Rankings',
        description: "Google Trends Global Rankings",
        data: chartData,
        show_secondary_x_label: true,
        full_width: true,
        height: 300,
        target: "#trendsChart",
        x_accessor: "date",
        y_accessor: "value",
        max_y: 100
    });
}

/* Clear chart content and results content from UI */
function clearResults() {
    document.getElementById("trendsChart").innerHTML = "";
    document.getElementById("thumbnail-results").innerHTML = "";
}

/* CAPTCHA functionality for registration page */
function Captcha(){
    var alpha = new Array('A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z');
    var i;
    for (i = 0; i < 6; i++){
        var a = alpha[Math.floor(Math.random() * alpha.length)];
        var b = alpha[Math.floor(Math.random() * alpha.length)];
        var c = alpha[Math.floor(Math.random() * alpha.length)];
        var d = alpha[Math.floor(Math.random() * alpha.length)];
        var e = alpha[Math.floor(Math.random() * alpha.length)];
        var f = alpha[Math.floor(Math.random() * alpha.length)];
        var g = alpha[Math.floor(Math.random() * alpha.length)];
    }
    var code = a + ' ' + b + ' ' + ' ' + c + ' ' + d + ' ' + e + ' ' + f + ' ' + g;
    document.getElementById("mainCaptcha").value = code
}

/* CAPTCHA validation for registration page */
function ValidCaptcha(){
    var string1 = captchaRemoveSpaces(document.getElementById('mainCaptcha').value);
    var string2 = captchaRemoveSpaces(document.getElementById('txtInput').value);
    var formElems = document.getElementsByClassName('form-control');
    if (string1 == string2) {
        // Enable registration inputs and submit button
        for (var i = 0, len = formElems.length; i < len; i++) {
            formElems[i].disabled = false;
        }
        document.getElementById('registerSubmit').disabled = false;
    } else {
        // Do something more elaborate for failed CAPTCHA
    }
    return string1 == string2;
}

/* CAPTCHA remove spaces helper */
function captchaRemoveSpaces(string){
    return string.split(' ').join('');
}
