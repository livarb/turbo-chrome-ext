// TODO: rename function as it also inserts statistics-link
function addDatahotelUpdated() {
	$('div.dataset.availableFormats ul li').each(function() {
		var dataurl = $(this).children(":first").attr("href");
		if (dataurl.startsWith("http://hotell.difi.no/") 
			|| dataurl.startsWith("https://hotell.difi.no/")) {

			var distId = dataurl.replace(/\W/g, '');
			var htmlToInsert = 
			'<div id="datahotelInfo-' + distId + '" style="background-color: #e0e0e0; display: inline-block; width: 100%;'
		    + 'line-height: 11px; color: black; font-size: 11px; '
		    + 'border-top: 1px solid #c6c6c6; padding: 9px; font-weight: 500;">'
		    + '<span id="datahotelInfo-' + distId + '">Lastar informasjon...'
		    + getSpinner("datahotelupdatedSpinner-" + distId)
		    + '</span></div>';			

			$(this).append(htmlToInsert);

			var url = dataurl
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
}

function getNodeId() {
	return $("link[rel='shortlink']").attr('href').split("/")[2];
}

function prepareAboutEntrySection() {
	$("#block-datanorge-data-description-widget div[class='content'] ul li").each(function (index) {
		if ($(this).text().includes("Publisert:")) {
			$(this).attr('id', 'publisertLi');
			$(this).hide();
		}
	});

	var htmlToInsert = '<ul id="aboutEntryList"><h2>Data.norge-oppføring'
	+ getSpinner("oppforingspinner")
	+ '</h2>'
	+ '<li id="datanorge-entry-issued"><strong>Publisert: &nbsp;&nbsp;</strong>'
		+ '<span id="datanorge-entry-issued-data" style="display: inline;"></span></li>'
	+ '<li id="datanorge-entry-modified"><strong>Oppdatert: </strong>'
		+ '<span id="datanorge-entry-modified-data" style="display: inline;"></span></li>'
	+ '<li id="datanorge-entry-numDatasets"><strong title="Brukes til ' 
		+ 'statistikkformål og ajourføres av Difi. Bakgrunnen er at ei '
		+ 'data-oppføring på data.norge.no kan representere fleire individuelle '
		+ ' datasett. Dersom du meiner verdien er feil, send gjerne e-post til '
		+ 'opnedata@difi.no">'
		+ 'Antall individuelle datasett: </strong>'
		+ '<span id="datanorge-entry-numDatasets-data" style="display: inline;"></span></li>'
	+ '</ul>';
	$("#block-datanorge-data-description-widget div[class='content']").append(htmlToInsert);
}

function addLastModified(dataset) { // for when data.norge-entry was last modified
	$("#datanorge-entry-issued-data").text(dataset.issued);
	$("#datanorge-entry-modified-data").text(dataset.modified.replace("T", " "));
}

function addAntall(dataset) {
	$("#datanorge-entry-numDatasets-data").text(dataset.antall);	
}

function createDivForLinksAndLanguageControl() {
	$(".dataset.description h1").after(
		'<div id="linkAreaDiv" style="margin-top: -5px; margin-bottom: 15px;">'
		+ '<p id="linkArea"></p>'
		+ '<p id="languageControl"><i>Laster informasjon om språk...</i> '
		+ getSpinner("languageSpinner")
		+ '</p></div>');
	$(".dataset.description h1").addClass("norsk_tekst");
	$(".dataset.description > p").wrapAll('<div class="norsk_tekst" />');

	$(".dataset.description").prepend('<h1 class="engelsk_tekst" style="display: none;"></div>');
	$(".dataset.description").append('<div class="engelsk_tekst" style="display: none;"></div');	
}

// TODO: exclude recent datasets. FDK harvests data.norge every night
function insertFDKLink(data) {
	$("#linkArea").append(
		"<span id=\"fdklink\"><i>Sjå <a id=\"fdklinka\" href=\"#" 
		+ "\">dette datasettet i Felles datakatalog</a>. </i>"
		+ getSpinner("fdklinkspinner")
		+ "</span>\n");

	// Hent koblingar mellom datasett i data.norge og FDK
	$.getJSON( datanorgeFDKmapURL, function( data ) {
		var datanorgeFDKmap = data;
		var fdkId = data[getNodeId()];
		var url = "https://fellesdatakatalog.digdir.no/datasets/" + 
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
	$("#linkArea").append(
		"<span id=\"edplink\" style=\"float: right;\">"
		+ getSpinner("edplinkspinner")
		+ " <i>Sjå <a id=\"edplinka\" href=\"#\">"
		+ "dette datasettet i European data portal (EDP)</a>.</i>"
		+ "</span>\n");

	fetchAndAddEDPLink( getNodeId() );
}

function insertLanguageControl(dataset) {
	if (dataset.hasOwnProperty("title_en")) {
		$("h1.engelsk_tekst").html(dataset.title_en);
		$("div.engelsk_tekst").html(dataset.description[0].value);

		$("#languageControl")
			.html(`<i><button onclick='$(".norsk_tekst").toggle(); $(".engelsk_tekst").toggle();'>`
				+ `Bytt språk</button> Viser <span class="engelsk_tekst" style="display: none;">engelsk</span>`
				+ `<span class="norsk_tekst">norsk</span> versjon.</i>`);
	} else {
		$("#languageControl")
			.html(
				'<i>Ingen engelsk versjon av denne data-beskrivinga.</i>');
	}
}

function topAlignDistributions() {
	$('div.dataset.availableFormats ul li').each(function() {
		$(this).css("vertical-align", "top");
	});	
}

function updateAboutEntrySection(datanorgedatasets, removeSpinner = true, newData = true) {
	if (newData) {
		var dataset = getDataset(getNodeId(), datanorgedatasets);
		if (debug) console.log(dataset);
		if (dataset) {
			insertLanguageControl(dataset);
			addLastModified(dataset);
			addAntall(dataset);
		} else {
			$("#publisertLi").show();
			$("#aboutEntryList").hide();
		}
	}

	if (removeSpinner) $("#oppforingspinner").remove();	
}

var datanorgedatasets;
function runIt() {
	addTurbo();
	addOrgsToMenu();	

	if(document.URL.endsWith("/edit")) { // editing

	} else { // vanleg visning
		addDatahotelUpdated();
		addAppOverview();
		prepareAboutEntrySection();

		createDivForLinksAndLanguageControl();
		insertEDPLink();
		insertFDKLink();

		topAlignDistributions();

		// Hent data.norge-oversikt
		quickLoad.then(data => {
			updateAboutEntrySection(data, false);
		}, () => {
			console.log("Couldn't load data quickly. Oh noes!");
		});

		quickLoad.then( () => {
			isCacheFresh().then(
				() => { // fresh
					updateAboutEntrySection(null, true, false); // remove spinner
				}, () => { // not fresh
					loadDataFromAPI().then(
						data => {
							updateAboutEntrySection(data, true);
						}, () => { console.log("error getting new data!?!?"); }
					);
				});
		});

		sendPageView();
	}
}

$(document).ready(() => runIt());