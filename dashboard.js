import { db } from './firebase.js';
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

// ---------------- SERVICIOS ----------------
const formServicio = document.getElementById('formServicio');
const tablaServicios = document.getElementById('tablaServicios');

async function cargarServicios() {
  tablaServicios.innerHTML = '';
  const querySnapshot = await getDocs(collection(db, "servicios"));
  querySnapshot.forEach((documento) => {
    const data = documento.data();
    tablaServicios.innerHTML += `
      <tr>
        <td>${data.nombre}</td>
        <td>${data.precio}</td>
        <td>${data.fecha}</td>
        <td>${data.descripcion}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="eliminarServicio('${documento.id}')">Eliminar</button>
        </td>
      </tr>
    `;
  });
}

formServicio.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombreServ').value;
  const precio = parseFloat(document.getElementById('precioServ').value) || 0;
  const fecha = document.getElementById('fechaServ').value;
  const descripcion = document.getElementById('descServ').value;

  await addDoc(collection(db, "servicios"), { nombre, precio, fecha, descripcion });
  formServicio.reset();
  cargarServicios();
});

window.eliminarServicio = async (id) => {
  await deleteDoc(doc(db, "servicios", id));
  cargarServicios();
};

// ---------------- PROVEEDORES ----------------
const formProveedor = document.getElementById('formProveedor');
const tablaProveedores = document.getElementById('tablaProveedores');

async function cargarProveedores() {
  tablaProveedores.innerHTML = '';
  const querySnapshot = await getDocs(collection(db, "proveedores"));
  querySnapshot.forEach((documento) => {
    const data = documento.data();
    tablaProveedores.innerHTML += `
      <tr>
        <td>${data.nombre}</td>
        <td>${data.producto}</td>
        <td>${data.ruc}</td>
        <td>${data.direccion}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="eliminarProveedor('${documento.id}')">Eliminar</button>
        </td>
      </tr>
    `;
  });
}

formProveedor.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombreProv').value;
  const producto = document.getElementById('productoProv').value;
  const ruc = document.getElementById('rucProv').value;
  const direccion = document.getElementById('direccionProv').value;

  await addDoc(collection(db, "proveedores"), { nombre, producto, ruc, direccion });
  formProveedor.reset();
  cargarProveedores();
});

window.eliminarProveedor = async (id) => {
  await deleteDoc(doc(db, "proveedores", id));
  cargarProveedores();
};

// ---------------- FACTURAS ----------------
const formFactura = document.getElementById('formFactura');
const tablaFacturas = document.getElementById('tablaFacturas');

async function cargarFacturas() {
  tablaFacturas.innerHTML = '';
  const querySnapshot = await getDocs(collection(db, "facturas"));
  querySnapshot.forEach((documento) => {
    const data = documento.data();
    tablaFacturas.innerHTML += `
      <tr>
        <td>${data.proveedor}</td>
        <td>${data.tipo}</td>
        <td>${data.monto}</td>
        <td>${data.fecha}</td>
        <td>${data.descripcion}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="eliminarFactura('${documento.id}')">Eliminar</button>
        </td>
      </tr>
    `;
  });
}

formFactura.addEventListener('submit', async (e) => {
  e.preventDefault();
  const proveedor = document.getElementById('proveedorFactura').value;
  const tipo = document.getElementById('tipoFactura').value;
  const monto = parseFloat(document.getElementById('montoFactura').value) || 0;
  const fecha = document.getElementById('fechaFactura').value;
  const descripcion = document.getElementById('descFactura').value;

  await addDoc(collection(db, "facturas"), { proveedor, tipo, monto, fecha, descripcion });
  formFactura.reset();
  cargarFacturas();
});

window.eliminarFactura = async (id) => {
  await deleteDoc(doc(db, "facturas", id));
  cargarFacturas();
};

// ---------------- GASTOS ----------------
const formGasto = document.getElementById('formGasto');
const tablaGastos = document.getElementById('tablaGastos');

async function cargarGastos() {
  tablaGastos.innerHTML = '';
  const querySnapshot = await getDocs(collection(db, "gastos"));
  querySnapshot.forEach((documento) => {
    const data = documento.data();
    tablaGastos.innerHTML += `
      <tr>
        <td>${data.nombre}</td>
        <td>${data.tipo}</td>
        <td>${data.monto}</td>
        <td>${data.fecha}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="eliminarGasto('${documento.id}')">Eliminar</button>
        </td>
      </tr>
    `;
  });
}

formGasto.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombreGasto').value;
  const tipo = document.getElementById('tipoGasto').value;
  const monto = parseFloat(document.getElementById('montoGasto').value) || 0;
  const fecha = document.getElementById('fechaGasto').value;

  await addDoc(collection(db, "gastos"), { nombre, tipo, monto, fecha });
  formGasto.reset();
  cargarGastos();
});

window.eliminarGasto = async (id) => {
  await deleteDoc(doc(db, "gastos", id));
  cargarGastos();
};

// ---------------- INICIALIZAR CARGA ----------------
window.addEventListener('DOMContentLoaded', () => {
  cargarServicios();
  cargarProveedores();
  cargarFacturas();
  cargarGastos();
});











