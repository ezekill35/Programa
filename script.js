import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

// Formularios y mensajes
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const msgLogin = document.getElementById('msgLogin');
const msgRegister = document.getElementById('msgRegister');

// Cambiar de Login a Registro
document.getElementById('showRegister').addEventListener('click', () => {
  loginForm.style.display = 'none';
  registerForm.style.display = 'flex';
  document.getElementById('formTitle').textContent = "Regístrate";
});

// Cambiar de Registro a Login
document.getElementById('showLogin').addEventListener('click', () => {
  registerForm.style.display = 'none';
  loginForm.style.display = 'flex';
  document.getElementById('formTitle').textContent = "Inicia sesión";
});

// LOGIN
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

// REGISTRO
registerForm.addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Guardar usuario en Firestore
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















