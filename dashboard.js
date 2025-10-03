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
const listaGastos = document.getElementById('listaGastos');
const btnAgregarGasto = document.getElementById('btnAgregarGasto');

btnAgregarGasto.addEventListener('click', async () => {
  const nombre = document.getElementById('gastoNombre').value.trim();
  const tipo = document.getElementById('gastoTipo').value;
  const monto = document.getElementById('gastoMonto').value.trim();
  const fecha = document.getElementById('gastoFecha').value;

  if(!nombre || !tipo || !monto) return alert('Nombre, Tipo y Monto son obligatorios');

  await addDoc(gastosCol, { nombre, tipo, monto, fecha });
  cargarGastos();
  document.getElementById('formGasto').reset();
});

async function cargarGastos() {
  const snapshot = await getDocs(gastosCol);
  gastos = [];
  snapshot.forEach(d => gastos.push({ id: d.id, ...d.data() }));
  actualizarGastos();
}

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
    cargarGastos();
  }
}

window.editarGasto = async (id) => {
  const g = gastos.find(x => x.id === id);
  const nombre = prompt("Nombre:", g.nombre) || g.nombre;
  const tipo = prompt("Tipo:", g.tipo) || g.tipo;
  const monto = prompt("Monto:", g.monto) || g.monto;
  const fecha = prompt("Fecha:", g.fecha) || g.fecha;

  await updateDoc(doc(db,"gastos", id), { nombre, tipo, monto, fecha });
  cargarGastos();
}

// ===================== SERVICIOS =====================
const listaServicios = document.getElementById('listaServicios');
const btnAgregarServicio = document.getElementById('btnAgregarServicio');

btnAgregarServicio.addEventListener('click', async () => {
  const nombre = document.getElementById('servNombre').value.trim();
  const descripcion = document.getElementById('servDescripcion').value.trim();
  const fecha = document.getElementById('servFecha').value;
  const precio = document.getElementById('servPrecio').value.trim();

  if(!nombre || !precio) return alert('Nombre y Precio son obligatorios');

  await addDoc(serviciosCol, { nombre, descripcion, fecha, precio });
  cargarServicios();
  document.getElementById('servNombre').value = '';
  document.getElementById('servDescripcion').value = '';
  document.getElementById('servFecha').value = '';
  document.getElementById('servPrecio').value = '';
});

async function cargarServicios() {
  const snapshot = await getDocs(serviciosCol);
  servicios = [];
  snapshot.forEach(d => servicios.push({ id: d.id, ...d.data() }));
  actualizarServicios();
}

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
    cargarServicios();
  }
}

window.editarServicio = async (id) => {
  const s = servicios.find(x => x.id === id);
  const nombre = prompt("Nombre:", s.nombre) || s.nombre;
  const descripcion = prompt("Descripción:", s.descripcion) || s.descripcion;
  const fecha = prompt("Fecha:", s.fecha) || s.fecha;
  const precio = prompt("Precio:", s.precio) || s.precio;

  await updateDoc(doc(db,"servicios", id), { nombre, descripcion, fecha, precio });
  cargarServicios();
}

// ===================== CARGA INICIAL =====================
cargarProveedores();
cargarFacturas();
cargarGastos();
cargarServicios();







