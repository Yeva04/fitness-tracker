import { getLocalStorage, setLocalStorage } from "./utils.js";

export function initializeLogin() {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const signupModal = document.getElementById("signup-modal");
  const showSignup = document.getElementById("show-signup");
  const modalClose = document.querySelector("#signup-modal .modal-close");

  // Debug: Log element detection
  console.log("loginForm:", loginForm);
  console.log("signupForm:", signupForm);
  console.log("signupModal:", signupModal);
  console.log("showSignup:", showSignup);
  console.log("modalClose:", modalClose);

  if (!loginForm || !signupForm || !signupModal || !showSignup || !modalClose) {
    console.error("One or more form elements not found");
    return;
  }

  // Ensure signup modal is hidden on load
  signupModal.classList.remove("show");
  signupModal.style.display = "none";
  console.log("Ensured signup modal is hidden on load");

  // Set base path for navigation
  const basePath = import.meta.env.BASE_URL || '/';
  const dashboardUrl = `${basePath}dashboard.html`;
  console.log("dashboardUrl set to:", dashboardUrl);

  // Show sign-up modal
  showSignup.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Show signup clicked");
    signupModal.classList.add("show");
    signupModal.style.display = "flex";
  });

  // Close modal
  modalClose.addEventListener("click", (e) => {
    console.log("Modal close clicked");
    signupModal.classList.remove("show");
    signupModal.style.display = "none";
    signupForm.reset();
  });

  // Sign-up form submission
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

    // Clear previous user data for clean slate
    localStorage.removeItem("workout-data");
    localStorage.removeItem("nutrition-data");
    localStorage.removeItem("goal-data");
    localStorage.removeItem("dashboard-data");
    console.log("Cleared previous user data for clean slate");

    const user = { username, email, gender, height, weight };
    users.push(user);
    setLocalStorage("fitness-users", users);
    setLocalStorage("current-user", email);
    console.log("User registered:", user);
    signupModal.classList.remove("show");
    signupModal.style.display = "none";
    signupForm.reset();
    try {
      console.log("Redirecting to:", dashboardUrl);
      window.location.replace(dashboardUrl);
    } catch (error) {
      console.error("Redirect failed:", error);
      alert("Redirect failed. Please try again.");
    }
  });

  // Login form submission
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
    const user = users.find(u => u.username === username && u.email === email);
    if (user) {
      setLocalStorage("current-user", email);
      console.log("Login successful for:", email);
      try {
        console.log("Redirecting to:", dashboardUrl);
        window.location.replace(dashboardUrl);
      } catch (error) {
        console.error("Redirect failed:", error);
        alert("Redirect failed. Please try again.");
      }
    } else {
      console.warn("Login failed: Invalid credentials");
      alert("Invalid username or email.");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM content loaded, initializing login");
  initializeLogin();
});