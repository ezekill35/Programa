// Mostrar/ocultar login y registro
document.getElementById('showRegister').addEventListener('click', e=>{
  e.preventDefault();
  document.getElementById('loginDiv').style.display='none';
  document.getElementById('registerDiv').style.display='block';
});

document.getElementById('showLogin').addEventListener('click', e=>{
  e.preventDefault();
  document.getElementById('loginDiv').style.display='block';
  document.getElementById('registerDiv').style.display='none';
});

// LOGIN
document.getElementById('loginForm').addEventListener('submit', function(e){
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPass').value;

  auth.signInWithEmailAndPassword(email, pass)
      .then(user => window.location = 'dashboard.html')
      .catch(err => alert(err.message));
});

// REGISTRO
document.getElementById('registerForm').addEventListener('submit', function(e){
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const pass = document.getElementById('regPass').value;

  auth.createUserWithEmailAndPassword(email, pass)
      .then(user => {
        db.collection('usuarios').doc(user.user.uid).set({ nombre: name });
        alert("Usuario registrado");
        document.getElementById('loginDiv').style.display='block';
        document.getElementById('registerDiv').style.display='none';
      })
      .catch(err => alert(err.message));
});









