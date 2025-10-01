// dashboard.js
import { auth, db } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// =================== FUNCIONES ===================
function mostrarSeccion(seccion) {
  const secciones = document.querySelectorAll(".seccion");
  secciones.forEach(s => s.classList.add("hidden"));
  document.getElementById(seccion).classList.remove("hidden");
}

// =================== CERRAR SESIÓN ===================
document.getElementById("btnCerrarSesion").addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    alert("Error al cerrar sesión: " + error.message);
  }
});

// =================== PROVEEDORES ===================
const proveedoresCol = collection(db, "proveedores");
const tablaProveedores = document.getElementById("tablaProveedores").querySelector("tbody");
const selectProveedorFactura = document.getElementById("selectProveedorFactura");

async function cargarProveedores() {
  tablaProveedores.innerHTML = "";
  selectProveedorFactura.innerHTML = '<option value="">Selecciona un proveedor</option>';
  const snapshot = await getDocs(proveedoresCol);
  snapshot.forEach(doc => {
    const data = doc.data();
    tablaProveedores.innerHTML += `<tr><td>${data.nombre}</td><td>${data.direccion}</td></tr>`;
    selectProveedorFactura.innerHTML += `<option value="${data.nombre}">${data.nombre}</option>`;
  });
}

document.getElementById("btnAgregarProveedor").addEventListener("click", async () => {
  const nombre = document.getElementById("nombreProveedor").value;
  const direccion = document.getElementById("direccionProveedor").value;
  if (!nombre || !direccion) return alert("Completa todos los campos");
  await addDoc(proveedoresCol, { nombre, direccion });
  document.getElementById("nombreProveedor").value = "";
  document.getElementById("direccionProveedor").value = "";
  cargarProveedores();
});

// =================== FACTURAS ===================
const facturasCol = collection(db, "facturas");
const tablaFacturas = document.getElementById("tablaFacturas").querySelector("tbody");

document.getElementById("btnAgregarFactura").addEventListener("click", async () => {
  const ruc = document.getElementById("rucFactura").value;
  const proveedor = document.getElementById("selectProveedorFactura").value;
  const descripcion = document.getElementById("descripcionFactura").value;
  const fecha = document.getElementById("fechaFactura").value;
  if (!ruc || !proveedor || !descripcion || !fecha) return alert("Completa todos los campos");
  await addDoc(facturasCol, { ruc, proveedor, descripcion, fecha });
  document.getElementById("rucFactura").value = "";
  document.getElementById("descripcionFactura").value = "";
  document.getElementById("fechaFactura").value = "";
  cargarFacturas();
});

async function cargarFacturas() {
  tablaFacturas.innerHTML = "";
  const snapshot = await getDocs(facturasCol);
  snapshot.forEach(doc => {
    const f = doc.data();
    tablaFacturas.innerHTML += `<tr><td>${f.ruc}</td><td>${f.proveedor}</td><td>${f.descripcion}</td><td>${f.fecha}</td></tr>`;
  });
}

// =================== GASTOS ===================
const gastosCol = collection(db, "gastos");
const tablaGastos = document.getElementById("tablaGastos").querySelector("tbody");

document.getElementById("btnAgregarGasto").addEventListener("click", async () => {
  const descripcion = document.getElementById("descripcionGasto").value;
  const monto = document.getElementById("montoGasto").value;
  const fecha = document.getElementById("fechaGasto").value;
  if (!descripcion || !monto || !fecha) return alert("Completa todos los campos");
  await addDoc(gastosCol, { descripcion, monto, fecha });
  document.getElementById("descripcionGasto").value = "";
  document.getElementById("montoGasto").value = "";
  document.getElementById("fechaGasto").value = "";
  cargarGastos();
});

async function cargarGastos() {
  tablaGastos.innerHTML = "";
  const snapshot = await getDocs(gastosCol);
  snapshot.forEach(doc => {
    const g = doc.data();
    tablaGastos.innerHTML += `<tr><td>${g.descripcion}</td><td>${g.monto}</td><td>${g.fecha}</td></tr>`;
  });
}

// =================== SERVICIO ===================
const servicioCol = collection(db, "servicios");
const tablaServicios = document.getElementById("tablaServicios").querySelector("tbody");

document.getElementById("btnAgregarServicio").addEventListener("click", async () => {
  const nombre = document.getElementById("nombreServicio").value;
  const detalle = document.getElementById("detalleServicio").value;
  const fecha = document.getElementById("fechaServicio").value;
  if (!nombre || !detalle || !fecha) return alert("Completa todos los campos");
  await addDoc(servicioCol, { nombre, detalle, fecha });
  document.getElementById("nombreServicio").value = "";
  document.getElementById("detalleServicio").value = "";
  document.getElementById("fechaServicio").value = "";
  cargarServicios();
});

async function cargarServicios() {
  tablaServicios.innerHTML = "";
  const snapshot = await getDocs(servicioCol);
  snapshot.forEach(doc => {
    const s = doc.data();
    tablaServicios.innerHTML += `<tr><td>${s.nombre}</td><td>${s.detalle}</td><td>${s.fecha}</td></tr>`;
  });
}

// =================== INICIALIZAR ===================
cargarProveedores();
cargarFacturas();
cargarGastos();
cargarServicios();



