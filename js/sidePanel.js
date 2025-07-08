chrome.storage.local.get({ savedRecord: null }, (data) => {
    renderRecord(data.savedRecord);
});

function renderRecord(record) {
    console.log("Record loaded:", record);

    clear();

    if (!record) {
        return;
    }

    ["url", "order", "asin", "fullName", "firstName", "lastName", "address", "city", "state", "zip", "phone", "raw"].forEach(key => {
        var element = document.getElementById(key + "Span");

        const value = record[key] || "N/A";

        if (key === "url") {
            const a = document.createElement("a");
            a.href = value;
            a.textContent = value;
            a.target = "_blank";

            element.textContent = "";

            element.appendChild(a);
        } else if (key === "raw") {
            element.innerHTML = value;
        } else {
            element.textContent = value;
        }

        // Create a copy button for each field
        if (key === "raw") {
            return; // Skip raw field for copy button
        }

        const td = document.createElement("td");
        td.style = "text-align: center;";
        td.className = "copy-td";

        const copyButton = document.createElement("button");
        copyButton.textContent = "Copy";
        copyButton.className = "copy-btn";
        copyButton.title = `Copy ${value}`;
        copyButton.addEventListener("click", () => {
            navigator.clipboard.writeText(value);
        });

        td.appendChild(copyButton);

        element.parentElement.parentElement.append(td);
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "refreshSidebar") {
        chrome.storage.local.get({ savedRecord: null }, (data) => {
            renderRecord(data.savedRecord);
        });
    }
});

document.getElementById("clearBtn").addEventListener("click", () => {
    chrome.storage.local.set({ savedRecord: null }, () => {
        renderRecord(null);
        chrome.action.setBadgeText({ text: "" });
    });
});

function clear() {
    document.querySelectorAll('.copy-td').forEach(el => el.remove());

    ["url", "order", "asin", "fullName", "firstName", "lastName", "address", "city", "state", "zip", "phone", "raw"].forEach(key => {
        var element = document.getElementById(key + "Span");

        element.textContent = "N/A";
    });
}
