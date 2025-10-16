import { auth } from './firebase.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const mensaje = document.getElementById("mensaje");

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

    onAuthStateChanged(auth, user => {
        const currentPage = window.location.pathname.split("/").pop();
        if(user && currentPage === "index.html") window.location.href = "dashboard.html";
    });
});












