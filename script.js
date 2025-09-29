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
      db.collection("usuarios").doc(userCredential.user.uid).set({
        email: email,
        creado: new Date()
      });
      setTimeout(() => showLoginForm(), 2000);
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

// -------- UI --------
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

function showRegisterForm() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("register-form").style.display = "block";
}

function showLoginForm() {
  document.getElementById("login-form").style.display = "block";
  document.getElementById("register-form").style.display = "none";
}





















