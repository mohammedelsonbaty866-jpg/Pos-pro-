/****************************************
 * PosPro – auth.js
 * Firebase Auth + Page Protection
 ****************************************/

import {
  auth,
  watchAuth,
  createUserProfile,
  checkSubscription
} from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* =========================
   UI Helpers
   ========================= */
function $(id) {
  return document.getElementById(id);
}

/* =========================
   Register
   ========================= */
export async function register(email, password) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(cred.user);
    location.href = "index.html";
  } catch (err) {
    alert("خطأ في إنشاء الحساب: " + err.message);
  }
}

/* =========================
   Login
   ========================= */
export async function login(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    location.href = "index.html";
  } catch (err) {
    alert("بيانات الدخول غير صحيحة");
  }
}

/* =========================
   Logout
   ========================= */
export async function logout() {
  await signOut(auth);
  location.href = "login.html";
}

/* =========================
   Route Protection
   ========================= */
export function protectPage() {
  watchAuth(async user => {
    if (!user) {
      location.href = "login.html";
      return;
    }

    const valid = await checkSubscription(user.uid);
    if (!valid) {
      document.body.innerHTML = `
        <div style="padding:40px;text-align:center">
          <h2>انتهى الاشتراك</h2>
          <p>يرجى تجديد الاشتراك للاستمرار</p>
        </div>
      `;
    }
  });
}

/* =========================
   Login Page Bindings
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  if ($("loginBtn")) {
    $("loginBtn").onclick = () =>
      login($("email").value, $("password").value);
  }

  if ($("registerBtn")) {
    $("registerBtn").onclick = () =>
      register($("email").value, $("password").value);
  }

  if ($("logoutBtn")) {
    $("logoutBtn").onclick = logout;
  }
});
