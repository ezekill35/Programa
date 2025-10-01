// Configuración Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_ID",
  appId: "TU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Cambiar entre login y registro
document.getElementById("show-register").addEventListener("click", () => {
  document.getElementById("login-box").classList.remove("active");
  document.getElementById("register-box").classList.add("active");
});

document.getElementById("show-login").addEventListener("click", () => {
  document.getElementById("register-box").classList.remove("active");
  document.getElementById("login-box").classList.add("active");
});

// Login
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "dashboard.html")
    .catch(err => alert("⚠️ Error: " + err.message));
});

// Registro
document.getElementById("register-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => window.location.href = "dashboard.html")
    .catch(err => alert("⚠️ Error: " + err.message));
});


















