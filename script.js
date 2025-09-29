// -----------------------------
// CONFIGURACIÓN FIREBASE
// -----------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:a073cc5af230b32f4c5322",
  measurementId: "G-W5RGYVTW3V"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// -----------------------------
// FUNCIONES LOGIN / REGISTRO
// -----------------------------

// Mostrar registro
function showRegister() {
  document.getElementById('card-inner').classList.add('show-register');
}

// Mostrar login
function showLogin() {
  document.getElementById('card-inner').classList.remove('show-register');
}

// Login
function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorDiv = document.getElementById('login-error');
  errorDiv.textContent = "";

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      // Redirigir al dashboard
      window.location.href = "dashboard.html";
    })
    .catch(err => {
      errorDiv.textContent = err.message;
    });
}

// Registro
function register() {
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const errorDiv = document.getElementById('register-error');
  const successDiv = document.getElementById('register-success');
  errorDiv.textContent = "";
  successDiv.textContent = "";

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      successDiv.textContent = "Usuario registrado correctamente. Ahora puede iniciar sesión.";
      document.getElementById('reg-email').value = "";
      document.getElementById('reg-password').value = "";
      setTimeout(showLogin, 2000);
    })
    .catch(err => {
      errorDiv.textContent = err.message;
    });
}

// Verificar sesión activa
auth.onAuthStateChanged(user => {
  if (user && window.location.pathname.endsWith("index.html")) {
    // Usuario ya logueado, redirigir al dashboard
    window.location.href = "dashboard.html";
  }
});




















