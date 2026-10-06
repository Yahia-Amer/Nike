window.NikeApp = window.NikeApp || {};

NikeApp.initCheckout = function initCheckout() {
  const { parsePrice, formatPrice } = NikeApp;
  const CART_GUEST_KEY = "nike_cart";
  const CART_USER_PREFIX = "nike_cart_";
  const ORDERS_KEY = "nike_orders";
  const SESSION_KEY = "nike_session";
  const FREE_SHIPPING_THRESHOLD = 1000;
  const SHIPPING_FEE = 29;

  const PROMO_CODES = {
    NIKE10: { type: "percent", value: 10, label: "10% off" },
    WELCOME5: { type: "fixed", value: 5, label: "5$ off" },
    SAVE20: { type: "fixed", value: 20, label: "20$ off" },
  };

  function getCurrentSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function getCartStorageKey() {
    const sess = getCurrentSession();
    if (sess && sess.username) {
      return CART_USER_PREFIX + sess.username.toLowerCase();
    }
    return CART_GUEST_KEY;
  }

  const currentUser = getCurrentSession();
  if (!currentUser) {
    try {
      sessionStorage.setItem("nike_open_auth_after_redirect", JSON.stringify({
        tab: "register",
        reason: "checkout_login_required"
      }));
    } catch (e) {}
    window.location.replace("index.html");
    return;
  }

  let appliedPromo = null;
  let cartData = loadCart();

  const coItems = document.getElementById("coItems");
  const coEmpty = document.getElementById("coEmpty");
  const sumSubtotal = document.getElementById("sumSubtotal");
  const sumShipping = document.getElementById("sumShipping");
  const sumDiscount = document.getElementById("sumDiscount");
  const sumDiscountRow = document.getElementById("sumDiscountRow");
  const sumTotal = document.getElementById("sumTotal");
  const applyPromoBtn = document.getElementById("applyPromo");
  const promoInput = document.getElementById("coPromo");
  const promoMsg = document.getElementById("promoMsg");
  const paymentRadios = document.querySelectorAll('input[name="coPayment"]');
  const visaFields = document.getElementById("visaFields");
  const placeOrderBtn = document.getElementById("placeOrderBtn");
  const coMsg = document.getElementById("coMsg");
  const orderSuccess = document.getElementById("orderSuccess");
  const orderOkBtn = document.getElementById("orderOkBtn");
  const orderRef = document.getElementById("orderRef");

  function loadCart() {
    try {
      const raw = localStorage.getItem(getCartStorageKey());
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(getCartStorageKey(), JSON.stringify(cartData));
    } catch (err) {}
  }

  function computeSubtotal() {
    return cartData.reduce((sum, entry) => {
      const p = parsePrice(entry.price);
      const q = parseInt(entry.qty, 10) || 1;
      return sum + p * q;
    }, 0);
  }

  function computeShipping(subtotal) {
    if (!cartData || cartData.length === 0) return 0;
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  }

  function computeDiscount(subtotal) {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === "percent") {
      return Math.max(0, (subtotal * appliedPromo.value) / 100);
    }
    if (appliedPromo.type === "fixed") {
      return Math.min(subtotal, appliedPromo.value);
    }
    return 0;
  }

  function setItemQty(id, nextQty) {
    const entry = cartData.find((e) => e.id === id);
    if (!entry) return;
    const clamped = parseInt(nextQty, 10) || 0;
    if (clamped <= 0) {
      cartData = cartData.filter((e) => e.id !== id);
    } else {
      entry.qty = clamped;
    }
    saveCart();
    renderItems();
    window.dispatchEvent(new CustomEvent("nike-cart-updated"));
  }

  function increaseItemQty(id, by) {
    const step = Math.max(1, parseInt(by, 10) || 1);
    const entry = cartData.find((e) => e.id === id);
    if (!entry) return;
    setItemQty(id, (parseInt(entry.qty, 10) || 1) + step);
  }

  function decreaseItemQty(id, by) {
    const step = Math.max(1, parseInt(by, 10) || 1);
    const entry = cartData.find((e) => e.id === id);
    if (!entry) return;
    setItemQty(id, (parseInt(entry.qty, 10) || 1) - step);
  }

  function refreshCartFromStorage() {
    cartData = loadCart();
    renderItems();
  }

  function renderItems() {
    coItems.innerHTML = "";

    if (!cartData || cartData.length === 0) {
      coItems.style.display = "none";
      if (coEmpty) coEmpty.classList.add("show");
      if (placeOrderBtn) placeOrderBtn.disabled = true;
      updateSummary();
      return;
    }

    coItems.style.display = "flex";
    if (coEmpty) coEmpty.classList.remove("show");
    if (placeOrderBtn) placeOrderBtn.disabled = false;

    cartData.forEach((entry) => {
      const priceNum = parsePrice(entry.price);
      const qty = parseInt(entry.qty, 10) || 1;
      const subtotal = priceNum * qty;

      const row = document.createElement("div");
      row.className = "co-item";
      row.dataset.id = entry.id;

      const imgWrap = document.createElement("div");
      imgWrap.className = "co-item-img";
      const img = document.createElement("img");
      img.src = entry.image || "";
      img.alt = entry.title || "";
      imgWrap.appendChild(img);
      row.appendChild(imgWrap);

      const info = document.createElement("div");
      info.className = "co-item-info";

      const title = document.createElement("p");
      title.className = "co-item-title";
      title.textContent = entry.title || "";
      info.appendChild(title);

      const meta = document.createElement("div");
      meta.className = "co-item-meta";
      if (entry.size) {
        const sizeSpan = document.createElement("span");
        sizeSpan.textContent = "Size: " + entry.size;
        meta.appendChild(sizeSpan);
      }
      if (entry.color) {
        const colorWrap = document.createElement("span");
        colorWrap.className = "meta-color";
        colorWrap.textContent = "Color: ";
        const colorDot = document.createElement("span");
        colorDot.style.background = entry.color;
        colorWrap.appendChild(colorDot);
        meta.appendChild(colorWrap);
      }
      info.appendChild(meta);

      const prices = document.createElement("div");
      prices.className = "co-item-prices";

      const each = document.createElement("span");
      each.className = "each";
      each.innerHTML = 'Each: <strong>' + entry.price + '</strong>';
      prices.appendChild(each);

      const qtyCtrl = document.createElement("div");
      qtyCtrl.className = "co-qty-control";

      const minusBtn = document.createElement("button");
      minusBtn.type = "button";
      minusBtn.className = "qty-btn qty-minus";
      minusBtn.setAttribute("aria-label", "Decrease");
      minusBtn.innerHTML = '<i class="fa-solid fa-minus"></i>';
      if (qty <= 1) minusBtn.disabled = true;
      minusBtn.addEventListener("click", function () {
        decreaseItemQty(entry.id, 1);
      });
      qtyCtrl.appendChild(minusBtn);

      const qtyVal = document.createElement("span");
      qtyVal.className = "qty-value";
      qtyVal.textContent = String(qty);
      qtyCtrl.appendChild(qtyVal);

      const plusBtn = document.createElement("button");
      plusBtn.type = "button";
      plusBtn.className = "qty-btn qty-plus";
      plusBtn.setAttribute("aria-label", "Increase");
      plusBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
      plusBtn.addEventListener("click", function () {
        increaseItemQty(entry.id, 1);
      });
      qtyCtrl.appendChild(plusBtn);

      const qtyBox = document.createElement("span");
      qtyBox.className = "qty";
      qtyBox.appendChild(qtyCtrl);
      prices.appendChild(qtyBox);

      const sub = document.createElement("span");
      sub.className = "sub";
      sub.textContent = "Total: " + formatPrice(subtotal);
      prices.appendChild(sub);

      info.appendChild(prices);
      row.appendChild(info);

      coItems.appendChild(row);
    });

    updateSummary();
  }

  function updateSummary() {
    const subtotal = computeSubtotal();
    const shipping = computeShipping(subtotal);
    const discount = computeDiscount(subtotal);
    const total = Math.max(0, subtotal - discount + shipping);

    if (sumSubtotal) sumSubtotal.textContent = formatPrice(subtotal);
    if (sumShipping) {
      sumShipping.textContent = shipping === 0 ? "FREE" : formatPrice(shipping);
    }

    if (sumDiscountRow) {
      if (discount > 0) {
        sumDiscountRow.style.display = "flex";
        if (sumDiscount) sumDiscount.textContent = "-" + formatPrice(discount);
      } else {
        sumDiscountRow.style.display = "none";
      }
    }

    if (sumTotal) sumTotal.textContent = formatPrice(total);
  }

  function applyPromoCode() {
    const raw = promoInput ? promoInput.value.trim().toUpperCase() : "";
    appliedPromo = null;

    if (!raw) {
      promoMsg.className = "promo-msg";
      promoMsg.textContent = "";
      updateSummary();
      return;
    }

    const promo = PROMO_CODES[raw];
    if (!promo) {
      promoMsg.className = "promo-msg err";
      promoMsg.textContent = "Invalid promo code.";
      updateSummary();
      return;
    }

    appliedPromo = promo;
    promoMsg.className = "promo-msg ok";
    promoMsg.textContent = "Promo applied: " + promo.label + "!";
    updateSummary();
  }

  function syncPaymentUI() {
    let method = "visa";
    paymentRadios.forEach((r) => {
      if (r.checked) method = r.value;
    });
    if (!visaFields) return;
    if (method === "visa") {
      visaFields.classList.remove("hide");
    } else {
      visaFields.classList.add("hide");
    }
  }

  function markErr(el) {
    if (!el) return;
    el.classList.add("err");
    setTimeout(() => el.classList.remove("err"), 2200);
  }

  function formatCardNumber(value) {
    const v = value.replace(/\s+/g, "").replace(/\D/g, "").slice(0, 16);
    const parts = v.match(/.{1,4}/g) || [];
    return parts.join(" ");
  }

  function formatExpiry(value) {
    const v = value.replace(/\D/g, "").slice(0, 4);
    if (v.length < 3) return v;
    return v.slice(0, 2) + "/" + v.slice(2);
  }

  function validateCheckout() {
    coMsg.textContent = "";
    coMsg.className = "co-msg";

    const nameEl = document.getElementById("coName");
    const phoneEl = document.getElementById("coPhone");
    const addressEl = document.getElementById("coAddress");
    const payment = document.querySelector('input[name="coPayment"]:checked');

    let ok = true;

    if (!nameEl || nameEl.value.trim().length < 2) {
      markErr(nameEl);
      ok = false;
    }
    if (!phoneEl || phoneEl.value.trim().length < 5) {
      markErr(phoneEl);
      ok = false;
    }
    if (!addressEl || addressEl.value.trim().length < 8) {
      markErr(addressEl);
      ok = false;
    }
    if (!payment) {
      ok = false;
    }

    if (payment && payment.value === "visa") {
      const cardNum = document.getElementById("coCardNum");
      const cardExp = document.getElementById("coCardExp");
      const cardCvv = document.getElementById("coCardCvv");

      const cn = cardNum ? cardNum.value.replace(/\s+/g, "") : "";
      if (cn.length < 13) {
        markErr(cardNum);
        ok = false;
      }
      if (!cardExp || !/^\d{2}\/\d{2}$/.test(cardExp.value.trim())) {
        markErr(cardExp);
        ok = false;
      }
      if (!cardCvv || !/^\d{3}$/.test(cardCvv.value.trim())) {
        markErr(cardCvv);
        ok = false;
      }
    }

    if (!ok) {
      coMsg.className = "co-msg err";
      coMsg.textContent = "Please fill all required fields correctly.";
      return false;
    }

    return true;
  }

  function saveOrder() {
    const subtotal = computeSubtotal();
    const shipping = computeShipping(subtotal);
    const discount = computeDiscount(subtotal);
    const total = Math.max(0, subtotal - discount + shipping);

    const order = {
      ref: "NK-" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 900 + 100),
      date: new Date().toISOString(),
      items: JSON.parse(JSON.stringify(cartData)),
      customer: {
        name: document.getElementById("coName").value.trim(),
        phone: document.getElementById("coPhone").value.trim(),
        address: document.getElementById("coAddress").value.trim(),
        notes: document.getElementById("coNotes").value.trim(),
        promo: promoInput.value.trim(),
      },
      payment: document.querySelector('input[name="coPayment"]:checked').value,
      pricing: {
        subtotal,
        shipping,
        discount,
        total,
      },
    };

    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      const prev = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(prev) ? prev : [];
      list.unshift(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
    } catch (err) {}

    return order;
  }

  function placeOrder() {
    if (!cartData || cartData.length === 0) {
      coMsg.className = "co-msg err";
      coMsg.textContent = "Your cart is empty.";
      return;
    }

    if (!validateCheckout()) return;

    const order = saveOrder();

    cartData = [];
    saveCart();
    appliedPromo = null;

    if (orderRef) orderRef.textContent = "Order ref: " + order.ref;
    if (orderSuccess) {
      orderSuccess.classList.add("show");
    }

    renderItems();
  }

  if (orderOkBtn) {
    orderOkBtn.addEventListener("click", function () {
      if (orderSuccess) orderSuccess.classList.remove("show");
      window.location.href = "index.html";
    });
  }

  if (applyPromoBtn) {
    applyPromoBtn.addEventListener("click", applyPromoCode);
  }
  if (promoInput) {
    promoInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        applyPromoCode();
      }
    });
  }

  paymentRadios.forEach((r) => {
    r.addEventListener("change", syncPaymentUI);
  });

  const cardNumEl = document.getElementById("coCardNum");
  const cardExpEl = document.getElementById("coCardExp");
  const cardCvvEl = document.getElementById("coCardCvv");

  if (cardNumEl) {
    cardNumEl.addEventListener("input", function () {
      cardNumEl.value = formatCardNumber(cardNumEl.value);
    });
  }
  if (cardExpEl) {
    cardExpEl.addEventListener("input", function () {
      cardExpEl.value = formatExpiry(cardExpEl.value);
    });
  }
  if (cardCvvEl) {
    cardCvvEl.addEventListener("input", function () {
      cardCvvEl.value = cardCvvEl.value.replace(/\D/g, "").slice(0, 3);
    });
  }

  if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", placeOrder);
  }

  window.addEventListener("storage", function (e) {
    if (!e || !e.key) return;
    const isRelevant =
      e.key === getCartStorageKey() ||
      e.key === CART_GUEST_KEY ||
      e.key.indexOf(CART_USER_PREFIX) === 0;
    if (!isRelevant) return;
    refreshCartFromStorage();
  });
  window.addEventListener("nike-cart-updated", function () {
    refreshCartFromStorage();
  });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") refreshCartFromStorage();
  });
  window.addEventListener("focus", function () {
    refreshCartFromStorage();
  });

  syncPaymentUI();
  renderItems();

  const nameEl = document.getElementById("coName");
  if (nameEl && !nameEl.value && currentUser.name) {
    nameEl.value = currentUser.name;
  }
};

(function autoStart() {
  function start() {
    if (document.getElementById("coItems")) {
      NikeApp.initCheckout();
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
