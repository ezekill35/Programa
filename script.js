function showRegister() {
  document.querySelector('.card-inner').classList.add('is-flipped');
}

function showLogin() {
  document.querySelector('.card-inner').classList.remove('is-flipped');
}

// Registro
function register() {
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  const errorDiv = document.getElementById("register-error");
  const successDiv = document.getElementById("register-success");

  errorDiv.textContent = "";
  successDiv.textContent = "";

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => successDiv.textContent = "Usuario registrado correctamente")
    .catch(err => errorDiv.textContent = err.message);
}

// Login
function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const errorDiv = document.getElementById("login-error");

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "dashboard.html")
    .catch(err => errorDiv.textContent = err.message);
}



















