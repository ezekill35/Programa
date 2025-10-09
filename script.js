document.addEventListener('DOMContentLoaded', () => {
  const loginContainer = document.getElementById('login-container');
  const registerContainer = document.getElementById('register-container');

  document.getElementById('showRegister').addEventListener('click', () => {
    loginContainer.style.display = 'none';
    registerContainer.style.display = 'block';
  });

  document.getElementById('showLogin').addEventListener('click', () => {
    registerContainer.style.display = 'none';
    loginContainer.style.display = 'block';
  });

  // Registro
  document.getElementById('registerForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const pass = document.getElementById('registerPass').value;

    auth.createUserWithEmailAndPassword(email, pass)
      .then(userCredential => {
        const user = userCredential.user;
        db.collection('usuarios').doc(user.uid).set({ nombre: name, email: email });
        alert('Usuario registrado correctamente');
        registerContainer.style.display = 'none';
        loginContainer.style.display = 'block';
      })
      .catch(error => alert(error.message));
  });

  // Login
  document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;

    auth.signInWithEmailAndPassword(email, pass)
      .then(() => window.location.href = 'dashboard.html')
      .catch(error => alert(error.message));
  });

  // Mantener sesión iniciada
  auth.onAuthStateChanged(user => {
    if (user && window.location.pathname.endsWith('dashboard.html')) {
      console.log('Usuario logueado:', user.email);
    } else if (!user && window.location.pathname.endsWith('dashboard.html')) {
      window.location.href = 'index.html';
    }
  });
});






