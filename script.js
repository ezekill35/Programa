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

// Alternar formularios
showRegister.addEventListener('click', () => {
  loginForm.classList.remove('active');
  registerForm.classList.add('active');
  mensajeLogin.textContent = '';
});
showLogin.addEventListener('click', () => {
  registerForm.classList.remove('active');
  loginForm.classList.add('active');
  mensajeRegister.textContent = '';
});

// Registro
btnRegister.addEventListener('click', async () => {
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value.trim();
  if (!email || !password) return mensajeRegister.textContent = '⚠️ Todos los campos son obligatorios';
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    mensajeRegister.style.color = 'green';
    mensajeRegister.textContent = '✅ Usuario registrado con éxito';
    registerForm.reset();
  } catch (error) {
    mensajeRegister.style.color = 'red';
    mensajeRegister.textContent = error.message;
  }
});

// Login
btnLogin.addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  if (!email || !password) return mensajeLogin.textContent = '⚠️ Completa los campos';
  try {
    await signInWithEmailAndPassword(auth, email, password);
    mensajeLogin.style.color = 'green';
    mensajeLogin.textContent = '✨ Inicio de sesión exitoso';
    setTimeout(() => window.location.href = 'dashboard.html', 1000);
  } catch (error) {
    mensajeLogin.style.color = 'red';
    mensajeLogin.textContent = error.message;
  }
});

















