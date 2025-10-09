import { auth } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById("formLogin");
    const formRegister = document.getElementById("formRegister");
    const toRegister = document.getElementById("toRegister");
    const toLogin = document.getElementById("toLogin");
    const mensaje = document.getElementById("mensaje");

    toRegister.addEventListener("click", () => {
        formLogin.style.display = "none";
        formRegister.style.display = "block";
    });

    toLogin.addEventListener("click", () => {
        formRegister.style.display = "none";
        formLogin.style.display = "block";
    });

    document.getElementById("btnRegister").addEventListener("click", async () => {
        const email = document.getElementById("emailReg").value;
        const pass = document.getElementById("passReg").value;
        try {
            await createUserWithEmailAndPassword(auth, email, pass);
            mensaje.style.color = "green";
            mensaje.textContent = "Registro exitoso, redirigiendo...";
            setTimeout(() => window.location.href = "dashboard.html", 1000);
        } catch (e) {
            mensaje.style.color = "red";
            mensaje.textContent = e.message;
        }
    });

    document.getElementById("btnLogin").addEventListener("click", async () => {
        const email = document.getElementById("emailLogin").value;
        const pass = document.getElementById("passLogin").value;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            mensaje.style.color = "green";
            mensaje.textContent = "Inicio de sesión correcto, redirigiendo...";
            setTimeout(() => window.location.href = "dashboard.html", 1000);
        } catch (e) {
            mensaje.style.color = "red";
            mensaje.textContent = e.message;
        }
    });

    // Mantener sesión activa
    onAuthStateChanged(auth, user => {
        if (user) window.location.href = "dashboard.html";
    });
});









