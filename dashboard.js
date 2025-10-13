// ------------------ Configuración Firebase ------------------
import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ------------------ Helpers ------------------
const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => document.querySelectorAll(selector);

// ------------------ Sidebar Tabs ------------------
qsa(".menu-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    qsa(".menu-btn").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");

    const target = btn.dataset.target;
    qsa(".seccion").forEach(sec => sec.classList.remove("activa"));
    const seccionActiva = qs(`#${target}`);
    seccionActiva.classList.add("activa");

    // Mantener la sección visible sin scroll hacia abajo
    seccionActiva.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// ------------------ Logout ------------------
qs("#logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ------------------ PROVEEDORES ------------------
const proveedorForm = qs("#proveedorForm");
const tablaProveedores = qs("#tablaProveedores");
const proveedorSelect = qs("#proveedorFactura");

proveedorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ruc = qs("#rucProveedor").value.trim();
  const nombre = qs("#nombreProveedor").value.trim();
  const direccion = qs("#direccionProveedor").value.trim();
  const telefono = qs("#telefonoProveedor") ? qs("#telefonoProveedor").value.trim() : "";

  if (!ruc || !nombre) return alert("RUC y Nombre son obligatorios");

  await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion, telefono });
  proveedorForm.reset();
});

onSnapshot(collection(db, "proveedores"), (snapshot) => {
  tablaProveedores.innerHTML = "";
  proveedorSelect.innerHTML = `<option value="">Seleccione proveedor</option>`;

  snapshot.forEach(docu => {
    const p = docu.data();
    // Tabla
    tablaProveedores.innerHTML += `
      <tr>
        <td>${p.ruc}</td>
        <td>${p.nombre}</td>
        <td>${p.direccion || ""}</td>
        <td>${p.telefono || ""}</td>
        <td><button class="btn-delete" data-id="${docu.id}" data-tipo="proveedores">🗑️</button></td>
      </tr>
    `;
    // Select proveedor
    const option = document.createElement("option");
    option.value = docu.id;   // ID real de Firestore
    option.textContent = p.nombre;
    proveedorSelect.appendChild(option);
  });
});

// ------------------ PRODUCTOS ------------------
const productoForm = qs("#productoForm");
const tablaProductos = qs("#tablaProductos");
const productoSelect = qs("#productoFactura");

productoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = qs("#nombreProducto").value.trim();
  const cantidad = qs("#cantidadProducto").value.trim();
  const unidad = qs("#unidadProducto").value.trim();
  const valor = qs("#valorUnitarioProducto").value.trim();
  const descripcion = qs("#descripcionProducto") ? qs("#descripcionProducto").value.trim() : "";
  const categoria = qs("#categoriaProducto") ? qs("#categoriaProducto").value : "";

  if (!nombre) return alert("Nombre es obligatorio");

  await addDoc(collection(db, "productos"), { nombre, cantidad, unidad, valor, descripcion, categoria });
  productoForm.reset();
});

onSnapshot(collection(db, "productos"), (snapshot) => {
  tablaProductos.innerHTML = "";
  productoSelect.innerHTML = `<option value="">Seleccione producto</option>`;

  snapshot.forEach(docu => {
    const p = docu.data();
    // Tabla
    tablaProductos.innerHTML += `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.cantidad || ""}</td>
        <td>${p.unidad || ""}</td>
        <td>${p.valor || ""}</td>
        <td>${p.descripcion || ""}</td>
        <td>${p.categoria || ""}</td>
        <td><button class="btn-delete" data-id="${docu.id}" data-tipo="productos">🗑️</button></td>
      </tr>
    `;
    // Select producto
    const option = document.createElement("option");
    option.value = docu.id;
    option.textContent = p.nombre;
    productoSelect.appendChild(option);
  });
});

// ------------------ FACTURAS ------------------
const facturaForm = qs("#facturaForm");
const tablaFacturas = qs("#tablaFacturas");

facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const numero = qs("#numeroFactura").value.trim();
  const fecha = qs("#fechaEmisionFactura").value;
  const proveedorId = proveedorSelect.value;
  const productoId = productoSelect.value;
  const monto = qs("#montoFactura").value.trim();
  const moneda = qs("#monedaFactura").value;
  const tipo = qs("#tipoFactura").value;

  if (!proveedorId || !productoId) return alert("Debe seleccionar un proveedor y un producto.");

  // Obtener nombres reales
  const provDoc = await getDoc(doc(db, "proveedores", proveedorId));
  const prodDoc = await getDoc(doc(db, "productos", productoId));

  await addDoc(collection(db, "facturas"), {
    numeroFactura: numero,
    fechaEmision: fecha,
    proveedorId,
    proveedorNombre: provDoc.data().nombre,
    productoId,
    productoNombre: prodDoc.data().nombre,
    monto,
    moneda,
    tipo
  });

  facturaForm.reset();
});

// Render facturas en tiempo real
onSnapshot(collection(db, "facturas"), (snapshot) => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(docu => {
    const f = docu.data();
    tablaFacturas.innerHTML += `
      <tr>
        <td>${docu.id}</td>
        <td>${f.numeroFactura || ""}</td>
        <td class="ver-proveedor" data-id="${f.proveedorId}" style="cursor:pointer;color:#007bff">${f.proveedorNombre || ""}</td>
        <td class="ver-producto" data-id="${f.productoId}" style="cursor:pointer;color:#007bff">${f.productoNombre || ""}</td>
        <td>${f.moneda || ""}${f.monto || ""}</td>
        <td>${f.tipo || ""}</td>
        <td>${f.fechaEmision || ""}</td>
        <td><button class="btn-delete" data-id="${docu.id}" data-tipo="facturas">🗑️</button></td>
      </tr>
    `;
  });
});

// ------------------ ELIMINAR ------------------
document.addEventListener("click", async (e) => {
  // Delete registro
  if (e.target.classList.contains("btn-delete")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    if (confirm("¿Desea eliminar este registro?")) {
      await deleteDoc(doc(db, tipo, id));
    }
  }

  // Mostrar modal proveedor
  if (e.target.classList.contains("ver-proveedor")) {
    const id = e.target.dataset.id;
    const docSnap = await getDoc(doc(db, "proveedores", id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      mostrarModalDatos("proveedores", data);
    }
  }

  // Mostrar modal producto
  if (e.target.classList.contains("ver-producto")) {
    const id = e.target.dataset.id;
    const docSnap = await getDoc(doc(db, "productos", id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      mostrarModalDatos("productos", data);
    }
  }
});

// ------------------ MODAL DETALLE ------------------
function mostrarModalDatos(tipo, data) {
  const modal = qs("#modalDetalle");
  const modalContenido = qs("#modalContenido");

  if (tipo === "proveedores") {
    modalContenido.innerHTML = `
      <h3>Proveedor: ${data.nombre}</h3>
      <p><strong>RUC:</strong> ${data.ruc || "-"}</p>
      <p><strong>Dirección:</strong> ${data.direccion || "-"}</p>
      <p><strong>Teléfono:</strong> ${data.telefono || "-"}</p>
    `;
  } else {
    modalContenido.innerHTML = `
      <h3>Producto: ${data.nombre}</h3>
      <p><strong>Unidad:</strong> ${data.unidad || "-"}</p>
      <p><strong>Cantidad:</strong> ${data.cantidad || "-"}</p>
      <p><strong>Valor:</strong> ${data.valor || "-"}</p>
      <p><strong>Descripción:</strong> ${data.descripcion || "-"}</p>
      <p><strong>Categoría:</strong> ${data.categoria || "-"}</p>
    `;
  }

  modal.style.display = "flex";
}

qs("#cerrarModal").addEventListener("click", () => {
  qs("#modalDetalle").style.display = "none";
});




