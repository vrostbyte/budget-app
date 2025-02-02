document.addEventListener("DOMContentLoaded", function () {
  // =======================
  // Global Data Variables
  // =======================
  let bills = [];
  let incomeEntries = [];
  let adhocExpenses = [];
  let debts = [];
  let accountBalance = 0; // Checking
  let accountName = "";
  let startDate = null;
  let projectionLength = 1; // Default to 1 month
  let categories = [];
  let runningBudgetAdjustments = [];
  let currentScreen = "budget"; // "budget" or "debt"
  let expensesChart;
  let categoryExpensesChart;
  let debtSortColumn = null;
  let debtSortOrder = "asc";

  // -----------------------
  // Sample Data (Anonymized)
  // -----------------------
  const sampleData = {
    "bills": [
      { "name": "Housing Payment 1", "date": 1, "amount": 2420, "category": "Housing" },
      { "name": "Childcare Payment 1", "date": 1, "amount": 799.2, "category": "Childcare" },
      { "name": "Credit Card Payment 1", "date": 6, "amount": 250, "category": "Debt Payments" },
      { "name": "Insurance Payment 1", "date": 7, "amount": 259.9, "category": "Insurance" },
      { "name": "Transportation Payment 1", "date": 7, "amount": 383.94, "category": "Transportation" },
      { "name": "Credit Card Payment 2", "date": 8, "amount": 430.57, "category": "Debt Payments" },
      { "name": "Utility Payment 1", "date": 5, "amount": 80, "category": "Utilities" },
      { "name": "Credit Card Payment 3", "date": 2, "amount": 96, "category": "Debt Payments" },
      { "name": "Subscription Payment 1", "date": 10, "amount": 16, "category": "Subscriptions/Memberships" },
      { "name": "Debt Payment 1", "date": 13, "amount": 92, "category": "Debt Payments" },
      { "name": "Utility Payment 2", "date": 15, "amount": 400, "category": "Utilities" },
      { "name": "Loan Payment 1", "date": 15, "amount": 80, "category": "Debt Payments" },
      { "name": "Credit Card Payment 4", "date": 18, "amount": 330, "category": "Debt Payments" },
      { "name": "Credit Card Payment 5", "date": 20, "amount": 52, "category": "Debt Payments" },
      { "name": "Credit Card Payment 6", "date": 21, "amount": 439, "category": "Debt Payments" },
      { "name": "Utility Payment 3", "date": 22, "amount": 170, "category": "Utilities" },
      { "name": "Subscription Payment 2", "date": 23, "amount": 21.26, "category": "Subscriptions/Memberships" },
      { "name": "Utility Payment 4", "date": 24, "amount": 201.63, "category": "Utilities" },
      { "name": "Utility Payment 5", "date": 26, "amount": 100, "category": "Utilities" },
      { "name": "Transportation Payment 2", "date": 20, "amount": 345.4, "category": "Transportation" },
      { "name": "Misc Payment 1", "date": 28, "amount": 46, "category": "Misc/Other" },
      { "name": "Housing Payment 2", "date": 30, "amount": 174, "category": "Housing" },
      { "name": "Student Loan Payment 1", "date": 5, "amount": 376, "category": "Student Loans" }
    ],
    "incomeEntries": [
      { "name": "Income Payment 1", "amount": 1700, "frequency": "Bi-weekly", "startDate": "2024-11-20" },
      { "name": "Income Payment 2", "amount": 2133.25, "frequency": "Bi-weekly", "startDate": "2024-12-11" }
    ],
    "adhocExpenses": [],
    "debts": [
      {
        "name": "Credit Card Debt 1",
        "balance": 3500,
        "totalCredit": 5000,
        "interestRate": 18.5,
        "minPayment": 100,
        "term": "",
        "category": "Credit Card"
      },
      {
        "name": "Auto Loan Debt 1",
        "balance": 12000,
        "totalCredit": 15000,
        "interestRate": 6.9,
        "minPayment": 300,
        "term": 60,
        "category": "Auto Loan"
      },
      {
        "name": "Mortgage Debt 1",
        "balance": 200000,
        "totalCredit": 250000,
        "interestRate": 4.2,
        "minPayment": 1200,
        "term": 360,
        "category": "Mortgage"
      },
      {
        "name": "Student Loan Debt 1",
        "balance": 25000,
        "totalCredit": 25000,
        "interestRate": 5.5,
        "minPayment": 250,
        "term": 120,
        "category": "Student Loan"
      }
    ],
    "accountBalance": 3435.95,
    "accountName": "Sample Checking",
    "startDate": "2025-01-30T07:00:00.000Z",
    "projectionLength": 10,
    "categories": [
      "Charity/Donations",
      "Childcare",
      "Debt Payments",
      "Dining Out/Takeout",
      "Education",
      "Entertainment",
      "Healthcare",
      "Hobbies/Recreation",
      "Housing",
      "Insurance",
      "Personal Care",
      "Pets",
      "Savings/Investments",
      "Subscriptions/Memberships",
      "Transportation",
      "Travel",
      "Utilities",
      "Misc/Other",
      "Student Loans"
    ],
    "runningBudgetAdjustments": [
      { "date": "2024-11-28", "amount": -164, "event": "Housing Payment 2" },
      { "date": "2024-12-01", "amount": -799.2, "event": "Childcare Payment 1" },
      { "date": "2024-12-11", "amount": -528.73, "event": "Income Payment 2 + Housing Payment 1" },
      { "date": "2024-12-15", "amount": -109.65, "event": "Utility Payment 2" },
      { "date": "2025-01-05", "amount": 0, "event": "Student Loan Payment 1 (Deferred)" },
      { "date": "2025-01-10", "amount": -2436, "event": "Subscription Payment 1 + Housing Payment 1" },
      { "date": "2025-01-11", "amount": 0, "event": "" },
      { "date": "2025-01-01", "amount": 0, "event": "Housing Payment 1 (Deferred) + Childcare Payment 1 (Level)" },
      { "date": "2024-12-30", "amount": 0, "event": "---" },
      { "date": "2024-12-28", "amount": -174, "event": "Housing Payment 2" },
      { "date": "2025-01-15", "amount": -194.87, "event": "Utility Payment 2 + Loan Payment 1 + Income Payment 1" },
      { "date": "2025-01-04", "amount": -799.2, "event": "Childcare Payment 1" },
      { "date": "2025-01-09", "amount": -50, "event": "Transportation Payment 2 (Gas)" },
      { "date": "2025-01-07", "amount": -743.84, "event": "Insurance Payment 1 + Transportation Payment 1 + Income Payment 1 Adjustment" },
      { "date": "2025-01-12", "amount": -100, "event": "Dining Payment 1" },
      { "date": "2025-01-17", "amount": -114.87, "event": "Utility Payment 2" },
      { "date": "2025-02-01", "amount": -799.2, "event": "Childcare Payment 1" },
      { "date": "2025-02-09", "amount": -2420, "event": "Housing Payment 1" },
      { "date": "2025-03-01", "amount": -799.2, "event": "Housing Payment 1 (Deferred) + Childcare Payment 1" },
      { "date": "2025-03-09", "amount": -2420, "event": "Housing Payment 1" },
      { "date": "2025-01-28", "amount": 0, "event": "---" },
      { "date": "2025-02-15", "amount": -155.76, "event": "Utility Payment 2 (Partial) + Loan Payment 1" },
      { "date": "2025-01-29", "amount": 0, "event": "---" }
    ]
  };

  // =======================
  // DOM Element Lookups (Declared Once)
  // =======================
  const importFileInputEl = document.getElementById("import-file");
  const instructionsBtnEl = document.getElementById("instructions-btn");
  const instructionsModalEl = document.getElementById("instructions-modal");
  const closeModalEl = document.getElementById("close-modal");
  const closeModalBtnEl = document.getElementById("close-modal-btn");

  // =======================
  // Helper Functions
  // =======================
  function getCurrentDateTimeString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }

  function parseMathExpression(rawValue) {
    let cleaned = rawValue.replace(/\$/g, "");
    cleaned = cleaned.replace(/[^0-9+\-*\\/().]/g, "");
    if (!cleaned) return 0;
    try {
      const result = new Function(`return (${cleaned});`)();
      if (typeof result !== "number" || isNaN(result))
        throw new Error("Invalid expression");
      return result;
    } catch (err) {
      console.warn("Failed to parse math expression:", rawValue);
      return parseFloat(rawValue) || 0;
    }
  }

  function parseDateInput(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function formatRunningBudgetDate(date) {
    const options = { weekday: "short", month: "short", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }

  function saveData() {
    localStorage.setItem("bills", JSON.stringify(bills));
    localStorage.setItem("incomeEntries", JSON.stringify(incomeEntries));
    localStorage.setItem("adhocExpenses", JSON.stringify(adhocExpenses));
    localStorage.setItem("debts", JSON.stringify(debts));
    localStorage.setItem("accountBalance", accountBalance);
    localStorage.setItem("accountName", accountName);
    localStorage.setItem("startDate", startDate ? startDate.toISOString() : null);
    localStorage.setItem("projectionLength", projectionLength);
    localStorage.setItem("categories", JSON.stringify(categories));
    localStorage.setItem("runningBudgetAdjustments", JSON.stringify(runningBudgetAdjustments));
  }

  function loadData() {
    const billsData = localStorage.getItem("bills");
    const incomeData = localStorage.getItem("incomeEntries");
    const adhocExpensesData = localStorage.getItem("adhocExpenses");
    const debtsData = localStorage.getItem("debts");
    const balanceData = localStorage.getItem("accountBalance");
    const accountNameData = localStorage.getItem("accountName");
    const startDateData = localStorage.getItem("startDate");
    const projectionLengthData = localStorage.getItem("projectionLength");
    const categoriesData = localStorage.getItem("categories");
    const adjustmentsData = localStorage.getItem("runningBudgetAdjustments");
    if (billsData) bills = JSON.parse(billsData);
    if (incomeData) incomeEntries = JSON.parse(incomeData);
    if (adhocExpensesData) adhocExpenses = JSON.parse(adhocExpensesData);
    if (debtsData) debts = JSON.parse(debtsData);
    if (balanceData) accountBalance = parseFloat(balanceData);
    if (accountNameData) accountName = accountNameData;
    if (startDateData) startDate = new Date(startDateData);
    if (projectionLengthData) projectionLength = parseInt(projectionLengthData, 10);
    if (categoriesData) {
      categories = JSON.parse(categoriesData);
    } else {
      categories = [
        "Charity/Donations",
        "Childcare",
        "Debt Payments",
        "Dining Out/Takeout",
        "Education",
        "Entertainment",
        "Healthcare",
        "Hobbies/Recreation",
        "Housing",
        "Insurance",
        "Personal Care",
        "Pets",
        "Savings/Investments",
        "Subscriptions/Memberships",
        "Transportation",
        "Travel",
        "Utilities",
        "Misc/Other"
      ];
      saveData();
    }
    if (adjustmentsData) {
      runningBudgetAdjustments = JSON.parse(adjustmentsData);
    }
  }

  // =======================
  // Screen Switching
  // =======================
  function renderScreen() {
    if (currentScreen === "budget") {
      document.getElementById("budget-screen").style.display = "";
      document.getElementById("display-area-budget").style.display = "";
      document.getElementById("debt-screen").style.display = "none";
    } else if (currentScreen === "debt") {
      document.getElementById("budget-screen").style.display = "none";
      document.getElementById("debt-screen").style.display = "";
    }
  }
  document.getElementById("screen-budget").addEventListener("click", function (e) {
    e.preventDefault();
    currentScreen = "budget";
    renderScreen();
  });
  document.getElementById("screen-debt").addEventListener("click", function (e) {
    e.preventDefault();
    currentScreen = "debt";
    renderScreen();
  });

  // =======================
  // Budget Screen Helper Functions
  // =======================
  function isIncomeOnDate(income, date) {
    const incomeStartDate = parseDateInput(income.startDate);
    if (incomeStartDate > date) return false;
    const diffTime = date - incomeStartDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    switch (income.frequency) {
      case "Weekly":
        return diffDays % 7 === 0;
      case "Bi-weekly":
        return diffDays % 14 === 0;
      case "Monthly":
        return incomeStartDate.getDate() === date.getDate();
      case "One-time":
        return incomeStartDate.toDateString() === date.toDateString();
      default:
        return false;
    }
  }
  function isBillOnDate(bill, date) {
    return bill.date === date.getDate();
  }
  function isAdhocExpenseOnDate(expense, date) {
    const expenseDate = parseDateInput(expense.date);
    return expenseDate.toDateString() === date.toDateString();
  }
  function getEventsForDate(date) {
    let events = [];
    bills.forEach((bill) => {
      if (isBillOnDate(bill, date)) {
        events.push(bill.name);
      }
    });
    incomeEntries.forEach((income) => {
      if (isIncomeOnDate(income, date)) {
        events.push(income.name);
      }
    });
    adhocExpenses.forEach((expense) => {
      if (isAdhocExpenseOnDate(expense, date)) {
        events.push(expense.name);
      }
    });
    return events.join(" + ");
  }
  function calculateRunningTotals() {
    if (!startDate) {
      console.error("Start date is not set.");
      return [];
    }
    let currentDate = new Date(startDate);
    let runningTotals = [];
    let currentBalance = accountBalance;
    let endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + projectionLength);
    while (currentDate <= endDate) {
      let dailyIncome = 0;
      incomeEntries.forEach((income) => {
        if (isIncomeOnDate(income, currentDate)) {
          dailyIncome += income.amount;
        }
      });
      let dailyExpenses = 0;
      bills.forEach((bill) => {
        if (isBillOnDate(bill, currentDate)) {
          dailyExpenses += bill.amount;
        }
      });
      adhocExpenses.forEach((expense) => {
        if (isAdhocExpenseOnDate(expense, currentDate)) {
          dailyExpenses += expense.amount;
        }
      });
      let dailyNet = dailyIncome - dailyExpenses;
      const adjustment = runningBudgetAdjustments.find((adj) => {
        const adjDate = parseDateInput(adj.date);
        return adjDate.toDateString() === currentDate.toDateString();
      });
      let eventDescription = getEventsForDate(currentDate);
      if (adjustment) {
        if (adjustment.amount !== undefined) {
          dailyNet = adjustment.amount;
          currentBalance =
            (runningTotals.length > 0 ? runningTotals[runningTotals.length - 1].balance : accountBalance)
            + dailyNet;
        }
        if (adjustment.event) {
          eventDescription = adjustment.event;
        }
      } else {
        currentBalance += dailyNet;
      }
      runningTotals.push({
        date: new Date(currentDate),
        event: eventDescription,
        dailyNet: dailyNet,
        balance: currentBalance,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return runningTotals;
  }
  function displayCheckingBalance() {
    let balanceDisplay = document.getElementById("balance-display");
    const balanceText = accountName
      ? `${accountName} (Checking) Balance: $${accountBalance.toFixed(2)}`
      : `Current Checking Balance: $${accountBalance.toFixed(2)}`;
    if (balanceDisplay) {
      balanceDisplay.textContent = balanceText;
    } else {
      balanceDisplay = document.createElement("h3");
      balanceDisplay.id = "balance-display";
      balanceDisplay.textContent = balanceText;
      document.getElementById("display-area-budget").prepend(balanceDisplay);
    }
    if (accountBalance > 100) {
      balanceDisplay.style.color = "green";
    } else if (accountBalance > 0) {
      balanceDisplay.style.color = "orange";
    } else {
      balanceDisplay.style.color = "red";
    }
  }
  function displayLowestBalancesByMonth(runningTotals) {
    const tbody = document.querySelector("#lowest-balances-table tbody");
    tbody.innerHTML = "";
    const monthlyBalances = {};
    runningTotals.forEach((item) => {
      const monthKey = `${item.date.getFullYear()}-${item.date.getMonth() + 1}`;
      if (!monthlyBalances[monthKey] || item.balance < monthlyBalances[monthKey].balance) {
        monthlyBalances[monthKey] = { date: new Date(item.date), balance: item.balance };
      }
    });
    const sortedMonths = Object.keys(monthlyBalances).sort(
      (a, b) => new Date(a + "-1") - new Date(b + "-1")
    );
    sortedMonths.forEach((monthKey) => {
      const entry = monthlyBalances[monthKey];
      const row = tbody.insertRow();
      const monthCell = row.insertCell(0);
      const dateCell = row.insertCell(1);
      const balanceCell = row.insertCell(2);
      const monthName = entry.date.toLocaleString("en-US", { month: "long", year: "numeric" });
      monthCell.textContent = monthName;
      const dateOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
      dateCell.textContent = entry.date.toLocaleDateString("en-US", dateOptions);
      balanceCell.textContent = `$${entry.balance.toFixed(2)}`;
      if (entry.balance > 100) {
        balanceCell.style.color = "green";
      } else if (entry.balance > 0) {
        balanceCell.style.color = "orange";
      } else {
        balanceCell.style.color = "red";
      }
    });
  }
  function renderRunningBudgetTable(runningTotals) {
    const tbody = document.querySelector("#running-budget-table tbody");
    tbody.innerHTML = "";
    runningTotals.forEach((item, index) => {
      const row = tbody.insertRow();
      const dateCell = row.insertCell(0);
      const eventCell = row.insertCell(1);
      const debitCreditCell = row.insertCell(2);
      const balanceCell = row.insertCell(3);
      const actionsCell = row.insertCell(4);
      dateCell.textContent = formatRunningBudgetDate(item.date);
      eventCell.textContent = item.event || "---";
      debitCreditCell.textContent = `$${item.dailyNet.toFixed(2)}`;
      balanceCell.textContent = `$${item.balance.toFixed(2)}`;
      if (item.dailyNet > 0) {
        debitCreditCell.classList.add("positive-amount");
      } else if (item.dailyNet === 0) {
        debitCreditCell.classList.add("neutral-amount");
      } else {
        debitCreditCell.classList.add("negative-amount");
      }
      if (item.balance > 100) {
        balanceCell.style.color = "green";
      } else if (item.balance > 0) {
        balanceCell.style.color = "orange";
      } else {
        balanceCell.style.color = "red";
      }
      const editBtn = document.createElement("button");
      editBtn.classList.add("icon-btn");
      editBtn.innerHTML = '<i class="fa-solid fa-edit"></i>';
      editBtn.dataset.index = index;
      editBtn.dataset.type = "runningBudget";
      editBtn.addEventListener("click", openEditModal);
      actionsCell.appendChild(editBtn);
    });
  }
  function renderBillsTable() {
    const tbody = document.querySelector("#bills-list-table tbody");
    tbody.innerHTML = "";
    bills.forEach((bill, index) => {
      const row = tbody.insertRow();
      row.insertCell(0).textContent = bill.name;
      row.insertCell(1).textContent = bill.date;
      row.insertCell(2).textContent = `$${bill.amount.toFixed(2)}`;
      row.insertCell(3).textContent = bill.category;
      const actionsCell = row.insertCell(4);
      actionsCell.classList.add("actions-cell");
      const editBtn = document.createElement("button");
      editBtn.classList.add("icon-btn");
      editBtn.innerHTML = '<i class="fa-solid fa-edit"></i>';
      editBtn.dataset.index = index;
      editBtn.dataset.type = "bill";
      editBtn.addEventListener("click", openEditModal);
      actionsCell.appendChild(editBtn);
      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("icon-btn");
      deleteBtn.innerHTML = '<i class="fa-solid fa-trash-alt"></i>';
      deleteBtn.dataset.index = index;
      deleteBtn.dataset.type = "bill";
      deleteBtn.addEventListener("click", deleteEntry);
      actionsCell.appendChild(deleteBtn);
    });
  }
  function renderAdhocExpensesTable() {
    const tbody = document.querySelector("#adhoc-expenses-list-table tbody");
    tbody.innerHTML = "";
    adhocExpenses.forEach((expense, index) => {
      const row = tbody.insertRow();
      row.insertCell(0).textContent = expense.name;
      row.insertCell(1).textContent = formatRunningBudgetDate(parseDateInput(expense.date));
      row.insertCell(2).textContent = `$${expense.amount.toFixed(2)}`;
      row.insertCell(3).textContent = expense.category;
      const actionsCell = row.insertCell(4);
      actionsCell.classList.add("actions-cell");
      const editBtn = document.createElement("button");
      editBtn.classList.add("icon-btn");
      editBtn.innerHTML = '<i class="fa-solid fa-edit"></i>';
      editBtn.dataset.index = index;
      editBtn.dataset.type = "adhocExpense";
      editBtn.addEventListener("click", openEditModal);
      actionsCell.appendChild(editBtn);
      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("icon-btn");
      deleteBtn.innerHTML = '<i class="fa-solid fa-trash-alt"></i>';
      deleteBtn.dataset.index = index;
      deleteBtn.dataset.type = "adhocExpense";
      deleteBtn.addEventListener("click", deleteEntry);
      actionsCell.appendChild(deleteBtn);
    });
  }
  function renderIncomeTable() {
    const tbody = document.querySelector("#income-list-table tbody");
    tbody.innerHTML = "";
    incomeEntries.forEach((income, index) => {
      const row = tbody.insertRow();
      row.insertCell(0).textContent = income.name;
      row.insertCell(1).textContent = `$${income.amount.toFixed(2)}`;
      row.insertCell(2).textContent = income.frequency;
      row.insertCell(3).textContent = formatRunningBudgetDate(parseDateInput(income.startDate));
      const actionsCell = row.insertCell(4);
      actionsCell.classList.add("actions-cell");
      const editBtn = document.createElement("button");
      editBtn.classList.add("icon-btn");
      editBtn.innerHTML = '<i class="fa-solid fa-edit"></i>';
      editBtn.dataset.index = index;
      editBtn.dataset.type = "income";
      editBtn.addEventListener("click", openEditModal);
      actionsCell.appendChild(editBtn);
      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("icon-btn");
      deleteBtn.innerHTML = '<i class="fa-solid fa-trash-alt"></i>';
      deleteBtn.dataset.index = index;
      deleteBtn.dataset.type = "income";
      deleteBtn.addEventListener("click", deleteEntry);
      actionsCell.appendChild(deleteBtn);
    });
  }
  function calculateTotalExpenses() {
    let expenseTotals = {};
    bills.forEach((bill) => {
      const key = bill.name;
      expenseTotals[key] = (expenseTotals[key] || 0) + bill.amount * projectionLength;
    });
    adhocExpenses.forEach((expense) => {
      const key = expense.name;
      expenseTotals[key] = (expenseTotals[key] || 0) + expense.amount;
    });
    return expenseTotals;
  }
  function calculateExpensesByCategory() {
    let categoryTotals = {};
    bills.forEach((bill) => {
      const cat = bill.category || "Misc/Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + bill.amount * projectionLength;
    });
    adhocExpenses.forEach((expense) => {
      const cat = expense.category || "Misc/Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + expense.amount;
    });
    return categoryTotals;
  }
  function renderExpensesChart(labels, data) {
    const canvas = document.getElementById("expenses-chart");
    if (!canvas) return console.error('Canvas element "expenses-chart" not found.');
    const ctx = canvas.getContext("2d");
    if (expensesChart) expensesChart.destroy();
    if (data.length === 0) return console.warn("No data for expenses chart.");
    const max = Math.max(...data);
    const min = Math.min(...data);
    const colors = data.map((value) => {
      const ratio = (value - min) / (max - min || 1);
      const green = Math.floor(255 * (1 - ratio));
      return `rgb(255, ${green}, 0)`;
    });
    expensesChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Total Expense Over Projection Period",
          data: data,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        scales: { y: { type: "logarithmic", beginAtZero: true } },
      },
    });
  }
  function renderCategoryExpensesChart(labels, data) {
    const canvas = document.getElementById("category-expenses-chart");
    if (!canvas) return console.error('Canvas element "category-expenses-chart" not found.');
    const ctx = canvas.getContext("2d");
    if (categoryExpensesChart) categoryExpensesChart.destroy();
    if (data.length === 0) return console.warn("No data for category expenses chart.");
    const colors = labels.map((_, index) => `hsl(${(index * 360) / labels.length}, 70%, 50%)`);
    categoryExpensesChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Expenses by Category",
          data: data,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } },
      },
    });
  }
  function renderExpensesCharts(expenseTotals) {
    const sortedExpenses = Object.entries(expenseTotals).sort((a, b) => b[1] - a[1]);
    const labels = sortedExpenses.map((item) => item[0]);
    const data = sortedExpenses.map((item) => item[1]);
    renderExpensesChart(labels, data);
  }
  function renderCategoryCharts(categoryTotals) {
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map((x) => x[0]);
    const data = sorted.map((x) => x[1]);
    renderCategoryExpensesChart(labels, data);
  }
  function updateDisplay() {
    displayCheckingBalance();
    const runningTotals = calculateRunningTotals();
    displayLowestBalancesByMonth(runningTotals);
    renderRunningBudgetTable(runningTotals);
    renderBillsTable();
    renderAdhocExpensesTable();
    renderIncomeTable();
    const expenseTotals = calculateTotalExpenses();
    renderExpensesCharts(expenseTotals);
    const categoryTotals = calculateExpensesByCategory();
    renderCategoryCharts(categoryTotals);
  }

  // =======================
  // Edit Modal (Shared)
  // =======================
  function openEditModal(event) {
    const btn = event.target.closest("button");
    if (!btn) return;
    const index = btn.dataset.index;
    const type = btn.dataset.type;
    const editModal = document.getElementById("edit-modal");
    const editForm = document.getElementById("edit-form");
    const editModalTitle = document.getElementById("edit-modal-title");
    editForm.innerHTML = "";
    if (type === "bill") {
      const bill = bills[index];
      editModalTitle.textContent = "Edit Bill/Expense";
      editForm.innerHTML = `
        <label for="edit-bill-name">Bill Name:</label>
        <input type="text" id="edit-bill-name" required value="${bill.name}" />
        <label for="edit-bill-date">Day of Month (1-31):</label>
        <input type="number" id="edit-bill-date" min="1" max="31" required value="${bill.date}" />
        <label for="edit-bill-amount">Amount (USD):</label>
        <input type="text" id="edit-bill-amount" required value="${bill.amount}" />
        <label for="edit-bill-category">Category:</label>
        <div class="category-container">
          <select id="edit-bill-category">
            ${categories.map(cat => `<option value="${cat}" ${cat === bill.category ? "selected" : ""}>${cat}</option>`).join("")}
          </select>
          <button type="button" id="add-edit-bill-category-btn">Add Category</button>
        </div>
        <button type="submit">Update Bill</button>
        <button type="button" id="cancel-edit-btn">Cancel</button>
      `;
      editForm.onsubmit = function (e) {
        e.preventDefault();
        updateBillEntry(index);
        editModal.style.display = "none";
      };
      document.getElementById("add-edit-bill-category-btn").addEventListener("click", addCategory);
    } else if (type === "adhocExpense") {
      const expense = adhocExpenses[index];
      editModalTitle.textContent = "Edit Adhoc Expense";
      editForm.innerHTML = `
        <label for="edit-adhoc-expense-name">Expense Name:</label>
        <input type="text" id="edit-adhoc-expense-name" required value="${expense.name}" />
        <label for="edit-adhoc-expense-date">Date:</label>
        <input type="date" id="edit-adhoc-expense-date" required value="${expense.date}" />
        <label for="edit-adhoc-expense-amount">Amount (USD):</label>
        <input type="text" id="edit-adhoc-expense-amount" required value="${expense.amount}" />
        <label for="edit-adhoc-expense-category">Category:</label>
        <div class="category-container">
          <select id="edit-adhoc-expense-category">
            ${categories.map(cat => `<option value="${cat}" ${cat === expense.category ? "selected" : ""}>${cat}</option>`).join("")}
          </select>
          <button type="button" id="add-edit-adhoc-category-btn">Add Category</button>
        </div>
        <button type="submit">Update Expense</button>
        <button type="button" id="cancel-edit-btn">Cancel</button>
      `;
      editForm.onsubmit = function (e) {
        e.preventDefault();
        updateAdhocExpenseEntry(index);
        editModal.style.display = "none";
      };
      document.getElementById("add-edit-adhoc-category-btn").addEventListener("click", addCategory);
    } else if (type === "income") {
      const income = incomeEntries[index];
      editModalTitle.textContent = "Edit Income";
      editForm.innerHTML = `
        <label for="edit-income-name">Income Name:</label>
        <input type="text" id="edit-income-name" required value="${income.name}" />
        <label for="edit-income-amount">Amount per Paycheck:</label>
        <input type="text" id="edit-income-amount" required value="${income.amount}" />
        <label for="edit-income-frequency">Frequency:</label>
        <select id="edit-income-frequency">
          <option value="Weekly" ${income.frequency === "Weekly" ? "selected" : ""}>Weekly</option>
          <option value="Bi-weekly" ${income.frequency === "Bi-weekly" ? "selected" : ""}>Bi-weekly</option>
          <option value="Monthly" ${income.frequency === "Monthly" ? "selected" : ""}>Monthly</option>
          <option value="One-time" ${income.frequency === "One-time" ? "selected" : ""}>One-time</option>
        </select>
        <label for="edit-income-start-date">Start Date:</label>
        <input type="date" id="edit-income-start-date" required value="${income.startDate}" />
        <button type="submit">Update Income</button>
        <button type="button" id="cancel-edit-btn">Cancel</button>
      `;
      editForm.onsubmit = function (e) {
        e.preventDefault();
        updateIncomeEntry(index);
        editModal.style.display = "none";
      };
    } else if (type === "runningBudget") {
      const runningTotals = calculateRunningTotals();
      const entry = runningTotals[index];
      editModalTitle.textContent = "Edit Running Budget Entry";
      editForm.innerHTML = `
        <label for="edit-running-budget-date">Date:</label>
        <input type="date" id="edit-running-budget-date" required value="${entry.date.toISOString().split("T")[0]}" />
        <label for="edit-running-budget-amount">Debit/Credit Amount:</label>
        <input type="text" id="edit-running-budget-amount" required value="${entry.dailyNet}" />
        <label for="edit-running-budget-event">Event/Bill:</label>
        <input type="text" id="edit-running-budget-event" value="${entry.event}" />
        <button type="submit">Update Entry</button>
        <button type="button" id="cancel-edit-btn">Cancel</button>
      `;
      editForm.onsubmit = function (e) {
        e.preventDefault();
        const oldDate = entry.date.toISOString().split("T")[0];
        updateRunningBudgetEntry(oldDate);
        editModal.style.display = "none";
      };
    }
    editModal.style.display = "block";
    // Use the already-declared cancel button element to add the listener once
    closeModalBtnEl.addEventListener("click", () => {
      editModal.style.display = "none";
    });
  }

  // =======================
  // Update / Delete Functions (Budget)
  // =======================
  function updateBillEntry(index) {
    const name = document.getElementById("edit-bill-name").value.trim();
    const date = parseInt(document.getElementById("edit-bill-date").value, 10);
    const amount = parseMathExpression(document.getElementById("edit-bill-amount").value);
    const category = document.getElementById("edit-bill-category").value;
    if (date < 1 || date > 31) {
      alert("Please enter a valid day of the month (1-31).");
      return;
    }
    bills[index] = { name, date, amount, category };
    saveData();
    updateDisplay();
  }
  function updateAdhocExpenseEntry(index) {
    const name = document.getElementById("edit-adhoc-expense-name").value.trim();
    const date = document.getElementById("edit-adhoc-expense-date").value;
    const amount = parseMathExpression(document.getElementById("edit-adhoc-expense-amount").value);
    const category = document.getElementById("edit-adhoc-expense-category").value;
    if (!date) {
      alert("Please enter a valid date.");
      return;
    }
    adhocExpenses[index] = { name, date, amount, category };
    saveData();
    updateDisplay();
  }
  function updateIncomeEntry(index) {
    const name = document.getElementById("edit-income-name").value.trim();
    const amount = parseMathExpression(document.getElementById("edit-income-amount").value);
    const frequency = document.getElementById("edit-income-frequency").value;
    const startDateStr = document.getElementById("edit-income-start-date").value;
    if (!startDateStr) {
      alert("Please enter a valid start date.");
      return;
    }
    incomeEntries[index] = { name, amount, frequency, startDate: startDateStr };
    saveData();
    updateDisplay();
  }
  function updateRunningBudgetEntry(oldDate) {
    const newDate = document.getElementById("edit-running-budget-date").value;
    const amount = parseMathExpression(document.getElementById("edit-running-budget-amount").value);
    const eventDesc = document.getElementById("edit-running-budget-event").value;
    const adjIndex = runningBudgetAdjustments.findIndex(adj => adj.date === oldDate);
    const adjustment = { date: newDate, amount, event: eventDesc };
    if (adjIndex >= 0) {
      runningBudgetAdjustments[adjIndex] = adjustment;
    } else {
      runningBudgetAdjustments.push(adjustment);
    }
    saveData();
    updateDisplay();
  }
  function deleteEntry(event) {
    const index = event.target.dataset.index;
    const type = event.target.dataset.type;
    if (type === "bill") {
      bills.splice(index, 1);
    } else if (type === "adhocExpense") {
      adhocExpenses.splice(index, 1);
    } else if (type === "income") {
      incomeEntries.splice(index, 1);
    }
    saveData();
    updateDisplay();
  }

  // =======================
  // Debt Form Submission (New Approach)
  // =======================
  document.getElementById("debt-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("debt-name").value.trim();
    const balance = parseMathExpression(document.getElementById("debt-balance").value);
    const totalCredit = parseMathExpression(document.getElementById("debt-total-credit").value);
    const interestRate = parseMathExpression(document.getElementById("debt-interest-rate").value);
    const minPayment = parseMathExpression(document.getElementById("debt-min-payment").value);
    const term = document.getElementById("debt-term").value;
    const category = document.getElementById("debt-category").value;
    if (!name) {
      alert("Please enter a debt name.");
      return false;
    }
    debts.push({ name, balance, totalCredit, interestRate, minPayment, term, category });
    saveData();
    // Manually clear debt form fields
    document.getElementById("debt-name").value = "";
    document.getElementById("debt-balance").value = "";
    document.getElementById("debt-total-credit").value = "";
    document.getElementById("debt-interest-rate").value = "";
    document.getElementById("debt-min-payment").value = "";
    document.getElementById("debt-term").value = "";
    document.getElementById("debt-category").selectedIndex = 0;
    renderDebtDashboard();
    renderDebtsTable();
    // Remain on the Debt Screen
    currentScreen = "debt";
    renderScreen();
    alert("Debt added successfully.");
    return false;
  });

  // =======================
  // Budget Screen Form Submissions
  // =======================
  document.getElementById("bill-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("bill-name").value.trim();
    const date = parseInt(document.getElementById("bill-date").value, 10);
    const amount = parseMathExpression(document.getElementById("bill-amount").value);
    const category = document.getElementById("bill-category").value;
    if (date < 1 || date > 31) {
      alert("Please enter a valid day of the month (1-31).");
      return;
    }
    bills.push({ name, date, amount, category });
    saveData();
    this.reset();
    updateDisplay();
  });
  document.getElementById("adhoc-expense-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("adhoc-expense-name").value.trim();
    const dateInput = document.getElementById("adhoc-expense-date").value;
    const amount = parseMathExpression(document.getElementById("adhoc-expense-amount").value);
    const category = document.getElementById("adhoc-expense-category").value;
    if (!dateInput) {
      alert("Please enter a valid date.");
      return;
    }
    adhocExpenses.push({ name, date: dateInput, amount, category });
    saveData();
    this.reset();
    updateDisplay();
  });
  document.getElementById("income-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("income-name").value.trim();
    const amount = parseMathExpression(document.getElementById("income-amount").value);
    const frequency = document.getElementById("income-frequency").value;
    const startDateStr = document.getElementById("income-start-date").value;
    if (!startDateStr) {
      alert("Please enter a valid start date.");
      return;
    }
    incomeEntries.push({ name, amount, frequency, startDate: startDateStr });
    saveData();
    this.reset();
    updateDisplay();
  });
  document.getElementById("balance-form").addEventListener("submit", function (e) {
    e.preventDefault();
    accountName = document.getElementById("account-name").value.trim();
    const balance = parseMathExpression(document.getElementById("account-balance").value);
    if (isNaN(balance)) {
      alert("Please enter a valid balance.");
      return;
    }
    accountBalance = balance;
    saveData();
    this.reset();
    updateDisplay();
  });
  document.getElementById("start-date-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const startDateStr = document.getElementById("start-date-input").value;
    const projLength = document.getElementById("projection-length").value;
    if (!startDateStr) {
      alert("Please enter a valid start date.");
      return;
    }
    startDate = parseDateInput(startDateStr);
    projectionLength = parseInt(projLength, 10);
    saveData();
    updateDisplay();
  });

  // =======================
  // Import / Export / Reset
  // =======================
  document.getElementById("export-btn").addEventListener("click", function (e) {
    e.preventDefault();
    const data = {
      bills,
      incomeEntries,
      adhocExpenses,
      debts,
      accountBalance,
      accountName,
      startDate: startDate ? startDate.toISOString() : null,
      projectionLength,
      categories,
      runningBudgetAdjustments
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement("a");
    const fileName = `budget_data_${getCurrentDateTimeString()}.json`;
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  });
  document.getElementById("import-btn").addEventListener("click", function (e) {
    e.preventDefault();
    importFileInputEl.click();
  });
  importFileInputEl.addEventListener("change", function (event) {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      alert("Please select a file to import.");
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        bills = data.bills || [];
        incomeEntries = data.incomeEntries || [];
        adhocExpenses = data.adhocExpenses || [];
        debts = data.debts || [];
        accountBalance = data.accountBalance || 0;
        accountName = data.accountName || "";
        startDate = data.startDate ? new Date(data.startDate) : null;
        projectionLength = data.projectionLength || 1;
        categories = data.categories || [
          "Charity/Donations",
          "Childcare",
          "Debt Payments",
          "Dining Out/Takeout",
          "Education",
          "Entertainment",
          "Healthcare",
          "Hobbies/Recreation",
          "Housing",
          "Insurance",
          "Personal Care",
          "Pets",
          "Savings/Investments",
          "Subscriptions/Memberships",
          "Transportation",
          "Travel",
          "Utilities",
          "Misc/Other"
        ];
        runningBudgetAdjustments = data.runningBudgetAdjustments || [];
        saveData();
        populateCategories();
        updateDisplay();
        renderDebtDashboard();
        renderDebtsTable();
        renderScreen();
        alert("Data imported successfully.");
      } catch (error) {
        alert("Error importing data: Invalid file format.");
      }
    };
    reader.readAsText(selectedFile);
    importFileInputEl.value = "";
  });
  document.getElementById("reset-btn").addEventListener("click", function (e) {
    e.preventDefault();
    if (confirm("Are you sure you want to reset all data?")) {
      localStorage.clear();
      bills = [];
      incomeEntries = [];
      adhocExpenses = [];
      debts = [];
      accountBalance = 0;
      accountName = "";
      startDate = null;
      projectionLength = 1;
      categories = [
        "Charity/Donations",
        "Childcare",
        "Debt Payments",
        "Dining Out/Takeout",
        "Education",
        "Entertainment",
        "Healthcare",
        "Hobbies/Recreation",
        "Housing",
        "Insurance",
        "Personal Care",
        "Pets",
        "Savings/Investments",
        "Subscriptions/Memberships",
        "Transportation",
        "Travel",
        "Utilities",
        "Misc/Other"
      ];
      runningBudgetAdjustments = [];
      document.getElementById("bill-form").reset();
      document.getElementById("adhoc-expense-form").reset();
      document.getElementById("income-form").reset();
      document.getElementById("balance-form").reset();
      document.getElementById("start-date-form").reset();
      document.getElementById("edit-modal").style.display = "none";
      saveData();
      populateCategories();
      updateDisplay();
      renderDebtDashboard();
      renderDebtsTable();
      alert("All data has been reset.");
    }
  });

  // =======================
  // Instructions Modal (Single Block)
  // =======================
  instructionsBtnEl.addEventListener("click", function (e) {
    e.preventDefault();
    instructionsModalEl.style.display = "block";
  });
  closeModalEl.addEventListener("click", function () {
    instructionsModalEl.style.display = "none";
  });
  closeModalBtnEl.addEventListener("click", function () {
    instructionsModalEl.style.display = "none";
  });
  window.addEventListener("click", function (event) {
    if (event.target === instructionsModalEl) {
      instructionsModalEl.style.display = "none";
    }
  });
  window.addEventListener("load", function () {
    instructionsModalEl.style.display = "block";
  });

  // =======================
  // Collapsible Cards & Categories
  // =======================
  function setupCollapsibleCards() {
    const cards = document.querySelectorAll(".collapsible-card");
    cards.forEach(card => {
      const header = card.querySelector(".card-header");
      const body = card.querySelector(".card-body");
      const toggleIcon = header.querySelector(".card-toggle i");
      if (!card.classList.contains("expanded")) {
        body.classList.add("collapsed");
        toggleIcon.style.transform = "rotate(0deg)";
      } else {
        toggleIcon.style.transform = "rotate(90deg)";
      }
      header.addEventListener("click", () => {
        if (body.classList.contains("collapsed")) {
          body.classList.remove("collapsed");
          card.classList.add("expanded");
          toggleIcon.style.transform = "rotate(90deg)";
        } else {
          body.classList.add("collapsed");
          card.classList.remove("expanded");
          toggleIcon.style.transform = "rotate(0deg)";
        }
      });
    });
    const expandBtn = document.getElementById("expand-cards-btn");
    const collapseBtn = document.getElementById("collapse-cards-btn");
    if (expandBtn) {
      expandBtn.addEventListener("click", e => {
        e.preventDefault();
        cards.forEach(card => {
          card.classList.add("expanded");
          const body = card.querySelector(".card-body");
          const toggleIcon = card.querySelector(".card-toggle i");
          if (body) body.classList.remove("collapsed");
          if (toggleIcon) toggleIcon.style.transform = "rotate(90deg)";
        });
      });
    }
    if (collapseBtn) {
      collapseBtn.addEventListener("click", e => {
        e.preventDefault();
        cards.forEach(card => {
          card.classList.remove("expanded");
          const body = card.querySelector(".card-body");
          const toggleIcon = card.querySelector(".card-toggle i");
          if (body) body.classList.add("collapsed");
          if (toggleIcon) toggleIcon.style.transform = "rotate(0deg)";
        });
      });
    }
  }
  function populateCategories() {
    const adhocSelect = document.getElementById("adhoc-expense-category");
    const billSelect = document.getElementById("bill-category");
    [adhocSelect, billSelect].forEach(select => {
      if (select) {
        select.innerHTML = "";
        categories.forEach(cat => {
          const option = document.createElement("option");
          option.value = cat;
          option.textContent = cat;
          select.appendChild(option);
        });
      }
    });
  }
  document.getElementById("add-adhoc-category-btn").addEventListener("click", addCategory);
  document.getElementById("add-bill-category-btn").addEventListener("click", addCategory);
  function addCategory() {
    const newCat = prompt("Enter new category:");
    if (newCat && newCat.trim()) {
      const trimmed = newCat.trim();
      if (!categories.includes(trimmed)) {
        categories.push(trimmed);
        populateCategories();
        saveData();
        alert(`Category "${trimmed}" added successfully.`);
      } else {
        alert("This category already exists.");
      }
    } else {
      alert("Category name cannot be empty.");
    }
  }

  // =======================
  // Initialize Start Date
  // =======================
  function initializeStartDate() {
    const startInput = document.getElementById("start-date-input");
    const projInput = document.getElementById("projection-length");
    if (startDate && startInput) {
      startInput.value = startDate.toISOString().split("T")[0];
    }
    if (projectionLength && projInput) {
      projInput.value = projectionLength;
    }
  }

  // =======================
  // Initial Loading
  // =======================
  loadData();
  initializeStartDate();
  populateCategories();
  setupCollapsibleCards();
  updateDisplay();
  renderScreen();
  renderDebtDashboard();
  renderDebtsTable();
});
