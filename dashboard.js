import { db } from './firebase.js';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Navegación entre secciones
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.content-section');
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.section).classList.add('active');
  });
});

// --- PROVEEDORES ---
const formProv = document.getElementById('formProveedor');
const tablaProv = document.getElementById('tablaProveedores');
const msgProv = document.getElementById('msgProv');
formProv.addEventListener('submit', async e => {
  e.preventDefault();
  const nombre = formProv.nombreProv.value.trim();
  const producto = formProv.productoProv.value.trim();
  const ruc = formProv.rucProv.value.trim();
  const direccion = formProv.direccionProv.value.trim();
  if (!nombre || !producto || !ruc) return msgProv.textContent = '⚠️ Todos los campos son obligatorios';
  try {
    await addDoc(collection(db, 'proveedores'), { nombre, producto, ruc, direccion });
    msgProv.textContent = '✅ Proveedor guardado con éxito';
    formProv.reset();
  } catch {
    msgProv.textContent = '❌ Error al guardar proveedor';
  }
});
onSnapshot(collection(db, 'proveedores'), snapshot => {
  tablaProv.innerHTML = '';
  snapshot.forEach(docu => {
    const d = docu.data();
    tablaProv.innerHTML += `
      <tr>
        <td>${d.nombre}</td><td>${d.producto}</td><td>${d.ruc}</td><td>${d.direccion}</td>
        <td><button onclick="eliminar('${docu.id}','proveedores')">🗑️</button></td>
      </tr>`;
  });
  document.getElementById('countProveedores').textContent = snapshot.size;
});

// --- FACTURAS ---
const formFactura = document.getElementById('formFactura');
const tablaFactura = document.getElementById('tablaFacturas');
const msgFactura = document.getElementById('msgFactura');
formFactura.addEventListener('submit', async e => {
  e.preventDefault();
  const data = {
    proveedor: formFactura.proveedorFactura.value.trim(),
    tipo: formFactura.tipoFactura.value.trim(),
    monto: parseFloat(formFactura.montoFactura.value),
    fecha: formFactura.fechaFactura.value,
    descripcion: formFactura.descFactura.value.trim()
  };
  try {
    await addDoc(collection(db, 'facturas'), data);
    msgFactura.textContent = '✅ Factura registrada';
    formFactura.reset();
  } catch {
    msgFactura.textContent = '❌ Error al guardar factura';
  }
});
onSnapshot(collection(db, 'facturas'), snapshot => {
  tablaFactura.innerHTML = '';
  snapshot.forEach(docu => {
    const d = docu.data();
    tablaFactura.innerHTML += `
      <tr>
        <td>${d.proveedor}</td><td>${d.tipo}</td><td>${d.monto}</td><td>${d.fecha}</td><td>${d.descripcion}</td>
        <td><button onclick="eliminar('${docu.id}','facturas')">🗑️</button></td>
      </tr>`;
  });
  document.getElementById('countFacturas').textContent = snapshot.size;
});

// --- GASTOS ---
const formGasto = document.getElementById('formGasto');
const tablaGasto = document.getElementById('tablaGastos');
const msgGasto = document.getElementById('msgGasto');
formGasto.addEventListener('submit', async e => {
  e.preventDefault();
  const data = {
    nombre: formGasto.nombreGasto.value.trim(),
    tipo: formGasto.tipoGasto.value.trim(),
    monto: parseFloat(formGasto.montoGasto.value),
    fecha: formGasto.fechaGasto.value
  };
  try {
    await addDoc(collection(db, 'gastos'), data);
    msgGasto.textContent = '✅ Gasto agregado';
    formGasto.reset();
  } catch {
    msgGasto.textContent = '❌ Error al guardar gasto';
  }
});
onSnapshot(collection(db, 'gastos'), snapshot => {
  tablaGasto.innerHTML = '';
  snapshot.forEach(docu => {
    const d = docu.data();
    tablaGasto.innerHTML += `
      <tr>
        <td>${d.nombre}</td><td>${d.tipo}</td><td>${d.monto}</td><td>${d.fecha}</td>
        <td><button onclick="eliminar('${docu.id}','gastos')">🗑️</button></td>
      </tr>`;
  });
  document.getElementById('countGastos').textContent = snapshot.size;
});

// --- SERVICIOS ---
const formServ = document.getElementById('formServicio');
const tablaServ = document.getElementById('tablaServicios');
const msgServ = document.getElementById('msgServ');
formServ.addEventListener('submit', async e => {
  e.preventDefault();
  const data = {
    nombre: formServ.nombreServ.value.trim(),
    precio: parseFloat(formServ.precioServ.value),
    fecha: formServ.fechaServ.value,
    descripcion: formServ.descServ.value.trim()
  };
  try {
    await addDoc(collection(db, 'servicios'), data);
    msgServ.textContent = '✅ Servicio agregado';
    formServ.reset();
  } catch {
    msgServ.textContent = '❌ Error al guardar servicio';
  }
});
onSnapshot(collection(db, 'servicios'), snapshot => {
  tablaServ.innerHTML = '';
  snapshot.forEach(docu => {
    const d = docu.data();
    tablaServ.innerHTML += `
      <tr>
        <td>${d.nombre}</td><td>${d.precio}</td><td>${d.fecha}</td><td>${d.descripcion}</td>
        <td><button onclick="eliminar('${docu.id}','servicios')">🗑️</button></td>
      </tr>`;
  });
  document.getElementById('countServicios').textContent = snapshot.size;
});

// Eliminar documento
window.eliminar = async (id, coleccion) => {
  await deleteDoc(doc(db, coleccion, id));
};

// Cerrar sesión
document.getElementById('logoutBtn').addEventListener('click', () => {
  window.location.href = 'index.html';
});









