function insertDatanorgeLink(data) {
	var datanorgeFDKmap = data;

	var url = document.URL.split("/");
	var datasetIdRaw = url[url.length-1];

	var datasetId = decodeURIComponent(datasetIdRaw);		

	if (data.hasOwnProperty(datasetId)) {
		console.log("data.norge import detected!");

		var dataNorgeUrl = "https://data.norge.no/node/" + data[datasetId];

		var htmlToInsert = ' <br/><span id="turboDataNorgeLink"><a href="' + dataNorgeUrl + '">Sjå datasett på data.norge.no</></span>';
		$("div.fdk-margin-bottom").first().append(htmlToInsert);		
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