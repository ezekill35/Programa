// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Config
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.firebasestorage.app",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:a073cc5af230b32f4c5322",
  measurementId: "G-W5RGYVTW3V"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);


