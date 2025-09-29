// Inicializar Firebase (usa tu configuración)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "TU_MESSAGING_ID",
  appId: "TU_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Mostrar/ocultar contraseña
function togglePasswordVisibility(fieldId, iconElement) {
  const input = document.getElementById(fieldId);
  if (input.type === "password") {
    input.type = "text";
    iconElement.classList.replace("fa-eye-slash", "fa-eye");
  } else {
    input.type = "password";
    iconElement.classList.replace("fa-eye", "fa-eye-slash");
  }
}

// Login
function login() {
  const email = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const errorMessage = document.getElementById("login-error");

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "dashboard.html")
    .catch(err => errorMessage.textContent = err.message);
}

















