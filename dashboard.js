// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, doc, deleteDoc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

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

// ===================== SESIÓN =====================
onAuthStateChanged(auth, user => {
  if (!user) window.location.href = "index.html";
});

document.getElementById("btnCerrarSesion").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ===================== COLECCIONES =====================
const colProveedores = collection(db, "proveedores");
const colProductos = collection(db, "productos");
const colFacturas = collection(db, "facturas");

// ===================== ELEMENTOS =====================
const secciones = document.querySelectorAll(".seccion");
const navBtns = document.querySelectorAll(".nav-btn");
const buscador = document.getElementById("searchInput");
const panelFacturas = document.getElementById("searchResults");

const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.getElementById("tablaProveedores");

const formProducto = document.getElementById("formProducto");
const tablaProductos = document.getElementById("tablaProductos");

const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas");

const modalEditar = document.getElementById("modalEditar");
const modalEditarBody = document.getElementById("modalEditarBody");
const cerrarModalEditar = document.getElementById("cerrarModalEditar");

const modalExtra = document.getElementById("modalExtra");
const modalExtraBody = document.getElementById("modalExtraBody");
const cerrarModalExtra = document.getElementById("cerrarModalExtra");

const modalFactura = document.getElementById("modalFactura");
const modalFacturaBody = document.getElementById("modalFacturaBody");
const cerrarModalFactura = document.getElementById("cerrarModalFactura");

const countProveedores = document.getElementById("countProveedores");
const countProductos = document.getElementById("countProductos");
const countFacturas = document.getElementById("countFacturas");

// ===================== NAVEGACIÓN =====================
navBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    navBtns.forEach(b => b.classList.remove("activo"));
    secciones.forEach(s => s.classList.remove("activa"));
    btn.classList.add("activo");
    document.getElementById(btn.dataset.target).classList.add("activa");
    buscador.style.display = btn.dataset.target === "facturas" ? "block" : "none";
    if(btn.dataset.target !== "facturas") { buscador.value=""; panelFacturas.innerHTML=""; }
  });
});

// ===================== CARGAR SELECTS =====================
async function cargarProveedoresSelect() {
  const select = document.getElementById("proveedorFactura");
  select.innerHTML = '<option value="">Seleccionar proveedor</option>';
  const snap = await getDocs(colProveedores);
  snap.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.data().nombre;
    opt.textContent = d.data().nombre;
    select.appendChild(opt);
  });
}

async function cargarProductosSelect() {
  const select = document.getElementById("productoFactura");
  select.innerHTML = '<option value="">Seleccionar producto</option>';
  const snap = await getDocs(colProductos);
  snap.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.data().nombre;
    opt.textContent = d.data().nombre;
    select.appendChild(opt);
  });
}

// ===================== PROVEEDORES =====================
formProveedor.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    tipoDocumento: document.getElementById("tipoDocumentoProveedor").value,
    numeroDocumento: document.getElementById("rucProveedor").value,
    nombre: document.getElementById("nombreProveedor").value,
    direccion: document.getElementById("direccionProveedor").value,
    telefono: document.getElementById("telefonoProveedor").value
  };
  await addDoc(colProveedores, data);
  formProveedor.reset();
});

onSnapshot(colProveedores, snap => {
  tablaProveedores.innerHTML = "";
  snap.forEach(d => {
    const data = d.data();
    const tr = document.createElement("tr");
    tr.dataset.id = d.id;
    tr.innerHTML = `
      <td>${data.tipoDocumento}</td>
      <td>${data.numeroDocumento || ''}</td>
      <td>${data.nombre}</td>
      <td>${data.direccion || ""}</td>
      <td>${data.telefono || ""}</td>
      <td>
        <button class="btn-accion editar" data-tipo="proveedor" data-id="${d.id}">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="proveedor" data-nombre="${data.nombre}">🔍</button>
        <button class="btn-accion eliminar" data-tipo="proveedor" data-id="${d.id}">🗑️</button>
      </td>`;
    tablaProveedores.appendChild(tr);
  });
  countProveedores.textContent = snap.size;
  cargarProveedoresSelect();
});

// ===================== PRODUCTOS =====================
formProducto.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    nombre: document.getElementById("nombreProducto").value,
    presentacion: document.getElementById("presentacionProducto").value,
    cantidad: parseInt(document.getElementById("cantidadPresentacion").value),
    precio: parseFloat(document.getElementById("precioProducto").value),
    descripcion: document.getElementById("descripcionProducto").value
  };
  await addDoc(colProductos, data);
  formProducto.reset();
});

onSnapshot(colProductos, snap => {
  tablaProductos.innerHTML = "";
  snap.forEach(d => {
    const data = d.data();
    const tr = document.createElement("tr");
    tr.dataset.id = d.id;
    tr.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.presentacion} (${data.cantidad})</td>
      <td>S/. ${data.precio.toFixed(2)}</td>
      <td>${data.descripcion || ""}</td>
      <td>
        <button class="btn-accion editar" data-tipo="producto" data-id="${d.id}">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="producto" data-nombre="${data.nombre}">🔍</button>
        <button class="btn-accion eliminar" data-tipo="producto" data-id="${d.id}">🗑️</button>
      </td>`;
    tablaProductos.appendChild(tr);
  });
  countProductos.textContent = snap.size;
  cargarProductosSelect();
});

// ===================== FACTURAS =====================
formFactura.addEventListener("input", () => {
  const monto = parseFloat(document.getElementById("montoFactura").value) || 0;
  document.getElementById("igvFactura").value = (monto*0.18).toFixed(2);
  document.getElementById("totalFactura").value = (monto*1.18).toFixed(2);
});

formFactura.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    idFactura: document.getElementById("idFactura").value || Date.now().toString(),
    fecha: document.getElementById("fechaFactura").value,
    tipo: document.getElementById("tipoFactura").value,
    proveedor: document.getElementById("proveedorFactura").value,
    producto: document.getElementById("productoFactura").value,
    subtotal: parseFloat(document.getElementById("montoFactura").value),
    igv: parseFloat(document.getElementById("igvFactura").value),
    total: parseFloat(document.getElementById("totalFactura").value)
  };
  await addDoc(colFacturas, data);
  formFactura.reset();
});

// ===================== LISTADO FACTURAS =====================
onSnapshot(colFacturas, snap => {
  tablaFacturas.innerHTML = "";
  snap.forEach(d => {
    const f = d.data();
    const tr = document.createElement("tr");
    tr.dataset.id = d.id;
    tr.innerHTML = `
      <td>${f.idFactura}</td>
      <td>${f.fecha}</td>
      <td>${f.proveedor}</td>
      <td>${f.producto}</td>
      <td>${f.subtotal.toFixed(2)}</td>
      <td>${f.igv.toFixed(2)}</td>
      <td>${f.total.toFixed(2)}</td>
      <td>${f.tipo}</td>
      <td>
        <button class="btn-accion editar" data-tipo="factura" data-id="${d.id}">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="factura" data-id="${d.id}">🔍</button>
        <button class="btn-accion eliminar" data-tipo="factura" data-id="${d.id}">🗑️</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  });
  countFacturas.textContent = snap.size;
});

// ===================== BUSCADOR =====================
buscador.style.display = "none";
buscador.addEventListener("input", async ()=>{
  const texto = buscador.value.toLowerCase();
  panelFacturas.innerHTML = "";
  if(!texto) return;
  const snap = await getDocs(colFacturas);
  snap.forEach(d => {
    const f = d.data();
    if(f.producto.toLowerCase().includes(texto) || f.idFactura.toLowerCase().includes(texto)){
      const div = document.createElement("div");
      div.className = "resultado-item";
      div.textContent = `${f.idFactura} - ${f.producto}`;
      div.addEventListener("click", ()=> mostrarModalFactura(f));
      panelFacturas.appendChild(div);
    }
  });
});

// ===================== MODALES =====================
cerrarModalEditar.addEventListener("click", ()=>modalEditar.close());
cerrarModalExtra.addEventListener("click", ()=>modalExtra.close());
cerrarModalFactura.addEventListener("click", ()=>modalFactura.close());

function mostrarModalFactura(f){
  modalFacturaBody.innerHTML = `
    <p><b>ID:</b> ${f.idFactura}</p>
    <p><b>Fecha:</b> ${f.fecha}</p>
    <p><b>Proveedor:</b> ${f.proveedor}</p>
    <p><b>Producto:</b> ${f.producto}</p>
    <p><b>Subtotal:</b> S/. ${f.subtotal.toFixed(2)}</p>
    <p><b>IGV:</b> S/. ${f.igv.toFixed(2)}</p>
    <p><b>Total:</b> S/. ${f.total.toFixed(2)}</p>
    <p><b>Tipo:</b> ${f.tipo}</p>
  `;
  modalFactura.showModal();
}


});


