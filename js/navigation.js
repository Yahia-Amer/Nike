window.NikeApp = window.NikeApp || {};

NikeApp.initNavigation = function initNavigation() {
  const navLinks = document.querySelectorAll(".navbar .sections .nav-link");
  const burger = document.querySelector(".burger");
  const navItems = document.querySelector(".nav-items");

  if (window.innerWidth > 1300) {
    navItems.classList.remove("show");
  }

  burger.addEventListener("click", function () {
    navItems.classList.toggle("show");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      navLinks.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");
    });
  });

  function applyNavState() {
    if (navLinks[0]) navLinks[0].classList.add("active");
    const nav = document.querySelector(".nav");
    if (!nav) return;
    if (scrollY > 0) nav.style.opacity = 1;
    else nav.style.opacity = 0.8;
  }

  applyNavState();
  if (document.readyState !== "complete") {
    window.addEventListener("load", applyNavState);
  }
};
