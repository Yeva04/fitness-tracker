import { getLocalStorage, setLocalStorage } from "./utils.js";

export function renderGoals() {
  const goalForm = document.getElementById("goal-form");
  const goalList = document.querySelector(".goal-entries");
  const goalType = document.getElementById("goal-type");
  const goalValue = document.getElementById("goal-value");
  const fitnessGoalValue = document.getElementById("fitness-goal-value");

  if (!goalForm || !goalList || !goalType || !goalValue || !fitnessGoalValue) {
    console.error("Goal form elements not found");
    return;
  }

  // Toggle visibility of goal value inputs
  goalType.addEventListener("change", () => {
    if (goalType.value === "fitness-goal") {
      goalValue.classList.add("hidden");
      fitnessGoalValue.classList.remove("hidden");
    } else {
      goalValue.classList.remove("hidden");
      fitnessGoalValue.classList.add("hidden");
    }
  });

  // Load existing goals
  const goals = getLocalStorage("fitness-goals") || [];
  goalList.innerHTML = goals.map(goal => `
    <li>
      ${goal.type === "fitness-goal" ? `Fitness Goal: ${goal.value}` : `${goal.type}: ${goal.value}`}
      <button class="delete-goal" data-type="${goal.type}" data-value="${goal.value}">Delete</button>
    </li>
  `).join("");

  // Form submission
  goalForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const type = goalType.value;
    const value = type === "fitness-goal" ? fitnessGoalValue.value : parseInt(goalValue.value, 10);
    if (type !== "fitness-goal" && (!value || value <= 0)) return;

    const newGoal = { type, value };
    goals.push(newGoal);
    setLocalStorage("fitness-goals", goals);

    goalList.innerHTML += `
      <li>
        ${type === "fitness-goal" ? `Fitness Goal: ${value}` : `${type}: ${value}`}
        <button class="delete-goal" data-type="${type}" data-value="${value}">Delete</button>
      </li>
    `;
    goalForm.reset();
    goalType.dispatchEvent(new Event("change")); // Reset input visibility
  });

  // Delete goal
  goalList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-goal")) {
      const type = e.target.dataset.type;
      const value = e.target.dataset.value;
      const updatedGoals = goals.filter(g => !(g.type === type && g.value == value));
      setLocalStorage("fitness-goals", updatedGoals);
      renderGoals();
    }
  });
}