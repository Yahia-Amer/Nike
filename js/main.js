(function initApp() {
  function start() {
    NikeApp.initNavigation();
    NikeApp.initCarousel();
    NikeApp.initLogin();
    NikeApp.initProducts();
    NikeApp.initQuickView();
    NikeApp.initCart();
    NikeApp.initFavorites();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
