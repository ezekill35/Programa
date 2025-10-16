// dashboard.js
import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// === Navegación entre secciones ===
const botonesMenu = document.querySelectorAll(".menu-btn");
const secciones = document.querySelectorAll(".seccion");
botonesMenu.forEach((btn) => {
  btn.addEventListener("click", () => {
    botonesMenu.forEach((b) => b.classList.remove("activo"));
    btn.classList.add("activo");
    const destino = btn.dataset.target;
    secciones.forEach((sec) => sec.classList.remove("activa"));
    document.getElementById(destino).classList.add("activa");
  });
});

// === Cierre de sesión ===
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (e) {
    alert("Error al cerrar sesión: " + e.message);
  }
});

// === Colecciones Firestore ===
const colProveedores = collection(db, "proveedores");
const colProductos = collection(db, "productos");
const colFacturas = collection(db, "facturas");

// === FORMULARIOS ===

// --- Proveedores ---
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");

proveedorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    ruc: proveedorForm.rucProveedor.value,
    nombre: proveedorForm.nombreProveedor.value,
    direccion: proveedorForm.direccionProveedor.value,
    telefono: proveedorForm.telefonoProveedor.value || "",
  };
  await addDoc(colProveedores, data);
  proveedorForm.reset();
});

// Escucha en tiempo real
onSnapshot(colProveedores, (snapshot) => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach((docu) => {
    const p = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.ruc}</td>
      <td>${p.nombre}</td>
      <td>${p.direccion}</td>
      <td>${p.telefono}</td>
      <td><button class="btn" data-id="${docu.id}" data-tipo="proveedor">🗑</button></td>
    `;
    tablaProveedores.appendChild(tr);
  });
});

// --- Productos ---
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");

productoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    nombre: productoForm.nombreProducto.value,
    cantidad: parseInt(productoForm.cantidadProducto.value),
    precio: parseFloat(productoForm.precioProducto.value),
    descripcion: productoForm.descripcionProducto.value || "",
  };
  await addDoc(colProductos, data);
  productoForm.reset();
});

// Escucha en tiempo real
onSnapshot(colProductos, (snapshot) => {
  tablaProductos.innerHTML = "";
  const selectProducto = document.getElementById("productoFactura");
  selectProducto.innerHTML = `<option value="">Seleccionar producto</option>`;
  snapshot.forEach((docu) => {
    const p = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.cantidad}</td>
      <td>${p.precio}</td>
      <td>${p.descripcion}</td>
      <td><button class="btn" data-id="${docu.id}" data-tipo="producto">🗑</button></td>
    `;
    tablaProductos.appendChild(tr);

    // Llenar el select de facturas
    const opt = document.createElement("option");
    opt.value = p.nombre;
    opt.textContent = p.nombre;
    selectProducto.appendChild(opt);
  });
});

// --- Facturas ---
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");

facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    idFactura: facturaForm.idFactura.value,
    fecha: facturaForm.fechaFactura.value,
    proveedor: facturaForm.proveedorFactura.value,
    producto: facturaForm.productoFactura.value,
    monto: parseFloat(facturaForm.montoFactura.value),
    tipo: facturaForm.tipoFactura.value,
  };
  await addDoc(colFacturas, data);
  facturaForm.reset();
});

// Escucha en tiempo real
onSnapshot(colFacturas, (snapshot) => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach((docu) => {
    const f = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.idFactura}</td>
      <td>${f.fecha}</td>
      <td>${f.proveedor}</td>
      <td>${f.producto}</td>
      <td>${f.monto}</td>
      <td>${f.tipo}</td>
      <td><button class="btn" data-id="${docu.id}" data-tipo="factura">🗑</button></td>
    `;
    tablaFacturas.appendChild(tr);
  });
});

// Llenar select de proveedores en Facturas
onSnapshot(colProveedores, (snapshot) => {
  const selectProveedor = document.getElementById("proveedorFactura");
  selectProveedor.innerHTML = `<option value="">Seleccionar proveedor</option>`;
  snapshot.forEach((docu) => {
    const p = docu.data();
    const opt = document.createElement("option");
    opt.value = p.nombre;
    opt.textContent = p.nombre;
    selectProveedor.appendChild(opt);
  });
});

// === ELIMINAR DOCUMENTOS ===
document.addEventListener("click", async (e) => {
  if (e.target.matches("button[data-id]")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    let ref;
    if (tipo === "proveedor") ref = doc(db, "proveedores", id);
    if (tipo === "producto") ref = doc(db, "productos", id);
    if (tipo === "factura") ref = doc(db, "facturas", id);
    await deleteDoc(ref);
  }
});

// === BÚSQUEDA DE FACTURAS POR PRODUCTO ===
document.getElementById("buscadorFactura").addEventListener("input", async (e) => {
  const texto = e.target.value.trim().toLowerCase();
  if (!texto) return; // Si vacío, no hace nada
  const q = query(colFacturas, where("producto", "==", texto));
  const snap = await getDocs(q);
  tablaFacturas.innerHTML = "";
  snap.forEach((docu) => {
    const f = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.idFactura}</td>
      <td>${f.fecha}</td>
      <td>${f.proveedor}</td>
      <td>${f.producto}</td>
      <td>${f.monto}</td>
      <td>${f.tipo}</td>
    `;
    tablaFacturas.appendChild(tr);
  });
});

// === BOTÓN RESTABLECER ===
document.getElementById("btnRefresh").addEventListener("click", () => {
  document.getElementById("buscadorFactura").value = "";
  window.location.reload();
});

// === MODAL DETALLE (para futura ampliación) ===
const modal = document.getElementById("modalDetalle");
const modalContenido = document.getElementById("modalContenido");
document.getElementById("cerrarModal").addEventListener("click", () => {
  modal.style.display = "none";
});

