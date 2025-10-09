// script.js
import { auth } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// --- ELEMENTOS ---
const loginBox = document.getElementById('loginBox');
const registerBox = document.getElementById('registerBox');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// --- TOGGLE LOGIN / REGISTER ---
showRegister.addEventListener('click', e => {
  e.preventDefault();
  loginBox.style.display = 'none';
  registerBox.style.display = 'block';
});
showLogin.addEventListener('click', e => {
  e.preventDefault();
  registerBox.style.display = 'none';
  loginBox.style.display = 'block';
});

// --- REGISTRO ---
registerForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert('Usuario registrado correctamente!');
    registerForm.reset();
    registerBox.style.display = 'none';
    loginBox.style.display = 'block';
  } catch (error) {
    alert(error.message);
  }
});

// --- LOGIN ---
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html"; // Redirige al dashboard
  } catch (error) {
    alert(error.message);
  }
});

// --- VERIFICAR SESIÓN ---
onAuthStateChanged(auth, user => {
  if(user) {
    // Usuario logueado
    console.log('Usuario activo:', user.email);
  }
});







