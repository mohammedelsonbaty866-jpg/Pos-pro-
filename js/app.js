// app.js
import {
  collection,
  addDoc,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { auth, db } from "./firebase.js";

let uid = null;
auth.onAuthStateChanged(u => uid = u?.uid);

// إضافة فاتورة
export async function addInvoice(items, total) {
  await addDoc(collection(db, "invoices"), {
    uid,
    items,
    total,
    date: Date.now()
  });
}

// إضافة مصروف
export async function addExpense(type, amount) {
  await addDoc(collection(db, "expenses"), {
    uid,
    type,
    amount,
    date: Date.now()
  });
}

// إضافة شراء
export async function addPurchase(name, qty, price) {
  await addDoc(collection(db, "purchases"), {
    uid,
    name,
    qty,
    price,
    date: Date.now()
  });
}

// تقرير صافي الربح
export async function profitReport(from, to) {
  let sales = 0, expenses = 0;

  const invQ = query(
    collection(db, "invoices"),
    where("uid", "==", uid)
  );

  const expQ = query(
    collection(db, "expenses"),
    where("uid", "==", uid)
  );

  (await getDocs(invQ)).forEach(d => {
    if (d.data().date >= from && d.data().date <= to)
      sales += d.data().total;
  });

  (await getDocs(expQ)).forEach(d => {
    if (d.data().date >= from && d.data().date <= to)
      expenses += d.data().amount;
  });

  return sales - expenses;
}
