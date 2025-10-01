import { auth, db } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Menú y secciones
const menuItems = {
  Proveedor: document.getElementById("menuProveedor"),
  Factura: document.getElementById("menuFactura"),
  Gasto: document.getElementById("menuGasto"),
  Servicio: document.getElementById("menuServicio"),
};

const secciones = {
  Proveedor: document.getElementById("seccionProveedor"),
  Factura: document.getElementById("seccionFactura"),
  Gasto: document.getElementById("seccionGasto"),
  Servicio: document.getElementById("seccionServicio"),
};

// Cambiar sección activa
Object.keys(menuItems).forEach(key => {
  menuItems[key].addEventListener("click", () => {
    Object.values(secciones).forEach(sec => sec.classList.add("hidden"));
    Object.values(menuItems).forEach(item => item.style.background = "");
    secciones[key].classList.remove("hidden");
    menuItems[key].style.background = "#1abc9c";
  });
});

// Cerrar sesión
document.getElementById("btnLogout").addEventListener("click", () => {
  signOut(auth).then(() => window.location.href = "index.html");
});

// Función para agregar y mostrar documentos
async function agregarYMostrar(collectionName, data, tablaID) {
  await addDoc(collection(db, collectionName), data);
  cargarTabla(collectionName, tablaID);
}

// Cargar tabla
async function cargarTabla(collectionName, tablaID) {
  const tabla = document.getElementById(tablaID);
  tabla.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, collectionName));
  querySnapshot.forEach(docu => {
    const data = docu.data();
    const row = document.createElement("tr");

    if (collectionName === "proveedor") {
      row.innerHTML = `
        <td>${data.ruc}</td>
        <td>${data.nombre}</td>
        <td>${data.direccion}</td>
        <td><button onclick="eliminarDoc('${collectionName}','${docu.id}')">Eliminar</button></td>`;
    } else if (collectionName === "factura") {
      row.innerHTML = `
        <td>${data.ruc}</td>
        <td>${data.proveedor}</td>
        <td>${data.descripcion}</td>
        <td>${data.fecha}</td>
        <td><button onclick="eliminarDoc('${collectionName}','${docu.id}')">Eliminar</button></td>`;
    } else if (collectionName === "gasto") {
      row.innerHTML = `
        <td>${data.descripcion}</td>
        <td>${data.monto}</td>
        <td>${data.fecha}</td>
        <td><button onclick="eliminarDoc('${collectionName}','${docu.id}')">Eliminar</button></td>`;
    } else if (collectionName === "servicio") {
      row.innerHTML = `
        <td>${data.descripcion}</td>
        <td>${data.costo}</td>
        <td>${data.fecha}</td>
        <td><button onclick="eliminarDoc('${collectionName}','${docu.id}')">Eliminar</button></td>`;
    }
    tabla.appendChild(row);
  });

  // Actualizar select de proveedores en factura
  if (collectionName === "proveedor") {
    const select = document.getElementById("factProveedor");
    select.innerHTML = '<option value="">Seleccione proveedor</option>';
    querySnapshot.forEach(docu => {
      const data = docu.data();
      const option = document.createElement("option");
      option.value = data.nombre;
      option.textContent = data.nombre;
      select.appendChild(option);
    });
  }
}

// Eliminar documento
window.eliminarDoc = async (collectionName, id) => {
  await deleteDoc(doc(db, collectionName, id));
  if (collectionName === "proveedor") cargarTabla("proveedor", "tablaProveedor");
  if (collectionName === "factura") cargarTabla("factura", "tablaFactura");
  if (collectionName === "gasto") cargarTabla("gasto", "tablaGasto");
  if (collectionName === "servicio") cargarTabla("servicio", "tablaServicio");
};

// Agregar proveedores
document.getElementById("agregarProveedor").addEventListener("click", () => {
  const ruc = document.getElementById("provRUC").value;
  const nombre = document.getElementById("provNombre").value;
  const direccion = document.getElementById("provDireccion").value;
  if (!ruc || !nombre || !direccion) return alert("Todos los campos son obligatorios");
  agregarYMostrar("proveedor", { ruc, nombre, direccion }, "tablaProveedor");
  document.getElementById("provRUC").value = "";
  document.getElementById("provNombre").value = "";
  document.getElementById("provDireccion").value = "";
});

// Agregar facturas
document.getElementById("agregarFactura").addEventListener("click", () => {
  const ruc = document.getElementById("factRUC").value;
  const proveedor = document.getElementById("factProveedor").value;
  const descripcion = document.getElementById("factDescripcion").value;
  const fecha = document.getElementById("factFecha").value;
  if (!ruc || !proveedor || !descripcion || !fecha) return alert("Todos los campos son obligatorios");
  agregarYMostrar("factura", { ruc, proveedor, descripcion, fecha }, "tablaFactura");
  document.getElementById("factRUC").value = "";
  document.getElementById("factDescripcion").value = "";
  document.getElementById("factFecha").value = "";
});

// Agregar gastos
document.getElementById("agregarGasto").addEventListener("click", () => {
  const descripcion = document.getElementById("gastoDescripcion").value;
  const monto = document.getElementById("gastoMonto").value;
  const fecha = document.getElementById("gastoFecha").value;
  if (!descripcion || !monto || !fecha) return alert("Todos los campos son obligatorios");
  agregarYMostrar("gasto", { descripcion, monto, fecha }, "tablaGasto");
  document.getElementById("gastoDescripcion").value = "";
  document.getElementById("gastoMonto").value = "";
  document.getElementById("gastoFecha").value = "";
});

// Agregar servicios
document.getElementById("agregarServicio").addEventListener("click", () => {
  const descripcion = document.getElementById("servDescripcion").value;
  const costo = document.getElementById("servCosto").value;
  const fecha = document.getElementById("servFecha").value;
  if (!descripcion || !costo || !fecha) return alert("Todos los campos son obligatorios");
  agregarYMostrar("servicio", { descripcion, costo, fecha }, "tablaServicio");
  document.getElementById("servDescripcion").value = "";
  document.getElementById("servCosto").value = "";
  document.getElementById("servFecha").value = "";
});

// Cargar todas las tablas al inicio
cargarTabla("proveedor", "tablaProveedor");
cargarTabla("factura", "tablaFactura");
cargarTabla("gasto", "tablaGasto");
cargarTabla("servicio", "tablaServicio");






