// dashboard.js
import { auth, db } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Elementos menú
const menuProveedor = document.getElementById("menuProveedor");
const menuFactura = document.getElementById("menuFactura");
const menuGastos = document.getElementById("menuGastos");
const menuServicio = document.getElementById("menuServicio");

// Secciones
const seccionProveedor = document.getElementById("seccionProveedor");
const seccionFactura = document.getElementById("seccionFactura");
const seccionGastos = document.getElementById("seccionGastos");
const seccionServicio = document.getElementById("seccionServicio");

// Botón logout
document.getElementById("btnLogout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// Función para cambiar secciones
function mostrarSeccion(seccion) {
  seccionProveedor.classList.add("hidden");
  seccionFactura.classList.add("hidden");
  seccionGastos.classList.add("hidden");
  seccionServicio.classList.add("hidden");
  seccion.classList.remove("hidden");

  // Reset active
  [menuProveedor, menuFactura, menuGastos, menuServicio].forEach(el => el.classList.remove("active"));
}

// Asignar click a menú
menuProveedor.addEventListener("click", () => { mostrarSeccion(seccionProveedor); menuProveedor.classList.add("active"); });
menuFactura.addEventListener("click", () => { mostrarSeccion(seccionFactura); menuFactura.classList.add("active"); });
menuGastos.addEventListener("click", () => { mostrarSeccion(seccionGastos); menuGastos.classList.add("active"); });
menuServicio.addEventListener("click", () => { mostrarSeccion(seccionServicio); menuServicio.classList.add("active"); });

// --- Funciones CRUD ---
async function agregarYMostrar(collectionName, data, tablaId) {
  await addDoc(collection(db, collectionName), data);
  mostrarLista(collectionName, tablaId);
}

async function mostrarLista(collectionName, tablaId) {
  const tabla = document.getElementById(tablaId).querySelector("tbody");
  tabla.innerHTML = "";
  const snapshot = await getDocs(collection(db, collectionName));
  snapshot.forEach(docSnap => {
    const fila = document.createElement("tr");
    const datos = docSnap.data();
    fila.innerHTML = Object.values(datos).map(val => `<td>${val}</td>`).join("") +
                     `<td><button onclick="eliminarDoc('${collectionName}','${docSnap.id}','${tablaId}')">Eliminar</button></td>`;
    tabla.appendChild(fila);
  });
}

window.eliminarDoc = async (collectionName, id, tablaId) => {
  await deleteDoc(doc(db, collectionName, id));
  mostrarLista(collectionName, tablaId);
};

// --- Proveedor ---
document.getElementById("btnAddProveedor").addEventListener("click", async () => {
  const data = {
    RUC: document.getElementById("provRUC").value,
    Nombre: document.getElementById("provNombre").value,
    Direccion: document.getElementById("provDireccion").value
  };
  await agregarYMostrar("proveedores", data, "tablaProveedor");
});

// --- Factura ---
document.getElementById("btnAddFactura").addEventListener("click", async () => {
  const data = {
    RUC: document.getElementById("factRUC").value,
    Tipo: document.getElementById("factTipo").value,
    Descripcion: document.getElementById("factDescripcion").value,
    Fecha: document.getElementById("factFecha").value
  };
  await agregarYMostrar("facturas", data, "tablaFactura");
});

// --- Gastos ---
document.getElementById("btnAddGasto").addEventListener("click", async () => {
  const data = {
    Descripcion: document.getElementById("gastoDescripcion").value,
    Monto: document.getElementById("gastoMonto").value
  };
  await agregarYMostrar("gastos", data, "tablaGasto");
});

// --- Servicio ---
document.getElementById("btnAddServicio").addEventListener("click", async () => {
  const data = {
    Descripcion: document.getElementById("servDescripcion").value,
    Monto: document.getElementById("servMonto").value
  };
  await agregarYMostrar("servicios", data, "tablaServicio");
});

// Inicializar listas al cargar
mostrarLista("proveedores", "tablaProveedor");
mostrarLista("facturas", "tablaFactura");
mostrarLista("gastos", "tablaGasto");
mostrarLista("servicios", "tablaServicio");





