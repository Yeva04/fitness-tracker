import { getLocalStorage, setLocalStorage } from "./utils.js";

export function initializeProfile() {
  const profileIcon = document.getElementById("profile-icon");
  const profileSidebar = document.getElementById("profile-sidebar");
  const profileForm = document.getElementById("profile-form");
  const logoutButton = document.getElementById("logout");
  const avatar = document.getElementById("avatar");
  const profileUsername = document.getElementById("profile-username");
  const profileEmail = document.getElementById("profile-email");
  const profileHeight = document.getElementById("profile-height");
  const profileWeight = document.getElementById("profile-weight");

  if (!profileIcon || !profileSidebar || !profileForm || !logoutButton || !avatar || !profileUsername || !profileEmail || !profileHeight || !profileWeight) {
    console.error("Profile elements not found");
    return;
  }

  // Load current user
  const currentUserEmail = getLocalStorage("current-user");
  const users = getLocalStorage("fitness-users") || [];
  const user = users.find(u => u.email === currentUserEmail);
  if (!user) {
    window.location.href = "/index.html";
    return;
  }

  // Set avatar based on gender
  avatar.src = user.gender === "male" ? "/male-avatar.png" : "/female-avatar.png";
  profileUsername.textContent = `Username: ${user.username}`;
  profileEmail.textContent = `Email: ${user.email}`;
  profileHeight.textContent = `Height: ${user.height} cm`;
  profileWeight.textContent = `Weight: ${user.weight} kg`;

  // Toggle sidebar
  profileIcon.addEventListener("click", () => {
    profileSidebar.classList.toggle("active");
  });

  // Update profile
  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newUsername = document.getElementById("new-username").value.trim();
    const newHeight = parseInt(document.getElementById("new-height").value, 10);
    const newWeight = parseInt(document.getElementById("new-weight").value, 10);

    if (newUsername) user.username = newUsername;
    if (newHeight && newHeight >= 100 && newHeight <= 250) user.height = newHeight;
    if (newWeight && newWeight >= 30 && newWeight <= 200) user.weight = newWeight;

    const updatedUsers = users.map(u => u.email === user.email ? user : u);
    setLocalStorage("fitness-users", updatedUsers);
    profileUsername.textContent = `Username: ${user.username}`;
    profileHeight.textContent = `Height: ${user.height} cm`;
    profileWeight.textContent = `Weight: ${user.weight} kg`;
    profileForm.reset();
    profileSidebar.classList.remove("active");
  });

  // Logout
  logoutButton.addEventListener("click", () => {
    setLocalStorage("current-user", null);
    window.location.href = "/index.html";
  });
}

document.addEventListener("DOMContentLoaded", initializeProfile);