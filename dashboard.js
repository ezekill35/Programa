// dashboard.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";

// --- CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- MENÚ LATERAL ---
const sections = {
  reportes: document.getElementById("sectionReportes"),
  proveedor: document.getElementById("sectionProveedor"),
  factura: document.getElementById("sectionFactura"),
  gastos: document.getElementById("sectionGastos"),
  servicio: document.getElementById("sectionServicio")
};

const menuItems = {
  reportes: document.getElementById("menuReportes"),
  proveedor: document.getElementById("menuProveedor"),
  factura: document.getElementById("menuFactura"),
  gastos: document.getElementById("menuGastos"),
  servicio: document.getElementById("menuServicio")
};

function showSection(sectionName) {
  Object.keys(sections).forEach(key => {
    sections[key].classList.add("hidden");
    menuItems[key].classList.remove("active");
  });
  sections[sectionName].classList.remove("hidden");
  menuItems[sectionName].classList.add("active");
}

// Eventos de menú
menuItems.reportes.addEventListener("click", () => showSection("reportes"));
menuItems.proveedor.addEventListener("click", () => showSection("proveedor"));
menuItems.factura.addEventListener("click", () => showSection("factura"));
menuItems.gastos.addEventListener("click", () => showSection("gastos"));
menuItems.servicio.addEventListener("click", () => showSection("servicio"));

// --- CERRAR SESIÓN ---
document.getElementById("btnCerrarSesion").addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
});

// --- FUNCIONES PROVEEDOR ---
const provForm = document.getElementById("formProveedor");
const tablaProvBody = document.querySelector("#tablaProveedor tbody");

async function agregarProveedor() {
  const ruc = document.getElementById("provRuc").value;
  const nombre = document.getElementById("provNombre").value;
  const direccion = document.getElementById("provDireccion").value;
  const correo = document.getElementById("provCorreo").value;
  const telefono = document.getElementById("provTelefono").value;

  if (!ruc || !nombre) return alert("RUC y Nombre son obligatorios");

  await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion, correo, telefono });
  provForm.reset();
  listarProveedores();
}

async function listarProveedores(busqueda = "") {
  tablaProvBody.innerHTML = "";
  let q = collection(db, "proveedores");
  if (busqueda) {
    const allDocs = await getDocs(q);
    allDocs.forEach(docSnap => {
      const data = docSnap.data();
      if (data.ruc.includes(busqueda) || data.nombre.toLowerCase().includes(busqueda.toLowerCase())) {
        agregarFilaProveedor(docSnap.id, data);
      }
    });
  } else {
    const docsSnap = await getDocs(q);
    docsSnap.forEach(docSnap => agregarFilaProveedor(docSnap.id, docSnap.data()));
  }
}

function agregarFilaProveedor(id, data) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${data.ruc}</td>
    <td>${data.nombre}</td>
    <td>${data.direccion}</td>
    <td>${data.correo}</td>
    <td>${data.telefono}</td>
    <td><button onclick="eliminarProveedor('${id}')">Eliminar</button></td>
  `;
  tablaProvBody.appendChild(tr);
}

window.eliminarProveedor = async function(id) {
  await deleteDoc(doc(db, "proveedores", id));
  listarProveedores();
}

// Buscar
document.getElementById("btnBuscarProveedor").addEventListener("click", () => {
  const busq = document.getElementById("busquedaProveedor").value;
  listarProveedores(busq);
});

document.getElementById("btnAgregarProveedor").addEventListener("click", agregarProveedor);
listarProveedores();

// --- FUNCIONES FACTURA ---
const factForm = document.getElementById("formFactura");
const tablaFactBody = document.querySelector("#tablaFactura tbody");

async function agregarFactura() {
  const ruc = document.getElementById("factRuc").value;
  const tipo = document.getElementById("tipoFactura").value;
  const descripcion = document.getElementById("factDescripcion").value;
  const fecha = document.getElementById("factFecha").value;

  if (!ruc || !tipo) return alert("RUC y Tipo de factura son obligatorios");

  await addDoc(collection(db, "facturas"), { ruc, tipo, descripcion, fecha });
  factForm.reset();
  listarFacturas();
}

async function listarFacturas(busqueda = "") {
  tablaFactBody.innerHTML = "";
  const q = collection(db, "facturas");
  const docsSnap = await getDocs(q);
  docsSnap.forEach(docSnap => {
    const data = docSnap.data();
    if (!busqueda || data.ruc.includes(busqueda)) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${data.ruc}</td>
        <td>${data.tipo}</td>
        <td>${data.descripcion}</td>
        <td>${data.fecha}</td>
        <td><button onclick="eliminarFactura('${docSnap.id}')">Eliminar</button></td>
      `;
      tablaFactBody.appendChild(tr);
    }
  });
}

window.eliminarFactura = async function(id) {
  await deleteDoc(doc(db, "facturas", id));
  listarFacturas();
}

document.getElementById("btnBuscarFactura").addEventListener("click", () => {
  const busq = document.getElementById("busquedaFactura").value;
  listarFacturas(busq);
});
document.getElementById("btnAgregarFactura").addEventListener("click", agregarFactura);
listarFacturas();

// --- FUNCIONES GASTOS ---
const gastoForm = document.getElementById("formGastos");
const tablaGastoBody = document.querySelector("#tablaGasto tbody");

async function agregarGasto() {
  const descripcion = document.getElementById("gastoDescripcion").value;
  const monto = document.getElementById("gastoMonto").value;
  const fecha = document.getElementById("gastoFecha").value;
  if (!descripcion || !monto) return alert("Descripción y monto son obligatorios");

  await addDoc(collection(db, "gastos"), { descripcion, monto, fecha });
  gastoForm.reset();
  listarGastos();
}

async function listarGastos(busqueda = "") {
  tablaGastoBody.innerHTML = "";
  const q = collection(db, "gastos");
  const docsSnap = await getDocs(q);
  docsSnap.forEach(docSnap => {
    const data = docSnap.data();
    if (!busqueda || data.descripcion.toLowerCase().includes(busqueda.toLowerCase())) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${data.descripcion}</td>
        <td>${data.monto}</td>
        <td>${data.fecha}</td>
        <td><button onclick="eliminarGasto('${docSnap.id}')">Eliminar</button></td>
      `;
      tablaGastoBody.appendChild(tr);
    }
  });
}

window.eliminarGasto = async function(id) {
  await deleteDoc(doc(db, "gastos", id));
  listarGastos();
}

document.getElementById("btnBuscarGasto").addEventListener("click", () => {
  const busq = document.getElementById("busquedaGasto").value;
  listarGastos(busq);
});
document.getElementById("btnAgregarGasto").addEventListener("click", agregarGasto);
listarGastos();

// --- FUNCIONES SERVICIO ---
const servForm = document.getElementById("formServicio");
const tablaServBody = document.querySelector("#tablaServicio tbody");

async function agregarServicio() {
  const descripcion = document.getElementById("servDescripcion").value;
  const fecha = document.getElementById("servFecha").value;
  if (!descripcion) return alert("Descripción es obligatoria");

  await addDoc(collection(db, "servicios"), { descripcion, fecha });
  servForm.reset();
  listarServicios();
}

async function listarServicios(busqueda = "") {
  tablaServBody.innerHTML = "";
  const q = collection(db, "servicios");
  const docsSnap = await getDocs(q);
  docsSnap.forEach(docSnap => {
    const data = docSnap.data();
    if (!busqueda || data.descripcion.toLowerCase().includes(busqueda.toLowerCase())) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${data.descripcion}</td>
        <td>${data.fecha}</td>
        <td><button onclick="eliminarServicio('${docSnap.id}')">Eliminar</button></td>
      `;
      tablaServBody.appendChild(tr);
    }
  });
}

window.eliminarServicio = async function(id) {
  await deleteDoc(doc(db, "servicios", id));
  listarServicios();
}

document.getElementById("btnBuscarServicio").addEventListener("click", () => {
  const busq = document.getElementById("busquedaServicio").value;
  listarServicios(busq);
});
document.getElementById("btnAgregarServicio").addEventListener("click", agregarServicio);
listarServicios();

