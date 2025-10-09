import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

showRegister.addEventListener("click", ()=> {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
});

showLogin.addEventListener("click", ()=> {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
});

// Registro
if(registerForm){
    registerForm.addEventListener("submit", async e => {
        e.preventDefault();
        const nombre = document.getElementById("regNombre").value;
        const email = document.getElementById("regEmail").value;
        const password = document.getElementById("regPassword").value;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth,email,password);
            await addDoc(collection(db,"usuarios"),{
                uid: userCredential.user.uid,
                nombre,
                email
            });
            registerForm.reset();
            alert("Usuario registrado correctamente");
        } catch(err){
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
        try{
            await signInWithEmailAndPassword(auth,email,password);
            loginForm.reset();
            window.location.href = "dashboard.html";
        } catch(err){
            alert(err.message);
        }
    });
}











