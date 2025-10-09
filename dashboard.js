// ==========================
// 🔥 Inicialización Firebase
// ==========================
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:demo1234567890"
};

// ✅ Cargar Firebase como script normal (no import)
if (typeof firebase === "undefined") {
  const script = document.createElement("script");
  script.src = "https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js";
  document.head.appendChild(script);

  const dbScript = document.createElement("script");
  dbScript.src = "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js";
  document.head.appendChild(dbScript);

  dbScript.onload = () => {
    inicializarFirebase();
  };
} else {
  inicializarFirebase();
}

let db;

function inicializarFirebase() {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  console.log("✅ Firebase conectado correctamente.");
}

// ==========================
// 🌐 Navegación de secciones
// ==========================
function mostrarSeccion(idSeccion) {
  document.querySelectorAll(".seccion").forEach(sec => sec.style.display = "none");
  document.getElementById(idSeccion).style.display = "block";

  document.querySelectorAll(".sidebar button").forEach(btn => btn.classList.remove("active"));
  const btnActivo = Array.from(document.querySelectorAll(".sidebar button"))
    .find(btn => btn.getAttribute("onclick").includes(idSeccion));
  if (btnActivo) btnActivo.classList.add("active");
}

// ==========================
// 👥 CRUD - PROVEEDORES
// ==========================
document.getElementById("formProveedor").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const telefono = document.getElementById("telefonoProveedor").value.trim();

  if (!nombre || !ruc || !telefono) return alert("Completa todos los campos.");

  await db.collection("proveedores").add({ nombre, ruc, telefono });
  alert("Proveedor registrado ✅");
  e.target.reset();
  cargarProveedores();
});

async function cargarProveedores() {
  const lista = document.getElementById("listaProveedores");
  lista.innerHTML = "";
  const snap = await db.collection("proveedores").get();
  snap.forEach(doc => {
    const p = doc.data();
    lista.innerHTML += `
      <div class="border rounded p-2 mb-2 d-flex justify-content-between align-items-center">
        <div><b>${p.nombre}</b><br><small>RUC: ${p.ruc}</small><br><small>Tel: ${p.telefono}</small></div>
        <button class="btn btn-sm btn-danger" onclick="eliminarProveedor('${doc.id}')">🗑</button>
      </div>`;
  });
  actualizarSelectores();
}

async function eliminarProveedor(id) {
  await db.collection("proveedores").doc(id).delete();
  cargarProveedores();
}

// ==========================
// 📦 CRUD - PRODUCTOS
// ==========================
document.getElementById("formProducto").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    nombre: document.getElementById("nombreProducto").value.trim(),
    descripcion: document.getElementById("descripcionProducto").value.trim(),
    cantidad: parseInt(document.getElementById("cantidadProducto").value),
    unidad: document.getElementById("unidadProducto").value.trim(),
    valor: parseFloat(document.getElementById("valorUnitario").value)
  };
  if (!data.nombre || !data.descripcion) return alert("Completa todos los campos.");

  await db.collection("productos").add(data);
  alert("Producto registrado ✅");
  e.target.reset();
  cargarProductos();
});

async function cargarProductos() {
  const lista = document.getElementById("listaProductos");
  lista.innerHTML = "";
  const snap = await db.collection("productos").get();
  snap.forEach(doc => {
    const p = doc.data();
    lista.innerHTML += `
      <div class="border rounded p-2 mb-2 d-flex justify-content-between align-items-center">
        <div><b>${p.nombre}</b><br><small>${p.descripcion}</small><br><small>${p.cantidad} ${p.unidad} - S/ ${p.valor.toFixed(2)}</small></div>
        <button class="btn btn-sm btn-danger" onclick="eliminarProducto('${doc.id}')">🗑</button>
      </div>`;
  });
  actualizarSelectores();
}

async function eliminarProducto(id) {
  await db.collection("productos").doc(id).delete();
  cargarProductos();
}

// ==========================
// 🧾 CRUD - FACTURAS
// ==========================
document.getElementById("formFactura").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    numero: document.getElementById("numeroFactura").value.trim(),
    proveedor: document.getElementById("proveedorFactura").value,
    producto: document.getElementById("productoFactura").value,
    monto: parseFloat(document.getElementById("montoFactura").value),
    moneda: document.getElementById("tipoMoneda").value,
    tipo: document.getElementById("tipoFactura").value,
    fecha: new Date().toISOString()
  };

  if (!data.numero || !data.proveedor || !data.producto) return alert("Completa todos los campos.");

  await db.collection("facturas").add(data);
  alert("Factura guardada ✅");
  e.target.reset();
  cargarFacturas();
});

async function cargarFacturas() {
  const lista = document.getElementById("listaFacturas");
  lista.innerHTML = "";
  const snap = await db.collection("facturas").get();
  snap.forEach(doc => {
    const f = doc.data();
    lista.innerHTML += `
      <div class="border rounded p-2 mb-2 d-flex justify-content-between align-items-center">
        <div><b>${f.numero}</b><br>
        <small>${f.proveedor} - ${f.producto}</small><br>
        <small>${f.tipo} | ${f.moneda} ${f.monto.toFixed(2)}</small></div>
        <div>
          <button class="btn btn-sm btn-warning me-2" onclick="abrirModal('${doc.id}', ${f.monto})">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarFactura('${doc.id}')">🗑</button>
        </div>
      </div>`;
  });
}

async function eliminarFactura(id) {
  await db.collection("facturas").doc(id).delete();
  cargarFacturas();
}

// ==========================
// ✏️ Modal edición factura
// ==========================
let facturaEditando = null;

function abrirModal(id, monto) {
  facturaEditando = id;
  document.getElementById("editarMonto").value = monto;
  document.getElementById("modalEdicion").style.display = "flex";
  document.getElementById("modalEdicion").classList.add("show");
}

function cerrarModal() {
  document.getElementById("modalEdicion").style.display = "none";
  document.getElementById("modalEdicion").classList.remove("show");
}

async function guardarEdicion() {
  const nuevoMonto = parseFloat(document.getElementById("editarMonto").value);
  if (isNaN(nuevoMonto)) return alert("Monto inválido.");
  await db.collection("facturas").doc(facturaEditando).update({ monto: nuevoMonto });
  cerrarModal();
  cargarFacturas();
}

// ==========================
// 📊 Reporte
// ==========================
async function generarReporte() {
  const cont = document.getElementById("contenidoReporte");
  cont.innerHTML = "<p>Generando reporte...</p>";

  const snap = await db.collection("facturas").get();
  let total = 0;
  snap.forEach(doc => total += doc.data().monto);

  cont.innerHTML = `
    <h5>📋 Reporte General</h5>
    <p>Total de facturas: ${snap.size}</p>
    <p>Monto total: <b>S/ ${total.toFixed(2)}</b></p>`;
}

// ==========================
// 🔍 Buscador global
// ==========================
document.getElementById("buscadorGlobal").addEventListener("input", (e) => {
  const texto = e.target.value.toLowerCase();
  document.querySelectorAll("#listaFacturas div, #listaProveedores div, #listaProductos div").forEach(el => {
    el.style.display = el.textContent.toLowerCase().includes(texto) ? "" : "none";
  });
});

// ==========================
// 🔁 Select dinámico
// ==========================
async function actualizarSelectores() {
  const proveedorSelect = document.getElementById("proveedorFactura");
  const productoSelect = document.getElementById("productoFactura");
  proveedorSelect.innerHTML = "<option value=''>Seleccione proveedor</option>";
  productoSelect.innerHTML = "<option value=''>Seleccione producto</option>";

  const provSnap = await db.collection("proveedores").get();
  provSnap.forEach(d => proveedorSelect.innerHTML += `<option>${d.data().nombre}</option>`);

  const prodSnap = await db.collection("productos").get();
  prodSnap.forEach(d => productoSelect.innerHTML += `<option>${d.data().nombre}</option>`);
}

// ==========================
// 🚪 Cerrar sesión
// ==========================
function cerrarSesion() {
  if (confirm("¿Deseas cerrar sesión?")) window.location.href = "index.html";
}

// ==========================
// 🚀 Cargar inicial
// ==========================
setTimeout(() => {
  cargarProveedores();
  cargarProductos();
  cargarFacturas();
}, 2500);

