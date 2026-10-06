window.NikeApp = window.NikeApp || {};

NikeApp.parsePrice = function parsePrice(str) {
  if (!str) return 0;
  const cleaned = String(str).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

NikeApp.formatPrice = function formatPrice(num) {
  const rounded = Math.round(num * 100) / 100;
  const fixed = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2);
  return fixed + "$";
};

NikeApp.getItemImage = function getItemImage(item) {
  const shoeImg = item.querySelector(".shoe img");
  const cardImg = item.querySelector(".img img");
  const img = shoeImg || cardImg;
  return img ? img.src : "";
};

NikeApp.getItemTitle = function getItemTitle(item) {
  const h3 = item.querySelector(".desc h3");
  const h6 = item.querySelector("h6");
  return h3 ? h3.textContent.trim() : h6 ? h6.textContent.trim() : "";
};

NikeApp.getItemPrice = function getItemPrice(item) {
  const priceParagraphs = item.querySelectorAll(".price p");
  if (priceParagraphs.length === 0) return "";
  return priceParagraphs[priceParagraphs.length - 1].textContent.trim();
};
