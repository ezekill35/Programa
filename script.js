import { auth } from './firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const loginDiv = document.getElementById('loginDiv');
const registerDiv = document.getElementById('registerDiv');

document.getElementById('showRegister').addEventListener('click', e => {
  e.preventDefault();
  loginDiv.style.display = 'none';
  registerDiv.style.display = 'block';
});

document.getElementById('showLogin').addEventListener('click', e => {
  e.preventDefault();
  loginDiv.style.display = 'block';
  registerDiv.style.display = 'none';
});

// Registro
document.getElementById('registerForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    document.getElementById('registerMsg').style.color = 'green';
    document.getElementById('registerMsg').textContent = 'Registrado correctamente. Redirigiendo...';
    registerForm.reset();
  } catch(err) {
    document.getElementById('registerMsg').style.color = 'red';
    document.getElementById('registerMsg').textContent = err.message;
  }
});

// Login
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById('loginMsg').style.color = 'green';
    document.getElementById('loginMsg').textContent = 'Inicio de sesión exitoso. Redirigiendo...';
  } catch(err) {
    document.getElementById('loginMsg').style.color = 'red';
    document.getElementById('loginMsg').textContent = err.message;
  }
});

// Mantener sesión activa
onAuthStateChanged(auth, user => {
  if(user) window.location.href = 'dashboard.html';
});






