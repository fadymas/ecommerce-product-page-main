


/** Set aria-expanded with boolean value. */
function setAriaExpanded(el, expanded) {
    if (!el) return;
    el.setAttribute("aria-expanded", expanded ? "true" : "false");
}

/** Set aria-hidden with boolean value. */
function setAriaHidden(el, hidden) {
    if (!el) return;
    el.setAttribute("aria-hidden", hidden ? "true" : "false");
}

/** Shortcut helpers */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ============================
// Menu Logic (open/close primary navigation)
// ============================
// Elements
const openMenuButton = $("#open-menu");
const closeMenuButton = $("#close-menu");
const navMenuEl = $("#nav-menu");
const menuOverlayEl = $(".menu-overlay");
const mainContentEl = $("main");
// Everything in the header except the nav container itself and its internals
const headerContentEls = $$(
    "header :not(nav,ul,li,li a,img,#close-menu,.header__brand-nav)"
);

/** Close the navigation menu if open */
function closeMenu() {
    if (!openMenuButton || !closeMenuButton || !navMenuEl || !menuOverlayEl) return;
    menuOverlayEl.classList.add("hidden");
    navMenuEl.classList.add("hidden");
    setAriaExpanded(openMenuButton, false);
    if (mainContentEl) mainContentEl.inert = false;
    headerContentEls.forEach((el) => {
        el.inert = false;
    });
    openMenuButton.focus();
}

/** Open the navigation menu */
function openMenu() {
    if (!openMenuButton || !closeMenuButton || !navMenuEl || !menuOverlayEl) return;
    menuOverlayEl.classList.remove("hidden");
    navMenuEl.classList.remove("hidden");
    setAriaExpanded(openMenuButton, true);
    if (mainContentEl) mainContentEl.inert = true;
    headerContentEls.forEach((el) => {
        el.inert = true;
    });
    // Focus the first interactive element (close button)
    closeMenuButton.focus();
}

/** Toggle menu */
function onMenuToggle() {
    if (navMenuEl && navMenuEl.classList.contains("hidden")) openMenu();
    else closeMenu();
}

// Event bindings (guarded)
if (openMenuButton) openMenuButton.addEventListener("click", onMenuToggle);
if (closeMenuButton) closeMenuButton.addEventListener("click", onMenuToggle);
if (menuOverlayEl) menuOverlayEl.addEventListener("click", closeMenu);
// Escape closes menu
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
});

// ============================
// Cart Logic (open/close cart popover)
// ============================
const cartButtonEl = $(".header__profile button");
const cartPopoverEl = $(".cart-popover");

function openCart() {
    if (!cartButtonEl || !cartPopoverEl) return;
    cartPopoverEl.classList.remove("hidden");
    setAriaHidden(cartPopoverEl, false);
    setAriaExpanded(cartButtonEl, true);
}

function closeCart() {
    if (!cartButtonEl || !cartPopoverEl) return;
    cartPopoverEl.classList.add("hidden");
    setAriaHidden(cartPopoverEl, true);
    setAriaExpanded(cartButtonEl, false);
}

function onCartToggle() {
    if (!cartPopoverEl) return;
    if (cartPopoverEl.classList.contains("hidden")) openCart();
    else closeCart();
}

if (cartButtonEl) cartButtonEl.addEventListener("click", onCartToggle);
// Click outside closes cart
document.addEventListener("click", (e) => {
    if (!cartPopoverEl || !cartButtonEl) return;
    const target = e.target;
    if (!cartPopoverEl.contains(target) && !cartButtonEl.contains(target)) {
        closeCart();
    }
});
// Escape closes cart
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCart();
});

// ============================
// Images Logic (carousel, thumbnails, dialog)
// ============================
const PRODUCT_MEDIA = [
    { src: "./images/image-product-1.jpg", alt: "Brown and off-white sneakers — front view" },
    { src: "./images/image-product-2.jpg", alt: "Brown and off-white sneakers — back view on rocks" },
    { src: "./images/image-product-3.jpg", alt: "Brown and off-white sneakers — right view on rocks" },
    { src: "./images/image-product-4.jpg", alt: "Brown and off-white sneakers — left view on rocks" },
];

// Elements
const mainImageEls = $$(".product-images__main > img");
const productImageDialogEl = $(".product-images__popover");
const pageThumbnailEls = $$(
    ".product-images > .product-images__thumbnails .product-images__thumbnails__image-wraper"
);
const allThumbnailEls = $$(".product-images__thumbnails__image-wraper");
const dialogThumbnailEls = $$("dialog .product-images__thumbnails__image-wraper");

let currentImageIndex = 0; // 0-based index

// Buttons
const nextImageButtons = $$(".product-images__main__next");
const prevImageButtons = $$(".product-images__main__prev");
const closePopoverButton = $("#close-popover");

const IMAGE_COUNT = PRODUCT_MEDIA.length;

/** Normalize any integer to [0, IMAGE_COUNT) */
function normalizeIndex(i) {
    return ((i % IMAGE_COUNT) + IMAGE_COUNT) % IMAGE_COUNT;
}

/** Update all main images to the given index */
function updateMainImages(index) {
    const media = PRODUCT_MEDIA[normalizeIndex(index)];
    mainImageEls.forEach((img) => {
        img.src = media.src;
        img.alt = media.alt;
    });
}

/** Remove active class from all thumbnails */
function clearActiveThumbnails() {
    allThumbnailEls.forEach((thumbnail) => {
        const img = thumbnail.querySelector("img");
        if (img) img.classList.remove("product-images__thumbnail__image--active");
    });
}

/** Add active class to thumbnails for index */
function setActiveThumbnails(index) {
    [pageThumbnailEls, dialogThumbnailEls].forEach((group) => {
        if (group && group[index]) {
            const img = group[index].querySelector("img");
            if (img) img.classList.add("product-images__thumbnail__image--active");
        }
    });
}

/** Update index + UI */
function setCurrentImage(index) {
    currentImageIndex = normalizeIndex(index);
    updateMainImages(currentImageIndex);
    clearActiveThumbnails();
    setActiveThumbnails(currentImageIndex);
}

/** Next/Prev handlers */
function onImageSwipe(event) {
    const isNext = !!(event.currentTarget && event.currentTarget.classList && event.currentTarget.classList.contains("product-images__main__next"));
    setCurrentImage(currentImageIndex + (isNext ? 1 : -1));
}

/** Thumbnail activation */
function onThumbnailActivate(event) {
    if (event && typeof event.preventDefault === "function") event.preventDefault();
    const container = event.currentTarget;
    let index = allThumbnailEls.indexOf ? allThumbnailEls.indexOf(container) : allThumbnailEls.findIndex((el) => el === container);
    if (index === -1) return;
    index = index % IMAGE_COUNT; // Map dialog thumbnails to 0-3
    setCurrentImage(index);
}

// Bind navigation
nextImageButtons.forEach((btn) => btn.addEventListener("click", onImageSwipe));
prevImageButtons.forEach((btn) => btn.addEventListener("click", onImageSwipe));

// Dialog helpers
function openProductDialog() {
    if (!productImageDialogEl) return;
    // For <dialog>, use attribute presence to control open state
    productImageDialogEl.setAttribute("open", "");
    setAriaExpanded(mainImageEls[0], true);
}

function closeProductDialog() {
    if (!productImageDialogEl) return;
    productImageDialogEl.removeAttribute("open");
    setAriaExpanded(mainImageEls[0], false);
}

// Dialog close button
if (closePopoverButton) {
    closePopoverButton.addEventListener("click", closeProductDialog);

    // Simple focus trap between close button and the last thumbnail in dialog
    closePopoverButton.addEventListener("keydown", (event) => {
        if (event.key === "Tab" && event.shiftKey) {
            event.preventDefault();
            const lastThumb = dialogThumbnailEls[dialogThumbnailEls.length - 1];
            if (lastThumb) lastThumb.focus();
        }
    });
}

const lastDialogThumb = dialogThumbnailEls[dialogThumbnailEls.length - 1];
if (lastDialogThumb) {
    lastDialogThumb.addEventListener("keydown", (event) => {
        if (event.key === "Tab" && !event.shiftKey) {
            event.preventDefault();
            if (closePopoverButton) closePopoverButton.focus();
        }
    });
}

// Keyboard support for dialog (Escape to close, arrows to navigate)
document.addEventListener("keydown", (e) => {
    const isDialogOpen = !!(productImageDialogEl && productImageDialogEl.hasAttribute("open"));
    if (!isDialogOpen) return;
    if (e.key === "Escape") {
        closeProductDialog();
    } else if (e.key === "ArrowRight") {
        setCurrentImage(currentImageIndex + 1);
    } else if (e.key === "ArrowLeft") {
        setCurrentImage(currentImageIndex - 1);
    }
});

// Thumbnails bindings + keyboard operability
allThumbnailEls.forEach((thumbnail) => {
    if (!thumbnail.hasAttribute("tabindex")) thumbnail.setAttribute("tabindex", "0");
    if (!thumbnail.hasAttribute("role")) thumbnail.setAttribute("role", "button");
    thumbnail.addEventListener("click", onThumbnailActivate);
    thumbnail.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onThumbnailActivate(e);
        }
    });
});

// Initialize default image
setCurrentImage(0);

// Desktop-only: clicking/pressing Enter on main image opens dialog
if (window.innerWidth >= 1024 && mainImageEls[0]) {
    const mainImage = mainImageEls[0];
    mainImage.setAttribute("tabindex", "0");
    mainImage.addEventListener("click", openProductDialog);
    mainImage.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openProductDialog();
        }
    });
}
// ============================
// End Images Logic
// ============================

// ============================
// Quantity Logic
// ============================
const decreaseQuantityButton = $("#decrease-quantity");
const increaseQuantityButton = $("#increase-quantity");
const quantityString = $("#quantity-string");

function handleQuantityClicks(event) {
    if (!quantityString) return;
    let quantityData = parseInt(quantityString.dataset.quantity || "0", 10);
    if (event.currentTarget === decreaseQuantityButton && quantityData > 0) {
        quantityData -= 1;
    } else if (event.currentTarget === increaseQuantityButton) {
        quantityData += 1;
    }
    quantityString.textContent = String(quantityData);
    quantityString.dataset.quantity = String(quantityData);
}

if (decreaseQuantityButton)
    decreaseQuantityButton.addEventListener("click", handleQuantityClicks);
if (increaseQuantityButton)
    increaseQuantityButton.addEventListener("click", handleQuantityClicks);

// ============================
// Cart Add/Remove Logic
// ============================
const emptyCartText = $(".empty-cart");
const cartItems = $(".cart-popover__items");
const calculatePurchaseEl = $(".item__info p");
const addToCartButton = $("#add-to-cart");
const removeFromCartButton = $("#remove-item");

function addToCart() {
    if (!addToCartButton || !quantityString || !emptyCartText || !cartItems || !cartButtonEl || !calculatePurchaseEl) return;
    const quantityData = parseInt(quantityString.dataset.quantity || "0", 10);
    // Price from DOM (e.g., "$125.00")
    const priceText = ($(".last-price strong")?.textContent || "").trim();
    const itemPrice = parseFloat(priceText.replace(/[^\d.]/g, "")) || 0;

    if (quantityData > 0) {
        calculatePurchaseEl.innerHTML = `$${itemPrice.toFixed(2)} x ${quantityData} <output class="ml-1.75 font-bold">$${(quantityData * itemPrice).toFixed(2)}</output>`;
        emptyCartText.classList.add("hidden");
        cartItems.classList.remove("hidden");
        cartItems.classList.add("flex");
        // Badge quantity
        cartButtonEl.dataset.quantity = String(quantityData);
        cartButtonEl.classList.remove("after:hidden");
    } else {
        cartItems.classList.add("hidden");
        cartItems.classList.remove("flex");
        cartButtonEl.dataset.quantity = "0";
        cartButtonEl.classList.add("after:hidden");
    }
}

function removeFromCart() {
    if (!emptyCartText || !cartItems || !cartButtonEl) return;
    emptyCartText.classList.remove("hidden");
    cartItems.classList.add("hidden");
    cartItems.classList.remove("flex");
    cartButtonEl.dataset.quantity = "0";
    cartButtonEl.classList.add("after:hidden");
}

if (addToCartButton) addToCartButton.addEventListener("click", addToCart);
if (removeFromCartButton) removeFromCartButton.addEventListener("click", removeFromCart);

// ============================
// End Quantity & Cart Logic
// ============================
