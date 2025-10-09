// dashboard.js
import { auth, db } from './firebase.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// --- ELEMENTOS ---
const sections = document.querySelectorAll('.content-section');
const navButtons = document.querySelectorAll('.nav-btn');
const logoutBtn = document.getElementById('logoutBtn');

// --- TOGGLE SECCIONES ---
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    sections.forEach(sec => sec.classList.remove('active'));
    document.getElementById(btn.dataset.section).classList.add('active');
  });
});

// --- LOGOUT ---
logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// --- VERIFICAR SESIÓN ---
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html";
  }
});

// --- COLECCIONES ---
const proveedoresCol = collection(db, 'proveedores');
const facturasCol = collection(db, 'facturas');
const gastosCol = collection(db, 'gastos');
const serviciosCol = collection(db, 'servicios');

// --- TABLAS ---
const tablaProveedores = document.getElementById('tablaProveedores');
const tablaFacturas = document.getElementById('tablaFacturas');
const tablaGastos = document.getElementById('tablaGastos');
const tablaServicios = document.getElementById('tablaServicios');

// --- FORMULARIOS ---
const formProveedor = document.getElementById('formProveedor');
const formFactura = document.getElementById('formFactura');
const formGasto = document.getElementById('formGasto');
const formServicio = document.getElementById('formServicio');

const proveedorFacturaSelect = document.getElementById('proveedorFactura');

// --- FUNCIONES CRUD PROVEEDORES ---
formProveedor.addEventListener('submit', async e => {
  e.preventDefault();
  await addDoc(proveedoresCol, {
    ruc: document.getElementById('rucProv').value,
    nombre: document.getElementById('nombreProv').value,
    producto: document.getElementById('productoProv').value,
    direccion: document.getElementById('direccionProv').value
  });
  formProveedor.reset();
});

// --- FUNCIONES CRUD FACTURAS ---
formFactura.addEventListener('submit', async e => {
  e.preventDefault();
  await addDoc(facturasCol, {
    proveedor: proveedorFacturaSelect.value,
    tipo: document.getElementById('tipoFactura').value,
    monto: document.getElementById('montoFactura').value,
    moneda: document.getElementById('monedaFactura').value,
    fecha: document.getElementById('fechaFactura').value,
    descripcion: document.getElementById('descFactura').value
  });
  formFactura.reset();
});

// --- FUNCIONES CRUD GASTOS ---
formGasto.addEventListener('submit', async e => {
  e.preventDefault();
  await addDoc(gastosCol, {
    nombre: document.getElementById('nombreGasto').value,
    tipo: document.getElementById('tipoGasto').value,
    monto: document.getElementById('montoGasto').value,
    fecha: document.getElementById('fechaGasto').value
  });
  formGasto.reset();
});

// --- FUNCIONES CRUD SERVICIOS ---
formServicio.addEventListener('submit', async e => {
  e.preventDefault();
  await addDoc(serviciosCol, {
    nombre: document.getElementById('nombreServ').value,
    precio: document.getElementById('precioServ').value,
    fecha: document.getElementById('fechaServ').value,
    descripcion: document.getElementById('descServ').value
  });
  formServicio.reset();
});

// --- FUNCIONES PARA MOSTRAR EN TIEMPO REAL ---
onSnapshot(proveedoresCol, snapshot => {
  tablaProveedores.innerHTML = '';
  proveedorFacturaSelect.innerHTML = '<option value="">Seleccione proveedor</option>';
  snapshot.forEach(docu => {
    const data = docu.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${data.ruc}</td>
      <td>${data.nombre}</td>
      <td>${data.producto}</td>
      <td>${data.direccion}</td>
      <td>
        <button onclick="editProveedor('${docu.id}', '${data.ruc}', '${data.nombre}', '${data.producto}', '${data.direccion}')">Editar</button>
        <button onclick="deleteProveedor('${docu.id}')">Eliminar</button>
      </td>
    `;
    tablaProveedores.appendChild(tr);

    const option = document.createElement('option');
    option.value = data.nombre;
    option.textContent = data.nombre;
    proveedorFacturaSelect.appendChild(option);
  });
  document.getElementById('countProveedores').textContent = snapshot.size;
});

// --- EDIT / DELETE PROVEEDORES ---
window.deleteProveedor = async id => {
  await deleteDoc(doc(db, 'proveedores', id));
};

window.editProveedor = async (id, ruc, nombre, producto, direccion) => {
  const newNombre = prompt('Nombre:', nombre);
  const newRuc = prompt('RUC:', ruc);
  const newProducto = prompt('Producto:', producto);
  const newDireccion = prompt('Dirección:', direccion);
  await updateDoc(doc(db, 'proveedores', id), {
    ruc: newRuc,
    nombre: newNombre,
    producto: newProducto,
    direccion: newDireccion
  });
};

// --- FACTURAS ---
onSnapshot(facturasCol, snapshot => {
  tablaFacturas.innerHTML = '';
  snapshot.forEach(docu => {
    const data = docu.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${data.proveedor}</td>
      <td>${data.tipo}</td>
      <td>${data.monto} ${data.moneda}</td>
      <td>${data.fecha}</td>
      <td>${data.descripcion}</td>
      <td>
        <button onclick="deleteFactura('${docu.id}')">Eliminar</button>
      </td>
    `;
    tablaFacturas.appendChild(tr);
  });
  document.getElementById('countFacturas').textContent = snapshot.size;
});

window.deleteFactura = async id => {
  await deleteDoc(doc(db, 'facturas', id));
};

// --- GASTOS ---
onSnapshot(gastosCol, snapshot => {
  tablaGastos.innerHTML = '';
  snapshot.forEach(docu => {
    const data = docu.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.tipo}</td>
      <td>${data.monto}</td>
      <td>${data.fecha}</td>
      <td>
        <button onclick="deleteGasto('${docu.id}')">Eliminar</button>
      </td>
    `;
    tablaGastos.appendChild(tr);
  });
  document.getElementById('countGastos').textContent = snapshot.size;
});

window.deleteGasto = async id => {
  await deleteDoc(doc(db, 'gastos', id));
};

// --- SERVICIOS ---
onSnapshot(serviciosCol, snapshot => {
  tablaServicios.innerHTML = '';
  snapshot.forEach(docu => {
    const data = docu.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.precio}</td>
      <td>${data.fecha}</td>
      <td>${data.descripcion}</td>
      <td>
        <button onclick="deleteServicio('${docu.id}')">Eliminar</button>
      </td>
    `;
    tablaServicios.appendChild(tr);
  });
  document.getElementById('countServicios').textContent = snapshot.size;
});

window.deleteServicio = async id => {
  await deleteDoc(doc(db, 'servicios', id));
};


