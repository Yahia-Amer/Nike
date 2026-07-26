document.addEventListener("DOMContentLoaded", () => {

  // ---------- Element references ----------
  const overlay          = document.querySelector(".quick-view-overlay");
  const closeBtn          = document.querySelector(".close-popup");

  const popupImage        = document.querySelector(".popup-image");
  const popupImages       = document.querySelector(".popup-images");
  const popupTitle        = document.querySelector(".popup-title");
  const oldPriceEl        = document.querySelector(".old-price");
  const newPriceEl        = document.querySelector(".new-price");
  const popupDescription  = document.querySelector(".popup-description");
  const sizesList         = document.querySelector(".sizes-list");
  const colorsList        = document.querySelector(".colors-list");
  const addCartBtn        = document.querySelector(".popup-add-cart");

  let currentItem = null;

  // ---------- Open / close ----------

  function openPopup(item) {
    currentItem = item;
    populatePopup(item);
    updateAddToCartUI(item);

    overlay.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closePopup() {
    overlay.classList.remove("show");
    document.body.style.overflow = "";
    currentItem = null;
  }

  // ---------- Populate popup from clicked item ----------

  function populatePopup(item) {
    const cardMainImg = item.querySelector(".img img");
    const currentSrc = cardMainImg ? cardMainImg.src : "";

    popupImage.src = currentSrc;
    const titleEl = item.querySelector("h6");
    popupImage.alt = titleEl ? titleEl.textContent.trim() : "";

    renderThumbnails(item, currentSrc);

    popupTitle.textContent = titleEl ? titleEl.textContent.trim() : "";

    renderPrice(item);

    const descEl = item.querySelector(".description");
    popupDescription.textContent = descEl ? descEl.textContent.trim() : "";

    renderSizes(item);
    renderColors(item);
  }

  // Thumbnails are plain <img> tags inside .popup-images (matches nike.css: .popup-images img)
  function renderThumbnails(item, activeSrc) {
    popupImages.innerHTML = "";

    const circleImgs = item.querySelectorAll(".circles img");

    circleImgs.forEach((img) => {
      const thumb = document.createElement("img");
      thumb.src = img.src;
      thumb.alt = img.alt || "";

      if (img.src === activeSrc) {
        thumb.classList.add("active");
      }

      thumb.addEventListener("click", () => {
        popupImage.src = img.src;

        popupImages
          .querySelectorAll("img")
          .forEach((el) => el.classList.remove("active"));
        thumb.classList.add("active");
      });

      popupImages.appendChild(thumb);
    });
  }

  function renderPrice(item) {
    const priceParagraphs = item.querySelectorAll(".price p");

    if (priceParagraphs.length >= 2) {
      oldPriceEl.textContent = priceParagraphs[0].textContent.trim();
      newPriceEl.textContent = priceParagraphs[1].textContent.trim();
      oldPriceEl.style.display = "";
    } else if (priceParagraphs.length === 1) {
      oldPriceEl.textContent = "";
      oldPriceEl.style.display = "none";
      newPriceEl.textContent = priceParagraphs[0].textContent.trim();
    } else {
      oldPriceEl.textContent = "";
      newPriceEl.textContent = "";
      oldPriceEl.style.display = "none";
    }
  }

  function renderSizes(item) {
    sizesList.innerHTML = "";

    const sizeSpans = item.querySelectorAll(".sizes-data span");

    sizeSpans.forEach((span) => {
      const sizeBtn = document.createElement("button");
      sizeBtn.type = "button";
      sizeBtn.textContent = span.textContent.trim();

      sizeBtn.addEventListener("click", () => {
        sizesList
          .querySelectorAll("button")
          .forEach((btn) => btn.classList.remove("active"));
        sizeBtn.classList.add("active");
      });

      sizesList.appendChild(sizeBtn);
    });
  }

  // Colors are plain <span> tags inside .colors-list (matches nike.css: .colors-list span)
  function renderColors(item) {
    colorsList.innerHTML = "";

    const colorSpans = item.querySelectorAll(".colors-data span");

    colorSpans.forEach((span) => {
      const color = span.dataset.color || "#000000";

      const colorSpan = document.createElement("span");
      colorSpan.style.background = color;
      colorSpan.setAttribute("title", color);

      colorSpan.addEventListener("click", () => {
        colorsList
          .querySelectorAll("span")
          .forEach((el) => el.classList.remove("active"));
        colorSpan.classList.add("active");
      });

      colorsList.appendChild(colorSpan);
    });
  }

  // ---------- Add to cart ----------

  function updateAddToCartUI(item) {
    const bought = item.classList.contains("bought");

    if (bought) {
      addCartBtn.textContent = "Remove From Cart";
      addCartBtn.classList.remove("add");
      addCartBtn.classList.add("remove");
    } else {
      addCartBtn.textContent = "Add To Cart";
      addCartBtn.classList.remove("remove");
      addCartBtn.classList.add("add");
    }
  }

  function toggleAddToCart() {
    if (!currentItem) return;

    currentItem.classList.toggle("bought");
    updateAddToCartUI(currentItem);
  }

  // ---------- Event listeners ----------

  document.querySelectorAll(".quick-view-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".item");
      if (item) openPopup(item);
    });
  });

  closeBtn.addEventListener("click", closePopup);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePopup();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("show")) {
      closePopup();
    }
  });

  addCartBtn.addEventListener("click", toggleAddToCart);

});