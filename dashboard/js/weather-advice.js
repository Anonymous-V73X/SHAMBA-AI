// ===============================================
// WEATHER ADVICE PAGE SPECIFIC JAVASCRIPT
// ===============================================

document.addEventListener("DOMContentLoaded", function () {
  // Load user's location and weather data
  loadWeatherData();

  // Load weather recommendations
  loadWeatherRecommendations();
});

function loadWeatherData() {
  const userData = getCurrentUserData();
  if (!userData || !userData.location) return;

  // In a real application, you would fetch weather data based on user's location
  // For this example, we'll simulate weather data

  // Update current weather display
  updateCurrentWeather({
    temperature: 22,
    condition: "Sunny",
    humidity: 65,
    windSpeed: 12,
  });

  // Update weekly forecast
  updateWeeklyForecast([
    { day: "Today", condition: "sunny", temp: 22 },
    { day: "Tomorrow", condition: "partly-cloudy", temp: 20 },
    { day: "Wed", condition: "rainy", temp: 18 },
    { day: "Thu", condition: "cloudy", temp: 19 },
    { day: "Fri", condition: "sunny", temp: 23 },
    { day: "Sat", condition: "sunny", temp: 25 },
    { day: "Sun", condition: "partly-cloudy", temp: 21 },
  ]);
}

function updateCurrentWeather(weatherData) {
  const tempElement = document.querySelector(
    ".text-3xl.font-bold.text-primary"
  );
  const conditionElement = document.querySelector(".text-secondary.mb-4");
  const humidityElement = document.querySelector(
    ".grid.grid-cols-2 .font-semibold.text-primary"
  );
  const windElement = document.querySelectorAll(
    ".grid.grid-cols-2 .font-semibold.text-primary"
  )[1];

  if (tempElement) tempElement.textContent = weatherData.temperature + "°C";
  if (conditionElement) conditionElement.textContent = weatherData.condition;
  if (humidityElement) humidityElement.textContent = weatherData.humidity + "%";
  if (windElement) windElement.textContent = weatherData.windSpeed + " km/h";

  // Update weather icon
  const weatherIcon = document.querySelector(".fas.fa-sun.text-6xl");
  if (weatherIcon) {
    // Remove existing icon classes
    weatherIcon.classList.remove(
      "fa-sun",
      "fa-cloud-sun",
      "fa-cloud-rain",
      "fa-cloud"
    );

    // Add appropriate icon class based on condition
    switch (weatherData.condition.toLowerCase()) {
      case "sunny":
        weatherIcon.classList.add("fa-sun");
        weatherIcon.classList.add("text-yellow-500");
        break;
      case "partly-cloudy":
        weatherIcon.classList.add("fa-cloud-sun");
        weatherIcon.classList.add("text-gray-500");
        break;
      case "rainy":
        weatherIcon.classList.add("fa-cloud-rain");
        weatherIcon.classList.add("text-blue-500");
        break;
      case "cloudy":
        weatherIcon.classList.add("fa-cloud");
        weatherIcon.classList.add("text-gray-500");
        break;
    }
  }
}

function updateWeeklyForecast(forecastData) {
  const forecastContainer = document.querySelector(
    ".grid.grid-cols-3.md\\:grid-cols-7"
  );
  if (!forecastContainer) return;

  forecastContainer.innerHTML = "";

  forecastData.forEach((day) => {
    const dayElement = document.createElement("div");
    dayElement.className = "text-center";

    let iconClass = "";
    let iconColor = "";

    switch (day.condition) {
      case "sunny":
        iconClass = "fa-sun";
        iconColor = "text-yellow-500";
        break;
      case "partly-cloudy":
        iconClass = "fa-cloud-sun";
        iconColor = "text-gray-500";
        break;
      case "rainy":
        iconClass = "fa-cloud-rain";
        iconColor = "text-blue-500";
        break;
      case "cloudy":
        iconClass = "fa-cloud";
        iconColor = "text-gray-500";
        break;
    }

    dayElement.innerHTML = `
      <p class="text-sm text-secondary mb-2">${day.day}</p>
      <i class="fas ${iconClass} ${iconColor} text-2xl mb-2"></i>
      <p class="text-sm font-semibold text-primary">${day.temp}°C</p>
    `;

    forecastContainer.appendChild(dayElement);
  });
}

function loadWeatherRecommendations() {
  const userData = getCurrentUserData();
  if (!userData) return;

  // In a real application, you would generate recommendations based on weather data and user's crops
  // For this example, we'll use static recommendations

  // The recommendations are already in the HTML, so we don't need to update them
  // In a real app, you would fetch them from Firebase or generate them based on weather data
}

function saveWeatherData(weatherData) {
  const userData = getCurrentUserData();
  if (!userData) return;

  const emailKey = userData.email.replace(/\./g, "_");
  database
    .ref("weatherData/" + emailKey)
    .set({
      ...weatherData,
      timestamp: new Date().toISOString(),
    })
    .then(() => {
      console.log("Weather data saved successfully");
    })
    .catch((error) => {
      console.error("Error saving weather data:", error);
    });
}
