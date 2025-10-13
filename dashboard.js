// ------------------------------
// DASHBOARD.JS COMPLETO
// ------------------------------

// Import Firebase
import { db } from './firebase.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";

// --- VARIABLES GLOBALES ---
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

// Arrays globales para filtrar
let proveedoresGlobal = [];
let productosGlobal = [];
let facturasGlobal = [];

// ------------------------------
// FUNCIONES AUXILIARES
// ------------------------------
function crearFilaProveedor(p) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${p.ruc}</td>
    <td>${p.nombre}</td>
    <td>${p.direccion || ''}</td>
    <td>${p.telefono || ''}</td>
    <td>
      <button class="btn btn-editar" data-id="${p.id}">Editar</button>
      <button class="btn btn-eliminar" data-id="${p.id}">Eliminar</button>
    </td>
  `;
  tablaProveedores.appendChild(tr);
}

function crearFilaProducto(p) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${p.nombre}</td>
    <td>${p.unidad || ''}</td>
    <td>${p.materialP || ''}</td>
    <td>${p.maquinaria || ''}</td>
    <td>${p.productoOf || ''}</td>
    <td>${p.insumosExtra || ''}</td>
    <td>
      <button class="btn btn-editar" data-id="${p.id}">Editar</button>
      <button class="btn btn-eliminar" data-id="${p.id}">Eliminar</button>
    </td>
  `;
  tablaProductos.appendChild(tr);
}

function crearFilaFactura(f) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${f.numero}</td>
    <td>${f.proveedor}</td>
    <td>${f.producto}</td>
    <td>${f.monto} ${f.moneda}</td>
    <td>${f.tipo}</td>
    <td>${f.fecha}</td>
    <td>
      <button class="btn btn-editar" data-id="${f.id}">Editar</button>
      <button class="btn btn-eliminar" data-id="${f.id}">Eliminar</button>
    </td>
  `;
  tablaFacturas.appendChild(tr);
}

// ------------------------------
// CARGA INICIAL DESDE FIREBASE
// ------------------------------
async function cargarProveedores() {
  const querySnapshot = await getDocs(collection(db, "proveedores"));
  proveedoresGlobal = [];
  proveedorFactura.innerHTML = '<option value="">Seleccione proveedor</option>';
  tablaProveedores.innerHTML = '';
  querySnapshot.forEach(docSnap => {
    const p = { id: docSnap.id, ...docSnap.data() };
    proveedoresGlobal.push(p);
    crearFilaProveedor(p);
    // Llenar select de facturas
    const opt = document.createElement('option');
    opt.value = p.nombre;
    opt.textContent = p.nombre;
    proveedorFactura.appendChild(opt);
  });
}

async function cargarProductos() {
  const querySnapshot = await getDocs(collection(db, "productos"));
  productosGlobal = [];
  productoFactura.innerHTML = '<option value="">Seleccione producto</option>';
  tablaProductos.innerHTML = '';
  querySnapshot.forEach(docSnap => {
    const p = { id: docSnap.id, ...docSnap.data() };
    productosGlobal.push(p);
    crearFilaProducto(p);
    // Llenar select de facturas
    const opt = document.createElement('option');
    opt.value = p.nombre;
    opt.textContent = p.nombre;
    productoFactura.appendChild(opt);
  });
}

async function cargarFacturas() {
  const querySnapshot = await getDocs(collection(db, "facturas"));
  facturasGlobal = [];
  tablaFacturas.innerHTML = '';
  querySnapshot.forEach(docSnap => {
    const f = { id: docSnap.id, ...docSnap.data() };
    facturasGlobal.push(f);
    crearFilaFactura(f);
  });
}

// ------------------------------
// CRUD PROVEEDORES
// ------------------------------
proveedorForm.addEventListener('submit', async e => {
  e.preventDefault();
  const ruc = document.getElementById('rucProveedor').value.trim();
  const nombre = document.getElementById('nombreProveedor').value.trim();
  const direccion = document.getElementById('direccionProveedor').value.trim();
  const telefono = document.getElementById('telefonoProveedor').value.trim();
  if (!ruc || !nombre) return alert('RUC y Nombre son obligatorios');
  const docRef = await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion, telefono });
  proveedorForm.reset();
  cargarProveedores();
});

// ------------------------------
// CRUD PRODUCTOS
// ------------------------------
productoForm.addEventListener('submit', async e => {
  e.preventDefault();
  const nombre = document.getElementById('nombreProducto').value.trim();
  const unidad = document.getElementById('unidadProducto').value.trim();
  const materialP = document.getElementById('materialP').value.trim();
  const maquinaria = document.getElementById('maquinaria').value.trim();
  const productoOf = document.getElementById('productoOf').value.trim();
  const insumosExtra = document.getElementById('insumosExtra').value.trim();
  if (!nombre) return alert('Nombre es obligatorio');
  await addDoc(collection(db, "productos"), { nombre, unidad, materialP, maquinaria, productoOf, insumosExtra });
  productoForm.reset();
  cargarProductos();
});

// ------------------------------
// CRUD FACTURAS
// ------------------------------
facturaForm.addEventListener('submit', async e => {
  e.preventDefault();
  const numero = document.getElementById('numeroFactura').value.trim();
  const fecha = document.getElementById('fechaEmisionFactura').value;
  const proveedor = proveedorFactura.value;
  const producto = productoFactura.value;
  const monto = document.getElementById('montoFactura').value.trim();
  const moneda = document.getElementById('monedaFactura').value;
  const tipo = document.getElementById('tipoFactura').value;
  if (!proveedor || !producto) return alert('Seleccione proveedor y producto');
  await addDoc(collection(db, "facturas"), { numero, fecha, proveedor, producto, monto, moneda, tipo });
  facturaForm.reset();
  cargarFacturas();
});

// ------------------------------
// BUSCADOR DE FACTURAS
// ------------------------------
buscadorFactura.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const query = buscadorFactura.value.toLowerCase().trim();
    if (!query) return;
    const filtradas = facturasGlobal.filter(f => f.producto.toLowerCase().includes(query));
    tablaFacturas.innerHTML = '';
    filtradas.forEach(f => crearFilaFactura(f));
  }
});

btnRefresh.addEventListener('click', () => {
  buscadorFactura.value = '';
  tablaFacturas.innerHTML = '';
  facturasGlobal.forEach(f => crearFilaFactura(f));
});

// ------------------------------
// BOTÓN CERRAR SESIÓN
// ------------------------------
document.getElementById('logoutBtn').addEventListener('click', () => {
  // Aquí integras Firebase Auth si lo usas
  console.log('Cerrar sesión');
  // location.href = 'login.html'; // si quieres redirigir
});

// ------------------------------
// INICIALIZACIÓN
// ------------------------------
cargarProveedores();
cargarProductos();
cargarFacturas();




