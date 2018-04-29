// Google Analytics settings
const GA_TRACKING_ID = 'UA-118398538-1';
const GA_CLIENT_ID = 'bb9312c4-a991-436f-99ad-162a5c63384f'; // for all users of Firefox add-on

var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
console.log(isFirefox);

if (!isFirefox) {
  // thanks to: https://davidsimpson.me/2014/05/27/add-googles-universal-analytics-tracking-chrome-extension/
  // Standard Google Universal Analytics code
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js', 'ga'); // Note: https protocol here

  ga('create', 'UA-118398538-1', 'auto');
  ga('set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
  ga('set', 'displayFeaturesTask', null);
  ga('set', 'anonymizeIp', true);
}

chrome.runtime.onMessage.addListener(function( request, sender, sendResponse ) {
    // https://stackoverflow.com/a/7000222
    
    if (request.action == "sendPageView"){
      if (isFirefox) {
        // https://blog.mozilla.org/addons/2016/05/31/using-google-analytics-in-extensions/
        let xrequest = new XMLHttpRequest();
        let url = encodeURI('/' + request.page);
        let title = encodeURI(request.pageTitle);
        let message =
          "v=1&tid=" + GA_TRACKING_ID + "&cid= " + GA_CLIENT_ID + "&aip=1" +
          "&ds=add-on&t=pageview&dl=" + url + "&dt=" + title;

        xrequest.open("POST", "https://www.google-analytics.com/collect", true);
        xrequest.send(message);
      } else {
        // ga('set', 'title', 'Settings');
        ga('send', 'pageview', request.page, {title: request.pageTitle});
      }
    } else if (request.action == "sendEvent") {
      // not implemented yet

      /* FIREFOX:
        let request = new XMLHttpRequest();
        let message =
          "v=1&tid=" + GA_TRACKING_ID + "&cid= " + GA_CLIENT_ID + "&aip=1" +
          "&ds=add-on&t=event&ec=AAA&ea=" + aType;

        request.open("POST", "https://www.google-analytics.com/collect", true);
        request.send(message);
      */
    }
});