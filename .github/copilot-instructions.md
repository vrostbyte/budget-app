# Budget App - Copilot Instructions

## Project Overview
Vanilla JS budget tracker. HTML5, CSS3, ES6. Chart.js for visuals, localStorage for persistence. No frameworks.

## Files
- `index.html` - Structure and modals
- `styles.css` - All styling  
- `app.js` - All logic (~1000 lines)
- `CHANGELOG.md` - Version history

## REQUIRED WORKFLOW

### Step 1: Clarify
When I describe a feature, ASK questions first:
- What triggers it? (button, automatic, on load?)
- Where in the UI?
- Should it persist after refresh?
- Edge cases?

### Step 2: Recommend
Before writing code, explain:
- Which files change and why
- What the changes accomplish
- Efficiency improvements to make while implementing
- Potential issues or side effects
- What to add to CHANGELOG.md

### Step 3: Deliver Complete Files
**CRITICAL: Always return the ENTIRE file, not snippets.**
I need to copy-paste complete files. Never say "add this at line 47."

### Step 4: Testing Steps
After providing code, tell me:
- How to verify it works
- What to check in browser console (F12)
- Edge cases to test

## BEFORE I MAKE ANY CHANGES
Remind me to:
1. Export current data as backup
2. Git commit current working state
3. Then apply changes

## Data Schema
```json
{
  "bills": [{ "name": "", "date": 1-31, "amount": 0.00, "category": "" }],
  "incomeEntries": [{ "name": "", "amount": 0.00, "frequency": "Weekly|Bi-weekly|Monthly|One-time", "startDate": "YYYY-MM-DD" }],
  "adhocExpenses": [{ "name": "", "date": "YYYY-MM-DD", "amount": 0.00, "category": "" }],
  "runningBudgetAdjustments": [{ "date": "YYYY-MM-DD", "amount": 0.00, "event": "" }],
  "accountBalance": 0.00,
  "accountName": "",
  "startDate": "ISO-8601",
  "projectionLength": 1-12,
  "categories": []
}
```

## Code Patterns
- `saveData()` after data changes
- `updateDisplay()` to refresh UI
- `parseDateInput()` for date strings
- `parseMathExpression()` for amounts (supports math like "100+50")
- `roundToCents()` for all money calculations (fixes floating point errors)

## Style Rules
- `.collapsible-card` for sections
- `.table-responsive` for tables
- `.icon-btn` for action buttons
- Balance colors: green >$100, orange $0-100, red negative

## Adding New Data Fields
When adding fields to the data model:
1. Add to the relevant array/object
2. Update `saveData()` to include it
3. Update `loadData()` with fallback default
4. Update export handler
5. Update import handler with fallback

## Do NOT
- Use frameworks
- Give partial snippets
- Break mobile responsiveness
- Remove the instructions modal
- Change localStorage keys without migration logic
