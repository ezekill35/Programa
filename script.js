// Inicializar Firebase
var firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322"
};
firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();
var db = firebase.firestore();

// Mostrar formulario de registro
document.getElementById("showRegister").addEventListener("click", ()=>{
  document.getElementById("loginDiv").style.display="none";
  document.getElementById("registerDiv").style.display="block";
});

// Mostrar formulario de login
document.getElementById("showLogin").addEventListener("click", ()=>{
  document.getElementById("registerDiv").style.display="none";
  document.getElementById("loginDiv").style.display="block";
});

// Registro de usuario
document.getElementById("btnRegister").addEventListener("click", ()=>{
  var name = document.getElementById("registerName").value;
  var email = document.getElementById("registerEmail").value;
  var pass = document.getElementById("registerPass").value;

  if(name && email && pass){
    auth.createUserWithEmailAndPassword(email, pass)
      .then(userCred=>{
        var uid = userCred.user.uid;
        db.collection("usuarios").doc(uid).set({nombre:name,email:email});
        alert("Usuario registrado exitosamente");
        document.getElementById("registerDiv").style.display="none";
        document.getElementById("loginDiv").style.display="block";
      })
      .catch(err=>alert(err.message));
  }else{
    alert("Completa todos los campos");
  }
});

// Login de usuario
document.getElementById("btnLogin").addEventListener("click", ()=>{
  var email = document.getElementById("loginEmail").value;
  var pass = document.getElementById("loginPass").value;

  if(email && pass){
    auth.signInWithEmailAndPassword(email, pass)
      .then(()=> window.location.href="dashboard.html")
      .catch(err=> alert(err.message));
  }else{
    alert("Completa todos los campos");
  }
});

// Mantener sesión activa
auth.onAuthStateChanged(user=>{
  if(user && window.location.pathname.includes("index.html")){
    window.location.href="dashboard.html";
  }
});









