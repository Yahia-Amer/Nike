window.NikeApp = window.NikeApp || {};

NikeApp.initCart = function initCart() {
  const { parsePrice, formatPrice, getItemImage, getItemTitle, getItemPrice } = NikeApp;
  const CART_GUEST_KEY = "nike_cart";
  const CART_USER_PREFIX = "nike_cart_";

  function getCartStorageKey() {
    try {
      const raw = localStorage.getItem("nike_session");
      if (raw) {
        const sess = JSON.parse(raw);
        if (sess && sess.username) {
          return CART_USER_PREFIX + sess.username.toLowerCase();
        }
      }
    } catch (err) {}
    return CART_GUEST_KEY;
  }

  let cartData = loadCartFromStorage();

  function loadCartFromStorage() {
    try {
      const raw = localStorage.getItem(getCartStorageKey());
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function saveCartToStorage() {
    try {
      localStorage.setItem(getCartStorageKey(), JSON.stringify(cartData));
    } catch (err) {}
  }

  NikeApp.getCartData = function () {
    return JSON.parse(JSON.stringify(cartData));
  };

  function mergeGuestCartIntoUser() {
    const userKey = getCartStorageKey();
    if (userKey === CART_GUEST_KEY) return;
    try {
      const rawGuest = localStorage.getItem(CART_GUEST_KEY);
      const guestItems = rawGuest ? JSON.parse(rawGuest) : [];
      if (!Array.isArray(guestItems) || guestItems.length === 0) return;

      const rawUser = localStorage.getItem(userKey);
      const parsedUser = rawUser ? JSON.parse(rawUser) : [];
      const merged = Array.isArray(parsedUser) ? parsedUser : [];

      guestItems.forEach(function (g) {
        const existing = merged.find(function (u) {
          return u.id === g.id;
        });
        if (existing) {
          existing.qty =
            (parseInt(existing.qty, 10) || 1) + (parseInt(g.qty, 10) || 1);
        } else {
          merged.push(g);
        }
      });

      localStorage.setItem(userKey, JSON.stringify(merged));
      localStorage.removeItem(CART_GUEST_KEY);
    } catch (err) {}
  }

  NikeApp.reloadUserCart = function reloadUserCart() {
    mergeGuestCartIntoUser();
    reloadCartFromStorage();
  };

  const cartOverlay = document.querySelector(".overlay");
  const cartBox = document.querySelector(".overlay .cart");
  const buyButton = document.querySelector(".overlay .cart .buy");
  const emptyMsgDiv = document.querySelector(".overlay .cart button.x ~ div");
  if (emptyMsgDiv) emptyMsgDiv.classList.add("empty-cart-msg");
  const popupAddCartBtn = document.querySelector(".popup-add-cart");
  const quickViewOverlay = document.querySelector(".quick-view-overlay");
  const xIcon = document.querySelector(".overlay .cart .x");
  const div = cartBox ? cartBox.querySelector("div") : null;
  const funcMenu = document.querySelector(".nav .nav-items .func");

  const cartListEl = document.createElement("div");
  cartListEl.className = "cart-items";

  const cartTotalWrap = document.createElement("div");
  cartTotalWrap.className = "cart-total-wrap";
  cartTotalWrap.innerHTML =
    '<h5>Total:</h5><span class="cart-total-price">0$</span>';
  cartTotalWrap.style.display = "none";

  if (cartBox && buyButton) {
    cartBox.insertBefore(cartListEl, buyButton);
    cartBox.insertBefore(cartTotalWrap, buyButton);
  }

  function openCartOverlay() {
    cartOverlay.classList.toggle("show");
    if (cartBox.classList.contains("no")) {
      buyButton.style.display = "none";
      cartTotalWrap.style.display = "none";
      if (div) div.style.display = "block";
    } else {
      buyButton.style.display = "block";
      cartTotalWrap.style.display = "flex";
      if (div) div.style.display = "none";
    }
  }

  if (xIcon) {
    xIcon.addEventListener("click", function () {
      cartOverlay.classList.toggle("show");
    });
  }

  if (funcMenu) {
    funcMenu.addEventListener("click", function (e) {
      if (e.target.closest(".shop")) openCartOverlay();
    });
  }

  function getSelectedSize(item) {
    const selectedLatest = item.querySelector(".size ul button.select");
    if (selectedLatest) return selectedLatest.textContent.trim();

    const isCurrentPopupItem =
      quickViewOverlay.dataset.currentId === item.dataset.id;
    if (isCurrentPopupItem) {
      const selectedPopup = document.querySelector(".sizes-list button.active");
      if (selectedPopup) return selectedPopup.textContent.trim();
    }

    const firstSize = item.querySelector(".sizes-data span");
    return firstSize ? firstSize.textContent.trim() : "";
  }

  function getSelectedColor(item) {
    const isCurrentPopupItem =
      quickViewOverlay.dataset.currentId === item.dataset.id;
    if (isCurrentPopupItem) {
      const selectedPopup = document.querySelector(".colors-list span.active");
      if (selectedPopup) return selectedPopup.style.background;
    }

    const firstColor = item.querySelector(".colors-data span");
    return firstColor ? firstColor.dataset.color : "";
  }

  function getItemQty(item) {
    const isCurrentPopupItem =
      quickViewOverlay.classList.contains("show") &&
      quickViewOverlay.dataset.currentId === item.dataset.id;

    const qtyEl = isCurrentPopupItem
      ? quickViewOverlay.querySelector(".qty-control-popup .qty-value")
      : item.querySelector(".qty-control .qty-value");

    if (!qtyEl) return 1;
    const val = parseInt(qtyEl.textContent, 10);
    return isNaN(val) || val < 1 ? 1 : val;
  }

  function resetItemQty(item) {
    const qtyVal = item.querySelector(".qty-control .qty-value");
    const qtyMinus = item.querySelector(".qty-control .qty-minus");
    if (qtyVal) qtyVal.textContent = "1";
    if (qtyMinus) qtyMinus.disabled = true;
  }

  function resetPopupQty() {
    const qtyVal = quickViewOverlay.querySelector(
      ".qty-control-popup .qty-value"
    );
    const qtyMinus = quickViewOverlay.querySelector(
      ".qty-control-popup .qty-minus"
    );
    if (qtyVal) qtyVal.textContent = "1";
    if (qtyMinus) qtyMinus.disabled = true;
  }

  function isInCart(id) {
    return cartData.some((entry) => entry.id === id);
  }

  function addToCart(item) {
    const id = item.dataset.id;
    const qty = getItemQty(item);

    if (isInCart(id)) {
      increaseQtyInCart(id, qty);
      return;
    }

    cartData.push({
      id,
      title: getItemTitle(item),
      price: getItemPrice(item),
      image: getItemImage(item),
      size: getSelectedSize(item),
      color: getSelectedColor(item),
      qty,
    });

    item.classList.add("bought");
    renderCart();
  }

  function removeFromCart(id) {
    cartData = cartData.filter((entry) => entry.id !== id);

    const item = document.querySelector('.item[data-id="' + id + '"]');
    if (item) {
      item.classList.remove("bought");
      resetItemQty(item);
    }

    renderCart();
  }

  function setQtyInCart(id, qty) {
    const clamped = Math.max(1, parseInt(qty, 10) || 1);
    const entry = cartData.find((e) => e.id === id);
    if (!entry) return;
    entry.qty = clamped;
    renderCart();
  }

  function increaseQtyInCart(id, by = 1) {
    const entry = cartData.find((e) => e.id === id);
    if (!entry) return;
    entry.qty = (parseInt(entry.qty, 10) || 1) + Math.max(1, parseInt(by, 10) || 1);
    renderCart();
  }

  function decreaseQtyInCart(id, by = 1) {
    const entry = cartData.find((e) => e.id === id);
    if (!entry) return;
    const next = (parseInt(entry.qty, 10) || 1) - Math.max(1, parseInt(by, 10) || 1);
    if (next <= 0) {
      removeFromCart(id);
      return;
    }
    entry.qty = next;
    renderCart();
  }

  function computeTotal() {
    return cartData.reduce((sum, entry) => {
      const p = parsePrice(entry.price);
      const q = parseInt(entry.qty, 10) || 1;
      return sum + p * q;
    }, 0);
  }

  function syncItemButton(item) {
    const id = item.dataset.id;
    const bought = isInCart(id);

    const cardBtn = item.querySelector(".add-cart");
    if (cardBtn) {
      cardBtn.textContent = bought ? "Remove From cart" : "Add To cart";
      cardBtn.classList.toggle("add", !bought);
      cardBtn.classList.toggle("remove", bought);
    }

    if (
      quickViewOverlay.classList.contains("show") &&
      quickViewOverlay.dataset.currentId === id
    ) {
      popupAddCartBtn.textContent = bought
        ? "Remove From Cart"
        : "Add To Cart";
      popupAddCartBtn.classList.toggle("add", !bought);
      popupAddCartBtn.classList.toggle("remove", bought);
    }
  }

  function syncAllButtons() {
    document.querySelectorAll(".item").forEach(syncItemButton);
  }

  function renderCart() {
    cartListEl.innerHTML = "";

    if (cartData.length === 0) {
      cartBox.classList.add("no");
      cartBox.classList.remove("yes");
      buyButton.style.display = "none";
      cartTotalWrap.style.display = "none";
      if (emptyMsgDiv) emptyMsgDiv.style.display = "block";
      cartListEl.style.display = "none";
    } else {
      cartBox.classList.remove("no");
      cartBox.classList.add("yes");
      buyButton.style.display = "block";
      cartTotalWrap.style.display = "flex";
      if (emptyMsgDiv) emptyMsgDiv.style.display = "none";
      cartListEl.style.display = "grid";

      cartData.forEach((entry) => {
        const priceNum = parsePrice(entry.price);
        const qty = parseInt(entry.qty, 10) || 1;
        const subtotal = priceNum * qty;

        const card = document.createElement("div");
        card.className = "cart-item";

        const img = document.createElement("img");
        img.src = entry.image;
        img.alt = entry.title;
        card.appendChild(img);

        const title = document.createElement("h6");
        title.textContent = entry.title;
        card.appendChild(title);

        const price = document.createElement("p");
        price.className = "cart-item-price";
        price.textContent = entry.price + " each";
        card.appendChild(price);

        if (entry.size) {
          const size = document.createElement("p");
          size.className = "cart-item-size";
          size.textContent = "Size: " + entry.size;
          card.appendChild(size);
        }

        if (entry.color) {
          const colorWrap = document.createElement("p");
          colorWrap.className = "cart-item-color";
          colorWrap.innerHTML =
            'Color: <span style="background:' + entry.color + '"></span>';
          card.appendChild(colorWrap);
        }

        const qtyRow = document.createElement("div");
        qtyRow.className = "cart-qty-control";

        const minusBtn = document.createElement("button");
        minusBtn.type = "button";
        minusBtn.className = "qty-btn qty-minus";
        minusBtn.setAttribute("aria-label", "Decrease");
        minusBtn.innerHTML = '<i class="fa-solid fa-minus"></i>';
        if (qty <= 1) minusBtn.disabled = true;
        minusBtn.addEventListener("click", function () {
          decreaseQtyInCart(entry.id, 1);
        });
        qtyRow.appendChild(minusBtn);

        const qtyVal = document.createElement("span");
        qtyVal.className = "qty-value";
        qtyVal.textContent = String(qty);
        qtyRow.appendChild(qtyVal);

        const plusBtn = document.createElement("button");
        plusBtn.type = "button";
        plusBtn.className = "qty-btn qty-plus";
        plusBtn.setAttribute("aria-label", "Increase");
        plusBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
        plusBtn.addEventListener("click", function () {
          increaseQtyInCart(entry.id, 1);
        });
        qtyRow.appendChild(plusBtn);

        card.appendChild(qtyRow);

        const subtotalEl = document.createElement("p");
        subtotalEl.className = "cart-item-subtotal";
        subtotalEl.textContent = "Subtotal: " + formatPrice(subtotal);
        card.appendChild(subtotalEl);

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "cart-item-remove";
        removeBtn.textContent = "Remove From Cart";
        removeBtn.addEventListener("click", function () {
          removeFromCart(entry.id);
        });
        card.appendChild(removeBtn);

        cartListEl.appendChild(card);
      });

      cartTotalWrap.querySelector(
        ".cart-total-price"
      ).textContent = formatPrice(computeTotal());
    }

    syncAllButtons();
    syncProductCardQtys();
    saveCartToStorage();
    window.dispatchEvent(new CustomEvent("nike-cart-updated"));
  }

  function syncProductCardQtys() {
    document.querySelectorAll('.item[data-id]').forEach(function (card) {
      const id = card.dataset.id;
      const entry = cartData.find((e) => e.id === id);
      const valEl = card.querySelector('.qty-control .qty-value');
      const minusEl = card.querySelector('.qty-control .qty-minus');
      if (!valEl) return;
      const qty = entry ? (parseInt(entry.qty, 10) || 1) : 1;
      valEl.textContent = String(qty);
      if (minusEl) {
        minusEl.disabled = qty <= 1;
      }
    });

    if (quickViewOverlay && quickViewOverlay.classList.contains("show")) {
      const currentId = quickViewOverlay.dataset.currentId;
      if (currentId) {
        const entry = cartData.find((e) => e.id === currentId);
        const valEl = quickViewOverlay.querySelector(".qty-control-popup .qty-value");
        const minusEl = quickViewOverlay.querySelector(".qty-control-popup .qty-minus");
        if (valEl) {
          const qty = entry ? (parseInt(entry.qty, 10) || 1) : 1;
          valEl.textContent = String(qty);
          if (minusEl) minusEl.disabled = qty <= 1;
        }
      }
    }
  }

  function reloadCartFromStorage() {
    const fresh = loadCartFromStorage();
    const changed =
      fresh.length !== cartData.length ||
      fresh.some(function (a) {
        const b = cartData.find((x) => x.id === a.id);
        return !b || (parseInt(b.qty, 10) || 1) !== (parseInt(a.qty, 10) || 1);
      });
    if (!changed) {
      syncProductCardQtys();
      syncAllButtons();
      return;
    }
    cartData = fresh;
    renderCart();
  }

  window.addEventListener("storage", function (e) {
    if (!e || !e.key) return;
    const isRelevant =
      e.key === getCartStorageKey() ||
      e.key === "nike_session" ||
      e.key === CART_GUEST_KEY ||
      e.key.indexOf(CART_USER_PREFIX) === 0;
    if (!isRelevant) return;
    reloadCartFromStorage();
  });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") reloadCartFromStorage();
  });
  window.addEventListener("focus", function () {
    reloadCartFromStorage();
  });
  if (document.visibilityState === "visible") {
    syncProductCardQtys();
  }

  function bindQtyControls(scopeEl) {
    const scope = scopeEl || document;

    scope.querySelectorAll(".qty-plus").forEach((btn) => {
      if (btn.dataset.qtyBound) return;
      btn.dataset.qtyBound = "1";
      btn.addEventListener("click", function () {
        const ctrl = btn.closest(".qty-control");
        if (!ctrl) return;
        const valEl = ctrl.querySelector(".qty-value");
        const minus = ctrl.querySelector(".qty-minus");
        const current = parseInt(valEl.textContent, 10) || 1;
        const next = current + 1;
        valEl.textContent = String(next);
        if (minus && next > 1) minus.disabled = false;
      });
    });

    scope.querySelectorAll(".qty-minus").forEach((btn) => {
      if (btn.dataset.qtyBound) return;
      btn.dataset.qtyBound = "1";
      btn.addEventListener("click", function () {
        const ctrl = btn.closest(".qty-control");
        if (!ctrl) return;
        const valEl = ctrl.querySelector(".qty-value");
        const current = parseInt(valEl.textContent, 10) || 1;
        const next = current - 1;
        if (next < 1) return;
        valEl.textContent = String(next);
        if (next <= 1) btn.disabled = true;
      });
    });
  }

  bindQtyControls(document);
  if (quickViewOverlay) bindQtyControls(quickViewOverlay);

  document.querySelectorAll(".add-cart").forEach((btn) => {
    btn.addEventListener("click", function () {
      const item = btn.closest(".item");
      if (!item) return;

      isInCart(item.dataset.id)
        ? removeFromCart(item.dataset.id)
        : addToCart(item);

      if (!isInCart(item.dataset.id)) {
        resetItemQty(item);
      }
    });
  });

  if (popupAddCartBtn) {
    popupAddCartBtn.addEventListener("click", function () {
      const id = quickViewOverlay.dataset.currentId;
      const item = document.querySelector('.item[data-id="' + id + '"]');
      if (!item) return;

      if (isInCart(id)) {
        removeFromCart(id);
      } else {
        addToCart(item);
        resetPopupQty();
      }
    });
  }

  document.querySelectorAll(".quick-view-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const item = btn.closest(".item");
      if (item) {
        quickViewOverlay.dataset.currentId = item.dataset.id;
        resetPopupQty();
        syncItemButton(item);
      }
    });
  });

  if (buyButton) {
    buyButton.addEventListener("click", function () {
      if (cartData.length === 0) return;
      saveCartToStorage();

      if (!NikeApp.isLoggedIn()) {
        NikeApp.openAuth("register");
        return;
      }

      window.location.href = "checkout.html";
    });
  }

  NikeApp.parseCartPrice = parsePrice;
  NikeApp.formatCartPrice = formatPrice;

  renderCart();
};
