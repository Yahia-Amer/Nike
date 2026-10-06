window.NikeApp = window.NikeApp || {};

NikeApp.initProducts = function initProducts() {
  const latestItems = document.querySelectorAll(".latest .item");

  latestItems.forEach((item) => {
    const thumbnails = item.querySelectorAll(".prespective .img img");
    const sizeButtons = item.querySelectorAll(".size button");
    const mainImage = item.querySelector(".shoe img");

    thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener("click", function () {
        if (mainImage) mainImage.src = thumbnail.src;
      });
    });

    sizeButtons.forEach((button) => {
      button.addEventListener("click", function () {
        sizeButtons.forEach((btn) => btn.classList.remove("select"));
        button.classList.add("select");
      });
    });
  });

  document.querySelectorAll(".featured .products .item").forEach((item) => {
    const image = item.querySelector(".img img");
    const circles = item.querySelectorAll(".circles li button");
    const selected = item.querySelector(".circles li button.select img");

    circles.forEach((circle) => {
      circle.addEventListener("click", function () {
        circles.forEach((btn) => btn.classList.remove("select"));
        circle.classList.add("select");

        const currentImg = circle.querySelector("img");
        if (image && currentImg) image.src = currentImg.src;
      });
    });

    if (selected && image && image.src !== selected.src) {
      image.src = selected.src;
    }
  });
};
