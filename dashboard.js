
// =======================================
// 🐾 Dashboard JS - Discovery Pets (Firebase)
// =======================================

import { db, auth } from './firebase.js';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// ------------------ Variables globales ------------------
let proveedores = [];
let facturas = [];
let gastos = [];
let servicios = [];

// ------------------ Contadores ------------------
const totalProveedores = document.getElementById('total-proveedores');
const totalFacturas = document.getElementById('total-facturas');
const totalGastos = document.getElementById('total-gastos');
const totalServicios = document.getElementById('total-servicios');

// ------------------ Menú lateral ------------------
const menuItems = document.querySelectorAll('.sidebar ul li');
const sections = document.querySelectorAll('.section');

menuItems.forEach(item => {
  item.addEventListener('click', () => {
    menuItems.forEach(i => i.classList.remove('active'));
    sections.forEach(sec => sec.classList.remove('active'));
    item.classList.add('active');

    const sectionId = item.id.replace('menu-', '');
    if(sectionId !== "logout") document.getElementById(sectionId).classList.add('active');
  });
});

// Logout
document.getElementById('menu-logout').addEventListener('click', async () => {
  await signOut(auth);
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});

// =================== FIREBASE COLLECTIONS ===================
const proveedoresCol = collection(db, "proveedores");
const facturasCol = collection(db, "facturas");
const gastosCol = collection(db, "gastos");
const serviciosCol = collection(db, "servicios");

// =================== PROVEEDORES ===================
const listaProveedores = document.getElementById('listaProveedores');
const btnAgregarProveedor = document.getElementById('btnAgregarProveedor');

btnAgregarProveedor.addEventListener('click', async () => {
  const ruc = document.getElementById('provRuc').value.trim();
  const nombre = document.getElementById('provNombre').value.trim();
  const direccion = document.getElementById('provDireccion').value.trim();
  const telefono = document.getElementById('provTelefono').value.trim();
  const producto = document.getElementById('provProducto').value.trim();

  if(!ruc || !nombre) return alert('RUC y Nombre son obligatorios');
  if(isNaN(ruc) || isNaN(telefono)) return alert('RUC y Teléfono deben ser números');

  await addDoc(proveedoresCol, { ruc, nombre, direccion, telefono, producto });
  document.getElementById('formProveedor').reset();
});

// Cargar proveedores en tiempo real
onSnapshot(proveedoresCol, snapshot => {
  proveedores = [];
  snapshot.forEach(d => proveedores.push({ id: d.id, ...d.data() }));
  actualizarProveedores();
});

function actualizarProveedores() {
  listaProveedores.innerHTML = '';
  proveedores.forEach((prov) => {
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
  }
}

window.editarProveedor = async (id) => {
  const prov = proveedores.find(p => p.id === id);
  const ruc = prompt("RUC:", prov.ruc) || prov.ruc;
  const nombre = prompt("Nombre:", prov.nombre) || prov.nombre;
  const direccion = prompt("Dirección:", prov.direccion) || prov.direccion;
  const telefono = prompt("Teléfono:", prov.telefono) || prov.telefono;
  const producto = prompt("Producto:", prov.producto) || prov.producto;

  if(isNaN(ruc) || isNaN(telefono)) return alert('RUC y Teléfono deben ser números');

  await updateDoc(doc(db,"proveedores", id), { ruc, nombre, direccion, telefono, producto });
}

function actualizarSelectProveedores() {
  const select = document.getElementById('facRucProveedor');
  select.innerHTML = `<option value="">-- Selecciona un Proveedor --</option>`;
  proveedores.forEach(p => {
    select.innerHTML += `<option value="${p.nombre}">${p.nombre}</option>`;
  });
}

// =================== FACTURAS ===================
const listaFacturas = document.getElementById('listaFacturas');
const btnAgregarFactura = document.getElementById('btnAgregarFactura');

btnAgregarFactura.addEventListener('click', async () => {
  const proveedor = document.getElementById('facRucProveedor').value;
  const tipo = document.getElementById('facTipo').value.trim();
  const descripcion = document.getElementById('facDescripcion').value.trim();
  const fecha = document.getElementById('facFecha').value;
  const monto = document.getElementById('facMonto').value.trim();
  const moneda = document.getElementById('facMoneda').value;

  if(!proveedor || !tipo) return alert('Proveedor y Tipo son obligatorios');
  if(isNaN(monto) || monto <= 0) return alert('Monto debe ser un número válido');

  await addDoc(facturasCol, { proveedor, tipo, descripcion, fecha, monto, moneda });
  document.getElementById('facRucProveedor').value = '';
  document.getElementById('facTipo').value = '';
  document.getElementById('facDescripcion').value = '';
  document.getElementById('facFecha').value = '';
  document.getElementById('facMonto').value = '';
});

onSnapshot(facturasCol, snapshot => {
  facturas = [];
  snapshot.forEach(d => facturas.push({ id: d.id, ...d.data() }));
  actualizarFacturas();
});

function actualizarFacturas() {
  listaFacturas.innerHTML = '';
  facturas.forEach(fac => {
    listaFacturas.innerHTML += `
      <tr>
        <td>${fac.proveedor}</td>
        <td>${fac.tipo}</td>
        <td>${fac.descripcion}</td>
        <td>${fac.fecha}</td>
        <td>${fac.moneda}${fac.monto}</td>
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
  }
}

window.editarFactura = async (id) => {
  const fac = facturas.find(f => f.id === id);
  const proveedor = prompt("Proveedor:", fac.proveedor) || fac.proveedor;
  const tipo = prompt("Tipo:", fac.tipo) || fac.tipo;
  const descripcion = prompt("Descripción:", fac.descripcion) || fac.descripcion;
  const fecha = prompt("Fecha:", fac.fecha) || fac.fecha;
  let monto = prompt("Monto:", fac.monto) || fac.monto;
  const moneda = prompt("Moneda (S/., $, €):", fac.moneda) || fac.moneda;

  if(isNaN(monto) || monto <= 0) return alert('Monto debe ser un número válido');

  await updateDoc(doc(db,"facturas", id), { proveedor, tipo, descripcion, fecha, monto, moneda });
}

// =================== GASTOS ===================
const listaGastos = document.getElementById('listaGastos');
const btnAgregarGasto = document.getElementById('btnAgregarGasto');

btnAgregarGasto.addEventListener('click', async () => {
  const nombre = document.getElementById('gastoNombre').value.trim();
  const tipo = document.getElementById('gastoTipo').value;
  const monto = document.getElementById('gastoMonto').value.trim();
  const fecha = document.getElementById('gastoFecha').value;

  if(!nombre || !tipo) return alert('Nombre y Tipo son obligatorios');
  if(isNaN(monto) || monto <= 0) return alert('Monto debe ser un número válido');

  await addDoc(gastosCol, { nombre, tipo, monto, fecha });
  document.getElementById('formGasto').reset();
});

onSnapshot(gastosCol, snapshot => {
  gastos = [];
  snapshot.forEach(d => gastos.push({ id: d.id, ...d.data() }));
  actualizarGastos();
});

function actualizarGastos() {
  listaGastos.innerHTML = '';
  gastos.forEach(g => {
    listaGastos.innerHTML += `
      <tr>
        <td>${g.nombre}</td>
        <td>${g.tipo}</td>
        <td>${g.monto}</td>
        <td>${g.fecha}</td>
        <td>
          <button onclick="editarGasto('${g.id}')">✏️</button>
          <button onclick="eliminarGastoFirebase('${g.id}')">❌</button>
        </td>
      </tr>
    `;
  });
  totalGastos.textContent = gastos.length;
}

async function eliminarGastoFirebase(id) {
  if(confirm('¿Eliminar gasto?')) {
    await deleteDoc(doc(db, "gastos", id));
  }
}

window.editarGasto = async (id) => {
  const g = gastos.find(x => x.id === id);
  const nombre = prompt("Nombre:", g.nombre) || g.nombre;
  const tipo = prompt("Tipo:", g.tipo) || g.tipo;
  let monto = prompt("Monto:", g.monto) || g.monto;
  const fecha = prompt("Fecha:", g.fecha) || g.fecha;

  if(isNaN(monto) || monto <= 0) return alert('Monto debe ser un número válido');

  await updateDoc(doc(db,"gastos", id), { nombre, tipo, monto, fecha });
}

// =================== SERVICIOS ===================
const listaServicios = document.getElementById('listaServicios');
const btnAgregarServicio = document.getElementById('btnAgregarServicio');

btnAgregarServicio.addEventListener('click', async () => {
  const nombre = document.getElementById('servNombre').value.trim();
  const descripcion = document.getElementById('servDescripcion').value.trim();
  const fecha = document.getElementById('servFecha').value;
  const precio = document.getElementById('servPrecio').value.trim();

  if(!nombre) return alert('Nombre es obligatorio');
  if(isNaN(precio) || precio <= 0) return alert('Precio debe ser un número válido');

  await addDoc(serviciosCol, { nombre, descripcion, fecha, precio });
  document.getElementById('servNombre').value = '';
  document.getElementById('servDescripcion').value = '';
  document.getElementById('servFecha').value = '';
  document.getElementById('servPrecio').value = '';
});

onSnapshot(serviciosCol, snapshot => {
  servicios = [];
  snapshot.forEach(d => servicios.push({ id: d.id, ...d.data() }));
  actualizarServicios();
});

function actualizarServicios() {
  listaServicios.innerHTML = '';
  servicios.forEach(s => {
    listaServicios.innerHTML += `
      <tr>
        <td>${s.nombre}</td>
        <td>${s.descripcion}</td>
        <td>${s.fecha}</td>
        <td>${s.precio}</td>
        <td>
          <button onclick="editarServicio('${s.id}')">✏️</button>
          <button onclick="eliminarServicioFirebase('${s.id}')">❌</button>
        </td>
      </tr>
    `;
  });
  totalServicios.textContent = servicios.length;
}

async function eliminarServicioFirebase(id) {
  if(confirm('¿Eliminar servicio?')) {
    await deleteDoc(doc(db, "servicios", id));
  }
}

window.editarServicio = async (id) => {
  const s = servicios.find(x => x.id === id);
  const nombre = prompt("Nombre:", s.nombre) || s.nombre;
  const descripcion = prompt("Descripción:", s.descripcion) || s.descripcion;
  const fecha = prompt("Fecha:", s.fecha) || s.fecha;
  let precio = prompt("Precio:", s.precio) || s.precio;

  if(isNaN(precio) || precio <= 0) return alert('Precio debe ser un número válido');

  await updateDoc(doc(db,"servicios", id), { nombre, descripcion, fecha, precio });
}

  await updateDoc(doc(db,"servicios", id), { nombre, descripcion, fecha, precio });
}

