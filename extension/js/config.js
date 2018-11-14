var config = {
    "client": {
        PATH_API_META: "/api/meta",
        PATH_API_DATA: "/api/data",
        PATH_API_RSAOPRF: "/oprf/rsa",
        PATH_API_ECOPRF: "/oprf/ec",
        KEY_META: "meta",
        KEY_PREFIX: "prefix",
        KEY_BLACKLIST: "blacklist"
    }
};


if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
}
if (typeof define === "function") {
    define([], function () {
        return config;
    });
}

