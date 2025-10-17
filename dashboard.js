// ===================== FIREBASE CONFIG =====================
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

// ===================== COLECCIONES =====================
const colProveedores = collection(db, "proveedores");
const colProductos = collection(db, "productos");
const colFacturas = collection(db, "facturas");

// ===================== ELEMENTOS =====================
const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.getElementById("tablaProveedores");

const formProducto = document.getElementById("formProducto");
const tablaProductos = document.getElementById("tablaProductos");

const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas");

const countFacturas = document.getElementById("countFacturas");
const countProveedores = document.getElementById("countProveedores");
const countProductos = document.getElementById("countProductos");

const buscador = document.getElementById("searchInput");
const panelFacturas = document.getElementById("searchResults");

const modalFactura = document.getElementById("modalFactura");
const contenidoModalFactura = document.getElementById("modalFacturaBody");
const cerrarModalFactura = document.getElementById("cerrarModalFactura");

const modalExtra = document.getElementById("modalExtra");
const modalExtraBody = document.getElementById("modalExtraBody");
const cerrarModalExtra = document.getElementById("cerrarModalExtra");

// ===================== CERRAR SESIÓN =====================
document.getElementById("btnCerrarSesion").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ===================== NAVEGACIÓN =====================
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("activo"));
    document.querySelectorAll(".seccion").forEach(s => s.classList.remove("activa"));
    btn.classList.add("activo");
    document.getElementById(btn.dataset.target).classList.add("activa");

    if(btn.dataset.target === "facturas"){
      buscador.style.display = "block";
    } else {
      buscador.style.display = "none";
      buscador.value = "";
      panelFacturas.innerHTML = "";
    }
  });
});

// ===================== AUXILIARES =====================
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

function mostrarModalFactura(f) {
  contenidoModalFactura.innerHTML = `
    <h3 class="text-sky-600 font-bold text-lg mb-2">Factura ${f.idFactura}</h3>
    <p><b>Fecha:</b> ${f.fecha}</p>
    <p><b>Proveedor:</b> <span class="link-info" data-tipo="proveedor" data-nombre="${f.proveedor}" style="color:#f97316; cursor:pointer;">${f.proveedor}</span></p>
    <p><b>Producto:</b> <span class="link-info" data-tipo="producto" data-nombre="${f.producto}" style="color:#14b8a6; cursor:pointer;">${f.producto}</span></p>
    <p><b>Monto:</b> S/. ${f.monto}</p>
    <p><b>Tipo:</b> ${f.tipo}</p>`;
  modalFactura.showModal();
}

// ===================== CERRAR MODALES =====================
cerrarModalFactura.addEventListener("click", () => modalFactura.close());
cerrarModalExtra.addEventListener("click", () => modalExtra.close());

// ===================== PROVEEDORES =====================
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
    tr.dataset.id = docu.id;
    tr.innerHTML = `
      <td>${d.ruc}</td>
      <td>${d.nombre}</td>
      <td>${d.direccion || ""}</td>
      <td>${d.telefono || ""}</td>
      <td>
        <button class="btn-accion editar" data-id="${docu.id}" data-tipo="proveedor">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="proveedor" data-nombre="${d.nombre}">🔍</button>
      </td>`;
    tablaProveedores.appendChild(tr);
  });
  countProveedores.textContent = snapshot.size;
  cargarProveedoresSelect();
});

// ===================== PRODUCTOS =====================
formProducto.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    nombre: document.getElementById("nombreProducto").value.trim(),
    cantidad: parseInt(document.getElementById("cantidadProducto").value),
    precio: parseFloat(document.getElementById("precioProducto").value),
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
    tr.dataset.id = docu.id;
    tr.innerHTML = `
      <td>${d.nombre}</td>
      <td>${d.cantidad}</td>
      <td>${d.precio}</td>
      <td style="white-space: pre-line;">${d.descripcion}</td>
      <td>
        <button class="btn-accion editar" data-id="${docu.id}" data-tipo="producto">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="producto" data-nombre="${d.nombre}">🔍</button>
      </td>`;
    tablaProductos.appendChild(tr);
  });
  countProductos.textContent = snapshot.size;
  cargarProductosSelect();
});

// ===================== FACTURAS =====================
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
    const f = docu.data();
    const tr = document.createElement("tr");
    tr.dataset.id = docu.id;
    tr.innerHTML = `
      <td>${f.idFactura}</td>
      <td>${f.fecha}</td>
      <td>${f.proveedor}</td>
      <td>${f.producto}</td>
      <td>${f.monto}</td>
      <td>${f.tipo}</td>
      <td>
        <button class="btn-accion editar" data-id="${docu.id}" data-tipo="factura">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="factura" data-idfactura="${f.idFactura}">🔍</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  });
  countFacturas.textContent = snapshot.size;
});

// ===================== BUSCADOR =====================
buscador.style.display = "none";

buscador.addEventListener("input", async () => {
  const texto = buscador.value.trim().toLowerCase();
  panelFacturas.innerHTML = "";
  if (!texto) return;

  const snap = await getDocs(colFacturas);
  snap.forEach(docu => {
    const f = docu.data();
    if (f.producto.toLowerCase().includes(texto)) {
      const div = document.createElement("div");
      div.className = "resultado-item";
      div.innerHTML = `<strong class="link-info" data-tipo="factura" data-idfactura="${f.idFactura}" style="cursor:pointer; color:#0284c7;">${f.idFactura}</strong>`;
      panelFacturas.appendChild(div);
    }
  });
});

// ===================== CLICK GLOBAL =====================
document.addEventListener("click", async e => {

  // VER DETALLES FACTURA
  if (e.target.classList.contains("link-info") && e.target.dataset.tipo === "factura") {
    const idFactura = e.target.dataset.idfactura || e.target.textContent;
    const snap = await getDocs(query(colFacturas, where("idFactura", "==", idFactura)));
    if (!snap.empty) mostrarModalFactura(snap.docs[0].data());
    return;
  }

  // VER DETALLES PROVEEDOR O PRODUCTO
  if (e.target.classList.contains("link-info") && (e.target.dataset.tipo === "proveedor" || e.target.dataset.tipo === "producto")) {
    const tipo = e.target.dataset.tipo;
    const nombre = e.target.dataset.nombre;
    if (!confirm(`¿Deseas ver los datos del ${tipo} ${nombre}?`)) return;

    const col = tipo === "proveedor" ? colProveedores : colProductos;
    const snap = await getDocs(query(col, where("nombre", "==", nombre)));
    if (snap.empty) {
      modalExtraBody.innerHTML = `<p>No se encontró información del ${tipo}.</p>`;
    } else {
      const d = snap.docs[0].data();
      let html = `<h3>${tipo.toUpperCase()}: ${d.nombre}</h3>`;
      if(tipo==="proveedor"){
        html += `<p><b>RUC:</b> ${d.ruc}</p>
                 <p><b>Dirección:</b> ${d.direccion || "-"}</p>
                 <p><b>Teléfono:</b> ${d.telefono || "-"}</p>`;
      } else {
        html += `<p><b>Cantidad:</b> ${d.cantidad}</p>
                 <p><b>Precio:</b> ${d.precio}</p>
                 <p><b>Descripción:</b> <span style="white-space: pre-line;">${d.descripcion}</span></p>`;
      }
      modalExtraBody.innerHTML = html;
      modalExtra.showModal();
    }
    return;
  }

  // EDITAR FILAS
  if(e.target.classList.contains("editar")){
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    let coleccion;
    let campos = {};
    if(tipo==="proveedor") coleccion = colProveedores;
    if(tipo==="producto") coleccion = colProductos;
    if(tipo==="factura") coleccion = colFacturas;
    const docRef = doc(db, coleccion.path, id);
    const snap = await getDocs(query(coleccion));
    const d = snap.docs.find(docu => docu.id===id).data();

    if(tipo==="proveedor"){
      campos.ruc = prompt("RUC:", d.ruc) || d.ruc;
      campos.nombre = prompt("Nombre:", d.nombre) || d.nombre;
      campos.direccion = prompt("Dirección:", d.direccion) || d.direccion;
      campos.telefono = prompt("Teléfono:", d.telefono) || d.telefono;
    }
    if(tipo==="producto"){
      campos.nombre = prompt("Nombre:", d.nombre) || d.nombre;
      campos.cantidad = parseInt(prompt("Cantidad:", d.cantidad) || d.cantidad);
      campos.precio = parseFloat(prompt("Precio:", d.precio) || d.precio);
      campos.descripcion = prompt("Descripción:", d.descripcion) || d.descripcion;
    }
    if(tipo==="factura"){
      campos.idFactura = prompt("ID Factura:", d.idFactura) || d.idFactura;
      campos.fecha = prompt("Fecha:", d.fecha) || d.fecha;
      campos.proveedor = prompt("Proveedor:", d.proveedor) || d.proveedor;
      campos.producto = prompt("Producto:", d.producto) || d.producto;
      campos.monto = parseFloat(prompt("Monto:", d.monto) || d.monto);
      campos.tipo = prompt("Tipo:", d.tipo) || d.tipo;
    }
    await updateDoc(docRef, campos);
  }

});
