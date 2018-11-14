const argv = require('yargs').argv;
const crypto = require('crypto');
const fs = require('fs');
const purl = require("./libs/processingURL.js")

const log = (msg) => { if (l) { console.log(msg ? msg : "") } };

var blacklistPath = '../testData/phishtank.withoutmeta.json';
if (argv.b) {
    blacklistPath = argv.b;
}

var urlPath = '../testData/top-1m.json';
if (argv.u) {
    urlPath = argv.u;
}

var l = 1;
if (argv.l) {
    l = argv.l;
}

var decompose = true;
if (argv.d !== undefined) {
    decompose = argv.d;
}

//diff the time
g_diffTime = -1;
var diffTime = () => {
    if (g_diffTime > 0) {
        return Date.now() - g_diffTime;
    }
    else {
        g_diffTime = Date.now();
    }
}

let computeFirstUint = (url) => {

    //process first 32bit hash
    let hash = crypto.createHash('sha256');
    hash.update(url, 'utf8');
    let hashBuf = hash.digest();
    let firArrUint = new Uint32Array(hashBuf.buffer, 0, 4);
    //get first 32bit
    return firArrUint[0];

};

console.log(`testPrefixHitRate with blacklistPath = ${blacklistPath}, urlPath = ${urlPath}`);

log(`Begin to read json source, please wait...`);
diffTime();

let blacklistJson = require(blacklistPath);
let urlJson = require(urlPath);

let maxNum = urlJson.length;
let hitNum = 0;

log(`Finish reading the json source, time cost : ${diffTime()}`);
log(`The blacklistFile has ${blacklistJson.length} URLs, the UrlFile has ${urlJson.length} URLs.`);

//Prepare the set
let setFirstUint = new Set();
blacklistJson.forEach((v, i, arr) => {
    setFirstUint.add(computeFirstUint(v.u));
});

log(`Finish prepare the Set, time cost : ${diffTime()}`);

if (decompose) {

    urlJson.forEach((v, i, arr) => {

        let arrUrls = purl.getLookupExpressions(purl.getCanonicalizedURL(v));
        //we just verify the hitRate, donot care the performance, it may push itself twice but don't matter.

        urlJson.push(...arrUrls);

    });

    log(`Since use decompose, the number of URLs increase to ${urlJson.length}, time cost : ${diffTime()}`);

}

//test rate

urlJson.forEach((v, i, arr) => {

    if (setFirstUint.has(computeFirstUint(v))) {
        hitNum++;
    }
});

log(`Finish all the test, time cost : ${diffTime()}`);
console.log(`The number of URL is ${maxNum}, the hitNum is ${hitNum}, the rate is ${hitNum / maxNum}`);

console.log(`testPrefixHitRate Finished`);