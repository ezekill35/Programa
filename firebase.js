// ==============================================
// Configuración de Firebase para Discovery Pets
// ==============================================
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com", // corregido
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:a073cc5af230b32f4c5322",
  measurementId: "G-W5RGYVTW3V"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Servicios principales
const auth = firebase.auth();      // para login/registro
const db = firebase.firestore();   // para datos del negocio

