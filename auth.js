// auth.js
import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// Registrar usuario
export const registerUser = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        alert("Registro exitoso!");
        return userCredential.user;
    } catch (error) {
        alert("Error en registro: " + error.message);
    }
};

// Login
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        alert("Inicio de sesión correcto!");
        return userCredential.user;
    } catch (error) {
        alert("Error al iniciar sesión: " + error.message);
    }
};

// Logout
export const logoutUser = async () => {
    try {
        await signOut(auth);
        alert("Sesión cerrada correctamente");
        window.location.href = "index.html";
    } catch (error) {
        alert("Error al cerrar sesión: " + error.message);
    }
};
