// -----------------------------------------
// DASHBOARD.JS — Discovery Pets (Edición en línea)
// -----------------------------------------

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

// -------------------- Variables globales --------------------
const tablaProveedores = document.getElementById('tablaProveedores');
const tablaProductos = document.getElementById('tablaProductos');
const tablaFacturas = document.getElementById('tablaFacturas');

const proveedorForm = document.getElementById('proveedorForm');
const productoForm = document.getElementById('productoForm');
const facturaForm = document.getElementById('facturaForm');

const proveedorFactura = document.getElementById('proveedorFactura');
const productoFactura = document.getElementById('productoFactura');
const buscadorFactura = document.getElementById('buscadorFactura');
const btnRefresh = document.getElementById('btnRefresh');

let proveedoresGlobal = [];
let productosGlobal = [];
let facturasGlobal = [];

// -------------------- Funciones auxiliares --------------------
function celdaEditable(texto, campo, id, coleccion) {
  const td = document.createElement('td');
  const input = document.createElement('input');
  input.value = texto || '';
  input.style.width = '100%';
  input.style.border = 'none';
  input.style.background = 'transparent';
  input.style.outline = 'none';
  input.addEventListener('change', async () => {
    const ref = doc(db, coleccion, id);
    await updateDoc(ref, { [campo]: input.value });
  });
  td.appendChild(input);
  return td;
}

function botonEliminar(id, coleccion) {
  const btn = document.createElement('button');
  btn.textContent = '🗑️';
  btn.className = 'btn secondary';
  btn.style.fontSize = '13px';
  btn.addEventListener('click', async () => {
    if (confirm('¿Eliminar este registro?')) {
      await deleteDoc(doc(db, coleccion, id));
    }
  });
  return btn;
}

// -------------------- Render de tablas --------------------
function renderProveedor(p) {
  const tr = document.createElement('tr');
  tr.append(
    celdaEditable(p.ruc, 'ruc', p.id, 'proveedores'),
    celdaEditable(p.nombre, 'nombre', p.id, 'proveedores'),
    celdaEditable(p.direccion, 'direccion', p.id, 'proveedores'),
    celdaEditable(p.telefono, 'telefono', p.id, 'proveedores')
  );
  const tdAcc = document.createElement('td');
  tdAcc.appendChild(botonEliminar(p.id, 'proveedores'));
  tr.appendChild(tdAcc);
  tablaProveedores.appendChild(tr);
}

function renderProducto(p) {
  const tr = document.createElement('tr');
  tr.append(
    celdaEditable(p.nombre, 'nombre', p.id, 'productos'),
    celdaEditable(p.unidad, 'unidad', p.id, 'productos'),
    celdaEditable(p.materialP, 'materialP', p.id, 'productos'),
    celdaEditable(p.maquinaria, 'maquinaria', p.id, 'productos'),
    celdaEditable(p.productoOf, 'productoOf', p.id, 'productos'),
    celdaEditable(p.insumosExtra, 'insumosExtra', p.id, 'productos')
  );
  const tdAcc = document.createElement('td');
  tdAcc.appendChild(botonEliminar(p.id, 'productos'));
  tr.appendChild(tdAcc);
  tablaProductos.appendChild(tr);
}

function renderFactura(f) {
  const tr = document.createElement('tr');
  tr.append(
    celdaEditable(f.numero, 'numero', f.id, 'facturas'),
    celdaEditable(f.proveedor, 'proveedor', f.id, 'facturas'),
    celdaEditable(f.producto, 'producto', f.id, 'facturas'),
    celdaEditable(f.monto, 'monto', f.id, 'facturas'),
    celdaEditable(f.tipo, 'tipo', f.id, 'facturas'),
    celdaEditable(f.fecha, 'fecha', f.id, 'facturas'),
    celdaEditable(f.idFactura || '', 'idFactura', f.id, 'facturas')
  );
  const tdAcc = document.createElement('td');
  tdAcc.appendChild(botonEliminar(f.id, 'facturas'));
  tr.appendChild(tdAcc);
  tablaFacturas.appendChild(tr);
}

// -------------------- Carga en tiempo real --------------------
onSnapshot(collection(db, 'proveedores'), (snap) => {
  proveedoresGlobal = [];
  tablaProveedores.innerHTML = '';
  proveedorFactura.innerHTML = '<option value="">Seleccione proveedor</option>';
  snap.forEach((d) => {
    const p = { id: d.id, ...d.data() };
    proveedoresGlobal.push(p);
    renderProveedor(p);
    const opt = document.createElement('option');
    opt.value = p.nombre;
    opt.textContent = p.nombre;
    proveedorFactura.appendChild(opt);
  });
});

onSnapshot(collection(db, 'productos'), (snap) => {
  productosGlobal = [];
  tablaProductos.innerHTML = '';
  productoFactura.innerHTML = '<option value="">Seleccione producto</option>';
  snap.forEach((d) => {
    const p = { id: d.id, ...d.data() };
    productosGlobal.push(p);
    renderProducto(p);
    const opt = document.createElement('option');
    opt.value = p.nombre;
    opt.textContent = p.nombre;
    productoFactura.appendChild(opt);
  });
});

onSnapshot(collection(db, 'facturas'), (snap) => {
  facturasGlobal = [];
  tablaFacturas.innerHTML = '';
  snap.forEach((d) => {
    const f = { id: d.id, ...d.data() };
    facturasGlobal.push(f);
    renderFactura(f);
  });
});

// -------------------- Formularios CRUD --------------------
proveedorForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    ruc: document.getElementById('rucProveedor').value.trim(),
    nombre: document.getElementById('nombreProveedor').value.trim(),
    direccion: document.getElementById('direccionProveedor').value.trim(),
    telefono: document.getElementById('telefonoProveedor').value.trim(),
  };
  if (!data.ruc || !data.nombre) return alert('RUC y Nombre son obligatorios.');
  await addDoc(collection(db, 'proveedores'), data);
  proveedorForm.reset();
});

productoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    nombre: document.getElementById('nombreProducto').value.trim(),
    unidad: document.getElementById('unidadProducto').value.trim(),
    materialP: document.getElementById('materialP').value.trim(),
    maquinaria: document.getElementById('maquinaria').value.trim(),
    productoOf: document.getElementById('productoOf').value.trim(),
    insumosExtra: document.getElementById('insumosExtra').value.trim(),
  };
  if (!data.nombre) return alert('El nombre es obligatorio.');
  await addDoc(collection(db, 'productos'), data);
  productoForm.reset();
});

facturaForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    numero: document.getElementById('numeroFactura').value.trim(),
    fecha: document.getElementById('fechaEmisionFactura').value,
    proveedor: proveedorFactura.value,
    producto: productoFactura.value,
    monto: document.getElementById('montoFactura').value.trim(),
    moneda: document.getElementById('monedaFactura').value,
    tipo: document.getElementById('tipoFactura').value,
    idFactura: prompt('Ingrese el ID de factura (ej.: F003-007598):', ''),
  };
  if (!data.proveedor || !data.producto) return alert('Seleccione proveedor y producto.');
  await addDoc(collection(db, 'facturas'), data);
  facturaForm.reset();
});

// -------------------- Buscador de facturas --------------------
buscadorFactura.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const q = buscadorFactura.value.toLowerCase().trim();
    if (!q) return;
    const filtradas = facturasGlobal.filter((f) => f.producto?.toLowerCase().includes(q));
    tablaFacturas.innerHTML = '';
    filtradas.forEach((f) => renderFactura(f));
  }
});

btnRefresh.addEventListener('click', () => {
  buscadorFactura.value = '';
  tablaFacturas.innerHTML = '';
  facturasGlobal.forEach((f) => renderFactura(f));
});

// -------------------- Cerrar sesión --------------------
document.getElementById('logoutBtn').addEventListener('click', () => {
  // Aquí puedes integrar Firebase Auth si usas login
  window.location.href = 'index.html';
});



