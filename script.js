// ==============================
// 🔥 Importar módulos Firebase
// ==============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ==============================
// 🔧 Configuración Firebase
// ==============================
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.firebasestorage.app",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322",
  measurementId: "G-0WMLRY8FGM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ==============================
// 🔄 Alternar entre login y registro
// ==============================
const loginContainer = document.getElementById("login-container");
const registerContainer = document.getElementById("register-container");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

showRegister.addEventListener("click", () => {
  loginContainer.style.display = "none";
  registerContainer.style.display = "block";
});

showLogin.addEventListener("click", () => {
  registerContainer.style.display = "none";
  loginContainer.style.display = "block";
});

// ==============================
// 🧍 Registro de usuarios
// ==============================
const registerForm = document.getElementById("registerForm");
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("✅ Registro exitoso. ¡Bienvenido a Discovery Pets!");
    registerForm.reset();
    registerContainer.style.display = "none";
    loginContainer.style.display = "block";
  } catch (error) {
    alert("❌ Error al registrar: " + error.message);
  }
});

// ==============================
// 🔐 Inicio de sesión
// ==============================
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("✅ Inicio de sesión exitoso");
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("❌ Error al iniciar sesión: " + error.message);
  }
});

// ==============================
// 👀 Verificar sesión activa
// ==============================
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Usuario activo:", user.email);
  } else {
    console.log("Ningún usuario autenticado");
  }
});















