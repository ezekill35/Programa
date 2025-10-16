// ================= FIREBASE CONFIGURACIÓN =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, query, where, updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:abcd1234efgh5678"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const colProveedores = collection(db, "proveedores");
const colProductos = collection(db, "productos");
const colFacturas = collection(db, "facturas");

// ================= CERRAR SESIÓN =================
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ================= CAMBIO DE SECCIONES =================
document.querySelectorAll(".menu-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".menu-btn").forEach(b => b.classList.remove("activo"));
    document.querySelectorAll(".seccion").forEach(s => s.classList.remove("activa"));
    btn.classList.add("activo");
    document.getElementById(btn.dataset.target).classList.add("activa");
  });
});

// ================= PROVEEDORES =================
const formProveedor = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");

formProveedor.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    ruc: document.getElementById("rucProveedor").value.trim(),
    nombre: document.getElementById("nombreProveedor").value.trim(),
    direccion: document.getElementById("direccionProveedor").value.trim(),
    telefono: document.getElementById("telefonoProveedor").value.trim()
  };
  await addDoc(colProveedores, data);
  formProveedor.reset();
});

onSnapshot(colProveedores, snapshot => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach(docu => {
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.ruc}</td>
      <td>${d.nombre}</td>
      <td>${d.direccion}</td>
      <td>${d.telefono || "-"}</td>
      <td>
        <button class="btn btn-sm ver-info" data-tipo="proveedor" data-nombre="${d.nombre}">🔍 Ver</button>
        <button class="btn btn-sm editar-prov" data-id="${docu.id}">✏️ Editar</button>
        <button class="btn btn-sm eliminar-prov" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaProveedores.appendChild(tr);
  });
  cargarProveedoresSelect();
});

async function cargarProveedoresSelect() {
  const select = document.getElementById("proveedorFactura");
  select.innerHTML = '<option value="">Seleccionar proveedor</option>';
  const snap = await getDocs(colProveedores);
  snap.forEach(docu => {
    const d = docu.data();
    const opt = document.createElement("option");
    opt.value = d.nombre;
    opt.textContent = d.nombre;
    select.appendChild(opt);
  });
}

// ================= PRODUCTOS =================
const formProducto = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");

formProducto.addEventListener("submit", async e => {
  e.preventDefault();
  const precio = parseFloat(document.getElementById("precioProducto").value);
  const data = {
    nombre: document.getElementById("nombreProducto").value.trim(),
    cantidad: parseInt(document.getElementById("cantidadProducto").value),
    precio: precio,
    descripcion: document.getElementById("descripcionProducto").value.trim()
  };
  await addDoc(colProductos, data);
  formProducto.reset();
});

onSnapshot(colProductos, snapshot => {
  tablaProductos.innerHTML = "";
  snapshot.forEach(docu => {
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.nombre}</td>
      <td>${d.cantidad}</td>
      <td>S/. ${d.precio.toFixed(2)}</td>
      <td>${d.descripcion || "-"}</td>
      <td>
        <button class="btn btn-sm ver-info" data-tipo="producto" data-nombre="${d.nombre}">🔍 Ver</button>
        <button class="btn btn-sm editar-prod" data-id="${docu.id}">✏️ Editar</button>
        <button class="btn btn-sm eliminar-prod" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaProductos.appendChild(tr);
  });
  cargarProductosSelect();
});

async function cargarProductosSelect() {
  const select = document.getElementById("productoFactura");
  select.innerHTML = '<option value="">Seleccionar producto</option>';
  const snap = await getDocs(colProductos);
  snap.forEach(docu => {
    const d = docu.data();
    const opt = document.createElement("option");
    opt.value = d.nombre;
    opt.textContent = d.nombre;
    select.appendChild(opt);
  });
}

// ================= FACTURAS =================
const formFactura = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");

formFactura.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    idFactura: document.getElementById("idFactura").value.trim(),
    fecha: document.getElementById("fechaFactura").value,
    proveedor: document.getElementById("proveedorFactura").value,
    producto: document.getElementById("productoFactura").value,
    monto: parseFloat(document.getElementById("montoFactura").value),
    tipo: document.getElementById("tipoFactura").value
  };
  await addDoc(colFacturas, data);
  formFactura.reset();
});

onSnapshot(colFacturas, snapshot => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(docu => {
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.idFactura}</td>
      <td>${d.fecha}</td>
      <td>${d.proveedor}</td>
      <td>${d.producto}</td>
      <td>S/. ${d.monto.toFixed(2)}</td>
      <td>${d.tipo}</td>
      <td>
        <button class="btn btn-sm ver-factura" data-id="${d.idFactura}">📄 Detalle</button>
        <button class="btn btn-sm eliminar-factura" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  });
});

// ================= BUSCADOR FACTURAS =================
const buscador = document.getElementById("buscadorFactura");
const panelFacturas = document.getElementById("panelFacturas");

buscador.addEventListener("input", async () => {
  const texto = buscador.value.trim().toLowerCase();
  panelFacturas.innerHTML = "";
  if (!texto) return;

  const snap = await getDocs(colFacturas);
  snap.forEach(docu => {
    const f = docu.data();
    if (f.producto.toLowerCase().includes(texto)) {
      const div = document.createElement("div");
      div.innerHTML = `<strong>${f.idFactura}</strong> - ${f.producto} (${f.proveedor}) - S/. ${f.monto.toFixed(2)}`;
      div.addEventListener("click", () => mostrarModalFactura(f));
      panelFacturas.appendChild(div);
    }
  });
});

document.getElementById("btnRefresh").addEventListener("click", () => {
  buscador.value = "";
  panelFacturas.innerHTML = "";
});

// ================= MODALES =================
const modalFactura = document.getElementById("modalFactura");
const contenidoModalFactura = document.getElementById("contenidoModalFactura");
const cerrarModalFactura = document.getElementById("cerrarModalFactura");
cerrarModalFactura.addEventListener("click", () => modalFactura.style.display = "none");

const modalExtra = document.getElementById("modalDetalleExtra");
const contenidoDetalleExtra = document.getElementById("contenidoDetalleExtra");
const cerrarModalExtra = document.getElementById("cerrarModalDetalle");
cerrarModalExtra.addEventListener("click", () => modalExtra.style.display = "none");

function mostrarModalFactura(f) {
  contenidoModalFactura.innerHTML = `
    <h3>Factura ${f.idFactura}</h3>
    <p><b>Fecha:</b> ${f.fecha}</p>
    <p><b>Proveedor:</b> <span class="link-info" data-tipo="proveedor" data-nombre="${f.proveedor}">${f.proveedor}</span></p>
    <p><b>Producto:</b> <span class="link-info" data-tipo="producto" data-nombre="${f.producto}">${f.producto}</span></p>
    <p><b>Monto:</b> S/. ${f.monto.toFixed(2)}</p>
    <p><b>Tipo:</b> ${f.tipo}</p>`;
  modalFactura.style.display = "block";
}

// ================= DETALLE EXTRA =================
document.addEventListener("click", async e => {
  if (e.target.classList.contains("link-info")) {
    const nombre = e.target.dataset.nombre;
    const tipo = e.target.dataset.tipo;
    if (!confirm(`¿Deseas ver información del ${tipo} "${nombre}"?`)) return;

    let colRef = tipo === "proveedor" ? colProveedores : colProductos;
    const snap = await getDocs(query(colRef, where("nombre", "==", nombre)));
    if (snap.empty) {
      contenidoDetalleExtra.innerHTML = "<p>No se encontró información.</p>";
    } else {
      const d = snap.docs[0].data();
      let html = "";
      if (tipo === "proveedor") {
        html = `<h4>Proveedor</h4>
          <p><b>Nombre:</b> ${d.nombre}</p>
          <p><b>RUC:</b> ${d.ruc}</p>
          <p><b>Dirección:</b> ${d.direccion || "-"}</p>
          <p><b>Teléfono:</b> ${d.telefono || "-"}</p>`;
      } else {
        html = `<h4>Producto</h4>
          <p><b>Nombre:</b> ${d.nombre}</p>
          <p><b>Cantidad:</b> ${d.cantidad}</p>
          <p><b>Precio:</b> S/. ${d.precio.toFixed(2)}</p>
          <p><b>Descripción:</b> ${d.descripcion || "-"}</p>`;
      }
      contenidoDetalleExtra.innerHTML = html;
    }
    modalExtra.style.display = "block";
  }
});

