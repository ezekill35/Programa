// dashboard.js
import { auth, db } from './firebase.js';
import {
  signOut,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// ELEMENTOS MENÚ
const menuItems = {
  menuProveedor: document.getElementById("menuProveedor"),
  menuFactura: document.getElementById("menuFactura"),
  menuGastos: document.getElementById("menuGastos"),
  menuServicio: document.getElementById("menuServicio")
};

const sections = {
  sectionProveedor: document.getElementById("sectionProveedor"),
  sectionFactura: document.getElementById("sectionFactura"),
  sectionGastos: document.getElementById("sectionGastos"),
  sectionServicio: document.getElementById("sectionServicio")
};

// Cambiar sección visible y menú activo
Object.keys(menuItems).forEach(id => {
  menuItems[id].addEventListener("click", () => {
    Object.values(sections).forEach(sec => sec.classList.add("hidden"));
    Object.values(menuItems).forEach(mi => mi.classList.remove("active"));
    sections["section" + id.replace("menu","")]?.classList.remove("hidden");
    menuItems[id].classList.add("active");
  });
});

// CERRAR SESIÓN
document.getElementById("btnLogout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// -------------------- PROVEEDOR --------------------
const provRUC = document.getElementById("provRUC");
const provNombre = document.getElementById("provNombre");
const provDireccion = document.getElementById("provDireccion");
const tableProveedor = document.getElementById("tableProveedor").querySelector("tbody");
const searchProveedor = document.getElementById("searchProveedor");

async function listarProveedores(filter = "") {
  tableProveedor.innerHTML = "";
  const q = query(collection(db, "proveedores"));
  const snapshot = await getDocs(q);
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if(filter && !data.ruc.includes(filter) && !data.nombre.toLowerCase().includes(filter.toLowerCase())) return;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.ruc}</td>
      <td>${data.nombre}</td>
      <td>${data.direccion}</td>
      <td><button onclick="deleteProveedor('${docSnap.id}')">Eliminar</button></td>
    `;
    tableProveedor.appendChild(tr);
  });
}

window.deleteProveedor = async (id) => {
  await deleteDoc(doc(db, "proveedores", id));
  listarProveedores(searchProveedor.value);
};

document.getElementById("addProveedor").addEventListener("click", async () => {
  if(!provRUC.value || !provNombre.value || !provDireccion.value) return alert("Completa todos los campos");
  await addDoc(collection(db, "proveedores"), {
    ruc: provRUC.value,
    nombre: provNombre.value,
    direccion: provDireccion.value
  });
  provRUC.value = provNombre.value = provDireccion.value = "";
  listarProveedores();
});

searchProveedor.addEventListener("input", () => listarProveedores(searchProveedor.value));
listarProveedores();

// -------------------- FACTURA --------------------
const factRUC = document.getElementById("factRUC");
const factTipo = document.getElementById("factTipo");
const factDescripcion = document.getElementById("factDescripcion");
const factFecha = document.getElementById("factFecha");
const tableFactura = document.getElementById("tableFactura").querySelector("tbody");
const searchFactura = document.getElementById("searchFactura");

async function listarFacturas(filter = "") {
  tableFactura.innerHTML = "";
  const q = query(collection(db, "facturas"));
  const snapshot = await getDocs(q);
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if(filter && !data.ruc.includes(filter) && !data.descripcion.toLowerCase().includes(filter.toLowerCase())) return;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.ruc}</td>
      <td>${data.tipo}</td>
      <td>${data.descripcion}</td>
      <td>${data.fecha}</td>
      <td><button onclick="deleteFactura('${docSnap.id}')">Eliminar</button></td>
    `;
    tableFactura.appendChild(tr);
  });
}

window.deleteFactura = async (id) => {
  await deleteDoc(doc(db, "facturas", id));
  listarFacturas(searchFactura.value);
};

document.getElementById("addFactura").addEventListener("click", async () => {
  if(!factRUC.value || !factTipo.value || !factDescripcion.value || !factFecha.value) return alert("Completa todos los campos");
  await addDoc(collection(db, "facturas"), {
    ruc: factRUC.value,
    tipo: factTipo.value,
    descripcion: factDescripcion.value,
    fecha: factFecha.value
  });
  factRUC.value = factTipo.value = factDescripcion.value = factFecha.value = "";
  listarFacturas();
});

searchFactura.addEventListener("input", () => listarFacturas(searchFactura.value));
listarFacturas();

// -------------------- GASTOS --------------------
const gastoDescripcion = document.getElementById("gastoDescripcion");
const gastoMonto = document.getElementById("gastoMonto");
const tableGasto = document.getElementById("tableGasto").querySelector("tbody");
const searchGasto = document.getElementById("searchGasto");

async function listarGastos(filter = "") {
  tableGasto.innerHTML = "";
  const q = query(collection(db, "gastos"));
  const snapshot = await getDocs(q);
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if(filter && !data.descripcion.toLowerCase().includes(filter.toLowerCase())) return;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.descripcion}</td>
      <td>${data.monto}</td>
      <td><button onclick="deleteGasto('${docSnap.id}')">Eliminar</button></td>
    `;
    tableGasto.appendChild(tr);
  });
}

window.deleteGasto = async (id) => {
  await deleteDoc(doc(db, "gastos", id));
  listarGastos(searchGasto.value);
};

document.getElementById("addGasto").addEventListener("click", async () => {
  if(!gastoDescripcion.value || !gastoMonto.value) return alert("Completa todos los campos");
  await addDoc(collection(db, "gastos"), {
    descripcion: gastoDescripcion.value,
    monto: parseFloat(gastoMonto.value)
  });
  gastoDescripcion.value = gastoMonto.value = "";
  listarGastos();
});

searchGasto.addEventListener("input", () => listarGastos(searchGasto.value));
listarGastos();

// -------------------- SERVICIO --------------------
const servNombre = document.getElementById("servNombre");
const servDescripcion = document.getElementById("servDescripcion");
const tableServicio = document.getElementById("tableServicio").querySelector("tbody");
const searchServicio = document.getElementById("searchServicio");

async function listarServicios(filter = "") {
  tableServicio.innerHTML = "";
  const q = query(collection(db, "servicios"));
  const snapshot = await getDocs(q);
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if(filter && !data.nombre.toLowerCase().includes(filter.toLowerCase())) return;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.descripcion}</td>
      <td><button onclick="deleteServicio('${docSnap.id}')">Eliminar</button></td>
    `;
    tableServicio.appendChild(tr);
  });
}

window.deleteServicio = async (id) => {
  await deleteDoc(doc(db, "servicios", id));
  listarServicios(searchServicio.value);
};

document.getElementById("addServicio").addEventListener("click", async () => {
  if(!servNombre.value || !servDescripcion.value) return alert("Completa todos los campos");
  await addDoc(collection(db, "servicios"), {
    nombre: servNombre.value,
    descripcion: servDescripcion.value
  });
  servNombre.value = servDescripcion.value = "";
  listarServicios();
});

searchServicio.addEventListener("input", () => listarServicios(searchServicio.value));
listarServicios();
