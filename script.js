import { auth } from "./firebase.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Alternar login / registro
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

document.getElementById("showRegister").addEventListener("click", () => {
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
});

document.getElementById("showLogin").addEventListener("click", () => {
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
});

// Mensajes debajo de formularios
const mensajeLogin = document.getElementById("mensajeLogin");
const mensajeRegister = document.getElementById("mensajeRegister");

// Registro
document.getElementById("btnRegister").addEventListener("click", async () => {
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  mensajeRegister.textContent = "";
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    mensajeRegister.textContent = "✅ Registro exitoso. Ahora inicia sesión.";
    mensajeRegister.style.color = "#27ae60";
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
  } catch (error) {
    mensajeRegister.textContent = "❌ Error: " + error.message;
    mensajeRegister.style.color = "#e74c3c";
  }
});

// Login
document.getElementById("btnLogin").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  mensajeLogin.textContent = "";
  try {
    await signInWithEmailAndPassword(auth, email, password);
    mensajeLogin.textContent = "🎉 Sesión iniciada correctamente.";
    mensajeLogin.style.color = "#27ae60";
    // Redirigir al dashboard con retraso para mostrar mensaje
    setTimeout(() => { window.location.href = "dashboard.html"; }, 1000);
  } catch (error) {
    mensajeLogin.textContent = "❌ Error: " + error.message;
    mensajeLogin.style.color = "#e74c3c";
  }
});






















