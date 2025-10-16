// ============================
//   DISCOVERY PETS DASHBOARD
// ============================

// Importar Firebase SDK v9+
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot, doc,
  deleteDoc, updateDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Configuración Firebase Discovery Pets
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.firebasestorage.app",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322",
  measurementId: "G-0WMLRY8FGM"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================
//  CAMBIO ENTRE SECCIONES
// ============================
const tabButtons = document.querySelectorAll('.tabs button');
const sections = document.querySelectorAll('.content-section');
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.target).classList.add('active');
  });
});

// ============================
//   CRUD DE PROVEEDORES
// ============================
const provNombre = document.getElementById('provNombre');
const provRuc = document.getElementById('provRuc');
const provTelefono = document.getElementById('provTelefono');
const provNumero = document.getElementById('provNumero');
const provDireccion = document.getElementById('provDireccion');
const provId = document.getElementById('provId');
const tablaProveedores = document.getElementById('tablaProveedores');
const btnGuardarProveedor = document.getElementById('btnGuardarProveedor');

btnGuardarProveedor.addEventListener('click', async () => {
  const data = {
    nombre: provNombre.value,
    ruc: provRuc.value,
    telefono: provTelefono.value,
    numero: provNumero.value,
    direccion: provDireccion.value
  };
  const id = provId.value.trim();
  if (id) {
    await setDoc(doc(db, "proveedores", id), data);
  } else {
    await addDoc(collection(db, "proveedores"), data);
  }
  limpiarProveedores();
});

function limpiarProveedores() {
  provId.value = '';
  provNombre.value = '';
  provRuc.value = '';
  provTelefono.value = '';
  provNumero.value = '';
  provDireccion.value = '';
}

// Mostrar en tiempo real
onSnapshot(collection(db, "proveedores"), (snapshot) => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach((docu) => {
    const p = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${docu.id}</td>
      <td>${p.nombre}</td>
      <td>${p.ruc}</td>
      <td>${p.telefono}</td>
      <td>${p.numero || '-'}</td>
      <td>${p.direccion}</td>
      <td>
        <button class="btn btn-sm btn-warning editar" data-id="${docu.id}">✏️</button>
        <button class="btn btn-sm btn-danger eliminar" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaProveedores.appendChild(tr);
  });
});

// Editar proveedor
tablaProveedores.addEventListener('click', async (e) => {
  if (e.target.classList.contains('editar')) {
    const id = e.target.dataset.id;
    const docSnap = (await getDocs(collection(db, "proveedores"))).docs.find(d => d.id === id);
    if (docSnap) {
      const p = docSnap.data();
      provId.value = id;
      provNombre.value = p.nombre;
      provRuc.value = p.ruc;
      provTelefono.value = p.telefono;
      provNumero.value = p.numero || '';
      provDireccion.value = p.direccion;
    }
  }
  if (e.target.classList.contains('eliminar')) {
    await deleteDoc(doc(db, "proveedores", e.target.dataset.id));
  }
});

// ============================
//   CRUD DE PRODUCTOS
// ============================
const prodId = document.getElementById('prodId');
const prodNombre = document.getElementById('prodNombre');
const prodPrecio = document.getElementById('prodPrecio');
const prodCantidad = document.getElementById('prodCantidad');
const prodDescripcion = document.getElementById('prodDescripcion');
const tablaProductos = document.getElementById('tablaProductos');
const btnGuardarProducto = document.getElementById('btnGuardarProducto');

btnGuardarProducto.addEventListener('click', async () => {
  const data = {
    nombre: prodNombre.value,
    precio: parseFloat(prodPrecio.value),
    cantidad: parseInt(prodCantidad.value),
    descripcion: prodDescripcion.value || ''
  };
  const id = prodId.value.trim();
  if (id) {
    await setDoc(doc(db, "productos", id), data);
  } else {
    await addDoc(collection(db, "productos"), data);
  }
  limpiarProductos();
});

function limpiarProductos() {
  prodId.value = '';
  prodNombre.value = '';
  prodPrecio.value = '';
  prodCantidad.value = '';
  prodDescripcion.value = '';
}

onSnapshot(collection(db, "productos"), (snapshot) => {
  tablaProductos.innerHTML = "";
  snapshot.forEach((docu) => {
    const p = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${docu.id}</td>
      <td>${p.nombre}</td>
      <td>${p.precio}</td>
      <td>${p.cantidad}</td>
      <td>${p.descripcion}</td>
      <td>
        <button class="btn btn-sm btn-warning editar" data-id="${docu.id}">✏️</button>
        <button class="btn btn-sm btn-danger eliminar" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaProductos.appendChild(tr);
  });
});

// ============================
//   CRUD DE FACTURAS
// ============================
const facturaId = document.getElementById('facturaId');
const facturaProveedor = document.getElementById('facturaProveedor');
const facturaProducto = document.getElementById('facturaProducto');
const facturaCantidad = document.getElementById('facturaCantidad');
const facturaFecha = document.getElementById('facturaFecha');
const tablaFacturas = document.getElementById('tablaFacturas');
const btnGuardarFactura = document.getElementById('btnGuardarFactura');

// Cargar proveedores y productos en los select
async function cargarSelects() {
  facturaProveedor.innerHTML = "<option value=''>Seleccionar proveedor</option>";
  facturaProducto.innerHTML = "<option value=''>Seleccionar producto</option>";

  const proveedores = await getDocs(collection(db, "proveedores"));
  proveedores.forEach(docu => {
    const p = docu.data();
    facturaProveedor.innerHTML += `<option value="${p.nombre}">${p.nombre}</option>`;
  });

  const productos = await getDocs(collection(db, "productos"));
  productos.forEach(docu => {
    const p = docu.data();
    facturaProducto.innerHTML += `<option value="${p.nombre}">${p.nombre}</option>`;
  });
}
setInterval(cargarSelects, 3000); // actualización en vivo

btnGuardarFactura.addEventListener('click', async () => {
  const data = {
    proveedor: facturaProveedor.value,
    producto: facturaProducto.value,
    cantidad: parseInt(facturaCantidad.value),
    fecha: facturaFecha.value
  };
  const id = facturaId.value.trim();
  if (id) {
    await setDoc(doc(db, "facturas", id), data);
  } else {
    await addDoc(collection(db, "facturas"), data);
  }
  limpiarFacturas();
});

function limpiarFacturas() {
  facturaId.value = '';
  facturaProveedor.value = '';
  facturaProducto.value = '';
  facturaCantidad.value = '';
  facturaFecha.value = '';
}

onSnapshot(collection(db, "facturas"), (snapshot) => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach((docu) => {
    const f = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${docu.id}</td>
      <td>${f.proveedor}</td>
      <td>${f.producto}</td>
      <td>${f.cantidad}</td>
      <td>${f.fecha}</td>
      <td>
        <button class="btn btn-sm btn-warning editar" data-id="${docu.id}">✏️</button>
        <button class="btn btn-sm btn-danger eliminar" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  });
});

// ============================
//   BUSCADORES EN TIEMPO REAL
// ============================
function buscarEnTabla(inputId, tablaId) {
  document.getElementById(inputId).addEventListener('input', e => {
    const filtro = e.target.value.toLowerCase();
    const filas = document.getElementById(tablaId).getElementsByTagName('tr');
    Array.from(filas).forEach(f => {
      const texto = f.textContent.toLowerCase();
      f.style.display = texto.includes(filtro) ? '' : 'none';
    });
  });
}
buscarEnTabla('buscarProveedor', 'tablaProveedores');
buscarEnTabla('buscarProducto', 'tablaProductos');
buscarEnTabla('buscarFactura', 'tablaFacturas');

