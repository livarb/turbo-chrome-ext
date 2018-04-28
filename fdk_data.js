function insertDatanorgeAndEDPLink(data) {
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

function swapToRichDescription(data) {
	var datanorgeFDKmap = data;

	var url = document.URL.split("/");
	var datasetIdRaw = url[url.length-1];

	var datasetId = decodeURIComponent(datasetIdRaw);		

	if (datanorgeFDKmap.hasOwnProperty(datasetId)) {
		$("p.fdk-ingress:first").prepend( getSpinner("descriptionSpinner") );

		var dataNorgeUrl = "https://data.norge.no/node/" + datanorgeFDKmap[datasetId];

		$.getJSON( datanorgeDatasetsURL, function( data ) {
		  var datanorgedatasets = data;
		  var dataset = getDataset(datanorgeFDKmap[datasetId], datanorgedatasets);

		  if (dataset.description.length > 1) {
		  	if (dataset.description[0].language == "nb") {
		  		$("p.fdk-ingress:first").html(dataset.description[0].value);		  		
		  	} else if (dataset.description[1].language == "nb") {
		  		$("p.fdk-ingress:first").html(dataset.description[1].value);		  				  		
		  	} else {
		  		console.log("TURBO-ERROR: could not insert the right description!");
		  		$("#descriptionSpinner").remove();
		  	}
		  } else {
		  	$("p.fdk-ingress:first").html(dataset.description[0].value);
		  }
		});
	}	
}

function runIt() {
	console.log("turbo enabled!");

	// Hent koblingar mellom datasett i data.norge og FDK
	$.getJSON( datanorgeFDKmapURL, function( data ) {
	  insertDatanorgeAndEDPLink(data);
	  swapToRichDescription(data);
	});
}

$(document).ready(() => runIt());