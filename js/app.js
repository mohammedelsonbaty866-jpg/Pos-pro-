/****************************************
 * PosPro – app.js
 * Core Accounting Logic
 ****************************************/

import { auth } from "./firebase.js";
import {
  addData,
  getData
} from "./firebase.js";

import { protectPage } from "./auth.js";

protectPage();

/* =========================
   State
   ========================= */
let currentUser = null;
let invoices = [];
let purchases = [];
let expenses = [];
let products = [];

/* =========================
   Helpers
   ========================= */
function $(id) {
  return document.getElementById(id);
}

function money(n) {
  return Number(n || 0).toFixed(2);
}

/* =========================
   Auth Ready
   ========================= */
auth.onAuthStateChanged(async user => {
  if (!user) return;
  currentUser = user;
  await loadAll();
});

/* =========================
   Load All Data
   ========================= */
async function loadAll() {
  invoices = await getData(currentUser.uid, "invoices");
  purchases = await getData(currentUser.uid, "purchases");
  expenses = await getData(currentUser.uid, "expenses");
  products = await getData(currentUser.uid, "products");

  renderDashboard();
}

/* =========================
   Dashboard
   ========================= */
function renderDashboard() {
  const salesTotal = invoices.reduce((s, i) => s + i.total, 0);
  const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const profit = salesTotal - expenseTotal;

  if ($("dashSales")) $("dashSales").innerText = money(salesTotal);
  if ($("dashExpenses")) $("dashExpenses").innerText = money(expenseTotal);
  if ($("dashProfit")) $("dashProfit").innerText = money(profit);
}

/* =========================
   Products
   ========================= */
export async function addProduct(name, price) {
  await addData(currentUser.uid, "products", {
    name,
    price: Number(price)
  });
  products = await getData(currentUser.uid, "products");
}

/* =========================
   Invoices
   ========================= */
export async function createInvoice(items, customer) {
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  await addData(currentUser.uid, "invoices", {
    customer,
    items,
    total
  });

  invoices = await getData(currentUser.uid, "invoices");
  renderDashboard();
}

/* =========================
   Purchases
   ========================= */
export async function addPurchase(items) {
  const total = items.reduce((s, i) => s + i.qty * i.cost, 0);

  await addData(currentUser.uid, "purchases", {
    items,
    total
  });

  purchases = await getData(currentUser.uid, "purchases");
}

/* =========================
   Expenses
   ========================= */
export async function addExpense(type, amount, note = "") {
  await addData(currentUser.uid, "expenses", {
    type,
    amount: Number(amount),
    note
  });

  expenses = await getData(currentUser.uid, "expenses");
  renderDashboard();
}

/* =========================
   Reports
   ========================= */
export function salesReport(from, to) {
  return invoices.filter(i => {
    const d = i.createdAt?.toDate?.() || new Date();
    return (!from || d >= from) && (!to || d <= to);
  });
}

export function profitReport(from, to) {
  const sales = salesReport(from, to)
    .reduce((s, i) => s + i.total, 0);

  const exp = expenses.filter(e => {
    const d = e.createdAt?.toDate?.() || new Date();
    return (!from || d >= from) && (!to || d <= to);
  }).reduce((s, e) => s + e.amount, 0);

  return {
    sales,
    expenses: exp,
    profit: sales - exp
  };
}

/* =========================
   Offline Indicator
   ========================= */
window.addEventListener("offline", () => {
  document.body.classList.add("offline");
});

window.addEventListener("online", () => {
  document.body.classList.remove("offline");
});
