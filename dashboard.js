// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// Configuración Firebase Discovery Pets
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ===================== CONTROL DE SESIÓN =====================
onAuthStateChanged(auth, user => {
  if (!user) window.location.href = "index.html";
});

document.getElementById("btnCerrarSesion").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ===================== NAVEGACIÓN ENTRE SECCIONES =====================
const botonesNav = document.querySelectorAll(".nav-btn");
const secciones = document.querySelectorAll(".seccion");

botonesNav.forEach(btn => {
  btn.addEventListener("click", () => {
    botonesNav.forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    const target = btn.dataset.target;
    secciones.forEach(sec => sec.classList.remove("activa"));
    document.getElementById(target).classList.add("activa");
  });
});

// ===================== FORMULARIO PROVEEDOR =====================
const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.getElementById("tablaProveedores");

formProveedor.addEventListener("submit", async e => {
  e.preventDefault();
  const nuevo = {
    tipoDocumento: formProveedor.tipoDocumentoProveedor.value,
    numeroDocumento: formProveedor.numeroDocumentoProveedor.value,
    nombre: formProveedor.nombreProveedor.value,
    direccion: formProveedor.direccionProveedor.value,
    telefono: formProveedor.telefonoProveedor.value
  };
  await addDoc(collection(db, "proveedores"), nuevo);
  formProveedor.reset();
});

onSnapshot(collection(db, "proveedores"), snapshot => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach(docSnap => {
    const d = docSnap.data();
    tablaProveedores.innerHTML += `
      <tr>
        <td>${d.tipoDocumento} ${d.numeroDocumento}</td>
        <td>${d.nombre}</td>
        <td>${d.direccion || "-"}</td>
        <td>${d.telefono || "-"}</td>
        <td>
          <button class="btn-accion text-danger" data-id="${docSnap.id}" data-tipo="eliminarProveedor">🗑️</button>
        </td>
      </tr>`;
  });
  actualizarSelectProveedores();
  contarTotales();
});

// ===================== FORMULARIO PRODUCTO =====================
const formProducto = document.getElementById("formProducto");
const tablaProductos = document.getElementById("tablaProductos");

formProducto.addEventListener("submit", async e => {
  e.preventDefault();
  const nuevo = {
    nombre: formProducto.nombreProducto.value,
    presentacion: formProducto.presentacionProducto.value,
    cantidad: formProducto.cantidadPresentacion.value,
    precio: parseFloat(formProducto.precioProducto.value),
    moneda: formProducto.tipoMoneda.value,
    descripcion: formProducto.descripcionProducto.value
  };
  await addDoc(collection(db, "productos"), nuevo);
  formProducto.reset();
});

onSnapshot(collection(db, "productos"), snapshot => {
  tablaProductos.innerHTML = "";
  snapshot.forEach(docSnap => {
    const d = docSnap.data();
    tablaProductos.innerHTML += `
      <tr>
        <td>${d.nombre}</td>
        <td>${d.presentacion} (${d.cantidad})</td>
        <td>${d.precio.toFixed(2)} ${d.moneda}</td>
        <td>${d.descripcion || "-"}</td>
        <td>
          <button class="btn-accion text-danger" data-id="${docSnap.id}" data-tipo="eliminarProducto">🗑️</button>
        </td>
      </tr>`;
  });
  actualizarSelectProductos();
  contarTotales();
});

// ===================== FORMULARIO FACTURA =====================
const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas");

formFactura.montoFactura.addEventListener("input", () => {
  const subtotal = parseFloat(formFactura.montoFactura.value) || 0;
  const igv = subtotal * 0.18;
  const total = subtotal + igv;
  formFactura.igvFactura.value = igv.toFixed(2);
  formFactura.totalFactura.value = total.toFixed(2);
});

formFactura.addEventListener("submit", async e => {
  e.preventDefault();
  const factura = {
    fecha: formFactura.fechaFactura.value,
    tipo: formFactura.tipoFactura.value,
    proveedor: formFactura.proveedorFactura.value,
    producto: formFactura.productoFactura.value,
    subtotal: parseFloat(formFactura.montoFactura.value),
    igv: parseFloat(formFactura.igvFactura.value),
    total: parseFloat(formFactura.totalFactura.value),
    detalle: formFactura.detalleAdicional.value || ""
  };
  await addDoc(collection(db, "facturas"), factura);
  formFactura.reset();
  formFactura.igvFactura.value = "";
  formFactura.totalFactura.value = "";
});

onSnapshot(collection(db, "facturas"), snapshot => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(docSnap => {
    const d = docSnap.data();
    tablaFacturas.innerHTML += `
      <tr>
        <td>${docSnap.id}</td>
        <td>${d.fecha}</td>
        <td>${d.proveedor}</td>
        <td>${d.producto}</td>
        <td>${d.subtotal.toFixed(2)}</td>
        <td>${d.igv.toFixed(2)}</td>
        <td>${d.total.toFixed(2)}</td>
        <td>${d.tipo}</td>
        <td>
          <button class="btn-accion text-info" data-id="${docSnap.id}" data-tipo="detalleFactura">🔍</button>
          <button class="btn-accion text-danger" data-id="${docSnap.id}" data-tipo="eliminarFactura">🗑️</button>
        </td>
      </tr>`;
  });
  contarTotales();
});

// ===================== MODALES =====================
const modalFactura = document.getElementById("modalFactura");
const modalFacturaBody = document.getElementById("modalFacturaBody");
document.getElementById("cerrarModalFactura").onclick = () => modalFactura.close();

document.addEventListener("click", async e => {
  const btn = e.target.closest(".btn-accion");
  if (!btn) return;
  const id = btn.dataset.id;
  const tipo = btn.dataset.tipo;

  if (tipo === "eliminarProveedor") {
    await deleteDoc(doc(db, "proveedores", id));
  } else if (tipo === "eliminarProducto") {
    await deleteDoc(doc(db, "productos", id));
  } else if (tipo === "eliminarFactura") {
    await deleteDoc(doc(db, "facturas", id));
  } else if (tipo === "detalleFactura") {
    const docSnap = await getDocs(collection(db, "facturas"));
    docSnap.forEach(f => {
      if (f.id === id) {
        const d = f.data();
        modalFacturaBody.innerHTML = `
          <p><strong>ID:</strong> ${id}</p>
          <p><strong>Fecha:</strong> ${d.fecha}</p>
          <p><strong>Proveedor:</strong> ${d.proveedor}</p>
          <p><strong>Producto:</strong> ${d.producto}</p>
          <p><strong>Tipo:</strong> ${d.tipo}</p>
          <p><strong>Subtotal:</strong> ${d.subtotal.toFixed(2)}</p>
          <p><strong>IGV:</strong> ${d.igv.toFixed(2)}</p>
          <p><strong>Total:</strong> ${d.total.toFixed(2)}</p>
          ${d.detalle ? `<p><strong>Detalle:</strong> ${d.detalle}</p>` : ""}
        `;
        modalFactura.showModal();
      }
    });
  }
});

// ===================== SELECTS ACTUALIZADOS =====================
async function actualizarSelectProveedores() {
  const select = document.getElementById("proveedorFactura");
  const snapshot = await getDocs(collection(db, "proveedores"));
  select.innerHTML = `<option value="">Seleccione proveedor</option>`;
  snapshot.forEach(docSnap => {
    const d = docSnap.data();
    select.innerHTML += `<option>${d.nombre}</option>`;
  });
}

async function actualizarSelectProductos() {
  const select = document.getElementById("productoFactura");
  const snapshot = await getDocs(collection(db, "productos"));
  select.innerHTML = `<option value="">Seleccione producto</option>`;
  snapshot.forEach(docSnap => {
    const d = docSnap.data();
    select.innerHTML += `<option>${d.nombre}</option>`;
  });
}

// ===================== CONTADORES =====================
async function contarTotales() {
  const facturas = (await getDocs(collection(db, "facturas"))).size;
  const proveedores = (await getDocs(collection(db, "proveedores"))).size;
  const productos = (await getDocs(collection(db, "productos"))).size;
  document.getElementById("countFacturas").textContent = facturas;
  document.getElementById("countProveedores").textContent = proveedores;
  document.getElementById("countProductos").textContent = productos;
}

// ===================== BUSCADOR =====================
document.getElementById("searchInput").addEventListener("input", async e => {
  const term = e.target.value.toLowerCase();
  const results = document.getElementById("searchResults");
  results.innerHTML = "";
  if (term === "") return;

  const facturasSnap = await getDocs(collection(db, "facturas"));
  facturasSnap.forEach(docSnap => {
    const d = docSnap.data();
    if (d.proveedor.toLowerCase().includes(term) || d.producto.toLowerCase().includes(term)) {
      results.innerHTML += `<div class="resultado-item">🧾 ${d.proveedor} - ${d.producto} (${d.total.toFixed(2)})</div>`;
    }
  });
});

