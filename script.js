import { auth, db } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    auth.onAuthStateChanged(user => {
        if(user){
            window.location.href = "dashboard.html"; // Redirige al dashboard
        }
    });

    if(registerForm){
        registerForm.addEventListener("submit", e => {
            e.preventDefault();
            const nombre = document.getElementById("regNombre").value;
            const email = document.getElementById("regEmail").value;
            const password = document.getElementById("regPassword").value;

            auth.createUserWithEmailAndPassword(email, password)
                .then(cred => {
                    db.collection("usuarios").doc(cred.user.uid).set({
                        nombre: nombre,
                        email: email
                    });
                    registerForm.reset();
                    alert("Usuario registrado correctamente");
                })
                .catch(err => alert(err.message));
        });
    }

    if(loginForm){
        loginForm.addEventListener("submit", e => {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            auth.signInWithEmailAndPassword(email, password)
                .then(() => loginForm.reset())
                .catch(err => alert(err.message));
        });
    }
});











