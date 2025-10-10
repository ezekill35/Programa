import { auth } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById("formLogin");
    const formRegister = document.getElementById("formRegister");
    const toRegister = document.getElementById("toRegister");
    const toLogin = document.getElementById("toLogin");
    const mensaje = document.getElementById("mensaje");

    // Cambiar entre login y registro
    toRegister.addEventListener("click", () => {
        formLogin.style.display = "none";
        formRegister.style.display = "block";
        mensaje.textContent = "";
    });
    toLogin.addEventListener("click", () => {
        formRegister.style.display = "none";
        formLogin.style.display = "block";
        mensaje.textContent = "";
    });

    // Registro
    document.getElementById("btnRegister").addEventListener("click", async () => {
        const email = document.getElementById("emailReg").value;
        const pass = document.getElementById("passReg").value;
        try {
            await createUserWithEmailAndPassword(auth, email, pass);
            mensaje.style.color = "green";
            mensaje.textContent = "Registro exitoso, redirigiendo...";
        } catch (e) {
            mensaje.style.color = "red";
            mensaje.textContent = e.message;
        }
    });

    // Login
    document.getElementById("btnLogin").addEventListener("click", async () => {
        const email = document.getElementById("emailLogin").value;
        const pass = document.getElementById("passLogin").value;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            mensaje.style.color = "green";
            mensaje.textContent = "Inicio de sesión correcto, redirigiendo...";
        } catch (e) {
            mensaje.style.color = "red";
            mensaje.textContent = e.message;
        }
    });

    // Mantener sesión activa y redirigir
    onAuthStateChanged(auth, user => {
        if (user) {
            // Usuario logueado → ir al dashboard
            window.location.href = "dashboard.html";
        } else {
            // Usuario no logueado → quedarse en login
            window.location.href = "index.html";
        }
    });
});









