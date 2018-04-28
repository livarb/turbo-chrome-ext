var debug = true;
var localCacheTime = 120;

// var datanorgeDatasetsURL = "https://livarbergheim.no/api/datanorge_api_dump.php";
var datanorgeDatasetsURL = "https://livarbergheim.no/api/datanorge_api_dump_pluss2.php";
var datanorgeDatasetsURLcached = "https://livarbergheim.no/api/datanorge_api_dump_pluss2_cached.php";
var datanorgeAppsURL = "https://livarbergheim.no/api/datanorge_apps_bydataset_json.php";
var datanorgeFDKmapURL = "https://livarbergheim.no/api/datanorge_fdk_map.php";
var datanorgeCodes = "https://livarbergheim.no/api/datanorge_codes.php";

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
    } else if (dataset.id == ('https://data.norge.no/node/' + nodeId)) {
      return dataset;
    }
  }
  // return null;
}

// https://stackoverflow.com/a/2901298/2252177
const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function addTurbo() {
  var currentTitle = $(".sub-portal:first a").html();
  $(".sub-portal:first a").html(currentTitle + ' — <span style="color: indianred;">turbo</span>');

  // får "Åpne offentlige data i Norge" til å stå på ei linje i staden for to
  $("header .group .sub-portal p").css({ 'width' : '200px'});
  $("header .group .sub-portal p").click(function () { 
    console.log("cleared local storage for turbo-extension.");
    chrome.storage.local.clear(function() {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
    });
  });


  $("footer address ul li:last").removeClass("last");
  $("footer address ul").append('<li class="last"><a href="https://github.com/livarb/turbo-chrome-ext/">Turbo-tillegg</a> laga av Livar Bergheim</li>');  
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

function addTurboMenu() {
  var htmlToInsert =
    `<li class="menuitem with-submenu">
        <a href="#page=turbo">Turbo</a>
        <ul class="level1" style="height: auto; left: -322px;">
          <li class="navigation">
            <a href="" class="btn prev" role="button">Opp ett nivå</a>
            <a href="" class="btn top" role="button">Til øverste nivå</a>
            <a href="#">Turbo<span>Temaside?</span></a>
          </li>
          <li><a href="/#page=english" class>English</a></li>
          <li><a href="/#blank" class>Blank page</a></li>          
        </ul>
      </li>`;  
  // $(".level0 li:last-child:first").after(htmlToInsert);
    $(".level0:first li:last-child").removeClass("last");
    $(".level0:first").append(htmlToInsert);
    $(".level0:first li:last-child:first").addClass("last");
}

function getNodeLink() {
  return $("link[rel='shortlink']").attr('href');
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

// https://stackoverflow.com/a/14794066
function isInt(value) {
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
}

// løysing oppgitt til å vere frå mustache.js
// https://stackoverflow.com/a/12034334
var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
    return entityMap[s];
  });
}

// https://stackoverflow.com/a/7220510
function syntaxHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}


// DATA.NORGE-DATASETS DATA - GETTING/SETTING LOCAL STORAGE, FETCHING APIS

function storeDatanorgeLocally(data, timestamp, etag) {
  var currentEtag = null;
  getLocalDatanorgeEtag().then(currentEtag => {
    var isEtagNewer = parseInt(currentEtag, 10) < parseInt(etag, 10);

    if (debug) {
      console.log("(storeDatanorgeLocally) current etag: " + currentEtag);
      if (currentEtag === etag) {
        console.log("(storeDatanorgeLocally) etags match. not updating local storage");
      } else {
        if (isEtagNewer) {
          console.log("(storeDatanorgeLocally) new etag is newer. updating local storage");
        } else {
          console.log("(storeDatanorgeLocally) new etag is OLDER. not updating local storage");
        }
      }
    }

    if (data !== null && isEtagNewer) {
      chrome.storage.local.set({'datanorge': data}, function() {
        if (typeof runtime !== 'undefined') {
            console.log("(storeDatanorgeLocally) Failed to store data. Oh noes.");
        } else {
          if (debug) console.log("(storeDatanorgeLocally) Stored data!");
        }
      });
    }

    if (isEtagNewer) {
      chrome.storage.local.set({'datanorge_etag': etag}, function() {
        if (typeof runtime !== 'undefined') {
            console.log("(storeDatanorgeLocally) Failed to store etag. Oh noes.");
        } else {
          if (debug) console.log("(storeDatanorgeLocally) Stored etag!");
        }
      });
    }   
  }, () => { // no current etag
    if (debug) console.log("(storeDatanorgeLocally) no current etag");    
    if (data !== null) {
      chrome.storage.local.set({'datanorge': data}, function() {
        if (typeof runtime !== 'undefined') {
            console.log("(storeDatanorgeLocally) Failed to store data. Oh noes.");
        } else {
          if (debug) console.log("(storeDatanorgeLocally) Stored data!");
        }
      });
    }

    if (etag !== null) {
      chrome.storage.local.set({'datanorge_etag': etag}, function() {
        if (typeof runtime !== 'undefined') {
            console.log("(storeDatanorgeLocally) Failed to store etag. Oh noes.");
        } else {
          if (debug) console.log("(storeDatanorgeLocally) Stored etag!");
        }
      });
    }   
  });   

  if (timestamp !== null) {
    chrome.storage.local.set({'datanorge_timestamp': timestamp}, function() {
      if (typeof runtime !== 'undefined') {
          console.log("(storeDatanorgeLocally) Failed to store timestamp. Oh noes.");
      } else {
        if (debug) console.log("(storeDatanorgeLocally) Stored timestamp!");
      }
    });
  }
}

function loadDataFromStorage () {
  return new Promise(function (resolve, reject) {
    if (debug) console.log("(loadDataFromStorage) Loading data from local cache");

    chrome.storage.local.get('datanorge', function(data) {
        // if (chrome.runtime.lastError) {
      if (!data.hasOwnProperty('datanorge')) {          
          if (debug) console.log("(loadDataFromStorage) Failed loading from local cache. Does not exist?");
          reject();
        } else {
          if (debug) console.log("(loadDataFromStorage) Loaded from local cache");        
        resolve(data.datanorge);
        }
    });
  });
}

function getLocalDatanorgeTimestamp() {
  return new Promise(function (resolve, reject) {
    chrome.storage.local.get('datanorge_timestamp', function(data) {
      if (data.hasOwnProperty('datanorge_timestamp')) {
        resolve(data.datanorge_timestamp);
      } else {
        reject();
      }
    });
  }); 
}

function getLocalDatanorgeEtag() {
  return new Promise(function (resolve, reject) {
    chrome.storage.local.get('datanorge_etag', function(data) {
      if (data.hasOwnProperty('datanorge_etag')) {
        resolve(data.datanorge_etag);
      } else {
        reject();
      }
    });
  }); 
}

let loadDataPromise;
function loadData() {
  if (loadDataPromise) {
    if (debug) console.log("(loadData) called again");  
    return loadDataPromise;
  }

  if (debug) console.log("(loadData) called again");

  loadDataPromise = new Promise(function(resolve, reject) {
    isCacheFresh()
      .then( () => {
        if (debug) console.log("(loadDataPromise) Cache is fresh");
        loadDataFromStorage().then( 
          data => { resolve(data); }
        ,() => {
          console.log("(loadDataPromise) Failed loading data from cache..");
          reject();
        })
      }, () => {
        if (debug) console.log("(loadDataPromise) Cache is not fresh");
        loadDataFromAPI().then(
          data => { resolve(data); },
          () => {
            console.log("(loadDataPromise) error loading data from API");
            reject();
        });
      });
  });

  return loadDataPromise;
}

function loadDataQuickly() {
  if (debug) console.log("(loadDataQuickly) called"); 
  return new Promise(function(resolve, reject) {
    loadDataFromStorage().then(
      data => { // got data
        if (debug) console.log("(loadDataQuickly) loaded from local storage");        
        resolve(data); 
      }, // got data
      () => { // error, get cached version from server
        if (debug) {
          console.log("(loadDataQuickly) couldn't load from local storage");
          console.log("(loadDataQuickly) getting data from cached API");        
        } 
        loadDataFromCachedAPI().then(
          data => { 
            if (debug) console.log("(loadDataQuickly) loaded data from cached API");
            resolve(data);
          },
          () => { 
            console.log("(loadDataQuickly) error getting data from cached API."); 
            reject();
        });
      });
  });
}

let isCacheFreshPromise;
function isCacheFresh() {
  if (isCacheFreshPromise) {
    if (debug) console.log("(isCacheFresh) called again");
    return isCacheFreshPromise;
  }

  if (debug) console.log("(isCacheFresh) called for the very first time");
  isCacheFreshPromise = new Promise(function (resolve, reject) {
    getLocalDatanorgeTimestamp().then( timestamp => {
      var now = Math.floor(Date.now() / 1000);
      if (debug) {
        let diff = now - timestamp;
        console.log("(isCacheFresh) " + timestamp + " is timestamp of cache");
        console.log("(isCacheFresh) " + now + " is timestamp of now");
        console.log("(isCacheFresh) diff: " + diff + " seconds");
        console.log("(isCacheFresh) localCacheTime: " + localCacheTime + " seconds");
      }
      if ((timestamp == 'undefined') || (timestamp + localCacheTime) < now) {
        if (debug) console.log("(isCacheFresh) not fresh");
        reject(); // cache is not fresh
      } else {
        if (debug) console.log("(isCacheFresh) fresh");         
        resolve(); // cache is fresh
      }     
    }, () => {
      if (debug) console.log("(isCacheFresh) not fresh - cache-timestamp does not exist");
      reject(); // no cache exists
    });
  });

  return isCacheFreshPromise;
}


let loadDataFromAPIPromise;
function loadDataFromAPI() {
  if (loadDataFromAPIPromise) {
    return loadDataFromAPIPromise;
  }

  loadDataFromAPIPromise = new Promise(function(resolve, reject) {
    if (debug) {
      var start_time = new Date().getTime();
      console.log("(loadDataFromAPI) loading");
    }

    $.ajax({
      url: datanorgeDatasetsURL,
      success: function (data, textStatus, xhr) {
        if (debug) {
          console.log('(loadDataFromAPI) successfully got them data');
          console.log("(loadDataFromAPI) status: " + xhr.getResponseHeader('status'));
          console.log("(loadDataFromAPI) etag: " + xhr.getResponseHeader('etag'));
          console.log(xhr.getAllResponseHeaders());
          console.log(xhr);

              var request_time = new Date().getTime() - start_time;
              console.log("(loadDataFromAPI) ajax-time: " + request_time + " ms");
          }

        resolve(data);

        storeDatanorgeLocally(data, Math.floor(Date.now() / 1000), xhr.getResponseHeader('etag'));
      },
      error: function (xhr, textStatus, errorThrown) {
        console.log('error fetching data');
        console.log(xhr.getAllResponseHeaders());
        console.log(xhr.getResponseHeader('status'));
        console.log(xhr);
        reject();
       }
    });
  });

  return loadDataFromAPIPromise;
}


function loadDataFromCachedAPI() {
  return new Promise(function(resolve, reject) {
    if (debug) {
      var start_time = new Date().getTime();
      console.log("(loadDataFromCachedAPI) Loading from cached API");
    }

    $.ajax({
      url: datanorgeDatasetsURLcached,
      success: function (data, textStatus, xhr) {
        if (debug) {
          console.log('(loadDataFromCachedAPI) successfully got them data');
          console.log("(loadDataFromCachedAPI) status: " + xhr.getResponseHeader('status'));
          console.log("(loadDataFromCachedAPI) etag: " + xhr.getResponseHeader('etag'));
          console.log(xhr.getAllResponseHeaders());
          console.log(xhr);

              var request_time = new Date().getTime() - start_time;
              console.log("(loadDataFromCachedAPI) ajax-time: " + request_time + " ms");
          }

        resolve(data);

        storeDatanorgeLocally(data, null, xhr.getResponseHeader('etag'));    
      },
      error: function (xhr, textStatus, errorThrown) {
        console.log('(loadDataFromCachedAPI) error fetching data');
        console.log(xhr.getAllResponseHeaders());
        console.log(xhr.getResponseHeader('status'));
        console.log(xhr);
        reject();
       }
    });
  });
}
