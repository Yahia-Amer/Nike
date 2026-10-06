window.NikeApp = window.NikeApp || {};

NikeApp.initFavorites = function initFavorites() {
  const { getItemImage, getItemTitle, getItemPrice } = NikeApp;
  const FAV_GUEST_KEY = "nike_fav";
  const FAV_USER_PREFIX = "nike_fav_";

  function getFavStorageKey() {
    try {
      const raw = localStorage.getItem("nike_session");
      if (raw) {
        const sess = JSON.parse(raw);
        if (sess && sess.username) {
          return FAV_USER_PREFIX + sess.username.toLowerCase();
        }
      }
    } catch (err) {}
    return FAV_GUEST_KEY;
  }

  function loadFavFromStorage() {
    try {
      const raw = localStorage.getItem(getFavStorageKey());
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function saveFavToStorage() {
    try {
      localStorage.setItem(getFavStorageKey(), JSON.stringify(favoritesData));
    } catch (err) {}
  }

  let favoritesData = loadFavFromStorage();

  NikeApp.reloadUserFavorites = function reloadUserFavorites() {
    reloadFavFromStorage();
  };

  const favOverlay = document.querySelector(".overlay-fav");
  const favBox = document.querySelector(".overlay-fav .fav-box");
  const emptyMsgDiv = document.querySelector(
    ".overlay-fav .fav-box button.x ~ div"
  );
  const xIcon = document.querySelector(".overlay-fav .fav-box .x");
  const funcMenu = document.querySelector(".nav .nav-items .func");
  const quickViewOverlay = document.querySelector(".quick-view-overlay");
  const popupFavBtn = document.querySelector(".popup-fav-btn");

  if (emptyMsgDiv) emptyMsgDiv.classList.add("empty-cart-msg");

  const favListEl = document.createElement("div");
  favListEl.className = "cart-items";
  if (favBox && xIcon) {
    favBox.appendChild(favListEl);
  }

  function getProductItems() {
    return document.querySelectorAll(".item[data-id]");
  }

  function isFavorite(id) {
    return favoritesData.some((entry) => entry.id === id);
  }

  function syncFavButton(btn, active) {
    if (!btn) return;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
    btn.setAttribute(
      "aria-label",
      active ? "Remove from favorites" : "Add to favorites"
    );
  }

  function syncPopupFavButton(id) {
    if (!popupFavBtn) return;
    const active = Boolean(id && isFavorite(id));
    popupFavBtn.classList.toggle("active", active);
    popupFavBtn.setAttribute(
      "aria-pressed",
      active ? "true" : "false"
    );
    popupFavBtn.setAttribute(
      "aria-label",
      active ? "Remove from favorites" : "Add to favorites"
    );
  }

  function syncFavButtons() {
    getProductItems().forEach((item) => {
      const active = isFavorite(item.dataset.id);
      syncFavButton(item.querySelector(".fav-btn"), active);
      item.classList.toggle("favorited", active);
    });

    if (
      quickViewOverlay &&
      quickViewOverlay.classList.contains("show") &&
      quickViewOverlay.dataset.currentId
    ) {
      syncPopupFavButton(quickViewOverlay.dataset.currentId);
    }
  }

  function renderFavorites() {
    favListEl.innerHTML = "";

    if (favoritesData.length === 0) {
      if (favBox) {
        favBox.classList.add("no");
        favBox.classList.remove("yes");
      }
      if (emptyMsgDiv) emptyMsgDiv.style.display = "block";
      favListEl.style.display = "none";
    } else {
      if (favBox) {
        favBox.classList.remove("no");
        favBox.classList.add("yes");
      }
      if (emptyMsgDiv) emptyMsgDiv.style.display = "none";
      favListEl.style.display = "grid";

      favoritesData.forEach((entry) => {
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

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "cart-item-remove";
        removeBtn.textContent = "Remove From Favorites";
        removeBtn.addEventListener("click", function () {
          removeFavorite(entry.id);
        });
        card.appendChild(removeBtn);

        favListEl.appendChild(card);
      });
    }

    syncFavButtons();
    saveFavToStorage();
  }

  function reloadFavFromStorage() {
    const fresh = loadFavFromStorage();
    const changed =
      fresh.length !== favoritesData.length ||
      fresh.some(function (a) {
        return !favoritesData.find((x) => x.id === a.id);
      });
    if (!changed) {
      syncFavButtons();
      return;
    }
    favoritesData = fresh;
    renderFavorites();
  }

  window.addEventListener("storage", function (e) {
    if (!e || !e.key) return;
    const isRelevant =
      e.key === getFavStorageKey() ||
      e.key === "nike_session" ||
      e.key === FAV_GUEST_KEY ||
      e.key.indexOf(FAV_USER_PREFIX) === 0;
    if (!isRelevant) return;
    reloadFavFromStorage();
  });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") reloadFavFromStorage();
  });
  window.addEventListener("focus", function () {
    reloadFavFromStorage();
  });

  function addFavorite(item) {
    const id = item.dataset.id;
    if (!id || isFavorite(id)) return;

    favoritesData.push({
      id,
      title: getItemTitle(item),
      price: getItemPrice(item),
      image: getItemImage(item),
    });

    item.classList.add("favorited");
    renderFavorites();
  }

  function removeFavorite(id) {
    favoritesData = favoritesData.filter((entry) => entry.id !== id);

    const item = document.querySelector('.item[data-id="' + id + '"]');
    if (item) item.classList.remove("favorited");

    renderFavorites();
  }

  function toggleFavorite(item) {
    const id = item.dataset.id;
    if (!id) return;
    isFavorite(id) ? removeFavorite(id) : addFavorite(item);
  }

  function bindFavButton(btn, item) {
    if (!btn || !item || btn.dataset.bound === "true") return;
    btn.dataset.bound = "true";
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(item);
    });
  }

  function addFavButtons() {
    document
      .querySelectorAll(".latest .item[data-id], .featured .products .item[data-id]")
      .forEach((item) => {
      let btn = item.querySelector(".fav-btn");
      if (!btn) {
        btn = document.createElement("button");
        btn.type = "button";
        btn.className = "fav-btn";
        btn.setAttribute("aria-label", "Add to favorites");
        btn.innerHTML = '<i class="fas fa-heart"></i>';
        const actions = item.querySelector(".latest-actions");
        if (actions) {
          actions.appendChild(btn);
        } else {
          const description = item.querySelector(".desc");
          if (description) {
            description.appendChild(btn);
          } else {
            item.appendChild(btn);
          }
        }
      }
      bindFavButton(btn, item);
      });
  }

  function closeFavOverlay() {
    if (!favOverlay) return;
    favOverlay.classList.remove("show");
    document.body.style.overflow = "";
  }

  function openFavOverlay() {
    if (!favOverlay) return;
    favOverlay.classList.add("show");
    document.body.style.overflow = "hidden";
    renderFavorites();
  }

  function toggleFavOverlay() {
    if (!favOverlay) return;
    if (favOverlay.classList.contains("show")) {
      closeFavOverlay();
    } else {
      openFavOverlay();
    }
  }

  if (xIcon) {
    xIcon.addEventListener("click", closeFavOverlay);
  }

  if (favOverlay) {
    favOverlay.addEventListener("click", function (e) {
      if (e.target === favOverlay) closeFavOverlay();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && favOverlay && favOverlay.classList.contains("show")) {
      closeFavOverlay();
    }
  });

  if (funcMenu) {
    funcMenu.addEventListener("click", function (e) {
      if (e.target.closest(".fav")) toggleFavOverlay();
    });
  }

  if (popupFavBtn) {
    popupFavBtn.addEventListener("click", function () {
      const id = quickViewOverlay ? quickViewOverlay.dataset.currentId : "";
      const item = document.querySelector('.item[data-id="' + id + '"]');
      if (!item) return;
      toggleFavorite(item);
      syncPopupFavButton(id);
    });
  }

  document.querySelectorAll(".quick-view-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const item = btn.closest(".item");
      if (!item || !quickViewOverlay) return;
      quickViewOverlay.dataset.currentId = item.dataset.id;
      syncPopupFavButton(item.dataset.id);
    });
  });

  addFavButtons();
  renderFavorites();
};
