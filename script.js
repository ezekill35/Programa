import { auth } from './firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.16.5/firebase-auth.js";

const loginDiv = document.getElementById('loginDiv');
const registerDiv = document.getElementById('registerDiv');

const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

const loginMsg = document.getElementById('loginMsg');
const registerMsg = document.getElementById('registerMsg');

showRegister.addEventListener('click', e => {
  e.preventDefault();
  loginDiv.style.display = 'none';
  registerDiv.style.display = 'block';
  loginMsg.textContent = '';
  registerMsg.textContent = '';
});

showLogin.addEventListener('click', e => {
  e.preventDefault();
  loginDiv.style.display = 'block';
  registerDiv.style.display = 'none';
  loginMsg.textContent = '';
  registerMsg.textContent = '';
});

// Registro
registerForm.addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    registerMsg.style.color = 'green';
    registerMsg.textContent = 'Registrado correctamente. Redirigiendo...';
    registerForm.reset();
  } catch(err) {
    registerMsg.style.color = 'red';
    registerMsg.textContent = err.message;
  }
});

// Login
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginMsg.style.color = 'green';
    loginMsg.textContent = 'Inicio de sesión exitoso. Redirigiendo...';
    loginForm.reset();
  } catch(err) {
    loginMsg.style.color = 'red';
    loginMsg.textContent = err.message;
  }
});

// Mantener sesión activa
onAuthStateChanged(auth, user => {
  if(user) window.location.href = 'dashboard.html';
  else {
    loginDiv.style.display = 'block';
    registerDiv.style.display = 'none';
  }
});








