// script.js
import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");

document.getElementById("showRegister").addEventListener("click", () => {
  loginSection.classList.remove("active");
  registerSection.classList.add("active");
});

document.getElementById("showLogin").addEventListener("click", () => {
  registerSection.classList.remove("active");
  loginSection.classList.add("active");
});

// LOGIN
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("Error al iniciar sesión: " + error.message);
  }
});

// REGISTRO
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Usuario registrado correctamente!");
    registerSection.classList.remove("active");
    loginSection.classList.add("active");
  } catch (error) {
    alert("Error al registrar: " + error.message);
  }
});








