// script.js

const loginForm = document.getElementById('loginForm');
const msgLogin = document.getElementById('msgLogin');

// Simulación de login (puedes integrar Firebase Auth luego)
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Validación simple (ejemplo)
  if(email === "admin@discoverypets.com" && password === "123456") {
    msgLogin.textContent = "";
    // Redirigir al dashboard
    window.location.href = "dashboard.html";
  } else {
    msgLogin.textContent = "Correo o contraseña incorrectos";
  }
});













