// ===============================================
// YIELD PREDICTION PAGE SPECIFIC JAVASCRIPT
// ===============================================

document.addEventListener("DOMContentLoaded", function () {
  // Initialize custom selects
  initializeCustomSelects();

  // Load saved yield predictions
  loadYieldPredictions();

  // Load yield analysis
  loadYieldAnalysis();
});

function initializeCustomSelects() {
  const customSelects = document.querySelectorAll(".custom-select");

  customSelects.forEach((select) => {
    const input = select.querySelector(".custom-select-input");
    const dropdown = select.querySelector(".custom-select-dropdown");
    const valueSpan = select.querySelector(".custom-select-value");
    const options = select.querySelectorAll(".custom-select-option");

    input.addEventListener("click", (e) => {
      e.stopPropagation();
      // Close other dropdowns
      customSelects.forEach((otherSelect) => {
        if (otherSelect !== select) {
          otherSelect.classList.remove("open");
          otherSelect
            .querySelector(".custom-select-dropdown")
            .classList.add("hidden");
        }
      });

      // Toggle current dropdown
      select.classList.toggle("open");
      dropdown.classList.toggle("hidden");
    });

    options.forEach((option) => {
      option.addEventListener("click", () => {
        const value = option.getAttribute("data-value");
        const text = option.textContent;

        valueSpan.textContent = text;
        valueSpan.setAttribute("data-value", value);

        select.classList.remove("open");
        dropdown.classList.add("hidden");
      });
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", () => {
    customSelects.forEach((select) => {
      select.classList.remove("open");
      select.querySelector(".custom-select-dropdown").classList.add("hidden");
    });
  });
}

function calculateYield() {
  // Get form values
  const cropType = document
    .querySelector('[data-field="cropType"] .custom-select-value')
    .getAttribute("data-value");
  const farmArea = document.getElementById("farm-area").value;
  const plantingDensity = document.getElementById("planting-density").value;
  const variety = document
    .querySelector('[data-field="variety"] .custom-select-value')
    .getAttribute("data-value");
  const conditions = document
    .querySelector('[data-field="conditions"] .custom-select-value')
    .getAttribute("data-value");

  // Validate inputs
  if (!cropType || !farmArea || !plantingDensity || !variety || !conditions) {
    alert("Please fill in all fields");
    return;
  }

  // Calculate yield (simplified calculation for demo)
  const area = parseFloat(farmArea);
  const density = parseFloat(plantingDensity);

  // Base yield per plant (kg)
  let baseYield = 1.0; // Default for cabbage

  if (cropType === "kale") {
    baseYield = 0.3; // Kale has lower weight per plant
  } else if (cropType === "both") {
    baseYield = 0.65; // Average between cabbage and kale
  }

  // Variety multiplier
  let varietyMultiplier = 1.0;
  if (variety === "hybrid") varietyMultiplier = 1.3;
  if (variety === "organic") varietyMultiplier = 0.9;

  // Conditions multiplier
  let conditionsMultiplier = 1.0;
  if (conditions === "optimal") conditionsMultiplier = 1.2;
  if (conditions === "good") conditionsMultiplier = 1.1;
  if (conditions === "average") conditionsMultiplier = 0.9;
  if (conditions === "poor") conditionsMultiplier = 0.7;

  // Calculate total yield
  const totalPlants = area * density;
  const totalYield =
    totalPlants * baseYield * varietyMultiplier * conditionsMultiplier;
  const yieldInTons = (totalYield / 1000).toFixed(1);

  // Calculate average head weight
  const avgHeadWeight = (baseYield * varietyMultiplier).toFixed(1);

  // Calculate revenue (using average prices)
  let avgPrice = 350; // Default cabbage price
  if (cropType === "kale") avgPrice = 630;
  if (cropType === "both") avgPrice = (350 + 630) / 2;

  const revenue = (totalYield * avgPrice).toLocaleString();

  // Display results
  const results = document.getElementById("yield-results");
  if (results) {
    results.innerHTML = `
      <div class="text-left">
        <div class="text-center mb-6">
          <div class="text-4xl font-bold text-green-600 mb-2">${yieldInTons} Tons</div>
          <p class="text-gray-600">Predicted Total Yield</p>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-600">Yield per hectare</span>
            <span class="font-semibold">${(yieldInTons / area).toFixed(
              1
            )} tons</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-600">Average head weight</span>
            <span class="font-semibold">${avgHeadWeight} kg</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-600">Total heads expected</span>
            <span class="font-semibold">${totalPlants.toLocaleString()} heads</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <span class="text-sm text-green-700">Estimated revenue</span>
            <span class="font-semibold text-green-600">KES ${revenue}</span>
          </div>
        </div>
      </div>
    `;
  }

  // Save prediction to Firebase
  saveYieldPrediction({
    cropType,
    farmArea: area,
    plantingDensity: density,
    variety,
    conditions,
    predictedYield: parseFloat(yieldInTons),
    predictedRevenue: parseInt(revenue.replace(/,/g, "")),
    date: new Date().toISOString().split("T")[0],
  });
}

function saveYieldPrediction(prediction) {
  const userData = getCurrentUserData();
  if (!userData) return;

  const emailKey = userData.email.replace(/\./g, "_");
  const newPredictionRef = database.ref("yieldPredictions/" + emailKey).push();

  newPredictionRef
    .set(prediction)
    .then(() => {
      console.log("Yield prediction saved successfully");
    })
    .catch((error) => {
      console.error("Error saving yield prediction:", error);
    });
}

function loadYieldPredictions() {
  const userData = getCurrentUserData();
  if (!userData) return;

  const emailKey = userData.email.replace(/\./g, "_");

  database
    .ref("yieldPredictions/" + emailKey)
    .orderByChild("date")
    .limitToLast(1)
    .once("value")
    .then((snapshot) => {
      if (snapshot.exists()) {
        const predictions = snapshot.val();
        const lastPrediction = Object.values(predictions)[0];

        // Update the form with the last prediction data
        if (lastPrediction.cropType) {
          const cropTypeSelect = document.querySelector(
            '[data-field="cropType"] .custom-select-value'
          );
          if (cropTypeSelect) {
            cropTypeSelect.textContent =
              lastPrediction.cropType.charAt(0).toUpperCase() +
              lastPrediction.cropType.slice(1);
            cropTypeSelect.setAttribute("data-value", lastPrediction.cropType);
          }
        }

        if (lastPrediction.farmArea) {
          document.getElementById("farm-area").value = lastPrediction.farmArea;
        }

        if (lastPrediction.plantingDensity) {
          document.getElementById("planting-density").value =
            lastPrediction.plantingDensity;
        }

        if (lastPrediction.variety) {
          const varietySelect = document.querySelector(
            '[data-field="variety"] .custom-select-value'
          );
          if (varietySelect) {
            varietySelect.textContent =
              lastPrediction.variety.charAt(0).toUpperCase() +
              lastPrediction.variety.slice(1);
            varietySelect.setAttribute("data-value", lastPrediction.variety);
          }
        }

        if (lastPrediction.conditions) {
          const conditionsSelect = document.querySelector(
            '[data-field="conditions"] .custom-select-value'
          );
          if (conditionsSelect) {
            conditionsSelect.textContent =
              lastPrediction.conditions.charAt(0).toUpperCase() +
              lastPrediction.conditions.slice(1);
            conditionsSelect.setAttribute(
              "data-value",
              lastPrediction.conditions
            );
          }
        }
      }
    })
    .catch((error) => {
      console.error("Error loading yield predictions:", error);
    });
}

function loadYieldAnalysis() {
  const userData = getCurrentUserData();
  if (!userData) return;

  const emailKey = userData.email.replace(/\./g, "_");

  database
    .ref("yieldAnalysis/" + emailKey)
    .once("value")
    .then((snapshot) => {
      if (snapshot.exists()) {
        const analysisData = snapshot.val();
        updateYieldAnalysis(analysisData);
      }
    })
    .catch((error) => {
      console.error("Error loading yield analysis:", error);
    });
}

function updateYieldAnalysis(analysisData) {
  // Update expected increase
  if (analysisData.expectedIncrease) {
    const increaseElement = document.querySelector(
      ".text-2xl.font-bold.text-green-600"
    );
    if (increaseElement) {
      increaseElement.textContent = analysisData.expectedIncrease + " %";
    }
  }

  // Update revenue potential
  if (analysisData.revenuePotential) {
    const revenueElement = document.querySelectorAll(".text-2xl.font-bold")[1];
    if (revenueElement) {
      revenueElement.textContent =
        "KES " + analysisData.revenuePotential.toLocaleString();
    }
  }

  // Update average head weight
  if (analysisData.avgHeadWeight) {
    const weightElement = document.querySelectorAll(".text-2xl.font-bold")[2];
    if (weightElement) {
      weightElement.textContent = analysisData.avgHeadWeight + " kg";
    }
  }
}
