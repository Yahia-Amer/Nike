window.NikeApp = window.NikeApp || {};

const AUTH_KEY = "nike_users";
const SESSION_KEY = "nike_session";

NikeApp.getUsers = function getUsers() {
  try {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

NikeApp.saveUsers = function saveUsers(users) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(users));
};

NikeApp.findUserByUsername = function findUserByUsername(username) {
  const users = NikeApp.getUsers();
  return users.find(u => u.username.toLowerCase() === username.toLowerCase());
};

NikeApp.findUserByEmail = function findUserByEmail(email) {
  const users = NikeApp.getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

NikeApp.setSession = function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    username: user.username,
    name: user.name,
    email: user.email
  }));
};

NikeApp.clearSession = function clearSession() {
  localStorage.removeItem(SESSION_KEY);
};

NikeApp.isLoggedIn = function isLoggedIn() {
  return !!NikeApp.getSession();
};

NikeApp.openAuth = function openAuth(tabName) {
  const regestOverlay = document.querySelector(".overlayReg");
  if (!regestOverlay) return;
  const targetTab = tabName === "register" ? "register" : "login";
  NikeApp.switchTab(targetTab);
  regestOverlay.classList.add("show");
  const regest = document.querySelector(".overlayReg .regest");
  if (regest) {
    regest.classList.remove("is-login", "is-register");
    regest.classList.add(targetTab === "login" ? "is-login" : "is-register");
    regest.scrollTop = 0;
  }
  NikeApp.refreshAuthSessionUI();
};

NikeApp.closeAuth = function closeAuth() {
  const regestOverlay = document.querySelector(".overlayReg");
  if (!regestOverlay) return;
  regestOverlay.classList.remove("show");
  NikeApp.clearLoginForm();
  NikeApp.clearRegisterForm();
  NikeApp.switchTab("login");
};

NikeApp.refreshAuthSessionUI = function refreshAuthSessionUI() {
  const session = NikeApp.getSession();
  const sessionBox = document.querySelector("#userSessionBox");
  const usName = document.querySelector("#usName");
  const usEmail = document.querySelector("#usEmail");
  const logoutBtn = document.querySelector("#logoutBtn");
  const formTitle = document.querySelector("#formTitle");
  const regestBox = document.querySelector(".overlayReg .regest");
  const overlayReg = document.querySelector(".overlayReg");

  if (regestBox) {
    if (session) {
      regestBox.classList.add("is-authenticated");
    } else {
      regestBox.classList.remove("is-authenticated");
    }
  }
  if (overlayReg) {
    if (session) {
      overlayReg.classList.add("is-authenticated");
    } else {
      overlayReg.classList.remove("is-authenticated");
    }
  }

  if (sessionBox) {
    if (session) {
      sessionBox.classList.add("active");
    } else {
      sessionBox.classList.remove("active");
    }
  }
  if (usName && session) usName.textContent = session.name || session.username || "User";
  if (usEmail && session) usEmail.textContent = session.email || "";
  if (formTitle && session) {
    formTitle.textContent = "My Account";
  } else if (formTitle) {
    const activeTab = document.querySelector(".auth-tab.active");
    formTitle.textContent = activeTab && activeTab.dataset.tab === "register" ? "Register" : "Login";
  }
};

NikeApp.getSession = function getSession() {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

NikeApp.showMsg = function showMsg(element, text) {
  if (!element) return;
  element.textContent = text;
  element.classList.add("show");
};

NikeApp.hideMsg = function hideMsg(element) {
  if (!element) return;
  element.textContent = "";
  element.classList.remove("show");
};

NikeApp.clearLoginForm = function clearLoginForm() {
  const userName = document.querySelector("#userName");
  const password = document.querySelector("#password");
  const loginBtn = document.querySelector("#loginBtn");

  if (userName) {
    userName.value = "";
    userName.classList.remove("valid-border", "invalid-border");
  }
  if (password) {
    password.value = "";
    password.classList.remove("valid-border", "invalid-border");
  }
  if (loginBtn) loginBtn.disabled = true;

  ["length", "upper", "lower", "number"].forEach(id => {
    const el = document.querySelector("#" + id);
    if (el) {
      el.classList.remove("valid", "invalid");
      const icon = el.querySelector("i");
      if (icon) {
        icon.classList.remove("fa-check");
        icon.classList.add("fa-xmark");
      }
    }
  });
};

NikeApp.clearRegisterForm = function clearRegisterForm() {
  const fields = ["regName", "regUserName", "regEmail", "regPassword", "regConfirmPassword"];
  fields.forEach(id => {
    const el = document.querySelector("#" + id);
    if (el) {
      el.value = "";
      el.classList.remove("valid-border", "invalid-border");
    }
  });
  const registerBtn = document.querySelector("#registerBtn");
  if (registerBtn) registerBtn.disabled = true;

  ["regLength", "regUpper", "regLower", "regNumber", "regMatch"].forEach(id => {
    const el = document.querySelector("#" + id);
    if (el) {
      el.classList.remove("valid", "invalid");
      const icon = el.querySelector("i");
      if (icon) {
        icon.classList.remove("fa-check");
        icon.classList.add("fa-xmark");
      }
    }
  });
};

NikeApp.switchTab = function switchTab(tabName) {
  const tabs = document.querySelectorAll(".auth-tab");
  const forms = document.querySelectorAll(".auth-form");
  const title = document.querySelector("#formTitle");
  const regest = document.querySelector(".overlayReg .regest");

  tabs.forEach(tab => {
    if (tab.dataset.tab === tabName) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  forms.forEach(form => {
    if (form.dataset.form === tabName) {
      form.classList.add("active");
    } else {
      form.classList.remove("active");
    }
  });

  if (title) {
    const session = NikeApp.getSession();
    if (session) {
      title.textContent = "My Account";
    } else {
      title.textContent = tabName === "login" ? "Login" : "Register";
    }
  }

  if (regest) {
    regest.classList.remove("is-login", "is-register");
    regest.classList.add(tabName === "login" ? "is-login" : "is-register");
    regest.scrollTop = 0;
  }

  NikeApp.hideMsg(document.querySelector("#loginError"));
  NikeApp.hideMsg(document.querySelector("#regError"));
  NikeApp.hideMsg(document.querySelector("#regSuccess"));
};

NikeApp.initLogin = function initLogin() {
  const regestOverlay = document.querySelector(".overlayReg");
  const xR = document.querySelector(".overlayReg .regest .x");
  const loginButton = document.querySelector("#loginBtn");
  const registerBtn = document.querySelector("#registerBtn");
  const successOverlay = document.querySelector(".overlaySuccess");
  const okButton = document.querySelector(".overlaySuccess .ok");
  const successTitle = document.querySelector(".overlaySuccess .success h3");
  const successP = document.querySelector(".overlaySuccess .success p");
  const funcMenu = document.querySelector(".nav .nav-items .func");
  const tabs = document.querySelectorAll(".auth-tab");
  const loginError = document.querySelector("#loginError");
  const regError = document.querySelector("#regError");
  const regSuccess = document.querySelector("#regSuccess");
  const logoutBtn = document.querySelector("#logoutBtn");

  function toggleLogin() {
    regestOverlay.classList.toggle("show");
    if (!regestOverlay.classList.contains("show")) {
      NikeApp.clearLoginForm();
      NikeApp.clearRegisterForm();
      NikeApp.switchTab("login");
    } else {
      const regest = document.querySelector(".overlayReg .regest");
      if (regest) {
        regest.classList.remove("is-login", "is-register");
        regest.classList.add("is-login");
        regest.scrollTop = 0;
      }
      NikeApp.refreshAuthSessionUI();
    }
  }

  function showSuccessOverlay(titleText, pText) {
    if (successTitle) successTitle.textContent = titleText;
    if (successP) successP.textContent = pText;
    successOverlay.classList.add("show");
  }

  if (xR) xR.addEventListener("click", toggleLogin);

  if (funcMenu) {
    funcMenu.addEventListener("click", function (e) {
      if (e.target.closest(".reg")) toggleLogin();
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", function () {
      NikeApp.switchTab(tab.dataset.tab);
    });
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      NikeApp.clearSession();
      if (typeof NikeApp.reloadUserCart === "function") NikeApp.reloadUserCart();
      if (typeof NikeApp.reloadUserFavorites === "function") NikeApp.reloadUserFavorites();
      NikeApp.refreshAuthSessionUI();
      NikeApp.switchTab("login");
      showSuccessOverlay("Logged Out Successfully", "Your account is still available for your next login.");
    });
  }

  NikeApp.initValidation();

  if (loginButton) {
    loginButton.addEventListener("click", function () {
      const userName = document.querySelector("#userName").value.trim();
      const password = document.querySelector("#password").value;

      const user = NikeApp.findUserByUsername(userName);
      if (!user) {
        NikeApp.showMsg(loginError, "Username not found. Please register first.");
        return;
      }

      if (user.password !== password) {
        NikeApp.showMsg(loginError, "Incorrect password. Please try again.");
        return;
      }

      NikeApp.setSession(user);
      if (typeof NikeApp.reloadUserCart === "function") NikeApp.reloadUserCart();
      if (typeof NikeApp.reloadUserFavorites === "function") NikeApp.reloadUserFavorites();
      regestOverlay.classList.remove("show");
      NikeApp.clearLoginForm();
      showSuccessOverlay("Login Successfully", `Welcome Back, ${user.name}!`);
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener("click", function () {
      const name = document.querySelector("#regName").value.trim();
      const username = document.querySelector("#regUserName").value.trim();
      const email = document.querySelector("#regEmail").value.trim();
      const password = document.querySelector("#regPassword").value;

      if (NikeApp.findUserByUsername(username)) {
        NikeApp.showMsg(regError, "Username already exists. Please choose another.");
        return;
      }

      if (NikeApp.findUserByEmail(email)) {
        NikeApp.showMsg(regError, "Email already registered. Please use another email.");
        return;
      }

      const users = NikeApp.getUsers();
      users.push({ name, username, email, password });
      NikeApp.saveUsers(users);

      NikeApp.setSession({ name, username, email });
      if (typeof NikeApp.reloadUserCart === "function") NikeApp.reloadUserCart();
      if (typeof NikeApp.reloadUserFavorites === "function") NikeApp.reloadUserFavorites();

      NikeApp.showMsg(regSuccess, "Account created! Redirecting...");
      registerBtn.disabled = true;

      setTimeout(function () {
        regestOverlay.classList.remove("show");
        NikeApp.clearRegisterForm();
        NikeApp.switchTab("login");
        showSuccessOverlay("Registration Successful", `Welcome, ${name}!`);
      }, 1200);
    });
  }

  if (okButton) {
    okButton.addEventListener("click", function () {
      successOverlay.classList.remove("show");
    });
  }

  try {
    const raw = sessionStorage.getItem("nike_open_auth_after_redirect");
    if (raw) {
      const directive = JSON.parse(raw);
      sessionStorage.removeItem("nike_open_auth_after_redirect");
      const tab = directive && directive.tab === "register" ? "register" : "login";
      setTimeout(function () {
        NikeApp.openAuth(tab);
      }, 250);
    }
  } catch (e) {}

  NikeApp.refreshAuthSessionUI();
  if (typeof NikeApp.reloadUserCart === "function") NikeApp.reloadUserCart();
  if (typeof NikeApp.reloadUserFavorites === "function") NikeApp.reloadUserFavorites();
};
