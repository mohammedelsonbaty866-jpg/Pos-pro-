import { initAuth } from './auth.js';
import { auth, db } from './firebase.js';
import {
 collection, addDoc, getDocs, query, where, Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUser;

initAuth(renderApp);

async function renderApp(user){
 currentUser = user;

 document.getElementById("root").innerHTML = `
 <header>📊 Pos Pro</header>

 <nav>
  <button class="active" onclick="show('sales',this)">فواتير</button>
  <button onclick="show('expenses',this)">مصروفات</button>
  <button onclick="show('reports',this)">تقارير</button>
  <button onclick="show('settings',this)">الإعدادات</button>
 </nav>

 <div class="box" id="sales">
  <h3>فاتورة بيع</h3>
  <input id="customer" placeholder="اسم العميل">
  <input id="total" type="number" placeholder="الإجمالي">
  <button class="primary" onclick="saveInvoice()">حفظ الفاتورة</button>
 </div>

 <div class="box hidden" id="expenses">
  <h3>مصروف</h3>
  <input id="expNote" placeholder="الوصف">
  <input id="expAmount" type="number">
  <button class="primary" onclick="saveExpense()">حفظ</button>
 </div>

 <div class="box hidden" id="reports">
  <h3>صافي الربح</h3>
  <button onclick="loadReport()">عرض</button>
  <div id="report"></div>
 </div>

 <div class="box hidden" id="settings">
  <h3>الإعدادات</h3>
  <input id="displayName" placeholder="اسم المستخدم">
  <button class="primary" onclick="saveProfile()">حفظ</button>
 </div>
 `;
}

window.show = (id,btn)=>{
 document.querySelectorAll(".box").forEach(b=>b.classList.add("hidden"));
 document.getElementById(id).classList.remove("hidden");
 document.querySelectorAll("nav button").forEach(b=>b.classList.remove("active"));
 btn.classList.add("active");
};

// فواتير
window.saveInvoice = async()=>{
 await addDoc(collection(db,"invoices"),{
  uid: currentUser.uid,
  customer: customer.value,
  total: +total.value,
  date: Timestamp.now()
 });
 alert("تم حفظ الفاتورة");
};

// مصروفات
window.saveExpense = async()=>{
 await addDoc(collection(db,"expenses"),{
  uid: currentUser.uid,
  note: expNote.value,
  amount: +expAmount.value,
  date: Timestamp.now()
 });
 alert("تم حفظ المصروف");
};

// تقارير
window.loadReport = async()=>{
 let sales=0, exp=0;

 const inv = await getDocs(
  query(collection(db,"invoices"), where("uid","==",currentUser.uid))
 );
 inv.forEach(d=>sales+=d.data().total);

 const ex = await getDocs(
  query(collection(db,"expenses"), where("uid","==",currentUser.uid))
 );
 ex.forEach(d=>exp+=d.data().amount);

 report.innerHTML = `<b>صافي الربح: ${sales-exp}</b>`;
};

// إعدادات
window.saveProfile = ()=>{
 auth.currentUser.updateProfile({displayName:displayName.value});
 alert("تم حفظ الاسم");
};
