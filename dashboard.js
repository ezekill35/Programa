// === IMPORTS ===
import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// === NAVEGACIÓN ENTRE SECCIONES ===
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

// === CIERRE DE SESIÓN ===
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (e) {
    alert("Error al cerrar sesión: " + e.message);
  }
});

// === REFERENCIAS A COLECCIONES ===
const colProveedores = collection(db, "proveedores");
const colProductos = collection(db, "productos");
const colFacturas = collection(db, "facturas");

// === PROVEEDORES ===
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");

proveedorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();
  const telefono = document.getElementById("telefonoProveedor").value.trim();

  if (!ruc || !nombre) return alert("RUC y Nombre son obligatorios");

  await addDoc(colProveedores, { ruc, nombre, direccion, telefono: telefono || "" });
  proveedorForm.reset();
});

onSnapshot(colProveedores, (snap) => {
  tablaProveedores.innerHTML = "";
  snap.forEach((docu) => {
    const p = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.ruc}</td>
      <td>${p.nombre}</td>
      <td>${p.direccion || "-"}</td>
      <td>${p.telefono || "-"}</td>
      <td><button class="btn eliminar" data-id="${docu.id}" data-tipo="proveedor">🗑</button></td>
    `;
    tablaProveedores.appendChild(tr);
  });
});

// === PRODUCTOS ===
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");

productoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const cantidad = parseInt(document.getElementById("cantidadProducto").value);
  const precioRaw = document.getElementById("precioProducto").value.trim();
  const precio = parseFloat(precioRaw.replace(",", "."));
  const descripcion = document.getElementById("descripcionProducto").value.trim();

  if (!nombre || isNaN(cantidad) || isNaN(precio) || precio < 0)
    return alert("Introduce valores válidos (cantidad entera y precio positivo)");

  await addDoc(colProductos, { nombre, cantidad, precio, descripcion: descripcion || "" });
  productoForm.reset();
});

onSnapshot(colProductos, (snap) => {
  tablaProductos.innerHTML = "";
  const selectProducto = document.getElementById("productoFactura");
  selectProducto.innerHTML = `<option value="">Seleccionar producto</option>`;
  snap.forEach((docu) => {
    const p = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.cantidad}</td>
      <td>${p.precio.toFixed(2)}</td>
      <td>${p.descripcion || "-"}</td>
      <td><button class="btn eliminar" data-id="${docu.id}" data-tipo="producto">🗑</button></td>
    `;
    tablaProductos.appendChild(tr);

    const opt = document.createElement("option");
    opt.value = p.nombre;
    opt.textContent = p.nombre;
    selectProducto.appendChild(opt);
  });
});

// === FACTURAS ===
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");

facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const idFactura = document.getElementById("idFactura").value.trim();
  const fecha = document.getElementById("fechaFactura").value;
  const proveedor = document.getElementById("proveedorFactura").value;
  const producto = document.getElementById("productoFactura").value;
  const montoRaw = document.getElementById("montoFactura").value.trim();
  const monto = parseFloat(montoRaw.replace(",", "."));
  const tipo = document.getElementById("tipoFactura").value;

  if (!idFactura || !fecha || !proveedor || !producto || isNaN(monto) || monto < 0)
    return alert("Introduce valores válidos para la factura");

  await addDoc(colFacturas, { idFactura, fecha, proveedor, producto, monto, tipo });
  facturaForm.reset();
});

function renderFacturas(snapshot) {
  tablaFacturas.innerHTML = "";
  snapshot.forEach((docu) => {
    const f = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.idFactura}</td>
      <td>${f.fecha}</td>
      <td>${f.proveedor}</td>
      <td>${f.producto}</td>
      <td>${f.monto.toFixed(2)}</td>
      <td>${f.tipo}</td>
      <td><button class="btn eliminar" data-id="${docu.id}" data-tipo="factura">🗑</button></td>
    `;
    tablaFacturas.appendChild(tr);
  });
}

onSnapshot(colFacturas, renderFacturas);

// === SELECT PROVEEDORES ===
onSnapshot(colProveedores, (snap) => {
  const selectProveedor = document.getElementById("proveedorFactura");
  selectProveedor.innerHTML = `<option value="">Seleccionar proveedor</option>`;
  snap.forEach((docu) => {
    const p = docu.data();
    const opt = document.createElement("option");
    opt.value = p.nombre;
    opt.textContent = p.nombre;
    selectProveedor.appendChild(opt);
  });
});

// === ELIMINAR DOCUMENTOS ===
document.addEventListener("click", async (e) => {
  if (e.target.matches(".eliminar")) {
    if (!confirm("¿Seguro de eliminar?")) return;
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    let ref;
    if (tipo === "proveedor") ref = doc(db, "proveedores", id);
    if (tipo === "producto") ref = doc(db, "productos", id);
    if (tipo === "factura") ref = doc(db, "facturas", id);
    await deleteDoc(ref);
  }
});

// === BÚSQUEDA PARCIAL FACTURAS ===
document.getElementById("buscadorFactura").addEventListener("input", async (e) => {
  const texto = e.target.value.trim().toLowerCase();
  if (!texto) return onSnapshot(colFacturas, renderFacturas);

  const snap = await getDocs(colFacturas);
  tablaFacturas.innerHTML = "";
  snap.forEach((docu) => {
    const f = docu.data();
    if (f.producto.toLowerCase().includes(texto)) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${f.idFactura}</td>
        <td>${f.fecha}</td>
        <td>${f.proveedor}</td>
        <td>${f.producto}</td>
        <td>${f.monto.toFixed(2)}</td>
        <td>${f.tipo}</td>
        <td><button class="btn eliminar" data-id="${docu.id}" data-tipo="factura">🗑</button></td>
      `;
      tablaFacturas.appendChild(tr);
    }
  });
});

// === RESTABLECER ===
document.getElementById("btnRefresh").addEventListener("click", () => {
  document.getElementById("buscadorFactura").value = "";
  onSnapshot(colFacturas, renderFacturas);
});

// === MODAL DETALLE ===
const modal = document.getElementById("modalDetalle");
const modalContenido = document.getElementById("modalContenido");
document.getElementById("cerrarModal").addEventListener("click", () => {
  modal.style.display = "none";
});


