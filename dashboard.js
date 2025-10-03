import { db, auth, cerrarSesion } from './firebase.js';
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
    sections.forEach(sec => sec.classList.add('d-none'));
    item.classList.add('active');

    const sectionId = item.id.replace('menu-', '');
    if(sectionId === 'logout'){
      cerrarSesion();
      return;
    }
    document.getElementById(sectionId).classList.remove('d-none');
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

  try {
    await addDoc(proveedoresCol, { ruc, nombre, direccion, telefono, producto });
    alert('Proveedor agregado correctamente a la base de datos');
    document.getElementById('formProveedor').reset();
  } catch (error) {
    alert('Error al guardar proveedor: '+error.message);
  }
});

// Tiempo real proveedores
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
          <button class="btn btn-sm btn-warning" onclick="editarProveedor('${p.id}')">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarProveedorFirebase('${p.id}')">❌</button>
        </td>
      </tr>
    `;
  });
  totalProveedores.textContent = proveedores.length;
}

// Editar proveedor
window.editarProveedor = async (id) => {
  const p = proveedores.find(x => x.id===id);
  const ruc = prompt("RUC:", p.ruc) || p.ruc;
  const nombre = prompt("Nombre:", p.nombre) || p.nombre;
  const direccion = prompt("Dirección:", p.direccion) || p.direccion;
  const telefono = prompt("Teléfono:", p.telefono) || p.telefono;
  const producto = prompt("Producto:", p.producto) || p.producto;
  if(isNaN(ruc) || isNaN(telefono)) return alert('RUC y Teléfono deben ser números');
  await updateDoc(doc(db,"proveedores",id), { ruc, nombre, direccion, telefono, producto });
  alert('Proveedor actualizado correctamente');
}

// Eliminar proveedor
window.eliminarProveedorFirebase = async (id) => {
  if(confirm('¿Eliminar proveedor?')) {
    await deleteDoc(doc(db,"proveedores",id));
    alert('Proveedor eliminado');
  }
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

  try {
    await addDoc(facturasCol, { proveedor, tipo, descripcion, fecha, monto, moneda });
    alert('Factura agregada correctamente a la base de datos');
    document.getElementById('facTipo').value='';
    document.getElementById('facDescripcion').value='';
    document.getElementById('facFecha').value='';
    document.getElementById('facMonto').value='';
  } catch(error) {
    alert('Error al guardar factura: '+error.message);
  }
});

// Tiempo real facturas
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
          <button class="btn btn-sm btn-warning" onclick="editarFactura('${f.id}')">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarFacturaFirebase('${f.id}')">❌</button>
        </td>
      </tr>
    `;
  });
  totalFacturas.textContent = facturas.length;
}

// Editar factura
window.editarFactura = async id => {
  const f = facturas.find(x=>x.id===id);
  const proveedor = prompt("Proveedor:", f.proveedor) || f.proveedor;
  const tipo = prompt("Tipo:", f.tipo) || f.tipo;
  const descripcion = prompt("Descripción:", f.descripcion) || f.descripcion;
  const fecha = prompt("Fecha:", f.fecha) || f.fecha;
  const monto = parseFloat(prompt("Monto:", f.monto)) || f.monto;
  const moneda = prompt("Moneda:", f.moneda) || f.moneda;
  if(isNaN(monto)) return alert('Monto debe ser número');
  await updateDoc(doc(db,"facturas",id), { proveedor, tipo, descripcion, fecha, monto, moneda });
  alert('Factura actualizada correctamente');
}

// Eliminar factura
window.eliminarFacturaFirebase = async id => {
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

  try {
    await addDoc(gastosCol, { nombre, tipo, monto, fecha });
    alert('Gasto agregado correctamente a la base de datos');
    document.getElementById('formGasto').reset();
  } catch(error) {
    alert('Error al guardar gasto: '+error.message);
  }
});

// Tiempo real gastos
onSnapshot(gastosCol, snapshot => {
  gastos = [];
  snapshot.forEach(doc => gastos.push({ id: doc.id, ...doc.data() }));
  actualizarGastos();
});

function actualizarGastos() {
  listaGastos.innerHTML = '';
  gastos.forEach(g => {
    listaGastos.innerHTML += `
      <tr>
        <td>${g.nombre}</td>
        <td>${g.tipo}</td>
        <td>${g.monto.toFixed(2)}</td>
        <td>${g.fecha}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editarGasto('${g.id}')">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarGastoFirebase('${g.id}')">❌</button>
        </td>
      </tr>
    `;
  });
  totalGastos.textContent = gastos.length;
}

window.editarGasto = async id => {
  const g = gastos.find(x=>x.id===id);
  const nombre = prompt("Nombre:", g.nombre)||g.nombre;
  const tipo = prompt("Tipo:", g.tipo)||g.tipo;
  const monto = parseFloat(prompt("Monto:", g.monto))||g.monto;
  const fecha = prompt("Fecha:", g.fecha)||g.fecha;
  if(isNaN(monto)) return alert('Monto debe ser número');
  await updateDoc(doc(db,"gastos",id), {nombre,tipo,monto,fecha});
  alert('Gasto actualizado correctamente');
}

// Eliminar gasto
window.eliminarGastoFirebase = async id => {
  if(confirm('¿Eliminar gasto?')) await deleteDoc(doc(db,"gastos",id));
}

// ------------------ CERRAR SESIÓN ------------------
window.cerrarSesion = async () => {
  await signOut(auth);
  alert("Sesión cerrada");
  window.location.href = 'index.html';
}






