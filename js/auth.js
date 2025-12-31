/*********************************
 * PosPro - Authentication
 * Register / Login / Logout
 * No local password storage
 *********************************/

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  auth,
  createUserProfile,
  checkSubscription
} from "./firebase.js";

/* ===============================
   🔐 Register
================================ */
export async function register(email, password) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Create user profile in Firestore
    await createUserProfile(cred.user);

    alert("✅ تم إنشاء الحساب بنجاح");
    location.href = "index.html";

  } catch (err) {
    alert("❌ خطأ: " + err.message);
  }
}

/* ===============================
   🔓 Login
================================ */
export async function login(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    // Check subscription
    const sub = await checkSubscription(cred.user.uid);
    if (!sub.active) {
      alert("⚠️ الاشتراك غير مفعل");
      await signOut(auth);
      return;
    }

    location.href = "index.html";

  } catch (err) {
    alert("❌ بيانات الدخول غير صحيحة");
  }
}

/* ===============================
   🚪 Logout
================================ */
export async function logout() {
  await signOut(auth);
  location.href = "login.html";
}

/* ===============================
   🛡 Page Protection
================================ */
export function protectPage() {
  onAuthStateChanged(auth, user => {
    if (!user) {
      location.href = "login.html";
    }
  });
}
