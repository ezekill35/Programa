const cardInner = document.getElementById('card-inner');

function showRegister() {
  cardInner.classList.add('is-flipped');
}
function showLogin() {
  cardInner.classList.remove('is-flipped');
}

// LOGIN
function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "dashboard.html")
    .catch(err => {
      document.getElementById("login-error").innerText = err.message;
    });
}

// REGISTRO
function register() {
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("register-success").innerText = "Usuario registrado correctamente";
      document.getElementById("register-error").innerText = "";
    })
    .catch(err => {
      document.getElementById("register-error").innerText = err.message;
      document.getElementById("register-success").innerText = "";
    });
}




















