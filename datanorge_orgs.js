function runIt() {
	addTurbo();
	addOrgsToMenu();	

	$.getJSON( datanorgeAppsURL, function( data ) {
		var allApps = data;
		$(".sourceList li").each(function() {
			if (!$(this).hasClass("letterGroup")) {
				var org = $("a", this)
					.prop('href')
					.replace("https://data.norge.no/organisasjoner/", "")
					.replace("https://data.norge.no/organization/", "");

				var apps = extractAppsForOrg(allApps, org);

				if (apps.length > 0) {
					$("span:nth-child(2)", this).after("<span>" + apps.length + "</span>");
				}
			}
		});

		window.dispatchEvent(new Event('resize'));
	});
}

$(document).ready(() => runIt());