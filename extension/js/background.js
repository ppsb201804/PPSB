//const config = require('config');
///const bigInteger = require('BigInteger.js');

//log
const log = (msg) => { console.log(msg ? msg : ""); };

//global array for all data
var g_arrSource = {};

var g_arrType = ["Phishing"];

//update from localstore
var updateAll = () => {
    return new Promise(resolve => {

        let needUpdate = {};

        localstore.getMeta().then(meta => {

            //test if has delete some items
            for (let k in g_arrSource) {
                if (!meta[k]) {
                    delete g_arrSource[k];
                }
            }

            //Begin to update or add
            for (let k in meta) {
                let item = meta[k];

                //if already have
                if (g_arrSource[k]) {

                    //check version
                    if (item.version < g_arrSource[k].meta.version) {
                        //don't need update
                        needUpdate[k] = false;
                        continue;
                    }
                }

                //cache the flags
                needUpdate[k] = true;

                //update n, e for RSA
                item.biN = new bigInt(item.n);
                item.biE = new bigInt(item.e);

                //new or update
                if (!g_arrSource[k]) {
                    g_arrSource[k] = {};
                }

                g_arrSource[k][config.client.KEY_META] = item;

            }

            return localstore.getPrefix();

        }).then(prefix => {
            //Update Prefix

            for (let k in prefix) {

                if (!needUpdate[k]) {
                    continue;
                }

                let item = prefix[k];
                //new or update
                g_arrSource[k][config.client.KEY_PREFIX] = new Set(item);

            }

            return localstore.getBlacklist();

        }).then(blacklist => {
            //Update Blacklist

            for (let k in blacklist) {

                if (!needUpdate[k]) {
                    continue;
                }

                let item = blacklist[k];
                //new or update

                //check if withmeta
                if (typeof item[0] === "string") {
                    //without meta
                    g_arrSource[k][config.client.KEY_BLACKLIST] = new Set(item);
                }
                else {
                    //with meta
                    let mapBlacklist = new Map();
                    item.forEach((val, idx, arr) => {
                        mapBlacklist.set(val[0], val[1]);
                    })

                    g_arrSource[k][config.client.KEY_BLACKLIST] = mapBlacklist;

                }

            }

            resolve();

        });

    });
}

var checkRecords = async (url) => {

    let firUint = await digest.str2uint(url);

    for (let k in g_arrSource) {
        let item = g_arrSource[k];

        let meta = item[config.client.KEY_META];
        let prefix = item[config.client.KEY_PREFIX];
        let blacklist = item[config.client.KEY_BLACKLIST];

        //check if in prefix list
        if (!prefix.has(firUint)) {
            continue;
        }

        //check blacklist

        //compute oprf
        let res_oprf = await oprf[meta.sectype](url, meta);

        if (meta.withmeta) {

            let val = blacklist.get(res_oprf.t1);
            if (!val) {
                //can't find in blacklist
                continue;
            }

            //find it with metadata, then fetch it.
            let str = digest.strxor(val, res_oprf.t2);
            let m = JSON.parse(str);
            //return with meta[type]
            return {
                url: url,
                type: g_arrType[m.t],
                source: k
            }

        } else {

            if (blacklist.has(res_oprf.t1)) {
                //in blacklist

                return {
                    url: url,
                    source: k
                }

            }

        }

    }

    return null;

};

var checkUrl = async (srcUrl) => {

    let arrUrls = getLookupExpressions(getCanonicalizedURL(srcUrl));

    for (let i = 0; i < arrUrls.length; i++) {

        let url = arrUrls[i];

        //temp whitelist
        if (g_whitelist.has(url)) {
            return null;
        }

        let res = await checkRecords(url);

        if (res != null) {
            return res;
        }

    }

    return null;

}

var g_whitelist = new Set();
var g_blockhistory = [];
var g_boolprotect = true;


chrome.webNavigation.onBeforeNavigate.addListener(details => {

    if (!g_boolprotect) {
        return;
    }

    let tabid = details.tabId;

    if (details.frameId != 0) {
        return;
    }

    if (details.url.startsWith("chrome-extension:")) {
        return;
    }

    (async () => {

        let res = await checkUrl(details.url);

        console.log(res);

        if (res != null) {

            chrome.tabs.update(tabid, {
                url: chrome.runtime.getURL('block.html') + "?" + btoa(JSON.stringify(res))
            });

            res.navUrl = details.url;
            res.time = Date.now();

            //just for bug on Mac Chrome, if url not existed, it will call onBeforeNavigate twice.
            if (g_blockhistory.length == 0 || g_blockhistory[g_blockhistory.length - 1].navUrl != res.navUrl || res.time - g_blockhistory[g_blockhistory.length - 1].time > 3000) {
                g_blockhistory.push(res);
            }


        }

    })();

});


//message handle
chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {

    if (obj) {
        if (obj.method == 'getBlockHistory') {

            getBlockHistory(sendResponse);
            return true;

        } else if (obj.method == 'clearBlockHistory') {

            g_blockhistory = [];
            sendResponse({ suc: true });

        } else if (obj.method == 'addWhitelist') {

            g_whitelist.add(obj.data.url);
            sendResponse({ suc: true });

        } else if (obj.method == 'stopProtect') {

            g_boolprotect = false;
            chrome.browserAction.setIcon({
                path: {
                    "32": "icon/icon_unsafe_32.png",
                    "48": "icon/icon_unsafe_48.png",
                    "128": "icon/icon_unsafe_128.png"
                }
            });

        } else if (obj.method == 'startProtect') {

            g_boolprotect = true;
            chrome.browserAction.setIcon({
                path: {
                    "32": "icon/icon_safe_32.png",
                    "48": "icon/icon_safe_48.png",
                    "128": "icon/icon_safe_128.png"
                }
            });

        } else if (obj.method == 'checkProtect') {

            sendResponse(g_boolprotect);

        } else if (obj.method == 'updateAll') {

            updateAll().then(() => {
                console.log("Finish Update all");
                sendResponse({ suc: true });
            });
            return true;

        } else if (obj.method == 'othermethod') {

        }

    }

});


var getBlockHistory = (sendResponse) => {

    sendResponse(g_blockhistory);

}

//First installed jump to Option page
chrome.runtime.onInstalled.addListener(() => {

    chrome.tabs.create({ 'url': "/option.html#install" });

});

chrome.runtime.onStartup.addListener(() => {

    //Update from local storage
    updateAll();

    //let option check the remote version
    document.getElementById("frameOption").src = chrome.runtime.getURL('option.html') + "#update";

});

