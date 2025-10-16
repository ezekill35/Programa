import { auth } from './firebase.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("emailLogin");
    const passInput = document.getElementById("passLogin");
    const btnLogin = document.getElementById("btnLogin");
    const mensaje = document.getElementById("mensaje");

    btnLogin.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const pass = passInput.value.trim();

        if(!email || !pass){
            mensaje.style.color = "red";
            mensaje.textContent = "Por favor ingresa correo y contraseña";
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, pass);
            mensaje.style.color = "green";
            mensaje.textContent = "Inicio de sesión correcto, redirigiendo...";
            setTimeout(() => window.location.href = "dashboard.html", 1000);
        } catch (e) {
            mensaje.style.color = "red";
            if(e.code === "auth/user-not-found") mensaje.textContent = "Usuario no registrado";
            else if(e.code === "auth/wrong-password") mensaje.textContent = "Contraseña incorrecta";
            else mensaje.textContent = e.message;
        }
    });

    onAuthStateChanged(auth, user => {
        if(user) window.location.href = "dashboard.html";
    });
});










