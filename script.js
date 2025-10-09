// Mostrar registro/login
document.getElementById('showRegister').addEventListener('click',()=>{
  document.getElementById('login-box').style.display = 'none';
  document.getElementById('register-box').style.display = 'block';
});
document.getElementById('showLogin').addEventListener('click',()=>{
  document.getElementById('login-box').style.display = 'block';
  document.getElementById('register-box').style.display = 'none';
});

// Registro
document.getElementById('registerForm').addEventListener('submit', e=>{
  e.preventDefault();
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const name = document.getElementById('registerName').value;

  auth.createUserWithEmailAndPassword(email,password)
    .then(userCredential=>{
      var user = userCredential.user;
      db.collection('usuarios').doc(user.uid).set({name,email});
      alert('Usuario registrado correctamente');
      document.getElementById('registerForm').reset();
      document.getElementById('login-box').style.display='block';
      document.getElementById('register-box').style.display='none';
    })
    .catch(err=>alert(err.message));
});

// Login
document.getElementById('loginForm').addEventListener('submit', e=>{
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  auth.signInWithEmailAndPassword(email,password)
    .then(()=>window.location.href='dashboard.html')
    .catch(err=>alert(err.message));
});

// Mantener sesión
auth.onAuthStateChanged(user=>{
  if(user && window.location.pathname.includes('index.html')){
    window.location.href='dashboard.html';
  }
});









