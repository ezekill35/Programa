// dashboard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ----------------- MENÚ -----------------
const sections = {
  Proveedor: document.getElementById('sectionProveedor'),
  Factura: document.getElementById('sectionFactura'),
  Gastos: document.getElementById('sectionGastos'),
  Servicio: document.getElementById('sectionServicio')
};

const buttons = {
  Proveedor: document.getElementById('btnProveedor'),
  Factura: document.getElementById('btnFactura'),
  Gastos: document.getElementById('btnGastos'),
  Servicio: document.getElementById('btnServicio')
};

Object.keys(buttons).forEach(key => {
  buttons[key].addEventListener('click', () => {
    // Resaltar botón
    Object.values(buttons).forEach(btn => btn.classList.remove('active'));
    buttons[key].classList.add('active');
    // Mostrar sección
    Object.values(sections).forEach(sec => sec.classList.remove('active'));
    sections[key].classList.add('active');
  });
});

// ----------------- PROVEEDOR -----------------
const provRuc = document.getElementById('provRuc');
const provNombre = document.getElementById('provNombre');
const provCorreo = document.getElementById('provCorreo');
const provTelefono = document.getElementById('provTelefono');
const btnAgregarProveedor = document.getElementById('btnAgregarProveedor');
const tablaProveedor = document.getElementById('tablaProveedor');
const searchProveedor = document.getElementById('searchProveedor');

btnAgregarProveedor.addEventListener('click', async () => {
  if (!provRuc.value || !provNombre.value) return alert("RUC y Nombre son obligatorios");
  await addDoc(collection(db, "proveedores"), {
    ruc: provRuc.value,
    nombre: provNombre.value,
    correo: provCorreo.value,
    telefono: provTelefono.value
  });
  provRuc.value = provNombre.value = provCorreo.value = provTelefono.value = "";
  cargarProveedores();
});

async function cargarProveedores(search="") {
  tablaProveedor.innerHTML = "";
  let q = collection(db, "proveedores");
  if (search) q = query(q, where("ruc", "==", search));
  const snapshot = await getDocs(q);
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    tablaProveedor.innerHTML += `
      <tr>
        <td>${data.ruc}</td>
        <td>${data.nombre}</td>
        <td>${data.correo}</td>
        <td>${data.telefono}</td>
        <td><button class="action-btn" onclick="eliminar('proveedores','${docSnap.id}')">Eliminar</button></td>
      </tr>
    `;
  });
}

document.getElementById('btnBuscarProveedor').addEventListener('click', () => {
  cargarProveedores(searchProveedor.value);
});

// ----------------- FACTURA -----------------
const facRuc = document.getElementById('facRuc');
const facTipo = document.getElementById('facTipo');
const facDescripcion = document.getElementById('facDescripcion');
const facFecha = document.getElementById('facFecha');
const btnAgregarFactura = document.getElementById('btnAgregarFactura');
const tablaFactura = document.getElementById('tablaFactura');
const searchFactura = document.getElementById('searchFactura');

btnAgregarFactura.addEventListener('click', async () => {
  if (!facRuc.value || !facTipo.value) return alert("RUC y Tipo de Factura son obligatorios");
  await addDoc(collection(db, "facturas"), {
    ruc: facRuc.value,
    tipo: facTipo.value,
    descripcion: facDescripcion.value,
    fecha: facFecha.value
  });
  facRuc.value = facTipo.value = facDescripcion.value = facFecha.value = "";
  cargarFacturas();
});

async function cargarFacturas(search="") {
  tablaFactura.innerHTML = "";
  let q = collection(db, "facturas");
  if (search) q = query(q, where("ruc", "==", search));
  const snapshot = await getDocs(q);
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    tablaFactura.innerHTML += `
      <tr>
        <td>${data.ruc}</td>
        <td>${data.tipo}</td>
        <td>${data.descripcion}</td>
        <td>${data.fecha}</td>
        <td><button class="action-btn" onclick="eliminar('facturas','${docSnap.id}')">Eliminar</button></td>
      </tr>
    `;
  });
}

document.getElementById('btnBuscarFactura').addEventListener('click', () => {
  cargarFacturas(searchFactura.value);
});

// ----------------- GASTOS -----------------
const gastoNombre = document.getElementById('gastoNombre');
const gastoMonto = document.getElementById('gastoMonto');
const btnAgregarGasto = document.getElementById('btnAgregarGasto');
const tablaGasto = document.getElementById('tablaGasto');
const searchGasto = document.getElementById('searchGasto');

btnAgregarGasto.addEventListener('click', async () => {
  if (!gastoNombre.value || !gastoMonto.value) return alert("Nombre y Monto son obligatorios");
  await addDoc(collection(db, "gastos"), {
    nombre: gastoNombre.value,
    monto: gastoMonto.value
  });
  gastoNombre.value = gastoMonto.value = "";
  cargarGastos();
});

async function cargarGastos(search="") {
  tablaGasto.innerHTML = "";
  let q = collection(db, "gastos");
  if (search) q = query(q, where("nombre", "==", search));
  const snapshot = await getDocs(q);
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    tablaGasto.innerHTML += `
      <tr>
        <td>${data.nombre}</td>
        <td>${data.monto}</td>
        <td><button class="action-btn" onclick="eliminar('gastos','${docSnap.id}')">Eliminar</button></td>
      </tr>
    `;
  });
}

document.getElementById('btnBuscarGasto').addEventListener('click', () => {
  cargarGastos(searchGasto.value);
});

// ----------------- SERVICIO -----------------
const servNombre = document.getElementById('servNombre');
const servCosto = document.getElementById('servCosto');
const btnAgregarServicio = document.getElementById('btnAgregarServicio');
const tablaServicio = document.getElementById('tablaServicio');
const searchServicio = document.getElementById('searchServicio');

btnAgregarServicio.addEventListener('click', async () => {
  if (!servNombre.value || !servCosto.value) return alert("Nombre y Costo son obligatorios");
  await addDoc(collection(db, "servicios"), {
    nombre: servNombre.value,
    costo: servCosto.value
  });
  servNombre.value = servCosto.value = "";
  cargarServicios();
});

async function cargarServicios(search="") {
  tablaServicio.innerHTML = "";
  let q = collection(db, "servicios");
  if (search) q = query(q, where("nombre", "==", search));
  const snapshot = await getDocs(q);
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    tablaServicio.innerHTML += `
      <tr>
        <td>${data.nombre}</td>
        <td>${data.costo}</td>
        <td><button class="action-btn" onclick="eliminar('servicios','${docSnap.id}')">Eliminar</button></td>
      </tr>
    `;
  });
}

document.getElementById('btnBuscarServicio').addEventListener('click', () => {
  cargarServicios(searchServicio.value);
});

// ----------------- ELIMINAR -----------------
window.eliminar = async (coleccion, id) => {
  if (confirm("¿Seguro quieres eliminar?")) {
    await deleteDoc(doc(db, coleccion, id));
    cargarProveedores();
    cargarFacturas();
    cargarGastos();
    cargarServicios();
  }
};

// ----------------- CERRAR SESIÓN -----------------
document.getElementById('btnCerrar').addEventListener('click', () => {
  alert("Sesión cerrada");
  window.location.href = "index.html";
});

// Cargar tablas al iniciar
cargarProveedores();
cargarFacturas();
cargarGastos();
cargarServicios();
