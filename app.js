// SpendSmart AI - Student Money Manager
// This is a browser-only prototype. Data is saved in this browser using localStorage.

"use strict";

const STORAGE_KEY = "spendsmart_ai_v1";
const DEFAULT_DATA = { budget: 5000, expenses: [], goals: [] };

const $ = (id) => document.getElementById(id);
const today = new Date();
const money = (value) =>
  "₹" + Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  });

let data = loadData();
let categoryChart = null;
let insightChart = null;
let selectedExpenseMonth = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}`;

const tips = [
  "Track small purchases. They can add up faster than you think.",
  "Wait 24 hours before buying something you do not really need.",
  "Set aside a small amount for savings as soon as you receive money.",
  "Compare prices before making a purchase.",
  "Plan your travel and food expenses for the week.",
  "Review subscriptions and recurring payments regularly.",
  "A budget is a plan, not a punishment. Adjust it when your needs change."
];

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      ...DEFAULT_DATA,
      ...saved,
      expenses: Array.isArray(saved.expenses) ? saved.expenses : [],
      goals: Array.isArray(saved.goals) ? saved.goals : []
    };
  } catch (error) {
    return {
      ...DEFAULT_DATA,
      expenses: [],
      goals: []
    };
  }
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    showToast("Could not save data in this browser.");
  }
  renderAll();
}

function showToast(message) {
  const toast = $("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2300);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? dateString
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
}

function categoryEmoji(category) {
  const icons = {
    Food: "🍱",
    Travel: "🚌",
    Education: "📚",
    Shopping: "🛍️",
    Entertainment: "🎬",
    Other: "💳"
  };
  return icons[category] || "💳";
}

function monthKey(dateString) {
  return String(dateString || "").slice(0, 7);
}

function monthLabel(key) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric"
  });
}

function currentMonthExpenses() {
  const currentKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;
  return data.expenses.filter((expense) => monthKey(expense.date) === currentKey);
}

function totalSpent() {
  return currentMonthExpenses().reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );
}

function totalSaved() {
  return data.goals.reduce(
    (sum, goal) => sum + Number(goal.current || 0),
    0
  );
}

function showPage(page) {
  document.querySelectorAll(".page").forEach((section) => {
    section.classList.toggle("active", section.id === page);
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === page);
  });

  const pageNames = {
    dashboard: "Dashboard",
    expenses: "Expenses",
    budget: "Budget planner",
    goals: "Savings goals",
    insights: "Insights",
    assistant: "Smart assistant"
  };

  if ($("pageTitle")) $("pageTitle").textContent = pageNames[page] || "Dashboard";
  if (page && location.hash !== `#${page}`) {
    history.replaceState(null, "", `#${page}`);
  }
  if (page === "insights") renderCharts();
}

function openExpenseDialog() {
  const dateInput = $("expenseDate");
  const dialog = $("expenseDialog");
  if (!dialog || typeof dialog.showModal !== "function") {
    showToast("Your browser does not support the expense form.");
    return;
  }

  // Use the local calendar date rather than UTC.
  const localDate = new Date();
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");

  if (dateInput) dateInput.value = `${year}-${month}-${day}`;
  dialog.showModal();
  if ($("expenseName")) $("expenseName").focus();
}

function bindEvents() {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showPage(link.dataset.page);
    });
  });

  document.querySelectorAll("[data-goto]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showPage(link.dataset.goto);
    });
  });

  if ($("quickAddBtn")) $("quickAddBtn").addEventListener("click", openExpenseDialog);
  if ($("expensePageAdd")) $("expensePageAdd").addEventListener("click", openExpenseDialog);

  if ($("closeDialog")) {
    $("closeDialog").addEventListener("click", () => $("expenseDialog").close());
  }

  if ($("expenseForm")) {
    $("expenseForm").addEventListener("submit", (event) => {
      event.preventDefault();

      const name = $("expenseName").value.trim();
      const amount = Number($("expenseAmount").value);
      const category = $("expenseCategory").value;
      const date = $("expenseDate").value;

      if (!name || !date || !Number.isFinite(amount) || amount <= 0) {
        showToast("Please enter a description, valid amount and date.");
        return;
      }

      data.expenses.unshift({
        id: Date.now(),
        name,
        amount,
        category,
        date
      });

      saveData();
      $("expenseForm").reset();
      $("expenseDialog").close();
      showToast("Expense saved successfully!");
    });
  }

  if ($("budgetForm")) {
    $("budgetForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const budget = Number($("budgetInput").value);

      if (!Number.isFinite(budget) || budget <= 0) {
        showToast("Budget must be greater than zero.");
        return;
      }

      data.budget = budget;
      saveData();
      showToast("Monthly budget updated!");
    });
  }

  if ($("goalForm")) {
    $("goalForm").addEventListener("submit", (event) => {
      event.preventDefault();

      const name = $("goalName").value.trim();
      const target = Number($("goalTarget").value);
      const current = Number($("goalCurrent").value || 0);

      if (!name || !Number.isFinite(target) || target <= 0 ||
          !Number.isFinite(current) || current < 0 || current > target) {
        showToast("Please check your savings goal details.");
        return;
      }

      data.goals.push({
        id: Date.now(),
        name,
        target,
        current
      });

      saveData();
      $("goalForm").reset();
      if ($("goalCurrent")) $("goalCurrent").value = 0;
      showToast("Savings goal created!");
    });
  }

  if ($("expenseSearch")) {
    $("expenseSearch").addEventListener("input", renderExpenses);
  }
  if ($("categoryFilter")) {
    $("categoryFilter").addEventListener("change", renderExpenses);
  }
  if ($("monthFilter")) {
    $("monthFilter").addEventListener("change", (event) => {
      selectedExpenseMonth = event.target.value;
      renderExpenses();
    });
  }

  if ($("exportExpenses")) {
    $("exportExpenses").addEventListener("click", exportMonthlyExpenses);
  }

  if ($("newTipBtn")) {
    $("newTipBtn").addEventListener("click", () => {
      const randomIndex = Math.floor(Math.random() * tips.length);
      $("dailyTip").textContent = tips[randomIndex];
    });
  }

  if ($("chatForm")) {
    $("chatForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const question = $("chatInput").value.trim();
      if (!question) return;

      addChatMessage(question, "user");
      addChatMessage(getAssistantReply(question), "bot");
      $("chatInput").value = "";
    });
  }

  document.querySelectorAll(".suggestion").forEach((button) => {
    button.addEventListener("click", () => {
      const question = button.textContent.trim();
      addChatMessage(question, "user");
      addChatMessage(getAssistantReply(question), "bot");
    });
  });
}

function renderAll() {
  renderStats();
  renderExpenses();
  renderGoals();
  renderBudget();
  renderAssistantStats();
  renderCharts();
}

function renderStats() {
  const spent = totalSpent();
  const remaining = data.budget - spent;
  const percentage = data.budget > 0 ? (spent / data.budget) * 100 : 0;

  if ($("dashBudget")) $("dashBudget").textContent = money(data.budget);
  if ($("dashSpent")) $("dashSpent").textContent = money(spent);
  if ($("dashRemaining")) $("dashRemaining").textContent = money(remaining);
  if ($("dashSaved")) $("dashSaved").textContent = money(totalSaved());
  if ($("spentSub")) {
    $("spentSub").textContent = `${currentMonthExpenses().length} expense entries this month`;
  }

  if ($("budgetProgress")) {
    $("budgetProgress").style.width = `${Math.min(percentage, 100)}%`;
  }
  if ($("progressPercent")) {
    $("progressPercent").textContent = `${Math.round(percentage)}% used`;
  }
  if ($("progressAmount")) {
    $("progressAmount").textContent = `${money(spent)} of ${money(data.budget)}`;
  }

  if ($("budgetMessage")) {
    if (percentage > 100) {
      $("budgetMessage").textContent =
        "You have crossed your monthly budget. Pause non-essential spending and review your expenses.";
    } else if (percentage >= 80) {
      $("budgetMessage").textContent =
        "You have used most of your budget. Be careful with extra purchases.";
    } else if (percentage >= 50) {
      $("budgetMessage").textContent =
        "You are making progress. Keep checking your spending before buying.";
    } else {
      $("budgetMessage").textContent =
        "You are within your budget. Keep recording expenses to stay aware.";
    }
  }

  if ($("dashRemaining")) {
    $("dashRemaining").style.color = remaining < 0 ? "#d76a6a" : "";
  }

  if ($("dailyTip")) {
    $("dailyTip").textContent = tips[today.getDate() % tips.length];
  }
}

function renderMonthOptions() {
  const select = $("monthFilter");
  if (!select) return;

  const keys = [
    ...new Set([
      selectedExpenseMonth,
      ...data.expenses.map((expense) => monthKey(expense.date))
    ])
  ].filter(Boolean).sort().reverse();

  if (!keys.includes(selectedExpenseMonth)) keys.unshift(selectedExpenseMonth);

  select.innerHTML = keys
    .map((key) => `<option value="${key}">${monthLabel(key)}</option>`)
    .join("");
  select.value = selectedExpenseMonth;
}

function renderExpenses() {
  const allExpenses = data.expenses;

  if ($("recentExpenses")) {
    $("recentExpenses").innerHTML = allExpenses
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
      .slice(0, 4)
      .map((expense) => `
        <div class="expense-row">
          <div class="expense-emoji">${categoryEmoji(expense.category)}</div>
          <div class="expense-detail">
            <b>${escapeHTML(expense.name)}</b>
            <small>${escapeHTML(expense.category)} · ${formatDate(expense.date)}</small>
          </div>
          <span class="expense-value">-${money(expense.amount)}</span>
        </div>
      `)
      .join("") || '<div class="empty-state">No expenses yet. Add one to get started.</div>';
  }

  renderMonthOptions();

  const monthly = allExpenses.filter(
    (expense) => monthKey(expense.date) === selectedExpenseMonth
  );
  const monthlyTotal = monthly.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  if ($("monthTotal")) $("monthTotal").textContent = money(monthlyTotal);
  if ($("monthCount")) $("monthCount").textContent = monthly.length;
  if ($("monthAverage")) {
    $("monthAverage").textContent = money(
      monthly.length ? monthlyTotal / monthly.length : 0
    );
  }

  const searchText = $("expenseSearch")
    ? $("expenseSearch").value.toLowerCase()
    : "";
  const selectedCategory = $("categoryFilter")
    ? $("categoryFilter").value
    : "All";

  const filtered = monthly
    .filter((expense) => {
      const matchesSearch =
        expense.name.toLowerCase().includes(searchText) ||
        expense.category.toLowerCase().includes(searchText);
      const matchesCategory =
        selectedCategory === "All" || expense.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

  if ($("expenseTable")) {
    $("expenseTable").innerHTML = filtered
      .map((expense) => `
        <tr>
          <td class="date-cell">${formatDate(expense.date)}</td>
          <td><b>${escapeHTML(expense.name)}</b></td>
          <td><span class="category-chip">${escapeHTML(expense.category)}</span></td>
          <td class="amount right-align">${money(expense.amount)}</td>
          <td><button class="delete-btn" data-delete="${Number(expense.id)}" aria-label="Delete expense">Delete</button></td>
        </tr>
      `)
      .join("") ||
      '<tr><td colspan="5" class="empty-state">No expenses for this month. Add an expense to see it here.</td></tr>';
  }

  document.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!window.confirm("Delete this expense?")) return;
      const id = Number(button.dataset.delete);
      data.expenses = data.expenses.filter((expense) => Number(expense.id) !== id);
      saveData();
      showToast("Expense deleted.");
    });
  });
}

function exportMonthlyExpenses() {
  const rows = data.expenses
    .filter((expense) => monthKey(expense.date) === selectedExpenseMonth)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!rows.length) {
    showToast("There are no expenses to export for this month.");
    return;
  }

  const csvRows = [
    ["Date", "Description", "Category", "Amount (INR)"],
    ...rows.map((expense) => [
      expense.date,
      expense.name,
      expense.category,
      expense.amount
    ])
  ];

  const csv = csvRows
    .map((row) =>
      row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
    )
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `SpendSmart-Expenses-${selectedExpenseMonth}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  showToast("Monthly expense report exported.");
}

function renderBudget() {
  const spent = totalSpent();
  const remaining = data.budget - spent;
  const percentage = data.budget > 0 ? (spent / data.budget) * 100 : 0;

  if ($("budgetInput")) $("budgetInput").value = data.budget;
  if ($("budgetBig")) $("budgetBig").textContent = money(data.budget);
  if ($("budgetSpent")) $("budgetSpent").textContent = money(spent);
  if ($("budgetLeft")) $("budgetLeft").textContent = money(remaining);
  if ($("budgetProgress2")) {
    $("budgetProgress2").style.width = `${Math.min(percentage, 100)}%`;
  }

  if ($("budgetAdvice")) {
    if (percentage > 100) {
      $("budgetAdvice").textContent = "You are over budget. Review optional expenses.";
    } else if (percentage >= 80) {
      $("budgetAdvice").textContent =
        "You are close to your limit. Slow down on non-essential purchases.";
    } else {
      $("budgetAdvice").textContent =
        "Your budget has room. Keep tracking every expense.";
    }
  }
}

function renderGoals() {
  if (!$("goalsList")) return;

  $("goalsList").innerHTML = data.goals
    .map((goal) => {
      const target = Number(goal.target) || 0;
      const current = Number(goal.current) || 0;
      const percentage = target > 0
        ? Math.min(100, (current / target) * 100)
        : 0;

      return `
        <div class="goal-card">
          <div class="goal-card-top">
            <span>🌱 ${escapeHTML(goal.name)}</span>
            <span>${Math.round(percentage)}%</span>
          </div>
          <p>${money(current)} saved of ${money(target)} · ${money(Math.max(0, target - current))} to go</p>
          <div class="progress-track">
            <div class="progress-fill" style="width:${percentage}%"></div>
          </div>
          <div class="goal-actions">
            <button type="button" data-addgoal="${Number(goal.id)}">＋ Add ₹100</button>
            <button type="button" data-removegoal="${Number(goal.id)}">Delete goal</button>
          </div>
        </div>
      `;
    })
    .join("") ||
    '<div class="empty-state">No goals yet. Create your first savings goal.</div>';

  document.querySelectorAll("[data-addgoal]").forEach((button) => {
    button.addEventListener("click", () => {
      const goal = data.goals.find(
        (item) => Number(item.id) === Number(button.dataset.addgoal)
      );
      if (!goal) return;

      goal.current = Math.min(
        Number(goal.target),
        Number(goal.current) + 100
      );
      saveData();
      showToast("₹100 added to your goal!");
    });
  });

  document.querySelectorAll("[data-removegoal]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!window.confirm("Delete this goal?")) return;
      const id = Number(button.dataset.removegoal);
      data.goals = data.goals.filter((goal) => Number(goal.id) !== id);
      saveData();
      showToast("Savings goal deleted.");
    });
  });
}

function categoryTotals() {
  const totals = {};
  currentMonthExpenses().forEach((expense) => {
    const category = expense.category || "Other";
    totals[category] =
      (totals[category] || 0) + Number(expense.amount || 0);
  });
  return totals;
}

function renderCharts() {
  const totals = categoryTotals();
  const labels = Object.keys(totals);
  const values = Object.values(totals);

  if ($("emptyChart")) {
    $("emptyChart").style.display = labels.length ? "none" : "grid";
  }
  if ($("insightEmpty")) {
    $("insightEmpty").style.display = labels.length ? "none" : "grid";
  }

  const notes = [];
  if (labels.length) {
    const highestValue = Math.max(...values);
    const highestCategory = labels[values.indexOf(highestValue)];

    notes.push(
      `Your highest spending category this month is <b>${escapeHTML(highestCategory)}</b> at ${money(highestValue)}.`
    );
    notes.push(
      `You have recorded ${currentMonthExpenses().length} expenses, totalling ${money(totalSpent())}.`
    );

    if (totalSpent() > data.budget) {
      notes.push(
        `You are ${money(totalSpent() - data.budget)} over your budget. Consider reducing optional spending.`
      );
    } else {
      notes.push(
        `You have ${money(data.budget - totalSpent())} remaining in your monthly budget.`
      );
    }

    notes.push(
      "Try reviewing your expenses once a week. Small adjustments are easier to maintain."
    );
  }

  if ($("insightNotes")) {
    $("insightNotes").innerHTML = notes
      .map((note) => `<div class="insight-note">✦ ${note}</div>`)
      .join("") ||
      '<p class="empty-state">Your observations will appear after you record expenses.</p>';
  }

  // Charts are optional; the rest of the app works if Chart.js cannot load.
  if (typeof window.Chart === "undefined") return;

  const colors = [
    "#8069df",
    "#f0a35d",
    "#55b99a",
    "#67a1dc",
    "#e17e9b",
    "#aaa4bc"
  ];

  const makeConfig = () => ({
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 3,
        borderColor: "#fff",
        hoverOffset: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 8,
            usePointStyle: true,
            font: { size: 9 }
          }
        }
      }
    }
  });

  if ($("categoryChart")) {
    if (categoryChart) categoryChart.destroy();
    if (labels.length) {
      categoryChart = new Chart($("categoryChart"), makeConfig());
    } else {
      categoryChart = null;
    }
  }

  if ($("insightChart")) {
    if (insightChart) insightChart.destroy();
    if (labels.length) {
      insightChart = new Chart($("insightChart"), makeConfig());
    } else {
      insightChart = null;
    }
  }
}

function renderAssistantStats() {
  if ($("assistantUsed")) {
    const percentage = data.budget > 0
      ? Math.round((totalSpent() / data.budget) * 100)
      : 0;
    $("assistantUsed").textContent = `${percentage}%`;
  }
  if ($("assistantCount")) {
    $("assistantCount").textContent = currentMonthExpenses().length;
  }
}

function getAssistantReply(question) {
  const text = question.toLowerCase();
  const spent = totalSpent();
  const remaining = data.budget - spent;
  const totals = categoryTotals();
  const categories = Object.keys(totals);

  if (text.includes("left") || text.includes("remaining")) {
    return `You have ${money(remaining)} remaining from your ${money(data.budget)} monthly budget. You have spent ${money(spent)} so far.`;
  }

  if (
    text.includes("most") ||
    text.includes("category") ||
    text.includes("where")
  ) {
    if (!categories.length) {
      return "You have not recorded any expenses this month yet. Add a few expenses and I can show your biggest category.";
    }

    const topCategory = categories.sort(
      (a, b) => totals[b] - totals[a]
    )[0];

    return `Your highest spending category is ${topCategory} (${money(totals[topCategory])}). Check whether any upcoming purchases in this category can be reduced.`;
  }

  if (
    text.includes("tip") ||
    text.includes("save") ||
    text.includes("saving")
  ) {
    return "Try the 50-30-20 idea as a starting point: needs, wants and savings. For a student budget, first cover essentials, then set a small realistic savings target. Track even small purchases.";
  }

  if (text.includes("budget") || text.includes("spent")) {
    const percentage = data.budget > 0
      ? Math.round((spent / data.budget) * 100)
      : 0;
    return `Your monthly budget is ${money(data.budget)} and your recorded spending is ${money(spent)}. That is ${percentage}% of your limit.`;
  }

  if (text.includes("hello") || text.includes("hi")) {
    return "Hello! Ask me about your remaining budget, biggest spending category, or a saving tip.";
  }

  return "I can help with your remaining budget, spending categories and simple saving tips. Try one of the suggested questions below.";
}

function addChatMessage(message, type) {
  const container = $("chatMessages");
  if (!container) return;

  const element = document.createElement("div");
  element.className = type === "user" ? "user-message" : "bot-message";
  element.textContent = message;
  container.appendChild(element);
  container.scrollTop = container.scrollHeight;
}

function initialiseApp() {
  if ($("monthLabel")) {
    $("monthLabel").textContent = today.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric"
    });
  }

  if ($("todayLabel")) {
    $("todayLabel").textContent = today.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long"
    }).toUpperCase();
  }

  bindEvents();

  const initialPage = location.hash.replace("#", "") || "dashboard";
  showPage(initialPage);
  renderAll();
}

document.addEventListener("DOMContentLoaded", initialiseApp);
