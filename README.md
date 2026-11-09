# SpendSmart AI — Student Money Manager

**Tagline:** Your Money. Your Goals. Your Control.

SpendSmart AI is a beginner-friendly student budgeting prototype created for ARATHON 26. It helps students record expenses, set a monthly budget, create savings goals and understand spending patterns.

## Run the project
1. Download and extract `SpendSmart_AI_Project.zip`.
2. Open the extracted `SpendSmart_AI` folder in Visual Studio Code.
3. Open `index.html` in a browser. Easiest option: install the free VS Code extension **Live Server**, right-click `index.html`, and choose **Open with Live Server**. You can also double-click `index.html`.
4. Internet is needed for the Google font and Chart.js chart library. The main tracker still works without the chart library.

## Features
- Dashboard with monthly budget, spent amount, remaining amount and savings total.
- Add, view, search, filter and delete expenses.
- Professional monthly expense statement with month selector, total spent, transaction count, average expense and CSV export.
- Expense categories: Food, Travel, Education, Shopping, Entertainment and Other.
- Set and update a monthly budget with progress and warning messages.
- Create savings goals and add demo contributions.
- Category chart and automatic spending observations.
- Rule-based Smart Money Buddy using the user's locally stored data.
- Daily money tips.
- Responsive layout for laptop and mobile.
- Browser LocalStorage persistence (data stays in the same browser on the same device).

## Important technical honesty
The “AI assistant” in this version is a **rule-based smart assistant**, not a live generative-AI model/API. It responds to supported money questions using the budget and expense data saved in the browser. This makes the prototype free, safer to demo and avoids exposing an API key in frontend code. The project does not connect to a bank account or process real payments.

## Technology
- HTML5
- CSS3
- Vanilla JavaScript
- Browser LocalStorage
- Chart.js (loaded from CDN for the charts)

## Demo flow (about 3 minutes)
1. Open Dashboard and explain the four summary cards.
2. Add an expense: Lunch, ₹120, Food, today's date.
3. Add another: Bus pass, ₹300, Travel.
4. Show the Expenses page. Select the month, explain the monthly summary cards, and show the Date / Description / Category / Amount table. Try search and category filters, then export the month as CSV.
5. Open Budget planner and change the monthly budget to ₹4,000.
6. Open Savings goals; create “New headphones”, target ₹2,000, already saved ₹300. Click “Add ₹100”.
7. Open Insights and show the category chart and observations.
8. Open Smart assistant and ask “How much is left?” and “Where do I spend most?”
9. Explain that data is stored locally in the browser and can be reset by clearing this site's LocalStorage.

## Limitations / future scope
- No login or cloud sync; data is stored in one browser.
- No bank integration, UPI connection or real transactions.
- No live generative AI API in this prototype.
- Future version: secure backend, optional sign-in/cloud backup, multilingual assistant, recurring expense reminders, receipt scanning and financial-literacy learning modules.

## Reset demo data
Open browser Developer Tools → Application/Storage → Local Storage → select the project origin → delete key `spendsmart_ai_v1`. Or clear the site's stored data from browser settings.
