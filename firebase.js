<!-- Firebase 7.20.0 -->
<script src="https://www.gstatic.com/firebasejs/7.20.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/7.20.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/7.20.0/firebase-firestore.js"></script>

<script>
  // Configuración de Firebase
  var firebaseConfig = {
    apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
    authDomain: "discovery-pets.firebaseapp.com",
    projectId: "discovery-pets",
    storageBucket: "discovery-pets.appspot.com",
    messagingSenderId: "481355972999",
    appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322",
    measurementId: "G-0WMLRY8FGM"
  };
  // Inicializar Firebase
  firebase.initializeApp(firebaseConfig);

  // Referencias globales
  var auth = firebase.auth();
  var db = firebase.firestore();
</script>




















