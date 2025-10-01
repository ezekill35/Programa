// Cambiar entre login y registro
function toggleForms(type) {
  document.getElementById("login-form").style.display = 
    (type === "login") ? "block" : "none";
  document.getElementById("register-form").style.display = 
    (type === "register") ? "block" : "none";
}

// Login
function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      alert("✅ Bienvenido: " + userCredential.user.email);
      window.location.href = "dashboard.html"; // Redirige
    })
    .catch(error => {
      document.getElementById("login-error").innerText = error.message;
    });
}

// Registro
function register() {
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      document.getElementById("register-success").innerText =
        "✅ Usuario creado: " + userCredential.user.email;
      document.getElementById("register-error").innerText = "";
    })
    .catch(error => {
      document.getElementById("register-error").innerText = error.message;
    });
}
















