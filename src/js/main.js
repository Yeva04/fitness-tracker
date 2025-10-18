import { renderWorkout } from "./workout.js";
import { renderNutrition } from "./nutrition.js";
import { renderGoals } from "./goals.js";
import { renderDashboard } from "./dashboard.js";
import { getLocalStorage } from "./utils.js";

export function initializeApp() {
  console.log("Initializing app...");

  // Check if user is logged in
  const currentUser = getLocalStorage("current-user");
  if (!currentUser) {
    const basePath = import.meta.env.BASE_URL || '/';
    console.log("No user found, redirecting to login");
    window.location.href = `${basePath}index.html`;
    return;
  }

  // Select DOM elements
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  const navButtons = document.querySelectorAll(".nav-menu button");
  const sections = document.querySelectorAll("main section");

  console.log("Hamburger:", hamburger);
  console.log("Nav Menu:", navMenu);
  console.log("Nav Buttons:", navButtons.length, navButtons);
  console.log("Sections:", sections.length, sections);

  // Hamburger menu toggle
  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      console.log("Hamburger clicked");
      navMenu.classList.toggle("active");
      hamburger.textContent = navMenu.classList.contains("active") ? "✕" : "☰";
    });
  } else {
    console.error("Error: Hamburger or nav-menu not found");
  }

  // Navigation button handling
  if (navButtons.length && sections.length) {
    navButtons.forEach(button => {
      button.addEventListener("click", () => {
        console.log(`Clicked button: ${button.id}`);
        navButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        sections.forEach(section => section.classList.add("hidden"));
        const sectionId = `${button.id.replace("nav-", "")}-section`;
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
          targetSection.classList.remove("hidden");
          console.log(`Showing section: ${sectionId}`);
        } else {
          console.error(`Section not found: ${sectionId}`);
        }
        switch (button.id) {
          case "nav-workout":
            renderWorkout();
            break;
          case "nav-nutrition":
            renderNutrition();
            break;
          case "nav-goals":
            renderGoals();
            break;
          case "nav-dashboard":
            renderDashboard();
            break;
          default:
            console.error(`Unknown button: ${button.id}`);
        }
        if (navMenu.classList.contains("active")) {
          navMenu.classList.remove("active");
          hamburger.textContent = "☰";
          console.log("Closing hamburger menu");
        }
      });
    });
  } else {
    console.error("Error: Nav buttons or sections not found");
  }

  // Initialize with Workout section
  const workoutSection = document.getElementById("workout-section");
  if (workoutSection) {
    sections.forEach(section => section.classList.add("hidden"));
    workoutSection.classList.remove("hidden");
    navButtons.forEach(btn => btn.classList.remove("active"));
    document.getElementById("nav-workout")?.classList.add("active");
    renderWorkout();
    console.log("Initialized with Workout section");
  } else {
    console.error("Error: Workout section not found");
  }
}

document.addEventListener("DOMContentLoaded", initializeApp);