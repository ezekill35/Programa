import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

// Formularios
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const msgLogin = document.getElementById('msgLogin');
const msgRegister = document.getElementById('msgRegister');

// Cambiar entre login y registro
document.getElementById('showRegister').addEventListener('click', () => {
  loginForm.style.display = 'none';
  registerForm.style.display = 'flex';
  document.getElementById('formTitle').textContent = "Regístrate";
});

document.getElementById('showLogin').addEventListener('click', () => {
  loginForm.style.display = 'flex';
  registerForm.style.display = 'none';
  document.getElementById('formTitle').textContent = "Inicia sesión";
});

// Login
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    msgLogin.textContent = "Correo o contraseña incorrectos";
  }
});

// Registro
registerForm.addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Guardar datos en Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      nombre: name,
      email: email,
      rol: "usuario",
      fechaRegistro: new Date().toISOString()
    });

    window.location.href = "dashboard.html";
  } catch (error) {
    msgRegister.textContent = error.message;
  }
});















