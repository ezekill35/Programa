// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.16.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.16.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.16.5/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322",
  measurementId: "G-0WMLRY8FGM"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };



















