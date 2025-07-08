chrome.runtime.onMessage.addListener((msg) => {
    if (msg.command === "get-record") {
        document.getElementById("my-custom-button")?.click();
    }
});

setInterval(() => {
    const addressToggle = document.getElementById('addressToggle');

    // Check if the button text is "Enter a new address"
    const isEnterNewAddressSelected = addressToggle && addressToggle.textContent.trim() === "Enter a new address";

    if (!isEnterNewAddressSelected) {
        return;
    }

    // Find the target <legend> element
    const labelEl = document.querySelector('legend.form-legend[data-test="shipping-address-heading"]');

    if (!labelEl || document.getElementById("my-custom-button")) {
        return;
    }

    const button = document.createElement("button");
    button.id = "my-custom-button";
    button.textContent = 'Get Shipping Info';
    button.style.border = "1px solid";

    button.onclick = () => {
        chrome.runtime.sendMessage(
            { action: "getRecord" },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError);
                } else {
                    if (typeof response === "object" && response !== null) {

                        [{ input: "firstNameInput-text", key: "firstName" },
                        { input: "lastNameInput-text", key: "lastName" },
                        { input: "addressLine1Input-text", key: "address" },
                        //  {input: "addressLine2Input-text", key: "address2"},
                        //  {input: "companyInput-text", key: "company"},
                        { input: "cityInput-text", key: "city" },
                        //  {input: "countryCodeInput-select", key: "countryCode"},
                        { input: "postCodeInput-text", key: "zip" },
                        { input: "phoneInput-text", key: "phone" }].forEach(({ input, key }) => {
                            var control = document.querySelector(`input[data-test="${input}"]`);
                            control.value = response[key] || "";

                            control.dispatchEvent(new Event('input', { bubbles: true }));
                            control.dispatchEvent(new Event('change', { bubbles: true }));
                        });

                        [{ input: "provinceCodeInput-select", key: "shortState" }].forEach(({ input, key }) => {
                            var control = document.querySelector(`select[data-test="${input}"]`);
                            control.value = response[key] || "";

                            control.dispatchEvent(new Event('change', { bubbles: true }));
                        });

                        [{ input: "shippingAddress.shouldSaveAddress" }, { input: "sameAsBilling" }].forEach(({ input }) => {
                            var control = document.getElementById(input);
                            control.checked = false;

                            control.dispatchEvent(new Event('change', { bubbles: true }));
                        });
                    }
                }
            }
        );
    };

    labelEl.parentNode.insertBefore(button, labelEl.nextSibling);
}, 1000);
