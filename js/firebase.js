/**************************************
 * PosPro – firebase.js
 * Core Firebase + Offline + Sync
 **************************************/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  enableIndexedDbPersistence,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =========================
   Firebase Config
   ========================= */
const firebaseConfig = {
  apiKey: "AIzaSyBZwWxWIIE0exAPoL9P8pbmp19gnBFxQq0",
  authDomain: "pos-pro-996f0.firebaseapp.com",
  projectId: "pos-pro-996f0",
  storageBucket: "pos-pro-996f0.firebasestorage.app",
  messagingSenderId: "591451935128",
  appId: "1:591451935128:web:683495139e62fb9b1e1bed"
};

/* =========================
   Init
   ========================= */
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/* =========================
   Offline Persistence
   ========================= */
enableIndexedDbPersistence(db).catch(err => {
  console.warn("Offline persistence error:", err.code);
});

/* =========================
   Auth State
   ========================= */
export function watchAuth(callback) {
  onAuthStateChanged(auth, user => {
    callback(user);
  });
}

/* =========================
   SaaS – User Base Ref
   ========================= */
export function userRef(uid, collectionName) {
  return collection(db, "users", uid, collectionName);
}

/* =========================
   Create User Profile
   ========================= */
export async function createUserProfile(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      createdAt: serverTimestamp(),
      subscription: {
        plan: "trial",
        expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000
      }
    });
  }
}

/* =========================
   Subscription Check
   ========================= */
export async function checkSubscription(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return false;

  const data = snap.data();
  return data.subscription.expiresAt > Date.now();
}

/* =========================
   Generic CRUD (UID Safe)
   ========================= */
export async function addData(uid, name, data) {
  data.uid = uid;
  data.createdAt = serverTimestamp();
  return addDoc(userRef(uid, name), data);
}

export async function getData(uid, name) {
  const q = query(userRef(uid, name));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
