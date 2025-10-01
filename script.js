import { auth } from "./firebase.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Alternar formularios
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const showRegister = document.getElementById("show-register");
const showLogin = document.getElementById("show-login");

// Mostrar registro
showRegister.addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.style.display = "none";
  showRegister.parentElement.style.display = "none";
  registerForm.style.display = "block";
  showLogin.style.display = "block";
});

// Mostrar login
showLogin.addEventListener("click", (e) => {
  e.preventDefault();
  registerForm.style.display = "none";
  showLogin.style.display = "none";
  loginForm.style.display = "block";
  showRegister.parentElement.style.display = "block";
});

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("✅ Sesión iniciada correctamente");
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("❌ Error al iniciar sesión: " + error.message);
  }
});

// Registro
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("✅ Cuenta creada exitosamente");
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("❌ Error al registrar: " + error.message);
  }
});




















