import { auth } from './firebase.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("emailLogin");
    const passInput = document.getElementById("passLogin");
    const btnLogin = document.getElementById("btnLogin");
    const mensaje = document.getElementById("mensaje");

    btnLogin.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const password = passInput.value;

        if(!email || !password) {
            mensaje.textContent = "Por favor, completa todos los campos.";
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            mensaje.style.color = "green";
            mensaje.textContent = "Inicio de sesión correcto, redirigiendo...";
            setTimeout(() => window.location.href = "dashboard.html", 1000);
        } catch (error) {
            mensaje.style.color = "red";
            // Mensaje más amigable
            if(error.code === "auth/user-not-found") mensaje.textContent = "Usuario no encontrado.";
            else if(error.code === "auth/wrong-password") mensaje.textContent = "Contraseña incorrecta.";
            else mensaje.textContent = error.message;
        }
    });

    // Redirige si ya está logueado
    onAuthStateChanged(auth, user => {
        if(user) window.location.href = "dashboard.html";
    });
});










