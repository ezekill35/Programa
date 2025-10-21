// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, query, updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  getAuth, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:abcd1234example"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ===================== AUTH =====================
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
});

document.getElementById("btnCerrarSesion").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ===================== NAVEGACIÓN =====================
const navBtns = document.querySelectorAll(".nav-btn");
const secciones = document.querySelectorAll(".seccion");

navBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    navBtns.forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    const target = btn.dataset.target;
    secciones.forEach(sec => sec.classList.remove("activa"));
    document.getElementById(target).classList.add("activa");
  });
});

// ===================== COLECCIONES =====================
const colProveedores = collection(db, "proveedores");
const colProductos = collection(db, "productos");
const colFacturas = collection(db, "facturas");

// ===================== PROVEEDORES =====================
const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.getElementById("tablaProveedores");

formProveedor.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nuevoProveedor = {
    tipoDocumento: formProveedor.tipoDocumentoProveedor.value,
    nombre: formProveedor.nombreProveedor.value,
    direccion: formProveedor.direccionProveedor.value,
    telefono: formProveedor.telefonoProveedor.value
  };
  await addDoc(colProveedores, nuevoProveedor);
  formProveedor.reset();
});

onSnapshot(colProveedores, (snapshot) => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach((docu) => {
    const p = docu.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.tipoDocumento}</td>
      <td>${p.nombre}</td>
      <td>${p.direccion || "-"}</td>
      <td>${p.telefono || "-"}</td>
      <td>
        <button class="btn-accion text-primary" data-id="${docu.id}" data-tipo="editarProveedor">✏️</button>
        <button class="btn-accion text-danger" data-id="${docu.id}" data-tipo="eliminarProveedor">🗑️</button>
      </td>`;
    tablaProveedores.appendChild(fila);
  });
  actualizarTotales();
  cargarProveedoresFactura();
});

// ===================== PRODUCTOS =====================
const formProducto = document.getElementById("formProducto");
const tablaProductos = document.getElementById("tablaProductos");

formProducto.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nuevoProducto = {
    nombre: formProducto.nombreProducto.value,
    presentacion: formProducto.presentacionProducto.value,
    cantidad: parseInt(formProducto.cantidadPresentacion.value),
    precio: parseFloat(formProducto.precioProducto.value),
    descripcion: formProducto.descripcionProducto.value
  };
  await addDoc(colProductos, nuevoProducto);
  formProducto.reset();
});

onSnapshot(colProductos, (snapshot) => {
  tablaProductos.innerHTML = "";
  snapshot.forEach((docu) => {
    const pr = docu.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${pr.nombre}</td>
      <td>${pr.presentacion} (${pr.cantidad})</td>
      <td>${pr.precio.toFixed(2)}</td>
      <td>${pr.descripcion || "-"}</td>
      <td>
        <button class="btn-accion text-primary" data-id="${docu.id}" data-tipo="editarProducto">✏️</button>
        <button class="btn-accion text-danger" data-id="${docu.id}" data-tipo="eliminarProducto">🗑️</button>
      </td>`;
    tablaProductos.appendChild(fila);
  });
  actualizarTotales();
  cargarProductosFactura();
});

// ===================== FACTURAS =====================
const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas");

formFactura.addEventListener("submit", async (e) => {
  e.preventDefault();

  const subtotal = parseFloat(formFactura.montoFactura.value);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  const nuevaFactura = {
    fecha: formFactura.fechaFactura.value,
    tipo: formFactura.tipoFactura.value,
    proveedor: formFactura.proveedorFactura.value,
    producto: formFactura.productoFactura.value,
    subtotal,
    igv,
    total,
    tipoMoneda: formFactura.tipoMonedaFactura.value || "PEN",
    detalle: formFactura.detalleAdicional.value || ""
  };
  await addDoc(colFacturas, nuevaFactura);
  formFactura.reset();
});

onSnapshot(colFacturas, (snapshot) => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach((docu) => {
    const f = docu.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${docu.id}</td>
      <td>${f.fecha}</td>
      <td>${f.proveedor}</td>
      <td>${f.producto}</td>
      <td>${f.tipoMoneda} ${f.subtotal.toFixed(2)}</td>
      <td>${f.tipoMoneda} ${f.igv.toFixed(2)}</td>
      <td>${f.tipoMoneda} ${f.total.toFixed(2)}</td>
      <td>${f.tipo}</td>
      <td>
        <button class="btn-accion text-primary" data-id="${docu.id}" data-tipo="detalleFactura">👁️</button>
        <button class="btn-accion text-danger" data-id="${docu.id}" data-tipo="eliminarFactura">🗑️</button>
      </td>`;
    tablaFacturas.appendChild(fila);
  });
  actualizarTotales();
});

// ===================== CARGAR SELECTS =====================
async function cargarProveedoresFactura() {
  const select = document.getElementById("proveedorFactura");
  const snap = await getDocs(colProveedores);
  select.innerHTML = `<option value="">Seleccione proveedor</option>`;
  snap.forEach((docu) => {
    const d = docu.data();
    select.innerHTML += `<option>${d.nombre}</option>`;
  });
}

async function cargarProductosFactura() {
  const select = document.getElementById("productoFactura");
  const snap = await getDocs(colProductos);
  select.innerHTML = `<option value="">Seleccione producto</option>`;
  snap.forEach((docu) => {
    const d = docu.data();
    select.innerHTML += `<option>${d.nombre}</option>`;
  });
}

// ===================== EVENTOS ADICIONALES =====================
const tipoFactura = document.getElementById("tipoFactura");
const campoAdicional = document.getElementById("campoAdicional");
tipoFactura.addEventListener("change", () => {
  if (tipoFactura.value.includes("Nota")) campoAdicional.style.display = "block";
  else campoAdicional.style.display = "none";
});

// Calcular IGV y total automáticamente
formFactura.montoFactura.addEventListener("input", () => {
  const val = parseFloat(formFactura.montoFactura.value) || 0;
  const igv = val * 0.18;
  const total = val + igv;
  formFactura.igvFactura.value = igv.toFixed(2);
  formFactura.totalFactura.value = total.toFixed(2);
});

// ===================== BUSCADOR =====================
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

searchInput.addEventListener("input", async () => {
  const texto = searchInput.value.toLowerCase();
  searchResults.innerHTML = "";
  if (texto.length < 2) return;

  const snaps = await Promise.all([
    getDocs(colProductos),
    getDocs(colFacturas)
  ]);

  const [productosSnap, facturasSnap] = snaps;

  productosSnap.forEach(docu => {
    const d = docu.data();
    if (d.nombre.toLowerCase().includes(texto)) {
      searchResults.innerHTML += `<div class="resultado-item">🔹 Producto: ${d.nombre}</div>`;
    }
  });

  facturasSnap.forEach(docu => {
    const f = docu.data();
    if (f.proveedor.toLowerCase().includes(texto)) {
      searchResults.innerHTML += `<div class="resultado-item">🧾 Factura: ${f.proveedor} - ${f.total.toFixed(2)} ${f.tipoMoneda}</div>`;
    }
  });
});

// ===================== MODALES =====================
const modalFactura = document.getElementById("modalFactura");
const modalBody = document.getElementById("modalFacturaBody");
const cerrarModalFactura = document.getElementById("cerrarModalFactura");

cerrarModalFactura.addEventListener("click", () => modalFactura.close());

document.addEventListener("click", async (e) => {
  const tipo = e.target.dataset.tipo;
  const id = e.target.dataset.id;
  if (!tipo) return;

  if (tipo === "eliminarProveedor") await deleteDoc(doc(db, "proveedores", id));
  if (tipo === "eliminarProducto") await deleteDoc(doc(db, "productos", id));
  if (tipo === "eliminarFactura") await deleteDoc(doc(db, "facturas", id));

  if (tipo === "detalleFactura") {
    const ref = doc(db, "facturas", id);
    const d = (await getDocs(query(colFacturas))).docs.find(x => x.id === id)?.data();
    modalBody.innerHTML = `
      <p><b>Fecha:</b> ${d.fecha}</p>
      <p><b>Proveedor:</b> ${d.proveedor}</p>
      <p><b>Producto:</b> ${d.producto}</p>
      <p><b>Subtotal:</b> ${d.tipoMoneda} ${d.subtotal.toFixed(2)}</p>
      <p><b>IGV:</b> ${d.tipoMoneda} ${d.igv.toFixed(2)}</p>
      <p><b>Total:</b> ${d.tipoMoneda} ${d.total.toFixed(2)}</p>
      <p><b>Tipo de Moneda:</b> ${d.tipoMoneda}</p>
      <p><b>Tipo:</b> ${d.tipo}</p>
      <p><b>Detalle:</b> ${d.detalle || "-"}</p>
    `;
    modalFactura.showModal();
  }
});

// ===================== CONTADORES =====================
function actualizarTotales() {
  Promise.all([getDocs(colProveedores), getDocs(colProductos), getDocs(colFacturas)])
    .then(([prov, prod, fact]) => {
      document.getElementById("countProveedores").textContent = prov.size;
      document.getElementById("countProductos").textContent = prod.size;
      document.getElementById("countFacturas").textContent = fact.size;
    });
}


