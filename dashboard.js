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

// Modales
const modalFactura = document.getElementById("modalFactura");
const contenidoModalFactura = document.getElementById("modalFacturaBody");
const cerrarModalFactura = document.getElementById("cerrarModalFactura");

const modalExtra = document.getElementById("modalExtra");
const modalExtraBody = document.getElementById("modalExtraBody");
const cerrarModalExtra = document.getElementById("cerrarModalExtra");

const modalEditar = document.getElementById("modalEditar");
const formEditar = document.getElementById("formEditar");
const btnCerrarEditar = document.getElementById("btnCerrarEditar");

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

    // Mostrar buscador solo en facturas
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
async function cargarProveedoresSelect(selectId) {
  const select = document.getElementById(selectId);
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

async function cargarProductosSelect(selectId) {
  const select = document.getElementById(selectId);
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
btnCerrarEditar.addEventListener("click", () => modalEditar.close());

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
        <button class="btn-accion eliminar" data-id="${docu.id}" data-tipo="proveedor">🗑️</button>
      </td>`;
    tablaProveedores.appendChild(tr);
  });
  countProveedores.textContent = snapshot.size;
  cargarProveedoresSelect("proveedorFactura");
  cargarProveedoresSelect("editProveedorFactura");
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
      <td>${d.descripcion || ""}</td>
      <td>
        <button class="btn-accion editar" data-id="${docu.id}" data-tipo="producto">✏️</button>
        <button class="btn-accion eliminar" data-id="${docu.id}" data-tipo="producto">🗑️</button>
      </td>`;
    tablaProductos.appendChild(tr);
  });
  countProductos.textContent = snapshot.size;
  cargarProductosSelect("productoFactura");
  cargarProductosSelect("editProductoFactura");
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
        <button class="btn-accion eliminar" data-id="${docu.id}" data-tipo="factura">🗑️</button>
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
      div.innerHTML = `<strong class="link-info" data-tipo="factura">${f.idFactura}</strong>`;
      div.addEventListener("click", () => mostrarModalFactura(f));
      panelFacturas.appendChild(div);
    }
  });
});

// ===================== CLICK GLOBAL =====================
document.addEventListener("click", async e => {

  // VER DETALLES
  if (e.target.classList.contains("link-info")) {
    const tipo = e.target.dataset.tipo;
    if (tipo === "factura") {
      const snap = await getDocs(query(colFacturas, where("idFactura", "==", e.target.textContent)));
      if (!snap.empty) mostrarModalFactura(snap.docs[0].data());
      return;
    }

    const nombre = e.target.dataset.nombre;
    const col = tipo === "proveedor" ? colProveedores : colProductos;
    const snap = await getDocs(query(col, where("nombre", "==", nombre)));
    if (snap.empty) {
      modalExtraBody.innerHTML = "<p>No se encontró información.</p>";
    } else {
      const d = snap.docs[0].data();
      modalExtraBody.innerHTML = tipo === "proveedor"
        ? `<h4>Proveedor</h4><p><b>Nombre:</b> ${d.nombre}</p><p><b>RUC:</b> ${d.ruc}</p><p><b>Dirección:</b> ${d.direccion}</p><p><b>Teléfono:</b> ${d.telefono}</p>`
        : `<h4>Producto</h4><p><b>Nombre:</b> ${d.nombre}</p><p><b>Cantidad:</b> ${d.cantidad}</p><p><b>Precio:</b> ${d.precio}</p><p><b>Descripción:</b> ${d.descripcion}</p>`;
    }
    modalExtra.showModal();
    return;
  }

  // ELIMINAR
  if (e.target.classList.contains("eliminar")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    const col = tipo === "proveedor" ? colProveedores : tipo === "producto" ? colProductos : colFacturas;
    if (confirm("¿Seguro quieres eliminar este registro?")) {
      await deleteDoc(doc(col, id));
    }
    return;
  }

  // EDITAR
  if (e.target.classList.contains("editar")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    modalEditar.dataset.tipo = tipo;
    modalEditar.dataset.id = id;

    // Mostrar solo los campos correspondientes
    document.getElementById("camposProveedor").style.display = tipo === "proveedor" ? "block" : "none";
    document.getElementById("camposProducto").style.display = tipo === "producto" ? "block" : "none";
    document.getElementById("camposFactura").style.display = tipo === "factura" ? "block" : "none";

    // Rellenar datos
    const col = tipo === "proveedor" ? colProveedores : tipo === "producto" ? colProductos : colFacturas;
    const docRef = doc(col, id);
    const snap = await getDocs(query(col, where("__name__", "==", id)));
    const data = (await docRef.get()).data?.() || snap.docs[0].data();

    if(tipo === "proveedor"){
      document.getElementById("editRuc").value = data.ruc || "";
      document.getElementById("editNombre").value = data.nombre || "";
      document.getElementById("editDireccion").value = data.direccion || "";
      document.getElementById("editTelefono").value = data.telefono || "";
    } else if(tipo === "producto"){
      document.getElementById("editNombreProd").value = data.nombre || "";
      document.getElementById("editCantidad").value = data.cantidad || 0;
      document.getElementById("editPrecio").value = data.precio || 0;
      document.getElementById("editDescripcion").value = data.descripcion || "";
    } else if(tipo === "factura"){
      document.getElementById("editIdFactura").value = data.idFactura || "";
      document.getElementById("editFecha").value = data.fecha || "";
      document.getElementById("editMonto").value = data.monto || 0;
      document.getElementById("editTipo").value = data.tipo || "";
      await cargarProveedoresSelect("editProveedorFactura");
      await cargarProductosSelect("editProductoFactura");
      document.getElementById("editProveedorFactura").value = data.proveedor;
      document.getElementById("editProductoFactura").value = data.producto;
    }

    modalEditar.showModal();
  }
});

// ===================== GUARDAR EDITADO =====================
formEditar.addEventListener("submit", async e => {
  e.preventDefault();
  const tipo = modalEditar.dataset.tipo;
  const id = modalEditar.dataset.id;
  const docRef = doc(tipo === "proveedor" ? colProveedores : tipo === "producto" ? colProductos : colFacturas, id);
  let data = {};

  if(tipo === "proveedor"){
    data = {
      ruc: document.getElementById("editRuc").value.trim(),
      nombre: document.getElementById("editNombre").value.trim(),
      direccion: document.getElementById("editDireccion").value.trim(),
      telefono: document.getElementById("editTelefono").value.trim()
    };
  } else if(tipo === "producto"){
    data = {
      nombre: document.getElementById("editNombreProd").value.trim(),
      cantidad: parseInt(document.getElementById("editCantidad").value),
      precio: parseFloat(document.getElementById("editPrecio").value),
      descripcion: document.getElementById("editDescripcion").value.trim()
    };
  } else if(tipo === "factura"){
    data = {
      idFactura: document.getElementById("editIdFactura").value.trim(),
      fecha: document.getElementById("editFecha").value,
      proveedor: document.getElementById("editProveedorFactura").value,
      producto: document.getElementById("editProductoFactura").value,
      monto: parseFloat(document.getElementById("editMonto").value),
      tipo: document.getElementById("editTipo").value
    };
  }

  await updateDoc(docRef, data);
  modalEditar.close();
});


  modalEditar.close();
});

