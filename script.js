document.addEventListener('DOMContentLoaded', () => {

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const showRegister = document.getElementById('showRegister');
  const showLogin = document.getElementById('showLogin');
  const loginSection = document.getElementById('loginSection');
  const registerSection = document.getElementById('registerSection');

  // Cambiar entre login y registro
  showRegister.addEventListener('click', e => {
    e.preventDefault();
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
  });
  showLogin.addEventListener('click', e => {
    e.preventDefault();
    loginSection.style.display = 'block';
    registerSection.style.display = 'none';
  });

  // Registro
  registerForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;

    auth.createUserWithEmailAndPassword(email, pass)
      .then(userCredential => {
        db.collection('usuarios').doc(userCredential.user.uid).set({ name, email });
        alert('Usuario registrado correctamente');
        registerForm.reset();
        registerSection.style.display = 'none';
        loginSection.style.display = 'block';
      })
      .catch(err => alert(err.message));
  });

  // Login
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;

    auth.signInWithEmailAndPassword(email, pass)
      .then(() => window.location = 'dashboard.html')
      .catch(err => alert(err.message));
  });

  // Mantener sesión
  auth.onAuthStateChanged(user => {
    if (user && window.location.pathname.includes('index.html')) {
      window.location = 'dashboard.html';
    }
  });

});









