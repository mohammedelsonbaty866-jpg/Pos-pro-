/*********************************
 * PosPro - Firebase Core
 * Auth + Firestore + Offline Sync
 *********************************/

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
  setDoc,
  getDoc,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ===============================
   🔐 Firebase Configuration
================================ */
const firebaseConfig = {
  apiKey: "AIzaSyBZwWxWIIE0exAPoL9P8pbmp19gnBFxQq0",
  authDomain: "pos-pro-996f0.firebaseapp.com",
  projectId: "pos-pro-996f0",
  storageBucket: "pos-pro-996f0.appspot.com",
  messagingSenderId: "591451935128",
  appId: "1:591451935128:web:683495139e62fb9b1e1bed"
};

/* ===============================
   🚀 Initialize
================================ */
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/* ===============================
   📦 Offline Persistence
================================ */
enableIndexedDbPersistence(db)
  .then(() => console.log("✅ Offline persistence enabled"))
  .catch(err => console.warn("⚠️ Offline persistence error:", err.code));

/* ===============================
   👤 Current User
================================ */
export let currentUser = null;

onAuthStateChanged(auth, user => {
  currentUser = user || null;

  if (!user) {
    if (!location.pathname.includes("login.html")) {
      location.href = "login.html";
    }
  }
});

/* ===============================
   🧾 Helpers
================================ */

// Create user profile (first login)
export async function createUserProfile(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      createdAt: serverTimestamp(),
      plan: "trial",
      trialEnds: Date.now() + 14 * 24 * 60 * 60 * 1000
    });
  }
}

// Check SaaS Subscription
export async function checkSubscription(uid) {
  const ref = doc(db, "subscriptions", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return { active: true, plan: "trial" };
  }

  return snap.data();
}

/* ===============================
   📴 Offline-safe Add
================================ */
export async function addWithUID(collectionName, data) {
  if (!currentUser) throw "Not authenticated";

  return await addDoc(collection(db, collectionName), {
    ...data,
    uid: currentUser.uid,
    createdAt: serverTimestamp()
  });
}

/* ===============================
   📊 Query by UID
================================ */
export async function getUserDocs(collectionName) {
  if (!currentUser) return [];

  const q = query(
    collection(db, collectionName),
    where("uid", "==", currentUser.uid)
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
