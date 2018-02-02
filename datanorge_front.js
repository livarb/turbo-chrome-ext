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

function addLatestSection(datanorgedatasets) {
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
	$("#last-edited-spinner").remove();
}

function loadData() {
	chrome.storage.local.get('timestamp', function(data) {
		if (data.hasOwnProperty('timestamp')) {
			var timestamp = data.timestamp;
			var now = Math.floor(Date.now() / 1000);
			console.log(timestamp);
			console.log(now);
			if ((timestamp == 'undefined') || (data.timestamp + 300) < now) {
				loadDataFromAPI();
			} else {
				loadDataCached();
			}
		} else {
			loadDataFromAPI();
		}
	});	
}

function loadDataFromAPI() {
	console.log("Loading from API..");

	// Hent data.norge-oversikt
	$.getJSON( datanorgeDatasetsURL, function( data ) {
	  runWithData(data); // data.data

	  // experimental use of local storage
	  chrome.storage.local.set({'datanorge': data}, function() {
	  	if (typeof runtime !== 'undefined') {
		  	console.log("Failed to store data. Oh noes.");
	  	} else {
	  		console.log("Stored data!");
	  	}
	  });

	  chrome.storage.local.set({'timestamp': Math.floor(Date.now() / 1000)}, function() {
	  	if (typeof runtime !== 'undefined') {
		  	console.log("Failed to store timestamp. Oh noes.");
	  	} else {
	  		console.log("Stored timestamp!");
	  	}
	  });
	  
	});	
}

function loadDataCached() {
	console.log("Loading from local cache..");

	chrome.storage.local.get('datanorge', function(data) {
	  	runWithData(data.datanorge);
	});
}

function runWithData(data) {
	addLatestSection(data);	
}

function runIt() {
	addTurbo();
	addOrgsToMenu();

	prepareLatestSection();
	loadData();
	// testheaders();
}

$(document).ready(() => runIt());