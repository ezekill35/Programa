// ================== FIREBASE CONFIG ==================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:abcd1234efgh5678"
};

// Inicialización
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ================== COLECCIONES ==================
const colFacturas = collection(db, "facturas");
const colProveedores = collection(db, "proveedores");
const colProductos = collection(db, "productos");

// ================== ELEMENTOS DEL DOM ==================
const facturasCount = document.getElementById("facturasCount");
const proveedoresCount = document.getElementById("proveedoresCount");
const productosCount = document.getElementById("productosCount");
const facturasTable = document.querySelector("#facturasTable tbody");

// ================== ACTUALIZAR CONTADORES ==================
function actualizarContadores() {
  // Facturas
  onSnapshot(colFacturas, (snapshot) => {
    facturasCount.textContent = snapshot.size;
  });

  // Proveedores
  onSnapshot(colProveedores, (snapshot) => {
    proveedoresCount.textContent = snapshot.size;
  });

  // Productos
  onSnapshot(colProductos, (snapshot) => {
    productosCount.textContent = snapshot.size;
  });
}

// ================== CARGAR TABLA DE FACTURAS ==================
function cargarFacturas() {
  onSnapshot(colFacturas, (snapshot) => {
    facturasTable.innerHTML = "";
    if (snapshot.empty) {
      facturasTable.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted">No hay facturas registradas</td>
        </tr>`;
      return;
    }

    snapshot.forEach((docu) => {
      const f = docu.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${f.idFactura || "-"}</td>
        <td>${f.proveedor || "-"}</td>
        <td>${f.producto || "-"}</td>
        <td>S/. ${f.monto ? f.monto.toFixed(2) : "0.00"}</td>
        <td>${f.fecha || "-"}</td>
      `;
      facturasTable.appendChild(tr);
    });
  });
}

// ================== CERRAR SESIÓN (opcional) ==================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}

// ================== INICIALIZAR ==================
document.addEventListener("DOMContentLoaded", () => {
  actualizarContadores();
  cargarFacturas();
});
