// script.js
import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const loginBox = document.getElementById("loginBox");
const registerBox = document.getElementById("registerBox");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

showRegister.addEventListener("click", () => {
  loginBox.style.display = "none";
  registerBox.style.display = "block";
});

showLogin.addEventListener("click", () => {
  loginBox.style.display = "block";
  registerBox.style.display = "none";
});

// Registro
document.getElementById("registerBtn").addEventListener("click", async () => {
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Usuario registrado correctamente!");
    loginBox.style.display = "block";
    registerBox.style.display = "none";
  } catch (error) {
    alert(error.message);
  }
});

// Login
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    alert(error.message);
  }
});

// Mantener sesión iniciada
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if(user){
    window.location.href = "dashboard.html";
  }
});







