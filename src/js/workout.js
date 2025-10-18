import { getLocalStorage, setLocalStorage } from "./utils.js";

export function renderWorkout() {
  const workoutForm = document.getElementById("workout-form");
  const workoutList = document.querySelector(".workout-entries");
  if (!workoutForm || !workoutList) {
    console.error("Workout form or list not found");
    return;
  }

  // Load existing workouts
  const workouts = getLocalStorage("fitness-workouts") || [];
  workoutList.innerHTML = workouts.map(workout => `
    <li>
      ${workout.name} - ${workout.time} min${workout.reps ? `, ${workout.reps} reps` : ""}
      <button class="delete-workout" data-date="${workout.date}" data-name="${workout.name}">Delete</button>
    </li>
  `).join("");

  // Form submission
  workoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("exercise-name").value.trim();
    const time = parseInt(document.getElementById("exercise-time").value, 10);
    const reps = parseInt(document.getElementById("exercise-reps").value, 10) || 0;
    if (!name || !time) return;

    const date = new Date().toISOString().split("T")[0];
    const newWorkout = { name, time, reps, date };
    workouts.push(newWorkout);
    setLocalStorage("fitness-workouts", workouts);

    workoutList.innerHTML += `
      <li>
        ${name} - ${time} min${reps ? `, ${reps} reps` : ""}
        <button class="delete-workout" data-date="${date}" data-name="${name}">Delete</button>
      </li>
    `;
    workoutForm.reset();
  });

  // Delete workout
  workoutList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-workout")) {
      const date = e.target.dataset.date;
      const name = e.target.dataset.name;
      const updatedWorkouts = workouts.filter(w => !(w.date === date && w.name === name));
      setLocalStorage("fitness-workouts", updatedWorkouts);
      renderWorkout();
    }
  });
}