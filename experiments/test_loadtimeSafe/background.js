g_diffTime = -1;

chrome.webNavigation.onBeforeNavigate.addListener(
    function (details) {
        g_diffTime = Date.now();
        //console.log("before navigation: " + tmp);
    }
);

chrome.tabs.onUpdated.addListener((tabid, changeInfo, tab) => {
    // console.log(tabid);
    // console.log(changeInfo);
    if(tab.status=="complete"){
        console.log(Date.now()-g_diffTime);
        console.log(tab);
    }

});

// chrome.webNavigation.onCommitted.addListener(
//     function (details) {
//         var tmp = Date.now();
//         console.log("committed: " + tmp);
//     }
// );

// chrome.webNavigation.onCompleted.addListener(
//     function (details) {
//         var tmp = Date.now();
//         console.log("completed: " + tmp);
//     }
// );

// chrome.browserAction.onClicked.addListener(function (tab) {
//     console.log(tab);
// });
