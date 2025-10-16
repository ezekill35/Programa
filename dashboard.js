// dashboard.js
import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

/* =================== DOM shortcuts =================== */
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");
const proveedorSelect = document.getElementById("proveedorFactura");

const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");
const productoSelect = document.getElementById("productoFactura");

const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");

const buscadorInput = document.getElementById("buscadorFactura");
const btnBuscar = document.getElementById("btnBuscarFactura");
const modalBuscador = document.getElementById("modalBuscador");
const cerrarModalBuscador = document.getElementById("cerrarModalBuscador");
const resultadoBusqueda = document.getElementById("resultadoBusqueda");

/* =================== In-memory caches =================== */
let proveedoresGuardados = []; // {id, nombre, ruc, direccion, telefono}
let productosGuardados = [];   // {id, nombre, unidad, maquinaria, productoOf, insumosExtra, descripcion}
let facturasGuardadas = [];    // {id, numero, proveedorId, proveedorName, productoId, productoName, cantidad, monto, moneda, tipo, fecha, idFactura}

/* =================== Optional logout (if exists) =================== */
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (err) {
    console.error("Logout error:", err);
  }
});

/* =================== HELPERS =================== */
function crearCeldaTexto(text = "-") {
  const td = document.createElement("td");
  td.textContent = text ?? "-";
  return td;
}
function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

/* =================== PROVEEDORES (Realtime) =================== */
proveedorForm.addEventListener("submit", async e => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const telefono = document.getElementById("telefonoProveedor").value.trim() || "";
  const direccion = document.getElementById("direccionProveedor").value.trim() || "";

  if (!nombre || !ruc) return alert("Nombre y RUC son obligatorios.");
  try {
    await addDoc(collection(db, "proveedores"), { nombre, ruc, telefono, direccion });
    proveedorForm.reset();
  } catch (err) {
    console.error("Error guardando proveedor:", err);
    alert("Error al guardar proveedor.");
  }
});

onSnapshot(collection(db, "proveedores"), snapshot => {
  proveedoresGuardados = [];
  clearChildren(tablaProveedores);
  // rebuild select
  if (proveedorSelect) {
    clearChildren(proveedorSelect);
    const opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "Seleccionar proveedor";
    proveedorSelect.appendChild(opt0);
  }

  snapshot.forEach(docu => {
    const p = { id: docu.id, ...docu.data() };
    proveedoresGuardados.push(p);

    // table row
    const tr = document.createElement("tr");
    tr.appendChild(crearCeldaTexto(p.nombre));
    tr.appendChild(crearCeldaTexto(p.ruc));
    tr.appendChild(crearCeldaTexto(p.telefono || "-"));
    tr.appendChild(crearCeldaTexto(p.direccion || "-"));

    const tdAcc = document.createElement("td");
    // Edit button - optional, simpler UX: user can delete, editing could be extended
    const btnDelete = document.createElement("button");
    btnDelete.className = "btn btn-sm btn-danger btn-delete";
    btnDelete.dataset.id = p.id;
    btnDelete.dataset.tipo = "proveedores";
    btnDelete.textContent = "🗑️";
    tdAcc.appendChild(btnDelete);

    tr.appendChild(tdAcc);
    tablaProveedores.appendChild(tr);

    // select option (value = id)
    if (proveedorSelect) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.nombre;
      proveedorSelect.appendChild(opt);
    }
  });
});

/* =================== PRODUCTOS (Realtime) =================== */
productoForm.addEventListener("submit", async e => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const unidad = document.getElementById("unidadProducto")?.value.trim() || "";
  const maquinaria = document.getElementById("maquinaria")?.value.trim() || "";
  const productoOf = document.getElementById("productoOf")?.value.trim() || "";
  const insumosExtra = document.getElementById("insumosExtra")?.value.trim() || "";
  const descripcion = document.getElementById("descripcionProducto")?.value.trim() || "";

  if (!nombre) return alert("El nombre del producto es obligatorio.");
  try {
    await addDoc(collection(db, "productos"), { nombre, unidad, maquinaria, productoOf, insumosExtra, descripcion });
    productoForm.reset();
  } catch (err) {
    console.error("Error guardando producto:", err);
    alert("Error al guardar producto.");
  }
});

onSnapshot(collection(db, "productos"), snapshot => {
  productosGuardados = [];
  clearChildren(tablaProductos);
  if (productoSelect) {
    clearChildren(productoSelect);
    const opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "Seleccionar producto";
    productoSelect.appendChild(opt0);
  }

  snapshot.forEach(docu => {
    const p = { id: docu.id, ...docu.data() };
    productosGuardados.push(p);

    const tr = document.createElement("tr");
    tr.appendChild(crearCeldaTexto(p.nombre));
    tr.appendChild(crearCeldaTexto(p.unidad || "-"));
    tr.appendChild(crearCeldaTexto(p.maquinaria || "-"));
    tr.appendChild(crearCeldaTexto(p.productoOf || "-"));
    tr.appendChild(crearCeldaTexto(p.insumosExtra || "-"));
    tr.appendChild(crearCeldaTexto(p.descripcion || "-"));

    const tdAcc = document.createElement("td");
    const btnDelete = document.createElement("button");
    btnDelete.className = "btn btn-sm btn-danger btn-delete";
    btnDelete.dataset.id = p.id;
    btnDelete.dataset.tipo = "productos";
    btnDelete.textContent = "🗑️";
    tdAcc.appendChild(btnDelete);
    tr.appendChild(tdAcc);

    tablaProductos.appendChild(tr);

    // select option (value = id)
    if (productoSelect) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.nombre;
      productoSelect.appendChild(opt);
    }
  });
});

/* =================== FACTURAS (Realtime) =================== */
facturaForm.addEventListener("submit", async e => {
  e.preventDefault();
  const numero = document.getElementById("numeroFactura")?.value.trim() || "";
  const idFactura = document.getElementById("idFactura")?.value.trim() || "";
  const proveedorId = document.getElementById("proveedorFactura").value;
  const productoId = document.getElementById("productoFactura").value;
  const cantidad = document.getElementById("cantidadFactura")?.value || "";
  const monto = parseFloat(document.getElementById("montoFactura")?.value || "0") || 0;
  const moneda = document.getElementById("monedaFactura")?.value || "";
  const tipo = document.getElementById("tipoFactura")?.value || "";
  const fecha = document.getElementById("fechaFactura")?.value || "";

  if (!proveedorId || !productoId) return alert("Seleccione proveedor y producto.");

  // look up names from local cache, fallback to empty
  const proveedorObj = proveedoresGuardados.find(p => p.id === proveedorId);
  const productoObj = productosGuardados.find(p => p.id === productoId);
  const proveedorName = proveedorObj ? proveedorObj.nombre : "";
  const productoName = productoObj ? productoObj.nombre : "";

  try {
    await addDoc(collection(db, "facturas"), {
      idFactura,
      numero,
      proveedorId,
      proveedorName,
      productoId,
      productoName,
      cantidad,
      monto,
      moneda,
      tipo,
      fecha,
      createdAt: new Date().toISOString()
    });
    facturaForm.reset();
  } catch (err) {
    console.error("Error guardando factura:", err);
    alert("Error al guardar factura.");
  }
});

onSnapshot(collection(db, "facturas"), snapshot => {
  facturasGuardadas = [];
  clearChildren(tablaFacturas);
  snapshot.forEach(docu => {
    const f = { id: docu.id, ...docu.data() };
    facturasGuardadas.push(f);

    // display row with names (we saved proveedorName/productoName for speed)
    const tr = document.createElement("tr");
    const tdProv = document.createElement("td");
    tdProv.textContent = f.proveedorName || f.proveedor || "-";
    tdProv.className = "ver-proveedor";
    tdProv.style.cursor = "pointer";
    tdProv.dataset.nombre = f.proveedorName || f.proveedor || "";
    const tdProd = document.createElement("td");
    tdProd.textContent = f.productoName || f.producto || "-";
    tdProd.className = "ver-producto";
    tdProd.style.cursor = "pointer";
    tdProd.dataset.nombre = f.productoName || f.producto || "";

    tr.appendChild(tdProv);
    tr.appendChild(tdProd);
    tr.appendChild(crearCeldaTexto(f.cantidad || "-"));
    tr.appendChild(crearCeldaTexto((f.moneda||"") + (f.monto || "-")));
    tr.appendChild(crearCeldaTexto(f.tipo || "-"));
    tr.appendChild(crearCeldaTexto(f.fecha || "-"));

    const tdAcc = document.createElement("td");
    const btnDetalle = document.createElement("button");
    btnDetalle.className = "btn btn-sm btn-primary ver-detalle";
    btnDetalle.dataset.id = f.id;
    btnDetalle.textContent = "Ver Detalle";
    tdAcc.appendChild(btnDetalle);

    const btnDelete = document.createElement("button");
    btnDelete.className = "btn btn-sm btn-danger btn-delete";
    btnDelete.dataset.id = f.id;
    btnDelete.dataset.tipo = "facturas";
    btnDelete.style.marginLeft = "6px";
    btnDelete.textContent = "🗑️";
    tdAcc.appendChild(btnDelete);

    tr.appendChild(tdAcc);
    tablaFacturas.appendChild(tr);
  });
});

/* =================== BUSCADOR (modal glass + tarjetas) =================== */

function realizarBusqueda(term) {
  const q = (term || "").trim().toLowerCase();
  if (!q) {
    alert("Escribe el nombre (o parte) del producto para buscar.");
    return;
  }

  // match product ids by name (insensitive)
  const matchedProductIds = productosGuardados
    .filter(p => (p.nombre || "").toLowerCase().includes(q))
    .map(p => p.id);

  // also consider facturas that have productoName including term (for older records)
  const resultados = facturasGuardadas.filter(f =>
    (f.productoName && f.productoName.toLowerCase().includes(q)) ||
    matchedProductIds.includes(f.productoId)
  );

  renderModalResultados(resultados, q);
}

buscadorInput?.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    realizarBusqueda(buscadorInput.value);
  }
});
btnBuscar?.addEventListener("click", () => realizarBusqueda(buscadorInput.value));
cerrarModalBuscador?.addEventListener("click", () => modalBuscador.classList.remove("show"));

// render results into modal
function renderModalResultados(resultados, termino) {
  clearChildren(resultadoBusqueda);

  modalBuscador?.classList.add("show");

  const header = document.createElement("div");
  header.innerHTML = `<p style="margin:0 0 8px 0;color:#055160"><strong>Resultados para:</strong> "${termino}" — ${resultados.length} ${resultados.length === 1 ? 'factura' : 'facturas'}</p>`;
  resultadoBusqueda.appendChild(header);

  if (resultados.length === 0) {
    const empty = document.createElement("div");
    empty.textContent = "No se encontraron facturas para ese producto.";
    resultadoBusqueda.appendChild(empty);
    return;
  }

  const container = document.createElement("div");
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fit,minmax(280px,1fr))";
  container.style.gap = "12px";

  resultados.forEach(f => {
    const prov = proveedoresGuardados.find(p => p.id === f.proveedorId) || null;
    const prod = productosGuardados.find(p => p.id === f.productoId) || null;

    const card = document.createElement("div");
    card.style.background = "rgba(255,255,255,0.85)";
    card.style.borderRadius = "12px";
    card.style.padding = "12px";
    card.style.boxShadow = "0 8px 20px rgba(2,6,23,0.06)";
    card.style.border = "1px solid rgba(13,43,59,0.06)";

    // header info
    const numeroDisplay = f.numero ? `N° ${f.numero}` : f.idFactura ? `ID ${f.idFactura}` : "";
    const montoDisplay = (f.moneda || "") + (f.monto ? f.monto.toFixed(2) : "-");

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <div>
          <div style="font-weight:700;color:#0b5560">${f.productoName || prod?.nombre || "-"}</div>
          <div style="font-size:13px;color:#256d6a">${prod ? prod.descripcion || "" : ""}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:12px;color:#6b7280">${numeroDisplay}</div>
          <div style="font-weight:700">${montoDisplay}</div>
        </div>
      </div>
      <hr style="margin:10px 0;border:none;border-top:1px dashed rgba(0,0,0,0.06)">
      <div style="font-size:13px;color:#334155">
        <div><strong>Proveedor:</strong> ${f.proveedorName || prov?.nombre || "-"}</div>
        <div><strong>RUC:</strong> ${prov ? prov.ruc : "-"}</div>
        <div><strong>Cantidad:</strong> ${f.cantidad || "-"}</div>
        <div><strong>Fecha:</strong> ${f.fecha || "-"}</div>
      </div>
      <div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end">
        <button class="btn btn-sm btn-outline-primary ver-detalle-card" data-id="${f.id}">Ver Detalles</button>
      </div>
    `;
    container.appendChild(card);
  });

  resultadoBusqueda.appendChild(container);
}

/* =================== DETALLE MODAL (dinámico) =================== */
let modalDetalle = document.getElementById("modalDetalleFactura");
if (!modalDetalle) {
  modalDetalle = document.createElement("div");
  modalDetalle.id = "modalDetalleFactura";
  modalDetalle.style.position = "fixed";
  modalDetalle.style.inset = "0";
  modalDetalle.style.display = "none";
  modalDetalle.style.alignItems = "center";
  modalDetalle.style.justifyContent = "center";
  modalDetalle.style.zIndex = "1200";
  modalDetalle.innerHTML = `
    <div style="position:absolute;inset:0;background:rgba(0,0,0,0.45)"></div>
    <div style="position:relative;z-index:1210;max-width:640px;width:calc(100% - 32px);background:linear-gradient(180deg,#ffffff,#f7feff);border-radius:12px;padding:18px;box-shadow:0 12px 30px rgba(2,6,23,0.18)">
      <button id="cerrarDetalleManual" style="position:absolute;right:12px;top:8px;border:none;background:transparent;font-size:20px;cursor:pointer">&times;</button>
      <div id="modalDetalleContenido"></div>
    </div>`;
  document.body.appendChild(modalDetalle);
  document.getElementById("cerrarDetalleManual").addEventListener("click", () => (modalDetalle.style.display = "none"));
}

// Delegation: handle "Ver Detalle" from various places
document.addEventListener("click", (e) => {
  // Ver detalle from main table or modal card
  if (e.target.classList.contains("ver-detalle") || e.target.classList.contains("ver-detalle-card")) {
    const id = e.target.dataset.id;
    const factura = facturasGuardadas.find(x => x.id === id);
    if (!factura) return alert("Factura no encontrada (puede haberse eliminado).");

    const prov = proveedoresGuardados.find(p => p.id === factura.proveedorId) || null;
    const prod = productosGuardados.find(p => p.id === factura.productoId) || null;

    const html = `
      <h4 style="margin-top:0;color:#073642">Detalle de factura</h4>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <div style="flex:1;min-width:180px"><strong>Numero / ID:</strong> ${factura.numero || factura.idFactura || "-"}</div>
        <div style="flex:1;min-width:180px"><strong>Tipo:</strong> ${factura.tipo || "-"}</div>
      </div>
      <hr>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <div style="flex:1">
          <h6 style="margin:0">Proveedor</h6>
          <div><strong>Nombre:</strong> ${factura.proveedorName || prov?.nombre || "-"}</div>
          <div><strong>RUC:</strong> ${prov ? prov.ruc : "-"}</div>
          <div><strong>Dirección:</strong> ${prov ? prov.direccion || "-" : "-"}</div>
        </div>
        <div style="flex:1">
          <h6 style="margin:0">Producto</h6>
          <div><strong>Nombre:</strong> ${factura.productoName || prod?.nombre || "-"}</div>
          <div><strong>Producto OF:</strong> ${prod ? prod.productoOf || "-" : "-"}</div>
          <div><strong>Descripción:</strong> ${prod ? prod.descripcion || "-" : "-"}</div>
        </div>
      </div>
      <hr>
      <div>
        <div><strong>Cantidad:</strong> ${factura.cantidad || "-"}</div>
        <div><strong>Monto:</strong> ${(factura.moneda||"")}${factura.monto ? factura.monto.toFixed(2) : "-"}</div>
        <div><strong>Fecha:</strong> ${factura.fecha || "-"}</div>
      </div>
      <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">
        <button id="cerrarDetalleBtn2" class="btn btn-sm btn-primary">Cerrar</button>
      </div>
    `;
    document.getElementById("modalDetalleContenido").innerHTML = html;
    modalDetalle.style.display = "flex";
    setTimeout(()=> {
      document.getElementById("cerrarDetalleBtn2")?.addEventListener("click", ()=> modalDetalle.style.display = "none");
    }, 10);
  }
});

/* =================== ELIMINAR (delegated) =================== */
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-delete")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    if (!id || !tipo) return;
    if (!confirm("¿Seguro que desea eliminar?")) return;
    try {
      await deleteDoc(doc(db, tipo, id));
    } catch (err) {
      console.error("Eliminar error:", err);
      alert("No se pudo eliminar.");
    }
  }
});

/* =================== Prevent accidental form submit via Enter on search inputs outside forms =================== */
if (buscadorInput) {
  buscadorInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") e.preventDefault(); // handled separately above
  });
}

/* =================== Initialization log =================== */
console.log("dashboard.js cargado — listeners onSnapshot activos (Realtime).");


