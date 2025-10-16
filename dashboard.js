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

/* =================== DOM refs (coinciden con tu index.html) =================== */
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
const btnRefresh = document.getElementById("btnRefresh");

const modalBuscador = document.getElementById("modalBuscador");
const resultadoBusqueda = document.getElementById("resultadoBusqueda");
const resultTitle = document.getElementById("resultTitle");
const resultSub = document.getElementById("resultSub");

const modalDetalle = document.getElementById("modalDetalle");
const modalContenido = document.getElementById("modalContenido");
const cerrarModal = document.getElementById("cerrarModal");

const modalFactura = document.getElementById("modalFactura");
const facturaTitle = document.getElementById("facturaTitle");
const modalFacturaContenido = document.getElementById("modalFacturaContenido");

/* =================== In-memory caches =================== */
let proveedores = []; // {id, ruc, nombre, direccion}
let productos = [];   // {id, nombre, cantidad, unidad, valorUnitario}
let facturas = [];    // {id, numero, fecha, proveedorId, proveedorName, productoId, productoName, monto, moneda, tipo}

/* =================== Helpers =================== */
function $(id) { return document.getElementById(id); }
function clearChildren(el){ while(el && el.firstChild) el.removeChild(el.firstChild); }
function formatMoney(m){ if (m === undefined || m === null || m === "") return "-"; const n = parseFloat(m); if (isNaN(n)) return m; return n.toFixed(2); }

/* Prevent accidental navigation on Enter in inputs not intended (search handled separately) */
if (buscadorInput) {
  buscadorInput.addEventListener("keydown", e => {
    if (e.key === "Enter") e.preventDefault();
  });
}

/* =================== Logout (if available) =================== */
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  try { await signOut(auth); window.location.href = "index.html"; }
  catch (err) { console.error("Logout error", err); alert("Error cerrando sesión"); }
});

/* =================== PROVEEDORES (Realtime) =================== */
proveedorForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const ruc = $("rucProveedor").value.trim();
  const nombre = $("nombreProveedor").value.trim();
  const direccion = $("direccionProveedor").value.trim() || "";
  if (!ruc || !nombre) return alert("RUC y nombre son obligatorios.");
  try {
    await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion });
    proveedorForm.reset();
  } catch (err) { console.error("Error añadir proveedor", err); alert("No se pudo guardar proveedor"); }
});

onSnapshot(collection(db, "proveedores"), snapshot => {
  proveedores = [];
  clearChildren(tablaProveedores);
  // reset select
  if (proveedorSelect) {
    clearChildren(proveedorSelect);
    const opt0 = document.createElement("option"); opt0.value = ""; opt0.textContent = "Seleccione proveedor";
    proveedorSelect.appendChild(opt0);
  }

  snapshot.forEach(docu => {
    const p = { id: docu.id, ...docu.data() };
    proveedores.push(p);

    // row
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.ruc}</td>
      <td>${p.nombre}</td>
      <td>${p.direccion || "-"}</td>
      <td class="action-col">
        <button class="btn small btn-ghost edit-provider" data-id="${p.id}">Editar</button>
        <button class="btn small" data-id="${p.id}" data-tipo="proveedores" style="background:#ef4444">Eliminar</button>
      </td>
    `;
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
productoForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const nombre = $("nombreProducto").value.trim();
  const cantidad = $("cantidadProducto")?.value.trim() || "";
  const unidad = $("unidadProducto")?.value.trim() || "";
  const valorUnitario = $("valorUnitarioProducto")?.value.trim() || "";
  if (!nombre) return alert("Nombre del producto es obligatorio.");
  try {
    await addDoc(collection(db, "productos"), { nombre, cantidad, unidad, valorUnitario });
    productoForm.reset();
  } catch (err) { console.error("Error añadir producto", err); alert("No se pudo guardar producto"); }
});

onSnapshot(collection(db, "productos"), snapshot => {
  productos = [];
  clearChildren(tablaProductos);
  if (productoSelect) {
    clearChildren(productoSelect);
    const opt0 = document.createElement("option"); opt0.value = ""; opt0.textContent = "Seleccione producto";
    productoSelect.appendChild(opt0);
  }

  snapshot.forEach(docu => {
    const p = { id: docu.id, ...docu.data() };
    productos.push(p);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.cantidad || "-"}</td>
      <td>${p.unidad || "-"}</td>
      <td>${p.valorUnitario ? formatMoney(p.valorUnitario) : "-"}</td>
      <td class="action-col">
        <button class="btn small btn-ghost edit-product" data-id="${p.id}">Editar</button>
        <button class="btn small" data-id="${p.id}" data-tipo="productos" style="background:#ef4444">Eliminar</button>
      </td>
    `;
    tablaProductos.appendChild(tr);

    // select option
    if (productoSelect) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.nombre;
      productoSelect.appendChild(opt);
    }
  });
});

/* =================== FACTURAS (Realtime) =================== */
facturaForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const numero = $("numeroFactura")?.value.trim() || "";
  const fecha = $("fechaFactura")?.value || "";
  const proveedorId = $("proveedorFactura")?.value;
  const productoId = $("productoFactura")?.value;
  const monto = parseFloat($("montoFactura")?.value || "0") || 0;
  const moneda = $("monedaFactura")?.value || "";
  const tipo = $("tipoFactura")?.value || "";

  if (!proveedorId || !productoId) return alert("Seleccione proveedor y producto para la factura.");

  // lookup names
  const prov = proveedores.find(p=>p.id === proveedorId);
  const prod = productos.find(p=>p.id === productoId);
  const proveedorName = prov ? prov.nombre : "";
  const productoName = prod ? prod.nombre : "";

  try {
    await addDoc(collection(db, "facturas"), {
      numero, fecha, proveedorId, proveedorName, productoId, productoName, monto, moneda, tipo, createdAt: new Date().toISOString()
    });
    facturaForm.reset();
  } catch (err) { console.error("Error añadir factura", err); alert("No se pudo guardar factura"); }
});

onSnapshot(collection(db, "facturas"), snapshot => {
  facturas = [];
  clearChildren(tablaFacturas);

  snapshot.forEach(docu => {
    const f = { id: docu.id, ...docu.data() };
    facturas.push(f);

    const tr = document.createElement("tr");
    const tdNumero = document.createElement("td"); tdNumero.textContent = f.numero || "-";
    const tdProv = document.createElement("td"); tdProv.textContent = f.proveedorName || "-"; tdProv.className = "ver-proveedor"; tdProv.style.cursor = "pointer"; tdProv.dataset.nombre = f.proveedorName || "";
    const tdProd = document.createElement("td"); tdProd.textContent = f.productoName || "-"; tdProd.className = "ver-producto"; tdProd.style.cursor = "pointer"; tdProd.dataset.nombre = f.productoName || "";
    const tdMonto = document.createElement("td"); tdMonto.textContent = `${f.moneda || ""}${formatMoney(f.monto)}`;
    const tdTipo = document.createElement("td"); tdTipo.textContent = f.tipo || "-";
    const tdFecha = document.createElement("td"); tdFecha.textContent = f.fecha || "-";

    const tdAcc = document.createElement("td"); tdAcc.className = "action-col";
    const btnDetalle = document.createElement("button"); btnDetalle.className = "btn small"; btnDetalle.textContent = "Ver Detalle"; btnDetalle.dataset.id = f.id;
    const btnEditar = document.createElement("button"); btnEditar.className = "btn small btn-ghost edit-factura"; btnEditar.textContent = "Editar"; btnEditar.dataset.id = f.id;
    const btnDelete = document.createElement("button"); btnDelete.className = "btn small"; btnDelete.style.background = "#ef4444"; btnDelete.textContent = "Eliminar"; btnDelete.dataset.id = f.id; btnDelete.dataset.tipo = "facturas";

    tdAcc.appendChild(btnDetalle); tdAcc.appendChild(btnEditar); tdAcc.appendChild(btnDelete);

    tr.appendChild(tdNumero); tr.appendChild(tdProv); tr.appendChild(tdProd); tr.appendChild(tdMonto); tr.appendChild(tdTipo); tr.appendChild(tdFecha); tr.appendChild(tdAcc);

    tablaFacturas.appendChild(tr);
  });
});

/* =================== ELIMINAR (delegated) =================== */
document.addEventListener("click", async (e) => {
  const t = e.target;
  if (!t) return;

  // delete
  if (t.dataset && t.dataset.tipo && t.classList.contains("btn")) {
    const id = t.dataset.id;
    const tipo = t.dataset.tipo;
    if (!id || !tipo) return;
    if (!confirm("¿Confirma eliminación?")) return;
    try {
      await deleteDoc(doc(db, tipo, id));
    } catch (err) { console.error("Eliminar error", err); alert("No se pudo eliminar"); }
  }

  // Edit provider
  if (t.classList.contains("edit-provider")) {
    const id = t.dataset.id;
    const p = proveedores.find(x => x.id === id);
    if (!p) return alert("Proveedor no encontrado");
    // show modalDetalle with form
    showProviderEditModal(p);
  }

  // Edit product
  if (t.classList.contains("edit-product")) {
    const id = t.dataset.id;
    const p = productos.find(x => x.id === id);
    if (!p) return alert("Producto no encontrado");
    showProductEditModal(p);
  }

  // Edit factura
  if (t.classList.contains("edit-factura")) {
    const id = t.dataset.id;
    const f = facturas.find(x => x.id === id);
    if (!f) return alert("Factura no encontrada");
    showFacturaEditModal(f);
  }

  // Ver detalle factura (table button)
  if (t && t.textContent && t.textContent.trim() === "Ver Detalle" && t.dataset.id) {
    const id = t.dataset.id;
    const f = facturas.find(x => x.id === id);
    if (!f) return alert("Factura no encontrada");
    showFacturaDetailModal(f);
  }
});

/* =================== EDIT MODALS =================== */
/* Provider edit modal */
function showProviderEditModal(p){
  if(!modalDetalle) return;
  modalContenido.innerHTML = `
    <h3>Editar proveedor</h3>
    <form id="editProveedorForm">
      <div class="row"><input id="editRuc" value="${p.ruc}" required /></div>
      <div class="row"><input id="editNombre" value="${p.nombre}" required /></div>
      <div class="row"><input id="editDireccion" value="${p.direccion || ''}" /></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
        <button type="button" class="btn" id="saveProveedorBtn">Guardar</button>
        <button type="button" class="btn btn-ghost" id="cancelProveedorBtn">Cancelar</button>
      </div>
    </form>
  `;
  modalDetalle.classList.add("show");
  // animation (slide+fade)
  animateModalIn(modalDetalle);

  document.getElementById("cancelProveedorBtn").addEventListener("click", ()=> modalDetalle.classList.remove("show"));
  document.getElementById("saveProveedorBtn").addEventListener("click", async ()=>{
    const ruc = document.getElementById("editRuc").value.trim();
    const nombre = document.getElementById("editNombre").value.trim();
    const direccion = document.getElementById("editDireccion").value.trim() || "";
    if (!ruc || !nombre) return alert("RUC y nombre son obligatorios.");
    try {
      await updateDoc(doc(db, "proveedores", p.id), { ruc, nombre, direccion });
      modalDetalle.classList.remove("show");
    } catch (err) { console.error("Actualizar proveedor", err); alert("No se pudo actualizar proveedor"); }
  });
}

/* Product edit modal */
function showProductEditModal(p){
  modalContenido.innerHTML = `
    <h3>Editar producto</h3>
    <form id="editProductoForm">
      <div class="row"><input id="editNombreProd" value="${p.nombre}" required /></div>
      <div class="row"><input id="editCantidadProd" value="${p.cantidad || ''}" /><input id="editUnidadProd" value="${p.unidad || ''}" /></div>
      <div class="row"><input id="editValorUnitarioProd" value="${p.valorUnitario || ''}" /></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
        <button type="button" class="btn" id="saveProductoBtn">Guardar</button>
        <button type="button" class="btn btn-ghost" id="cancelProductoBtn">Cancelar</button>
      </div>
    </form>
  `;
  modalDetalle.classList.add("show");
  animateModalIn(modalDetalle);

  document.getElementById("cancelProductoBtn").addEventListener("click", ()=> modalDetalle.classList.remove("show"));
  document.getElementById("saveProductoBtn").addEventListener("click", async ()=>{
    const nombre = document.getElementById("editNombreProd").value.trim();
    const cantidad = document.getElementById("editCantidadProd").value.trim() || "";
    const unidad = document.getElementById("editUnidadProd").value.trim() || "";
    const valorUnitario = document.getElementById("editValorUnitarioProd").value.trim() || "";
    if (!nombre) return alert("Nombre obligatorio.");
    try {
      await updateDoc(doc(db, "productos", p.id), { nombre, cantidad, unidad, valorUnitario });
      modalDetalle.classList.remove("show");
    } catch (err) { console.error("Actualizar producto", err); alert("No se pudo actualizar"); }
  });
}

/* Factura edit modal */
function showFacturaEditModal(f){
  // Build form with selects populated from cache
  modalContenido.innerHTML = `
    <h3>Editar factura</h3>
    <form id="editFacturaForm">
      <div class="row">
        <input id="editNumeroFact" value="${f.numero || ''}" placeholder="Número factura" />
        <input id="editFechaFact" type="date" value="${f.fecha || ''}" />
      </div>
      <div class="row">
        <select id="editProveedorFact"></select>
        <select id="editProductoFact"></select>
      </div>
      <div class="row">
        <input id="editMontoFact" value="${f.monto || ''}" placeholder="Monto" />
        <select id="editMonedaFact"><option value="S/ ">S/</option><option value="$ ">$</option></select>
        <select id="editTipoFact"><option value="FACTURA">FACTURA</option><option value="BOLETA">BOLETA</option></select>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
        <button type="button" class="btn" id="saveFacturaBtn">Guardar</button>
        <button type="button" class="btn btn-ghost" id="cancelFacturaBtn">Cancelar</button>
      </div>
    </form>
  `;
  // populate providers/products into selects
  const provSel = document.getElementById("editProveedorFact");
  const prodSel = document.getElementById("editProductoFact");
  clearChildren(provSel); clearChildren(prodSel);
  proveedores.forEach(p => {
    const o = document.createElement("option"); o.value = p.id; o.textContent = p.nombre;
    if (p.id === f.proveedorId) o.selected = true;
    provSel.appendChild(o);
  });
  productos.forEach(p => {
    const o = document.createElement("option"); o.value = p.id; o.textContent = p.nombre;
    if (p.id === f.productoId) o.selected = true;
    prodSel.appendChild(o);
  });
  // set moneda and tipo
  document.getElementById("editMonedaFact").value = f.moneda || "S/ ";
  document.getElementById("editTipoFact").value = f.tipo || "FACTURA";

  modalDetalle.classList.add("show");
  animateModalIn(modalDetalle);

  document.getElementById("cancelFacturaBtn").addEventListener("click", ()=> modalDetalle.classList.remove("show"));
  document.getElementById("saveFacturaBtn").addEventListener("click", async ()=>{
    const numero = document.getElementById("editNumeroFact").value.trim() || "";
    const fecha = document.getElementById("editFechaFact").value || "";
    const proveedorId = document.getElementById("editProveedorFact").value;
    const productoId = document.getElementById("editProductoFact").value;
    const monto = parseFloat(document.getElementById("editMontoFact").value || "0") || 0;
    const moneda = document.getElementById("editMonedaFact").value || "";
    const tipo = document.getElementById("editTipoFact").value || "";

    if (!proveedorId || !productoId) return alert("Seleccione proveedor y producto.");
    const proveedorName = proveedores.find(p=>p.id===proveedorId)?.nombre || "";
    const productoName = productos.find(p=>p.id===productoId)?.nombre || "";

    try {
      await updateDoc(doc(db, "facturas", f.id), {
        numero, fecha, proveedorId, proveedorName, productoId, productoName, monto, moneda, tipo
      });
      modalDetalle.classList.remove("show");
    } catch (err) { console.error("Actualizar factura", err); alert("No se pudo actualizar factura"); }
  });
}

/* =================== SEARCH / RESULT MODAL (animation + cards) =================== */
function animateModalIn(modalEl){
  // simple fade/slide on the first .modal-card child
  const card = modalEl.querySelector(".modal-card");
  if (!card) return;
  card.style.transition = "transform .28s cubic-bezier(.2,.9,.3,1), opacity .28s ease";
  card.style.transform = "translateY(12px)";
  card.style.opacity = "0";
  // force layout
  void card.offsetWidth;
  requestAnimationFrame(()=> {
    card.style.transform = "translateY(0)";
    card.style.opacity = "1";
  });
}

function animateModalOut(modalEl){
  const card = modalEl.querySelector(".modal-card");
  if (!card) return;
  card.style.transform = "translateY(10px)";
  card.style.opacity = "0";
  setTimeout(()=> {
    modalEl.classList.remove("show");
  }, 220);
}

async function realizarBusqueda(term){
  const q = (term || "").trim().toLowerCase();
  if (!q) { alert("Escribe un término para buscar (producto)."); return; }

  // find product ids whose name includes q
  const matchedProductIds = productos.filter(p => (p.nombre||"").toLowerCase().includes(q)).map(p => p.id);

  // find facturas where productoName or productoId match
  const resultados = facturas.filter(f => {
    const prodName = (f.productoName || "").toLowerCase();
    return (prodName.includes(q) || matchedProductIds.includes(f.productoId));
  });

  // render results
  clearChildren(resultadoBusqueda);
  resultTitle.textContent = `Resultados para "${term}"`;
  resultSub.textContent = `${resultados.length} ${resultados.length===1 ? "factura" : "facturas"} encontradas`;

  if (resultados.length === 0) {
    const empty = document.createElement("div"); empty.className = "muted"; empty.textContent = "No se encontraron facturas para ese producto.";
    resultadoBusqueda.appendChild(empty);
  } else {
    const container = document.createElement("div"); container.className = "results-grid";
    resultados.forEach(f => {
      const prov = proveedores.find(p => p.id === f.proveedorId) || null;
      const prod = productos.find(p => p.id === f.productoId) || null;

      const card = document.createElement("div");
      card.className = "fact-card";
      card.innerHTML = `
        <h4>${f.productoName || prod?.nombre || "-"}</h4>
        <div style="font-size:13px;color:var(--muted)">${prod ? (prod.unidad ? `${prod.unidad}` : '') : ''}</div>
        <div style="margin-top:8px;font-size:14px"><strong>${f.moneda || ''}${formatMoney(f.monto)}</strong></div>
        <div class="fact-meta"><div>${f.fecha || "-"}</div><div>${prov ? prov.nombre : (f.proveedorName || "-")}</div></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px">
          <button class="btn small btn-ghost ver-detalle-card" data-id="${f.id}">Ver Detalles</button>
        </div>
      `;
      // clicking card (except clicks on internal buttons/links) opens detail
      card.addEventListener("click", (ev) => {
        if (ev.target && (ev.target.classList.contains("ver-detalle-card") || ev.target.closest(".ver-detalle-card"))) return;
        showFacturaDetailModal(f);
      });
      // ver detalle button handler via delegation below (dataset id)
      container.appendChild(card);
    });
    resultadoBusqueda.appendChild(container);
  }

  modalBuscador.classList.add("show");
  animateModalIn(modalBuscador);
}

/* Wire search triggers */
buscadorInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    realizarBusqueda(buscadorInput.value);
  }
});
btnBuscar?.addEventListener("click", () => realizarBusqueda(buscadorInput.value));
btnRefresh?.addEventListener("click", () => {
  // clear search and close modal
  buscadorInput.value = "";
  if (modalBuscador) modalBuscador.classList.remove("show");
});

/* close modal buttons */
document.getElementById("cerrarModalBuscador")?.addEventListener("click", ()=> {
  if (modalBuscador) animateModalOut(modalBuscador);
});

/* Modal click outside to close */
modalBuscador?.addEventListener("click", (ev) => { if (ev.target === modalBuscador) animateModalOut(modalBuscador); });
modalDetalle?.addEventListener("click", (ev) => { if (ev.target === modalDetalle) modalDetalle.classList.remove("show"); });
modalFactura?.addEventListener("click", (ev) => { if (ev.target === modalFactura) modalFactura.classList.remove("show"); });

/* Delegated handler for ver-detalle-card buttons inside resultadoBusqueda */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".ver-detalle-card");
  if (btn && btn.dataset && btn.dataset.id) {
    const id = btn.dataset.id;
    const f = facturas.find(x => x.id === id);
    if (f) showFacturaDetailModal(f);
  }
});

/* Show factura detail modal (filled card) */
function showFacturaDetailModal(f){
  const prov = proveedores.find(p => p.id === f.proveedorId) || null;
  const prod = productos.find(p => p.id === f.productoId) || null;

  facturaTitle.textContent = `Factura ${f.numero || '-'}`;
  modalFacturaContenido.innerHTML = `
    <div class="factura-detail">
      <div>
        <div class="detail-block">
          <div class="label">Proveedor</div>
          <div class="value">${prov ? prov.nombre : (f.proveedorName || '-')}</div>
          <div style="margin-top:6px"><span class="muted">RUC:</span> ${prov ? prov.ruc : '-'}</div>
          <div style="margin-top:6px"><span class="muted">Dirección:</span> ${prov ? prov.direccion || '-' : '-'}</div>
        </div>

        <div style="height:12px"></div>

        <div class="detail-block">
          <div class="label">Producto</div>
          <div class="value">${prod ? prod.nombre : (f.productoName || '-')}</div>
          <div style="margin-top:6px"><span class="muted">Unidad / Cantidad:</span> ${prod ? (prod.unidad || '-') : '-' } / ${f.cantidad || '-'}</div>
        </div>
      </div>

      <aside>
        <div class="detail-block">
          <div class="label">Monto</div>
          <div class="value">${f.moneda || ''}${formatMoney(f.monto)}</div>
        </div>

        <div style="height:12px"></div>

        <div class="detail-block">
          <div class="label">Número</div>
          <div class="value">${f.numero || '-'}</div>
        </div>

        <div style="height:12px"></div>

        <div class="detail-block">
          <div class="label">Fecha</div>
          <div class="value">${f.fecha || '-'}</div>
        </div>
      </aside>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px">
      <button id="closeFacturaDetailBtn" class="btn small">Cerrar</button>
      <button id="editFacturaFromDetailBtn" class="btn small btn-ghost">Editar</button>
    </div>
  `;

  modalFactura.classList.add("show");
  animateModalIn(modalFactura);

  // wire close and edit
  document.getElementById("closeFacturaDetailBtn")?.addEventListener("click", ()=> modalFactura.classList.remove("show"));
  document.getElementById("editFacturaFromDetailBtn")?.addEventListener("click", ()=> {
    modalFactura.classList.remove("show");
    showFacturaEditModal(f);
  });
}

/* =================== Misc. UX: close big modal 'modalDetalle' button =================== */
cerrarModal?.addEventListener("click", () => modalDetalle.classList.remove("show"));

/* =================== Keyboard: ESC to close modals =================== */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    modalBuscador?.classList.remove("show");
    modalDetalle?.classList.remove("show");
    modalFactura?.classList.remove("show");
  }
});

/* =================== Init log =================== */
console.log("dashboard.js inicializado — listeners en tiempo real activos.");

