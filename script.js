// -------- Registro --------
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
      setTimeout(() => toggleAuthForm(true), 2000);

      // Opcional: guardar datos en Firestore
      db.collection("usuarios").doc(userCredential.user.uid).set({
        email: email,
        creado: new Date()
      });
    })
    .catch(err => errorMessage.textContent = err.message);
}

// -------- Login --------
function login() {
  const email = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const errorMessage = document.getElementById("login-error");

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "dashboard.html")
    .catch(err => errorMessage.textContent = err.message);
}

// -------- Logout --------
function logout() {
  auth.signOut().then(() => window.location.href = "index.html");
}

// -------- UI --------
function toggleAuthForm(forceLogin = false) {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (forceLogin || loginForm.style.display === "none") {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
  } else {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
  }
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

// -------- Dashboard --------
function initializeDashboard() {
  console.log("✅ Dashboard cargado para:", auth.currentUser.email);
}

function showSection(section) {
  document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(section + "-section").classList.add("active");
  document.getElementById("dashboard-title").textContent =
    section.charAt(0).toUpperCase() + section.slice(1);
}
// -------- Registro --------
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
      setTimeout(() => toggleAuthForm(true), 2000);

      // Opcional: guardar datos en Firestore
      db.collection("usuarios").doc(userCredential.user.uid).set({
        email: email,
        creado: new Date()
      });
    })
    .catch(err => errorMessage.textContent = err.message);
}

// -------- Login --------
function login() {
  const email = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const errorMessage = document.getElementById("login-error");

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "dashboard.html")
    .catch(err => errorMessage.textContent = err.message);
}

// -------- Logout --------
function logout() {
  auth.signOut().then(() => window.location.href = "index.html");
}

// -------- UI --------
function toggleAuthForm(forceLogin = false) {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (forceLogin || loginForm.style.display === "none") {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
  } else {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
  }
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

// -------- Dashboard --------
function initializeDashboard() {
  console.log("✅ Dashboard cargado para:", auth.currentUser.email);
}

function showSection(section) {
  document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(section + "-section").classList.add("active");
  document.getElementById("dashboard-title").textContent =
    section.charAt(0).toUpperCase() + section.slice(1);
}
