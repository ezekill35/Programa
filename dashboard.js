// =======================================
// 🐾 Dashboard JS - Discovery Pets (Firebase)
// =======================================

import { db, auth } from './firebase.js';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// ------------------ Variables ------------------
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
    if(sectionId === 'logout'){
      cerrarSesion();
      return;
    }
    document.getElementById(sectionId).classList.add('active');
  });
});

// =================== FIREBASE COLLECTIONS ===================
const proveedoresCol = collection(db, "proveedores");
const facturasCol = collection(db, "facturas");
const gastosCol = collection(db, "gastos");
const serviciosCol = collection(db, "servicios");

// ------------------ PROVEEDORES ------------------
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
  snapshot.forEach(doc => proveedores.push({ id: doc.id, ...doc.data() }));
  actualizarProveedores();
});

function actualizarProveedores() {
  listaProveedores.innerHTML = '';
  proveedores.forEach(p => {
    listaProveedores.innerHTML += `
      <tr>
        <td>${p.ruc}</td>
        <td>${p.nombre}</td>
        <td>${p.direccion}</td>
        <td>${p.telefono}</td>
        <td>${p.producto}</td>
        <td>
          <button class="btn btn-sm btn-primary me-1" onclick="editarProveedor('${p.id}')">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarProveedorFirebase('${p.id}')">❌</button>
        </td>
      </tr>
    `;
  });
  totalProveedores.textContent = proveedores.length;
  actualizarSelectProveedores();
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

async function eliminarProveedorFirebase(id) {
  if(confirm('¿Eliminar proveedor?')){
    await deleteDoc(doc(db,"proveedores", id));
  }
}

function actualizarSelectProveedores() {
  const select = document.getElementById('facRucProveedor');
  if(!select) return;
  select.innerHTML = `<option value="">-- Selecciona un Proveedor --</option>`;
  proveedores.forEach(p => {
    select.innerHTML += `<option value="${p.nombre}">${p.nombre}</option>`;
  });
}

// ------------------ FACTURAS ------------------
const listaFacturas = document.getElementById('listaFacturas');
const btnAgregarFactura = document.getElementById('btnAgregarFactura');

btnAgregarFactura.addEventListener('click', async () => {
  const proveedor = document.getElementById('facRucProveedor').value;
  const tipo = document.getElementById('facTipo').value.trim();
  const descripcion = document.getElementById('facDescripcion').value.trim();
  const fecha = document.getElementById('facFecha').value;
  const monto = parseFloat(document.getElementById('facMonto').value.trim());
  const moneda = document.getElementById('facMoneda').value;

  if(!proveedor || !tipo) return alert('Proveedor y Tipo son obligatorios');
  if(isNaN(monto)) return alert('Monto debe ser un número');

  await addDoc(facturasCol, { proveedor, tipo, descripcion, fecha, monto, moneda });

  document.getElementById('facTipo').value='';
  document.getElementById('facDescripcion').value='';
  document.getElementById('facFecha').value='';
  document.getElementById('facMonto').value='';
});

// Cargar facturas en tiempo real
onSnapshot(facturasCol, snapshot => {
  facturas = [];
  snapshot.forEach(doc => facturas.push({ id: doc.id, ...doc.data() }));
  actualizarFacturas();
});

function actualizarFacturas() {
  listaFacturas.innerHTML = '';
  facturas.forEach(f => {
    listaFacturas.innerHTML += `
      <tr>
        <td>${f.proveedor}</td>
        <td>${f.tipo}</td>
        <td>${f.descripcion}</td>
        <td>${f.fecha}</td>
        <td>${f.moneda}${f.monto.toFixed(2)}</td>
        <td>
          <button class="btn btn-sm btn-primary me-1" onclick="editarFactura('${f.id}')">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarFacturaFirebase('${f.id}')">❌</button>
        </td>
      </tr>
    `;
  });
  totalFacturas.textContent = facturas.length;
}

window.editarFactura = async (id) => {
  const f = facturas.find(x => x.id===id);
  const proveedor = prompt("Proveedor:", f.proveedor) || f.proveedor;
  const tipo = prompt("Tipo:", f.tipo) || f.tipo;
  const descripcion = prompt("Descripción:", f.descripcion) || f.descripcion;
  const fecha = prompt("Fecha:", f.fecha) || f.fecha;
  const monto = parseFloat(prompt("Monto:", f.monto)) || f.monto;
  const moneda = prompt("Moneda (S/, $, €):", f.moneda) || f.moneda;

  if(isNaN(monto)) return alert('Monto debe ser número');

  await updateDoc(doc(db,"facturas",id), { proveedor, tipo, descripcion, fecha, monto, moneda });
}

async function eliminarFacturaFirebase(id){
  if(confirm('¿Eliminar factura?')) await deleteDoc(doc(db,"facturas",id));
}

// ------------------ GASTOS ------------------
const listaGastos = document.getElementById('listaGastos');
const btnAgregarGasto = document.getElementById('btnAgregarGasto');

btnAgregarGasto.addEventListener('click', async () => {
  const nombre = document.getElementById('gastoNombre').value.trim();
  const tipo = document.getElementById('gastoTipo').value;
  const monto = parseFloat(document.getElementById('gastoMonto').value.trim());
  const fecha = document.getElementById('gastoFecha').value;

  if(!nombre || !tipo) return alert('Nombre y Tipo son obligatorios');
  if(isNaN(monto)) return alert('Monto debe ser número');

  await addDoc(gastosCol, { nombre, tipo, monto, fecha });
  document.getElementById('formGasto').reset();
});

// Tiempo real gastos
onSnapshot(gastosCol, snapshot => {
  gastos = [];
  snapshot.forEach(doc => gastos.push({ id: doc.id, ...doc.data() }));
  actualizarGastos();
});

function actualizarGastos(){
  listaGastos.innerHTML='';
  gastos.forEach(g => {
    listaGastos.innerHTML+=`
      <tr>
        <td>${g.nombre}</td>
        <td>${g.tipo}</td>
        <td>${g.monto.toFixed(2)}</td>
        <td>${g.fecha}</td>
        <td>
          <button class="btn btn-sm btn-primary me-1" onclick="editarGasto('${g.id}')">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarGastoFirebase('${g.id}')">❌</button>
        </td>
      </tr>
    `;
  });
  totalGastos.textContent = gastos.length;
}

window.editarGasto = async id => {
  const g = gastos.find(x => x.id===id);
  const nombre = prompt("Nombre:", g.nombre)||g.nombre;
  const tipo = prompt("Tipo:", g.tipo)||g.tipo;
  const monto = parseFloat(prompt("Monto:", g.monto))||g.monto;
  const fecha = prompt("Fecha:", g.fecha)||g.fecha;

  if(isNaN(monto)) return alert('Monto debe ser número');

  await updateDoc(doc(db,"gastos",id), {nombre,tipo,monto,fecha});
}

async function eliminarGastoFirebase(id){
  if(confirm('¿Eliminar gasto?')) await deleteDoc(doc(db,"gastos",id));
}

// ------------------ CERRAR SESIÓN ------------------
async function cerrarSesion(){
  await signOut(auth);
  alert("Sesión cerrada");
  window.location.href = 'index.html';
}

window.cerrarSesion = cerrarSesion;






