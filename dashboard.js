// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  databaseURL: "https://discovery-pets-default-rtdb.firebaseio.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.firebasestorage.app",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322",
  measurementId: "G-0WMLRY8FGM"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --------------------- REFERENCIAS ---------------------
const proveedoresRef = ref(db, "proveedores");
const productosRef = ref(db, "productos");
const facturasRef = ref(db, "facturas");

// --------------------- SELECTS ---------------------
const proveedorSelect = document.getElementById("proveedorFactura");
const productoSelect = document.getElementById("productoFactura");

// --------------------- TABLAS ---------------------
const tablaProveedores = document.getElementById("tablaProveedores");
const tablaProductos = document.getElementById("tablaProductos");
const tablaFacturas = document.getElementById("tablaFacturas");

// --------------------- FORMULARIOS ---------------------
const proveedorForm = document.getElementById("proveedorForm");
const productoForm = document.getElementById("productoForm");
const facturaForm = document.getElementById("facturaForm");

// --------------------- CRUD PROVEEDORES ---------------------
proveedorForm.addEventListener("submit", e => {
  e.preventDefault();
  const data = {
    nombre: document.getElementById("nombreProveedor").value,
    ruc: document.getElementById("rucProveedor").value,
    telefono: document.getElementById("telefonoProveedor").value,
    opc: document.getElementById("numeroOpcionalProveedor").value,
    direccion: document.getElementById("direccionProveedor").value
  };
  push(proveedoresRef, data);
  proveedorForm.reset();
});

// Mostrar proveedores en tiempo real
onValue(proveedoresRef, snapshot => {
  tablaProveedores.innerHTML = "";
  proveedorSelect.innerHTML = '<option value="">Seleccione proveedor</option>';
  snapshot.forEach(childSnap => {
    const d = childSnap.val();
    const id = childSnap.key;
    tablaProveedores.innerHTML += `<tr>
      <td>${d.nombre}</td>
      <td>${d.ruc}</td>
      <td>${d.telefono}</td>
      <td>${d.opc}</td>
      <td>${d.direccion}</td>
      <td><button onclick="borrar('proveedores','${id}')">❌</button></td>
    </tr>`;
    proveedorSelect.innerHTML += `<option value="${d.nombre}">${d.nombre}</option>`;
  });
});

// --------------------- CRUD PRODUCTOS ---------------------
productoForm.addEventListener("submit", e => {
  e.preventDefault();
  const data = {
    nombre: document.getElementById("nombreProducto").value,
    precio: document.getElementById("precioProducto").value,
    cantidad: document.getElementById("cantidadProducto").value,
    descripcion: document.getElementById("descripcionProducto").value
  };
  push(productosRef, data);
  productoForm.reset();
});

onValue(productosRef, snapshot => {
  tablaProductos.innerHTML = "";
  productoSelect.innerHTML = '<option value="">Seleccione producto</option>';
  snapshot.forEach(childSnap => {
    const d = childSnap.val();
    const id = childSnap.key;
    tablaProductos.innerHTML += `<tr>
      <td>${d.nombre}</td>
      <td>${d.precio}</td>
      <td>${d.cantidad}</td>
      <td>${d.descripcion}</td>
      <td><button onclick="borrar('productos','${id}')">❌</button></td>
    </tr>`;
    productoSelect.innerHTML += `<option value="${d.nombre}">${d.nombre}</option>`;
  });
});

// --------------------- CRUD FACTURAS ---------------------
facturaForm.addEventListener("submit", e => {
  e.preventDefault();
  const data = {
    id: document.getElementById("idFactura").value,
    fecha: document.getElementById("fechaFactura").value,
    proveedor: document.getElementById("proveedorFactura").value,
    producto: document.getElementById("productoFactura").value,
    monto: document.getElementById("montoFactura").value,
    moneda: document.getElementById("monedaFactura").value,
    tipo: document.getElementById("tipoFactura").value
  };
  push(facturasRef, data);
  facturaForm.reset();
});

onValue(facturasRef, snapshot => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(childSnap => {
    const d = childSnap.val();
    const id = childSnap.key;
    tablaFacturas.innerHTML += `<tr>
      <td>${d.id}</td>
      <td>${d.fecha}</td>
      <td>${d.proveedor}</td>
      <td>${d.producto}</td>
      <td>${d.moneda}</td>
      <td>${d.monto}</td>
      <td>${d.tipo}</td>
      <td><button onclick="borrar('facturas','${id}')">❌</button></td>
    </tr>`;
  });
});

// --------------------- BORRAR ---------------------
window.borrar = (col, id) => {
  let referencia;
  if (col === "proveedores") referencia = ref(db, `proveedores/${id}`);
  if (col === "productos") referencia = ref(db, `productos/${id}`);
  if (col === "facturas") referencia = ref(db, `facturas/${id}`);
  remove(referencia);
};

// --------------------- NAVEGACIÓN ---------------------
document.querySelectorAll(".menu-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".menu-btn").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    document.querySelectorAll(".seccion").forEach(s => s.classList.remove("activa"));
    document.getElementById(btn.dataset.target).classList.add("activa");
  });
});

// --------------------- RESTABLECER BUSCADOR ---------------------
document.getElementById("btnRefresh").addEventListener("click", () => {
  document.getElementById("buscadorFactura").value = "";
});





