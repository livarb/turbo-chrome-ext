function runIt() {
	addTurbo();

	// Fjern henvisning til data.norge.no
	$("#brukerveiledning").html('');

	reactToHash();
}

function reactToHash() {
	console.log("hash: " + location.hash);
	var hash = location.hash;
	if (hash) {
		if (hash.indexOf("=") !== -1) {
			var hashSplit = hash.substr(1).split("=");
			if (hashSplit[0] == "statistikk") {
				$("#brukerveiledning").text("Statistikk for " + hashSplit[1]);
				$("#brukerveiledning").append(getSpinner("statisticsSpinner") + "<br/>\n");
				$("#brukerveiledning").append("NB! Statistikk for periodar før 2017 har feil (manglar data for mange dagar).");
				showDatahotelStatistics(hashSplit[1]);
			}

		} else {
			$("#brukerveiledning").text(hash.substr(1));
		}

	} else {
		showListOfDatasets();
	}
}

function showListOfDatasets() {
	var fetchUrl = "https://hotell.difi.no/api/json/_all";

	$.getJSON( fetchUrl, function( data ) {
		var html;
		html = '<strong>Datasett (' + data.length + ')</strong><br/><br/>'
			+ '<table style="text-align: left;"><tr><th>Namn</th><th>Lokasjon</th></tr>';

		// https://stackoverflow.com/a/8837511
		data.sort(function(a, b){
		    var keyA = b.location,
		        keyB = a.location;
		    // Compare the 2 dates
		    if(keyA < keyB) return 1;
		    if(keyA > keyB) return -1;
		    return 0;
		});

		for (var i = 0; i < data.length; i++) {
			html += '<tr><td>' + data[i].name + '</td>'
				+ '<td><a href="https://hotell.difi.no/?dataset=' 
				+ data[i].location + '">' + data[i].location + '</a></td></tr>';
		} 
		html += '</table>';
		$("#datasets").html(html);
		$("#datasets").show();
	});
}

// https://stackoverflow.com/a/2901298
const numberWithSeparator = (x) => {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return parts.join(".");
}

function showDatahotelStatistics(datasetLocation) {
	var statisticsUrl = "https://hotell.difi.no/download/difi/datahotell/sidevisninger-pr-datasett?download";
    $.ajax({
        url: statisticsUrl,
        type: 'get',
        success: function(data) {
        	// console.log(data);
        	var stats = [];
        	$.csv.toObjects(data, {"separator": ";"}).forEach(function (element) {
        		if (element.dataset_location == datasetLocation) {
        			stats.push(element);
        		}
        	});
        	console.log(stats);

        	$("#brukerveiledning").append(
        		"<table id=\"statsTable\" style=\"border-spacing: 7px; "
        			+ "border-collapse: separate; "
        			+ "margin-left: auto; margin-right: auto\"><tr>"
        		+ "<th>Periode</th>"
        		+ "<th>Totalt</th>"
        		+ "<th>JSON</th>"
        		+ "<th>JSONP</th>"
        		+ "<th>XML</th>"
        		+ "<th>CSV</th>"
        		+ "<th>Nedlastingar</th>"
        		+ "<th>Trafikk</th>"        		
        		+ "</tr></table>"
        		);
        	stats.forEach(function (element) {
        		$("#statsTable").append(
        			"<tr>"
        			+ "<td align=\"left\">" + element.year + "-" + element.month + "</td>"
        			+ "<td align=\"right\">" 
        				+ numberWithSeparator(element.total_pageviews)
        				+ "</td>"
        			+ "<td align=\"right\">" 
        				+ numberWithSeparator(element.json)
        				+ "</td>"
        			+ "<td align=\"right\">" 
        				+ numberWithSeparator(element.jsonp)
        				+ "</td>"
        			+ "<td align=\"right\">" 
        				+ numberWithSeparator(element.xml)
        				+ "</td>"
        			+ "<td align=\"right\">" 
        				+ numberWithSeparator(element.csv)
        				+ "</td>"        				        				        				
        			+ "<td align=\"right\">" 
        				+ numberWithSeparator(element.download)
        				+ "</td>"
        			+ "<td align=\"right\">" 
        				+ element.traffic_hr
        				+ "</td>"          				        				
        			+ "</tr>");
        	});
        	// $("#statsTable tr:eq(0)").after("<tr><td>test</td></tr>");
        	$("#brukerveiledning")
        		.append("<a href=\"https://data.norge.no/data/direktoratet-forvaltning-og-ikt/bes%C3%B8kstal-datahotellet\">"
        			+ "Datakjelde: besøkstal for datahotellet.</a>");
        	$("#statisticsSpinner").remove();
        },
        error: function () {
        	alert("Feil ved henting av hotell-statistikk.");
        }
	});
}

$(window).on('hashchange', function() {
	reactToHash();
});

$(document).ready(() => runIt());