# Blacklist formatting (canonicalization)
Javascript script for converting line-by-line text input into JSON format output that maps with the client-end target URL processing procedures.

## How to run this?
```
npm install yargs
node main.js -s <src> -d <dest> -w <withmeta>
```
**options:**
* -s &nbsp;&nbsp;&nbsp;&nbsp;input source path, pls make sure input file is in txt and each line of input file contains a url or domain
* -d &nbsp;&nbsp;&nbsp;&nbsp;output destination file
<!-- * -w &nbsp;&nbsp;&nbsp;&nbsp;withmeta 1; withoutmeta 0; -->

## About input format
Currently only support  
For dataset that does not require metadata, input must be a *.txt file that has a URL/domain in each line;  
<!-- For dataset that requires metadata, input must be a *.csv file, each line of which is a URL/domain with url and metadata separated by ',' . -->

## About JSON output
'/'in URL is escaped as '\/' in correspondence with the backend operations.
For instance, *"www.eyemmersive.solutions/services-offered.html"*
*escaped as "www.eyemmersive.solutions\\/services-offered.html"*

## About metadata
For dataset malwaredomains with metadata  
0: **others**,
1: **phishing**,
2: **malicious**

Also, {"m":2,"u":"unsafe.ppsb.com\/"} is added in the malwaredomains.withmeta.json for testing
unsafe.ppsb.com

## Number of entries 
(original canonicalable URL -> deduplicated after canonicalization)  
phishtank: 25559 -> 25008  
<!-- malwaredomains:    -->
bigBlacklistURLs: 178649 -> 177770  
bigBlacklistdomains: 1605920 -> 1571617  
bigBlacklist: 1784569 -> 1749384

