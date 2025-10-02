// ===============================================
// FARM RECORDS PAGE SPECIFIC JAVASCRIPT
// ===============================================

document.addEventListener("DOMContentLoaded", function () {
  // Load farm records
  loadFarmRecords();

  // Load financial summary
  loadFinancialSummary();

  // Initialize financial chart
  initializeFinancialChart();

  // Setup form submission
  setupFormSubmission();
});

function loadFarmRecords() {
  const userData = getCurrentUserData();
  if (!userData) return;

  const emailKey = userData.email.replace(/\./g, "_");
  const recordsTableBody = document.getElementById("records-table-body");

  if (!recordsTableBody) return;

  database
    .ref("farmRecords/" + emailKey)
    .orderByChild("date")
    .limitToLast(20)
    .once("value")
    .then((snapshot) => {
      recordsTableBody.innerHTML = "";

      if (snapshot.exists()) {
        const records = [];
        snapshot.forEach((childSnapshot) => {
          records.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          });
        });

        // Sort records by date (newest first)
        records.sort((a, b) => new Date(b.date) - new Date(a.date));

        records.forEach((record) => {
          const row = document.createElement("tr");

          let typeBadge = "";
          if (record.type === "expense") {
            typeBadge =
              '<span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Expense</span>';
          } else if (record.type === "sale") {
            typeBadge =
              '<span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Sale</span>';
          } else if (record.type === "activity") {
            typeBadge =
              '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Activity</span>';
          }

          const amount = record.amount
            ? "KES " + parseInt(record.amount).toLocaleString()
            : "-";

          row.innerHTML = `
            <td class="px-4 py-3 text-secondary">${record.date}</td>
            <td class="px-4 py-3">${typeBadge}</td>
            <td class="px-4 py-3 text-secondary">${record.description}</td>
            <td class="px-4 py-3 text-secondary">${amount}</td>
            <td class="px-4 py-3 text-secondary">${record.category}</td>
            <td class="px-4 py-3">
              <button class="text-blue-600 hover:text-blue-800 mr-2" onclick="editRecord('${record.id}')"><i class="fas fa-edit"></i></button>
              <button class="text-red-600 hover:text-red-800" onclick="deleteRecord('${record.id}')"><i class="fas fa-trash"></i></button>
            </td>
          `;

          recordsTableBody.appendChild(row);
        });
      } else {
        recordsTableBody.innerHTML =
          '<tr><td colspan="6" class="px-4 py-3 text-secondary text-center">No records available</td></tr>';
      }
    })
    .catch((error) => {
      console.error("Error loading farm records:", error);
      recordsTableBody.innerHTML =
        '<tr><td colspan="6" class="px-4 py-3 text-secondary text-center">Error loading records</td></tr>';
    });
}

function loadFinancialSummary() {
  const userData = getCurrentUserData();
  if (!userData) return;

  const emailKey = userData.email.replace(/\./g, "_");
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

  // Get current month's records
  database
    .ref("farmRecords/" + emailKey)
    .orderByChild("date")
    .startAt(currentMonth + "-01")
    .endAt(currentMonth + "-31")
    .once("value")
    .then((snapshot) => {
      let totalExpenses = 0;
      let totalSales = 0;

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const record = childSnapshot.val();
          if (record.type === "expense" && record.amount) {
            totalExpenses += parseInt(record.amount);
          } else if (record.type === "sale" && record.amount) {
            totalSales += parseInt(record.amount);
          }
        });
      }

      const netProfit = totalSales - totalExpenses;

      // Update the UI
      const expensesElement = document.querySelector(
        ".font-semibold.text-red-600"
      );
      const salesElement = document.querySelector(
        ".font-semibold.text-green-600"
      );
      const profitElement = document.querySelector(
        ".font-semibold.text-blue-600"
      );

      if (expensesElement)
        expensesElement.textContent = "KES " + totalExpenses.toLocaleString();
      if (salesElement)
        salesElement.textContent = "KES " + totalSales.toLocaleString();
      if (profitElement)
        profitElement.textContent = "KES " + netProfit.toLocaleString();
    })
    .catch((error) => {
      console.error("Error loading financial summary:", error);
    });
}

function initializeFinancialChart() {
  const ctx = document.getElementById("financial-chart");
  if (!ctx) return;

  // Get financial data for the chart
  const userData = getCurrentUserData();
  if (!userData) return;

  const emailKey = userData.email.replace(/\./g, "_");

  // Get data for the last 6 months
  const months = [];
  const expensesData = [];
  const revenueData = [];

  // Generate last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthYear = date.toISOString().slice(0, 7); // YYYY-MM format
    months.push(date.toLocaleDateString("en-US", { month: "short" }));

    // Initialize with zeros
    expensesData.push(0);
    revenueData.push(0);
  }

  // Fetch data for each month
  const promises = months.map((month, index) => {
    const monthYear = new Date();
    monthYear.setMonth(monthYear.getMonth() - (5 - index));
    const monthYearStr = monthYear.toISOString().slice(0, 7);

    return database
      .ref("farmRecords/" + emailKey)
      .orderByChild("date")
      .startAt(monthYearStr + "-01")
      .endAt(monthYearStr + "-31")
      .once("value")
      .then((snapshot) => {
        let monthExpenses = 0;
        let monthRevenue = 0;

        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const record = childSnapshot.val();
            if (record.type === "expense" && record.amount) {
              monthExpenses += parseInt(record.amount);
            } else if (record.type === "sale" && record.amount) {
              monthRevenue += parseInt(record.amount);
            }
          });
        }

        expensesData[index] = monthExpenses;
        revenueData[index] = monthRevenue;
      });
  });

  Promise.all(promises).then(() => {
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: months,
        datasets: [
          {
            label: "Expenses (KES)",
            data: expensesData,
            backgroundColor: "rgba(239, 68, 68, 0.8)",
          },
          {
            label: "Revenue (KES)",
            data: revenueData,
            backgroundColor: "rgba(16, 185, 129, 0.8)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Amount (KES)",
            },
          },
        },
      },
    });
  });
}

function setupFormSubmission() {
  const form = document.getElementById("add-record-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const recordType = document
      .getElementById("modal-title")
      .textContent.toLowerCase()
      .replace("add ", "");
    const date = document.getElementById("record-date").value;
    const description = document.getElementById("record-description").value;
    const amount = document.getElementById("record-amount").value;
    const category = document.getElementById("record-category").value;

    // Validate inputs
    if (!date || !description || !category) {
      alert("Please fill in all fields");
      return;
    }

    if (recordType !== "activity" && !amount) {
      alert("Please enter an amount");
      return;
    }

    // Save record to Firebase
    saveRecord({
      type: recordType,
      date: date,
      description: description,
      amount: amount || 0,
      category: category,
    });

    // Close modal and reset form
    closeAddRecordModal();
    form.reset();
  });
}

function showAddRecordModal(type) {
  const modal = document.getElementById("add-record-modal");
  const modalTitle = document.getElementById("modal-title");
  const amountField = document.getElementById("amount-field");
  const categorySelect = document.getElementById("record-category");

  if (!modal || !modalTitle || !amountField || !categorySelect) return;

  // Set modal title
  modalTitle.textContent =
    "Add " + type.charAt(0).toUpperCase() + type.slice(1);

  // Show/hide amount field based on type
  if (type === "activity") {
    amountField.style.display = "none";
  } else {
    amountField.style.display = "block";
  }

  // Set category options based on type
  categorySelect.innerHTML = '<option value="">Select Category</option>';

  if (type === "expense") {
    const expenseCategories = [
      "Fertilizer",
      "Seeds",
      "Pesticides",
      "Equipment",
      "Labor",
      "Water",
      "Other",
    ];
    expenseCategories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
  } else if (type === "sale") {
    const saleCategories = ["Cabbage", "Kale", "Other Crops"];
    saleCategories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
  } else if (type === "activity") {
    const activityCategories = [
      "Planting",
      "Watering",
      "Fertilizing",
      "Harvesting",
      "Treatment",
      "Other",
    ];
    activityCategories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
  }

  // Set today's date as default
  document.getElementById("record-date").valueAsDate = new Date();

  // Show modal
  modal.classList.remove("hidden");
}

function closeAddRecordModal() {
  const modal = document.getElementById("add-record-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

function saveRecord(record) {
  const userData = getCurrentUserData();
  if (!userData) return;

  const emailKey = userData.email.replace(/\./g, "_");
  const newRecordRef = database.ref("farmRecords/" + emailKey).push();

  newRecordRef
    .set(record)
    .then(() => {
      console.log("Record saved successfully");

      // Reload records and financial summary
      loadFarmRecords();
      loadFinancialSummary();

      // Show success message
      alert("Record saved successfully!");
    })
    .catch((error) => {
      console.error("Error saving record:", error);
      alert("Error saving record. Please try again.");
    });
}

function editRecord(recordId) {
  // In a real application, you would implement edit functionality
  alert("Edit functionality would be implemented here");
}

function deleteRecord(recordId) {
  if (!confirm("Are you sure you want to delete this record?")) return;

  const userData = getCurrentUserData();
  if (!userData) return;

  const emailKey = userData.email.replace(/\./g, "_");

  database
    .ref("farmRecords/" + emailKey + "/" + recordId)
    .remove()
    .then(() => {
      console.log("Record deleted successfully");

      // Reload records and financial summary
      loadFarmRecords();
      loadFinancialSummary();
    })
    .catch((error) => {
      console.error("Error deleting record:", error);
      alert("Error deleting record. Please try again.");
    });
}

function exportRecords() {
  // In a real application, you would implement export functionality
  alert("Export functionality would be implemented here");
}
