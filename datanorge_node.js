function getCanonicalUrl() {
	return $("link[rel='canonical']").attr('href');
}

function runIt() {
	if (document.URL.includes("/revisions/")) {
		// ikkje redirect om ein er inne og ser på revisjonar
	} else if (document.URL.includes("/add/")) {
		// ikkje redirect om ein skal legge til nytt innhald
	} else if (document.URL.includes("/edit/") || document.URL.endsWith("/edit")) {
		// ikkje redirect om ein skal redigere innhald 
		// f.eks. når ein trykker seg frå edit og over i å redigere engelsk versjon av datasett
	} else {
		var url = 'https://data.norge.no' + getCanonicalUrl();
		console.log("document.URL: " + document.URL);
		console.log("goto-URL: " + url);
		if (document.URL !== url) { // unngå redirect for noder som ikkje har kanonisk URL
			window.location.href = url;
		}
	}
}

$(document).ready(() => runIt());