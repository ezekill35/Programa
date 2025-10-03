import { auth, db } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// ===================== SESIÓN =====================
auth.onAuthStateChanged(user => {
  if(!user) window.location.href = "index.html"; // Bloquea dashboard si no hay sesión
});

document.getElementById("menu-logout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ===================== VARIABLES =====================
let proveedores = [];
let facturas = [];
let gastos = [];
let servicios = [];

const totalProveedores = document.getElementById('total-proveedores');
const totalFacturas = document.getElementById('total-facturas');
const totalGastos = document.getElementById('total-gastos');
const totalServicios = document.getElementById('total-servicios');

const menuItems = document.querySelectorAll('.sidebar ul li');
const sections = document.querySelectorAll('.section');
menuItems.forEach(item => {
  item.addEventListener('click', () => {
    menuItems.forEach(i => i.classList.remove('active'));
    sections.forEach(sec => sec.classList.remove('active'));
    item.classList.add('active');
    const sectionId = item.id.replace('menu-', '');
    document.getElementById(sectionId).classList.add('active');
  });
});

// ===================== FIREBASE COLLECTIONS =====================
const proveedoresCol = collection(db, "proveedores");
const facturasCol = collection(db, "facturas");
const gastosCol = collection(db, "gastos");
const serviciosCol = collection(db, "servicios");

// ===================== PROVEEDORES =====================
const listaProveedores = document.getElementById('listaProveedores');
const btnAgregarProveedor = document.getElementById('btnAgregarProveedor');

btnAgregarProveedor.addEventListener('click', async () => {
  const ruc = document.getElementById('provRuc').value.trim();
  const nombre = document.getElementById('provNombre').value.trim();
  const direccion = document.getElementById('provDireccion').value.trim();
  const telefono = document.getElementById('provTelefono').value.trim();
  const producto = document.getElementById('provProducto').value.trim();

  if(!ruc || !nombre) return alert('RUC y Nombre son obligatorios');

  await addDoc(proveedoresCol, { ruc, nombre, direccion, telefono, producto });
  cargarProveedores();
  document.getElementById('formProveedor').reset();
});

async function cargarProveedores() {
  const snapshot = await getDocs(proveedoresCol);
  proveedores = [];
  snapshot.forEach(d => proveedores.push({ id: d.id, ...d.data() }));
  actualizarProveedores();
}

function actualizarProveedores() {
  listaProveedores.innerHTML = '';
  proveedores.forEach(prov => {
    listaProveedores.innerHTML += `
      <tr>
        <td>${prov.ruc}</td>
        <td>${prov.nombre}</td>
        <td>${prov.direccion}</td>
        <td>${prov.telefono}</td>
        <td>${prov.producto}</td>
        <td>
          <button onclick="editarProveedor('${prov.id}')">✏️</button>
          <button onclick="eliminarProveedorFirebase('${prov.id}')">❌</button>
        </td>
      </tr>
    `;
  });
  totalProveedores.textContent = proveedores.length;
  actualizarSelectProveedores();
}

async function eliminarProveedorFirebase(id) {
  if(confirm('¿Eliminar proveedor?')) {
    await deleteDoc(doc(db, "proveedores", id));
    cargarProveedores();
  }
}

window.editarProveedor = async (id) => {
  const prov = proveedores.find(p => p.id === id);
  const ruc = prompt("RUC:", prov.ruc) || prov.ruc;
  const nombre = prompt("Nombre:", prov.nombre) || prov.nombre;
  const direccion = prompt("Dirección:", prov.direccion) || prov.direccion;
  const telefono = prompt("Teléfono:", prov.telefono) || prov.telefono;
  const producto = prompt("Producto:", prov.producto) || prov.producto;
  await updateDoc(doc(db,"proveedores", id), { ruc, nombre, direccion, telefono, producto });
  cargarProveedores();
}

function actualizarSelectProveedores() {
  const select = document.getElementById('facRucProveedor');
  select.innerHTML = `<option value="">-- Selecciona un Proveedor --</option>`;
  proveedores.forEach(p => {
    select.innerHTML += `<option value="${p.nombre}">${p.nombre}</option>`;
  });
}

// ===================== FACTURAS =====================
const listaFacturas = document.getElementById('listaFacturas');
const btnAgregarFactura = document.getElementById('btnAgregarFactura');

btnAgregarFactura.addEventListener('click', async () => {
  const proveedor = document.getElementById('facRucProveedor').value;
  const tipo = document.getElementById('facTipo').value.trim();
  const descripcion = document.getElementById('facDescripcion').value.trim();
  const fecha = document.getElementById('facFecha').value;
  const monto = document.getElementById('facMonto').value.trim();
  const moneda = document.getElementById('facMoneda').value;

  if(!proveedor || !tipo || !monto) return alert('Proveedor, Tipo y Monto son obligatorios');

  await addDoc(facturasCol, { proveedor, tipo, descripcion, fecha, monto, moneda });
  cargarFacturas();
  document.getElementById('facRucProveedor').value = '';
  document.getElementById('facTipo').value = '';
  document.getElementById('facDescripcion').value = '';
  document.getElementById('facFecha').value = '';
  document.getElementById('facMonto').value = '';
});

async function cargarFacturas() {
  const snapshot = await getDocs(facturasCol);
  facturas = [];
  snapshot.forEach(d => facturas.push({ id: d.id, ...d.data() }));
  actualizarFacturas();
}

function actualizarFacturas() {
  listaFacturas.innerHTML = '';
  facturas.forEach(fac => {
    listaFacturas.innerHTML += `
      <tr>
        <td>${fac.proveedor}</td>
        <td>${fac.tipo}</td>
        <td>${fac.descripcion}</td>
        <td>${fac.fecha}</td>
        <td>${fac.monto}</td>
        <td>${fac.moneda}</td>
        <td>
          <button onclick="editarFactura('${fac.id}')">✏️</button>
          <button onclick="eliminarFacturaFirebase('${fac.id}')">❌</button>
        </td>
      </tr>
    `;
  });
  totalFacturas.textContent = facturas.length;
}

async function eliminarFacturaFirebase(id) {
  if(confirm('¿Eliminar factura?')) {
    await deleteDoc(doc(db, "facturas", id));
    cargarFacturas();
  }
}

window.editarFactura = async (id) => {
  const fac = facturas.find(f => f.id === id);
  const proveedor = prompt("Proveedor:", fac.proveedor) || fac.proveedor;
  const tipo = prompt("Tipo:", fac.tipo) || fac.tipo;
  const descripcion = prompt("Descripción:", fac.descripcion) || fac.descripcion;
  const fecha = prompt("Fecha:", fac.fecha) || fac.fecha;
  const monto = prompt("Monto:", fac.monto) || fac.monto;
  const moneda = prompt("Moneda (PEN o USD):", fac.moneda) || fac.moneda;

  await updateDoc(doc(db,"facturas", id), { proveedor, tipo, descripcion, fecha, monto, moneda });
  cargarFacturas();
}

// ===================== GASTOS =====================
// ... Igual que antes (solo números en monto)


// ===================== SERVICIOS =====================
// ... Igual que antes (solo números en precio)

// ===================== CARGA INICIAL =====================
cargarProveedores();
cargarFacturas();
cargarGastos();
cargarServicios();







