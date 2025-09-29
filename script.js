// Mostrar registro / login
function showRegister() {
  document.getElementById("card-inner").classList.add("show-register");
}
function showLogin() {
  document.getElementById("card-inner").classList.remove("show-register");
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

// Registro
function register() {
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  const errorDiv = document.getElementById("register-error");
  const successDiv = document.getElementById("register-success");

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      successDiv.textContent = "Registro exitoso, ya puedes iniciar sesión";
      errorDiv.textContent = "";
    })
    .catch(err => {
      errorDiv.textContent = err.message;
      successDiv.textContent = "";
    });
}


















