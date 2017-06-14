/* Client-side javascript for SocioSearch */

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
    var options = JSON.stringify({ search_text: text });
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
            chartData.push({"date": new Date(value.formattedAxisTime), "value": value.formattedValue[0]});
        });
        MG.data_graphic({
            title: '"' + text + '" Popularity Rankings',
            description: "Monthly Google Trends rankings from 2004 to Present.",
            data: chartData,
            full_width: true,
            height: 300,
            target: "#trendsChart",
            x_accessor: "date",
            y_accessor: "value",
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
    if (e.which == 13) {
        sendRequest();
    }
}
