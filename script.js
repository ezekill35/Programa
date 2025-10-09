// ------------------ REFERENCIAS HTML ------------------
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginBox = document.querySelector(".login-box");
const registerBox = document.getElementById("registerBox");

const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

// ------------------ TOGGLE LOGIN / REGISTRO ------------------
showRegister.addEventListener("click", (e) => {
  e.preventDefault();
  loginBox.style.display = "none";
  registerBox.style.display = "block";
});

showLogin.addEventListener("click", (e) => {
  e.preventDefault();
  registerBox.style.display = "none";
  loginBox.style.display = "block";
});

// ------------------ FIREBASE AUTH ------------------
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

import { app } from "./firebase.js"; // tu firebase.js
const auth = getAuth(app);
const db = getFirestore(app);

// ------------------ REGISTRO ------------------
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Guardar datos adicionales en Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      nombre: name,
      email: email,
      createdAt: new Date()
    });

    alert("Usuario registrado correctamente");
    registerForm.reset();
    registerBox.style.display = "none";
    loginBox.style.display = "block";

  } catch (error) {
    console.error(error);
    alert("Error al registrar: " + error.message);
  }
});

// ------------------ LOGIN ------------------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginForm.reset();
    // Redirigir al dashboard
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error(error);
    alert("Error al iniciar sesión: " + error.message);
  }
});

// ------------------ MANTENER SESIÓN ------------------
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Si ya está logueado, redirigir al dashboard
    if (window.location.pathname.includes("index.html")) {
      window.location.href = "dashboard.html";
    }
  }
});






