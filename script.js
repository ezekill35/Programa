// Configuración de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_ID",
  appId: "TU_APP_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Alternar formularios
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
document.getElementById("show-register").addEventListener("click", () => {
  loginForm.classList.remove("active");
  registerForm.classList.add("active");
});
document.getElementById("show-login").addEventListener("click", () => {
  registerForm.classList.remove("active");
  loginForm.classList.add("active");
});

// Iniciar sesión
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    alert("✅ Inicio de sesión exitoso");
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("❌ Error: " + error.message);
  }
});

// Registrar usuario
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  try {
    await auth.createUserWithEmailAndPassword(email, password);
    alert("✅ Registro exitoso");
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("❌ Error: " + error.message);
  }
});



















