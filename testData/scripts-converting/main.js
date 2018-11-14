var process = require('./processingURL.js');
var path = require('path');
var argv = require('yargs').argv;
var fs  = require("fs");

var objs = [];
var processedURLs = [];

var src = path.normalize(__dirname+'/../test-source/phishtank20181031.txt');
var dest = path.normalize(__dirname+'/../release-json/phishtank.withoutmeta.json');
// var withmeta = 0;

if (argv.s) {
    src = argv.s;
}
if (argv.d) {
    dest = argv.d;
}
// if (argv.w) {
//     withmeta = argv.w;
// }

// handle duplication
function uniq(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

console.time("execution");
fs.readFileSync(src).toString().split('\n').forEach(function (line) { 
    if (line == "") {return;} // same as continue, remove empty lines
    if (line.match(/%3A|%253A/i)){return;} // %3A,%3a the same as ':', %25 is %
    if (line.indexOf(':') > -1) {
        var re = /\..+:/;   //URL with ':'not affixed with scheme is discarded
        if(line.match(re)){return;}
    }
    var canonicalURLs = process.getCanonicalizedURL(line); // customized, without scheme
    // if (canonicalURLs.startsWith("http://")) {canonicalURLs = canonicalURLs.substring(7, canonicalURLs.length);}
    // if (canonicalURLs.startsWith("https://")) {canonicalURLs = canonicalURLs.substring(8, canonicalURLs.length);}
    processedURLs.push(canonicalURLs);
}); 

uniqueURLs = uniq(processedURLs);

// console.log(objs.length);
console.log(processedURLs.length);
console.log(uniqueURLs.length);

uniqueURLs.forEach(function(value){
    var obj = {"u": value};
    objs.push(obj);
});

fs.writeFileSync(dest, JSON.stringify(objs).replace(/\//g, '\\/'), 'utf-8'); 
console.timeEnd("execution");
// console.log(process.getLookupExpressions(process.getCanonicalizedURL("https://csgoempire.org")));