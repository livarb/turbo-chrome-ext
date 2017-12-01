// find and note if an app links to a dataset-entry which is no longer published
function noteUnpublishedDatasets() {
	$(".view-field-datasets ul li").each(function() {
		if ($(this).text().isEmpty()) {
			$(this).text("(avpublisert datasett)");
		}
	});
}

function runIt() {
	addTurbo();
	addOrgsToMenu();	

	if(document.URL.endsWith("/edit")) {
		// do nothing if editing entry
	} else { // vanleg visning
		noteUnpublishedDatasets();
	}
}

$(document).ready(() => runIt());