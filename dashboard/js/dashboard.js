// ===============================================
// DASHBOARD PAGE SPECIFIC JAVASCRIPT
// ===============================================

document.addEventListener("DOMContentLoaded", function () {
  // Load user-specific dashboard data
  loadDashboardData();

  // Initialize any dashboard-specific charts or widgets
  initializeDashboardWidgets();
});

function loadDashboardData() {
  const userData = getCurrentUserData();
  if (!userData) return;

  // Get user's farm data from Firebase
  const emailKey = userData.email.replace(/\./g, "_");
  database
    .ref("farms/" + emailKey)
    .once("value")
    .then((snapshot) => {
      if (snapshot.exists()) {
        const farmData = snapshot.val();

        // Update dashboard with user's farm data
        updateDashboardWithFarmData(farmData);
      } else {
        console.log("No farm data available");
      }
    })
    .catch((error) => {
      console.error("Error loading farm data:", error);
    });
}

function updateDashboardWithFarmData(farmData) {
  // Update healthy plants percentage
  if (farmData.healthyPlantsPercentage) {
    const healthyPlantsElement = document.querySelector(
      ".card-hover .text-2xl"
    );
    if (healthyPlantsElement) {
      healthyPlantsElement.textContent = farmData.healthyPlantsPercentage + "%";
    }
  }

  // Update expected yield
  if (farmData.expectedYield) {
    const yieldElements = document.querySelectorAll(".card-hover .text-2xl");
    if (yieldElements.length > 1) {
      yieldElements[1].textContent = farmData.expectedYield + " tonnes";
    }
  }

  // Update crop prices
  if (farmData.cropPrices) {
    const priceElements = document.querySelectorAll(".card-hover .text-2xl");
    if (farmData.cropPrices.cabbage && priceElements.length > 2) {
      priceElements[2].textContent =
        "Ksh " + farmData.cropPrices.cabbage + " / kg";
    }
    if (farmData.cropPrices.kale && priceElements.length > 3) {
      priceElements[3].textContent =
        "Ksh " + farmData.cropPrices.kale + " / kg";
    }
  }

  // Update growth progress
  if (farmData.growthProgress) {
    const progressBars = document.querySelectorAll(".bg-green-600.h-2");
    if (farmData.growthProgress.cabbage && progressBars.length > 0) {
      progressBars[0].style.width = farmData.growthProgress.cabbage + "%";
      const progressText = document.querySelectorAll(
        ".text-sm.font-semibold.text-green-600"
      );
      if (progressText.length > 0) {
        progressText[0].textContent = farmData.growthProgress.cabbage + "%";
      }
    }
    if (farmData.growthProgress.kale && progressBars.length > 1) {
      progressBars[1].style.width = farmData.growthProgress.kale + "%";
      const progressText = document.querySelectorAll(
        ".text-sm.font-semibold.text-green-600"
      );
      if (progressText.length > 1) {
        progressText[1].textContent = farmData.growthProgress.kale + "%";
      }
    }
  }
}

function initializeDashboardWidgets() {
  // Initialize weather widget if needed
  // This could fetch real weather data based on user's location
  // Initialize any other dashboard-specific widgets
}

// Function to save dashboard data to Firebase
function saveDashboardData(data) {
  const userData = getCurrentUserData();
  if (!userData) return;

  const emailKey = userData.email.replace(/\./g, "_");
  database
    .ref("farms/" + emailKey)
    .update(data)
    .then(() => {
      console.log("Dashboard data saved successfully");
    })
    .catch((error) => {
      console.error("Error saving dashboard data:", error);
    });
}
