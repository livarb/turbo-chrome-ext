// find and note if an app links to a dataset-entry which is no longer published
function noteUnpublishedDatasets() {
	$(".view-field-datasets ul li").each(function() {
		if ($(this).text().isEmpty()) {
			$(this).text("(avpublisert datasett)");
		}
	});
}

// https://stackoverflow.com/a/1026087
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function fixPublisherName(string) {
	var publisher = capitalizeFirstLetter(string);
	publisher = decodeURI(publisher);
	publisher = publisher.replace(/-/g, " ");
	return publisher;
}

function enrichDatasetListWithPublisherName() {
	$(".views-field-field-data a").each(function() {
		var datasetLink = $(this).attr("href");
		var publisherRaw = datasetLink.split("/")[2];
		var publisher = fixPublisherName(publisherRaw);
		$(this).append(" (" + publisher + ")");
	});
}

function runIt() {
	addTurbo();
	addOrgsToMenu();

	if(document.URL.endsWith("/edit")) {
		// do nothing if editing entry
	} else { // vanleg visning
		noteUnpublishedDatasets();
		enrichDatasetListWithPublisherName();
	}
}

$(document).ready(() => runIt());