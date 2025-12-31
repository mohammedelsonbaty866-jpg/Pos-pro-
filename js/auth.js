// auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { auth, db } from "./firebase.js";

// تسجيل حساب
export async function register(email, password) {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", res.user.uid), {
    uid: res.user.uid,
    plan: "trial",
    createdAt: Date.now(),
    trialEnds: Date.now() + 14 * 24 * 60 * 60 * 1000
  });
}

// تسجيل دخول
export async function login(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
}

// خروج
export function logout() {
  signOut(auth);
}

// فحص الاشتراك
export async function checkSubscription(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return false;

  const data = snap.data();
  if (data.plan === "paid") return true;

  return Date.now() < data.trialEnds;
}
