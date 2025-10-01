// script.js
import { auth } from "./firebase.js";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// ---- Toggle entre login y registro ----
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

document.getElementById("show-register").addEventListener("click", () => {
  loginForm.classList.remove("active");
  registerForm.classList.add("active");
});

document.getElementById("show-login").addEventListener("click", () => {
  registerForm.classList.remove("active");
  loginForm.classList.add("active");
});

// ---- Login ----
document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("✅ Bienvenido a Discovery Pets");
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("❌ Error al iniciar sesión: " + error.message);
  }
});

// ---- Registro ----
document.getElementById("register-btn").addEventListener("click", async () => {
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("✅ Usuario registrado correctamente");
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("❌ Error al registrar: " + error.message);
  }
});


















