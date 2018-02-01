function insertDatanorgeLink(data) {
	var datanorgeFDKmap = data;

	var url = document.URL.split("/");
	var datasetIdRaw = url[url.length-1];

	var datasetId = decodeURIComponent(datasetIdRaw);		

	if (data.hasOwnProperty(datasetId)) {
		console.log("data.norge import detected!");

		var dataNorgeUrl = "https://data.norge.no/node/" + data[datasetId];

		var htmlToInsert = ' <br/><div style="margin-top: 10px"><span id="turboDataNorgeLink">'
			+ '<a href="' + dataNorgeUrl + '">Sjå datasettet i data.norge.no</a></span>'
			+ '<span id="edplink" style="float: right;">'
			+ getSpinner("edplinkspinner")
			+ ' <a id="edplinka" href="#">Sjå datasettet i den Europeiske dataportalen</a> '
			+ '</span></div>';
		$("div.fdk-margin-bottom").first().append(htmlToInsert);

		fetchAndAddEDPLink(data[datasetId]);
	}
}

function runIt() {
	console.log("turbo enabled!");

	// Hent koblingar mellom datasett i data.norge og FDK
	$.getJSON( datanorgeFDKmapURL, function( data ) {
	  insertDatanorgeLink(data);
	});
}

$(document).ready(() => runIt());