chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.setOptions({
        tabId: tab.id,
        path: "../../html/sidePanel.html",
        enabled: true
    }, () => {
        chrome.sidePanel.open({ tabId: tab.id });
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "saveRecord") {
        chrome.storage.local.set({ savedRecord: message.data }, () => {
            chrome.runtime.sendMessage({ type: "refreshSidebar" });
        });
    }

    if (message.action === "getRecord") {
        chrome.storage.local.get({ savedRecord: null }, (data) => {
            sendResponse(data.savedRecord);
        });
    }

    return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        [
            {
                url: "sellercentral.amazon.com",
                script: "./js/scripts/amazon.js"
            },
            {
                url: "mccombssupply.com",
                script: "./js/scripts/mccombssupply.js"
            },
            {
                url: "pay.ebay.com",
                script: "./js/scripts/ebay.js"
            }
        ].forEach(site => {
            if (tab?.url?.includes(site.url)) {
                console.log(`${site.url} content Script injection`);

                chrome.scripting.executeScript({
                    target: { tabId },
                    files: [site.script]
                }).catch(err => {
                    console.error(`${site.url} content Script injection failed:`, err);
                });
            }
        });
    }
});
