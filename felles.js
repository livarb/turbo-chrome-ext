var datanorgeDatasetsURL = "https://livarbergheim.no/api/datanorge_api_dump.php";
var datanorgeDatasetsURLcached = "https://livarbergheim.no/api/datanorge_api_dump_cached.php";
var datanorgeAppsURL = "https://livarbergheim.no/api/datanorge_apps_bydataset_json.php";
var datanorgeFDKmapURL = "https://livarbergheim.no/api/datanorge_fdk_map.php";

function timeConverter(UNIX_timestamp){
  var multiplier = 0;
  var length = UNIX_timestamp.toString().length;

  if (length == 13) {
    multiplier = 1;
  } else if (length == 10) {
    multiplier = 1000;
  } else if (length == 1) {
    return 'Manglar tidsstempel';
  } else {
    return 'Ugyldig tidsstempel : ' + UNIX_timestamp;
  }

  var a = new Date(UNIX_timestamp * multiplier);
  var months = ['jan.','feb.','mar.','apr.','mai','juni','juli','aug.','sep.','okt.','nov.','des.'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = ('0' + a.getHours()).slice(-2);
  var min = ('0' + a.getMinutes()).slice(-2);
  var time = date + '. ' + month + ' ' + year + ' ' + hour + ':' + min;
  return time;
}

function getDataset(nodeId, datanorgedatasets) {
  for (var i = 0; i < datanorgedatasets.length; i++) {
    var dataset = datanorgedatasets[i];
    if (dataset.id == ('http://data.norge.no/node/' + nodeId)) {
      return dataset;
    }
  }
}

function addTurbo() {
  var currentTitle = $(".sub-portal:first a").html();
  $(".sub-portal:first a").html(currentTitle + ' — <span style="color: indianred;">turbo</span>');

  // får "Åpne offentlige data i Norge" til å stå på ei linje i staden for to
  $("header .group .sub-portal p").css({ 'width' : '200px'});

  $("footer address ul li:last").removeClass("last");
  $("footer address ul").append('<li class="last"><a href="https://bit.ly/turbotillegg">Turbo-tillegg</a> laga av Livar Bergheim</li>');  
}

// https://stackoverflow.com/a/18650828
function formatBytes(a,b){if(0==a)return"0 Bytes";var c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}

// https://stackoverflow.com/a/3261380
String.prototype.isEmpty = function() {
    return (this.length === 0 || !this.trim());
};

function extractAppsForOrg(allApps, org) {
  data = allApps;

  var apps = [];
  var appUrls = [];

  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      if (key.startsWith("https://data.norge.no/data/" + org)) {
        for (var i = 0; i < data[key].length; i++) {
          if (!appUrls.includes(data[key][i].url)) {
            apps.push(data[key][i]);
            appUrls.push(data[key][i].url);
          }
        }             
      }
    }
  }
  return apps;
}

function addOrgsToMenu() {
  $(".level0 li:nth-child(2):first").after('<li class="menuitem no-submenu"><a href="/organisasjoner">Orgs</a></li>');
}

function getNodeLink() {
  return $("link[rel='shortlink']").attr('href');
}

function removeJSLinkShit() {
  $('*[data-url] > .table').each(function() {
    var dataurl = $(this).parent().attr("data-url");
    $(this).parent().removeAttr("data-url");
    $(this).wrap('<a href="' + dataurl + '"></a>');
    $(this).parent().css("text-decoration", "none");
  });
}

// Spinner-animation image from https://loading.io/
function getSpinner(id) {
  return "<img id=\"" + id + "\" src=\"" + chrome.extension.getURL("Spinner-1.8s-200px.gif") + "\" width=20 height=20/>";
}

function fetchAndAddEDPLink(nodeId) {
  var url1 = "https://www.europeandataportal.eu/data/en/dataset/http-data-norge-no-node-" + nodeId;
  var url2 = "https://www.europeandataportal.eu/data/en/dataset/http---data-norge-no-node-" + nodeId;  
  
  // Try first URL-format
  $.ajax({
    method: 'HEAD',
    url: url1,
    timeout: 1500,
    success: function(data, textStatus, request) {
      $("#edplinka").attr("href", url1);
      $("#edplinkspinner").remove();
    },
    error: function() {
      // Try second URL-format on failure of first
      $.ajax({
        method: 'HEAD',
        url: url2,
        timeout: 1500,        
        success: function(data, textStatus, request) {
          $("#edplinka").attr("href", url2);
          $("#edplinkspinner").remove();          
        },
        error: function() {
          console.log("Failed getting data from EDP. 404 or timeout.");
          $("#edplink")
            .attr("title",
              "EDP hentar data frå data.norge.no ein "
            + "gang i veka. Dersom dette datasettet er nyleg "
            + "publisert, vil det ikkje vere synleg der endå.")
            .css("text-decoration", "line-through");
          $("#edplinkspinner").remove();
        }
      });
    }
  });
}
