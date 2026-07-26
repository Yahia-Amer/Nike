document.addEventListener("DOMContentLoaded", () => {

  // ---------- Cart state ----------
  let cartData = []; // { id, title, price, image, size, color }

  // ---------- Elements ----------
  const cartOverlay      = document.querySelector(".overlay");
  const cartBox          = document.querySelector(".overlay .cart");
  const buyButton        = document.querySelector(".overlay .cart .buy");
  const emptyMsgDiv      = document.querySelector(".overlay .cart button.x ~ div");
                    emptyMsgDiv.classList.add("empty-cart-msg");
  const popupAddCartBtn  = document.querySelector(".popup-add-cart");
  const quickViewOverlay = document.querySelector(".quick-view-overlay");

  // Container created dynamically to hold the rendered cart item cards
  const cartListEl = document.createElement("div");
  cartListEl.className = "cart-items";
  cartBox.insertBefore(cartListEl, buyButton);

  // ---------- Helpers to read item data ----------

  function getItemImage(item) {
    const shoeImg = item.querySelector(".shoe img"); // latest section
    const cardImg = item.querySelector(".img img");  // featured section
    const img = shoeImg || cardImg;
    return img ? img.src : "";
  }

  function getItemTitle(item) {
    const h3 = item.querySelector(".desc h3"); // latest section
    const h6 = item.querySelector("h6");       // featured section
    return h3 ? h3.textContent.trim() : (h6 ? h6.textContent.trim() : "");
  }

  function getItemPrice(item) {
    const priceParagraphs = item.querySelectorAll(".price p");
    if (priceParagraphs.length === 0) return "";
    return priceParagraphs[priceParagraphs.length - 1].textContent.trim();
  }

  function getSelectedSize(item) {
    const selectedLatest = item.querySelector(".size ul button.select");
    if (selectedLatest) return selectedLatest.textContent.trim();

    const isCurrentPopupItem = quickViewOverlay.dataset.currentId === item.dataset.id;
    if (isCurrentPopupItem) {
      const selectedPopup = document.querySelector(".sizes-list button.active");
      if (selectedPopup) return selectedPopup.textContent.trim();
    }

    const firstSize = item.querySelector(".sizes-data span");
    return firstSize ? firstSize.textContent.trim() : "";
  }

  function getSelectedColor(item) {
    const isCurrentPopupItem = quickViewOverlay.dataset.currentId === item.dataset.id;
    if (isCurrentPopupItem) {
      const selectedPopup = document.querySelector(".colors-list span.active");
      if (selectedPopup) return selectedPopup.style.background;
    }

    const firstColor = item.querySelector(".colors-data span");
    return firstColor ? firstColor.dataset.color : "";
  }

  // ---------- Cart core ----------

  function isInCart(id) {
    return cartData.some((entry) => entry.id === id);
  }

  function addToCart(item) {
    const id = item.dataset.id;
    if (isInCart(id)) return;

    cartData.push({
      id,
      title: getItemTitle(item),
      price: getItemPrice(item),
      image: getItemImage(item),
      size: getSelectedSize(item),
      color: getSelectedColor(item),
    });

    item.classList.add("bought");
    renderCart();
  }

  function removeFromCart(id) {
    cartData = cartData.filter((entry) => entry.id !== id);

    const item = document.querySelector(`.item[data-id="${id}"]`);
    if (item) item.classList.remove("bought");

    renderCart();
  }

  // ---------- Keep every "Add To Cart" button for one item in sync ----------

  function syncItemButton(item) {
    const id = item.dataset.id;
    const bought = isInCart(id);

    const cardBtn = item.querySelector(".add-cart");
    if (cardBtn) {
      cardBtn.textContent = bought ? "Remove From cart" : "Add To cart";
      cardBtn.classList.toggle("add", !bought);
      cardBtn.classList.toggle("remove", bought);
    }

    if (quickViewOverlay.classList.contains("show") &&
        quickViewOverlay.dataset.currentId === id) {
      popupAddCartBtn.textContent = bought ? "Remove From Cart" : "Add To Cart";
      popupAddCartBtn.classList.toggle("add", !bought);
      popupAddCartBtn.classList.toggle("remove", bought);
    }
  }

  function syncAllButtons() {
    document.querySelectorAll(".item").forEach(syncItemButton);
  }

  // ---------- Render the cart overlay list ----------

  function renderCart() {
    cartListEl.innerHTML = "";

    if (cartData.length === 0) {
      cartBox.classList.add("no");
      cartBox.classList.remove("yes");
      buyButton.style.display = "none";
      emptyMsgDiv.style.display = "block";
      cartListEl.style.display = "none";
    } else {
      cartBox.classList.remove("no");
      cartBox.classList.add("yes");
      buyButton.style.display = "block";
      emptyMsgDiv.style.display = "none";
cartListEl.style.display = "grid";
      cartData.forEach((entry) => {
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
        price.textContent = entry.price;
        card.appendChild(price);

        if (entry.size) {
          const size = document.createElement("p");
          size.className = "cart-item-size";
          size.textContent = `Size: ${entry.size}`;
          card.appendChild(size);
        }

        if (entry.color) {
          const colorWrap = document.createElement("p");
          colorWrap.className = "cart-item-color";
          colorWrap.innerHTML = `Color: <span style="background:${entry.color}"></span>`;
          card.appendChild(colorWrap);
        }

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "cart-item-remove";
        removeBtn.textContent = "Remove From Cart";
        removeBtn.addEventListener("click", () => removeFromCart(entry.id));
        card.appendChild(removeBtn);

        cartListEl.appendChild(card);
      });
    }

    syncAllButtons();
  }

  // ---------- Wire up "Add To Cart" triggers ----------

  // Latest section: the in-card button
  document.querySelectorAll(".add-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".item");
      if (!item) return;

      isInCart(item.dataset.id) ? removeFromCart(item.dataset.id) : addToCart(item);
    });
  });

  // Featured section: the popup's Add To Cart button
  popupAddCartBtn.addEventListener("click", () => {
    const id = quickViewOverlay.dataset.currentId;
    const item = document.querySelector(`.item[data-id="${id}"]`);
    if (!item) return;

    isInCart(id) ? removeFromCart(id) : addToCart(item);
  });

  // Remember which item the popup currently represents
  document.querySelectorAll(".quick-view-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".item");
      if (item) {
        quickViewOverlay.dataset.currentId = item.dataset.id;
        syncItemButton(item);
      }
    });
  });

  renderCart();
});