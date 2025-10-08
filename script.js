import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

// Contenedores
const containerLogin = document.getElementById('containerLogin');
const containerRegister = document.getElementById('containerRegister');

// Formularios y mensajes
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const msgLogin = document.getElementById('msgLogin');
const msgRegister = document.getElementById('msgRegister');

// Cambiar a registro
document.getElementById('goRegister').addEventListener('click', () => {
  containerLogin.style.display = 'none';
  containerRegister.style.display = 'block';
});

// Cambiar a login
document.getElementById('goLogin').addEventListener('click', () => {
  containerRegister.style.display = 'none';
  containerLogin.style.display = 'block';
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










