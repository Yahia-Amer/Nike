window.NikeApp = window.NikeApp || {};

NikeApp.initValidation = function initValidation() {
  const userRegex = /^[a-zA-Z][a-zA-Z0-9_ ]{2,19}$/;
  const nameRegex = /^[a-zA-Z][a-zA-Z ]{2,49}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function updateRule(element, valid) {
    const icon = element.querySelector("i");
    if (valid) {
      element.classList.add("valid");
      element.classList.remove("invalid");
      icon.classList.remove("fa-xmark");
      icon.classList.add("fa-check");
    } else {
      element.classList.add("invalid");
      element.classList.remove("valid");
      icon.classList.remove("fa-check");
      icon.classList.add("fa-xmark");
    }
  }

  function setBorder(input, valid) {
    if (valid) {
      input.classList.add("valid-border");
      input.classList.remove("invalid-border");
    } else if (input.value.length > 0) {
      input.classList.add("invalid-border");
      input.classList.remove("valid-border");
    } else {
      input.classList.remove("valid-border", "invalid-border");
    }
  }

  const userName = document.querySelector("#userName");
  const password = document.querySelector("#password");
  const loginButton = document.querySelector("#loginBtn");
  const loginError = document.querySelector("#loginError");

  let validUser = false;
  let validPassword = false;

  function checkLoginForm() {
    if (validUser && validPassword) {
      loginButton.disabled = false;
    } else {
      loginButton.disabled = true;
    }
  }

  function hideLoginError() {
    if (loginError) loginError.classList.remove("show");
  }

  userName.addEventListener("input", function () {
    validUser = userName.value.trim().length > 0;
    setBorder(userName, validUser);
    hideLoginError();
    checkLoginForm();
  });

  password.addEventListener("input", function () {
    validPassword = password.value.trim().length > 0;
    setBorder(password, validPassword);
    hideLoginError();
    checkLoginForm();
  });

  const regName = document.querySelector("#regName");
  const regUserName = document.querySelector("#regUserName");
  const regEmail = document.querySelector("#regEmail");
  const regPassword = document.querySelector("#regPassword");
  const regConfirmPassword = document.querySelector("#regConfirmPassword");
  const registerBtn = document.querySelector("#registerBtn");
  const regError = document.querySelector("#regError");
  const regSuccess = document.querySelector("#regSuccess");

  const regLengthRule = document.querySelector("#regLength");
  const regUpperRule = document.querySelector("#regUpper");
  const regLowerRule = document.querySelector("#regLower");
  const regNumberRule = document.querySelector("#regNumber");
  const regMatchRule = document.querySelector("#regMatch");

  let validRegName = false;
  let validRegUser = false;
  let validRegEmail = false;
  let validRegPass = false;
  let validRegMatch = false;

  function checkRegForm() {
    if (validRegName && validRegUser && validRegEmail && validRegPass && validRegMatch) {
      registerBtn.disabled = false;
    } else {
      registerBtn.disabled = true;
    }
  }

  function hideRegMsgs() {
    if (regError) regError.classList.remove("show");
    if (regSuccess) regSuccess.classList.remove("show");
  }

  regName.addEventListener("input", function () {
    validRegName = nameRegex.test(regName.value);
    setBorder(regName, validRegName);
    hideRegMsgs();
    checkRegForm();
  });

  regUserName.addEventListener("input", function () {
    validRegUser = userRegex.test(regUserName.value);
    setBorder(regUserName, validRegUser);
    hideRegMsgs();
    checkRegForm();
  });

  regEmail.addEventListener("input", function () {
    validRegEmail = emailRegex.test(regEmail.value);
    setBorder(regEmail, validRegEmail);
    hideRegMsgs();
    checkRegForm();
  });

  function checkRegPassword() {
    const value = regPassword.value;
    const hasLength = value.length >= 8;
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);

    updateRule(regLengthRule, hasLength);
    updateRule(regUpperRule, hasUpper);
    updateRule(regLowerRule, hasLower);
    updateRule(regNumberRule, hasNumber);

    validRegPass = hasLength && hasUpper && hasLower && hasNumber;
    setBorder(regPassword, validRegPass);

    validRegMatch = regConfirmPassword.value.length > 0
      && regPassword.value === regConfirmPassword.value;
    updateRule(regMatchRule, validRegMatch);
    if (regConfirmPassword.value.length > 0) {
      setBorder(regConfirmPassword, validRegMatch);
    }

    hideRegMsgs();
    checkRegForm();
  }

  regPassword.addEventListener("input", checkRegPassword);

  regConfirmPassword.addEventListener("input", function () {
    if (regPassword.value.length === 0 || regConfirmPassword.value.length === 0) {
      validRegMatch = false;
      updateRule(regMatchRule, false);
      regConfirmPassword.classList.remove("valid-border", "invalid-border");
    } else {
      validRegMatch = regPassword.value === regConfirmPassword.value;
      updateRule(regMatchRule, validRegMatch);
      setBorder(regConfirmPassword, validRegMatch);
    }
    hideRegMsgs();
    checkRegForm();
  });
};
