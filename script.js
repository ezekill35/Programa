// Navegación Login <-> Registro
const loginDiv = document.getElementById('loginDiv');
const registerDiv = document.getElementById('registerDiv');

document.getElementById('showRegister').addEventListener('click', e=>{
  e.preventDefault();
  loginDiv.style.display='none';
  registerDiv.style.display='block';
});

document.getElementById('showLogin').addEventListener('click', e=>{
  e.preventDefault();
  loginDiv.style.display='block';
  registerDiv.style.display='none';
});

// Registro
document.getElementById('registerForm').addEventListener('submit', e=>{
  e.preventDefault();
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  auth.createUserWithEmailAndPassword(email,password)
    .then(userCredential=>{
      return userCredential.user.updateProfile({displayName:name});
    })
    .then(()=>{
      document.getElementById('registerMsg').style.color='green';
      document.getElementById('registerMsg').textContent='Registrado correctamente';
      registerDiv.style.display='none';
      loginDiv.style.display='block';
    })
    .catch(err=>{
      document.getElementById('registerMsg').style.color='red';
      document.getElementById('registerMsg').textContent=err.message;
    });
});

// Login
document.getElementById('loginForm').addEventListener('submit', e=>{
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  auth.signInWithEmailAndPassword(email,password)
    .then(()=>{
      window.location.href='dashboard.html';
    })
    .catch(err=>{
      document.getElementById('loginMsg').textContent=err.message;
    });
});

// Mantener sesión activa
auth.onAuthStateChanged(user=>{
  if(user && window.location.pathname.includes('index.html')){
    window.location.href='dashboard.html';
  }
});







