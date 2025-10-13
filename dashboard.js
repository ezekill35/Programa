import { db } from './firebase.js';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';

// ------------------ Referencias de Firestore ------------------
const proveedoresCol = collection(db, "proveedores");
const productosCol = collection(db, "productos");
const facturasCol = collection(db, "facturas");

// ------------------ Referencias DOM ------------------
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");

const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");

const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");

const proveedorFacturaSelect = document.getElementById("proveedorFactura");
const productoFacturaSelect = document.getElementById("productoFactura");

const buscadorFactura = document.getElementById("buscadorFactura");
const btnRefresh = document.getElementById("btnRefresh");

// ------------------ Funciones auxiliares ------------------
function crearFilaProveedor(docData, docId){
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td contenteditable data-field="ruc">${docData.ruc}</td>
    <td contenteditable data-field="nombre">${docData.nombre}</td>
    <td contenteditable data-field="direccion">${docData.direccion}</td>
    <td contenteditable data-field="telefono">${docData.telefono}</td>
    <td>
      <button class="btn secondary btn-delete">Eliminar</button>
    </td>
  `;
  // Editar campos
  tr.querySelectorAll("[contenteditable]").forEach(td => {
    td.addEventListener("blur", async () => {
      const field = td.dataset.field;
      const value = td.textContent.trim();
      const docRef = doc(db, "proveedores", docId);
      await updateDoc(docRef, {[field]: value});
    });
  });
  // Eliminar
  tr.querySelector(".btn-delete").addEventListener("click", async () => {
    if(confirm("Eliminar proveedor?")){
      await deleteDoc(doc(db, "proveedores", docId));
    }
  });
  return tr;
}

function crearFilaProducto(docData, docId){
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td contenteditable data-field="nombre">${docData.nombre}</td>
    <td contenteditable data-field="unidad">${docData.unidad}</td>
    <td contenteditable data-field="materialP">${docData.materialP}</td>
    <td contenteditable data-field="maquinaria">${docData.maquinaria}</td>
    <td contenteditable data-field="productoOf">${docData.productoOf}</td>
    <td contenteditable data-field="insumosExtra">${docData.insumosExtra}</td>
    <td>
      <button class="btn secondary btn-delete">Eliminar</button>
    </td>
  `;
  tr.querySelectorAll("[contenteditable]").forEach(td => {
    td.addEventListener("blur", async () => {
      const field = td.dataset.field;
      const value = td.textContent.trim();
      const docRef = doc(db, "productos", docId);
      await updateDoc(docRef, {[field]: value});
    });
  });
  tr.querySelector(".btn-delete").addEventListener("click", async () => {
    if(confirm("Eliminar producto?")){
      await deleteDoc(doc(db, "productos", docId));
    }
  });
  return tr;
}

function crearFilaFactura(docData, docId){
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td contenteditable data-field="idFactura">${docData.idFactura}</td>
    <td contenteditable data-field="proveedor">${docData.proveedor}</td>
    <td contenteditable data-field="producto">${docData.producto}</td>
    <td contenteditable data-field="monto">${docData.monto}</td>
    <td contenteditable data-field="tipo">${docData.tipo}</td>
    <td contenteditable data-field="fecha">${docData.fecha}</td>
    <td>${docId}</td>
    <td>
      <button class="btn secondary btn-delete">Eliminar</button>
    </td>
  `;
  tr.querySelectorAll("[contenteditable]").forEach(td => {
    td.addEventListener("blur", async () => {
      const field = td.dataset.field;
      const value = td.textContent.trim();
      const docRef = doc(db, "facturas", docId);
      await updateDoc(docRef, {[field]: value});
    });
  });
  tr.querySelector(".btn-delete").addEventListener("click", async () => {
    if(confirm("Eliminar factura?")){
      await deleteDoc(doc(db, "facturas", docId));
    }
  });
  return tr;
}

// ------------------ Cargar y sincronizar tablas ------------------
onSnapshot(proveedoresCol, (snapshot)=>{
  tablaProveedores.innerHTML = "";
  proveedorFacturaSelect.innerHTML = '<option value="">Seleccione proveedor</option>';
  snapshot.forEach(docSnap=>{
    const docData = docSnap.data();
    const tr = crearFilaProveedor(docData, docSnap.id);
    tablaProveedores.appendChild(tr);
    // llenar select de facturas
    const opt = document.createElement("option");
    opt.value = docData.nombre;
    opt.textContent = docData.nombre;
    proveedorFacturaSelect.appendChild(opt);
  });
});

onSnapshot(productosCol, (snapshot)=>{
  tablaProductos.innerHTML = "";
  productoFacturaSelect.innerHTML = '<option value="">Seleccione producto</option>';
  snapshot.forEach(docSnap=>{
    const docData = docSnap.data();
    const tr = crearFilaProducto(docData, docSnap.id);
    tablaProductos.appendChild(tr);
    // llenar select de facturas
    const opt = document.createElement("option");
    opt.value = docData.nombre;
    opt.textContent = docData.nombre;
    productoFacturaSelect.appendChild(opt);
  });
});

onSnapshot(facturasCol, (snapshot)=>{
  tablaFacturas.innerHTML = "";
  snapshot.forEach(docSnap=>{
    const docData = docSnap.data();
    const tr = crearFilaFactura(docData, docSnap.id);
    tablaFacturas.appendChild(tr);
  });
});

// ------------------ Formularios ------------------
proveedorForm.addEventListener("submit", async e=>{
  e.preventDefault();
  await addDoc(proveedoresCol,{
    ruc: document.getElementById("rucProveedor").value.trim(),
    nombre: document.getElementById("nombreProveedor").value.trim(),
    direccion: document.getElementById("direccionProveedor").value.trim(),
    telefono: document.getElementById("telefonoProveedor").value.trim(),
  });
  proveedorForm.reset();
});

productoForm.addEventListener("submit", async e=>{
  e.preventDefault();
  await addDoc(productosCol,{
    nombre: document.getElementById("nombreProducto").value.trim(),
    unidad: document.getElementById("unidadProducto").value.trim(),
    materialP: document.getElementById("materialP").value.trim(),
    maquinaria: document.getElementById("maquinaria").value.trim(),
    productoOf: document.getElementById("productoOf").value.trim(),
    insumosExtra: document.getElementById("insumosExtra").value.trim(),
  });
  productoForm.reset();
});

facturaForm.addEventListener("submit", async e=>{
  e.preventDefault();
  await addDoc(facturasCol,{
    idFactura: document.getElementById("numeroFactura").value.trim(),
    proveedor: proveedorFacturaSelect.value,
    producto: productoFacturaSelect.value,
    monto: document.getElementById("montoFactura").value.trim(),
    tipo: document.getElementById("tipoFactura").value,
    fecha: document.getElementById("fechaEmisionFactura").value,
  });
  facturaForm.reset();
});

// ------------------ Buscador ------------------
buscadorFactura.addEventListener("input", ()=>{
  const filtro = buscadorFactura.value.trim().toLowerCase();
  tablaFacturas.querySelectorAll("tr").forEach(tr=>{
    const tdValues = Array.from(tr.querySelectorAll("td")).slice(0,6).map(td=>td.textContent.toLowerCase());
    tr.style.display = tdValues.some(v=>v.includes(filtro)) ? "" : "none";
  });
});

btnRefresh.addEventListener("click", ()=>{
  buscadorFactura.value = "";
  tablaFacturas.querySelectorAll("tr").forEach(tr=> tr.style.display = "");
});

