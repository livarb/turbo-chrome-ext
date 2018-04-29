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
	$("#brukerveiledning").html(getSpinner("datanorgelinkspinner") + " Laster inn fra data.norge — tittel på datasett, navn på utgiver, og lenke til data.norge-oppføring.");	
}

function addDatanorgeLink(datasetLocation, datanorgedatasets, removeSpinner = true, newData = true) {
	if (newData) {
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

		var htmlToInsert = '';

		if (dataNorgeDataset) {
			htmlToInsert += '<strong>' + dataset.title + ' — ' 
				+ dataset.publisher.name + '</strong>';

			if (removeSpinner === false) {
				htmlToInsert += getSpinner("datanorgelinkspinner");
			}

			htmlToInsert += '<br/><a href="' + dataset.id 
				+ '">Tilbake til datasettet si side på data.norge.no</a>';
			// $("#searchSubtext2").html(htmlToInsert);
			$("#brukerveiledning").html(htmlToInsert);
		} else {
			htmlToInsert += '<strong>OBS!</strong> Ingen informasjon om dette datasettet på data.norge.no.<br/> '
			+ 'Dette kan skyldes at datasettet ikkje er registrert endå, at det '
			+ 'er avpublisert av datautgiver, utdatert, feil eller lignende.';

			if (removeSpinner === false) {
				htmlToInsert += getSpinner("datanorgelinkspinner");
			}

			// $("#searchSubtext2").html(htmlToInsert);
			$("#brukerveiledning").html(htmlToInsert);
		}
	}

	if (removeSpinner === true) {
		$("#datanorgelinkspinner").remove();
	}
}

function addDatasetSize(dataset) {
	$.ajax({
		method: 'HEAD',
		url: 'https://hotell.difi.no/download/' + dataset,
		success: function(data, textStatus, request) {
			var contentLength = request.getResponseHeader('content-length');
			// console.log(request.getAllResponseHeaders());
			$("#data-uris").append('<br/>Størrelse: ' + formatBytes(contentLength, 1));
		},
		error: function() {
			console.log("error getting HEAD of dataset-download!");
		}
	});
}

function addDatasetNumRows(dataset) {
	$.ajax({
		method: 'HEAD',
		url: 'https://hotell.difi.no/api/json/' + dataset,
		success: function(data, textStatus, request) {
			var numRows = request.getResponseHeader('x-datahotel-total-posts');
			if (debug) console.log(numRows);
			if (debug) console.log(request.getAllResponseHeaders());
			$("#data-uris").append(' — Rader: ' + numberWithCommas(numRows));
		},
		error: function() {
			console.log("error getting HEAD of dataset-download!");
		}
	});
}

function checkIfDatasetIsPublic(data, datasetLocation) {
	var datasetPublic = false;
	for (var i = 0; i < data.length; i++) {
		var dataset = data[i];
		if (dataset.location == datasetLocation) {
			datasetPublic = true;
			break;
		}
	}

	if (datasetPublic === false) {
		setTimeout(function(){ 
			$("#datasetinfo").append("<br/>\n<strong>NB!</strong> Dette datasettet er skjult på datahotellet.");
			// alert("Hello"); 
		}, 1000);
	}
}

function runIt() {
	addHTML();
	addTurbo();

	var datasetLocation = document.URL.split("=")[1];
	if (debug) console.log(datasetLocation);

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
	addDatasetNumRows(datasetLocation);

	var quickLoad = loadDataQuickly();
	quickLoad.then(datanorgedatasets => {
	  	addDatanorgeLink(datasetLocation, datanorgedatasets, false);
	}, () => {
		console.log("Couldn't load data quickly. Oh noes!");
	});

	quickLoad.then( () => {
		isCacheFresh().then(
			() => { // fresh
	  			addDatanorgeLink(null, null, true, false);
			}, () => { // not fresh
				loadDataFromAPI().then(
					datanorgedatasets => {
	  					addDatanorgeLink(datasetLocation, datanorgedatasets);
					}, () => { console.log("error getting new data!?!?"); }
				);
			});
	});

	$.getJSON("https://hotell.difi.no/api/json/_all", function(data) {
	  checkIfDatasetIsPublic(data, datasetLocation);
	});

	sendPageView();
}

$(document).ready(() => runIt());