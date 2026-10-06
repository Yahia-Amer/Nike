window.NikeApp = window.NikeApp || {};

NikeApp.initCarousel = function initCarousel() {
  const THEME_KEY = "nike_theme";
  const themeOrder = ["red", "blue", "orange"];

  try {
    localStorage.removeItem(THEME_KEY);
  } catch (err) {}

  function saveTheme(variant) {
    try {
      sessionStorage.setItem(
        THEME_KEY,
        JSON.stringify({
          variant,
          at: Date.now(),
        })
      );
    } catch (err) {}
  }

  NikeApp.getSavedTheme = function getSavedTheme() {
    try {
      const raw = sessionStorage.getItem(THEME_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.variant) return null;
      return parsed.variant;
    } catch (err) {
      return null;
    }
  };

  function resolveTheme(variant) {
    if (variant === "blue") {
      return {
        mainHex: "#0E7AD7",
        logoSrc: "img/logo2.png",
        correctSrc: "img/second-correct.webp",
      };
    }
    if (variant === "orange") {
      return {
        mainHex: "#EC9720",
        logoSrc: "img/logo3.png",
        correctSrc: "img/third-correct.webp",
      };
    }
    return {
      mainHex: "#fb2527",
      logoSrc: "img/logo.png",
      correctSrc: "img/first-correct.webp",
    };
  }

  function applyThemeVariant(variant, persist) {
    const theme = resolveTheme(variant);

    document.documentElement.style.setProperty("--main-color", theme.mainHex);
    document.documentElement.style.setProperty("--first-color", theme.mainHex);

    const navLogo = document.querySelector(".navbar.nav img.logo");
    if (navLogo) navLogo.src = theme.logoSrc;

    const icon = document.querySelector('link[rel="icon"]');
    if (icon) icon.href = theme.logoSrc;

    const innerLogo1 = document.querySelector(".inner-logo1");
    if (innerLogo1) innerLogo1.src = theme.correctSrc;
    const innerLogo2 = document.querySelector(".inner-logo2");
    if (innerLogo2) innerLogo2.src = theme.correctSrc;

    const footerLogos = document.querySelectorAll(".site-footer .footer-logo");
    footerLogos.forEach(function (fl) {
      fl.src = theme.logoSrc;
    });

    const yr = document.getElementById("footerYear");
    if (yr && !yr.textContent) yr.textContent = new Date().getFullYear();

    if (persist !== false) {
      saveTheme(variant);
    }
  }

  NikeApp.applySavedTheme = function applySavedTheme() {
    const variant = NikeApp.getSavedTheme() || "red";
    applyThemeVariant(variant, false);
    return variant;
  };

  function applyThemeToSlider(variant) {
    applyThemeVariant(variant, true);
  }

  function detectSliderVariant(sliderEl) {
    if (!sliderEl) return "red";
    if (sliderEl.classList.contains("blue")) return "blue";
    if (sliderEl.classList.contains("orange")) return "orange";
    if (sliderEl.classList.contains("yellow")) return "orange";
    const cls = sliderEl.className || "";
    if (/red/i.test(cls)) return "red";
    return "red";
  }

  function setActiveSlider(targetEl) {
    if (!carsouel || !targetEl) return;

    const currentSlider = carsouel.querySelector(".lio-carousel-item.active");
    const currentPart1Start = carsouel.querySelector(
      ".lio-carousel-item .part1 .item.start"
    );
    const nextPart1Start = targetEl.querySelector(".part1 .item");

    if (currentSlider && currentSlider !== targetEl) {
      currentSlider.classList.remove("active");
    }
    if (currentPart1Start) currentPart1Start.classList.remove("start");

    targetEl.classList.add("active");

    if (nextPart1Start) {
      void nextPart1Start.offsetLeft;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          nextPart1Start.classList.add("start");
        });
      });
    }
  }

  function getSiblingSlider(direction) {
    const currentSlider = carsouel.querySelector(".lio-carousel-item.active");
    if (direction > 0) {
      return (
        currentSlider.nextElementSibling ??
        carsouel.querySelector(".lio-carousel-item:first-child")
      );
    }
    return (
      currentSlider.previousElementSibling ??
      carsouel.querySelector(".lio-carousel-item:last-child")
    );
  }

  function getCurrentThemeIndex() {
    const current = NikeApp.getSavedTheme() || "red";
    const idx = themeOrder.indexOf(current);
    return idx === -1 ? 0 : idx;
  }

  const carsouel = document.querySelector("#lio-carousel");

  function cycleTheme(direction) {
    const currentIdx = getCurrentThemeIndex();
    const nextIdx =
      (currentIdx + direction + themeOrder.length) % themeOrder.length;
    const nextVariant = themeOrder[nextIdx];

    if (carsouel) {
      const items = carsouel.querySelectorAll(".lio-carousel-item");
      let matchedIndex = -1;
      items.forEach((item, i) => {
        if (detectSliderVariant(item) === nextVariant) {
          matchedIndex = i;
        }
      });
      if (matchedIndex !== -1) {
        const nextSlider = items[matchedIndex];
        setActiveSlider(nextSlider);
      } else {
        const fallback = getSiblingSlider(direction);
        setActiveSlider(fallback);
      }
    }

    applyThemeToSlider(nextVariant);
  }

  document.addEventListener("keydown", function (e) {
    const isTyping =
      document.activeElement &&
      (document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement.isContentEditable);
    if (isTyping) return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      cycleTheme(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      cycleTheme(-1);
    }
  });

  if (!carsouel) {
    NikeApp.applySavedTheme();
    return;
  }

  NikeApp.applySavedTheme();

  const nextSliderBtn = carsouel.querySelector("#lio-carousel .next");
  const prevSliderBtn = carsouel.querySelector("#lio-carousel .prev");

  let carouselStarted = false;

  function startCarousel() {
    if (carouselStarted) return;
    carouselStarted = true;

    const items = carsouel.querySelectorAll(".lio-carousel-item");
    const savedVariant = NikeApp.getSavedTheme();
    let startWindow2 = null;
    if (savedVariant) {
      items.forEach(function (it) {
        if (detectSliderVariant(it) === savedVariant) startWindow2 = it;
      });
    }
    if (!startWindow2) {
      startWindow2 = carsouel.querySelector(".lio-carousel-item");
    }
    const startWindow1 = startWindow2
      ? startWindow2.querySelector(".part1 .item")
      : carsouel.querySelector(".lio-carousel-item .part1 .item");

    items.forEach(function (it) {
      it.classList.remove("active");
    });
    carsouel
      .querySelectorAll(".lio-carousel-item .part1 .item.start")
      .forEach(function (it) {
        it.classList.remove("start");
      });

    if (startWindow2) startWindow2.classList.add("active");
    if (startWindow1) {
      void startWindow1.offsetLeft;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          startWindow1.classList.add("start");
        });
      });
    }

    const initialVariant = detectSliderVariant(startWindow2);
    applyThemeToSlider(initialVariant);

    const icon = document.querySelector('link[rel="icon"]');
    if (icon && !icon.href) icon.href = "img/logo.png";
  }

  document.addEventListener("DOMContentLoaded", startCarousel);
  if (document.readyState === "complete" || document.readyState === "interactive") {
    startCarousel();
  }

  nextSliderBtn.addEventListener("click", function () {
    const nextSlider = getSiblingSlider(1);
    setActiveSlider(nextSlider);

    const variant = detectSliderVariant(nextSlider);
    applyThemeToSlider(variant);
  });

  prevSliderBtn.addEventListener("click", function () {
    const prevSlider = getSiblingSlider(-1);
    setActiveSlider(prevSlider);

    const variant = detectSliderVariant(prevSlider);
    applyThemeToSlider(variant);
  });
};
