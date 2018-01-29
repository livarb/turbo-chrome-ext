function addHTML() {
	var htmlToInsert = 
	'<span style="font-size: 12px;">'
	+ '<span id="searchSubtext1">Lastar...</span><br/>'
	+ '<span id="searchSubtext2"></span>'
	+ '</span>';

	$("#data-panel div:first-child").append(htmlToInsert);
}

function addLastUpdated(data) {
	$("#searchSubtext1").text("Oppdatert: " + timeConverter(data.updated));
}

function addDatahotelDatasetTitle(data) {
	// $("#datasets").html("<strong>" + data.name + "</strong> — tittel lagra i datahotellet");
	var html = 	'<div id="datasetinfo" style="text-align: center; padding-bottom: 5pt;"><strong>' + data.name + "</strong> — tittel lagra i datahotellet</div>";
	$("#datasets").after(html);	
}

function addLinkToFields(dataset) {
	$("#searchSubtext2").html(
		'<p><a href="https://hotell.difi.no/api/json/'
		+ dataset
		+ '/fields">Feltdefinsjonar (JSON)</a></p>'
		);
	$("#searchSubtext2").append("<p><a href=\"/#statistikk=" + dataset + "\">Statistikk</p>");
}

function prepareDatanorgeLink() {
	$("#brukerveiledning").html("* Laster inn fra data.norge — tittel på datasett, navn på utgiver, og lenke til data.norge-oppføring. *");	
}

function addDatanorgeLink(datasetLocation, datanorgedatasets) {
	var dataNorgeDataset;
	datasetLoop:
	for (var i = 0; i < datanorgedatasets.length; i++) {
		var dataset = datanorgedatasets[i];

		if (dataset.hasOwnProperty("distribution")) {
			for (var j = 0; j < dataset.distribution.length; j++) {
				var dist = dataset.distribution[j];
				if (dist.accessURL.startsWith("http://hotell.difi.no/?dataset=") 
					|| dist.accessURL.startsWith("https://hotell.difi.no/?dataset=")) {

					var datasett = dist.accessURL.split("=")[1];

					if (datasetLocation == datasett) {
						dataNorgeDataset = dataset;
						break datasetLoop;		
					}
				}
			}
		}
	}

	if (dataNorgeDataset) {
		var htmlToInsert = '<strong>' + dataset.title + ' — ' 
			+ dataset.publisher.name + '</strong><br/><a href="' + dataset.id 
			+ '">Tilbake til datasettet si side på data.norge.no</a>';
		// $("#searchSubtext2").html(htmlToInsert);
		$("#brukerveiledning").html(htmlToInsert);
	} else {
		var htmlToInsert = '<strong>OBS!</strong> Ingen informasjon om dette datasettet på data.norge.no.<br/> '
		+ 'Dette kan skyldes at datasettet ikkje er registrert endå, at det er avpublisert av datautgiver, utdatert, feil eller lignende.';
		// $("#searchSubtext2").html(htmlToInsert);
		$("#brukerveiledning").html(htmlToInsert);
	}
}

function addDatasetSize(dataset) {
	$.ajax({
		method: 'HEAD',
		url: 'https://hotell.difi.no/download/' + dataset,
		success: function(data, textStatus, request) {
			var contentLength = request.getResponseHeader('content-length');
			console.log(request.getAllResponseHeaders());
			$("#data-uris").append('<br/>Størrelse: ' + formatBytes(contentLength, 1));
		},
		error: function() {
			console.log("error getting HEAD of dataset-download!");
		}
	});
}

function runIt() {
	addHTML();
	addTurbo();

	var datasetLocation = document.URL.split("=")[1];
	console.log(datasetLocation);

	// Grei advarsel til ein sjølv, dersom ein prøver å opprette eit datasett med underscore i sti-navnet..
	if (datasetLocation.includes("_")) {
		alert("Datahotellet støtter ikkje datasett-adresser med underscore («_») i tittelen. Er du sikker på at du har skrive rett adresse?\n-Turbo");
	}

	// Fetches "/meta" for dataset
	var fetchUrl = "https://hotell.difi.no/api/json/" + datasetLocation + "/meta";

	$.getJSON( fetchUrl, function( data ) {
		addLastUpdated(data);
		addDatahotelDatasetTitle(data);
	});

	addLinkToFields(datasetLocation);
	prepareDatanorgeLink();

	addDatasetSize(datasetLocation);

	$.getJSON( datanorgeDatasetsURL, function( data ) {
	  var datanorgedatasets = data;
	  addDatanorgeLink(datasetLocation, datanorgedatasets);
	});
}

$(document).ready(() => runIt());