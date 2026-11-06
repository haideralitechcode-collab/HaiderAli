document.addEventListener("DOMContentLoaded", function () {
    const moreDetails = document.querySelectorAll(".more-details");
    const smallPopup = document.getElementById("small-modal");

    const popup = document.getElementById("modal");
    const popupImage = document.querySelector(".largePopupImage img");
    const popupTitle = document.getElementById("popup-product-title");
    const popupPrice = document.getElementById("popup-product-price");
    const popupDescription = document.getElementById("popup-product-description");
    const popupSizes = document.getElementById("popup-sizes");
    const popupColors = document.getElementById("popup-colors");
    const addToCartButton = document.getElementById("add-to-cart-btn");
    let product;
    let imageUrl;
    var arrowImageUrl = "https://cdn.shopify.com/s/files/1/0584/9861/3345/files/down-arrow.png?v=1749734307";

    function optionLabel(value) {
        if (value == null) return "";
        if (typeof value === "string" || typeof value === "number") return String(value).trim();
        if (typeof value === "object") {
            return String(value.name || value.value || value.label || value.title || "").trim();
        }
        return String(value).trim();
    }

    function normalizeOptionText(value) {
        const label = optionLabel(value);
        if (!label || label === "[object Object]") return "";
        return label;
    }

    moreDetails.forEach((button) => {
        button.addEventListener("click", async (e) => {
            e.preventDefault();
            const productHandle = button.dataset.productHandle;
            const buttonImage = button.querySelector("img");

            if (button.classList.contains("active")) {
                buttonImage.src = "https://cdn.shopify.com/s/files/1/0584/9861/3345/files/plus-icon.png?v=1749734409";
                button.classList.remove("active");
                return;
            }

            // Close any open popup
            document.querySelectorAll(".more-details.active").forEach((activeButton) => {
                activeButton.classList.remove("active");
                activeButton.querySelector("img").src = "https://cdn.shopify.com/s/files/1/0584/9861/3345/files/plus-icon.png?v=1749734409";
            });

            try {
                const response = await fetch(`/products/${productHandle}.js`);
                product = await response.json();
                imageUrl = product.images[0];

                // Set main modal content directly
                popupImage.src = imageUrl;
                popupImage.alt = product.title;
                popupTitle.textContent = product.title;
                popupPrice.textContent = `$${(product.price / 100).toFixed(2)}`;
                popupDescription.innerHTML = product.description;

                // Handle sizes dropdown
                const sizes = product.variants.filter((variant) => normalizeOptionText(variant.option1));
                const uniqueSizes = Array.from(
                    new Map(sizes.map((size) => [normalizeOptionText(size.option1), size])).values()
                );

                if (uniqueSizes.length > 0) {
                    const dropdownWrapper = document.createElement("div");
                    dropdownWrapper.classList.add("custom-dropdown");

                    const label = document.createElement("label");
                    label.classList.add("label");
                    label.textContent = "Size";
                    dropdownWrapper.appendChild(label);

                    const dropdownButton = document.createElement("button");
                    dropdownButton.type = "button";
                    dropdownButton.classList.add("dropdown-button");

                    const arrowIcon = document.createElement("span");
                    arrowIcon.classList.add("arrow-icon");
                    const arrow = document.createElement("img");
                    arrow.src = arrowImageUrl;
                    arrow.alt = "Arrow down";
                    arrow.classList.add("arrow");

                    const btnText = document.createElement("span");
                    btnText.classList.add("btn-text");
                    btnText.textContent = "Choose your size";
                    arrowIcon.appendChild(arrow);
                    dropdownButton.appendChild(btnText);
                    dropdownButton.appendChild(arrowIcon);
                    dropdownWrapper.appendChild(dropdownButton);

                    // Create the dropdown list
                    const dropdownList = document.createElement("ul");
                    dropdownList.classList.add("dropdown-list");
                    uniqueSizes.forEach((size) => {
                        const sizeText = normalizeOptionText(size.option1);
                        const listItem = document.createElement("li");
                        listItem.classList.add("dropdown-item");
                        listItem.dataset.value = size.id;
                        listItem.dataset.optionValue = sizeText;
                        listItem.textContent = sizeText;
                        dropdownList.appendChild(listItem);
                    });
                    dropdownWrapper.appendChild(dropdownList);

                    dropdownButton.addEventListener("click", () => {
                        dropdownList.classList.toggle("show");
                        arrow.classList.toggle("rotate");
                    });

                    // Handle item selection
                    dropdownList.addEventListener("click", (e) => {
                        if (e.target.classList.contains("dropdown-item")) {
                            const sizeText = e.target.dataset.optionValue || normalizeOptionText(e.target.textContent);
                            btnText.textContent = sizeText;
                            dropdownButton.dataset.value = e.target.dataset.value;
                            dropdownButton.dataset.optionValue = sizeText;
                            dropdownList.classList.remove("show");
                            arrow.classList.remove("rotate");
                        }
                    });

                    // Close the dropdown if clicked outside
                    document.addEventListener("click", (e) => {
                        if (!dropdownWrapper.contains(e.target)) {
                            dropdownList.classList.remove("show");
                            arrow.classList.remove("rotate");
                        }
                    });

                    popupSizes.innerHTML = ""; // Clear any previous content
                    popupSizes.appendChild(dropdownWrapper);
                } else {
                    popupSizes.innerHTML = "<p>No sizes available.</p>";
                }

                // Handle colors
                const colors = product.variants.filter((variant) => normalizeOptionText(variant.option2));
                const uniqueColors = Array.from(
                    new Map(colors.map((color) => [normalizeOptionText(color.option2), color])).values()
                );

                popupColors.innerHTML = "";
                const colorsWrapper = document.createElement("div");
                colorsWrapper.classList.add("colors-wrapper");

                const label = document.createElement("label");
                label.classList.add("label");
                label.textContent = "Color";
                colorsWrapper.appendChild(label);
                popupColors.appendChild(colorsWrapper);
                const btnItems = document.createElement("div");
                btnItems.classList.add("btn-items");

                uniqueColors.forEach((color) => {
                    const colorText = normalizeOptionText(color.option2);
                    const colorButton = document.createElement("button");
                    colorButton.type = "button";
                    colorButton.classList.add("color-button");
                    colorButton.classList.add(colorText.replace(/\s+/g, "-"));
                    colorButton.textContent = colorText;
                    colorButton.dataset.colorId = color.id;
                    colorButton.dataset.optionValue = colorText;
                    if (colorText.toLowerCase() !== "white") {
                        colorButton.style.borderLeft = `5px solid ${colorText}`;
                    }

                    colorButton.addEventListener("click", () => {
                        selectedColor = color.id;

                        document.querySelectorAll(".color-button").forEach((btn) => {
                            btn.classList.remove("active");
                        });

                        colorButton.classList.add("active");
                    });

                    btnItems.appendChild(colorButton);
                    popupColors.appendChild(btnItems);
                });

                if (uniqueColors.length === 0) {
                    popupColors.innerHTML = "<p>No colors available.</p>";
                }

                // Show main modal
                popup.classList.add("show-modal");
                buttonImage.src = "https://cdn.shopify.com/s/files/1/0584/9861/3345/files/cross-icon.png?v=1749734409";
                button.classList.add("active");
            } catch (error) {
                console.error("Error fetching product data:", error);
            }
        });
    });

    function closeQuickViewPopup() {
        if (popup) popup.classList.remove("show-modal");

        document.querySelectorAll(".more-details").forEach((button) => {
            const buttonImage = button.querySelector("img");
            if (buttonImage) {
                buttonImage.src = "https://cdn.shopify.com/s/files/1/0584/9861/3345/files/plus-icon.png?v=1749734409";
            }
            button.classList.remove("active");
        });
    }

    document.querySelector(".close-button").addEventListener("click", (e) => {
        e.preventDefault();
        closeQuickViewPopup();
    });

    const CART_SECTIONS = ["cart-drawer", "cart-icon-bubble"];
    const SOFT_WINTER_HANDLES = ["dark-winter-jacket", "soft-winter-jacket"];
    const SOFT_WINTER_FALLBACK_VARIANT_ID = 42232710266977;

    function getCartDrawer() {
        return document.querySelector("cart-drawer");
    }

    function getCartSectionsParam(cartDrawer) {
        if (cartDrawer && typeof cartDrawer.getSectionsToRender === "function") {
            return cartDrawer.getSectionsToRender().map((section) => section.id).join(",");
        }
        return CART_SECTIONS.join(",");
    }

    async function addVariantToCart(variantId, { withSections = false, cartDrawer = null } = {}) {
        const payload = {
            id: variantId,
            quantity: 1,
        };

        if (withSections) {
            payload.sections = getCartSectionsParam(cartDrawer);
            payload.sections_url = window.location.pathname;
        }

        const response = await fetch("/cart/add.js", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const message =
                (data && (data.description || data.message)) ||
                "Unable to add item to cart.";
            throw new Error(message);
        }

        return data;
    }

    async function resolveSoftWinterVariantId() {
        for (const handle of SOFT_WINTER_HANDLES) {
            try {
                const response = await fetch(`/products/${handle}.js`);
                if (!response.ok) continue;

                const jacket = await response.json();
                const availableVariant =
                    (jacket.variants || []).find((variant) => variant.available) ||
                    (jacket.variants || [])[0];

                if (availableVariant && availableVariant.id) {
                    return availableVariant.id;
                }
            } catch (error) {
                console.warn(`Soft Winter jacket lookup failed for ${handle}:`, error);
            }
        }

        return SOFT_WINTER_FALLBACK_VARIANT_ID;
    }

    function isMediumSize(sizeText) {
        const normalized = (sizeText || "").trim().toLowerCase();
        return normalized === "m" || normalized === "medium";
    }

    async function openCartDrawer(parsedState) {
        const cartDrawer = getCartDrawer();

        if (!cartDrawer) {
            console.warn("cart-drawer not found; skipping drawer open.");
            return;
        }

        if (cartDrawer.classList.contains("is-empty")) {
            cartDrawer.classList.remove("is-empty");
        }

        if (parsedState && parsedState.sections && typeof cartDrawer.renderContents === "function") {
            cartDrawer.setActiveElement(document.activeElement);
            cartDrawer.renderContents(parsedState);
            return;
        }

        if (typeof cartDrawer.open === "function") {
            cartDrawer.open(document.activeElement);
        }
    }

    addToCartButton.addEventListener("click", async () => {
        const dropdownButton = document.querySelector(".dropdown-button");
        const selectedSizeText = normalizeOptionText(
            dropdownButton?.dataset.optionValue ||
                document.querySelector(".dropdown-button .btn-text")?.textContent
        );
        const selectedColorButton = document.querySelector(".color-button.active");

        if (!selectedColorButton) {
            alert("Please select a color.");
            return;
        }

        if (!selectedSizeText || selectedSizeText === "Choose your size") {
            alert("Please select a size.");
            return;
        }

        const selectedColorText = normalizeOptionText(
            selectedColorButton.dataset.optionValue || selectedColorButton.textContent
        );

        if (!selectedColorText) {
            alert("Please select a color.");
            return;
        }

        // Find the correct variant based on size and color
        const selectedVariant = product.variants.find((variant) => {
            const sizeMatch = normalizeOptionText(variant.option1) === selectedSizeText;
            const colorMatch = normalizeOptionText(variant.option2) === selectedColorText;
            return sizeMatch && colorMatch;
        });

        if (!selectedVariant) {
            alert("The selected variant is not available.");
            return;
        }

        const cartDrawer = getCartDrawer();

        try {
            let cartResponse = await addVariantToCart(selectedVariant.id, {
                withSections: true,
                cartDrawer,
            });

            const shouldAddSoftWinter =
                isMediumSize(selectedSizeText) && selectedColorText.toLowerCase() === "black";

            if (shouldAddSoftWinter) {
                try {
                    const softWinterVariantId = await resolveSoftWinterVariantId();
                    const softWinterResponse = await addVariantToCart(softWinterVariantId, {
                        withSections: true,
                        cartDrawer,
                    });
                    if (softWinterResponse && softWinterResponse.sections) {
                        cartResponse = softWinterResponse;
                    }
                } catch (softWinterError) {
                    console.warn("Soft Winter jacket auto-add failed:", softWinterError);
                }
            }

            closeQuickViewPopup();
            if (typeof window.updateHorizonCartBubble === 'function') {
                try {
                    const cart = await fetch('/cart.js').then((r) => r.json());
                    window.updateHorizonCartBubble(cart.item_count);
                } catch (e) {
                    /* ignore bubble sync errors */
                }
            }
            await openCartDrawer(cartResponse);
        } catch (error) {
            console.error("Error adding item to cart:", error);
            alert(`Error adding item to cart: ${error.message || error}`);
        }
    });
});