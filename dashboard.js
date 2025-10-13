// dashboard.js
import { db } from "./firebase.js";
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// ------------------- GLOBAL -------------------
const tablaProveedores = document.getElementById('tablaProveedores');
const tablaProductos = document.getElementById('tablaProductos');
const tablaFacturas = document.getElementById('tablaFacturas');

const modalDetalle = document.getElementById('modalDetalle');
const cerrarModalDetalle = document.getElementById('cerrarModalDetalle');

// ------------------- MODALES -------------------
cerrarModalDetalle?.addEventListener('click', () => modalDetalle.style.display = 'none');

window.closeFactura = () => {
  document.getElementById('modalFactura').style.display = 'none';
};
window.closeResultados = () => {
  document.getElementById('modalResultados').style.display = 'none';
};

// ------------------- PROVEEDORES -------------------
const proveedoresCol = collection(db, 'proveedores');

const renderProveedores = (proveedores) => {
  tablaProveedores.innerHTML = '';
  proveedores.forEach((prov) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${prov.ruc}</td>
      <td>${prov.nombre}</td>
      <td>${prov.direccion || ''}</td>
      <td>
        <button class="btn secondary" onclick="editarProveedor('${prov.id}')">Editar</button>
        <button class="btn secondary" onclick="eliminarProveedor('${prov.id}')">Eliminar</button>
      </td>`;
    tablaProveedores.appendChild(tr);
  });
};

// Escuchar cambios en tiempo real
onSnapshot(proveedoresCol, (snapshot) => {
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderProveedores(data);

  // Actualizar select de proveedores en facturas
  const selectProv = document.getElementById('proveedorFactura');
  selectProv.innerHTML = '<option value="">Seleccione proveedor</option>';
  data.forEach(p => selectProv.innerHTML += `<option value="${p.nombre}">${p.nombre}</option>`);
});

// Agregar proveedor
document.getElementById('proveedorForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const ruc = document.getElementById('rucProveedor').value;
  const nombre = document.getElementById('nombreProveedor').value;
  const direccion = document.getElementById('direccionProveedor').value;
  await addDoc(proveedoresCol, { ruc, nombre, direccion });
  e.target.reset();
});

// Editar y Eliminar proveedores
window.editarProveedor = async (id) => {
  const docRef = doc(db, 'proveedores', id);
  const data = await getDocs(docRef).then(d => d.data());
  const nuevoNombre = prompt('Editar nombre', data.nombre);
  if (nuevoNombre) await updateDoc(docRef, { nombre: nuevoNombre });
};

window.eliminarProveedor = async (id) => {
  if (confirm('¿Eliminar proveedor?')) await deleteDoc(doc(db, 'proveedores', id));
};

// ------------------- PRODUCTOS -------------------
const productosCol = collection(db, 'productos');

const renderProductos = (productos) => {
  tablaProductos.innerHTML = '';
  productos.forEach((prod) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${prod.nombre}</td>
      <td>${prod.cantidad || ''}</td>
      <td>${prod.unidad || ''}</td>
      <td>${prod.valorUnitario || ''}</td>
      <td>
        <button class="btn secondary" onclick="editarProducto('${prod.id}')">Editar</button>
        <button class="btn secondary" onclick="eliminarProducto('${prod.id}')">Eliminar</button>
      </td>`;
    tablaProductos.appendChild(tr);
  });

  // Actualizar select de productos en facturas
  const selectProd = document.getElementById('productoFactura');
  selectProd.innerHTML = '<option value="">Seleccione producto</option>';
  productos.forEach(p => selectProd.innerHTML += `<option value="${p.nombre}">${p.nombre}</option>`);
};

onSnapshot(productosCol, (snapshot) => {
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderProductos(data);
});

document.getElementById('productoForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombreProducto').value;
  const cantidad = document.getElementById('cantidadProducto').value;
  const unidad = document.getElementById('unidadProducto').value;
  const valorUnitario = document.getElementById('valorUnitarioProducto').value;
  await addDoc(productosCol, { nombre, cantidad, unidad, valorUnitario });
  e.target.reset();
});

window.editarProducto = async (id) => {
  const docRef = doc(db, 'productos', id);
  const data = await getDocs(docRef).then(d => d.data());
  const nuevoNombre = prompt('Editar producto', data.nombre);
  if (nuevoNombre) await updateDoc(docRef, { nombre: nuevoNombre });
};
window.eliminarProducto = async (id) => {
  if (confirm('¿Eliminar producto?')) await deleteDoc(doc(db, 'productos', id));
};

// ------------------- FACTURAS -------------------
const facturasCol = collection(db, 'facturas');

const renderFacturas = (facturas) => {
  tablaFacturas.innerHTML = '';
  facturas.forEach((fac) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${fac.numero}</td>
      <td>${fac.proveedor}</td>
      <td>${fac.producto}</td>
      <td>${fac.monto}</td>
      <td>${fac.tipo}</td>
      <td>${fac.fecha}</td>
      <td>
        <button class="btn secondary" onclick="verFactura('${fac.id}')">Ver</button>
        <button class="btn secondary" onclick="editarFactura('${fac.id}')">Editar</button>
        <button class="btn secondary" onclick="eliminarFactura('${fac.id}')">Eliminar</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  });
};

onSnapshot(facturasCol, (snapshot) => {
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderFacturas(data);
});

document.getElementById('facturaForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const numero = document.getElementById('numeroFactura').value;
  const fecha = document.getElementById('fechaEmisionFactura').value;
  const proveedor = document.getElementById('proveedorFactura').value;
  const producto = document.getElementById('productoFactura').value;
  const monto = document.getElementById('montoFactura').value;
  const moneda = document.getElementById('monedaFactura').value;
  const tipo = document.getElementById('tipoFactura').value;
  await addDoc(facturasCol, { numero, fecha, proveedor, producto, monto, moneda, tipo });
  e.target.reset();
});

window.verFactura = async (id) => {
  const docRef = doc(db, 'facturas', id);
  const docSnap = await getDocs(docRef).then(d => d.data());
  if (!docSnap) return;
  document.getElementById('facturaNumero').textContent = docSnap.numero;
  document.getElementById('facturaFecha').textContent = docSnap.fecha;
  document.getElementById('facturaProveedor').textContent = docSnap.proveedor;
  document.getElementById('facturaProducto').textContent = docSnap.producto;
  document.getElementById('facturaMonto').textContent = docSnap.monto;
  document.getElementById('facturaMoneda').textContent = docSnap.moneda;
  document.getElementById('facturaTipo').textContent = docSnap.tipo;
  document.getElementById('modalFactura').style.display = 'flex';
};

window.editarFactura = async (id) => {
  const docRef = doc(db, 'facturas', id);
  const data = await getDocs(docRef).then(d => d.data());
  const nuevoMonto = prompt('Editar monto', data.monto);
  if (nuevoMonto) await updateDoc(docRef, { monto: nuevoMonto });
};

window.eliminarFactura = async (id) => {
  if (confirm('¿Eliminar factura?')) await deleteDoc(doc(db, 'facturas', id));
};




