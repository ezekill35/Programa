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

onSnapshot(colProveedores, (snapshot) => {
  tablaProveedores.innerHTML = "";
  const selectProveedor = document.getElementById("proveedorFactura");
  selectProveedor.innerHTML = `<option value="">Seleccionar proveedor</option>`;

  snapshot.forEach((docu) => {
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

    // Cargar select proveedor
    const opt = document.createElement("option");
    opt.value = p.nombre;
    opt.textContent = p.nombre;
    selectProveedor.appendChild(opt);
  });
});

// === PRODUCTOS ===
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");

productoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const cantidad = parseInt(document.getElementById("cantidadProducto").value);
  const precio = parseFloat(document.getElementById("precioProducto").value);
  const descripcion = document.getElementById("descripcionProducto").value.trim();

  if (!nombre || isNaN(cantidad) || isNaN(precio)) return alert("Complete todos los campos obligatorios");

  await addDoc(colProductos, { nombre, cantidad, precio, descripcion: descripcion || "" });
  productoForm.reset();
});

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
      <td>${p.descripcion || "-"}</td>
      <td><button class="btn eliminar" data-id="${docu.id}" data-tipo="producto">🗑</button></td>
    `;
    tablaProductos.appendChild(tr);

    // Cargar select producto
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
  const monto = parseFloat(document.getElementById("montoFactura").value);
  const tipo = document.getElementById("tipoFactura").value;

  if (!idFactura || !fecha || !proveedor || !producto || isNaN(monto)) return alert("Complete todos los campos");

  await addDoc(colFacturas, { idFactura, fecha, proveedor, producto, monto, tipo });
  facturaForm.reset();
});

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
      <td><button class="btn eliminar" data-id="${docu.id}" data-tipo="factura">🗑</button></td>
    `;
    tablaFacturas.appendChild(tr);
  });
});

// === ELIMINAR DOCUMENTOS ===
document.addEventListener("click", async (e) => {
  if (e.target.matches(".eliminar")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    let ref;
    if (tipo === "proveedor") ref = doc(db, "proveedores", id);
    if (tipo === "producto") ref = doc(db, "productos", id);
    if (tipo === "factura") ref = doc(db, "facturas", id);
    await deleteDoc(ref);
  }
});

// === BUSCADOR DE FACTURAS (FUNCIONA) ===
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
      div.style.padding = "6px 12px";
      div.style.cursor = "pointer";
      div.textContent = `${f.idFactura} - ${f.producto} - ${f.proveedor}`;
      div.addEventListener("click", () => mostrarModalFactura(f));
      panelFacturas.appendChild(div);
    }
  });
});

// === BOTÓN RESTABLECER ===
document.getElementById("btnRefresh").addEventListener("click", () => {
  buscador.value = "";
  panelFacturas.innerHTML = "";
});

// === MODAL FACTURA ===
const modalFactura = document.getElementById("modalFactura");
const contenidoModalFactura = document.getElementById("contenidoModalFactura");
document.getElementById("cerrarModalFactura").addEventListener("click", () => modalFactura.style.display = "none");

// === MODAL DETALLE EXTRA ===
const modalExtra = document.getElementById("modalDetalleExtra");
const contenidoDetalleExtra = document.getElementById("contenidoDetalleExtra");
document.getElementById("cerrarModalDetalle").addEventListener("click", () => modalExtra.style.display = "none");

// === FUNCIONES MODAL ===
function mostrarModalFactura(f) {
  contenidoModalFactura.innerHTML = `
    <p><strong>ID:</strong> ${f.idFactura}</p>
    <p><strong>Fecha:</strong> ${f.fecha}</p>
    <p><strong>Proveedor:</strong> <span class="clickable" style="color:var(--accent);cursor:pointer">${f.proveedor}</span></p>
    <p><strong>Producto:</strong> <span class="clickable" style="color:var(--accent);cursor:pointer">${f.producto}</span></p>
    <p><strong>Monto:</strong> ${f.monto}</p>
    <p><strong>Tipo:</strong> ${f.tipo}</p>
  `;
  modalFactura.style.display = "block";

  contenidoModalFactura.querySelectorAll(".clickable").forEach(el => {
    el.addEventListener("click", () => {
      const tipo = el.textContent === f.proveedor ? "proveedor" : "producto";
      if (confirm(`¿Deseas ver la información del ${tipo}?`)) {
        mostrarDetalleExtra(tipo, el.textContent);
      }
    });
  });
}

async function mostrarDetalleExtra(tipo, nombre) {
  let col = tipo === "proveedor" ? colProveedores : colProductos;
  const snap = await getDocs(col);
  const docu = snap.docs.find(d => d.data().nombre === nombre)?.data();
  if (!docu) return alert(`${tipo} no encontrado`);

  let html = "";
  if (tipo === "proveedor") {
    html = `<p><strong>RUC:</strong> ${docu.ruc}</p>
            <p><strong>Nombre:</strong> ${docu.nombre}</p>
            <p><strong>Dirección:</strong> ${docu.direccion || "-"}</p>
            <p><strong>Teléfono:</strong> ${docu.telefono || "-"}</p>`;
  } else {
    html = `<p><strong>Nombre:</strong> ${docu.nombre}</p>
            <p><strong>Cantidad:</strong> ${docu.cantidad}</p>
            <p><strong>Precio:</strong> ${docu.precio}</p>
            <p><strong>Descripción:</strong> ${docu.descripcion || "-"}</p>`;
  }

  contenidoDetalleExtra.innerHTML = html;
  modalExtra.style.display = "block";
}

