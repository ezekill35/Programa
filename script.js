import { auth } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Elementos
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const mensajeLogin = document.getElementById('mensajeLogin');
const mensajeRegister = document.getElementById('mensajeRegister');

// Mostrar/ocultar formularios
showRegister.addEventListener('click', () => {
  loginForm.classList.add('d-none');
  registerForm.classList.remove('d-none');
});
showLogin.addEventListener('click', () => {
  registerForm.classList.add('d-none');
  loginForm.classList.remove('d-none');
});

// REGISTRO
document.getElementById('btnRegister').addEventListener('click', async () => {
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value.trim();

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    mensajeRegister.textContent = '✅ Registro exitoso';
    mensajeRegister.style.color = 'green';
  } catch (error) {
    mensajeRegister.textContent = error.message;
    mensajeRegister.style.color = 'red';
  }
});

// LOGIN
document.getElementById('btnLogin').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    mensajeLogin.textContent = '✅ Inicio de sesión correcto';
    mensajeLogin.style.color = 'green';
    setTimeout(() => (window.location.href = 'dashboard.html'), 800);
  } catch (error) {
    mensajeLogin.textContent = error.message;
    mensajeLogin.style.color = 'red';
  }
});





















