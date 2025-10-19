import { getLocalStorage, setLocalStorage } from "./utils.js";

export function renderNutrition() {
  const nutritionForm = document.getElementById("nutrition-form");
  const nutritionList = document.querySelector(".nutrition-entries");
  if (!nutritionForm || !nutritionList) {
    console.error("Nutrition form or list not found");
    return;
  }

  // Load existing foods
  const foods = getLocalStorage("fitness-foods") || [];
  nutritionList.innerHTML = foods.map(food => `
    <li>
      ${food.name}: ${food.calories} calories, ${food.protein}g protein
      <button class="delete-food" data-date="${food.date}" data-name="${food.name}">Delete</button>
    </li>
  `).join("");

  // Form submission
  nutritionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const foodName = document.getElementById("food-name").value.trim();
    if (!foodName) {
      alert("Please enter a food name.");
      return;
    }

    try {
      console.log("Fetching Nutritionix data for:", foodName);
      const response = await fetch("https://trackapi.nutritionix.com/v2/natural/nutrients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-id": "efe14923",
          "x-app-key": "e70d98121a97c0a5b49fc3066326871f" 
        },
        body: JSON.stringify({ query: foodName })
      });

      console.log("Nutritionix response status:", response.status);
      if (!response.ok) {
        throw new Error(`Nutritionix API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Nutritionix response data:", data);
      if (!data.foods || !data.foods[0]) {
        throw new Error("No food data returned from Nutritionix");
      }

      const foodItem = data.foods[0];
      const calories = Math.round(foodItem.nf_calories || 0);
      const protein = Math.round(foodItem.nf_protein || 0);
      const date = new Date().toISOString().split("T")[0];

      const newFood = { name: foodName, calories, protein, date };
      foods.push(newFood);
      setLocalStorage("fitness-foods", foods);

      // Re-render the full list to avoid duplicates
      nutritionList.innerHTML = foods.map(food => `
        <li>
          ${food.name}: ${food.calories} calories, ${food.protein}g protein
          <button class="delete-food" data-date="${food.date}" data-name="${food.name}">Delete</button>
        </li>
      `).join("");

      nutritionForm.reset();
    } catch (error) {
      console.error("Nutritionix fetch error:", error.message);
      alert(`Failed to fetch nutrition data: ${error.message}. Please check your API credentials or try again later.`);
    }
  });

  // Delete food
  nutritionList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-food")) {
      const date = e.target.dataset.date;
      const name = e.target.dataset.name;
      const updatedFoods = foods.filter(food => !(food.date === date && food.name === name));
      setLocalStorage("fitness-foods", updatedFoods);
      renderNutrition();
    }
  });
}