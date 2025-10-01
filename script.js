import { auth } from "./firebase.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Alternar entre login y registro
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

// Registro
document.getElementById("btnRegister").addEventListener("click", async () => {
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("✅ Registro exitoso. Ahora inicia sesión.");
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
  } catch (error) {
    alert("❌ Error: " + error.message);
  }
});

// Login
document.getElementById("btnLogin").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("🎉 Sesión iniciada correctamente.");
    window.location.href = "dashboard.html"; // redirigir al dashboard
  } catch (error) {
    alert("❌ Error: " + error.message);
  }
});





















