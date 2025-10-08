// script.js
import { auth } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const mensajeLogin = document.getElementById('mensajeLogin');
const mensajeRegister = document.getElementById('mensajeRegister');
const btnLogin = document.getElementById('btnLogin');
const btnRegister = document.getElementById('btnRegister');

showRegister.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.classList.add('d-none');
  registerForm.classList.remove('d-none');
  mensajeLogin.textContent = '';
});

showLogin.addEventListener('click', (e) => {
  e.preventDefault();
  registerForm.classList.add('d-none');
  loginForm.classList.remove('d-none');
  mensajeRegister.textContent = '';
});

// Registro
btnRegister.addEventListener('click', async () => {
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value.trim();
  if (!email || !password) {
    mensajeRegister.style.color = 'red';
    mensajeRegister.textContent = 'Completa todos los campos';
    return;
  }
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    mensajeRegister.style.color = 'green';
    mensajeRegister.textContent = 'Registro correcto. Ya puedes iniciar sesión.';
    registerForm.reset();
    setTimeout(() => {
      registerForm.classList.add('d-none');
      loginForm.classList.remove('d-none');
      mensajeRegister.textContent = '';
    }, 1000);
  } catch (err) {
    mensajeRegister.style.color = 'red';
    mensajeRegister.textContent = err.message;
  }
});

// Login
btnLogin.addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  if (!email || !password) {
    mensajeLogin.style.color = 'red';
    mensajeLogin.textContent = 'Completa todos los campos';
    return;
  }
  try {
    await signInWithEmailAndPassword(auth, email, password);
    mensajeLogin.style.color = 'green';
    mensajeLogin.textContent = 'Inicio de sesión correcto. Redirigiendo...';
    setTimeout(() => window.location.href = 'dashboard.html', 800);
  } catch (err) {
    mensajeLogin.style.color = 'red';
    mensajeLogin.textContent = err.message;
  }
});
















