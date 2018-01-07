function runIt() {
	console.log("datahotell frontpage, jeah!");
	addTurbo();

	reactToHash();

	// Fjern henvisning til data.norge.no
	$("#brukerveiledning").html('');

	showListOfDatasets();

	// TODO: list in stead of pull-down
	// $("#datasets").show();
}

// TODO: eksperimentelt.
function reactToHash() {
	console.log("hash: " + location.hash);
	var hash = location.hash;
	if (hash) {
		if (hash.indexOf("=") !== -1) {
			console.log(hash);
		}

		var hashSplit = hash.split("=");
		$("#brukerveiledning").text(hash.substr(1));

	} else {
		console.log("no hash..");
	}
}

function showListOfDatasets() {
	var fetchUrl = "https://hotell.difi.no/api/json/_all";

	$.getJSON( fetchUrl, function( data ) {
		var html;
		console.log(data);
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

$(window).on('hashchange', function() {
	reactToHash();
});

$(document).ready(() => runIt());