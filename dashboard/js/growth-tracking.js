// ===============================================
// GROWTH TRACKING PAGE SPECIFIC JAVASCRIPT
// ===============================================

document.addEventListener("DOMContentLoaded", function () {
  // Load growth data from Firebase
  loadGrowthData();

  // Initialize growth chart
  initializeGrowthChart();
});

function loadGrowthData() {
  const userData = getCurrentUserData();
  if (!userData) return;

  const emailKey = userData.email.replace(/\./g, "_");

  // Load growth calendar
  database
    .ref("growthCalendar/" + emailKey)
    .once("value")
    .then((snapshot) => {
      if (snapshot.exists()) {
        const calendarData = snapshot.val();
        updateGrowthCalendar(calendarData);
      }
    })
    .catch((error) => {
      console.error("Error loading growth calendar:", error);
    });

  // Load growth progress
  database
    .ref("growthProgress/" + emailKey)
    .once("value")
    .then((snapshot) => {
      if (snapshot.exists()) {
        const progressData = snapshot.val();
        updateGrowthProgress(progressData);
      }
    })
    .catch((error) => {
      console.error("Error loading growth progress:", error);
    });

  // Load next action required
  database
    .ref("nextAction/" + emailKey)
    .once("value")
    .then((snapshot) => {
      if (snapshot.exists()) {
        const actionData = snapshot.val();
        updateNextAction(actionData);
      }
    })
    .catch((error) => {
      console.error("Error loading next action:", error);
    });
}

function updateGrowthCalendar(calendarData) {
  // In a real application, you would update the calendar based on the data
  // For this example, we'll keep the static calendar
}

function updateGrowthProgress(progressData) {
  if (progressData.cabbage) {
    const cabbageProgress = document.querySelector(
      ".space-y-6 .bg-green-600.h-3"
    );
    if (cabbageProgress) {
      cabbageProgress.style.width = progressData.cabbage + "%";
    }

    const cabbageText = document.querySelectorAll(
      ".text-sm.font-medium.text-primary"
    )[0];
    const cabbageWeek = document.querySelectorAll(".text-sm.text-secondary")[0];
    if (cabbageText && cabbageWeek) {
      cabbageText.textContent = "Cabbage Growth";
      cabbageWeek.textContent = `Week ${Math.floor(
        progressData.cabbage / 12.5
      )} of 8`;
    }
  }

  if (progressData.kale) {
    const kaleProgress = document.querySelectorAll(
      ".space-y-6 .bg-green-600.h-3"
    )[1];
    if (kaleProgress) {
      kaleProgress.style.width = progressData.kale + "%";
    }

    const kaleText = document.querySelectorAll(
      ".text-sm.font-medium.text-primary"
    )[1];
    const kaleWeek = document.querySelectorAll(".text-sm.text-secondary")[1];
    if (kaleText && kaleWeek) {
      kaleText.textContent = "Kale Growth";
      kaleWeek.textContent = `Week ${Math.floor(
        progressData.kale / 16.7
      )} of 6`;
    }
  }
}

function updateNextAction(actionData) {
  const actionTitle = document.querySelector(
    ".mt-6.p-4.bg-secondary.rounded-lg h4"
  );
  const actionDescription = document.querySelector(
    ".mt-6.p-4.bg-secondary.rounded-lg p.text-sm"
  );
  const actionButton = document.querySelector(
    ".mt-6.p-4.bg-secondary.rounded-lg button"
  );

  if (actionTitle && actionDescription && actionButton) {
    actionTitle.textContent = actionData.title;
    actionDescription.textContent = actionData.description;
    actionButton.setAttribute(
      "onclick",
      `markTaskComplete('${actionData.id}')`
    );
  }
}

function initializeGrowthChart() {
  const ctx = document.getElementById("growth-chart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: [
        "Week 1",
        "Week 2",
        "Week 3",
        "Week 4",
        "Week 5",
        "Week 6",
        "Week 7",
        "Week 8",
      ],
      datasets: [
        {
          label: "Cabbage Growth",
          data: [5, 15, 25, 40, 60, 75, 85, 95],
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          fill: true,
        },
        {
          label: "Kale Growth",
          data: [8, 20, 35, 50, 65, 80, 90, 100],
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: "Growth Progress (%)",
          },
        },
      },
    },
  });
}

function markTaskComplete(taskId) {
  const userData = getCurrentUserData();
  if (!userData) return;

  const emailKey = userData.email.replace(/\./g, "_");

  // Update task status in Firebase
  database
    .ref("tasks/" + emailKey + "/" + taskId)
    .update({
      completed: true,
      completedAt: new Date().toISOString(),
    })
    .then(() => {
      console.log("Task marked as complete");

      // Show success message
      const actionDiv = document.querySelector(
        ".mt-6.p-4.bg-secondary.rounded-lg"
      );
      if (actionDiv) {
        actionDiv.innerHTML = `
        <h4 class="font-semibold text-green-600 mb-2">Task Completed!</h4>
        <p class="text-sm text-secondary">Great job! Keep up the good work.</p>
      `;

        // Reset after 3 seconds
        setTimeout(() => {
          loadGrowthData();
        }, 3000);
      }
    })
    .catch((error) => {
      console.error("Error marking task as complete:", error);
    });
}

function saveGrowthData(dataType, data) {
  const userData = getCurrentUserData();
  if (!userData) return;

  const emailKey = userData.email.replace(/\./g, "_");

  database
    .ref(dataType + "/" + emailKey)
    .set(data)
    .then(() => {
      console.log(`${dataType} data saved successfully`);
    })
    .catch((error) => {
      console.error(`Error saving ${dataType} data:`, error);
    });
}
