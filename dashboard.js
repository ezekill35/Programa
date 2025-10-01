// Importar Firebase (asegúrate de tener firebase.js con tu configuración)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Configuración Firebase (reemplazar con tu firebase.js si lo tienes)
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:a073cc5af230b32f4c5322",
  measurementId: "G-W5RGYVTW3V"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ==========================
// 📌 FUNCIONES GENERALES
// ==========================

// Cargar datos en tabla
async function cargarDatos(coleccion, tablaId) {
  const tabla = document.getElementById(tablaId);
  tabla.innerHTML = ""; // Limpiar

  const snapshot = await getDocs(collection(db, coleccion));
  snapshot.forEach((doc) => {
    const data = doc.data();
    let fila = "<tr>";

    Object.values(data).forEach(valor => {
      fila += `<td>${valor}</td>`;
    });

    fila += `<td><button onclick="eliminarRegistro('${coleccion}','${doc.id}')">❌ Eliminar</button></td>`;
    fila += "</tr>";
    tabla.innerHTML += fila;
  });
}

// Eliminar un registro
async function eliminarRegistro(coleccion, id) {
  await deleteDoc(doc(db, coleccion, id));
  alert("Registro eliminado ✅");
  cargarTodo(); // Recargar tablas
}

// ==========================
// 📌 CARGAR TODAS LAS TABLAS
// ==========================
async function cargarTodo() {
  await cargarDatos("proveedores", "tablaProveedores");
  await cargarDatos("facturas", "tablaFacturas");
  await cargarDatos("servicios", "tablaServicios");
  await cargarDatos("ventas", "tablaVentas");
  await cargarDatos("gastos", "tablaGastos");
}

// ==========================
// 📌 LOGOUT
// ==========================
document.getElementById("btnLogout").addEventListener("click", async () => {
  await signOut(auth);
  alert("Sesión cerrada correctamente ✅");
  window.location.href = "index.html"; // Volver al login
});

// ==========================
// 📌 BUSCADORES
// ==========================
function activarBuscador(inputId, tablaId) {
  const input = document.getElementById(inputId);
  input.addEventListener("keyup", () => {
    const filtro = input.value.toLowerCase();
    const filas = document.querySelectorAll(`#${tablaId} tr`);
    filas.forEach(fila => {
      const texto = fila.innerText.toLowerCase();
      fila.style.display = texto.includes(filtro) ? "" : "none";
    });
  });
}

activarBuscador("buscarProveedores", "tablaProveedores");
activarBuscador("buscarFacturas", "tablaFacturas");
activarBuscador("buscarServicios", "tablaServicios");
activarBuscador("buscarVentas", "tablaVentas");
activarBuscador("buscarGastos", "tablaGastos");

// ==========================
// 📌 EJECUTAR
// ==========================
cargarTodo();

// Exponer eliminarRegistro al scope global
window.eliminarRegistro = eliminarRegistro;


