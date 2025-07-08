chrome.runtime.onMessage.addListener((msg) => {
    if (msg.command === "get-record") {
        document.getElementById("my-custom-button")?.click();
    }
});

setInterval(() => {
    var btn = document.querySelector('[data-test-id="GET_ADDRESS_FORM"]');
    if (btn) {
        OnClick();
    }

    const target = document.querySelector('section.module.shipping-address.auto-address-container[data-test-id="SHIPPING"]');

    if (!target || document.getElementById("my-custom-button")) {
        return;
    }

    if (target && target.parentNode) {
        const button = document.createElement('button');
        button.textContent = 'Get Shipping Info';
        button.id = "my-custom-button";

        button.onclick = () => {
            OnClick();
        }

        target.insertBefore(button, target.firstChild);
    }
}, 1000);

function OnClick() {
    chrome.runtime.sendMessage(
        { action: "getRecord" },
        (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error sending message:", chrome.runtime.lastError);
            } else {
                console.log("Response from background:", response);

                if (typeof response === "object" && response !== null) {
                    const addressFields = document.querySelector('.address-fields');

                    if (addressFields) {
                        // Fill all <input> fields
                        const inputs = addressFields.querySelectorAll('input[type="text"], input[type="tel"]');

                        inputs.forEach(input => {
                            switch (input.name) {
                                case 'firstName':
                                    input.value = response["firstName"] || "";
                                    break;

                                case 'lastName':
                                    input.value = response["lastName"] || "";
                                    break;
                                case 'addressLine1':
                                    input.value = response["address"] || "";
                                    break;

                                // case 'addressLine2':
                                //     input.value = 'Apt 4B';
                                //     break;

                                case 'city':
                                    input.value = response["city"] || "";
                                    break;

                                case 'postalCode':
                                    input.value = response["zip"] || "";
                                    break;

                                case 'phoneNumber':
                                    input.value = parsePhoneNumber(response["phone"]) || "";
                                    break;

                                default:
                                    input.value = '';
                            }

                            input.dispatchEvent(new Event('input', { bubbles: true }));
                            input.dispatchEvent(new Event('change', { bubbles: true }));
                        });
                    }

                    const stateSelect = document.querySelector('#stateOrProvince');

                    if (stateSelect) {
                        stateSelect.value = response["shortState"] || ""; // South Carolina
                        // Trigger change event in case the page listens to it
                        stateSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            }
        }
    );
}

function parsePhoneNumber(raw) {
    // Remove country code +1 and anything after 'ext' or 'extension'
    let cleaned = raw
        .replace(/^\+1\s*/, '')                  // Remove leading +1
        .replace(/\s*ext\.?\s*\d+$/i, '')        // Remove extension
        .replace(/\D/g, '');                     // Remove all non-digits

    return cleaned;
}
