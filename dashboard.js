// dashboard.js
// Módulo principal para Dashboard · Discovery Pets
// Requiere: ./firebase.js que exporte `db` y `auth`
// Firebase v12 (modular)
import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

/* ===========================
   NAVEGACIÓN & UI BASICA
   =========================== */
const botones = document.querySelectorAll(".menu-btn");
const secciones = document.querySelectorAll(".seccion");

botones.forEach((btn) => {
  btn.addEventListener("click", () => {
    botones.forEach((b) => b.classList.remove("activo"));
    btn.classList.add("activo");

    secciones.forEach((sec) => {
      sec.classList.remove("activa");
      if (sec.id === btn.dataset.target) sec.classList.add("activa");
    });
  });
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn("Error al cerrar sesión:", err);
  }
  window.location.href = "index.html";
});

/* ===========================
   REFERENCIAS DOM
   =========================== */
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");
const proveedorSelect = document.getElementById("proveedorFactura");
const productoSelect = document.getElementById("productoFactura");
const buscador = document.getElementById("buscadorFactura");

// modales y helpers
const modalDetalle = document.getElementById("modalDetalle");
const modalContenido = document.getElementById("modalContenido");
const modalResultados = document.getElementById("modalResultados");
const resultsContainer = document.getElementById("resultsContainer");
const resultTitle = document.getElementById("resultTitle");
const resultSub = document.getElementById("resultSub");
const modalFactura = document.getElementById("modalFactura");
const modalFacturaContenido = document.getElementById("modalFacturaContenido");
const modalEditDesc = document.getElementById("modalEditDesc");
const editDescTextarea = document.getElementById("editDescTextarea");
const saveDescBtn = document.getElementById("saveDescBtn");

/* ===========================
   CACHES LOCALES
   =========================== */
let proveedoresCache = [];
let productosCache = [];
let facturasCache = [];

/* ===========================
   PROVEEDORES: CRUD + UI
   =========================== */
proveedorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();
  const telefono = document.getElementById("telefonoProveedor").value.trim();

  if (!nombre) return alert("El nombre es requerido");

  try {
    await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion, telefono });
    proveedorForm.reset();
  } catch (err) {
    console.error("Error agregando proveedor:", err);
    alert("Error al agregar proveedor: " + (err.message || err));
  }
});

onSnapshot(collection(db, "proveedores"), (snap) => {
  tablaProveedores.innerHTML = "";
  proveedorSelect.innerHTML = '<option value="">Seleccione proveedor</option>';
  proveedoresCache = [];

  snap.forEach((docu) => {
    const p = docu.data();
    proveedoresCache.push({ id: docu.id, ...p });

    const tr = document.createElement("tr");
    tr.dataset.id = docu.id;
    tr.dataset.tipo = "proveedores";

    tr.innerHTML = `
      <td><div class="editable" contenteditable="false" data-field="ruc">${p.ruc || ""}</div></td>
      <td><div class="editable" contenteditable="false" data-field="nombre">${p.nombre || ""}</div></td>
      <td><div class="editable" contenteditable="false" data-field="direccion">${p.direccion || ""}</div></td>
      <td><div class="editable" contenteditable="false" data-field="telefono">${p.telefono || ""}</div></td>
      <td style="text-align:right">
        <button class="btn secondary btn-edit-row" data-id="${docu.id}" data-tipo="proveedores">✏️</button>
        <button class="btn secondary btn-delete" data-id="${docu.id}" data-tipo="proveedores">Eliminar</button>
      </td>
    `;
    tablaProveedores.appendChild(tr);

    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = p.nombre;
    proveedorSelect.appendChild(option);
  });
});

/* ===========================
   PRODUCTOS: CRUD + UI
   =========================== */
productoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const unidad = document.getElementById("unidadProducto").value.trim();
  const materialP = document.getElementById("materialP").value.trim();
  const maquinaria = document.getElementById("maquinaria").value.trim();
  const productoOf = document.getElementById("productoOf").value.trim();
  const insumosExtra = document.getElementById("insumosExtra").value.trim();
  const descripcion = document.getElementById("descripcionProducto").value.trim();

  if (!nombre) return alert("El nombre del producto es requerido");

  try {
    await addDoc(collection(db, "productos"), {
      nombre,
      unidad,
      materialP,
      maquinaria,
      productoOf,
      insumosExtra,
      descripcion
    });
    productoForm.reset();
  } catch (err) {
    console.error("Error agregando producto:", err);
    alert("Error al agregar producto: " + (err.message || err));
  }
});

onSnapshot(collection(db, "productos"), (snap) => {
  tablaProductos.innerHTML = "";
  productoSelect.innerHTML = '<option value="">Seleccione producto</option>';
  productosCache = [];

  snap.forEach((docu) => {
    const p = docu.data();
    productosCache.push({ id: docu.id, ...p });

    const descShort = (p.descripcion || "").length > 120 ? (p.descripcion || "").slice(0, 120) + "…" : (p.descripcion || "");

    const tr = document.createElement("tr");
    tr.dataset.id = docu.id;
    tr.dataset.tipo = "productos";

    tr.innerHTML = `
      <td><div class="editable" contenteditable="false" data-field="nombre">${p.nombre || ""}</div></td>
      <td><div class="editable" contenteditable="false" data-field="unidad">${p.unidad || ""}</div></td>
      <td><div class="editable" contenteditable="false" data-field="materialP">${p.materialP || ""}</div></td>
      <td><div class="editable" contenteditable="false" data-field="maquinaria">${p.maquinaria || ""}</div></td>
      <td><div class="editable" contenteditable="false" data-field="productoOf">${p.productoOf || ""}</div></td>
      <td><div class="editable" contenteditable="false" data-field="insumosExtra">${p.insumosExtra || ""}</div></td>
      <td>
         <div class="truncate" data-full="${encodeURIComponent(p.descripcion || "")}">${descShort}</div>
         <div style="margin-top:6px">
           <button class="btn secondary btn-edit-desc" data-id="${docu.id}" data-tipo="productos">Editar desc</button>
         </div>
      </td>
      <td style="text-align:right">
        <button class="btn secondary btn-edit-row" data-id="${docu.id}" data-tipo="productos">✏️</button>
        <button class="btn secondary btn-delete" data-id="${docu.id}" data-tipo="productos">Eliminar</button>
      </td>
    `;
    tablaProductos.appendChild(tr);

    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = p.nombre;
    productoSelect.appendChild(option);
  });
});

/* ===========================
   FACTURAS: CRUD + UI (con edición en fila y guardar)
   =========================== */
facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const codigo = document.getElementById("codigoFactura").value.trim();
  const numero = document.getElementById("numeroFactura").value.trim();
  const proveedor = document.getElementById("proveedorFactura").value;
  const producto = document.getElementById("productoFactura").value;
  const productoDescripcion = document.getElementById("productoDescripcionFactura").value.trim();
  const monto = document.getElementById("montoFactura").value.trim();
  const moneda = document.getElementById("monedaFactura").value;
  const tipo = document.getElementById("tipoFactura").value;
  const fecha = document.getElementById("fechaEmisionFactura").value || new Date().toISOString().slice(0, 10);

  if (!codigo) return alert("El campo Código es requerido");
  if (!producto) return alert("Debe seleccionar un producto");
  if (!proveedor) return alert("Debe seleccionar un proveedor");

  try {
    await addDoc(collection(db, "facturas"), {
      codigo,
      numero,
      proveedor,
      producto,
      productoDescripcion,
      monto,
      moneda,
      tipo,
      fecha
    });
    facturaForm.reset();
  } catch (err) {
    console.error("Error agregando factura:", err);
    alert("Error al agregar factura: " + (err.message || err));
  }
});

onSnapshot(collection(db, "facturas"), (snap) => {
  facturasCache = [];
  snap.forEach((docu) => facturasCache.push({ id: docu.id, ...docu.data() }));
  renderFacturasTable(facturasCache);
});

function renderFacturasTable(facturas) {
  tablaFacturas.innerHTML = "";
  facturas.forEach((f) => {
    const tr = document.createElement("tr");
    tr.dataset.id = f.id;
    tr.dataset.tipo = "facturas";

    // muestra corta de descripción
    const descShort = (f.productoDescripcion || "").length > 80 ? (f.productoDescripcion || "").slice(0, 80) + "…" : (f.productoDescripcion || "");

    tr.innerHTML = `
      <td><div class="cell-val" data-field="codigo">${escapeHtml(f.codigo || "")}</div></td>
      <td><div class="cell-val" data-field="numero">${escapeHtml(f.numero || "")}</div></td>
      <td><div class="cell-val" data-field="proveedor">${escapeHtml(f.proveedor || "")}</div></td>
      <td>
        <div class="cell-val" data-field="producto">${escapeHtml(f.producto || "")}</div>
        <div class="truncate" title="Descripción completa">${escapeHtml(descShort)}</div>
      </td>
      <td><div class="cell-val" data-field="monto">${escapeHtml(f.monto || "")}</div></td>
      <td><div class="cell-val" data-field="moneda">${escapeHtml(f.moneda || "")}</div></td>
      <td><div class="cell-val" data-field="tipo">${escapeHtml(f.tipo || "")}</div></td>
      <td><div class="cell-val" data-field="fecha">${escapeHtml(f.fecha || "")}</div></td>
      <td style="text-align:right">
        <button class="btn secondary btn-edit-row" data-id="${f.id}" data-tipo="facturas">✏️</button>
        <button class="btn secondary btn-edit-desc" data-id="${f.id}" data-tipo="facturas">Editar desc</button>
        <button class="btn secondary btn-delete" data-id="${f.id}" data-tipo="facturas">Eliminar</button>
      </td>
    `;
    tablaFacturas.appendChild(tr);
  });
}

/* ===========================
   BUSCADOR (Enter -> filtrar y construir array para modal resultados)
   =========================== */
buscador.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const term = buscador.value.trim().toLowerCase();
    const filtradas = facturasCache.filter((f) =>
      (f.producto && f.producto.toLowerCase().includes(term)) ||
      (f.productoDescripcion && f.productoDescripcion.toLowerCase().includes(term))
    );
    construirModalResultados(term, filtradas);
  }
});

buscador.addEventListener("input", () => {
  if (buscador.value.trim() === "") renderFacturasTable(facturasCache);
});

document.getElementById("btnRefresh").addEventListener("click", () => {
  buscador.value = "";
  buscador.dispatchEvent(new Event("input", { bubbles: true }));
});

/* Construye y muestra modalResultados con tarjetas */
function construirModalResultados(term, facturas) {
  resultsContainer.innerHTML = "";
  if (!facturas || facturas.length === 0) {
    resultsContainer.innerHTML = '<div class="muted">No se encontraron facturas relacionadas.</div>';
  } else {
    facturas.forEach((f) => {
      const card = document.createElement("div");
      card.className = "fact-card";
      card.tabIndex = 0;
      card.innerHTML = `
        <h4>${escapeHtml(f.codigo || ("Factura " + (f.numero || "—")))}</h4>
        <div style="font-size:14px;color:#034c57"><strong>${escapeHtml(f.producto || "-")}</strong></div>
        <div style="margin-top:8px">
          <div class="muted">Proveedor</div>
          <div><span class="ver-proveedor" data-nombre="${escapeHtmlAttr(f.proveedor || "")}" style="cursor:pointer;color:var(--accent)">${escapeHtml(f.proveedor || "")}</span></div>
        </div>
        <div class="meta"><div>${escapeHtml(f.fecha || "")}</div><div>${escapeHtml(f.moneda || "")}${escapeHtml(f.monto || "")}</div></div>
      `;

      card.addEventListener("click", (ev) => {
        const path = ev.composedPath ? ev.composedPath() : (ev.path || []);
        for (const el of path) {
          if (!el || el === window || el === document) break;
          if (el.classList && (el.classList.contains("ver-proveedor") || el.classList.contains("ver-producto"))) {
            return; // dejar que handler global lo trate (confirmar y abrir modalDetalle)
          }
        }
        abrirModalFactura(f);
      });

      resultsContainer.appendChild(card);
    });
  }

  resultTitle.textContent = `🔍 Resultados relacionados con "${term}"`;
  resultSub.textContent = `${(facturas || []).length} factura(s) encontradas`;
  modalResultados.classList.add("show");
  modalResultados.style.display = "flex";
}

/* ===========================
   GLOBAL CLICK HANDLERS (delegado)
   =========================== */
document.addEventListener("click", async (e) => {
  const target = e.target;

  // Eliminar
  if (target.classList.contains("btn-delete")) {
    const id = target.dataset.id;
    const tipo = target.dataset.tipo;
    if (!id || !tipo) return;
    if (confirm("¿Desea eliminar este registro?")) {
      try {
        await deleteDoc(doc(db, tipo, id));
      } catch (err) {
        console.error("Error eliminando:", err);
        alert("Error al eliminar: " + (err.message || err));
      }
    }
    return;
  }

  // Editar descripción (abre modal)
  if (target.classList.contains("btn-edit-desc")) {
    const id = target.dataset.id;
    const tipo = target.dataset.tipo;
    if (!id || !tipo) return;

    try {
      const snap = await getDoc(doc(db, tipo, id));
      const data = snap.exists() ? snap.data() : {};
      const contenido = tipo === "productos" ? (data.descripcion || "") : (data.productoDescripcion || "");
      openEditDescModal({ id, tipo, contenido });
    } catch (err) {
      console.error("Error obteniendo documento:", err);
      alert("Error al cargar descripción: " + (err.message || err));
    }
    return;
  }

  // Editar fila (mostrar campos editables + botones guardar/cancelar)
  if (target.classList.contains("btn-edit-row")) {
    const id = target.dataset.id;
    const tipo = target.dataset.tipo;
    const tr = target.closest("tr");
    if (!tr) return;
    enterRowEditMode(tr);
    return;
  }

  // Ver proveedor / producto (desde tarjetas o elementos con esas clases)
  if (target.classList && target.classList.contains("ver-proveedor")) {
    const nombre = target.dataset.nombre;
    if (confirm(`¿Deseas ver los datos de ${nombre}?`)) {
      mostrarModalDatos("proveedores", "nombre", nombre);
    }
    return;
  }
  if (target.classList && target.classList.contains("ver-producto")) {
    const nombre = target.dataset.nombre;
    if (confirm(`¿Deseas ver los datos de ${nombre}?`)) {
      mostrarModalDatos("productos", "nombre", nombre);
    }
    return;
  }

  // Guardar cambios en fila (botón que creamos dinamicamente)
  if (target.classList && target.classList.contains("btn-save-row")) {
    const tr = target.closest("tr");
    if (!tr) return;
    await saveRowChanges(tr);
    return;
  }

  // Cancelar edición en fila
  if (target.classList && target.classList.contains("btn-cancel-row")) {
    const tr = target.closest("tr");
    if (!tr) return;
    cancelRowEditMode(tr);
    return;
  }

  // Cerrar modales cuando clic en backdrop (atributo en HTML hace gran parte)
});

/* ===========================
   FILA EDIT MODE: funciones
   =========================== */
function enterRowEditMode(tr) {
  // si ya en modo edición, no hacer nada
  if (tr.dataset.editing === "true") return;
  tr.dataset.editing = "true";

  // convertir celdas .cell-val en inputs/selects/textarea según campo
  const id = tr.dataset.id;
  const tipo = tr.dataset.tipo;
  const fields = Array.from(tr.querySelectorAll(".cell-val"));
  // preservamos valores originales para poder cancelar
  tr._original = {};
  fields.forEach((div) => {
    const field = div.dataset.field;
    tr._original[field] = div.textContent || "";

    let input;
    if (field === "producto") {
      // producto como textarea grande
      input = document.createElement("textarea");
      input.rows = 2;
      input.style.width = "100%";
      input.value = div.textContent || "";
    } else if (field === "tipo") {
      input = document.createElement("select");
      ["Compra", "Gasto", "Servicio"].forEach((v) => {
        const o = document.createElement("option");
        o.value = v;
        o.textContent = v;
        if ((div.textContent || "") === v) o.selected = true;
        input.appendChild(o);
      });
    } else if (field === "moneda") {
      input = document.createElement("select");
      [["S/ ","S/"], ["$ ","$"]].forEach(([val, txt]) => {
        const o = document.createElement("option");
        o.value = val;
        o.textContent = txt;
        if ((div.textContent || "") === val) o.selected = true;
        input.appendChild(o);
      });
    } else if (field === "fecha") {
      input = document.createElement("input");
      input.type = "date";
      input.value = div.textContent || "";
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.value = div.textContent || "";
    }
    input.classList.add("inline-editor");
    // reemplazar div por input
    div.style.display = "none";
    div.parentElement.insertBefore(input, div.nextSibling);
  });

  // agregar botones Guardar / Cancelar al final de la fila (si no existen)
  const lastTd = tr.querySelector("td:last-child");
  // ocultar botones existentes (edit/delete/edit-desc)
  const existingControls = lastTd.querySelectorAll(".btn-edit-row, .btn-delete, .btn-edit-desc");
  existingControls.forEach((b) => (b.style.display = "none"));

  // crear container de acciones de edición si no existe
  let actionContainer = tr.querySelector(".edit-actions");
  if (!actionContainer) {
    actionContainer = document.createElement("div");
    actionContainer.className = "edit-actions";
    actionContainer.style.display = "flex";
    actionContainer.style.gap = "6px";
    actionContainer.style.justifyContent = "flex-end";
    // crear botones
    const saveBtn = document.createElement("button");
    saveBtn.className = "btn btn-save-row";
    saveBtn.textContent = "Guardar cambios";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn secondary btn-cancel-row";
    cancelBtn.textContent = "Cancelar";

    actionContainer.appendChild(cancelBtn);
    actionContainer.appendChild(saveBtn);
    lastTd.appendChild(actionContainer);
  } else {
    actionContainer.style.display = "flex";
  }
}

async function saveRowChanges(tr) {
  const id = tr.dataset.id;
  const tipo = tr.dataset.tipo;
  if (!id || !tipo) return;

  // recoger valores desde inputs/selects
  const editors = tr.querySelectorAll(".inline-editor");
  const updates = {};
  editors.forEach((input) => {
    const prev = input.previousElementSibling; // cell-val div
    if (!prev || !prev.dataset.field) return;
    const key = prev.dataset.field;
    let val = "";
    if (input.tagName === "INPUT" || input.tagName === "TEXTAREA") {
      val = input.value.trim();
    } else if (input.tagName === "SELECT") {
      val = input.value;
    } else {
      val = (input.value || "").trim();
    }
    updates[key] = val;
  });

  try {
    await updateDoc(doc(db, tipo, id), updates);
    // salir de modo edición y refrescar fila (onSnapshot lo hará)
    tr.dataset.editing = "false";
    // remove editor inputs and show original cell-val divs
    cancelRowEditMode(tr, true);
  } catch (err) {
    console.error("Error guardando cambios:", err);
    alert("Error al guardar cambios: " + (err.message || err));
  }
}

function cancelRowEditMode(tr, keepUpdated = false) {
  // si keepUpdated = true, asumimos que onSnapshot actualizará la fila
  const inputs = tr.querySelectorAll(".inline-editor");
  inputs.forEach((input) => input.remove());

  const cellVals = tr.querySelectorAll(".cell-val");
  cellVals.forEach((div) => {
    div.style.display = "";
    // si no keepUpdated, restaurar original
    if (!keepUpdated && tr._original && tr._original[div.dataset.field] !== undefined) {
      div.textContent = tr._original[div.dataset.field];
    }
  });

  // ocultar acciones de edición y mostrar controls originales
  const actionContainer = tr.querySelector(".edit-actions");
  if (actionContainer) actionContainer.style.display = "none";

  const lastTd = tr.querySelector("td:last-child");
  const existingControls = lastTd.querySelectorAll(".btn-edit-row, .btn-delete, .btn-edit-desc");
  existingControls.forEach((b) => (b.style.display = ""));

  tr.dataset.editing = "false";
}

/* ===========================
   MODAL DESCRIPCIONES (EDIT LONG TEXT)
   =========================== */
let _editDescContext = null;
function openEditDescModal(ctx) {
  _editDescContext = ctx; // {id, tipo, contenido}
  document.getElementById("editDescTitle").textContent = ctx.tipo === "productos" ? "Editar descripción del producto" : "Editar descripción en factura";
  editDescTextarea.value = ctx.contenido || "";
  modalEditDesc.classList.add("show");
  modalEditDesc.style.display = "flex";
}
window.closeEditDesc = function () {
  modalEditDesc.classList.remove("show");
  modalEditDesc.style.display = "none";
  editDescTextarea.value = "";
  _editDescContext = null;
};

saveDescBtn.addEventListener("click", async () => {
  if (!_editDescContext) return;
  const { id, tipo } = _editDescContext;
  const newText = editDescTextarea.value.trim();
  try {
    if (tipo === "productos") {
      await updateDoc(doc(db, "productos", id), { descripcion: newText });
    } else if (tipo === "facturas") {
      await updateDoc(doc(db, "facturas", id), { productoDescripcion: newText });
    }
    closeEditDesc();
  } catch (err) {
    console.error("Error guardando descripción:", err);
    alert("Error al guardar descripción: " + (err.message || err));
  }
});

/* ===========================
   MOSTRAR DATOS (PROVEEDOR / PRODUCTO) - modalDetalle
   =========================== */
async function mostrarModalDatos(coleccion, campo, valor) {
  modalContenido.innerHTML = "<p>Cargando datos...</p>";
  try {
    // consulta simple (traer todos y buscar igualdad). Para grandes volúmenes, optimizar.
    const snap = await getDocs(collection(db, coleccion));
    let found = null;
    snap.forEach((docu) => {
      const data = docu.data();
      if ((data[campo] || "").toString() === valor.toString()) {
        found = { id: docu.id, ...data };
      }
    });

    if (!found) {
      modalContenido.innerHTML = `<p>No se encontró información para "${valor}".</p>`;
    } else {
      if (coleccion === "proveedores") {
        modalContenido.innerHTML = `
          <h3>Proveedor: ${escapeHtml(found.nombre || "")}</h3>
          <p><strong>RUC:</strong> ${escapeHtml(found.ruc || "-")}</p>
          <p><strong>Dirección:</strong> ${escapeHtml(found.direccion || "-")}</p>
          <p><strong>Teléfono:</strong> ${escapeHtml(found.telefono || "-")}</p>
        `;
      } else {
        modalContenido.innerHTML = `
          <h3>Producto: ${escapeHtml(found.nombre || "")}</h3>
          <p><strong>Unidad:</strong> ${escapeHtml(found.unidad || "-")}</p>
          <p><strong>Material P:</strong> ${escapeHtml(found.materialP || "-")}</p>
          <p><strong>Maquinaria:</strong> ${escapeHtml(found.maquinaria || "-")}</p>
          <p><strong>Producto Of:</strong> ${escapeHtml(found.productoOf || "-")}</p>
          <p><strong>Insumos extra:</strong> ${escapeHtml(found.insumosExtra || "-")}</p>
          <p style="margin-top:8px"><strong>Descripción:</strong><div style="margin-top:6px">${(found.descripcion || "").replace(/\n/g, "<br/>")}</div></p>
        `;
      }
    }
  } catch (err) {
    console.error("Error al obtener datos:", err);
    modalContenido.innerHTML = "<p>Error al cargar datos.</p>";
  }

  // asegurar que modalDetalle quede por delante
  modalDetalle.style.zIndex = 9999;
  modalDetalle.classList.add("show");
  modalDetalle.style.display = "flex";
}

/* Cerrar modal detalle */
document.getElementById("cerrarModal").addEventListener("click", () => {
  modalDetalle.classList.remove("show");
  modalDetalle.style.display = "none";
});

/* ===========================
   ABRIR FACTURA (detalle) desde tarjeta o click
   =========================== */
function abrirModalFactura(fData) {
  modalFacturaContenido.innerHTML = ""; // limpiar
  document.getElementById("facturaTitle").textContent = `Factura · ${fData.codigo || "-"}`;

  modalFacturaContenido.innerHTML = `
    <div class="factura-detail">
      <div>
        <div class="detail-block"><div class="label">Código</div><div class="value">${escapeHtml(fData.codigo || "-")}</div></div>
        <div style="height:12px"></div>
        <div class="detail-block"><div class="label">N° de factura</div><div class="value">${escapeHtml(fData.numero || "-")}</div></div>
        <div style="height:12px"></div>
        <div class="detail-block"><div class="label">Proveedor</div><div class="value"><span class="ver-proveedor" data-nombre="${escapeHtmlAttr(fData.proveedor || "")}" style="cursor:pointer;color:var(--accent)">${escapeHtml(fData.proveedor || "")}</span></div></div>
        <div style="height:12px"></div>
        <div class="detail-block"><div class="label">Producto</div><div class="value"><span class="ver-producto" data-nombre="${escapeHtmlAttr(fData.producto || "")}" style="cursor:pointer;color:var(--accent)">${escapeHtml(fData.producto || "")}</span></div>
          <div style="margin-top:8px"><small class="muted">Descripción:</small><div style="margin-top:6px">${(fData.productoDescripcion || "").replace(/\n/g, "<br/>")}</div></div>
        </div>
      </div>

      <aside>
        <div class="detail-block"><div class="label">Monto</div><div class="value">${escapeHtml(fData.moneda || "")}${escapeHtml(fData.monto || "")}</div></div>
        <div style="height:12px"></div>
        <div class="detail-block"><div class="label">Tipo</div><div class="value">${escapeHtml(fData.tipo || "-")}</div></div>
        <div style="height:12px"></div>
        <div class="detail-block"><div class="label">Fecha</div><div class="value">${escapeHtml(fData.fecha || "-")}</div></div>
      </aside>
    </div>
  `;

  // asegurar que modalFactura quede por delante
  modalFactura.style.zIndex = 9998;
  modalFactura.classList.add("show");
  modalFactura.style.display = "flex";
}

/* ===========================
   UTILIDADES
   =========================== */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function escapeHtmlAttr(str) {
  if (!str) return "";
  return String(str)
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ===========================
   TECLAS GLOBALES Y CIERRES
   =========================== */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    // cerrar modales
    if (modalResultados.classList.contains("show")) {
      modalResultados.classList.remove("show");
      modalResultados.style.display = "none";
    }
    if (modalFactura.classList.contains("show")) {
      modalFactura.classList.remove("show");
      modalFactura.style.display = "none";
    }
    if (modalEditDesc.classList.contains("show")) {
      closeEditDesc();
    }
    if (modalDetalle.classList.contains("show")) {
      modalDetalle.classList.remove("show");
      modalDetalle.style.display = "none";
    }
  }
});

/* ===========================
   FIN del módulo
   =========================== */






