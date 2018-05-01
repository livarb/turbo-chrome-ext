function prepareLatestSection() {

var htmlToInsert = `
<div id="block-views-data-edited-block" class="block block-views">		
  <div class="content">
		<div class="groupTitle">
			<h2>Sist redigerte data-oppføringer ` + getSpinner("last-edited-spinner") + `</h2>
			<hr>

		<div class="view view-data-latest view-id-data_latest view-display-id-block view-dom-id-cdfc435fe9a03fb8f868dd43e3f6b288">
	      <div class="view-content">
			<div id="edited-content">Laster inn...<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/></div>
		  </div>
		</div>

		</div>
	</div>
</div>
`;
$("#block-views-data-latest-block").before(htmlToInsert);

}

function addLatestSection(datanorgedatasets, removeSpinner = true, newData = true) {
	if (newData) {
		// https://stackoverflow.com/a/8837511
		datanorgedatasets.sort(function(a, b){
		    var keyA = b.modified,
		        keyB = a.modified;
		    // Compare the 2 dates
		    if(keyA < keyB) return -1;
		    if(keyA > keyB) return 1;
		    return 0;
		});

		var html = "<table>";
		for (var i = 0; i < 7; i++) {
			var dataset = datanorgedatasets[i];

			html += "<tr><td>" + dataset.modified.replace("T", " ") + "</td>" 
				+ '<td><a href="' + dataset.id + '">'
				+ dataset.title + "</a><br/>"
				+ dataset.publisher.name 
				+ "</a></<td></tr>";
		}
		html += "</table><br/>";

		$("#edited-content").html("");
		$("#edited-content").append(html);
	}

	if (removeSpinner) {
		$("#last-edited-spinner").remove();
	}
}

function loadDataNorgeCodes() {
	return new Promise(function(resolve, reject) {
		$.getJSON( datanorgeCodes, function( data ) {
			resolve(data);
		});			
	});
}

function showNormalFrontPageContent(display = null) {
	$("#searchField").toggle(display);
	$("#header-footer").next().toggle(display);
}

function setPageTitle(text) {
	$(".frontpageTitle h1").text(text);
}

function setPageText(text) {
	$(".frontpageTitle p").html(text);
}

function prepareSpecialPage() {
	showNormalFrontPageContent(false);
	$(".frontpageTitle").html("<h1></h1><p></p>");
}

function showPageEnglishDatasets() {
	prepareSpecialPage();
	setPageTitle("Dataset-descriptions in english");
	setPageText(
		"Here's a list of the data-entries which have an english-language version." 
		+ getSpinner("pagetextspinner")
	);

	loadData()
		.then(data => {
			if (debug) console.log("(showEnglish): data loaded. processing..");
			printEnglishDatasets(data);
		}, () => {
			setPageText("Sorry, we didn't manage to load data :/");
		});
}

function printEnglishDatasets(data) {
	var html = "<table id=\"englishDatasetsTable\">";
	data.forEach(function (dataset) {
		if (dataset.hasOwnProperty("title_en")) {
			html += "<tr><td>" + dataset.modified.replace("T", " ");
			if (dataset.hasOwnProperty("title_en")) {
				html += "<br/>\n" + dataset.title_en;
			}
			html += "</td>" 
			+ '<td><a href="' + dataset.id + '">'
			+ dataset.title + "</a><br/>"
			+ dataset.publisher.name 
			+ "</a></<td></tr>";
		}
	});
	html += "</table><br/>";
	$(".frontpageTitle").append(html);
	$("#pagetextspinner").remove();
}

function showPageTurbo() {
	prepareSpecialPage();

	setPageTitle("Turbo");
	setPageText(
		"Her er diverse spesialsider kun tilgjengelege i nettlesartillegget Turbo.<br/>" 
		+ '— <a href="#page=english">Data-oppføringar med engelsk versjon</a><br/>'
		+ '— <a href="#page=lisenser">Oversikt over kor ofte kvar åpen lisens vert brukt i data-oppføringar.</a><br/>'
	);
}

function getLicenseData(licenseUrl, codes) {
	var data = new Object();
	var codesNumLicenses = Object.keys(codes.license).length;
	for (var i = 0; i < codesNumLicenses; i++) {
		var license = codes.license[i];
		if (license['data']['Url'].indexOf(licenseUrl) !== -1) {
			data['name'] = license.title;
			data['shortname'] = license.data['Shortname'];
			data['url'] = licenseUrl;
			return data;
		}
	}
	return null;
}

function showPageLicense() {
	prepareSpecialPage();

	setPageTitle("Lisensar");
	setPageText(
		"Oversikt over fordeling av lisensar på data.norge.no. " 
		+ getSpinner("pagetextspinner")
	);

	// var promise1 = loadData();
	var promise1 = quickLoad;
	var promise2 = loadDataNorgeCodes();

	Promise.all([promise1, promise2])
		.then(dataValues => {
			var data = dataValues[0];
			var codes = dataValues[1];

			console.dir(codes);

			if (debug) console.log("(showPageLicenses): data loaded. processing..");
			// var html = "<table>";

			var licenses = new Object();
			data.forEach(function (dataset) {
				var license = "N/A";
				if (dataset.hasOwnProperty('distribution')) {
					dataset.distribution.forEach(function (distribution) {
						license = distribution.license;
					});
				}

				if (licenses.hasOwnProperty(license)) {
					licenses[license] += 1;
				} else {
					licenses[license] = 1;
				}
			});

			// Sortere med flest øvst
			var keys = [];
			for (key in licenses) {
				if (licenses.hasOwnProperty(key)) {
					keys.push(key);
				}
			}

			// https://stackoverflow.com/a/8837511
			keys.sort(function(a, b) {
			    var keyA = licenses[b],
			        keyB = licenses[a];
			    // Compare the 2 dates
			    if(keyA < keyB) return -1;
			    if(keyA > keyB) return 1;
			    return 0;
			});

			var output = '<table style="width: auto;">\n';
			for (i = 0; i < keys.length; i++) {
			  var property = keys[i];
			  var license = getLicenseData(property, codes);
			  output += '<tr>\n';
			  if (license !== null) {
			  	output += '<td><a href="' + license.url + '">' + license.name 
			  		+ '(' + license.shortname + ')</a></td><td style="text-align: right;">' 
			  		+ licenses[property] + '</td>\n';
			  } else {
			  	output += '<td>' + property + '</td><td style="text-align: right;">' + licenses[property]+'</td>\n';
			  }
			  output += '</tr>\n';
			}
			output += '</table>\n';

			// html += "</table><br/>";
			console.log(licenses);
			$(".frontpageTitle").append(output);
			$("#pagetextspinner").remove();
		}, () => {
			setPageText("Sorry, we didn't manage to load data :/");
		});
}

function reactToHash() {
	if (debug) console.log("hash: " + location.hash);
	var hash = location.hash;

	if (hash) {
		if (hash.indexOf("=") !== -1) {
			var hashSplit = hash.substr(1).split("=");
			if (hashSplit[0] == "page") {
				if (hashSplit[1] == "english") {
					showPageEnglishDatasets();
				} else if (hashSplit[1] == "lisenser") {
					showPageLicense();
				} else if (hashSplit[1] == "turbo") {
					showPageTurbo();
				}
			}
		} else if (hash.substr(1) == "blank") { // show blank page
			toggleFrontPageContent(false);
			setPageTitle("Blank side");
			setPageText("Dette er berre ei test-side...");
		}

	} else {
		prepareLatestSection();

		quickLoad.then(data => {
			addLatestSection(data, false);
		}, () => {
			console.log("Couldn't load data quickly. Oh noes!");
		});

		quickLoad.then( () => {
			isCacheFresh().then(
				() => { // fresh
					addLatestSection(null, true, false); // remove spinner
				}, () => { // not fresh
					loadDataFromAPI().then(
						data => {
							addLatestSection(data);
						}, () => { console.log("error getting new data!?!?"); }
					);
				});
		});
	}
	sendPageView();
}

function runIt() {		
	addTurbo();
	addOrgsToMenu();
	addTurboMenu();

	reactToHash();
}

$(window).on('hashchange', function() {
	reactToHash();
});

$(document).ready(() => runIt());