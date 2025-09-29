// ==============================================
// Firebase
// ==============================================
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:a073cc5af230b32f4c5322",
  measurementId: "G-W5RGYVTW3V"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ================= LOGIN =================
function login() {
  const email = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const errorMessage = document.getElementById("login-error");
  errorMessage.textContent = "";

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "dashboard.html")
    .catch(err => errorMessage.textContent = err.message);
}

// ================= REGISTRO =================
function register() {
  const email = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;
  const errorMessage = document.getElementById("register-error");
  const successMessage = document.getElementById("register-success");

  errorMessage.textContent = "";
  successMessage.textContent = "";

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      successMessage.textContent = "✅ Usuario registrado correctamente";
      setTimeout(() => flipCard(), 2000);
      // Guardar datos opcional en Firestore
      db.collection("usuarios").doc(userCredential.user.uid).set({
        email: email,
        creado: new Date()
      });
    })
    .catch(err => errorMessage.textContent = err.message);
}

// ================= UI =================
function flipCard() {
  document.getElementById("auth-card-inner").classList.toggle("is-flipped");
}

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








