// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/7.20.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/7.20.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.firebasestorage.app",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322",
  measurementId: "G-0WMLRY8FGM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Sections
const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
document.getElementById("showRegister").addEventListener("click", () => {
  loginSection.classList.add("d-none");
  registerSection.classList.remove("d-none");
});
document.getElementById("showLogin").addEventListener("click", () => {
  registerSection.classList.add("d-none");
  loginSection.classList.remove("d-none");
});

// Register
document.getElementById("registerForm").addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      alert("Usuario registrado correctamente");
      registerSection.classList.add("d-none");
      loginSection.classList.remove("d-none");
      document.getElementById("registerForm").reset();
    })
    .catch(error => alert(error.message));
});

// Login
document.getElementById("loginForm").addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      window.location.href = "dashboard.html";
    })
    .catch(error => alert(error.message));
});

// Mantener sesión iniciada
auth.onAuthStateChanged(user => {
  if(user && window.location.pathname.endsWith("index.html")) {
    window.location.href = "dashboard.html";
  }
});







