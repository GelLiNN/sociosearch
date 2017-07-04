/* Client-side javascript for SocioSearch
 * Author: Kellan Nealy
 */

/* Search variables */
var searchStart = new Date('2004-01-01');
var isDayChart = false;
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
    var text = $("#search_text").val();
    $("#search-loading").show();

    // Form server request options
    var options = JSON.stringify({
        search_text: text,
        search_type: searchType,
        search_start_time: searchStart.toJSON() });

    $.ajax({
        type: 'POST',
        data: options,
        contentType: 'application/JSON',
        url: "/users/search"
    }).done(function(data) {
        $("#search-loading").hide();
        var tweetResults = $('#thumbnail-results');
        var chartData = [];
        $(data.googleTrends).each(function(index, value) {
            if (isDayChart) {
                chartData.push({"date": new Date(value.time), "value": value.formattedValue[0]});
            } else {
                chartData.push({"date": new Date(value.formattedAxisTime), "value": value.formattedValue[0]});
            }
        });
        MG.data_graphic({
            title: '"' + text + '" Popularity Rankings',
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

        var html = "";
        var tweets = data.tweetsForClient;
        $(tweets).each(function(index, value) {
            html += "<div class='col-md-3' id='search-result'><h2>" +
            value.user.name + "</h2><p>" + value.text +
            "</p><p><a class='btn btn-primary' href='' role='button'>View details &raquo;</a></p></div>";
        });
        tweetResults.html(html);
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
