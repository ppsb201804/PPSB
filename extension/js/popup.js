
var callBackgroundPage = (method, data) => {

    return new Promise(resolve => {
        chrome.runtime.sendMessage({ method: method, data: data }, (res) => {
            resolve(res);
        });
    });

};

var processBlockHistory = (arrblockHistory) => {

    arrblockHistory.forEach((val, index, arr) => {

        //process url
        let url = val.url;
        url = url.endsWith("/") ? url.substr(0, url.length - 1) : url;
        url = url.length > 55 ? url.substr(0, 55) + "....." : url;

        arr[index].url = url;

    });

    console.log(arrblockHistory);

    //return the latest 6
    return arrblockHistory.slice(-6);

};



//Controller
function PopupCtrl($scope, $window) {

    $scope.items = [];

    $scope.protect = true;

    let me = this;

    /*
    {
        url:,
        type:,
        source:
    }
    */

    this.initPage = () => {

        callBackgroundPage("getBlockHistory").then(val => {
            $scope.$apply(function () {
                $scope.items = processBlockHistory(val);
            });
        });

        callBackgroundPage("checkProtect").then(val => {
            $scope.$apply(function () {
                $scope.protect = val;
            });
        });

    }

    $scope.init = () => {

        me.initPage();

    };

    $scope.stop = () => {

        $scope.protect = false;
        callBackgroundPage("stopProtect");

    };

    $scope.start = () => {

        $scope.protect = true;
        callBackgroundPage("startProtect");

    };

    $scope.clear = () => {
        callBackgroundPage("clearBlockHistory").then(() => {
            me.initPage();
        })
    };

    $scope.feedback = () => {
        chrome.tabs.create({ 'url': "https://goo.gl/forms/0I2KZX88cRv6AgJA3" });
    };

};


var app = angular.module('SafeBrowsingPopup', []);
app.controller('PopupCtrl', ['$scope', '$window', PopupCtrl]);