// Cambiar vistas
const loginDiv = document.getElementById('loginDiv');
const registerDiv = document.getElementById('registerDiv');

document.getElementById('showRegister').addEventListener('click', e => {
  e.preventDefault();
  loginDiv.style.display = 'none';
  registerDiv.style.display = 'block';
});

document.getElementById('showLogin').addEventListener('click', e => {
  e.preventDefault();
  loginDiv.style.display = 'block';
  registerDiv.style.display = 'none';
});

// Registrar usuario
document.getElementById('registerForm').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('regEmail').value;
  const pass = document.getElementById('regPass').value;
  const name = document.getElementById('regName').value;

  auth.createUserWithEmailAndPassword(email, pass)
    .then(userCred => {
      // Guardar info adicional en Firestore
      return db.collection('usuarios').doc(userCred.user.uid).set({ nombre: name, email });
    })
    .then(() => {
      alert("Usuario registrado con éxito");
      registerDiv.style.display = 'none';
      loginDiv.style.display = 'block';
    })
    .catch(err => alert(err.message));
});

// Iniciar sesión
document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPass').value;

  auth.signInWithEmailAndPassword(email, pass)
    .then(() => {
      window.location = 'dashboard.html';
    })
    .catch(err => alert(err.message));
});

// Mantener sesión iniciada
auth.onAuthStateChanged(user => {
  if(user){
    window.location = 'dashboard.html';
  }
});








