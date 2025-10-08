import { auth } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Elementos
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const mensajeLogin = document.getElementById('mensajeLogin');
const mensajeRegister = document.getElementById('mensajeRegister');
const btnLogin = document.getElementById('btnLogin');
const btnRegister = document.getElementById('btnRegister');

// Mostrar y ocultar formularios
showRegister.addEventListener('click', () => {
  loginForm.classList.add('d-none');
  registerForm.classList.remove('d-none');
});
showLogin.addEventListener('click', () => {
  registerForm.classList.add('d-none');
  loginForm.classList.remove('d-none');
});

// Registro
btnRegister.addEventListener('click', async () => {
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value.trim();

  if (!email || !password) return mensajeRegister.textContent = 'Completa todos los campos.';

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    mensajeRegister.style.color = 'green';
    mensajeRegister.textContent = '✅ Usuario registrado con éxito.';
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

  if (!email || !password) return mensajeLogin.textContent = 'Completa todos los campos.';

  try {
    await signInWithEmailAndPassword(auth, email, password);
    mensajeLogin.style.color = 'green';
    mensajeLogin.textContent = '✅ Inicio de sesión exitoso.';
    setTimeout(() => window.location.href = 'dashboard.html', 800);
  } catch (error) {
    mensajeLogin.style.color = 'red';
    mensajeLogin.textContent = error.message;
  }
});
















