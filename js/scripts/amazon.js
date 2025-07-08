chrome.runtime.onMessage.addListener((msg) => {
    if (msg.command === "save-record") {
        document.getElementById("my-custom-button")?.click();
    }
});

setInterval(() => {
    const labelEl = document.querySelector('[data-test-id="shipping-section-label"]');

    if (!labelEl || document.getElementById("my-custom-button")) {
        return;
    }

    const button = document.createElement("button");
    button.id = "my-custom-button";
    button.textContent = "Save Shipping Info";

    button.onclick = () => {
        const data = extractShippingInfo();
        if (data) {
            chrome.runtime.sendMessage({ action: "saveRecord", data });
        } else {
            console.error("Shipping info not found on this page.");
        }
    };

    labelEl.parentNode.insertBefore(button, labelEl.nextSibling);
    labelEl.parentNode.insertBefore(document.createElement("br"), labelEl.nextSibling);
}, 1000);

function extractShippingInfo() {
    const STATES = {
        AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
        CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
        FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
        IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
        KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
        MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
        MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
        NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
        NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
        OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
        SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
        VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
        WI: "Wisconsin", WY: "Wyoming"
    };

    const getText = (selector) => document.querySelector(selector)?.textContent.trim() || null;
    const getFullState = (abbr) => STATES[abbr?.toUpperCase()] || abbr || null;
    const splitName = (full) => {
        const parts = full?.trim().split(/\s+/) || [];
        return {
            firstName: parts[0] || null,
            lastName: parts.length > 1 ? parts.slice(1).join(" ") : null
        };
    };

    try {
        const addressSpans = document.querySelectorAll('[data-test-id="shipping-section-buyer-address"] span');
        if (!addressSpans.length) {
            return null;
        }

        const parts = Array.from(addressSpans).map(el => el.textContent.trim()).filter(Boolean);
        const [fullName, address, cityRaw, stateAbbr, zip] = parts;

        const city = cityRaw?.replace(",", "").trim() || null;
        const state = getFullState(stateAbbr);
        const { firstName, lastName } = splitName(fullName);

        const phone = getText('[data-test-id="shipping-section-phone"]');

        return {
            url: location.href,
            fullName: fullName || null,
            firstName,
            lastName,
            address: address || null,
            city,
            state,
            shortState: stateAbbr || null,
            zip: zip || null,
            phone: phone,
            order: getText('[data-test-id="order-id-value"]'),
            asin: getText('.product-name-column-word-wrap-break-all b'),
            raw: Array.from(addressSpans)
                .map(span => span.innerHTML)
                .join('') + `<br>${phone}` || null,
        };
    } catch (err) {
        console.error("Extraction failed:", err);
        return null;
    }
}
