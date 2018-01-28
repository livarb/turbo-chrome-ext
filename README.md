# Turbo-extension for data.norge.no++

Browser-extension for adding extra functionality to [data.norge.no](https://data.norge.no/), [hotell.difi.no](https://hotell.difi.no) and [fellesdatakatalog.brreg.no](https://fellesdatakatalog.brreg.no). This is an unofficial extension. See [blog-post for introduction to what the extension does](https://medium.com/@livar.bergheim/become-a-superuser-of-data-norge-no-and-hotell-difi-no-8c3503364d90).

### Note that websites are in norwegian
Note that [data.norge.no](https://data.norge.no/) and [hotell.difi.no](https://hotell.difi.no) are only available in norwegian, while [fellesdatakatalog.brreg.no](https://fellesdatakatalog.brreg.no) is also available in english, although much of the content is only in norwegian. This Github-repository and the blog-post is in english to be more easily accessible for people who are interested in open data or writing browser-extensions.

## Getting started
The extension is currently available for:
- [Chrome](https://chrome.google.com/webstore/detail/turbo-tillegg-for-datanor/aoophphlpckopfaofppojahglnbfekfh)
- [Firefox](https://addons.mozilla.org/firefox/addon/turbo-tillegg-for-data-norge/)

You can also download the source code and manually add the extension in your own browser.

## Functionality
NB. Some minor functionality is yet to be described.

### Data.norge.no

#### All pages on data.norge.no
- Add Turbo to site title
- Add note to site footer
- Add shortcut to Organization-page in main menu ("Orgs")
- Changes javascript-based links to normal links so it's possible to open in a new window (v0.7)

#### Front page
- Shows last modified dataset-entries ("Sist redigerte data-oppføringer")

#### Dataset-entry
Example: [enhetsregisteret](https://data.norge.no/data/registerenheten-i-br%C3%B8nn%C3%B8ysund/enhetsregisteret)
- Show list of apps/services that use the dataset
- Show last-modified time of any distributions pointing to hotell.difi.no.
- Creates new section with metadata for the data.norge-entry ("Data.norge-oppføring")
-- Moves date of when entry was published to this section, to not confuse date with when dataset was published, which may differ from when the data-entry in data.norge was published
-- Adds last-modified timestamp for dataset-entry
-- Adds "number of datasets"

#### Organisation-page
Example: [Kartverket](https://data.norge.no/organisasjoner/statens-kartverk)
- show list of apps/services that use at least one dataset from the organisation

#### List of organisations on data.norge.no
https://data.norge.no/organisasjoner
- show number of apps/services that use at least one dataset from the organisation

### Hotell.difi.no

#### Frontpage 
- Show list of all published datasets

#### Dataset-view 
Example: https://hotell.difi.no/?dataset=bergen/dokart
- Show last-modified timestamp
- Show title of dataset stored in data hotel
- Fetch information from the dataset's entry in data.norge.no
-- Show title of dataset and publisher's name
-- Add link to go to data.norge-entry, where you find important information such as contact info, update frequency, terms of use/license/attribution, information about data quality++
- Show size of dataset 

### Fellesdatakatalog.brreg.no (FDK)

#### Data-entry
Example: [Kvalitet på nett - resultatliste 2016](https://fellesdatakatalog.brreg.no/datasets/a82e6eb7-6b59-4264-9def-1dc2ad913b36)
- show link to corresponding entry in data.norge.no. Only for entries in FDK which have been imported from data.norge.no
