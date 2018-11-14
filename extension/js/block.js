//Init hide detail
var isShowDetail = false;
var showDetailText = "DETAILS";
var hideDetailText = "HIDE DETAILS";
var MetaObj;

var callBackgroundPage = (method, data) => {

    return new Promise(resolve => {
        chrome.runtime.sendMessage({ method: method, data: data }, (res) => {
            resolve(res);
        });
    });

};

document.getElementById('details').style.display = "none";
document.getElementById('showDetail').innerText = showDetailText;

//Callback Detail
function onDetail() {

    if (isShowDetail) {
        document.getElementById('details').style.display = "none";
        document.getElementById('showDetail').innerText = showDetailText;
        isShowDetail = false;
    }
    else {
        document.getElementById('details').style.display = "block";
        document.getElementById('showDetail').innerText = hideDetailText;
        isShowDetail = true;
    }

}

document.getElementById('showDetail').addEventListener('click', () => {
    onDetail();
});

document.getElementById('backToSafe').addEventListener('click', () => {
    history.go(-2);
});

document.getElementById('stillvisit').addEventListener('click', () => {
    callBackgroundPage("addWhitelist", {
        url: MetaObj.url
    }).then(() => {
        history.go(-1);
    });
});

//get params from URL
(() => {

    let url = location.search;

    if (url) {

        let str = atob(url.substr(1));
        let obj = JSON.parse(str);

        /*
            obj = {
                url: "cn126.com",
                type: 0=>Phishing,
                source: "PhishTank"
            };
        */

        document.getElementById('maliciousUrlContent').innerText = obj.url;

        if (obj["type"]) {
            document.getElementById('withtype').style.display = "block";
            document.getElementById('typeInfo').innerText = obj.type;
        }
        if (obj["source"]) {
            document.getElementById('withsource').style.display = "block";
            document.getElementById('providedInfo').innerText = obj.source;
        }

        MetaObj = obj;

    }

})();