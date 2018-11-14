var localstore = (() => {

    let SAFEBROWSING_META = "SafeBrowsingMeta";
    let SAFEBROWSING_PREFIX = "SafeBrowsingPrefix";
    let SAFEBROWSING_BLACKLIST = "SafeBrowsingBlacklist";

    let getObj = (key) => {
        return new Promise(resolve => {
            chrome.storage.local.get([key], result => {

                if (result[key] === undefined) {
                    resolve({});
                }
                else {
                    resolve(result[key]);
                }

            });
        });
    };

    let setObj = (key, value) => {
        return new Promise(resolve => {
            let pair = {};
            pair[key] = value;
            chrome.storage.local.set(pair, () => {
                resolve(pair);
            });
        });
    };

    let removeObj = (...keys) => {
        return new Promise(resolve => {
            chrome.storage.local.remove(keys, () => {
                resolve();
            });
        })
    }

    let removeAll = () => {
        return new Promise(resolve => {
            chrome.storage.local.remove([SAFEBROWSING_META, SAFEBROWSING_PREFIX, SAFEBROWSING_BLACKLIST], () => {
                resolve();
            });
        })
    }

    //get meta
    let getMeta = () => {
        return getObj(SAFEBROWSING_META);
    }

    //set meta
    let setMeta = (meta) => {
        return setObj(SAFEBROWSING_META, meta);
    }

    //get prefix
    let getPrefix = () => {
        return getObj(SAFEBROWSING_PREFIX);
    }

    //set prefix
    let setPrefix = (prefix) => {
        return setObj(SAFEBROWSING_PREFIX, prefix);
    }

    //get blacklist
    let getBlacklist = () => {
        return getObj(SAFEBROWSING_BLACKLIST);
    }

    //set blacklist
    let setBlacklist = (blacklist) => {
        return setObj(SAFEBROWSING_BLACKLIST, blacklist);
    }

    return {
        getObj: getObj,
        setObj: setObj,
        removeObj: removeObj,
        removeAll: removeAll,
        getMeta: getMeta,
        setMeta: setMeta,
        getPrefix: getPrefix,
        setPrefix: setPrefix,
        getBlacklist: getBlacklist,
        setBlacklist: setBlacklist
    }

})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = localstore;
}
if (typeof define === "function") {
    define([], function () {
        return localstore;
    });
}
