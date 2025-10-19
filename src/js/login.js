import { getLocalStorage, setLocalStorage } from "./utils.js";

console.log("login.js loaded");

export function initializeLogin() {
  console.log("initializeLogin called");

  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const signupModal = document.getElementById("signup-modal");
  const showSignup = document.getElementById("show-signup");
  const modalClose = document.querySelector("#signup-modal .modal-close");

  console.log("Elements:", { loginForm, signupForm, signupModal, showSignup, modalClose });

  if (!loginForm || !signupForm || !signupModal || !showSignup || !modalClose) {
    console.error("One or more form elements not found");
    alert("Form setup error. Please contact support.");
    return;
  }

  signupModal.classList.remove("show");
  signupModal.style.display = "none";
  console.log("Signup modal hidden");

  const basePath = import.meta.env.BASE_URL || '/fitness-tracker/';
  const dashboardUrl = `${basePath}dashboard.html`.replace('//', '/');
  console.log("Base path:", basePath, "Dashboard URL:", dashboardUrl);

  showSignup.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Show signup clicked");
    signupModal.classList.add("show");
    signupModal.style.display = "flex";
  });

  modalClose.addEventListener("click", () => {
    console.log("Modal close clicked");
    signupModal.classList.remove("show");
    signupModal.style.display = "none";
    signupForm.reset();
  });

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("Signup form submitted");
    const username = document.getElementById("signup-username")?.value.trim();
    const email = document.getElementById("signup-email")?.value.trim();
    const gender = document.getElementById("signup-gender")?.value;
    const height = parseInt(document.getElementById("signup-height")?.value, 10);
    const weight = parseInt(document.getElementById("signup-weight")?.value, 10);

    console.log("Signup data:", { username, email, gender, height, weight });

    if (!username || !email || !gender || !height || !weight) {
      console.warn("Signup validation failed: Missing fields");
      alert("Please fill all fields.");
      return;
    }

    const users = getLocalStorage("fitness-users") || [];
    if (users.find(u => u.email === email)) {
      console.warn("Signup failed: Email already registered");
      alert("Email already registered.");
      return;
    }

    const user = { username, email, gender, height, weight };
    try {
      setLocalStorage("fitness-users", users.concat(user));
      setLocalStorage("current-user", email);
      console.log("User registered:", user);
      console.log("localStorage:", {
        "fitness-users": getLocalStorage("fitness-users"),
        "current-user": getLocalStorage("current-user")
      });
    } catch (error) {
      console.error("localStorage set failed:", error);
      alert("Failed to save user data.");
      return;
    }

    signupForm.reset();
    signupModal.classList.remove("show");
    signupModal.style.display = "none";

    console.log("Attempting redirect to:", dashboardUrl);
    window.location.href = dashboardUrl;
    setTimeout(() => {
      console.log("Checking redirect, current URL:", window.location.href);
      if (!window.location.href.includes("dashboard.html")) {
        console.warn("Redirect failed, forcing to:", dashboardUrl);
        window.location.assign(dashboardUrl);
      }
    }, 1000);
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("Login form submitted");
    const username = document.getElementById("login-username")?.value.trim();
    const email = document.getElementById("login-email")?.value.trim();
    console.log("Login data:", { username, email });

    if (!username || !email) {
      console.warn("Login validation failed: Missing fields");
      alert("Please fill all fields.");
      return;
    }

    const users = getLocalStorage("fitness-users") || [];
    console.log("Stored users:", users);
    const user = users.find(u => u.username === username && u.email === email);
    if (user) {
      try {
        setLocalStorage("current-user", email);
        console.log("Login successful, current-user:", email);
        console.log("localStorage:", {
          "fitness-users": getLocalStorage("fitness-users"),
          "current-user": getLocalStorage("current-user")
        });
      } catch (error) {
        console.error("localStorage set failed:", error);
        alert("Failed to save login data.");
        return;
      }
      console.log("Attempting redirect to:", dashboardUrl);
      window.location.href = dashboardUrl;
      setTimeout(() => {
        console.log("Checking redirect, current URL:", window.location.href);
        if (!window.location.href.includes("dashboard.html")) {
          console.warn("Redirect failed, forcing to:", dashboardUrl);
          window.location.assign(dashboardUrl);
        }
      }, 1000);
    } else {
      console.warn("Login failed: Invalid username or email");
      alert("Invalid username or email.");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing login");
  initializeLogin();
});