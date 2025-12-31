/*********************************
 * PosPro - Core Application Logic
 * Invoices / Purchases / Expenses
 * Reports / Profit / Offline Sync
 *********************************/

import {
  addWithUID,
  getUserDocs,
  currentUser
} from "./firebase.js";

import { logout } from "./auth.js";

/* ===============================
   🔹 UI Helpers
================================ */
const $ = id => document.getElementById(id);

window.logout = logout;

/* ===============================
   🧾 Invoices
================================ */
export async function addInvoice(items, total, customer = "") {
  if (!items.length) return alert("الفاتورة فارغة");

  await addWithUID("invoices", {
    items,
    total,
    customer
  });

  alert("✅ تم حفظ الفاتورة");
}

export async function loadInvoices() {
  const invoices = await getUserDocs("invoices");
  const box = $("invoiceList");
  if (!box) return;

  box.innerHTML = "";
  invoices.forEach(i => {
    box.innerHTML += `
      <div class="card">
        <b>فاتورة</b><br>
        العميل: ${i.customer || "-"}<br>
        الإجمالي: ${i.total}
      </div>`;
  });
}

/* ===============================
   📦 Purchases
================================ */
export async function addPurchase(items, total) {
  await addWithUID("purchases", {
    items,
    total
  });
  alert("✅ تم حفظ المشتريات");
}

/* ===============================
   💸 Expenses
================================ */
export async function addExpense(type, amount, note = "") {
  if (!amount) return alert("أدخل المبلغ");

  await addWithUID("expenses", {
    type,
    amount,
    note
  });

  alert("✅ تم حفظ المصروف");
}

export async function loadExpenses() {
  const expenses = await getUserDocs("expenses");
  const box = $("expenseList");
  if (!box) return;

  box.innerHTML = "";
  expenses.forEach(e => {
    box.innerHTML += `
      <div class="card">
        ${e.type} - ${e.amount}
      </div>`;
  });
}

/* ===============================
   📊 Reports & Profit
================================ */
export async function showProfit(from = null, to = null) {
  const invoices = await getUserDocs("invoices");
  const expenses = await getUserDocs("expenses");

  let sales = 0;
  let costs = 0;

  invoices.forEach(i => sales += i.total);
  expenses.forEach(e => costs += e.amount);

  const net = sales - costs;

  $("reportResult").innerHTML = `
    <h3>📈 التقرير المالي</h3>
    <p>إجمالي المبيعات: ${sales}</p>
    <p>إجمالي المصروفات: ${costs}</p>
    <h2>صافي الربح: ${net}</h2>
  `;
}

/* ===============================
   📴 Offline Status
================================ */
window.addEventListener("offline", () => {
  console.warn("📴 Offline mode");
});

window.addEventListener("online", () => {
  console.log("🔁 Syncing...");
});

/* ===============================
   🚀 Init
================================ */
document.addEventListener("DOMContentLoaded", () => {
  loadInvoices();
  loadExpenses();
});
