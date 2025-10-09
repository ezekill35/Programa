// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Configuración Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
    authDomain: "discovery-pets.firebaseapp.com",
    projectId: "discovery-pets",
    storageBucket: "discovery-pets.appspot.com",
    messagingSenderId: "481355972999",
    appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322",
    measurementId: "G-0WMLRY8FGM"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Capturamos elementos del DOM
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const logoutBtn = document.getElementById("logoutBtn");

// Mantener sesión iniciada
onAuthStateChanged(auth, user => {
    if(user){
        document.body.classList.remove("login-body");
        document.body.classList.add("dashboard-body");
        document.querySelector(".main-content").style.display = "block";
    } else {
        document.body.classList.remove("dashboard-body");
        document.body.classList.add("login-body");
        document.querySelector(".main-content").style.display = "none";
    }
});

// Registro
if(registerForm){
    registerForm.addEventListener("submit", async e => {
        e.preventDefault();
        const nombre = document.getElementById("regNombre").value;
        const email = document.getElementById("regEmail").value;
        const password = document.getElementById("regPassword").value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, "usuarios", user.uid), {
                nombre: nombre,
                email: email
            });
            registerForm.reset();
            alert("Usuario registrado correctamente");
        } catch(err) {
            alert(err.message);
        }
    });
}

// Login
if(loginForm){
    loginForm.addEventListener("submit", async e => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            loginForm.reset();
        } catch(err) {
            alert(err.message);
        }
    });
}

// Logout
if(logoutBtn){
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
        } catch(err){
            alert(err.message);
        }
    });
}








