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
				$("#datasets").hide();
				$("#brukerveiledning").html(
					'<b>Statistikk for <a href="https://hotell.difi.no/?dataset=' 
					+ escapeHtml(hashSplit[1]) + '">'
					+ escapeHtml(hashSplit[1]) + '</a></b>');
				$("#brukerveiledning").append(getSpinner("statisticsSpinner") + "<br/>\n");
				$("#brukerveiledning").append("NB! Statistikk for periodar før 2017 har feil (manglar data for mange dagar).<br/>");
				showDatahotelStatistics(hashSplit[1]);
				$("#brukerveiledning").show();
			}

		} else {
			$("#brukerveiledning").text(hash.substr(1));
		}

	} else {
		$("#brukerveiledning").hide();
		showListOfDatasets();
	}
	sendPageView();
}

function showListOfDatasets() {
	var fetchUrl = "https://hotell.difi.no/api/json/_all";

	$.getJSON( fetchUrl, function( data ) {
		var html;
		html = '<strong>Datasett (' + data.length + ')</strong><br/><br/>'
			+ '<table style="text-align: left;"><tr>'
			+ '<th>Namn</th><th>Statistikk&nbsp;</th><th>Lokasjon</th></tr>';

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
				+ '<td><a href="/#statistikk=' + data[i].location + '">Statistikk</a></td>'
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
        timeout: 42000,
        type: 'get',
        success: function(data) {
        	var stats = [];
        	$.csv.toObjects(data, {"separator": ";"}).forEach(function (element) {
        		if (element.dataset_location == datasetLocation) {
        			stats.push(element);
        		} else if (datasetLocation == "") {
        			stats.push(element);
        		}
        	});
        	console.log(stats);

        	// https://stackoverflow.com/a/7000222
        	var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

        	if (isFirefox) {
        		$("#brukerveiledning").append(
        			"<br/>Grunna feil i Firefox, fungerer ikkje graf-biblioteket Highcharts dersom du brukar Firefox som nettlesar. "
        			+ "<br/>Dette fungerer derimot fint i <a href=\"https://www.google.com/chrome/\">Chrome</a>.<br/><br/>");
        	} else {

        	if (datasetLocation == "") {
        		console.log("empty datasetLocation");
        		var statsCollapsed = collapseStats(stats);
        		var series = generateHighChartsSeries(stats);        		
        	} else {
        		var series = generateHighChartsSeries(stats);
        	}        	
        	console.log(series);

        	$("#brukerveiledning").append(
        		'<div id="highchartsContainer"></div>'
        		);

        	Highcharts.chart('highchartsContainer', {
			    title: {
			        text: 'Trafikk på datasettet'
			    },

			    // subtitle: {
			    //     text: 'Kjelde: hotell.difi.no'
			    // },

				xAxis: {
					categories: series[0]
			    },

			    yAxis: {
			        title: {
			            text: 'API-kall'
			        }
			    },
			    legend: {
			        layout: 'vertical',
			        align: 'right',
			        verticalAlign: 'middle'
			    },

			    plotOptions: {
			        series: {
			            label: {
			                connectorAllowed: false
			            }
			            // ,
			            // pointStart: 2010
			        }
			    },

			    series: series[1],

			    responsive: {
			        rules: [{
			            condition: {
			                maxWidth: 500
			            },
			            chartOptions: {
			                legend: {
			                    layout: 'horizontal',
			                    align: 'center',
			                    verticalAlign: 'bottom'
			                }
			            }
			        }]
			    }
			});
			}

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

        	$("#brukerveiledning")
        		.append("<a href=\"https://data.norge.no/data/direktoratet-forvaltning-og-ikt/bes%C3%B8kstal-datahotellet\">"
        			+ "Datakjelde: besøkstal for datahotellet.</a>");
        	$("#statisticsSpinner").remove();
        },
        error: function () {
        	alert("Feil ved henting av hotell-statistikk.");
        	console.log("Fekk ikkje henta hotell-statistikk");
        	$("#statisticsSpinner").remove();
        }
	});
}

function collapseStats(data) {
	return data;
	/*
	var collapsedData;

	var newData = [];

	el.year
	el.month
	el.total_pageviews
	el.json
	el.jsonp
	el.xml
	el.csv
	el.download

	var period = el.year + "-" + el.month;

	newData.push(test);

	data.forEach(function(el) {

	});
	*/
}

// for months only
function generateHighChartsSeries(data) {
	var data = data.slice(0).reverse();

	var categories = [];
	var seriesTotal = [];
	var seriesJson = [];
	var seriesXml = [];
	var seriesCsv = [];
	var seriesDownload = [];	
	data.forEach(function(el) {
		if (isInt(el.month)) { // only if month is integer
			var period = el.year + "-" + el.month;
			categories.push(period);
			seriesTotal.push(parseInt(el.total_pageviews, 10));
			seriesJson.push(parseInt(el.json, 10) + parseInt(el.jsonp, 10));
			seriesXml.push(parseInt(el.xml, 10));
			seriesCsv.push(parseInt(el.csv));
			seriesDownload.push(parseInt(el.download));
		}
	});
	var series = [{
		name: 'Totalt',
		data: seriesTotal
	}, {
		name: 'JSON(P)',
		data: seriesJson
	}, {
		name: 'XML',
		data: seriesXml
	}, {
		name: "CSV",
		data: seriesCsv
	}, {
		name: "Nedlastingar",
		data: seriesDownload
	}];
	return [categories, series];
}

$(window).on('hashchange', function() {
	reactToHash();
});

$(document).ready(() => runIt());