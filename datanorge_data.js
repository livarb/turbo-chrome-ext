// TODO: rename function as it also inserts statistics-link
function addDatahotelUpdated() {
	$('li[data-url]').each(function() {
		if ($(this).attr('data-url').startsWith("http://hotell.difi.no/") 
			|| $(this).attr('data-url').startsWith("https://hotell.difi.no/")) {

			var distId = $(this).attr("data-url").replace(/\W/g, '');
			var htmlToInsert = 
			'<div id="datahotelInfo-' + distId + '" style="background-color: #e0e0e0; display: inline-block; width: 100%;'
		    + 'line-height: 11px; color: black; font-size: 11px; '
		    + 'border-top: 1px solid #c6c6c6; padding: 9px; font-weight: 500;">'
		    + '<span id="datahotelInfo-' + distId + '">Lastar informasjon...'
		    + getSpinner("datahotelupdatedSpinner-" + distId)
		    + '</span></div>';			

			$(this).append(htmlToInsert);

			var url = $(this).attr('data-url')
				.replace("http://hotell.difi.no/?dataset=", "")
				.replace("https://hotell.difi.no/?dataset=", "")
				.replace("http://hotell.difi.no/api/html/", "");	
			var fetchUrl = "https://hotell.difi.no/api/json/" + url + "/meta";
			var li = $(this);

			$.ajax({
			  dataType: "json",
			  url: fetchUrl,
			  success: function(data) {
				li.find("#datahotelInfo-" + distId).text("Oppdatert: " + timeConverter(data.updated));
				$("#datahotelInfo-" + distId).append(
					"<span style=\"float: right;\">"
					+ "<a href=\"https://hotell.difi.no/#statistikk=" + url + "\" "
					+ "style=\"text-decoration: none; color: black;\">"
					+ "Statistikk</a></span>");
			  },
			  error: function() {
				$("#datahotelInfo-" + distId).remove();
			  }
			});
		}
	});	
}

// TODO: make robust in case of parameters "...?" or http
function addAppOverview() {
	var htmlToInsert =
	'<div id="block-datanorge-data-other-datasets" class="block block-datanorge-data dataset descriptionWidget">'
	+ '<h2>Bruk av datasettet'
	+ getSpinner("appspinner")
	// + "<img id=\"appspinner\" src=\"" + chrome.extension.getURL("Spinner-1.8s-200px.gif") + "\" width=20 height=20/>"
	+ '</h2>'
	+ '<div class="content" id="appList"><ul id="appListUl">'
	+ '<li>Lastar inn informasjon...</li>'
	+ '</ul></div></div>';

	$(".region.region-sidebar-right-third").append(htmlToInsert);

	// Hent data.norge-oversikt
	$.ajax({
		method: 'GET',
		url: datanorgeAppsURL,
		timeout: 5000,
		success: function(data, textStatus, request) {
			var apps_bydataset = data;
			$("#appListUl").html("");
			if (apps_bydataset.hasOwnProperty(document.URL)) {
				var apps = apps_bydataset[document.URL];
				for (var i = 0; i < apps.length; i++) {
					var app = apps[i];
					var html = '<li><span><a href="' + app.url + '">' + app.title + "</a></span></li>";
					$("#appList ul").append(html);
				}
			} else {
				$("#appList ul").append('<li>Ingen registrerte døme på bruk av dette datasettet.</li>'
					+ '<li><a href="https://data.norge.no/register/app?brukar">Registrer ein app/tjeneste</a>!</li>');
			}
			$("#appspinner").remove();
		},
		error: function() {
			$("#appListUl").html("");
			$("#appList ul").append('<li>Feil. Kunne ikkje hente data om apper/tjenester. Prøv igjen seinare.</li>');
			$("#appspinner").remove();  
		}
	});

	// $.getJSON( datanorgeAppsURL, function( data ) {
	// 	var apps_bydataset = data;
	// 	$("#appListUl").html("");
	// 	if (apps_bydataset.hasOwnProperty(document.URL)) {
	// 		var apps = apps_bydataset[document.URL];
	// 		for (var i = 0; i < apps.length; i++) {
	// 			var app = apps[i];
	// 			var html = '<li><span><a href="' + app.url + '">' + app.title + "</a></span></li>";
	// 			$("#appList ul").append(html);
	// 		}
	// 	} else {
	// 		$("#appList ul").append('<li>Ingen registrerte døme på bruk av dette datasettet.</li>'
	// 			+ '<li><a href="https://data.norge.no/register/app?brukar">Registrer ein app/tjeneste</a>!</li>');
	// 	}			
	// 	$("#appspinner").remove();  
	// });

}

function getNodeId() {
	return $("link[rel='shortlink']").attr('href').split("/")[2];
}

function prepareLastModified() { // for when data.norge-entry was last modified
	$("#block-datanorge-data-description-widget div[class='content'] ul li").each(function (index) {
		if ($(this).text().includes("Publisert:")) {
			$(this).attr('id', 'publisertLi');
			$(this).hide();
		}
	});

	var htmlToInsert = '<ul id="aboutEntryList"><h2>Data.norge-oppføring'
	+ getSpinner("oppforingspinner")
	+ '</h2>'
	+ '<li id="datanorge-entry-issued"><strong>Publisert: &nbsp;&nbsp;</strong></li>'	
	+ '<li id="datanorge-entry-modified"><strong>Oppdatert: </strong></li>'
	+ '<li id="datanorge-entry-numDatasets"><strong title="Brukes til ' 
		+ 'statistikkformål og ajourføres av Difi. Bakgrunnen er at ei '
		+ 'data-oppføring på data.norge.no kan representere fleire individuelle '
		+ ' datasett. Dersom du meiner verdien er feil, send gjerne e-post til '
		+ 'opnedata@difi.no">'
		+ 'Antall individuelle datasett: </strong></li>'	
	+ '</ul>';
	$("#block-datanorge-data-description-widget div[class='content']").append(htmlToInsert);
}

function addLastModified(datanorgedatasets) { // for when data.norge-entry was last modified
	var nodeId = getNodeId();
	var dataset = getDataset(nodeId, datanorgedatasets);

	if (dataset) {
		$("#datanorge-entry-issued").append(dataset.issued);
		$("#datanorge-entry-modified").append(dataset.modified.replace("T", " "));
	} else {
		$("#publisertLi").show();
		$("#aboutEntryList").hide();
	}
}

function addAntall(datanorgedatasets) {
	var nodeId = getNodeId();
	var dataset = getDataset(nodeId, datanorgedatasets);

	if (dataset) {
		$("#datanorge-entry-numDatasets").append(dataset.antall);	
	} else {

	}	
}

// TODO: exclude recent datasets. FDK harvests data.norge every night
function insertFDKLink(data) {
	$(".dataset.description h1").after(
		"<p id=\"fdklink\"><span><i>Sjå <a id=\"fdklinka\" href=\"#" 
		+ "\">dette datasettet i Felles datakatalog</a>.</i></span>"
		+ getSpinner("fdklinkspinner")
//		+ "<img id=\"fdklinkspinner\" src=\"" + chrome.extension.getURL("Spinner-1.8s-200px.gif") + "\" width=20 height=20/>"
		+ "</p>\n");	

	// Hent koblingar mellom datasett i data.norge og FDK
	$.getJSON( datanorgeFDKmapURL, function( data ) {
		var datanorgeFDKmap = data;
		var fdkId = data[getNodeId()];
		var url = "https://fellesdatakatalog.brreg.no/datasets/" + 
			encodeURIComponent(fdkId);

		if (fdkId === undefined) {
			$("#fdklink")
				.attr("title", 
					"FDK haustar inn data frå data.norge ein gang i døgnet. "
					+ "Dette datasettet kan vere for nytt til å kome med her.")
				.css("text-decoration", "line-through");
		} else {
			$("#fdklinka").attr("href", url);
		}
		$("#fdklinkspinner").remove();
	});
}

function insertEDPLink() {
	$(".dataset.description h1").after(
		"<p id=\"edplink\"><span><i>Sjå <a id=\"edplinka\" href=\"#\">"
		+ "dette datasettet i European data portal (EDP)</a>.</i></span>"
		+ getSpinner("edplinkspinner")
		// + "<img id=\"edplinkspinner\" src=\"" + chrome.extension.getURL("Spinner-1.8s-200px.gif") + "\" width=20 height=20/>"
		+ "</p>\n");

	var url1 = "https://www.europeandataportal.eu/data/en/dataset/http-data-norge-no-node-" + getNodeId();
	var url2 = "https://www.europeandataportal.eu/data/en/dataset/http---data-norge-no-node-" + getNodeId();	

	// Try first URL-format
	$.ajax({
		method: 'HEAD',
		url: url1,
		timeout: 1500,
		success: function(data, textStatus, request) {
			$("#edplinka").attr("href", url1);
			$("#edplinkspinner").remove();
		},
		error: function() {
			// Try second URL-format on failure of first
			$.ajax({
				method: 'HEAD',
				url: url2,
				timeout: 1500,				
				success: function(data, textStatus, request) {
					$("#edplinka").attr("href", url2);
					$("#edplinkspinner").remove();					
				},
				error: function() {
					console.log("Failed getting data from EDP. 404 or timeout.");
					$("#edplink")
						.attr("title",
							"EDP hentar data frå data.norge.no ein "
						+ "gang i veka. Dersom dette datasettet er nyleg "
						+ "publisert, vil det ikkje vere synleg der endå.")
						.css("text-decoration", "line-through");
					$("#edplinkspinner").remove();
				}
			});
		}
	});
}

// Abandoned experiment
// Helps fill data-registration-form
function startDistributionHotelHelper() {
	if (document.URL.endsWith("/edit")) {
		console.log("We are editing!");

		// Get number of distributions
		var distributionRows = $("#ief-entity-table-edit-field-distribution-und-entities tbody tr");
		var numDistributions = distributionRows.length;

		/*
		$(":input").focus(function() {
			console.log("Input i fokus!");
			console.log(this);
		});
		*/

		var observer = new MutationObserver(function () {
			console.log("Observed!");
		var accessURLid = "#edit-field-distribution-und-entities-XX-form-field-access-url-und-0-url";			
		for (let i = 0; i < numDistributions + 1; i++) {
			var currentID = accessURLid.replace("XX", i);
			var selector = $(currentID);
			if (selector.length == 0) {
				console.log("No selector found - " + i + "  " + currentID);
			} else {
				console.log("Found field - " + i + "  " + currentID);
				$(currentID).change(function () {
					console.log("Input changed!");
					if ($(this).val().includes("hotell.difi.no")) {
						// "Nedlastingslenke"
						var selectorDownloadUrl = "#edit-field-distribution-und-entities-XX-form-field-download-url-und-0-url".replace("XX", i);
						$(selectorDownloadUrl).prop("readonly", true);

						// "Lenkede skjema"
						var selectorLinkedSchema = "#edit-field-distribution-und-entities-XX-form-field-web-service-und-0-url".replace("XX", i);
						$(selectorLinkedSchema).prop("readonly", true);

						// "Tittel"
						var selectorTitle = "#edit-field-distribution-und-entities-XX-form-field-distribution-title-nb-0-value".replace("XX", i);
						$(selectorTitle).prop("readonly", true);

						// "Beskrivelse"
						var selectorDescription = "#edit-field-distribution-und-entities-XX-form-field-description-und-0-value".replace("XX", i);
						$(selectorDescription).prop("readonly", true); // TODO: test at denne faktisk fungerer
					}
				});
			}
		}
		});

		var observerConfig = {
			attributes: true,
			childList: true,
			characterData: true
		}

		var targetNode = $("#ief-entity-table-edit-field-distribution-und-entities").first();
		targetNode = document.body;
		observer.observe(targetNode, observerConfig);
	}
}

function removeJSLinkShit() {
	$('*[data-url] > .table').each(function() {
		console.log(this);
		var dataurl = $(this).parent().attr("data-url");
		$(this).parent().removeAttr("data-url");
		$(this).wrap('<a href="' + dataurl + '"></a>');
		$(this).parent().css("text-decoration", "none");
	});
}

var datanorgedatasets;
function runIt() {
	addTurbo();
	addOrgsToMenu();	

	if(document.URL.endsWith("/edit")) { // editing
		// EXPERIMENTAL
		// startDistributionHotelHelper();
	} else { // vanleg visning
		addDatahotelUpdated();
		addAppOverview();
		prepareLastModified();
		insertEDPLink();
		insertFDKLink();		

		// Hent data.norge-oversikt
		$.getJSON( datanorgeDatasetsURL, function( data ) {
		  // console.log(data);
		  var datanorgedatasets = data;
		  var dataset = getDataset(getNodeId(), datanorgedatasets);
		  addLastModified(datanorgedatasets);
		  addAntall(datanorgedatasets);
		  // TODO: addLandingPage
		  $("#oppforingspinner").remove();
		});

		removeJSLinkShit();
	}
}

$(document).ready(() => runIt());