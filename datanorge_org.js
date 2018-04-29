function prepareAppList() {
	var htmlToInsert = `
<div class="descriptionWidget">
	<div id="appList" class="mod-bd">
		<h2 id="appsHeading">Apper/tjenester</h2>
		<ul>
      		<li id="headingLi"></li>
      		<li id="loadingLi">Lastar inn informasjon...</li>
  		</ul>
	</div>
</div>
`;

	$("#block-datanorge-organization-organization-info div.content:first").append(htmlToInsert);
	$("#appsHeading").append(getSpinner("appspinner"));
}

function runIt() {
	addTurbo();
	addOrgsToMenu();	

	prepareAppList();

	// OBS: krev HTTPS
	var org = document.URL
		.replace("https://data.norge.no/organisasjoner/", "")
		.replace("https://data.norge.no/organization/", "")		
		.split("/")[0];

	$.getJSON( datanorgeAppsURL, function( data ) {
		var apps_bydataset = data;
		$("#loadingLi").remove();

		apps = extractAppsForOrg(data, org);

		if (apps.length > 0) {
			// Sortere på publiseringsdato
			// https://stackoverflow.com/a/8837511
			apps.sort(function(a, b){
				var aSplit = b.published.split("."),
					bSplit = a.published.split(".");

				var aDay = aSplit[0],
					bDay = bSplit[0];
				var aMonth = aSplit[1],
					bMonth = bSplit[1];
				var aYear = aSplit[2],
					bYear = bSplit[2];

			    // Compare the 2 dates
			    if (aYear < bYear) {
			    	return -1;
			    } else if (aYear > bYear) {
			    	return 1;
			    } else {
			    	if (aMonth < bMonth) {
			    		return -1;
			    	} else if (aMonth > bMonth) {
			    		return 1;
			    	} else {
			    		if (aDay < bDay) {
			    			return -1;
			    		} else if (aDay > bDay) {
			    			return 1;
			    		}
			    		return 0;
			    	}
			    }
			});

			$("#appsHeading").append(" (" + apps.length + ")");
			// $("#headingLi").html("<i>Nyeste øverst.</i>");			
			$("#headingLi").remove();

			// var apps = apps_bydataset[document.URL];
			for (var i = 0; i < apps.length; i++) {
				var app = apps[i];
				var html = '<li><span><a href="' + app.url + '">' + app.title + "</a></span></li>";
				$("#appList ul").append(html);
			}
		} else {
			$("#headingLi").remove();
			$("#appList ul").append('<li>Ingen registrerte døme på bruk av data frå denne organisasjonen.</li>'
				+ '<li><a href="https://data.norge.no/register/app?brukar">Registrer ein app/tjeneste</a>!</li>');
		}	
		$("#appspinner").remove();
	});

	sendPageView();
}

$(document).ready(() => runIt());