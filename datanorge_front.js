function prepareLatestSection() {

var htmlToInsert = `
<div id="block-views-data-edited-block" class="block block-views">		
  <div class="content">
		<div class="groupTitle">
			<h2>Sist redigerte data-oppføringer</h2>
			<hr>

		<div class="view view-data-latest view-id-data_latest view-display-id-block view-dom-id-cdfc435fe9a03fb8f868dd43e3f6b288">
	      <div class="view-content">
			<div id="edited-content">Laster inn<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/></div>
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
// $("#edited-content").append("<table>")
for (var i = 0; i < 7; i++) {
	var dataset = datanorgedatasets[i];

	/*
	var html = "<p>" + dataset.modified.replace("T", " ") + " — " 
		+ '<a href="' + dataset.id + '">'
		+ dataset.title + " — "
		+ dataset.publisher.name 
		+ "</a></p>";
	*/

	html += "<tr><td>" + dataset.modified.replace("T", " ") + "</td>" 
		+ '<td><a href="' + dataset.id + '">'
		+ dataset.title + "</a><br/>"
		+ dataset.publisher.name 
		+ "</a></<td></tr>";

	// $("#edited-content").append(html);
}
// $("#edited-content").append("</table>");

// $("#edited-content").append("<br/>");
html += "</table><br/>";

$("#edited-content").html("");
$("#edited-content").append(html);

}

function runIt() {
	addTurbo();
	addOrgsToMenu();

	prepareLatestSection();

	// Hent data.norge-oversikt
	$.getJSON( datanorgeDatasetsURL, function( data ) {
	  var datanorgedatasets = data;
	  addLatestSection(datanorgedatasets);
	});

}

$(document).ready(() => runIt());