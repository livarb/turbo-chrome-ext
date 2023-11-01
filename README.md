# Turbo-extension for data.norge.no++

Browser-extension for adding extra functionality to [data.norge.no](https://data.norge.no/), [hotell.difi.no](https://hotell.difi.no) and [fellesdatakatalog.digdir.no](https://fellesdatakatalog.digdir.no) (FDK). This is an unofficial extension. See [blog-post for introduction to what the extension does](https://medium.com/@livar.bergheim/become-a-superuser-of-data-norge-no-and-hotell-difi-no-8c3503364d90).

### Note that websites are in norwegian
Note that [data.norge.no](https://data.norge.no/) and [hotell.difi.no](https://hotell.difi.no) are only available in norwegian, while [fellesdatakatalog.digdir.no](https://fellesdatakatalog.digdir.no) is also available in english, although much of the content is only in norwegian. This Github-repository and the blog-post is in english to be more easily accessible for people who are interested in open data or writing browser-extensions.

## Getting started
The extension is currently available for:
- [Chrome](https://chrome.google.com/webstore/detail/turbo-tillegg-for-datanor/aoophphlpckopfaofppojahglnbfekfh)
- [Firefox](https://addons.mozilla.org/firefox/addon/turbo-tillegg-for-data-norge/)

You can also download the source code and manually add the extension in your own browser.

## Functionality

### Data.norge.no

#### All pages on data.norge.no
- Add Turbo to site title
- Add note to site footer
- Add shortcut to Organization-page in main menu ("Orgs")

#### Front page
- Shows last modified dataset-entries ("Sist redigerte data-oppføringer")

### Turbo-menu
Separate [menu/page in data.norge.no](https://data.norge.no/#page=turbo), only available with the extension (v1.0.0), with subpages:
- English. Show list of dataset-entries with english description (in addition to the norwegian version)
- Licenses. Show distribution of licenses. E.g. how many datasets with NLOD, how many with CC-BY 4.0 etc.

#### Dataset-entry
Example: [enhetsregisteret](https://data.norge.no/data/registerenheten-i-br%C3%B8nn%C3%B8ysund/enhetsregisteret)
- Show list of apps/services that use the dataset
- Show last-modified time of any distributions pointing to hotell.difi.no.
- Creates new section with metadata for the data.norge-entry ("Data.norge-oppføring")
 - Moves date of when entry was published to this section, to not confuse date with when dataset was published, which may differ from when the data-entry in data.norge was published
 - Adds last-modified timestamp for dataset-entry
 - Adds "number of datasets" (internal number used for statistics)
- Add link to corresponding dataset-entry in FDK, since FDK automatically imports all dataset-entries in data.norge.no.
- If dataset-entry has english version, show button to swap between languages.

#### Organisation-page
Example: [Kartverket](https://data.norge.no/organisasjoner/statens-kartverk)
- Show list of apps/services that use at least one dataset from the organisation

#### List of organisations on data.norge.no
https://data.norge.no/organisasjoner
- Show number of apps/services that use at least one dataset from the organisation

#### App-pages
Example: [Trafikkhub](https://data.norge.no/app/trafikkhub)
- Show name of publisher (in addition to dataset title) in list of datasets used (v0.8)
- Show a placeholder-text in case the app-entry points to a dataset that has been unpublished.

#### Node-URLs
e.g. data.norge.no/node/X  where X is a running number corresponding to some content-type in Drupal.
The extension will fetch the canonical URL and redirect your browser to this, so you're always at the "pretty" url.

### Hotell.difi.no

#### Frontpage 
- Show list of all published datasets

#### Dataset-view 
Example: https://hotell.difi.no/?dataset=bergen/dokart
- Show last-modified timestamp
- Show title of dataset stored in data hotel
- Fetch information from the dataset's entry in data.norge.no
 - Show title of dataset and publisher's name
 - Add link to go to data.norge-entry, where you find important information such as contact info, update frequency, terms of use/license/attribution, information about data quality++
 - Will show a warning if the dataset you're viewing doesn't have a corresponding entry in data.norge.no.
- Show size of dataset (if you download the entire dataset as CSV)
- Show link to display statistics for current dataset (v0.8)
- Show link to show field-definitions (raw JSON from API)
- Show number of rows in a dataset (v1.0.0)
- Show info if a dataset being view is not published (v1.0.0)

#### Dataset-statistics (v0.8)
Example: https://hotell.difi.no/#statistikk=brreg/enhetsregisteret (only available in extension)
- Fetched statistics for the entire datahotel and extracts data for a given dataset.
- Statistics show pageviews/API-calls for JSON, JSONP, CSV, XML, downloads and total sum pr. month.
- Draws line-chart with lines for JSON(P), XML, CSV, downloads and total.
- Shows table with all data.

### Fellesdatakatalog.digdir.no (FDK)

#### Data-entry
Example: [Dataset: Kvalitet på nett - resultatliste 2016](https://fellesdatakatalog.digdir.no/datasets/a82e6eb7-6b59-4264-9def-1dc2ad913b36)
- Show links to see dataset in other dataportals. Only for entries in FDK which have been imported from data.norge.no
 - data.norge.no
 - Europeandataportal.eu (EDP) (v0.8)
 
 ## Privacy
 The extension uses Google Analytics to see how the app is being used. It only logs pageviews on pages where the extension is active. Anonymize IP is turned on.
