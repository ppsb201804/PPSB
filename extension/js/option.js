
beginG = 0;


(() => {

    //Format Date
    Date.prototype.Format = function (fmt) {
        var o = {
            "y+": this.getFullYear(),
            "M+": this.getMonth() + 1,                 //月份
            "d+": this.getDate(),                    //日
            "h+": this.getHours(),                   //小时
            "m+": this.getMinutes(),                 //分
            "s+": this.getSeconds(),                 //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S+": this.getMilliseconds()             //毫秒
        };
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                if (k == "y+") {
                    fmt = fmt.replace(RegExp.$1, ("" + o[k]).substr(4 - RegExp.$1.length));
                }
                else if (k == "S+") {
                    var lens = RegExp.$1.length;
                    lens = lens == 1 ? 3 : lens;
                    fmt = fmt.replace(RegExp.$1, ("00" + o[k]).substr(("" + o[k]).length - 1, lens));
                }
                else {
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                }
            }
        }
        return fmt;
    }

    var app = angular.module('SafeBrowsingOption', []);

    app.controller('OptionPageController', ['$http', '$scope', function ($http, $scope) {

        var me = this;

        this.addNewUrl = "";

        this.MetaList = [];

        //send message to background
        this.callBackgroundPage = (method, data) => {

            return new Promise(resolve => {
                chrome.runtime.sendMessage({ method: method, data: data }, (res) => {
                    console.log("callBackgroundPage.sendMessage.callback");
                    resolve(res);
                });
            });

        };

        //same as callBackgroundPage(updateAll)
        this.updateBackgroundPage = () => {

            console.log(`updateBackgroundPage`);

            //Pass message to update in Background.js
            return me.callBackgroundPage("updateAll");

        };

        //fetch URL and update the reponse into local
        //if local don't have one, this function will add it.
        this.updateViaUrl = async (url, jMeta) => {

            //update meta

            let res, jsonUrl, data;

            if (!jMeta) {
                jsonUrl = `${url}${config.client.PATH_API_META}`;
                res = await fetch(jsonUrl);
                jMeta = await res.json();
            }

            let meta = await localstore.getMeta();
            meta[jMeta.source] = jMeta;
            await localstore.setMeta(meta);
            console.log("finish meta");

            //update data

            jsonUrl = `${url}${config.client.PATH_API_DATA}?version=${jMeta.version}`;
            res = await fetch(jsonUrl);
            data = await res.json();

            //update prefix

            let prefix = await localstore.getPrefix();
            prefix[jMeta.source] = data["s"];
            await localstore.setPrefix(prefix);

            //update blacklist

            let blacklist = await localstore.getBlacklist();
            blacklist[jMeta.source] = data["m"];
            await localstore.setBlacklist(blacklist);

            return jMeta;

        }

        this.updateMetaList = () => {

            //Update option list
            console.log(`updateMetaList`);

            return localstore.getMeta().then(meta => {

                let metaList = [];
                for (let k in meta) {
                    metaList.push(meta[k]);
                }

                $scope.$apply(function () {
                    me.MetaList = metaList;
                });

            });
        };

        this.removeViaUrl = async (source) => {

            //remove meta

            let meta = await localstore.getMeta();
            delete meta[source];
            await localstore.setMeta(meta);

            //remove prefix

            let prefix = await localstore.getPrefix();
            delete prefix[source];
            await localstore.setPrefix(prefix);

            //remove blacklist

            let blacklist = await localstore.getBlacklist();
            delete blacklist[source];
            await localstore.setBlacklist(blacklist);

        };

        //check version and execute updateUrlViaUrl
        this.updateUrl = (url, version) => {

            console.log(`updateUrl(${url}, ${version})`);
            let jsonUrl = `${url}${config.client.PATH_API_META}`;

            return fetch(jsonUrl).then(res => {

                return res.json();

            }).then(jres => {

                if (jres.version > version) {
                    //async func
                    return me.updateViaUrl(url, jres).then(jMeta => {
                        console.log("finish updateViaUrl");
                        return jMeta;
                    });
                }

            });

        };

        //init
        $scope.init = () => {

            me.updateMetaList();

        }


        //remove all
        $scope.removeAll = () => {

            localstore.removeAll().then(() => {

                return me.updateBackgroundPage();

            }).then(() => {

                //update UI
                $scope.$apply(function () {
                    me.MetaList = [];
                });

            });

        }

        //update all
        $scope.updateAll = () => {

            /*
            chrome.storage.local.get(function (result) {
                console.log(result)
            })
            */

            let arrPromise = [];
            me.MetaList.forEach((val, idx, arr) => {
                //add to Promise list
                arrPromise.push(me.updateUrl(val.url, val.version));
            });

            Promise.all(arrPromise).then(arr => {
                //update background page
                return me.updateBackgroundPage();
            }).then(() => {
                //update option UI
                return me.updateMetaList();
            });

        }

        //UI Button click addNew
        $scope.addNew = (url) => {
            //use addNewUrl

            //For testing the load time
            //beginG = Date.now();

            url = url ? url : me.addNewUrl;
            url = url.endsWith("/") ? url.substr(0, url.length - 1) : url;
            url = !url.startsWith("http") ? `http://${url}` : url;

            me.updateUrl(url, -1).then(res => {
                //update background page

                //For testing the load time
                //window.alert(Date.now() - beginG);

                return me.updateBackgroundPage();
            }).then(() => {
                //update option UI
                return me.updateMetaList();
            });

        }

        //UI Button click update specific one
        $scope.update = (id) => {

            let item = me.MetaList[id];
            let version = item.version;
            let url = item.url;

            //update the url if has latest version
            me.updateUrl(url, version).then(res => {
                //update background page
                return me.updateBackgroundPage();
            }).then(() => {
                //update option UI
                return me.updateMetaList();
            });

        };

        //UI Button click remove specific one
        $scope.delete = (id) => {

            let item = me.MetaList[id];
            let source = item.source;

            //update the url if has latest version
            me.removeViaUrl(source).then(res => {
                //update background page
                return me.updateBackgroundPage();
            }).then(() => {
                //update option UI
                return me.updateMetaList();
            });

        };

        //Last run
        //auto add default url
        if (location.hash == "#install") {

            $scope.addNew("http://malwaredomainstest.opensafebrowsing.com/");
        }

        //auto update
        if (location.hash == "#update") {
            console.log("Do remote update all");
            me.updateMetaList().then(() => {
                $scope.updateAll();
            })
        }



    }]);


})();