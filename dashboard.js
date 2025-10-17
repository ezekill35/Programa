// ===============================
// 🔥 Importar módulos de Firebase
// ===============================
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { auth } from "./firebase.js";
import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { app } from "./firebase.js";

// Inicializa Firestore
const db = getFirestore(app);

// ===============================
// ⚙️ Referencias del DOM
// ===============================
const logoutBtn = document.getElementById("logoutBtn");
const tablaFacturas = document.querySelector("#facturasTable tbody");
const cardFacturas = document.getElementById("cardFacturas");
const cardProveedores = document.getElementById("cardProveedores");
const cardProductos = document.getElementById("cardProductos");

// ===============================
// 🧠 Autenticación de usuario
// ===============================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});

// ===============================
// 🚪 Cerrar sesión
// ===============================
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    alert("No se pudo cerrar sesión 😕");
  }
});

// ===============================
// 📦 Colecciones Firestore
// ===============================
const facturasRef = collection(db, "facturas");
const proveedoresRef = collection(db, "proveedores");
const productosRef = collection(db, "productos");

// ===============================
// 📊 Escuchar Facturas en tiempo real
// ===============================
onSnapshot(facturasRef, (snapshot) => {
  tablaFacturas.innerHTML = ""; // Limpia la tabla antes de volver a llenarla
  let totalFacturas = 0;

  snapshot.forEach((docSnap) => {
    const factura = docSnap.data();
    totalFacturas++;

    const fila = document.createElement("tr");
    fila.classList.add("tabla-fila");

    fila.innerHTML = `
      <td class="fw-bold text-accent">${factura.codigo || "-"}</td>
      <td>${factura.proveedor || "-"}</td>
      <td>${factura.producto || "-"}</td>
      <td class="monto">S/. ${(factura.monto || 0).toFixed(2)}</td>
      <td>${factura.fecha || "-"}</td>
      <td class="acciones">
        <button class="btn-editar" data-id="${docSnap.id}" title="Editar">✏️</button>
        <button class="btn-eliminar" data-id="${docSnap.id}" title="Eliminar">🗑️</button>
      </td>
    `;
    tablaFacturas.appendChild(fila);
  });

  // Actualiza contador de facturas
  cardFacturas.textContent = totalFacturas;
});

// ===============================
// 💼 Escuchar Proveedores y Productos
// ===============================
onSnapshot(proveedoresRef, (snapshot) => {
  cardProveedores.textContent = snapshot.size;
});

onSnapshot(productosRef, (snapshot) => {
  cardProductos.textContent = snapshot.size;
});

// ===============================
// ✏️ Editar Factura
// ===============================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-editar")) {
    const id = e.target.dataset.id;
    const nuevoMonto = prompt("Ingrese el nuevo monto de la factura (ej. 125.75):");

    if (nuevoMonto && !isNaN(nuevoMonto)) {
      const facturaDoc = doc(db, "facturas", id);
      await updateDoc(facturaDoc, { monto: parseFloat(nuevoMonto) });
      alert("✅ Factura actualizada correctamente");
    } else {
      alert("❌ Ingrese un número válido");
    }
  }

  // ===============================
  // 🗑️ Eliminar Factura
  // ===============================
  if (e.target.classList.contains("btn-eliminar")) {
    const id = e.target.dataset.id;
    const confirmacion = confirm("¿Deseas eliminar esta factura?");
    if (confirmacion) {
      await deleteDoc(doc(db, "facturas", id));
      alert("🗑️ Factura eliminada correctamente");
    }
  }
});

// ===============================
// 🧾 Agregar Factura (Ejemplo de uso)
// ===============================
// Puedes llamar a esta función desde un formulario de registro
export async function agregarFactura(datos) {
  try {
    await addDoc(facturasRef, datos);
    alert("Factura registrada correctamente ✅");
  } catch (error) {
    console.error("Error al agregar factura:", error);
  }
}

// ===============================
// 💅 Animaciones visuales suaves
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const filas = document.querySelectorAll(".tabla-fila");
  filas.forEach((fila, index) => {
    fila.style.animationDelay = `${index * 0.05}s`;
    fila.classList.add("fade-in");
  });
});
