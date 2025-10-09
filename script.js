// Cambiar vistas
document.getElementById('showRegister').addEventListener('click', function(){
  document.getElementById('loginDiv').style.display='none';
  document.getElementById('registerDiv').style.display='block';
});
document.getElementById('showLogin').addEventListener('click', function(){
  document.getElementById('registerDiv').style.display='none';
  document.getElementById('loginDiv').style.display='block';
});

// Registro
document.getElementById('registerBtn').addEventListener('click', function(){
  var name = document.getElementById('regName').value;
  var email = document.getElementById('regEmail').value;
  var pass = document.getElementById('regPass').value;

  if(name && email && pass){
    auth.createUserWithEmailAndPassword(email, pass)
      .then(userCred=>{
        db.collection('usuarios').doc(userCred.user.uid).set({nombre:name, email:email});
        alert('Usuario registrado!');
        document.getElementById('registerDiv').style.display='none';
        document.getElementById('loginDiv').style.display='block';
      })
      .catch(err=> alert(err.message));
  } else alert('Complete todos los campos');
});

// Login
document.getElementById('loginBtn').addEventListener('click', function(){
  var email = document.getElementById('loginEmail').value;
  var pass = document.getElementById('loginPass').value;

  if(email && pass){
    auth.signInWithEmailAndPassword(email, pass)
      .then(()=> window.location='dashboard.html')
      .catch(err=> alert(err.message));
  } else alert('Complete todos los campos');
});

// Mantener sesión activa
auth.onAuthStateChanged(user=>{
  if(user && window.location.pathname.endsWith('index.html')){
    window.location='dashboard.html';
  }
});










