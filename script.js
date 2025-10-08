import { auth } from './firebase.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ====== ELEMENTOS ======
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const mensajeLogin = document.getElementById('mensajeLogin');
const mensajeRegister = document.getElementById('mensajeRegister');
const btnLogin = document.getElementById('btnLogin');
const btnRegister = document.getElementById('btnRegister');

// ====== CAMBIAR ENTRE FORMULARIOS ======
showRegister.addEventListener('click', () => {
  loginForm.classList.add('d-none');
  registerForm.classList.remove('d-none');
  mensajeLogin.textContent = '';
});
showLogin.addEventListener('click', () => {
  registerForm.classList.add('d-none');
  loginForm.classList.remove('d-none');
  mensajeRegister.textContent = '';
});

// ====== REGISTRO ======
btnRegister.addEventListener('click', async () => {
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value.trim();

  if (!email || !password) {
    mensajeRegister.textContent = '⚠️ Todos los campos son obligatorios';
    mensajeRegister.style.color = 'red';
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    mensajeRegister.style.color = 'green';
    mensajeRegister.textContent = '✅ Usuario registrado correctamente';
    registerForm.reset();

    setTimeout(() => {
      registerForm.classList.add('d-none');
      loginForm.classList.remove('d-none');
    }, 1500);
  } catch (error) {
    mensajeRegister.style.color = 'red';
    mensajeRegister.textContent = traducirError(error.code);
  }
});

// ====== LOGIN ======
btnLogin.addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) {
    mensajeLogin.textContent = '⚠️ Todos los campos son obligatorios';
    mensajeLogin.style.color = 'red';
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    mensajeLogin.style.color = 'green';
    mensajeLogin.textContent = '✅ Inicio de sesión correcto';
    setTimeout(() => window.location.href = 'dashboard.html', 1000);
  } catch (error) {
    mensajeLogin.style.color = 'red';
    mensajeLogin.textContent = traducirError(error.code);
  }
});

// ====== TRADUCIR ERRORES ======
function traducirError(code) {
  const errores = {
    'auth/email-already-in-use': 'El correo ya está en uso.',
    'auth/invalid-email': 'Correo electrónico inválido.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/user-not-found': 'Usuario no encontrado.',
    'auth/wrong-password': 'Contraseña incorrecta.'
  };
  return errores[code] || 'Error desconocido, inténtalo de nuevo.';
}




















