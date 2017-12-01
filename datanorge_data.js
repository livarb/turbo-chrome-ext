function addDatahotelUpdated() {
	var htmlToInsert = 
	'<div style="background-color: #e0e0e0; display: inline-block; width: 100%;'
    + 'line-height: 11px; color: black; font-size: 11px; '
    + 'border-top: 1px solid #c6c6c6; padding: 9px; font-weight: 500;"><span id="datahotelInfo">Lastar informasjon...</span></div>';

	$('li[data-url]').each(function() {
		if ($(this).attr('data-url').startsWith("http://hotell.difi.no/") || $(this).attr('data-url').startsWith("https://hotell.difi.no/")) {
			$(this).append(htmlToInsert);
			var remove1 = 'http://hotell.difi.no/?dataset=';
			var remove2 = 'https://hotell.difi.no/?dataset=';
			var url = $(this).attr('data-url').replace(remove1, "");
			var url = url.replace(remove2, "");
			var url = url.replace("http://hotell.difi.no/api/html/", "");	
			var fetchUrl = "https://hotell.difi.no/api/json/" + url + "/meta";
			var li = $(this);

			$.getJSON( fetchUrl, function( data ) {
				li.find("#datahotelInfo").text("Oppdatert: " + timeConverter(data.updated));				
			});			
		}
	});

	
}

function addAppOverview() {
	var htmlToInsert =
	'<div id="block-datanorge-data-other-datasets" class="block block-datanorge-data dataset descriptionWidget">'
	+ '<h2>Bruk av datasettet</h2>'
	+ '<div class="content" id="appList"><ul id="appListUl">'
	+ '<li>Lastar inn informasjon...</li>'
//    + '<li><span><a href="/data/landbruksdirektoratet/leveranser-til-kornkjøper-eller-såvareforretning-i-landbruket-i-2">Leveranser til kornkjøper eller såvareforretning i landbruket i kornåret juli 2015 til juni 2016</a></span></li>'
	+ '</ul></div></div>';

	$(".region.region-sidebar-right-third").append(htmlToInsert);

	// Hent data.norge-oversikt
	$.getJSON( datanorgeAppsURL, function( data ) {
		var apps_bydataset = data;
		$("#appListUl").html("");
		if (apps_bydataset.hasOwnProperty(document.URL)) {
			var apps = apps_bydataset[document.URL];
			for (var i = 0; i < apps.length; i++) {
				var app = apps[i];
				console.log(app);
				var html = '<li><span><a href="' + app.url + '">' + app.title + "</a></span></li>";
				$("#appList ul").append(html);
			}
		} else {
			$("#appList ul").append('<li>Ingen registrerte døme på bruk av dette datasettet.</li>'
				+ '<li><a href="https://data.norge.no/register/app?brukar">Registrer ein app/tjeneste</a>!</li>');
		}			  
	});
}

function getNodeId() {
	return $("link[rel='shortlink']").attr('href').split("/")[2];
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

function prepareLastModified() { // for when data.norge-entry was last modified

	// $("#block-datanorge-data-description-widget div[class='content'] ul li:nth-child(2)").remove();
	$("#block-datanorge-data-description-widget div[class='content'] ul li").each(function (index) {
		if ($(this).text().includes("Publisert:")) {
			$(this).attr('id', 'publisertLi');
			$(this).hide();
		}
	});

	var htmlToInsert = '<ul id="aboutEntryList"><h2>Data.norge-oppføring</h2>'
	+ '<li id="datanorge-entry-issued"><strong>Publisert: &nbsp;&nbsp;</strong></li>'	
	+ '<li id="datanorge-entry-modified"><strong>Oppdatert: </strong></li>'
	+ '</ul>';
	$("#block-datanorge-data-description-widget div[class='content']").append(htmlToInsert);
}

// TODO: exclude recent datasets. FDK harvests data.norge every night
function insertFDKLink() {
	var url = "https://fellesdatakatalog.brreg.no/datasets/" + 
		encodeURIComponent("https://data.norge.no" + getNodeLink());

	$(".dataset.description h1").after("<p><span><i>Sjå <a href=\"" 
		+ url + "\">dette datasettet i Felles datakatalog</a>.</i></span></p>\n");
}

// TODO: exclude link from recent datasets. EDP harvests weekly(?)
function insertEDPLink() {
	var url = "https://www.europeandataportal.eu/data/en/dataset/http---data-norge-no-node-" + getNodeId();

	$(".dataset.description h1").after("<p><span><i>Sjå <a href=\"" 
		+ url + "\">dette datasettet i European data portal (EDP)</a>.</i></span></p>\n");
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
		// insertEDPLink();
		insertFDKLink();

		// Hent data.norge-oversikt
		$.getJSON( datanorgeDatasetsURL, function( data ) {
		  // console.log(data);
		  var datanorgedatasets = data;
		  addLastModified(datanorgedatasets);
		});
	}
}

$(document).ready(() => runIt());