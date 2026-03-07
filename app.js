document.addEventListener('DOMContentLoaded', function () {
  // =======================
  // App Version (update this when releasing new versions)
  // =======================
  const APP_VERSION = '3.3.1';
  
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
  let debtEntries = [];
  let debtSortColumn = 'name';
  let debtSortDirection = 'asc';

  // Debt types available for selection
  const debtTypes = [
    'Credit Card',
    'Auto Loan',
    'Personal Loan',
    'Student Loan',
    'Mortgage',
    'Medical Debt',
    'Other'
  ];

  // Chart variables
  let expensesChart;
  let categoryExpensesChart;
  let debtDonutChart;

  // =======================
  // Error Handling & Recovery
  // =======================
  function handleFatalError(error, context) {
    console.error(`Budget App Error (${context}):`, error);
    const shouldReset = confirm(
      `Budget App encountered an error: ${error.message}\n\n` +
      `This may be caused by corrupted data. Would you like to reset the app?\n\n` +
      `Click OK to reset (you'll lose your data), or Cancel to try refreshing the page.`
    );
    if (shouldReset) {
      localStorage.clear();
      location.reload();
    }
  }

  // Check for version mismatch that might indicate stale cache
  function checkVersionAndCache() {
    const storedVersion = localStorage.getItem('appVersion');
    if (storedVersion && storedVersion !== APP_VERSION) {
      console.log(`App updated from ${storedVersion} to ${APP_VERSION}`);
      // Version changed - data structure might have changed
      // For now, just update the stored version
      // Future: add migration logic here if needed
    }
    localStorage.setItem('appVersion', APP_VERSION);
  }

  // Sample data — showcases all features added in v3.1–v3.3 (debt linking, equity bars,
  // donut chart, diverse income frequencies, bill-to-debt linking)
  const _sampleNow = new Date();
  const _sampleDayOfWeek = _sampleNow.getDay(); // 0=Sun … 6=Sat
  const _sampleLastFriday = new Date(_sampleNow);
  _sampleLastFriday.setDate(_sampleNow.getDate() - ((_sampleDayOfWeek + 2) % 7));
  const _sampleSecondFriday = new Date(_sampleLastFriday);
  _sampleSecondFriday.setDate(_sampleLastFriday.getDate() + 7);
  const _sampleMonthStart = new Date(_sampleNow.getFullYear(), _sampleNow.getMonth(), 1);
  const _sampleTaxDate = new Date(_sampleNow);
  _sampleTaxDate.setDate(_sampleNow.getDate() + 42);
  const _sampleRegDate = new Date(_sampleNow);
  _sampleRegDate.setDate(_sampleNow.getDate() + 62);
  const _sampleDinnerDate = new Date(_sampleNow);
  _sampleDinnerDate.setDate(_sampleNow.getDate() + 31);
  function _sampleFmt(d) { return d.toISOString().split('T')[0]; }

  const sampleData = {
    "bills": [
      { "name": "Mortgage Payment",              "date": 1,  "amount": 1650.00, "category": "Housing",                   "linkedDebtId": "sample-debt-6" },
      { "name": "Health Insurance",              "date": 1,  "amount": 320.00,  "category": "Insurance",                 "linkedDebtId": null },
      { "name": "Childcare",                     "date": 1,  "amount": 850.00,  "category": "Childcare",                 "linkedDebtId": null },
      { "name": "Grocery Budget",                "date": 3,  "amount": 600.00,  "category": "Groceries",                 "linkedDebtId": null },
      { "name": "Auto Loan Payment",             "date": 5,  "amount": 385.00,  "category": "Transportation",            "linkedDebtId": "sample-debt-3" },
      { "name": "Car Insurance",                 "date": 5,  "amount": 168.00,  "category": "Insurance",                 "linkedDebtId": null },
      { "name": "Internet",                      "date": 8,  "amount": 79.99,   "category": "Utilities",                 "linkedDebtId": null },
      { "name": "Credit Card Payment - Chase",   "date": 10, "amount": 150.00,  "category": "Debt Payments",             "linkedDebtId": "sample-debt-1" },
      { "name": "Electric Bill",                 "date": 12, "amount": 185.00,  "category": "Utilities",                 "linkedDebtId": null },
      { "name": "Credit Card Payment - Discover","date": 15, "amount": 75.00,   "category": "Debt Payments",             "linkedDebtId": "sample-debt-2" },
      { "name": "Streaming Services",            "date": 15, "amount": 45.97,   "category": "Subscriptions/Memberships", "linkedDebtId": null },
      { "name": "Water/Sewer",                   "date": 18, "amount": 75.00,   "category": "Utilities",                 "linkedDebtId": null },
      { "name": "Student Loan Payment",          "date": 20, "amount": 350.00,  "category": "Debt Payments",             "linkedDebtId": "sample-debt-4" },
      { "name": "Personal Loan Payment",         "date": 22, "amount": 150.00,  "category": "Debt Payments",             "linkedDebtId": "sample-debt-5" },
      { "name": "Phone Bill",                    "date": 25, "amount": 145.00,  "category": "Utilities",                 "linkedDebtId": null }
    ],
    "incomeEntries": [
      { "name": "Paycheck - Primary",      "amount": 1850.00, "frequency": "Bi-weekly", "startDate": _sampleFmt(_sampleLastFriday)   },
      { "name": "Paycheck - Secondary",    "amount": 1425.00, "frequency": "Bi-weekly", "startDate": _sampleFmt(_sampleSecondFriday) },
      { "name": "Side Business Revenue",   "amount": 400.00,  "frequency": "Monthly",   "startDate": _sampleFmt(_sampleMonthStart)   }
    ],
    "adhocExpenses": [
      { "name": "Car Registration Renewal", "date": _sampleFmt(_sampleRegDate),    "amount": 285.00, "category": "Transportation"    },
      { "name": "Anniversary Dinner",       "date": _sampleFmt(_sampleDinnerDate), "amount": 150.00, "category": "Dining Out/Takeout"}
    ],
    "accountBalance": 4250.00,
    "accountName": "Household Checking",
    "startDate": new Date().toISOString(),
    "projectionLength": 6,
    "categories": [
      "Charity/Donations",
      "Childcare",
      "Debt Payments",
      "Dining Out/Takeout",
      "Education",
      "Entertainment",
      "Groceries",
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
    ],
    "runningBudgetAdjustments": [
      { "date": _sampleFmt(_sampleTaxDate), "amount": 2800.00, "event": "Tax Refund" }
    ],
    "debtEntries": [
      { "id": "sample-debt-1", "name": "Chase Sapphire",           "type": "Credit Card",   "balance": 6200.00,   "apr": 22.99, "minPayment": 124.00, "actualPayment": 150.00, "loanLength": 0,   "assetValue": 0       },
      { "id": "sample-debt-2", "name": "Discover It",              "type": "Credit Card",   "balance": 1450.00,   "apr": 18.49, "minPayment": 29.00,  "actualPayment": 75.00,  "loanLength": 0,   "assetValue": 0       },
      { "id": "sample-debt-3", "name": "Auto Loan - Toyota",       "type": "Auto Loan",     "balance": 18500.00,  "apr": 5.49,  "minPayment": 385.00, "actualPayment": 385.00, "loanLength": 60,  "assetValue": 22000   },
      { "id": "sample-debt-4", "name": "Federal Student Loan",     "type": "Student Loan",  "balance": 32000.00,  "apr": 4.99,  "minPayment": 320.00, "actualPayment": 350.00, "loanLength": 120, "assetValue": 0       },
      { "id": "sample-debt-5", "name": "Personal Loan - CU",       "type": "Personal Loan", "balance": 4800.00,   "apr": 9.99,  "minPayment": 145.00, "actualPayment": 150.00, "loanLength": 36,  "assetValue": 0       },
      { "id": "sample-debt-6", "name": "Home Mortgage",            "type": "Mortgage",      "balance": 245000.00, "apr": 6.75,  "minPayment": 1590.00,"actualPayment": 1650.00,"loanLength": 360, "assetValue": 310000  }
    ]
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
    debtEntries = sampleData.debtEntries;
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

  function generateId() {
    return crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function getBillEffectiveAmount(bill) {
    if (!bill.linkedDebtId) return bill.amount;
    const debt = debtEntries.find(d => d.id === bill.linkedDebtId);
    return debt ? debt.actualPayment : bill.amount;
  }

  function syncLinkedBillAmounts() {
    let changed = false;
    bills.forEach(bill => {
      if (!bill.linkedDebtId) return;
      const debt = debtEntries.find(d => d.id === bill.linkedDebtId);
      if (debt && bill.amount !== debt.actualPayment) {
        bill.amount = debt.actualPayment;
        changed = true;
      }
    });
    if (changed) saveData();
  }

  function unlinkBillsForDebt(debtId) {
    bills.forEach(bill => {
      if (bill.linkedDebtId === debtId) {
        bill.amount = getBillEffectiveAmount(bill);
        bill.linkedDebtId = null;
      }
    });
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
    localStorage.setItem('debtEntries', JSON.stringify(debtEntries));
  }

  function loadData() {
    try {
      const billsData = localStorage.getItem('bills');
      const incomeData = localStorage.getItem('incomeEntries');
      const adhocExpensesData = localStorage.getItem('adhocExpenses');
      const balanceData = localStorage.getItem('accountBalance');
      const accountNameData = localStorage.getItem('accountName');
      const startDateData = localStorage.getItem('startDate');
      const projectionLengthData = localStorage.getItem('projectionLength');
      const categoriesData = localStorage.getItem('categories');
      const adjustmentsData = localStorage.getItem('runningBudgetAdjustments');
      const debtData = localStorage.getItem('debtEntries');

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
      if (debtData) {
        debtEntries = JSON.parse(debtData);
        // Fix any floating point precision issues in loaded debt data
        debtEntries = debtEntries.map(debt => ({
          id: debt.id || generateId(),
          ...debt,
          balance: roundToCents(debt.balance),
          minPayment: roundToCents(debt.minPayment),
          actualPayment: roundToCents(debt.actualPayment),
          apr: parseFloat(debt.apr) || 0
        }));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      // Reset to defaults if data is corrupted
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
      debtEntries = [];
      // Don't save here - let user decide if they want to reset
      throw new Error('Corrupted localStorage data detected');
    }
  }

  // =======================
  // Initialize App with Error Handling
  // =======================
  try {
    checkVersionAndCache();
    loadData();
    initializeStartDate();
    populateCategories();
    setupCollapsibleCards();
    updateDisplay();
    console.log(`Budget App v${APP_VERSION} loaded successfully`);
  } catch (error) {
    handleFatalError(error, 'initialization');
  }

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
    renderDebtTable();
    updateDebtSummary();
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
          dailyExpenses += getBillEffectiveAmount(bill);
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
      const nameCell = row.insertCell(0);
      nameCell.textContent = bill.name;
      if (bill.linkedDebtId) {
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-link';
        icon.title = 'Linked to debt tracker';
        icon.style.cssText = 'margin-left:6px;color:#888;font-size:0.85em;';
        nameCell.appendChild(icon);
      }
      row.insertCell(1).textContent = bill.date;
      row.insertCell(2).textContent = `$${getBillEffectiveAmount(bill).toFixed(2)}`;
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
  // Debt Tracking
  // =======================

  // Calculate estimated payoff months for a debt
  function calculatePayoffMonths(balance, apr, monthlyPayment) {
    if (monthlyPayment <= 0 || balance <= 0) return Infinity;

    const monthlyRate = (apr / 100) / 12;

    // If monthly payment doesn't cover interest, it will never pay off
    const monthlyInterest = balance * monthlyRate;
    if (monthlyPayment <= monthlyInterest) return Infinity;

    // For 0% APR, simple division
    if (apr === 0) {
      return Math.ceil(balance / monthlyPayment);
    }

    // Standard amortization formula: n = -log(1 - (r * P / M)) / log(1 + r)
    // Where: n = number of months, r = monthly rate, P = principal, M = monthly payment
    const months = -Math.log(1 - (monthlyRate * balance / monthlyPayment)) / Math.log(1 + monthlyRate);

    return Math.ceil(months);
  }

  // Format payoff months for display
  function formatPayoffMonths(months) {
    if (months === Infinity || isNaN(months)) {
      return 'Never';
    }
    if (months <= 0) {
      return 'Paid';
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) {
      return `${months} mo`;
    } else if (remainingMonths === 0) {
      return `${years} yr`;
    } else {
      return `${years} yr ${remainingMonths} mo`;
    }
  }

  // Sort debt entries
  function sortDebtEntries(entries) {
    return [...entries].sort((a, b) => {
      let aVal, bVal;

      switch (debtSortColumn) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'type':
          aVal = a.type.toLowerCase();
          bVal = b.type.toLowerCase();
          break;
        case 'balance':
          aVal = a.balance;
          bVal = b.balance;
          break;
        case 'apr':
          aVal = a.apr;
          bVal = b.apr;
          break;
        case 'minPayment':
          aVal = a.minPayment;
          bVal = b.minPayment;
          break;
        case 'actualPayment':
          aVal = a.actualPayment;
          bVal = b.actualPayment;
          break;
        case 'payoffMonths':
          aVal = calculatePayoffMonths(a.balance, a.apr, a.actualPayment);
          bVal = calculatePayoffMonths(b.balance, b.apr, b.actualPayment);
          break;
        default:
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
      }

      if (typeof aVal === 'string') {
        const comparison = aVal.localeCompare(bVal);
        return debtSortDirection === 'asc' ? comparison : -comparison;
      } else {
        const comparison = aVal - bVal;
        return debtSortDirection === 'asc' ? comparison : -comparison;
      }
    });
  }

  // Render Debt Table
  function renderDebtTable() {
    const debtTableBody = document.getElementById('debt-list-table').getElementsByTagName('tbody')[0];
    debtTableBody.innerHTML = '';

    if (debtEntries.length === 0) {
      const row = debtTableBody.insertRow();
      const cell = row.insertCell(0);
      cell.colSpan = 8;
      cell.textContent = 'No debt accounts added yet.';
      cell.style.textAlign = 'center';
      cell.style.fontStyle = 'italic';
      return;
    }

    const sortedEntries = sortDebtEntries(debtEntries);

    sortedEntries.forEach((debt) => {
      // Find original index for edit/delete operations
      const originalIndex = debtEntries.findIndex(d =>
        d.name === debt.name && d.type === debt.type && d.balance === debt.balance
      );

      const row = debtTableBody.insertRow();
      row.insertCell(0).textContent = debt.name;
      row.insertCell(1).textContent = debt.type;

      const balanceCell = row.insertCell(2);
      balanceCell.textContent = `$${debt.balance.toFixed(2)}`;
      balanceCell.classList.add('negative-amount');

      row.insertCell(3).textContent = `${debt.apr.toFixed(2)}%`;
      row.insertCell(4).textContent = `$${debt.minPayment.toFixed(2)}`;
      row.insertCell(5).textContent = `$${debt.actualPayment.toFixed(2)}`;

      const payoffMonths = calculatePayoffMonths(debt.balance, debt.apr, debt.actualPayment);
      const payoffCell = row.insertCell(6);
      payoffCell.textContent = formatPayoffMonths(payoffMonths);
      if (payoffMonths === Infinity) {
        payoffCell.classList.add('negative-amount');
      } else if (payoffMonths <= 12) {
        payoffCell.classList.add('positive-amount');
      }

      const actionsCell = row.insertCell(7);
      actionsCell.classList.add('actions-cell');

      const editBtn = document.createElement('button');
      editBtn.classList.add('icon-btn');
      editBtn.innerHTML = '<i class="fa-solid fa-edit"></i>';
      editBtn.dataset.index = originalIndex;
      editBtn.dataset.type = 'debt';
      editBtn.addEventListener('click', openEditModal);
      actionsCell.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('icon-btn');
      deleteBtn.innerHTML = '<i class="fa-solid fa-trash-alt"></i>';
      deleteBtn.dataset.index = originalIndex;
      deleteBtn.dataset.type = 'debt';
      deleteBtn.addEventListener('click', deleteEntry);
      actionsCell.appendChild(deleteBtn);
    });

    // Update sort icons
    updateDebtSortIcons();
  }

  // Update sort icons in table header
  function updateDebtSortIcons() {
    const headers = document.querySelectorAll('#debt-list-table th.sortable');
    headers.forEach(header => {
      const icon = header.querySelector('i');
      const column = header.dataset.column;
      if (column === debtSortColumn) {
        icon.className = debtSortDirection === 'asc'
          ? 'fa-solid fa-sort-up'
          : 'fa-solid fa-sort-down';
      } else {
        icon.className = 'fa-solid fa-sort';
      }
    });
  }

  // Calculate and update debt summary
  function updateDebtSummary() {
    const totalDebt = debtEntries.reduce((sum, debt) => sum + debt.balance, 0);
    const totalMinPayment = debtEntries.reduce((sum, debt) => sum + debt.minPayment, 0);
    const totalActualPayment = debtEntries.reduce((sum, debt) => sum + debt.actualPayment, 0);

    // Calculate weighted average APR (weighted by balance)
    let weightedApr = 0;
    if (totalDebt > 0) {
      weightedApr = debtEntries.reduce((sum, debt) => sum + (debt.apr * debt.balance), 0) / totalDebt;
    }

    // Calculate estimated debt-free date (longest payoff time)
    let maxPayoffMonths = 0;
    debtEntries.forEach(debt => {
      const months = calculatePayoffMonths(debt.balance, debt.apr, debt.actualPayment);
      if (months !== Infinity && months > maxPayoffMonths) {
        maxPayoffMonths = months;
      }
    });

    let debtFreeDate = 'N/A';
    if (debtEntries.length > 0 && maxPayoffMonths > 0 && maxPayoffMonths !== Infinity) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + maxPayoffMonths);
      debtFreeDate = futureDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else if (debtEntries.some(d => calculatePayoffMonths(d.balance, d.apr, d.actualPayment) === Infinity)) {
      debtFreeDate = 'Never (increase payments)';
    }

    // Update display
    document.getElementById('total-debt').textContent = `$${totalDebt.toFixed(2)}`;
    document.getElementById('total-min-payment').textContent = `$${totalMinPayment.toFixed(2)}`;
    document.getElementById('total-actual-payment').textContent = `$${totalActualPayment.toFixed(2)}`;
    document.getElementById('avg-interest-rate').textContent = `${weightedApr.toFixed(2)}%`;
    document.getElementById('debt-account-count').textContent = debtEntries.length;
    document.getElementById('debt-free-date').textContent = debtFreeDate;

    // Color code total debt
    const totalDebtEl = document.getElementById('total-debt');
    if (totalDebt > 0) {
      totalDebtEl.style.color = 'red';
    } else {
      totalDebtEl.style.color = 'green';
    }

    // Asset debt summary metrics (Est. Asset Value + Net Equity)
    const assetDebtsWithValue = debtEntries.filter(d => isAssetDebtType(d.type) && d.assetValue > 0);
    const assetMetricsRow = document.getElementById('debt-asset-metrics-row');
    if (assetDebtsWithValue.length > 0) {
      const totalAssetVal = assetDebtsWithValue.reduce((s, d) => s + d.assetValue, 0);
      const totalAssetDebt = assetDebtsWithValue.reduce((s, d) => s + d.balance, 0);
      const netEquity = totalAssetVal - totalAssetDebt;
      const grid = document.querySelector('#debt-summary-container .debt-summary-grid');
      if (!assetMetricsRow && grid) {
        const row = document.createElement('div');
        row.id = 'debt-asset-metrics-row';
        row.style.cssText = 'display:contents;';
        row.innerHTML = `
          <div class="debt-summary-item">
            <span class="debt-summary-label">Est. Total Asset Value:</span>
            <span id="total-asset-value" class="debt-summary-value">$${totalAssetVal.toFixed(2)}</span>
          </div>
          <div class="debt-summary-item">
            <span class="debt-summary-label">Net Asset Equity:</span>
            <span id="net-asset-equity" class="debt-summary-value" style="color:${netEquity >= 0 ? 'green' : 'red'}">$${netEquity.toFixed(2)}</span>
          </div>`;
        grid.appendChild(row);
      } else if (assetMetricsRow) {
        document.getElementById('total-asset-value').textContent = `$${totalAssetVal.toFixed(2)}`;
        const equityEl = document.getElementById('net-asset-equity');
        equityEl.textContent = `$${netEquity.toFixed(2)}`;
        equityEl.style.color = netEquity >= 0 ? 'green' : 'red';
      }
    } else if (assetMetricsRow) {
      assetMetricsRow.remove();
    }

    // Render new debt visualizations
    renderAssetEquityBars();
    renderDebtDonutChart();
  }

  // =======================
  // Debt Donut Chart
  // =======================
  function renderDebtDonutChart() {
    const container = document.getElementById('debt-donut-container');
    const canvas = document.getElementById('debt-donut-chart');
    if (!container || !canvas) return;

    // Aggregate balance by debt type (skip zero-balance debts)
    const typeBalances = {};
    debtEntries.forEach(debt => {
      if (debt.balance > 0) {
        typeBalances[debt.type] = (typeBalances[debt.type] || 0) + debt.balance;
      }
    });

    const types = Object.keys(typeBalances);
    if (types.length === 0) {
      container.style.display = 'none';
      if (debtDonutChart) { debtDonutChart.destroy(); debtDonutChart = null; }
      return;
    }
    container.style.display = 'block';

    const debtTypeColors = {
      'Credit Card':   '#e74c3c',
      'Medical Debt':  '#e67e22',
      'Personal Loan': '#f0b429',
      'Student Loan':  '#27ae60',
      'Auto Loan':     '#3498db',
      'Mortgage':      '#1a5276',
      'Other':         '#95a5a6'
    };

    const labels = types;
    const data = types.map(t => typeBalances[t]);
    const colors = types.map(t => debtTypeColors[t] || '#95a5a6');
    const totalDebt = data.reduce((s, v) => s + v, 0);

    const centerTextPlugin = {
      id: 'debtDonutCenter',
      beforeDraw(chart) {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        const cx = (chartArea.left + chartArea.right) / 2;
        const cy = (chartArea.top + chartArea.bottom) / 2;
        ctx.save();
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#343a40';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`$${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, cx, cy - 10);
        ctx.font = '12px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText('Total Debt', cx, cy + 12);
        ctx.restore();
      }
    };

    if (debtDonutChart) { debtDonutChart.destroy(); debtDonutChart = null; }

    debtDonutChart = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        cutout: '65%',
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label(context) {
                const val = context.parsed;
                const pct = ((val / totalDebt) * 100).toFixed(1);
                return ` $${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${pct}%)`;
              }
            }
          }
        }
      },
      plugins: [centerTextPlugin]
    });
  }

  // =======================
  // Asset Equity Bars
  // =======================
  function renderAssetEquityBars() {
    const container = document.getElementById('asset-equity-container');
    if (!container) return;

    const assetDebts = debtEntries.filter(d => isAssetDebtType(d.type) && d.assetValue > 0);

    if (assetDebts.length === 0) {
      container.style.display = 'none';
      container.innerHTML = '';
      return;
    }
    container.style.display = 'block';
    container.innerHTML = '';

    function formatDollars(n) {
      return '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    function buildBar(debt, isConsolidated) {
      const { name, balance, assetValue } = debt;
      const underwater = balance > assetValue;
      const debtPct = Math.min((balance / assetValue) * 100, 100);
      const equityPct = underwater ? 0 : ((assetValue - balance) / assetValue) * 100;
      const equityAmt = assetValue - balance;

      const labelText = isConsolidated
        ? (underwater
            ? `All Asset Debts — underwater by ${formatDollars(-equityAmt)}`
            : `All Asset Debts — ${formatDollars(equityAmt)} total equity`)
        : (underwater
            ? `${name} — underwater by ${formatDollars(-equityAmt)}`
            : `${name} — ${formatDollars(equityAmt)} equity`);

      const trackClass = isConsolidated ? 'eq-bar-track consolidated' : 'eq-bar-track';

      const row = document.createElement('div');
      row.className = 'eq-bar-row';
      row.innerHTML = `
        <div class="eq-bar-label">${labelText}</div>
        <div class="${trackClass}">
          <div class="eq-debt-fill" style="width:${debtPct.toFixed(2)}%"></div>
          ${underwater ? '' : `<div class="eq-equity-fill" style="width:${equityPct.toFixed(2)}%"></div>`}
        </div>`;
      return row;
    }

    // Consolidated bar (only if 2+ qualifying debts)
    if (assetDebts.length >= 2) {
      const totalAssetValue = assetDebts.reduce((s, d) => s + d.assetValue, 0);
      const totalBalance = assetDebts.reduce((s, d) => s + d.balance, 0);
      const consolidated = { name: 'All Asset Debts', balance: totalBalance, assetValue: totalAssetValue };
      const title = document.createElement('h3');
      title.className = 'eq-section-title';
      title.textContent = 'Asset-Backed Debt Overview';
      container.appendChild(title);
      container.appendChild(buildBar(consolidated, true));
    }

    // Individual bars
    assetDebts.forEach(debt => container.appendChild(buildBar(debt, false)));
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
      expenseTotals[key] = roundToCents((expenseTotals[key] || 0) + getBillEffectiveAmount(bill) * months);
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
      categoryTotals[category] = roundToCents((categoryTotals[category] || 0) + getBillEffectiveAmount(bill) * months);
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
      const debtOptionsHtml = debtEntries.map(d =>
        `<option value="${d.id}" ${d.id === bill.linkedDebtId ? 'selected' : ''}>${d.name} (${d.type}) — $${d.actualPayment.toFixed(2)}/mo</option>`
      ).join('');
      editForm.innerHTML = `
        <label for="edit-bill-name">Bill Name:</label>
        <input type="text" id="edit-bill-name" required value="${bill.name}" />
        <label for="edit-bill-date">Day of Month (1-31):</label>
        <input type="number" id="edit-bill-date" min="1" max="31" required value="${bill.date}" />
        <label for="edit-bill-amount">Amount (USD):</label>
        <input type="text" id="edit-bill-amount" required value="${getBillEffectiveAmount(bill)}" ${bill.linkedDebtId ? 'readonly' : ''} />
        ${bill.linkedDebtId ? '<small style="color:#666;">(managed by debt tracker)</small>' : ''}
        <label for="edit-bill-linked-debt">Link to Debt Account:</label>
        <select id="edit-bill-linked-debt">
          <option value="">-- Unlink / None --</option>
          ${debtOptionsHtml}
        </select>
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
      // Wire the debt link select to toggle amount readonly
      document.getElementById('edit-bill-linked-debt').addEventListener('change', function () {
        const amountInput = document.getElementById('edit-bill-amount');
        if (this.value) {
          const debt = debtEntries.find(d => d.id === this.value);
          amountInput.value = debt ? debt.actualPayment : amountInput.value;
          amountInput.readOnly = true;
        } else {
          amountInput.readOnly = false;
        }
      });
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

    } else if (type === 'debt') {
      const debt = debtEntries[index];
      editModalTitle.textContent = 'Edit Debt Account';
      editForm.innerHTML = `
        <label for="edit-debt-name">Creditor Name:</label>
        <input type="text" id="edit-debt-name" required value="${debt.name}" />
        <label for="edit-debt-type">Debt Type:</label>
        <select id="edit-debt-type">
          ${debtTypes.map(t => `<option value="${t}" ${t === debt.type ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
        <label for="edit-debt-balance">Current Balance (USD):</label>
        <input type="text" id="edit-debt-balance" required value="${debt.balance}" />
        <label for="edit-debt-apr">APR (%):</label>
        <input type="text" id="edit-debt-apr" required value="${debt.apr}" />
        <label for="edit-debt-min-payment">Minimum Payment (USD):</label>
        <input type="text" id="edit-debt-min-payment" required value="${debt.minPayment}" />
        <label for="edit-debt-actual-payment">Actual Monthly Payment (USD):</label>
        <input type="text" id="edit-debt-actual-payment" required value="${debt.actualPayment}" />
        <label for="edit-debt-loan-length">Loan Term (months, 0 for revolving credit):</label>
        <input type="number" id="edit-debt-loan-length" min="0" value="${debt.loanLength || 0}" />
        <div id="edit-asset-value-field" style="display:${isAssetDebtType(debt.type) ? 'block' : 'none'};">
          <label for="edit-debt-asset-value">Est. Asset Value (USD):</label>
          <input type="text" id="edit-debt-asset-value" placeholder="e.g., 25000" value="${debt.assetValue || ''}" />
        </div>
        <button type="submit">Update Debt</button>
        <button type="button" id="cancel-edit-btn">Cancel</button>
      `;
      // Wire up asset value field visibility to type selector in edit modal
      document.getElementById('edit-debt-type').addEventListener('change', function () {
        const editAssetField = document.getElementById('edit-asset-value-field');
        if (isAssetDebtType(this.value)) {
          editAssetField.style.display = 'block';
        } else {
          editAssetField.style.display = 'none';
          document.getElementById('edit-debt-asset-value').value = '';
        }
      });
      editForm.onsubmit = function (e) {
        e.preventDefault();
        updateDebtEntry(index);
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
    const category = document.getElementById('edit-bill-category').value;
    const linkedDebtId = document.getElementById('edit-bill-linked-debt').value || null;
    const amount = linkedDebtId
      ? getBillEffectiveAmount(bills[index])
      : parseMathExpression(document.getElementById('edit-bill-amount').value);
    if (date < 1 || date > 31) {
      alert('Please enter a valid day of the month (1-31).');
      return;
    }
    bills[index] = { name, date, amount, category, linkedDebtId };
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

  function updateDebtEntry(index) {
    const name = document.getElementById('edit-debt-name').value.trim();
    const type = document.getElementById('edit-debt-type').value;
    const balance = parseMathExpression(document.getElementById('edit-debt-balance').value);
    const apr = parseFloat(document.getElementById('edit-debt-apr').value) || 0;
    const minPayment = parseMathExpression(document.getElementById('edit-debt-min-payment').value);
    const actualPayment = parseMathExpression(document.getElementById('edit-debt-actual-payment').value);
    const loanLength = parseInt(document.getElementById('edit-debt-loan-length').value, 10) || 0;
    const assetValue = isAssetDebtType(type)
      ? (parseMathExpression(document.getElementById('edit-debt-asset-value').value) || 0)
      : 0;

    if (balance < 0) {
      alert('Balance cannot be negative.');
      return;
    }
    if (apr < 0) {
      alert('APR cannot be negative.');
      return;
    }

    debtEntries[index] = { id: debtEntries[index].id, name, type, balance, apr, minPayment, actualPayment, loanLength, assetValue };
    syncLinkedBillAmounts();
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
    } else if (type === 'debt') {
      itemName = debtEntries[index].name;
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
    } else if (type === 'debt') {
      unlinkBillsForDebt(debtEntries[index].id);
      debtEntries.splice(index, 1);
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
    const linkedDebtId = document.getElementById('bill-linked-debt').value || null;
    const amount = linkedDebtId
      ? (debtEntries.find(d => d.id === linkedDebtId) || {}).actualPayment || 0
      : parseMathExpression(document.getElementById('bill-amount').value);
    const category = document.getElementById('bill-category').value;
    if (date < 1 || date > 31) {
      alert('Please enter a valid day of the month (1-31).');
      return;
    }
    bills.push({ name, date, amount, category, linkedDebtId });
    saveData();
    e.target.reset();
    // Reset link toggle state
    document.getElementById('bill-link-debt-toggle').checked = false;
    document.getElementById('bill-debt-dropdown-wrapper').style.display = 'none';
    document.getElementById('bill-amount').disabled = false;
    document.getElementById('bill-linked-debt-preview').textContent = '';
    updateDisplay();
  });

  function populateBillDebtDropdown(selectEl) {
    selectEl.innerHTML = '<option value="">-- Select debt account --</option>';
    debtEntries.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = `${d.name} (${d.type}) — $${d.actualPayment.toFixed(2)}/mo`;
      selectEl.appendChild(opt);
    });
  }

  document.getElementById('bill-link-debt-toggle').addEventListener('change', function () {
    const wrapper = document.getElementById('bill-debt-dropdown-wrapper');
    const amountInput = document.getElementById('bill-amount');
    if (this.checked) {
      wrapper.style.display = 'block';
      amountInput.disabled = true;
      populateBillDebtDropdown(document.getElementById('bill-linked-debt'));
    } else {
      wrapper.style.display = 'none';
      amountInput.disabled = false;
      document.getElementById('bill-linked-debt').value = '';
      document.getElementById('bill-linked-debt-preview').textContent = '';
    }
  });

  document.getElementById('bill-linked-debt').addEventListener('change', function () {
    const debt = debtEntries.find(d => d.id === this.value);
    document.getElementById('bill-linked-debt-preview').textContent =
      debt ? `Will use $${debt.actualPayment.toFixed(2)} from debt tracker` : '';
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

  document.getElementById('debt-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('debt-name').value.trim();
    const type = document.getElementById('debt-type').value;
    const balance = parseMathExpression(document.getElementById('debt-balance').value);
    const apr = parseFloat(document.getElementById('debt-apr').value) || 0;
    const minPayment = parseMathExpression(document.getElementById('debt-min-payment').value);
    const actualPayment = parseMathExpression(document.getElementById('debt-actual-payment').value);
    const loanLength = parseInt(document.getElementById('debt-loan-length').value, 10) || 0;

    if (balance < 0) {
      alert('Balance cannot be negative.');
      return;
    }
    if (apr < 0) {
      alert('APR cannot be negative.');
      return;
    }

    const assetValue = isAssetDebtType(type)
      ? (parseMathExpression(document.getElementById('debt-asset-value').value) || 0)
      : 0;

    debtEntries.push({ id: generateId(), name, type, balance, apr, minPayment, actualPayment, loanLength, assetValue });
    saveData();
    e.target.reset();
    // Reset asset value field visibility after submit
    document.getElementById('asset-value-field').style.display = 'none';
    updateDisplay();
  });

  // Show/hide Est. Asset Value field based on debt type selection
  function isAssetDebtType(type) {
    return type === 'Auto Loan' || type === 'Mortgage';
  }

  document.getElementById('debt-type').addEventListener('change', function () {
    const assetField = document.getElementById('asset-value-field');
    if (isAssetDebtType(this.value)) {
      assetField.style.display = 'block';
    } else {
      assetField.style.display = 'none';
      document.getElementById('debt-asset-value').value = '';
    }
  });

  // Debt table sorting
  document.querySelectorAll('#debt-list-table th.sortable').forEach(header => {
    header.addEventListener('click', function () {
      const column = this.dataset.column;
      if (debtSortColumn === column) {
        debtSortDirection = debtSortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        debtSortColumn = column;
        debtSortDirection = 'asc';
      }
      renderDebtTable();
    });
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
      runningBudgetAdjustments,
      debtEntries
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
        // Import debt entries with precision fixes
        debtEntries = (data.debtEntries || []).map(debt => ({
          id: debt.id || generateId(),
          ...debt,
          balance: roundToCents(debt.balance || 0),
          minPayment: roundToCents(debt.minPayment || 0),
          actualPayment: roundToCents(debt.actualPayment || 0),
          apr: parseFloat(debt.apr) || 0,
          loanLength: parseInt(debt.loanLength, 10) || 0,
          assetValue: roundToCents(debt.assetValue || 0)
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
      debtEntries = [];
      document.getElementById('bill-form').reset();
      document.getElementById('adhoc-expense-form').reset();
      document.getElementById('income-form').reset();
      document.getElementById('balance-form').reset();
      document.getElementById('start-date-form').reset();
      document.getElementById('debt-form').reset();
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

  // =======================
  // Guide Me Wizard
  // =======================

  // Wizard state
  const wizard = {
    currentStep: 1,
    maxReached: 1,   // highest step visited — controls progress bar clickability
    snapshot: null,  // captured at open() for "Start Over"
  };

  // Open wizard: capture snapshot, pre-populate Step 1, go to step 1
  function wizardOpen() {
    wizard.snapshot = {
      billsLen: bills.length,
      incomeLen: incomeEntries.length,
      debtsLen: debtEntries.length,
      adhocLen: adhocExpenses.length,
      adjustmentsLen: runningBudgetAdjustments.length,
      accountBalance: accountBalance,
      accountName: accountName,
      startDate: startDate ? new Date(startDate) : null,
      projectionLength: projectionLength,
    };
    wizard.maxReached = 1;

    // Pre-populate Step 1 with current values
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('wiz-start-date').value = startDate
      ? startDate.toISOString().split('T')[0]
      : today;
    document.getElementById('wiz-projection').value = projectionLength || 3;
    document.getElementById('wiz-account-name').value = accountName || '';
    document.getElementById('wiz-balance').value = accountBalance ? accountBalance.toFixed(2) : '';

    // Pre-populate Step 2 income start date
    document.getElementById('wiz-income-start').value = today;

    // Pre-populate Step 5 date
    document.getElementById('wiz-adhoc-date').value = today;

    // Clear all summary lists
    ['wiz-income-list', 'wiz-debt-list', 'wiz-bill-list', 'wiz-adhoc-list'].forEach(id => {
      document.getElementById(id).innerHTML = '';
    });

    // Populate category selects
    wizardPopulateCategories();

    // Hide all steps, show step 1
    for (let i = 1; i <= 6; i++) {
      const el = document.getElementById('wizard-step-' + i);
      if (el) el.style.display = i === 1 ? 'block' : 'none';
    }
    wizard.currentStep = 1;
    wizardUpdateProgressBar();

    // Show modal
    document.getElementById('guide-me-modal').style.display = 'flex';
  }

  // Close wizard with confirmation
  function wizardClose() {
    if (confirm('Your progress has been saved. You can re-enter your data using the forms anytime.\n\nClose the wizard?')) {
      document.getElementById('guide-me-modal').style.display = 'none';
    }
  }

  // Navigate to a specific step
  function wizardGoToStep(n) {
    const current = document.getElementById('wizard-step-' + wizard.currentStep);
    if (current) current.style.display = 'none';

    const next = document.getElementById('wizard-step-' + n);
    if (next) next.style.display = 'block';

    wizard.currentStep = n;
    wizard.maxReached = Math.max(wizard.maxReached, n);
    wizardUpdateProgressBar();

    // On entering Step 4, refresh bill category select and debt dropdown
    if (n === 4) {
      wizardPopulateCategories();
      // Reset debt link toggle
      const toggle = document.getElementById('wiz-bill-link-toggle');
      if (toggle && toggle.checked) {
        toggle.checked = false;
        document.getElementById('wiz-bill-debt-wrapper').style.display = 'none';
        document.getElementById('wiz-bill-amount').disabled = false;
      }
    }

    // On entering Step 5, refresh category select and reset type
    if (n === 5) {
      wizardPopulateCategories();
      wizardToggleAdhocCategory();
    }

    // On entering Step 6, render review
    if (n === 6) {
      wizardRenderReview();
    }

    // Scroll body to top
    const body = document.getElementById('wizard-body');
    if (body) body.scrollTop = 0;
  }

  // Update progress bar circles: completed (green, clickable) / active (blue) / future (gray)
  function wizardUpdateProgressBar() {
    for (let i = 1; i <= 6; i++) {
      const circle = document.getElementById('wiz-node-' + i);
      if (!circle) continue;
      circle.classList.remove('active', 'completed');

      // Remove any old click listeners by cloning
      const freshCircle = circle.cloneNode(true);
      circle.parentNode.replaceChild(freshCircle, circle);
      const newCircle = document.getElementById('wiz-node-' + i);

      if (i < wizard.currentStep && i <= wizard.maxReached) {
        newCircle.classList.add('completed');
        const stepNum = i;
        newCircle.addEventListener('click', function () {
          wizardGoToStep(stepNum);
        });
      } else if (i === wizard.currentStep) {
        newCircle.classList.add('active');
      }
    }
  }

  // Populate wizard category selects from the global categories array
  function wizardPopulateCategories() {
    ['wiz-bill-category', 'wiz-adhoc-category'].forEach(id => {
      const sel = document.getElementById(id);
      if (!sel) return;
      const current = sel.value;
      sel.innerHTML = '';
      categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        sel.appendChild(opt);
      });
      if (current) sel.value = current;
    });
  }

  // Show/hide the adhoc category row based on type selection
  function wizardToggleAdhocCategory() {
    const type = document.getElementById('wiz-adhoc-type').value;
    const row = document.getElementById('wiz-adhoc-category-row');
    if (row) row.style.display = type === 'expense' ? 'block' : 'none';
  }

  // Render income summary cards
  function wizardRenderIncomeList() {
    const list = document.getElementById('wiz-income-list');
    list.innerHTML = '';
    const sessionIncome = incomeEntries.slice(wizard.snapshot.incomeLen);
    sessionIncome.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'wizard-summary-card';
      card.innerHTML = `<span class="wizard-summary-card-label">${entry.name}</span>` +
        `<span class="wizard-summary-card-meta">$${entry.amount.toFixed(2)} &bull; ${entry.frequency}</span>`;
      list.appendChild(card);
    });
  }

  // Render debt summary cards
  function wizardRenderDebtList() {
    const list = document.getElementById('wiz-debt-list');
    list.innerHTML = '';
    const sessionDebts = debtEntries.slice(wizard.snapshot.debtsLen);
    sessionDebts.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'wizard-summary-card';
      card.innerHTML = `<span class="wizard-summary-card-label">${entry.name} (${entry.type})</span>` +
        `<span class="wizard-summary-card-meta">$${entry.balance.toFixed(2)} @ ${entry.apr}%</span>`;
      list.appendChild(card);
    });
  }

  // Render bill summary cards
  function wizardRenderBillList() {
    const list = document.getElementById('wiz-bill-list');
    list.innerHTML = '';
    const sessionBills = bills.slice(wizard.snapshot.billsLen);
    sessionBills.forEach(entry => {
      const effectiveAmt = getBillEffectiveAmount(entry);
      const linkedIcon = entry.linkedDebtId ? ' &#128279;' : '';
      const card = document.createElement('div');
      card.className = 'wizard-summary-card';
      card.innerHTML = `<span class="wizard-summary-card-label">${entry.name}${linkedIcon}</span>` +
        `<span class="wizard-summary-card-meta">Day ${entry.date} &bull; $${effectiveAmt.toFixed(2)}</span>`;
      list.appendChild(card);
    });
  }

  // Render adhoc/adjustment summary cards
  function wizardRenderAdhocList() {
    const list = document.getElementById('wiz-adhoc-list');
    list.innerHTML = '';
    const sessionAdhoc = adhocExpenses.slice(wizard.snapshot.adhocLen);
    const sessionAdj = runningBudgetAdjustments.slice(wizard.snapshot.adjustmentsLen);
    sessionAdhoc.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'wizard-summary-card';
      card.innerHTML = `<span class="wizard-summary-card-label">${entry.name} (Expense)</span>` +
        `<span class="wizard-summary-card-meta">${entry.date} &bull; -$${entry.amount.toFixed(2)}</span>`;
      list.appendChild(card);
    });
    sessionAdj.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'wizard-summary-card';
      card.innerHTML = `<span class="wizard-summary-card-label">${entry.event} (Income)</span>` +
        `<span class="wizard-summary-card-meta">${entry.date} &bull; +$${entry.amount.toFixed(2)}</span>`;
      list.appendChild(card);
    });
  }

  // Render Step 6 review stat cards
  function wizardRenderReview() {
    const s = wizard.snapshot;
    const sessionIncome = incomeEntries.slice(s.incomeLen);
    const sessionDebts = debtEntries.slice(s.debtsLen);
    const sessionBills = bills.slice(s.billsLen);
    const sessionAdhoc = adhocExpenses.slice(s.adhocLen);
    const sessionAdj = runningBudgetAdjustments.slice(s.adjustmentsLen);

    // Monthly income estimate
    const freqMult = { 'Weekly': 4.33, 'Bi-weekly': 2.17, 'Monthly': 1, 'One-time': 0 };
    const monthlyIncome = sessionIncome.reduce((sum, e) => sum + (e.amount * (freqMult[e.frequency] || 0)), 0);

    // Monthly expenses total (uses live debt amounts for linked bills)
    const monthlyExpenses = sessionBills.reduce((sum, b) => sum + getBillEffectiveAmount(b), 0);

    // Total debt outstanding
    const totalDebt = sessionDebts.reduce((sum, d) => sum + d.balance, 0);

    const statsEl = document.getElementById('wiz-review-stats');
    statsEl.innerHTML =
      `<div class="wizard-stat-card">` +
      `<div class="wizard-stat-card-label">Account</div>` +
      `<div class="wizard-stat-card-value">${accountName || 'My Account'}</div>` +
      `<div class="wizard-stat-card-sub">Balance: $${accountBalance.toFixed(2)}</div>` +
      `</div>` +
      `<div class="wizard-stat-card">` +
      `<div class="wizard-stat-card-label">Income Sources</div>` +
      `<div class="wizard-stat-card-value">${sessionIncome.length}</div>` +
      `<div class="wizard-stat-card-sub">~$${monthlyIncome.toFixed(2)}/mo</div>` +
      `</div>` +
      `<div class="wizard-stat-card">` +
      `<div class="wizard-stat-card-label">Debt Accounts</div>` +
      `<div class="wizard-stat-card-value">${sessionDebts.length}</div>` +
      `<div class="wizard-stat-card-sub">Total: $${totalDebt.toFixed(2)}</div>` +
      `</div>` +
      `<div class="wizard-stat-card">` +
      `<div class="wizard-stat-card-label">Monthly Bills</div>` +
      `<div class="wizard-stat-card-value">${sessionBills.length}</div>` +
      `<div class="wizard-stat-card-sub">$${monthlyExpenses.toFixed(2)}/mo</div>` +
      `</div>` +
      `<div class="wizard-stat-card">` +
      `<div class="wizard-stat-card-label">One-Off Items</div>` +
      `<div class="wizard-stat-card-value">${sessionAdhoc.length + sessionAdj.length}</div>` +
      `<div class="wizard-stat-card-sub">&nbsp;</div>` +
      `</div>`;
  }

  // Show a brief toast notification
  function wizardShowToast(message) {
    const toast = document.getElementById('wizard-toast');
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2800);
  }

  // ---- Guide Me Button ----
  document.getElementById('guide-me-btn').addEventListener('click', function (e) {
    e.preventDefault();
    wizardOpen();
  });

  // ---- Close Button (X) ----
  document.getElementById('wizard-close-btn').addEventListener('click', function () {
    wizardClose();
  });

  // ---- Step 1: Save setup and advance ----
  document.getElementById('wiz-step1-next').addEventListener('click', function () {
    const dateVal = document.getElementById('wiz-start-date').value;
    const projVal = parseInt(document.getElementById('wiz-projection').value, 10);
    const nameVal = document.getElementById('wiz-account-name').value.trim();
    const balVal = parseMathExpression(document.getElementById('wiz-balance').value);

    if (!dateVal) { alert('Please enter a start date.'); return; }
    if (!nameVal) { alert('Please enter an account name.'); return; }
    if (isNaN(projVal) || projVal < 1 || projVal > 12) { alert('Projection length must be between 1 and 12 months.'); return; }

    startDate = new Date(dateVal + 'T00:00:00');
    projectionLength = projVal;
    accountName = nameVal;
    accountBalance = balVal;
    saveData();
    wizardGoToStep(2);
  });

  // ---- Step 2: Add income entry ----
  document.getElementById('wiz-income-add').addEventListener('click', function () {
    const name = document.getElementById('wiz-income-name').value.trim();
    const amount = parseMathExpression(document.getElementById('wiz-income-amount').value);
    const frequency = document.getElementById('wiz-income-freq').value;
    const incStart = document.getElementById('wiz-income-start').value;

    if (!name) { alert('Please enter an income name.'); return; }
    if (!amount || amount <= 0) { alert('Please enter a valid amount.'); return; }

    incomeEntries.push({ name, amount, frequency, startDate: incStart });
    saveData();

    // Clear entry fields
    document.getElementById('wiz-income-name').value = '';
    document.getElementById('wiz-income-amount').value = '';

    wizardRenderIncomeList();
  });

  document.getElementById('wiz-step2-back').addEventListener('click', function () {
    wizardGoToStep(1);
  });

  document.getElementById('wiz-step2-next').addEventListener('click', function () {
    wizardGoToStep(3);
  });

  // ---- Step 3: Debt type change — show/hide asset value ----
  document.getElementById('wiz-debt-type').addEventListener('change', function () {
    const assetRow = document.getElementById('wiz-debt-asset-row');
    assetRow.style.display = isAssetDebtType(this.value) ? 'block' : 'none';
    if (!isAssetDebtType(this.value)) {
      document.getElementById('wiz-debt-asset').value = '';
    }
  });

  // ---- Step 3: Add debt entry ----
  document.getElementById('wiz-debt-add').addEventListener('click', function () {
    const name = document.getElementById('wiz-debt-name').value.trim();
    const type = document.getElementById('wiz-debt-type').value;
    const balance = parseMathExpression(document.getElementById('wiz-debt-balance').value);
    const apr = parseFloat(document.getElementById('wiz-debt-apr').value) || 0;
    const minPayment = parseMathExpression(document.getElementById('wiz-debt-min').value);
    const actualPayment = parseMathExpression(document.getElementById('wiz-debt-actual').value);
    const termMonths = parseInt(document.getElementById('wiz-debt-term').value, 10) || 0;
    const assetValue = isAssetDebtType(type)
      ? parseMathExpression(document.getElementById('wiz-debt-asset').value)
      : 0;

    if (!name) { alert('Please enter a creditor name.'); return; }
    if (balance <= 0) { alert('Please enter a valid balance.'); return; }

    debtEntries.push({
      id: generateId(),
      name,
      type,
      balance: roundToCents(balance),
      apr,
      minPayment: roundToCents(minPayment),
      actualPayment: roundToCents(actualPayment),
      loanLength: termMonths,
      assetValue: roundToCents(assetValue),
    });
    saveData();

    // Clear fields
    document.getElementById('wiz-debt-name').value = '';
    document.getElementById('wiz-debt-balance').value = '';
    document.getElementById('wiz-debt-apr').value = '';
    document.getElementById('wiz-debt-min').value = '';
    document.getElementById('wiz-debt-actual').value = '';
    document.getElementById('wiz-debt-term').value = '0';
    document.getElementById('wiz-debt-asset').value = '';
    document.getElementById('wiz-debt-type').value = 'Credit Card';
    document.getElementById('wiz-debt-asset-row').style.display = 'none';

    wizardRenderDebtList();
  });

  document.getElementById('wiz-step3-back').addEventListener('click', function () {
    wizardGoToStep(2);
  });

  document.getElementById('wiz-step3-next').addEventListener('click', function () {
    wizardGoToStep(4);
  });

  document.getElementById('wiz-debt-skip').addEventListener('click', function (e) {
    e.preventDefault();
    wizardGoToStep(4);
  });

  // ---- Step 4: Bill-debt link toggle ----
  document.getElementById('wiz-bill-link-toggle').addEventListener('change', function () {
    const wrapper = document.getElementById('wiz-bill-debt-wrapper');
    const amountInput = document.getElementById('wiz-bill-amount');
    if (this.checked) {
      wrapper.style.display = 'block';
      amountInput.disabled = true;
      populateBillDebtDropdown(document.getElementById('wiz-bill-linked-debt'));
    } else {
      wrapper.style.display = 'none';
      amountInput.disabled = false;
      document.getElementById('wiz-bill-linked-debt').value = '';
      document.getElementById('wiz-bill-debt-preview').textContent = '';
    }
  });

  document.getElementById('wiz-bill-linked-debt').addEventListener('change', function () {
    const debt = debtEntries.find(d => d.id === this.value);
    document.getElementById('wiz-bill-debt-preview').textContent =
      debt ? `Will use $${debt.actualPayment.toFixed(2)} from debt tracker` : '';
  });

  // ---- Step 4: Add category (inline) ----
  document.getElementById('wiz-bill-add-category').addEventListener('click', function () {
    const newCat = prompt('Enter new category name:');
    if (newCat && newCat.trim()) {
      const trimmed = newCat.trim();
      if (!categories.includes(trimmed)) {
        categories.push(trimmed);
        saveData();
        wizardPopulateCategories();
        populateCategories(); // keep main app in sync
        document.getElementById('wiz-bill-category').value = trimmed;
      } else {
        alert('This category already exists.');
      }
    }
  });

  // ---- Step 4: Add bill entry ----
  document.getElementById('wiz-bill-add').addEventListener('click', function () {
    const name = document.getElementById('wiz-bill-name').value.trim();
    const day = parseInt(document.getElementById('wiz-bill-day').value, 10);
    const linkedDebtId = document.getElementById('wiz-bill-link-toggle').checked
      ? (document.getElementById('wiz-bill-linked-debt').value || null)
      : null;
    const amount = linkedDebtId
      ? roundToCents((debtEntries.find(d => d.id === linkedDebtId) || {}).actualPayment || 0)
      : parseMathExpression(document.getElementById('wiz-bill-amount').value);
    const category = document.getElementById('wiz-bill-category').value;

    if (!name) { alert('Please enter a bill name.'); return; }
    if (isNaN(day) || day < 1 || day > 31) { alert('Please enter a valid day of the month (1–31).'); return; }
    if (!linkedDebtId && amount <= 0) { alert('Please enter a valid amount.'); return; }

    bills.push({ name, date: day, amount: roundToCents(amount), category, linkedDebtId });
    saveData();

    // Clear entry fields
    document.getElementById('wiz-bill-name').value = '';
    document.getElementById('wiz-bill-day').value = '';
    document.getElementById('wiz-bill-amount').value = '';
    document.getElementById('wiz-bill-amount').disabled = false;
    document.getElementById('wiz-bill-link-toggle').checked = false;
    document.getElementById('wiz-bill-debt-wrapper').style.display = 'none';
    document.getElementById('wiz-bill-linked-debt').value = '';
    document.getElementById('wiz-bill-debt-preview').textContent = '';

    wizardRenderBillList();
  });

  document.getElementById('wiz-step4-back').addEventListener('click', function () {
    wizardGoToStep(3);
  });

  document.getElementById('wiz-step4-next').addEventListener('click', function () {
    wizardGoToStep(5);
  });

  // ---- Step 5: Type change — show/hide category ----
  document.getElementById('wiz-adhoc-type').addEventListener('change', wizardToggleAdhocCategory);

  // ---- Step 5: Add one-off item ----
  document.getElementById('wiz-adhoc-add').addEventListener('click', function () {
    const name = document.getElementById('wiz-adhoc-name').value.trim();
    const date = document.getElementById('wiz-adhoc-date').value;
    const amount = parseMathExpression(document.getElementById('wiz-adhoc-amount').value);
    const type = document.getElementById('wiz-adhoc-type').value;
    const category = document.getElementById('wiz-adhoc-category').value;

    if (!name) { alert('Please enter a name.'); return; }
    if (!date) { alert('Please enter a date.'); return; }
    if (!amount || amount <= 0) { alert('Please enter a valid amount.'); return; }

    if (type === 'income') {
      runningBudgetAdjustments.push({ date, amount: roundToCents(amount), event: name });
    } else {
      adhocExpenses.push({ name, date, amount: roundToCents(amount), category });
    }
    saveData();

    // Clear entry fields
    document.getElementById('wiz-adhoc-name').value = '';
    document.getElementById('wiz-adhoc-amount').value = '';

    wizardRenderAdhocList();
  });

  document.getElementById('wiz-step5-back').addEventListener('click', function () {
    wizardGoToStep(4);
  });

  document.getElementById('wiz-step5-next').addEventListener('click', function () {
    wizardGoToStep(6);
  });

  document.getElementById('wiz-adhoc-skip').addEventListener('click', function (e) {
    e.preventDefault();
    wizardGoToStep(6);
  });

  // ---- Step 6: Back button ----
  document.getElementById('wiz-step6-back').addEventListener('click', function () {
    wizardGoToStep(5);
  });

  // ---- Step 6: Start Over ----
  document.getElementById('wiz-start-over').addEventListener('click', function () {
    if (!confirm('This will clear everything you entered in the wizard. Are you sure?')) return;
    const s = wizard.snapshot;

    // Truncate arrays to pre-wizard state
    bills.length = s.billsLen;
    incomeEntries.length = s.incomeLen;
    debtEntries.length = s.debtsLen;
    adhocExpenses.length = s.adhocLen;
    runningBudgetAdjustments.length = s.adjustmentsLen;

    // Restore scalar values
    accountBalance = s.accountBalance;
    accountName = s.accountName;
    startDate = s.startDate;
    projectionLength = s.projectionLength;
    saveData();

    // Reset state and restart from Step 1
    wizard.maxReached = 1;

    // Clear summary lists
    ['wiz-income-list', 'wiz-debt-list', 'wiz-bill-list', 'wiz-adhoc-list'].forEach(id => {
      document.getElementById(id).innerHTML = '';
    });

    // Re-pre-populate Step 1
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('wiz-start-date').value = startDate
      ? startDate.toISOString().split('T')[0]
      : today;
    document.getElementById('wiz-projection').value = projectionLength || 3;
    document.getElementById('wiz-account-name').value = accountName || '';
    document.getElementById('wiz-balance').value = accountBalance ? accountBalance.toFixed(2) : '';

    // Re-capture snapshot after reset
    wizard.snapshot = {
      billsLen: bills.length,
      incomeLen: incomeEntries.length,
      debtsLen: debtEntries.length,
      adhocLen: adhocExpenses.length,
      adjustmentsLen: runningBudgetAdjustments.length,
      accountBalance: accountBalance,
      accountName: accountName,
      startDate: startDate ? new Date(startDate) : null,
      projectionLength: projectionLength,
    };

    wizardGoToStep(1);
  });

  // ---- Step 6: Complete ----
  document.getElementById('wiz-complete').addEventListener('click', function () {
    document.getElementById('guide-me-modal').style.display = 'none';
    updateDisplay();
    wizardShowToast('Budget set up successfully! Welcome aboard. \u2728');
  });

  // ---- Step 1: Start Fresh (erase ALL app data, then restart wizard) ----
  document.getElementById('wiz-start-fresh').addEventListener('click', function (e) {
    e.preventDefault();
    if (!confirm(
      'This will erase ALL existing budget data (bills, income, debts, expenses, ' +
      'adjustments, and account balance) so you can start completely from scratch. ' +
      'This cannot be undone. Are you sure?'
    )) return;

    // Reset all globals — identical logic to reset-btn handler
    localStorage.clear();
    bills = [];
    incomeEntries = [];
    adhocExpenses = [];
    accountBalance = 0;
    accountName = '';
    startDate = null;
    projectionLength = 1;
    categories = [
      'Charity/Donations', 'Childcare', 'Debt Payments', 'Dining Out/Takeout',
      'Education', 'Entertainment', 'Healthcare', 'Hobbies/Recreation', 'Housing',
      'Insurance', 'Personal Care', 'Pets', 'Savings/Investments',
      'Subscriptions/Memberships', 'Transportation', 'Travel', 'Utilities',
      'Misc/Other', 'Credit Card Payment', 'Student Loans'
    ];
    runningBudgetAdjustments = [];
    debtEntries = [];
    saveData();

    // Re-initialize wizard from the now-empty state
    wizard.snapshot = {
      billsLen: 0, incomeLen: 0, debtsLen: 0, adhocLen: 0, adjustmentsLen: 0,
      accountBalance: 0, accountName: '', startDate: null, projectionLength: 1,
    };
    wizard.maxReached = 1;

    // Clear all wizard summary lists
    ['wiz-income-list', 'wiz-debt-list', 'wiz-bill-list', 'wiz-adhoc-list'].forEach(function (id) {
      document.getElementById(id).innerHTML = '';
    });

    // Reset Step 1 fields to blank defaults
    const freshToday = new Date().toISOString().split('T')[0];
    document.getElementById('wiz-start-date').value = freshToday;
    document.getElementById('wiz-projection').value = 3;
    document.getElementById('wiz-account-name').value = '';
    document.getElementById('wiz-balance').value = '';

    wizardGoToStep(1);
    wizardShowToast('All data cleared. Starting fresh! \u2728');
  });
});
