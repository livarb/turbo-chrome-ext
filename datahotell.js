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

function getHeadHeaders(url) {
  return new Promise(function (resolve, reject) {
  	if (debug) console.log("Doing HEAD request for: " + url);
	$.ajax({
		method: 'HEAD',
		url: url,
		success: function(data, textStatus, request) {
			resolve(request.getAllResponseHeaders());
		},
		error: function() {
			reject();
		}
	});
	});
}

function getHeader(header, headers) {
	if (headers == "") console.log("getHeader: no headers given...");
	var lines = headers.split("\n");
	for (i = 0; i < lines.length; i++) {
		var line = lines[i];
		if (line != '') {
			var lineSplit = line.split(": ");
			if (lineSplit[0] == header) {
				return lineSplit[1];
			}
		}
	}
	return "";
}

function addDatasetNumRows(dataset) {
	var url = 'https://hotell.difi.no/api/json/' + dataset;
	getHeadHeaders(url).then(headers => {
		console.dir(headers);
		var numRows = getHeader('x-datahotel-total-posts', headers);
		if (debug) console.log(numRows);
		$("#data-uris").append(' — Rader: ' + numberWithCommas(numRows));
  }, () => { // could not do head request
  	console.log("Could not find numRows - failed perform HEAD-request on URL: " + url);
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

function getSearchAndFilter() {
	// Finne ut av spørringen
	_param = {};
	// if ($('#data-page').text() != '1')
		// _param['page'] = $('#data-page').text();
	if ($('#query').val() != '')
		_param['query'] = $('#query').val();

	// Detektere filter for spørring og presentasjon
	$('#data-filter input[type=text]').each(function (i, field) {
		if ($(field).val() != '') {
			_param[$(field).attr('data-field')] = $(field).val();
		}
	});	
	console.dir(_param);
	return _param;
}

function createSearchUrl(dataset, params) {
	var paramString = "";
	var keys = Object.keys(params);
	for (i = 0; i < keys.length; i++) {
		var key = keys[i];
		var value = params[key];
		paramString += key + "=" + value + "&";
	}
	paramString = paramString.slice(0, -1);
	return "https://hotell.difi.no/api/json/" + dataset + "?" + paramString;
}

/*
function downloadCsvPage(url) {
	return new Promise(function (resolve, reject) {	
		console.log("url: " + url);
		$.ajax({
			method: 'GET',
			url: url,
			success: function(data, textStatus, request) {
				resolve(data);
			},
			error: function() {
				reject();
			}
		});
	});
}
*/

function createCsvDownload(url, datasetLocation) {
	return new Promise(function (resolve, reject) {
		console.log("doing promise");
		var getHeadersPromise = getHeadHeaders(url);
		var getFieldsPromise = getJSON("https://hotell.difi.no/api/json/" + datasetLocation + "/fields");
		console.log("set up promises");
		Promise.all([getHeadersPromise, getFieldsPromise]).then(values => {
			console.log("two promises done");
			var headers = values[0];
			var fields = values[1];

			var pages = getHeader('x-datahotel-total-pages', headers);
			console.log("pages: " + pages);

			console.log(fields);

			var promises = [];
			var delay = 0;
			var delayIncrement = 100;
			for (i = 1; i < pages && i < 31; i++) {
				var downloadUrl = url + "&page=" + i;
				var downloadPromise = getJSON(downloadUrl, delay);
				promises.push(downloadPromise);
				delay += delayIncrement;
			}

			var data = "";
			var fieldOrder = [];
			for (i = 0; i < fields.length; i++) {
				data += '"' + fields[i].name + '"';
				if (i+1 != fields.length) data += ';';
				fieldOrder.push(fields[i].shortName);
			}
			data += "\n";
			// console.log(data);

			Promise.all(promises).then(values => {
				for (i = 0; i < values.length; i++) {
					var dataPage = values[i];
					for (j = 0; j < dataPage.entries.length; j++) {
						for (k = 0; k < fieldOrder.length; k++) {
							data += '"' + dataPage.entries[j][fieldOrder[k]] + '"';
							if (k+1 != fieldOrder.length) data += ";";
						}
						data += "\n";
					}
					console.log("finished page: " + i);
				}
				console.log("Done wit all pagez");
				resolve(data);
			}, () => {
				console.log("Noko gjekk gale med nedlastinga..");
				reject();
			});			
		});	
	});
}

let metadataPromise;
function getMetadata(datasetLocation) {
	if (metadataPromise) return metadataPromise;

	var fetchUrl = "https://hotell.difi.no/api/json/" + datasetLocation + "/meta";
	metadataPromise = getJSON(fetchUrl);

	return metadataPromise;
}

function getJSON(url, delay = 0) {
	return new Promise(function(resolve, reject) {
		setTimeout(function() {
			$.getJSON( url, function( data ) {
				resolve(data);
			});				
		}, delay);
	});
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

	getMetadata(datasetLocation).then(metadata => {
		console.log(metadata);
		addLastUpdated(metadata);
		addDatahotelDatasetTitle(metadata);
	});

	$("#data-uris a:last").after("<span id='downloadSearch'> | <span id='downloadSearchLinkArea'><a id='downloadSearchLink' data-href='[dataset]' href='#'>Last ned søkeresultat (CSV - kun 30 første sider)</a></span></span>");
	if (debug) {
		$('#data-filter form, #query-form').submit(function() {
			getSearchAndFilter();
		});
	}
	$("#downloadSearchLink").click(function() {
		var params = getSearchAndFilter();

		if (Object.keys(params).length > 0) {
			console.log("Search/filter is active");
			var url = createSearchUrl(datasetLocation, params);
			console.log(url);			
			console.log("Downloading...");
			createCsvDownload(url, datasetLocation).then(data => {
				download("test.csv", data);
			}, () => {
				console.log("Feil ved skaping av CSV-data.");
			});
		} else {
			console.log("No active search/filter. Will not download. Download complete dataset in stead.");
		}
		return false;
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

$(document).ready(() => {
	// Wait 2 seconds to avoid triggering rate-limiting
	setTimeout(function() {
		runIt();
   }, 2000);
});