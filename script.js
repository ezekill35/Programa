import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// Formularios
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const mensajeLogin = document.getElementById("mensajeLogin");
const mensajeRegister = document.getElementById("mensajeRegister");

// Alternar login / registro
document.getElementById("showRegister").addEventListener("click", () => {
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
  mensajeLogin.textContent = "";
});
document.getElementById("showLogin").addEventListener("click", () => {
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
  mensajeRegister.textContent = "";
});

// ---------------- REGISTRO ----------------
document.getElementById("btnRegister").addEventListener("click", async () => {
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value.trim();
  mensajeRegister.textContent = "";

  if(!email || !password){
    mensajeRegister.textContent = "❌ Completa todos los campos";
    mensajeRegister.style.color = "#e74c3c";
    return;
  }

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

// ---------------- LOGIN ----------------
document.getElementById("btnLogin").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  mensajeLogin.textContent = "";

  if(!email || !password){
    mensajeLogin.textContent = "❌ Completa todos los campos";
    mensajeLogin.style.color = "#e74c3c";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    mensajeLogin.textContent = "🎉 Sesión iniciada correctamente.";
    mensajeLogin.style.color = "#27ae60";
    setTimeout(() => { window.location.href = "dashboard.html"; }, 800);
  } catch (error) {
    mensajeLogin.textContent = "❌ Error: " + error.message;
    mensajeLogin.style.color = "#e74c3c";
  }
});

// ---------------- CONTROL DE SESIÓN ----------------
// Si el usuario ya está logueado, redirigir automáticamente al dashboard
onAuthStateChanged(auth, (user) => {
  if(user && window.location.pathname.includes("index.html")){
    window.location.href = "dashboard.html";
  }
});

// ---------------- CERRAR SESIÓN ----------------
// Esta función la llamas desde dashboard.html
window.cerrarSesion = async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    alert("Error al cerrar sesión: " + error.message);
  }
};



























