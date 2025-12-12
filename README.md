# Budget App

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-web-lightgrey.svg)

A powerful, privacy-focused budget projection tool that runs entirely in your browser. No accounts, no servers, no subscriptions—just you and your finances.

## Screenshots

<p align="center">
  <img src="https://i.ibb.co/m9GvBpJ/Screenshot-2024-12-03-at-8-26-22-PM.png" alt="Dashboard View" width="280"/>
  <img src="https://i.ibb.co/Khvx09N/Screenshot-2024-12-03-at-8-26-36-PM.png" alt="Bills Management" width="280"/>
  <img src="https://i.ibb.co/bmKhVyh/Screenshot-2024-12-03-at-8-26-46-PM.png" alt="Running Budget" width="280"/>
</p>

---

## Table of Contents

- [Why Budget App?](#why-budget-app)
- [Features](#features)
- [Quick Start](#quick-start)
- [User Guide](#user-guide)
- [Data Management](#data-management)
- [Technical Details](#technical-details)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [FAQ](#faq)
- [License](#license)
- [Contact](#contact)

---

## Why Budget App?

Most budgeting apps want your data on their servers, charge monthly fees, or require account creation. Budget App is different:

| Feature | Budget App | Typical Apps |
|---------|-----------|--------------|
| **Cost** | Free forever | $5-15/month |
| **Privacy** | 100% local storage | Cloud-based |
| **Account Required** | No | Yes |
| **Internet Required** | No (after download) | Yes |
| **Data Ownership** | You own it all | They own it |
| **Ads** | None | Often yes |

Your financial data never leaves your device. Export it, back it up, delete it—you're in complete control.

---

## Features

### Core Budgeting
- **Budget Projections** — See your finances up to 12 months ahead
- **Running Balance** — Day-by-day breakdown of every transaction
- **Lowest Balance Alerts** — Identify cash flow danger zones by month
- **Multi-frequency Income** — Weekly, bi-weekly, monthly, or one-time income sources

### Expense Management
- **Recurring Bills** — Set it once, tracked every month automatically
- **Ad-hoc Expenses** — One-time purchases on specific dates
- **Custom Categories** — Create categories that match your life
- **Inline Editing** — Click to edit any entry directly

### Smart Features
- **Math Expressions** — Enter `1500+250` or `2000-150` in any amount field
- **Running Budget Adjustments** — Override calculated values for real-world scenarios
- **End-of-Month Handling** — Bills set for the 31st auto-adjust for shorter months

### Visualization
- **Expenses Breakdown Chart** — See where your money goes
- **Category Analysis** — Spending patterns by category
- **Color-Coded Balances** — Green (safe), orange (caution), red (danger)

### Data Control
- **JSON Export** — Full backup with one click
- **JSON Import** — Restore or transfer data instantly
- **Sample Data** — Try the app without entering real data
- **Complete Reset** — Start fresh anytime

### User Experience
- **Mobile Responsive** — Works on phone, tablet, and desktop
- **Collapsible Sections** — Minimize clutter, focus on what matters
- **Print Friendly** — Clean printouts for offline reference
- **No Loading Screens** — Instant, snappy performance

---

## Quick Start

### Option 1: Download and Run
```bash
git clone https://github.com/legendarycue/budget-app.git
cd budget-app
open index.html
```

### Option 2: Direct Download
1. Download the [latest release](https://github.com/legendarycue/budget-app/releases)
2. Extract the ZIP file
3. Double-click `index.html`

That's it. No installation, no dependencies, no build process.

---

## User Guide

### 1. Set Your Projection Window

Start by defining when to begin tracking and how far ahead to project:

1. Open **Start Date and Projection Length**
2. Select your start date (today or a future date)
3. Choose projection length (1-12 months)
4. Click **Set Start Date**

### 2. Enter Your Account Balance

Set your starting point:

1. Open **Checking Account Balance**
2. Optionally name your account (e.g., "Bills Checking")
3. Enter your current balance
4. Click **Update Checking**

> **Tip:** You can use math expressions! Enter `1500+237.50` and it calculates automatically.

### 3. Add Recurring Bills

These are expenses that repeat every month:

1. Open **Add Bill/Expense**
2. Enter the bill name (e.g., "Mortgage")
3. Set the day of month it's due (1-31)
4. Enter the amount
5. Select or create a category
6. Click **Add Bill**

### 4. Add Income Sources

Track money coming in:

1. Open **Add Income**
2. Enter income name (e.g., "Paycheck")
3. Enter amount per payment
4. Select frequency:
   - **Weekly** — Every 7 days
   - **Bi-weekly** — Every 14 days (most common for paychecks)
   - **Monthly** — Same date each month
   - **One-time** — Single occurrence
5. Set the start date (your next payday)
6. Click **Add Income**

### 5. Add One-Time Expenses

For non-recurring purchases:

1. Open **Add Adhoc Expense**
2. Enter expense name
3. Select the specific date
4. Enter amount and category
5. Click **Add Adhoc Expense**

### 6. Review Your Projection

The right side of the screen shows:

- **Expenses Breakdown** — Total spending per expense over the projection
- **Expenses by Category** — Where your money goes by type
- **Lowest Balances by Month** — Your tightest cash flow days
- **Running Budget** — Day-by-day transaction log with running balance

### 7. Make Adjustments

Real life doesn't match predictions. Use the **Edit** button on any Running Budget row to:

- Override the calculated amount for that day
- Add notes explaining the adjustment
- Handle deferrals, partial payments, or windfalls

---

## Data Management

### Backing Up Your Data

**Do this regularly!** Your data lives only in your browser.

1. Click **Menu → Export Data (JSON)**
2. Save the file somewhere safe (cloud storage recommended)
3. File is named `budget_data_YYYYMMDD_HHMMSS.json`

### Restoring Data

1. Click **Menu → Import Data**
2. Select your backup JSON file
3. Data loads immediately

### Transferring Between Devices

1. Export from Device A
2. Transfer the JSON file (email, cloud, USB)
3. Import on Device B

### Starting Fresh

1. Click **Menu → Reset Data**
2. Confirm the reset
3. All data is permanently deleted

> **Warning:** Reset cannot be undone. Export first if you might want the data later.

---

## Technical Details

### Built With

| Technology | Purpose |
|------------|---------|
| HTML5 | Structure |
| CSS3 | Styling & Responsiveness |
| JavaScript (ES6) | Application Logic |
| Chart.js | Data Visualization |
| localStorage | Data Persistence |
| Font Awesome | Icons |

### Browser Support

| Browser | Supported |
|---------|-----------|
| Chrome | ✅ |
| Firefox | ✅ |
| Safari | ✅ |
| Edge | ✅ |
| Opera | ✅ |
| IE11 | ❌ |

### Data Storage

- All data stored in browser `localStorage`
- Storage limit: ~5-10MB (browser dependent)
- Data persists until cleared or browser data is deleted
- No data sent to external servers

### File Structure

```
budget-app/
├── index.html          # Main application page
├── app.js              # Application logic (~1000 lines)
├── styles.css          # All styling
├── favicon.ico         # Browser tab icon
├── README.md           # This file
├── CHANGELOG.md        # Version historyosh Griffith*
├── LICENSE.md          # MIT License
└── .github/
    └── copilot-instructions.md  # AI coding assistant config
```

---

## Contributing

Contributions are welcome! Here's how:

### Reporting Bugs

1. Check [existing issues](https://github.com/legendarycue/budget-app/issues) first
2. Create a new issue with:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and OS information

### Suggesting Features

1. Open an issue with the `enhancement` label
2. Describe the feature and its benefit
3. Include mockups or examples if possible

### Submitting Code

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages: `git commit -m "Add: description of change"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request

### Code Standards

- No frameworks—keep it vanilla JS
- Mobile-first responsive design
- Clear comments for complex logic
- Update CHANGELOG.md for any changes
- Test on Chrome, Firefox, and Safari minimum

---

## Roadmap

### Under Consideration

- [ ] Multiple checking accounts
- [ ] Savings account tracking with goals
- [ ] CSV export for spreadsheet users
- [ ] Dark mode
- [ ] Recurring expense templates
- [ ] Budget vs actual comparison
- [ ] Bill reminder notifications (with permission)

### Not Planned

- ❌ User accounts or cloud sync (privacy-first philosophy)
- ❌ Bank connections or imports (security concern)
- ❌ Ads or premium tiers (free forever)

Have a feature idea? [Open an issue](https://github.com/legendarycue/budget-app/issues)!

---

## FAQ

### General

**Q: Is my data really private?**  
A: Yes. Budget App runs entirely in your browser. No servers, no analytics, no tracking. Your data literally cannot leave your device unless you export it yourself.

**Q: What happens if I clear my browser data?**  
A: Your budget data will be deleted. Always export backups before clearing browser data.

**Q: Can I use this offline?**  
A: Yes! After the initial page load, everything works offline. The only external resources are Chart.js and Font Awesome (icons), which browsers typically cache.

### Data

**Q: How do I move my data to a new computer?**  
A: Export your data as JSON, transfer the file to your new computer, then import it.

**Q: Why won't my file import?**  
A: Ensure it's a valid JSON file exported from Budget App. The filename doesn't matter—only the contents.

**Q: Is there a size limit?**  
A: Browser localStorage is typically 5-10MB. That's enough for years of budget data.

### Features

**Q: Can I track multiple bank accounts?**  
A: Currently, Budget App tracks one checking account. Multiple accounts are on the roadmap.

**Q: Why don't my bills appear on the right dates?**  
A: Check that your projection start date is before the bill dates. Bills only show within your projection window.

**Q: What if my bill is due on the 31st but the month only has 30 days?**  
A: Budget App automatically adjusts—the bill will appear on the last day of that month.

### Troubleshooting

**Q: The app isn't saving my changes!**  
A: Check if you're in a private/incognito window. localStorage is often disabled in private browsing.

**Q: Charts aren't displaying!**  
A: Ensure JavaScript is enabled and try refreshing. If using an ad blocker, it may be blocking Chart.js.

**Q: Something broke after an update!**  
A: Try importing a recent backup. If issues persist, use Reset Data and re-import.

---

## License

This project is licensed under the MIT License. See [LICENSE.md](LICENSE.md) for details.

```
MIT License - Copyright (c) 2024 Josh Griffith "LegendaryCue"

You are free to use, modify, and distribute this software.
```

---

## Contact

**Vrostbyte** (Vrostbyte)

- **Email:** vrostbyte@proton.me
- **GitHub:** [@vrostbyte](https://github.com/vrostbyte)

---

## Acknowledgments

- [Chart.js](https://www.chartjs.org/) — Beautiful, flexible charting
- [Font Awesome](https://fontawesome.com/) — Quality iconography
- Everyone who's provided feedback and bug reports

---

<p align="center">
  <strong>Budget App</strong> — Take control of your finances, privately.<br>
  Made with ☕ in Phoenix, AZ
</p>
