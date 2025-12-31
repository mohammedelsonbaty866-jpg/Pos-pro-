import { auth, db } from './firebase.js';
import {
 createUserWithEmailAndPassword,
 signInWithEmailAndPassword,
 onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { doc, getDoc, setDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function initAuth(renderApp){
 onAuthStateChanged(auth, async user=>{
  if(!user){
   renderLogin();
   return;
  }

  const ref = doc(db,"users",user.uid);
  const snap = await getDoc(ref);

  if(!snap.exists()){
   await setDoc(ref,{
    uid:user.uid,
    created:new Date(),
    plan:"trial",
    trialDays:14
   });
  }

  renderApp(user);
 });
}

function renderLogin(){
 document.getElementById("root").innerHTML = `
 <div class="box">
  <h3>تسجيل الدخول</h3>
  <input id="email" placeholder="البريد الإلكتروني">
  <input id="password" type="password" placeholder="كلمة المرور">
  <button class="primary" id="login">دخول</button>
  <button id="register">إنشاء حساب</button>
 </div>
 `;
 document.getElementById("login").onclick =
  ()=>signInWithEmailAndPassword(auth,email.value,password.value);

 document.getElementById("register").onclick =
  ()=>createUserWithEmailAndPassword(auth,email.value,password.value);
}
