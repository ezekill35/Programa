import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

export function register() {
  const email = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;
  const errorMessage = document.getElementById("register-error");
  const successMessage = document.getElementById("register-success");
  errorMessage.textContent = ""; successMessage.textContent = "";

  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      successMessage.textContent = "✅ Usuario registrado correctamente";
      setDoc(doc(db, "usuarios", userCredential.user.uid), { email, creado: new Date() });
      setTimeout(()=> window.location.href="dashboard.html", 1500);
    })
    .catch(err => errorMessage.textContent = err.message);
}

export function login() {
  const email = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const errorMessage = document.getElementById("login-error");
  errorMessage.textContent = "";

  signInWithEmailAndPassword(auth, email, password)
    .then(()=> window.location.href="dashboard.html")
    .catch(err => errorMessage.textContent = err.message);
}

export function logout() {
  signOut(auth).then(()=> window.location.href="index.html");
}

export function togglePasswordVisibility(fieldId, iconElement) {
  const input = document.getElementById(fieldId);
  if(input.type==="password"){input.type="text"; iconElement.classList.replace("fa-eye-slash","fa-eye");}
  else {input.type="password"; iconElement.classList.replace("fa-eye","fa-eye-slash");}
}















