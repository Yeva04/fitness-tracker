import { getLocalStorage, setLocalStorage } from "./utils.js";
import Chart from "chart.js/auto";

// Fetch Strava access token
async function fetchStravaToken(code, clientId, clientSecret) {
  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: "authorization_code"
    })
  });

  if (!response.ok) {
    throw new Error(`Strava token fetch failed: ${response.status}`);
  }
  return await response.json();
}

// Fetch Strava activity data
async function fetchStravaData(accessToken, date) {
  const startTime = new Date(date).getTime() / 1000;
  const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${startTime}&per_page=10`, {
    headers: { "Authorization": `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error(`Strava data fetch failed: ${response.status}`);
  }
  const activities = await response.json();
  const steps = activities.reduce((sum, act) => sum + (act.steps || 0), 0);
  const caloriesBurned = activities.reduce((sum, act) => sum + (act.calories || 0), 0);
  return { steps, caloriesBurned };
}

// Calculate workout calories
function calculateWorkoutCalories(workouts, date) {
  const METs = {
    running: 7.0,
    cycling: 6.0,
    swimming: 6.0,
    "weight training": 3.5,
    yoga: 2.5
  };
  return workouts
    .filter(w => w.date === date)
    .reduce((sum, w) => {
      const met = METs[w.name.toLowerCase()] || 3.0;
      const duration = parseInt(w.time, 10) / 60;
      const user = getLocalStorage("fitness-users")?.find(u => u.email === getLocalStorage("current-user"));
      const weight = user?.weight || 70;
      return sum + met * weight * duration;
    }, 0);
}

export async function renderDashboard() {
  const workouts = getLocalStorage("fitness-workouts") || [];
  const foods = getLocalStorage("fitness-foods") || [];
  const stravaData = getLocalStorage("fitness-strava") || [];
  const tableBody = document.querySelector("#progress-table tbody");
  const canvas = document.getElementById("progress-chart");
  const suggestions = document.getElementById("suggestions");
  if (!tableBody || !canvas || !suggestions) {
    console.error("Dashboard elements not found");
    return;
  }

  // Sample data for testing if empty
  const sampleWorkouts = workouts.length ? workouts : [
    { date: "2025-10-18", name: "Running", time: "30", reps: "0" },
    { date: "2025-10-19", name: "Cycling", time: "45", reps: "0" }
  ];
  const sampleFoods = foods.length ? foods : [
    { date: "2025-10-18", name: "Apple", calories: 95, protein: 0.5 },
    { date: "2025-10-19", name: "Chicken", calories: 200, protein: 27 }
  ];
  const sampleStrava = stravaData.length ? stravaData : [
    { date: "2025-10-18", steps: 8000, caloriesBurned: 300 },
    { date: "2025-10-19", steps: 10000, caloriesBurned: 400 }
  ];

  // Use sample data if empty
  const finalWorkouts = workouts.length ? workouts : sampleWorkouts;
  const finalFoods = foods.length ? foods : sampleFoods;
  const finalStrava = stravaData.length ? stravaData : sampleStrava;

  // Group data by date
  const dates = [...new Set([
    ...finalWorkouts.map(w => w.date),
    ...finalFoods.map(f => f.date),
    ...finalStrava.map(s => s.date)
  ])].sort();

  const workoutCounts = dates.map(date => ({
    date,
    count: finalWorkouts.filter(w => w.date === date).length
  }));
  const calorieSums = dates.map(date => ({
    date,
    calories: finalFoods.filter(f => f.date === date).reduce((sum, f) => sum + f.calories, 0)
  }));
  const proteinSums = dates.map(date => ({
    date,
    protein: finalFoods.filter(f => f.date === date).reduce((sum, f) => sum + (f.protein || 0), 0)
  }));
  const workoutCalories = dates.map(date => ({
    date,
    caloriesBurned: Math.round(calculateWorkoutCalories(finalWorkouts, date))
  }));
  const stepCounts = dates.map(date => ({
    date,
    steps: finalStrava.find(s => s.date === date)?.steps || 0
  }));
  const stravaCalories = dates.map(date => ({
    date,
    caloriesBurned: finalStrava.find(s => s.date === date)?.caloriesBurned || 0
  }));

  // Update table
  tableBody.innerHTML = dates.map(date => `
    <tr>
      <td>${date}</td>
      <td>${workoutCounts.find(w => w.date === date)?.count || 0}</td>
      <td>${calorieSums.find(c => c.date === date)?.calories || 0}</td>
      <td>${proteinSums.find(p => p.date === date)?.protein || 0}</td>
      <td>${workoutCalories.find(w => w.date === date)?.caloriesBurned || 0}</td>
      <td>${stepCounts.find(s => s.date === date)?.steps || 0}</td>
      <td>${stravaCalories.find(c => c.date === date)?.caloriesBurned || 0}</td>
    </tr>
  `).join("");

  // Render forex-style line chart with visible lines
  if (window.progressChart) window.progressChart.destroy();
  window.progressChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Workouts",
          data: workoutCounts.map(w => w.count),
          borderColor: "#4CAF50",
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.1
        },
        {
          label: "Calories Consumed",
          data: calorieSums.map(c => c.calories),
          borderColor: "#F44336",
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.1
        },
        {
          label: "Protein Retained (g)",
          data: proteinSums.map(p => p.protein),
          borderColor: "#26A69A",
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.1
        },
        {
          label: "Workout Calories Burned",
          data: workoutCalories.map(w => w.caloriesBurned),
          borderColor: "#9C27B0",
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.1
        },
        {
          label: "Steps",
          data: stepCounts.map(s => s.steps),
          borderColor: "#2196F3",
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.1
        },
        {
          label: "Strava Calories Burned",
          data: stravaCalories.map(c => c.caloriesBurned),
          borderColor: "#FF9800",
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          mode: "index",
          intersect: false,
          position: "nearest",
          callbacks: {
            label: context => `${context.dataset.label}: ${context.parsed.y}`
          }
        },
        legend: {
          display: true,
          position: "top",
          labels: { color: "#333", font: { size: 12 } }
        }
      },
      interaction: {
        mode: "index",
        intersect: false
      },
      scales: {
        x: {
          grid: { display: true, color: "#33333333" },
          ticks: { color: "#333", maxRotation: 45, autoSkip: true }
        },
        y: {
          beginAtZero: true,
          grid: { color: "#33333333" },
          ticks: { color: "#333", stepSize: 100 }
        }
      }
    }
  });

  // Export data
  document.getElementById("export-data")?.addEventListener("click", () => {
    const data = {
      workouts: finalWorkouts,
      foods: finalFoods,
      strava: finalStrava,
      goals: getLocalStorage("fitness-goals") || []
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fitness-data.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  // Strava button
  const stravaButton = document.getElementById("fetch-strava");
  if (stravaButton) {
    stravaButton.addEventListener("click", async () => {
      const clientId = "YOUR_STRAVA_CLIENT_ID"; // Replace with your ID
      const basePath = import.meta.env.BASE_URL || '/fitness-tracker/';
      const redirectUri = `${window.location.origin}${basePath}dashboard.html`;
      const scopes = "activity:read";
      const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}`;
      window.location.href = authUrl;
    });
  }

  // Handle Strava callback
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  if (code) {
    const clientId = "YOUR_STRAVA_CLIENT_ID"; // Replace with your ID
    const clientSecret = "YOUR_STRAVA_CLIENT_SECRET"; // Replace with your secret
    const date = new Date().toISOString().split("T")[0];
    const basePath = import.meta.env.BASE_URL || '/fitness-tracker/';
    try {
      const tokenData = await fetchStravaToken(code, clientId, clientSecret);
      const stravaData = await fetchStravaData(tokenData.access_token, date);
      const stravaItems = getLocalStorage("fitness-strava") || [];
      stravaItems.push({ date, steps: stravaData.steps, caloriesBurned: stravaData.caloriesBurned });
      setLocalStorage("fitness-strava", stravaItems);
      window.history.replaceState({}, document.title, `${basePath}dashboard.html`);
      renderDashboard();
    } catch (error) {
      console.error("Strava data fetch failed:", error);
      const message = document.createElement("p");
      message.textContent = "Failed to fetch Strava data. Please try again.";
      message.style.color = "#F44336";
      suggestions.appendChild(message);
    }
  }

  // Update suggestions
  updateSuggestions();
}

export function updateSuggestions() {
  const workouts = getLocalStorage("fitness-workouts") || [];
  const foods = getLocalStorage("fitness-foods") || [];
  const goals = getLocalStorage("fitness-goals") || [];
  const suggestionList = document.getElementById("suggestion-list");
  if (!suggestionList) return;

  const suggestions = [];
  const fitnessGoal = goals.find(g => g.type === "fitness-goal")?.value || "fat-burning";

  if (workouts.length < 3) {
    suggestions.push("Try a new workout to stay consistent.");
  }
  if (foods.length < 3) {
    suggestions.push("Add a healthy meal to track nutrition.");
  }
  if (workouts.some(w => w.name.toLowerCase().includes("run"))) {
    suggestions.push("Mix it up with a different cardio activity.");
  }
  if (foods.some(f => f.name.toLowerCase().includes("pizza"))) {
    suggestions.push("Try a nutrient-dense meal option.");
  }

  if (fitnessGoal === "fat-burning") {
    suggestions.push("HIIT workout: 20 min of sprints and bodyweight exercises.");
    suggestions.push("Cycling: 30 min at moderate pace to burn calories.");
    suggestions.push("Jump rope: 15 min for high-intensity cardio.");
    suggestions.push("Swimming: 30 min to engage full body and boost metabolism.");
  } else if (fitnessGoal === "muscle-building") {
    suggestions.push("Strength training: 3 sets of squats with weights.");
    suggestions.push("Push-ups and pull-ups: 3 sets to build upper body.");
    suggestions.push("Deadlifts: 3 sets to target multiple muscle groups.");
    suggestions.push("Bench press: 3 sets to strengthen chest and arms.");
  }

  suggestionList.innerHTML = suggestions.slice(0, 4).map(s => `<li>${s}</li>`).join("");
}