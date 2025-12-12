document.addEventListener('DOMContentLoaded', function () {
  // =======================
  // Global Data Variables
  // =======================
  let bills = [];
  let incomeEntries = [];
  let adhocExpenses = [];
  let accountBalance = 0; // Checking
  let accountName = '';
  let startDate = null;
  let projectionLength = 1; // Default to 1 month
  let categories = [];
  let runningBudgetAdjustments = [];

  // Chart variables
  let expensesChart;
  let categoryExpensesChart;

  // Sample data (with anonymized names and current dates)
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
      { "name": "Income Payment 1", "amount": 1700, "frequency": "Bi-weekly", "startDate": "2025-12-05" },
      { "name": "Income Payment 2", "amount": 2133.25, "frequency": "Bi-weekly", "startDate": "2025-12-12" }
    ],
    "adhocExpenses": [],
    "accountBalance": 3435.95,
    "accountName": "Sample Checking",
    "startDate": new Date().toISOString(),
    "projectionLength": 6,
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
      "Student Loans",
      "Credit Card Payment"
    ],
    "runningBudgetAdjustments": []
  };

  // =======================
  // Load Sample Data Function
  // =======================
  function loadSampleData() {
    bills = sampleData.bills;
    incomeEntries = sampleData.incomeEntries;
    adhocExpenses = sampleData.adhocExpenses;
    accountBalance = sampleData.accountBalance;
    accountName = sampleData.accountName;
    startDate = new Date(sampleData.startDate);
    projectionLength = sampleData.projectionLength;
    categories = sampleData.categories;
    runningBudgetAdjustments = sampleData.runningBudgetAdjustments;
    saveData();
    populateCategories();
    initializeStartDate();
    updateDisplay();
    alert("Sample data loaded.");
  }

  // =======================
  // Helper Functions & Data Persistence
  // =======================
  
  // Round to 2 decimal places to fix floating point precision issues
  function roundToCents(value) {
    return Math.round(value * 100) / 100;
  }

  function getCurrentDateTimeString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }

  function parseMathExpression(rawValue) {
    let cleaned = rawValue.replace(/\$/g, '');
    cleaned = cleaned.replace(/[^0-9+\-*\\/().]/g, '');
    if (!cleaned) return 0;
    try {
      const result = new Function(`return (${cleaned});`)();
      if (typeof result !== 'number' || isNaN(result)) throw new Error('Invalid expression');
      return roundToCents(result);
    } catch (err) {
      console.warn('Failed to parse math expression:', rawValue);
      return roundToCents(parseFloat(rawValue) || 0);
    }
  }

  function parseDateInput(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  function formatRunningBudgetDate(date) {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  function saveData() {
    localStorage.setItem('bills', JSON.stringify(bills));
    localStorage.setItem('incomeEntries', JSON.stringify(incomeEntries));
    localStorage.setItem('adhocExpenses', JSON.stringify(adhocExpenses));
    localStorage.setItem('accountBalance', accountBalance);
    localStorage.setItem('accountName', accountName);
    localStorage.setItem('startDate', startDate ? startDate.toISOString() : null);
    localStorage.setItem('projectionLength', projectionLength);
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('runningBudgetAdjustments', JSON.stringify(runningBudgetAdjustments));
  }

  function loadData() {
    const billsData = localStorage.getItem('bills');
    const incomeData = localStorage.getItem('incomeEntries');
    const adhocExpensesData = localStorage.getItem('adhocExpenses');
    const balanceData = localStorage.getItem('accountBalance');
    const accountNameData = localStorage.getItem('accountName');
    const startDateData = localStorage.getItem('startDate');
    const projectionLengthData = localStorage.getItem('projectionLength');
    const categoriesData = localStorage.getItem('categories');
    const adjustmentsData = localStorage.getItem('runningBudgetAdjustments');

    if (billsData) bills = JSON.parse(billsData);
    if (incomeData) incomeEntries = JSON.parse(incomeData);
    if (adhocExpensesData) adhocExpenses = JSON.parse(adhocExpensesData);
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
        "Misc/Other",
        "Credit Card Payment",
        "Student Loans"
      ];
      saveData();
    }
    if (adjustmentsData) {
      runningBudgetAdjustments = JSON.parse(adjustmentsData);
      // Fix any existing floating point precision issues in loaded data
      runningBudgetAdjustments = runningBudgetAdjustments.map(adj => ({
        ...adj,
        amount: roundToCents(adj.amount)
      }));
    }
  }

  // Load any saved data
  loadData();
  initializeStartDate();
  populateCategories();
  setupCollapsibleCards();
  updateDisplay();

  // =======================
  // Main Display Update
  // =======================
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
  // Checking Account Display
  // =======================
  function displayCheckingBalance() {
    const balanceDisplay = document.getElementById('balance-display');
    const balanceText = accountName
      ? `${accountName} (Checking) Balance: $${accountBalance.toFixed(2)}`
      : `Current Checking Balance: $${accountBalance.toFixed(2)}`;

    if (balanceDisplay) {
      balanceDisplay.textContent = balanceText;
    } else {
      const balanceElement = document.createElement('h3');
      balanceElement.id = 'balance-display';
      balanceElement.textContent = balanceText;
      document.getElementById('display-area').prepend(balanceElement);
    }
    const balanceDisplayElement = document.getElementById('balance-display');
    if (accountBalance > 100) {
      balanceDisplayElement.style.color = 'green';
    } else if (accountBalance > 0) {
      balanceDisplayElement.style.color = 'orange';
    } else {
      balanceDisplayElement.style.color = 'red';
    }
  }

  // =======================
  // Calculate Running Totals
  // =======================
  function calculateRunningTotals() {
    if (!startDate) {
      console.error('Start date is not set.');
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

      let dailyNet = roundToCents(dailyIncome - dailyExpenses);
      const adjustment = runningBudgetAdjustments.find(adj => {
        const adjDate = parseDateInput(adj.date);
        return adjDate.toDateString() === currentDate.toDateString();
      });

      let eventDescription = getEventsForDate(currentDate);

      if (adjustment) {
        if (adjustment.amount !== undefined) {
          dailyNet = roundToCents(adjustment.amount);
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

      currentBalance = roundToCents(currentBalance);

      runningTotals.push({
        date: new Date(currentDate),
        event: eventDescription,
        dailyNet: dailyNet,
        balance: currentBalance
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return runningTotals;
  }

  // =======================
  // Render Running Budget Table
  // =======================
  function renderRunningBudgetTable(runningTotals) {
    const tableBody = document.getElementById('running-budget-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    if (runningTotals.length === 0) {
      const row = tableBody.insertRow();
      const cell = row.insertCell(0);
      cell.colSpan = 5;
      cell.textContent = 'No data to display. Set a start date and add some bills or income.';
      cell.style.textAlign = 'center';
      cell.style.fontStyle = 'italic';
      return;
    }

    runningTotals.forEach((item, index) => {
      const row = tableBody.insertRow();
      const dateCell = row.insertCell(0);
      const eventCell = row.insertCell(1);
      const debitCreditCell = row.insertCell(2);
      const balanceCell = row.insertCell(3);
      const actionsCell = row.insertCell(4);

      dateCell.textContent = formatRunningBudgetDate(item.date);
      eventCell.textContent = item.event || '---';
      debitCreditCell.textContent = `$${item.dailyNet.toFixed(2)}`;
      balanceCell.textContent = `$${item.balance.toFixed(2)}`;

      if (item.dailyNet > 0) {
        debitCreditCell.classList.add('positive-amount');
      } else if (item.dailyNet === 0) {
        debitCreditCell.classList.add('neutral-amount');
      } else {
        debitCreditCell.classList.add('negative-amount');
      }

      if (item.balance > 100) {
        balanceCell.style.color = 'green';
      } else if (item.balance > 0) {
        balanceCell.style.color = 'orange';
      } else {
        balanceCell.style.color = 'red';
      }

      const editBtn = document.createElement('button');
      editBtn.classList.add('icon-btn');
      editBtn.innerHTML = '<i class="fa-solid fa-edit"></i>';
      editBtn.dataset.index = index;
      editBtn.dataset.type = 'runningBudget';
      editBtn.addEventListener('click', openEditModal);
      actionsCell.appendChild(editBtn);
    });
  }

  // =======================
  // Date Checking Helpers
  // =======================
  function isIncomeOnDate(income, date) {
    const incomeStartDate = parseDateInput(income.startDate);
    if (incomeStartDate > date) return false;
    const diffTime = date - incomeStartDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    switch (income.frequency) {
      case 'Weekly':
        return diffDays % 7 === 0;
      case 'Bi-weekly':
        return diffDays % 14 === 0;
      case 'Monthly':
        // Handle end-of-month dates (e.g., 31st in months with fewer days)
        const incomeDay = incomeStartDate.getDate();
        const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        if (incomeDay > lastDayOfMonth) {
          // If income is set for 31st but month only has 30 days, trigger on last day
          return date.getDate() === lastDayOfMonth;
        }
        return incomeDay === date.getDate();
      case 'One-time':
        return incomeStartDate.toDateString() === date.toDateString();
      default:
        return false;
    }
  }

  function isBillOnDate(bill, date) {
    // Handle end-of-month dates for bills too
    const billDay = bill.date;
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    if (billDay > lastDayOfMonth) {
      return date.getDate() === lastDayOfMonth;
    }
    return billDay === date.getDate();
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
    return events.join(' + ');
  }

  // =======================
  // Lowest Balances By Month
  // =======================
  function displayLowestBalancesByMonth(runningTotals) {
    const tableBody = document.getElementById('lowest-balances-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    if (runningTotals.length === 0) {
      const row = tableBody.insertRow();
      const cell = row.insertCell(0);
      cell.colSpan = 3;
      cell.textContent = 'No data available.';
      cell.style.textAlign = 'center';
      cell.style.fontStyle = 'italic';
      return;
    }

    const monthlyBalances = {};
    runningTotals.forEach((item) => {
      const monthKey = `${item.date.getFullYear()}-${item.date.getMonth() + 1}`;
      if (!monthlyBalances[monthKey] || item.balance < monthlyBalances[monthKey].balance) {
        monthlyBalances[monthKey] = { date: new Date(item.date), balance: item.balance };
      }
    });

    const sortedMonths = Object.keys(monthlyBalances).sort((a, b) => new Date(a + '-1') - new Date(b + '-1'));
    sortedMonths.forEach((monthKey) => {
      const entry = monthlyBalances[monthKey];
      const row = tableBody.insertRow();
      const monthCell = row.insertCell(0);
      const dateCell = row.insertCell(1);
      const balanceCell = row.insertCell(2);

      const monthName = entry.date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      monthCell.textContent = monthName;
      const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      dateCell.textContent = entry.date.toLocaleDateString('en-US', dateOptions);
      balanceCell.textContent = `$${entry.balance.toFixed(2)}`;
      if (entry.balance > 100) {
        balanceCell.style.color = 'green';
      } else if (entry.balance > 0) {
        balanceCell.style.color = 'orange';
      } else {
        balanceCell.style.color = 'red';
      }
    });
  }

  // =======================
  // Render Bills Table
  // =======================
  function renderBillsTable() {
    const billsTableBody = document.getElementById('bills-list-table').getElementsByTagName('tbody')[0];
    billsTableBody.innerHTML = '';

    if (bills.length === 0) {
      const row = billsTableBody.insertRow();
      const cell = row.insertCell(0);
      cell.colSpan = 5;
      cell.textContent = 'No bills added yet.';
      cell.style.textAlign = 'center';
      cell.style.fontStyle = 'italic';
      return;
    }

    bills.forEach((bill, index) => {
      const row = billsTableBody.insertRow();
      row.insertCell(0).textContent = bill.name;
      row.insertCell(1).textContent = bill.date;
      row.insertCell(2).textContent = `$${bill.amount.toFixed(2)}`;
      row.insertCell(3).textContent = bill.category;
      const actionsCell = row.insertCell(4);
      actionsCell.classList.add('actions-cell');

      const editBtn = document.createElement('button');
      editBtn.classList.add('icon-btn');
      editBtn.innerHTML = '<i class="fa-solid fa-edit"></i>';
      editBtn.dataset.index = index;
      editBtn.dataset.type = 'bill';
      editBtn.addEventListener('click', openEditModal);
      actionsCell.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('icon-btn');
      deleteBtn.innerHTML = '<i class="fa-solid fa-trash-alt"></i>';
      deleteBtn.dataset.index = index;
      deleteBtn.dataset.type = 'bill';
      deleteBtn.addEventListener('click', deleteEntry);
      actionsCell.appendChild(deleteBtn);
    });
  }

  // =======================
  // Render Adhoc Expenses Table
  // =======================
  function renderAdhocExpensesTable() {
    const adhocExpensesTableBody = document.getElementById('adhoc-expenses-list-table').getElementsByTagName('tbody')[0];
    adhocExpensesTableBody.innerHTML = '';

    if (adhocExpenses.length === 0) {
      const row = adhocExpensesTableBody.insertRow();
      const cell = row.insertCell(0);
      cell.colSpan = 5;
      cell.textContent = 'No adhoc expenses added yet.';
      cell.style.textAlign = 'center';
      cell.style.fontStyle = 'italic';
      return;
    }

    adhocExpenses.forEach((expense, index) => {
      const row = adhocExpensesTableBody.insertRow();
      row.insertCell(0).textContent = expense.name;
      row.insertCell(1).textContent = formatRunningBudgetDate(parseDateInput(expense.date));
      row.insertCell(2).textContent = `$${expense.amount.toFixed(2)}`;
      row.insertCell(3).textContent = expense.category;
      const actionsCell = row.insertCell(4);
      actionsCell.classList.add('actions-cell');

      const editBtn = document.createElement('button');
      editBtn.classList.add('icon-btn');
      editBtn.innerHTML = '<i class="fa-solid fa-edit"></i>';
      editBtn.dataset.index = index;
      editBtn.dataset.type = 'adhocExpense';
      editBtn.addEventListener('click', openEditModal);
      actionsCell.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('icon-btn');
      deleteBtn.innerHTML = '<i class="fa-solid fa-trash-alt"></i>';
      deleteBtn.dataset.index = index;
      deleteBtn.dataset.type = 'adhocExpense';
      deleteBtn.addEventListener('click', deleteEntry);
      actionsCell.appendChild(deleteBtn);
    });
  }

  // =======================
  // Render Income Table
  // =======================
  function renderIncomeTable() {
    const incomeTableBody = document.getElementById('income-list-table').getElementsByTagName('tbody')[0];
    incomeTableBody.innerHTML = '';

    if (incomeEntries.length === 0) {
      const row = incomeTableBody.insertRow();
      const cell = row.insertCell(0);
      cell.colSpan = 5;
      cell.textContent = 'No income entries added yet.';
      cell.style.textAlign = 'center';
      cell.style.fontStyle = 'italic';
      return;
    }

    incomeEntries.forEach((income, index) => {
      const row = incomeTableBody.insertRow();
      row.insertCell(0).textContent = income.name;
      row.insertCell(1).textContent = `$${income.amount.toFixed(2)}`;
      row.insertCell(2).textContent = income.frequency;
      row.insertCell(3).textContent = formatRunningBudgetDate(parseDateInput(income.startDate));
      const actionsCell = row.insertCell(4);
      actionsCell.classList.add('actions-cell');

      const editBtn = document.createElement('button');
      editBtn.classList.add('icon-btn');
      editBtn.innerHTML = '<i class="fa-solid fa-edit"></i>';
      editBtn.dataset.index = index;
      editBtn.dataset.type = 'income';
      editBtn.addEventListener('click', openEditModal);
      actionsCell.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('icon-btn');
      deleteBtn.innerHTML = '<i class="fa-solid fa-trash-alt"></i>';
      deleteBtn.dataset.index = index;
      deleteBtn.dataset.type = 'income';
      deleteBtn.addEventListener('click', deleteEntry);
      actionsCell.appendChild(deleteBtn);
    });
  }

  // =======================
  // Charts
  // =======================
  function renderExpensesCharts(expenseTotals) {
    const sortedExpenses = Object.entries(expenseTotals).sort((a, b) => b[1] - a[1]);
    const expenseLabels = sortedExpenses.map((item) => item[0]);
    const expenseData = sortedExpenses.map((item) => item[1]);
    renderExpensesChart(expenseLabels, expenseData);
  }

  function renderCategoryCharts(categoryTotals) {
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const categoryLabels = sorted.map(x => x[0]);
    const categoryData = sorted.map(x => x[1]);
    renderCategoryExpensesChart(categoryLabels, categoryData);
  }

  function calculateTotalExpenses() {
    let expenseTotals = {};
    bills.forEach((bill) => {
      const key = bill.name;
      const months = projectionLength;
      expenseTotals[key] = roundToCents((expenseTotals[key] || 0) + bill.amount * months);
    });
    adhocExpenses.forEach((expense) => {
      const key = expense.name;
      expenseTotals[key] = roundToCents((expenseTotals[key] || 0) + expense.amount);
    });
    return expenseTotals;
  }

  function calculateExpensesByCategory() {
    let categoryTotals = {};
    bills.forEach((bill) => {
      const category = bill.category || 'Misc/Other';
      const months = projectionLength;
      categoryTotals[category] = roundToCents((categoryTotals[category] || 0) + bill.amount * months);
    });
    adhocExpenses.forEach((expense) => {
      const category = expense.category || 'Misc/Other';
      categoryTotals[category] = roundToCents((categoryTotals[category] || 0) + expense.amount);
    });
    return categoryTotals;
  }

  function renderExpensesChart(labels, data) {
    const canvasElement = document.getElementById('expenses-chart');
    if (!canvasElement) return console.error('Canvas element "expenses-chart" not found.');
    const ctx = canvasElement.getContext('2d');
    if (expensesChart) expensesChart.destroy();
    
    if (data.length === 0) {
      // Draw empty state message on canvas
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.fillText('No expense data to display.', canvasElement.width / 2, canvasElement.height / 2);
      return;
    }
    
    const maxExpense = Math.max(...data);
    const minExpense = Math.min(...data);
    const colors = data.map((value) => {
      const ratio = (value - minExpense) / (maxExpense - minExpense || 1);
      const green = Math.floor(255 * (1 - ratio));
      return `rgb(255, ${green}, 0)`;
    });
    expensesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Expense Over Projection Period',
          data: data,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        scales: { y: { type: 'logarithmic', beginAtZero: true } },
      },
    });
  }

  function renderCategoryExpensesChart(labels, data) {
    const canvasElement = document.getElementById('category-expenses-chart');
    if (!canvasElement) return console.error('Canvas element "category-expenses-chart" not found.');
    const ctx = canvasElement.getContext('2d');
    if (categoryExpensesChart) categoryExpensesChart.destroy();
    
    if (data.length === 0) {
      // Draw empty state message on canvas
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.fillText('No category data to display.', canvasElement.width / 2, canvasElement.height / 2);
      return;
    }
    
    const colors = labels.map((label, index) => `hsl(${(index * 360) / labels.length}, 70%, 50%)`);
    categoryExpensesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Expenses by Category',
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

  // =======================
  // Edit Modal
  // =======================
  function openEditModal(event) {
    // Use closest() to ensure we get the button element even if the icon is clicked.
    const btn = event.target.closest('button');
    if (!btn) return;
    const index = btn.dataset.index;
    const type = btn.dataset.type;
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const editModalTitle = document.getElementById('edit-modal-title');

    editForm.innerHTML = '';

    if (type === 'bill') {
      const bill = bills[index];
      editModalTitle.textContent = 'Edit Bill/Expense';
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
            ${categories.map(cat => `<option value="${cat}" ${cat === bill.category ? 'selected' : ''}>${cat}</option>`).join('')}
          </select>
          <button type="button" id="add-edit-bill-category-btn">Add Category</button>
        </div>
        <button type="submit">Update Bill</button>
        <button type="button" id="cancel-edit-btn">Cancel</button>
      `;
      editForm.onsubmit = function (e) {
        e.preventDefault();
        updateBillEntry(index);
        editModal.style.display = 'none';
      };
      document.getElementById('add-edit-bill-category-btn').addEventListener('click', addCategory);

    } else if (type === 'adhocExpense') {
      const expense = adhocExpenses[index];
      editModalTitle.textContent = 'Edit Adhoc Expense';
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
            ${categories.map(cat => `<option value="${cat}" ${cat === expense.category ? 'selected' : ''}>${cat}</option>`).join('')}
          </select>
          <button type="button" id="add-edit-adhoc-category-btn">Add Category</button>
        </div>
        <button type="submit">Update Expense</button>
        <button type="button" id="cancel-edit-btn">Cancel</button>
      `;
      editForm.onsubmit = function (e) {
        e.preventDefault();
        updateAdhocExpenseEntry(index);
        editModal.style.display = 'none';
      };
      document.getElementById('add-edit-adhoc-category-btn').addEventListener('click', addCategory);

    } else if (type === 'income') {
      const income = incomeEntries[index];
      editModalTitle.textContent = 'Edit Income';
      editForm.innerHTML = `
        <label for="edit-income-name">Income Name:</label>
        <input type="text" id="edit-income-name" required value="${income.name}" />
        <label for="edit-income-amount">Amount per Paycheck:</label>
        <input type="text" id="edit-income-amount" required value="${income.amount}" />
        <label for="edit-income-frequency">Frequency:</label>
        <select id="edit-income-frequency">
          <option value="Weekly" ${income.frequency === 'Weekly' ? 'selected' : ''}>Weekly</option>
          <option value="Bi-weekly" ${income.frequency === 'Bi-weekly' ? 'selected' : ''}>Bi-weekly</option>
          <option value="Monthly" ${income.frequency === 'Monthly' ? 'selected' : ''}>Monthly</option>
          <option value="One-time" ${income.frequency === 'One-time' ? 'selected' : ''}>One-time</option>
        </select>
        <label for="edit-income-start-date">Start Date:</label>
        <input type="date" id="edit-income-start-date" required value="${income.startDate}" />
        <button type="submit">Update Income</button>
        <button type="button" id="cancel-edit-btn">Cancel</button>
      `;
      editForm.onsubmit = function (e) {
        e.preventDefault();
        updateIncomeEntry(index);
        editModal.style.display = 'none';
      };

    } else if (type === 'runningBudget') {
      const runningTotals = calculateRunningTotals();
      const entry = runningTotals[index];
      editModalTitle.textContent = 'Edit Running Budget Entry';
      editForm.innerHTML = `
        <label for="edit-running-budget-date">Date:</label>
        <input type="date" id="edit-running-budget-date" required value="${entry.date.toISOString().split('T')[0]}" />
        <label for="edit-running-budget-amount">Debit/Credit Amount:</label>
        <input type="text" id="edit-running-budget-amount" required value="${entry.dailyNet}" />
        <label for="edit-running-budget-event">Event/Bill:</label>
        <input type="text" id="edit-running-budget-event" value="${entry.event}" />
        <button type="submit">Update Entry</button>
        <button type="button" id="cancel-edit-btn">Cancel</button>
      `;
      editForm.onsubmit = function (e) {
        e.preventDefault();
        const oldDate = entry.date.toISOString().split('T')[0];
        updateRunningBudgetEntry(oldDate);
        editModal.style.display = 'none';
      };
    }
    editModal.style.display = 'block';
    document.getElementById('cancel-edit-btn').addEventListener('click', function () {
      editModal.style.display = 'none';
    });
  }

  // =======================
  // Update / Delete Entry Functions
  // =======================
  function updateBillEntry(index) {
    const name = document.getElementById('edit-bill-name').value.trim();
    const date = parseInt(document.getElementById('edit-bill-date').value, 10);
    const amount = parseMathExpression(document.getElementById('edit-bill-amount').value);
    const category = document.getElementById('edit-bill-category').value;
    if (date < 1 || date > 31) {
      alert('Please enter a valid day of the month (1-31).');
      return;
    }
    bills[index] = { name, date, amount, category };
    saveData();
    updateDisplay();
  }

  function updateAdhocExpenseEntry(index) {
    const name = document.getElementById('edit-adhoc-expense-name').value.trim();
    const date = document.getElementById('edit-adhoc-expense-date').value;
    const amount = parseMathExpression(document.getElementById('edit-adhoc-expense-amount').value);
    const category = document.getElementById('edit-adhoc-expense-category').value;
    if (!date) {
      alert('Please enter a valid date.');
      return;
    }
    adhocExpenses[index] = { name, date, amount, category };
    saveData();
    updateDisplay();
  }

  function updateIncomeEntry(index) {
    const name = document.getElementById('edit-income-name').value.trim();
    const amount = parseMathExpression(document.getElementById('edit-income-amount').value);
    const frequency = document.getElementById('edit-income-frequency').value;
    const startDate = document.getElementById('edit-income-start-date').value;
    if (!startDate) {
      alert('Please enter a valid start date.');
      return;
    }
    incomeEntries[index] = { name, amount, frequency, startDate };
    saveData();
    updateDisplay();
  }

  function updateRunningBudgetEntry(oldDate) {
    const newDate = document.getElementById('edit-running-budget-date').value;
    const amount = parseMathExpression(document.getElementById('edit-running-budget-amount').value);
    const event = document.getElementById('edit-running-budget-event').value;
    const adjIndex = runningBudgetAdjustments.findIndex(adj => adj.date === oldDate);
    const adjustment = { date: newDate, amount: roundToCents(amount), event };
    if (adjIndex >= 0) {
      runningBudgetAdjustments[adjIndex] = adjustment;
    } else {
      runningBudgetAdjustments.push(adjustment);
    }
    saveData();
    updateDisplay();
  }

  function deleteEntry(event) {
    // Use closest() to ensure we get the button element even if the icon is clicked
    const btn = event.target.closest('button');
    if (!btn) return;
    const index = btn.dataset.index;
    const type = btn.dataset.type;
    
    // Determine what we're deleting for the confirmation message
    let itemName = '';
    if (type === 'bill') {
      itemName = bills[index].name;
    } else if (type === 'adhocExpense') {
      itemName = adhocExpenses[index].name;
    } else if (type === 'income') {
      itemName = incomeEntries[index].name;
    }
    
    // Confirm before deleting
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return;
    }
    
    if (type === 'bill') {
      bills.splice(index, 1);
    } else if (type === 'adhocExpense') {
      adhocExpenses.splice(index, 1);
    } else if (type === 'income') {
      incomeEntries.splice(index, 1);
    }
    saveData();
    updateDisplay();
  }

  // Close Edit Modal
  const closeEditModal = document.getElementById('close-edit-modal');
  closeEditModal.addEventListener('click', function () {
    document.getElementById('edit-modal').style.display = 'none';
  });

  // =======================
  // Form Submissions
  // =======================
  document.getElementById('bill-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('bill-name').value.trim();
    const date = parseInt(document.getElementById('bill-date').value, 10);
    const amount = parseMathExpression(document.getElementById('bill-amount').value);
    const category = document.getElementById('bill-category').value;
    if (date < 1 || date > 31) {
      alert('Please enter a valid day of the month (1-31).');
      return;
    }
    bills.push({ name, date, amount, category });
    saveData();
    e.target.reset();
    updateDisplay();
  });

  document.getElementById('adhoc-expense-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('adhoc-expense-name').value.trim();
    const dateInput = document.getElementById('adhoc-expense-date').value;
    const amount = parseMathExpression(document.getElementById('adhoc-expense-amount').value);
    const category = document.getElementById('adhoc-expense-category').value;
    if (!dateInput) {
      alert('Please enter a valid date.');
      return;
    }
    adhocExpenses.push({ name, date: dateInput, amount, category });
    saveData();
    e.target.reset();
    updateDisplay();
  });

  document.getElementById('income-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('income-name').value.trim();
    const amount = parseMathExpression(document.getElementById('income-amount').value);
    const frequency = document.getElementById('income-frequency').value;
    const startDateInput = document.getElementById('income-start-date').value;
    if (!startDateInput) {
      alert('Please enter a valid start date.');
      return;
    }
    incomeEntries.push({ name, amount, frequency, startDate: startDateInput });
    saveData();
    e.target.reset();
    updateDisplay();
  });

  document.getElementById('balance-form').addEventListener('submit', function (e) {
    e.preventDefault();
    accountName = document.getElementById('account-name').value.trim();
    const balance = parseMathExpression(document.getElementById('account-balance').value);
    if (isNaN(balance)) {
      alert('Please enter a valid balance.');
      return;
    }
    accountBalance = balance;
    saveData();
    e.target.reset();
    updateDisplay();
  });

  document.getElementById('start-date-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const startDateInput = document.getElementById('start-date-input').value;
    const projectionLengthInput = document.getElementById('projection-length').value;
    if (!startDateInput) {
      alert('Please enter a valid start date.');
      return;
    }
    startDate = parseDateInput(startDateInput);
    projectionLength = parseInt(projectionLengthInput, 10);
    saveData();
    updateDisplay();
  });

  // =======================
  // Local Storage Import/Export/Reset
  // =======================
  document.getElementById('export-btn').addEventListener('click', function (e) {
    e.preventDefault();
    const data = {
      bills,
      incomeEntries,
      adhocExpenses,
      accountBalance,
      accountName,
      startDate: startDate ? startDate.toISOString() : null,
      projectionLength,
      categories,
      runningBudgetAdjustments
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    const fileName = `budget_data_${getCurrentDateTimeString()}.json`;
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  });

  const importFileInput = document.getElementById('import-file');
  document.getElementById('import-btn').addEventListener('click', function (e) {
    e.preventDefault();
    importFileInput.click();
  });
  importFileInput.addEventListener('change', function (event) {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      alert('Please select a file to import.');
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        bills = data.bills || [];
        incomeEntries = data.incomeEntries || [];
        adhocExpenses = data.adhocExpenses || [];
        accountBalance = data.accountBalance || 0;
        accountName = data.accountName || '';
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
          "Misc/Other",
          "Credit Card Payment",
          "Student Loans"
        ];
        // Fix floating point precision issues on import
        runningBudgetAdjustments = (data.runningBudgetAdjustments || []).map(adj => ({
          ...adj,
          amount: roundToCents(adj.amount)
        }));
        saveData();
        populateCategories();
        initializeStartDate();
        updateDisplay();
        alert('Data imported successfully.');
      } catch (error) {
        alert('Error importing data: Invalid file format.');
      }
    };
    reader.readAsText(selectedFile);
    importFileInput.value = '';
  });

  document.getElementById('reset-btn').addEventListener('click', function (e) {
    e.preventDefault();
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      localStorage.clear();
      bills = [];
      incomeEntries = [];
      adhocExpenses = [];
      accountBalance = 0;
      accountName = '';
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
        "Misc/Other",
        "Credit Card Payment",
        "Student Loans"
      ];
      runningBudgetAdjustments = [];
      document.getElementById('bill-form').reset();
      document.getElementById('adhoc-expense-form').reset();
      document.getElementById('income-form').reset();
      document.getElementById('balance-form').reset();
      document.getElementById('start-date-form').reset();
      document.getElementById('edit-modal').style.display = 'none';
      saveData();
      populateCategories();
      initializeStartDate();
      updateDisplay();
      alert('All data has been reset.');
    }
  });

  // =======================
  // Instructions Modal
  // =======================
  const instructionsBtn = document.getElementById('instructions-btn');
  const instructionsModal = document.getElementById('instructions-modal');
  const closeModal = document.getElementById('close-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');

  instructionsBtn.addEventListener('click', function (e) {
    e.preventDefault();
    instructionsModal.style.display = 'block';
  });
  closeModal.addEventListener('click', function () {
    instructionsModal.style.display = 'none';
  });
  closeModalBtn.addEventListener('click', function () {
    instructionsModal.style.display = 'none';
  });
  window.addEventListener('click', function (event) {
    if (event.target === instructionsModal) {
      instructionsModal.style.display = 'none';
    }
  });
  window.addEventListener('load', function () {
    instructionsModal.style.display = 'block';
  });

  // =======================
  // Collapsible Cards
  // =======================
  function setupCollapsibleCards() {
    const collapsibleCards = document.querySelectorAll('.collapsible-card');
    collapsibleCards.forEach(card => {
      const header = card.querySelector('.card-header');
      const cardBody = card.querySelector('.card-body');
      const toggleIcon = header.querySelector('.card-toggle i');

      if (header && cardBody) {
        if (!card.classList.contains('expanded')) {
          cardBody.classList.add('collapsed');
          toggleIcon.style.transform = 'rotate(0deg)';
        } else {
          toggleIcon.style.transform = 'rotate(90deg)';
        }

        header.addEventListener('click', () => {
          if (cardBody.classList.contains('collapsed')) {
            cardBody.classList.remove('collapsed');
            card.classList.add('expanded');
            toggleIcon.style.transform = 'rotate(90deg)';
          } else {
            cardBody.classList.add('collapsed');
            card.classList.remove('expanded');
            toggleIcon.style.transform = 'rotate(0deg)';
          }
        });
      }
    });

    const expandCardsBtn = document.getElementById('expand-cards-btn');
    const collapseCardsBtn = document.getElementById('collapse-cards-btn');

    if (expandCardsBtn) {
      expandCardsBtn.addEventListener('click', e => {
        e.preventDefault();
        collapsibleCards.forEach(card => {
          card.classList.add('expanded');
          const body = card.querySelector('.card-body');
          const toggleIcon = card.querySelector('.card-toggle i');
          if (body) body.classList.remove('collapsed');
          if (toggleIcon) toggleIcon.style.transform = 'rotate(90deg)';
        });
      });
    }

    if (collapseCardsBtn) {
      collapseCardsBtn.addEventListener('click', e => {
        e.preventDefault();
        collapsibleCards.forEach(card => {
          card.classList.remove('expanded');
          const body = card.querySelector('.card-body');
          const toggleIcon = card.querySelector('.card-toggle i');
          if (body) body.classList.add('collapsed');
          if (toggleIcon) toggleIcon.style.transform = 'rotate(0deg)';
        });
      });
    }
  }

  // =======================
  // Categories
  // =======================
  function populateCategories() {
    const adhocCategorySelect = document.getElementById('adhoc-expense-category');
    const billCategorySelect = document.getElementById('bill-category');
    [adhocCategorySelect, billCategorySelect].forEach(select => {
      if (select) {
        select.innerHTML = '';
        categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category;
          select.appendChild(option);
        });
      }
    });
  }

  document.getElementById('add-adhoc-category-btn').addEventListener('click', addCategory);
  document.getElementById('add-bill-category-btn').addEventListener('click', addCategory);

  function addCategory() {
    const newCategory = prompt('Enter new category:');
    if (newCategory && newCategory.trim()) {
      const trimmedCategory = newCategory.trim();
      if (!categories.includes(trimmedCategory)) {
        categories.push(trimmedCategory);
        populateCategories();
        saveData();
        alert(`Category "${trimmedCategory}" added successfully.`);
      } else {
        alert('This category already exists.');
      }
    } else {
      alert('Category name cannot be empty.');
    }
  }

  // =======================
  // Initialize Start Date
  // =======================
  function initializeStartDate() {
    const startDateInput = document.getElementById('start-date-input');
    const projectionLengthInput = document.getElementById('projection-length');
    if (startDate && startDateInput) {
      startDateInput.value = startDate.toISOString().split('T')[0];
    }
    if (projectionLength && projectionLengthInput) {
      projectionLengthInput.value = projectionLength;
    }
  }

  // =======================
  // Load Sample Data (Event Listener)
  // =======================
  document.getElementById('load-sample-btn').addEventListener('click', function (e) {
    e.preventDefault();
    loadSampleData();
  });
});
