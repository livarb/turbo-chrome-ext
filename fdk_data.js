function runIt() {
	console.log("turbo enabled!");

	if (document.URL.includes("data.norge.no")) {
		console.log("data.norge import detected!");

		var url = document.URL.split("/");

		var dataNorgeUrlRaw = url[url.length-1];
		console.log(dataNorgeUrlRaw);		

		var dataNorgeUrl = decodeURIComponent(dataNorgeUrlRaw);		
		console.log(dataNorgeUrl);

		var htmlToInsert = ' <br/><span id="turboDataNorgeLink"><a href="' + dataNorgeUrl + '">Sjå datasett på data.norge.no</></span>';
		$("div.fdk-margin-bottom").first().append(htmlToInsert);
	}
}

$(document).ready(() => runIt());