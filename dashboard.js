import { db } from "./firebase.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Cambiar secciones
window.mostrarSeccion = function(seccion) {
  document.querySelectorAll('.seccion').forEach(div => div.classList.add('oculto'));
  document.getElementById(seccion).classList.remove('oculto');
};

// --- PROVEEDORES ---
const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.getElementById("tablaProveedores").querySelector('tbody');

document.getElementById("btnAgregarProveedor").addEventListener("click", async () => {
  const ruc = document.getElementById("ruc").value;
  const nombre = document.getElementById("nombreProveedor").value;
  const direccion = document.getElementById("direccionProveedor").value;
  if(!ruc || !nombre) return alert("RUC y nombre son obligatorios");
  await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion });
  formProveedor.reset();
  cargarProveedores();
});

async function cargarProveedores() {
  tablaProveedores.innerHTML = "";
  const snapshot = await getDocs(collection(db, "proveedores"));
  const selectProv = document.getElementById("selectProveedor");
  selectProv.innerHTML = '<option value="">Selecciona un proveedor</option>';
  snapshot.forEach(doc => {
    const data = doc.data();
    tablaProveedores.innerHTML += `<tr><td>${data.ruc}</td><td>${data.nombre}</td><td>${data.direccion}</td></tr>`;
    selectProv.innerHTML += `<option value="${data.nombre}">${data.nombre}</option>`;
  });
}
cargarProveedores();

// --- FACTURAS ---
const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas").querySelector('tbody');

document.getElementById("btnAgregarFactura").addEventListener("click", async () => {
  const proveedor = document.getElementById("selectProveedor").value;
  const numFactura = document.getElementById("numFactura").value;
  const fecha = document.getElementById("fechaFactura").value;
  const descripcion = document.getElementById("descripcionFactura").value;
  if(!proveedor || !numFactura) return alert("Proveedor y número de factura son obligatorios");
  await addDoc(collection(db, "facturas"), { proveedor, numFactura, fecha, descripcion });
  formFactura.reset();
  cargarFacturas();
});

async function cargarFacturas() {
  tablaFacturas.innerHTML = "";
  const snapshot = await getDocs(collection(db, "facturas"));
  snapshot.forEach(doc => {
    const data = doc.data();
    tablaFacturas.innerHTML += `<tr><td>${data.proveedor}</td><td>${data.numFactura}</td><td>${data.fecha}</td><td>${data.descripcion}</td></tr>`;
  });
}
cargarFacturas();

// --- GASTOS ---
const formGasto = document.getElementById("formGasto");
const tablaGastos = document.getElementById("tablaGastos").querySelector('tbody');

document.getElementById("btnAgregarGasto").addEventListener("click", async () => {
  const nombre = document.getElementById("nombreGasto").value;
  const monto = document.getElementById("montoGasto").value;
  if(!nombre || !monto) return alert("Nombre y monto son obligatorios");
  await addDoc(collection(db, "gastos"), { nombre, monto });
  formGasto.reset();
  cargarGastos();
});

async function cargarGastos() {
  tablaGastos.innerHTML = "";
  const snapshot = await getDocs(collection(db, "gastos"));
  snapshot.forEach(doc => {
    const data = doc.data();
    tablaGastos.innerHTML += `<tr><td>${data.nombre}</td><td>${data.monto}</td></tr>`;
  });
}
cargarGastos();

// --- SERVICIOS ---
const formServicio = document.getElementById("formServicio");
const tablaServicios = document.getElementById("tablaServicios").querySelector('tbody');

document.getElementById("btnAgregarServicio").addEventListener("click", async () => {
  const nombre = document.getElementById("nombreServicio").value;
  const descripcion = document.getElementById("descripcionServicio").value;
  if(!nombre) return alert("Nombre del servicio es obligatorio");
  await addDoc(collection(db, "servicios"), { nombre, descripcion });
  formServicio.reset();
  cargarServicios();
});

async function cargarServicios() {
  tablaServicios.innerHTML = "";
  const snapshot = await getDocs(collection(db, "servicios"));
  snapshot.forEach(doc => {
    const data = doc.data();
    tablaServicios.innerHTML += `<tr><td>${data.nombre}</td><td>${data.descripcion}</td></tr>`;
  });
}
cargarServicios();


