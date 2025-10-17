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

const modalEditar = document.getElementById("modalEditar");
const modalEditarBody = document.getElementById("modalEditarBody");
const cerrarModalEditar = document.getElementById("cerrarModalEditar");

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
    buscador.style.display = btn.dataset.target === "facturas" ? "block" : "none";
    if(btn.dataset.target !== "facturas") panelFacturas.innerHTML = "";
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
    <p><b>Proveedor:</b> <span class="link-info" data-tipo="proveedor" data-nombre="${f.proveedor}" style="color:#f97316;">${f.proveedor}</span></p>
    <p><b>Producto:</b> <span class="link-info" data-tipo="producto" data-nombre="${f.producto}" style="color:#14b8a6;">${f.producto}</span></p>
    <p><b>Monto:</b> S/. ${f.monto}</p>
    <p><b>Tipo:</b> ${f.tipo}</p>`;
  modalFactura.showModal();
}

// ===================== CERRAR MODALES =====================
cerrarModalFactura.addEventListener("click", () => modalFactura.close());
cerrarModalExtra.addEventListener("click", () => modalExtra.close());
cerrarModalEditar.addEventListener("click", () => modalEditar.close());

// ===================== FUNCION PARA EDITAR EN PANEL =====================
async function abrirPanelEditar(tipo, id) {
  const col = tipo === "proveedor" ? colProveedores : tipo === "producto" ? colProductos : colFacturas;
  const snap = await getDocs(query(col, where("__name__", "==", id)));
  if (snap.empty) return;

  const data = snap.docs[0].data();
  let html = '';
  if(tipo === "proveedor") {
    html = `
      <h4>Editar Proveedor</h4>
      <label>RUC</label><input type="text" id="editRuc" class="form-control" value="${data.ruc}">
      <label>Nombre</label><input type="text" id="editNombre" class="form-control" value="${data.nombre}">
      <label>Dirección</label><input type="text" id="editDireccion" class="form-control" value="${data.direccion || ''}">
      <label>Teléfono</label><input type="text" id="editTelefono" class="form-control" value="${data.telefono || ''}">
      <button id="btnGuardarEdit" class="btn btn-success mt-2">Guardar</button>
    `;
  } else if(tipo === "producto") {
    html = `
      <h4>Editar Producto</h4>
      <label>Nombre</label><input type="text" id="editNombre" class="form-control" value="${data.nombre}">
      <label>Cantidad</label><input type="number" id="editCantidad" class="form-control" value="${data.cantidad}">
      <label>Precio</label><input type="number" step="0.01" id="editPrecio" class="form-control" value="${data.precio}">
      <label>Descripción</label><textarea id="editDescripcion" class="form-control">${data.descripcion || ''}</textarea>
      <button id="btnGuardarEdit" class="btn btn-success mt-2">Guardar</button>
    `;
  } else {
    html = `
      <h4>Editar Factura</h4>
      <label>ID Factura</label><input type="text" id="editIdFactura" class="form-control" value="${data.idFactura}">
      <label>Fecha</label><input type="date" id="editFecha" class="form-control" value="${data.fecha}">
      <label>Proveedor</label><input type="text" id="editProveedor" class="form-control" value="${data.proveedor}">
      <label>Producto</label><input type="text" id="editProducto" class="form-control" value="${data.producto}">
      <label>Monto</label><input type="number" step="0.01" id="editMonto" class="form-control" value="${data.monto}">
      <label>Tipo</label><input type="text" id="editTipo" class="form-control" value="${data.tipo}">
      <button id="btnGuardarEdit" class="btn btn-success mt-2">Guardar</button>
    `;
  }

  modalEditarBody.innerHTML = html;
  modalEditar.showModal();

  document.getElementById("btnGuardarEdit").addEventListener("click", async () => {
    const docRef = doc(db, tipo === "proveedor" ? "proveedores" : tipo === "producto" ? "productos" : "facturas", id);
    const newData = tipo === "proveedor" ? {
      ruc: document.getElementById("editRuc").value.trim(),
      nombre: document.getElementById("editNombre").value.trim(),
      direccion: document.getElementById("editDireccion").value.trim(),
      telefono: document.getElementById("editTelefono").value.trim()
    } : tipo === "producto" ? {
      nombre: document.getElementById("editNombre").value.trim(),
      cantidad: parseInt(document.getElementById("editCantidad").value),
      precio: parseFloat(document.getElementById("editPrecio").value),
      descripcion: document.getElementById("editDescripcion").value.trim()
    } : {
      idFactura: document.getElementById("editIdFactura").value.trim(),
      fecha: document.getElementById("editFecha").value,
      proveedor: document.getElementById("editProveedor").value.trim(),
      producto: document.getElementById("editProducto").value.trim(),
      monto: parseFloat(document.getElementById("editMonto").value),
      tipo: document.getElementById("editTipo").value.trim()
    };
    await updateDoc(docRef, newData);
    modalEditar.close();
  });
}

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
        <button class="btn-accion editar" data-tipo="proveedor" data-id="${docu.id}">✏️</button>
        <button class="btn-accion eliminar" data-tipo="proveedor" data-id="${docu.id}">🗑️</button>
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
      <td style="white-space: pre-wrap;">${d.descripcion || ""}</td>
      <td>
        <button class="btn-accion editar" data-tipo="producto" data-id="${docu.id}">✏️</button>
        <button class="btn-accion eliminar" data-tipo="producto" data-id="${docu.id}">🗑️</button>
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
        <button class="btn-accion editar" data-tipo="factura" data-id="${docu.id}">✏️</button>
        <button class="btn-accion eliminar" data-tipo="factura" data-id="${docu.id}">🗑️</button>
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
      div.style.background = "#e0f2fe";
      div.innerHTML = `<strong class="link-info" data-tipo="factura">${f.idFactura}</strong>`;
      div.addEventListener("click", () => mostrarModalFactura(f));
      panelFacturas.appendChild(div);
    }
  });
});

// ===================== CLICK GLOBAL =====================
document.addEventListener("click", async e => {
  // BOTON EDITAR EN LISTA
  if(e.target.classList.contains("editar")) {
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    abrirPanelEditar(tipo, id);
  }

  // VER DETALLES FACTURA / PROVEEDOR / PRODUCTO
  if(e.target.classList.contains("link-info")) {
    const tipo = e.target.dataset.tipo;
    if(tipo === "factura") {
      const snap = await getDocs(query(colFacturas, where("idFactura", "==", e.target.textContent)));
      if(!snap.empty) mostrarModalFactura(snap.docs[0].data());
      return;
    }

    const nombre = e.target.dataset.nombre;
    if(confirm(`Deseas ver los datos de ${tipo}?`)) {
      const col = tipo === "proveedor" ? colProveedores : colProductos;
      const snap = await getDocs(query(col, where("nombre", "==", nombre)));
      if(snap.empty) {
        modalExtraBody.innerHTML = "<p>No se encontró información.</p>";
      } else {
        const d = snap.docs[0].data();
        modalExtraBody.innerHTML = tipo === "proveedor"
          ? `<h4>Proveedor</h4><p><b>Nombre:</b> ${d.nombre}</p><p><b>RUC:</b> ${d.ruc}</p><p><b>Dirección:</b> ${d.direccion}</p><p><b>Teléfono:</b> ${d.telefono}</p>`
          : `<h4>Producto</h4><p><b>Nombre:</b> ${d.nombre}</p><p><b>Cantidad:</b> ${d.cantidad}</p><p><b>Precio:</b> S/. ${d.precio}</p><p><b>Descripción:</b> ${d.descripcion}</p>`;
        modalExtra.showModal();
      }
    }
  }

  // ELIMINAR
  if(e.target.classList.contains("eliminar")) {
    if(!confirm("¿Seguro que deseas eliminar este registro?")) return;
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    const docRef = doc(db, tipo === "proveedor" ? "proveedores" : tipo === "producto" ? "productos" : "facturas", id);
    await deleteDoc(docRef);
  }
});

