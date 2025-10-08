// script.js
import { auth } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const mensajeLogin = document.getElementById('mensajeLogin');
const mensajeRegister = document.getElementById('mensajeRegister');

// Mostrar/ocultar formularios
showRegister.addEventListener('click', () => {
  loginForm.classList.remove('active');
  registerForm.classList.add('active');
});
showLogin.addEventListener('click', () => {
  registerForm.classList.remove('active');
  loginForm.classList.add('active');
});

// Registro
document.getElementById('btnRegister').addEventListener('click', async () => {
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value.trim();

  if (!email || !password) {
    mensajeRegister.textContent = "Completa todos los campos.";
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    mensajeRegister.style.color = "green";
    mensajeRegister.textContent = "Usuario registrado correctamente.";
    registerForm.reset();
  } catch (error) {
    mensajeRegister.style.color = "red";
    mensajeRegister.textContent = error.message;
  }
});

// Login
document.getElementById('btnLogin').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) {
    mensajeLogin.textContent = "Completa todos los campos.";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    mensajeLogin.style.color = "green";
    mensajeLogin.textContent = "Inicio de sesión exitoso.";
    setTimeout(() => (window.location.href = "dashboard.html"), 800);
  } catch (error) {
    mensajeLogin.style.color = "red";
    mensajeLogin.textContent = error.message;
  }
});















