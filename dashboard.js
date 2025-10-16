// dashboard.js
import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

/* --------------------- Utiles DOM --------------------- */
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

/* --------------------- Estado en memoria --------------------- */
let proveedoresGuardados = [];
let productosGuardados = [];
let facturasGuardadas = [];

/* --------------------- Navegación y logout (si aplica) --------------------- */
document.querySelectorAll(".menu-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".menu-btn").forEach(b=>b.classList.remove("activo"));
    btn.classList.add("activo");
    document.querySelectorAll(".seccion").forEach(sec=>sec.classList.remove("activa"));
    const target = document.getElementById(btn.dataset.target);
    if (target) target.classList.add("activa");
  });
});
document.getElementById("logoutBtn")?.addEventListener("click", async ()=>{
  try { await signOut(auth); window.location.href = "index.html"; } catch(e){ console.error(e); }
});

/* --------------------- PROVEEDORES (real-time) --------------------- */
proveedorForm.addEventListener("submit", async e=>{
  e.preventDefault();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const telefono = document.getElementById("telefonoProveedor").value.trim() || "";
  const direccion = document.getElementById("direccionProveedor").value.trim() || "";

  if (!nombre || !ruc) return alert("Nombre y RUC son obligatorios.");
  try {
    await addDoc(collection(db, "proveedores"), { nombre, ruc, telefono, direccion });
    proveedorForm.reset();
  } catch (err) { console.error("Error guardando proveedor:", err); alert("Error al guardar proveedor."); }
});

// escucha en tiempo real proveedores
onSnapshot(collection(db, "proveedores"), snapshot=>{
  proveedoresGuardados = [];
  tablaProveedores.innerHTML = "";
  proveedorSelect.innerHTML = `<option value="">Seleccionar proveedor</option>`;

  snapshot.forEach(docu=>{
    const p = docu.data();
    proveedoresGuardados.push({ id: docu.id, ...p });

    // fila tabla
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.ruc}</td>
      <td>${p.telefono||"-"}</td>
      <td>${p.direccion||"-"}</td>
      <td>
        <button class="btn btn-sm btn-danger btn-delete" data-id="${docu.id}" data-tipo="proveedores">🗑️</button>
      </td>`;
    tablaProveedores.appendChild(tr);

    // option select factura (valor = nombre para mantener compatibilidad)
    const opt = document.createElement("option");
    opt.value = p.nombre;
    opt.textContent = p.nombre;
    proveedorSelect.appendChild(opt);
  });
});

/* --------------------- PRODUCTOS (real-time) --------------------- */
productoForm.addEventListener("submit", async e=>{
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const unidad = document.getElementById("unidadProducto")?.value.trim() || "";
  const maquinaria = document.getElementById("maquinaria")?.value.trim() || "";
  // en tu HTML el id es "productoOf"
  const productoOf = document.getElementById("productoOf")?.value.trim() || "";
  const insumosExtra = document.getElementById("insumosExtra")?.value.trim() || "";
  const descripcion = document.getElementById("descripcionProducto")?.value.trim() || "";

  if (!nombre) return alert("Nombre del producto es obligatorio.");
  try {
    await addDoc(collection(db, "productos"), { nombre, unidad, maquinaria, productoOf, insumosExtra, descripcion });
    productoForm.reset();
  } catch(err){ console.error("Error guardar producto:", err); alert("Error al guardar producto."); }
});

onSnapshot(collection(db, "productos"), snapshot=>{
  productosGuardados = [];
  tablaProductos.innerHTML = "";
  productoSelect.innerHTML = `<option value="">Seleccionar producto</option>`;

  snapshot.forEach(docu=>{
    const p = docu.data();
    productosGuardados.push({ id: docu.id, ...p });

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.unidad||"-"}</td>
      <td>${p.maquinaria||"-"}</td>
      <td>${p.productoOf||"-"}</td>
      <td>${p.insumosExtra||"-"}</td>
      <td>${p.descripcion||"-"}</td>
      <td>
        <button class="btn btn-sm btn-danger btn-delete" data-id="${docu.id}" data-tipo="productos">🗑️</button>
      </td>`;
    tablaProductos.appendChild(tr);

    const opt = document.createElement("option");
    opt.value = p.nombre; // guardamos por nombre para compatibilidad
    opt.textContent = p.nombre;
    productoSelect.appendChild(opt);
  });
});

/* --------------------- FACTURAS (real-time) --------------------- */
facturaForm.addEventListener("submit", async e=>{
  e.preventDefault();
  const proveedor = document.getElementById("proveedorFactura").value;
  const producto = document.getElementById("productoFactura").value;
  const cantidad = document.getElementById("cantidadFactura")?.value || "";
  const fecha = document.getElementById("fechaFactura")?.value || "";

  if (!proveedor || !producto) return alert("Seleccione proveedor y producto.");
  try {
    await addDoc(collection(db, "facturas"), { proveedor, producto, cantidad, fecha, createdAt: new Date().toISOString() });
    facturaForm.reset();
  } catch(err){ console.error("Error guardar factura:", err); alert("Error al guardar factura."); }
});

onSnapshot(collection(db, "facturas"), snapshot=>{
  facturasGuardadas = [];
  tablaFacturas.innerHTML = "";

  snapshot.forEach(docu=>{
    const f = { id: docu.id, ...docu.data() };
    facturasGuardadas.push(f);

    // mostrar fila simple en tabla principal (proveedor/producto por nombre)
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="ver-proveedor" data-nombre="${f.proveedor}" style="cursor:pointer;color:#0d6efd">${f.proveedor}</td>
      <td class="ver-producto" data-nombre="${f.producto}" style="cursor:pointer;color:#0d6efd">${f.producto}</td>
      <td>${f.cantidad || "-"}</td>
      <td>${f.fecha || "-"}</td>
      <td>
        <button class="btn btn-sm btn-primary ver-detalle" data-id="${f.id}">Ver Detalle</button>
        <button class="btn btn-sm btn-danger btn-delete" data-id="${f.id}" data-tipo="facturas">🗑️</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  });
});

/* --------------------- Buscador + Modal decorado --------------------- */
// abrir modal por boton o tecla Enter
function realizarBusqueda(term){
  const q = term.trim().toLowerCase();
  if (!q) {
    alert("Escribe el nombre (o parte) del producto para buscar.");
    return;
  }
  // filtrar facturas por campo producto (insensible a mayúsculas)
  const resultados = facturasGuardadas.filter(f => (f.producto||"").toLowerCase().includes(q));
  renderModalResultados(resultados, q);
}

buscadorInput?.addEventListener("keydown", e=>{
  if (e.key === "Enter") {
    e.preventDefault();
    realizarBusqueda(buscadorInput.value);
  }
});
btnBuscar?.addEventListener("click", ()=> realizarBusqueda(buscadorInput.value));
cerrarModalBuscador?.addEventListener("click", ()=> modalBuscador.classList.remove("show"));

// renderiza resultados en el modal (cards glassmorphism)
function renderModalResultados(resultados, termino){
  resultadoBusqueda.innerHTML = ""; // limpiar
  modalBuscador.classList.add("show");

  const header = document.createElement("div");
  header.innerHTML = `<p style="margin:0 0 8px 0;color:#055160"><strong>Resultados para:</strong> "${termino}" — ${resultados.length} ${resultados.length===1?'factura':'facturas'}</p>`;
  resultadoBusqueda.appendChild(header);

  if (resultados.length === 0){
    const empty = document.createElement("div");
    empty.textContent = "No se encontraron facturas para ese producto.";
    empty.style.color = "#333";
    resultadoBusqueda.appendChild(empty);
    return;
  }

  // contenedor tarjetas
  const container = document.createElement("div");
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fit,minmax(260px,1fr))";
  container.style.gap = "12px";

  resultados.forEach(f => {
    // buscar proveedor completo en memoria
    const prov = proveedoresGuardados.find(p => p.nombre === f.proveedor) || null;
    const prod = productosGuardados.find(p => p.nombre === f.producto) || null;

    const card = document.createElement("div");
    card.style.background = "rgba(255,255,255,0.85)";
    card.style.borderRadius = "12px";
    card.style.padding = "12px";
    card.style.boxShadow = "0 8px 20px rgba(13,43,59,0.08)";
    card.style.border = "1px solid rgba(13,43,59,0.06)";

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <div>
          <div style="font-weight:700;color:#0b5560">${f.producto || "-"} </div>
          <div style="font-size:13px;color:#256d6a">${prod ? prod.descripcion || "" : ""}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:12px;color:#6b7280">ID</div>
          <div style="font-weight:700">${f.idFactura || "-"}</div>
        </div>
      </div>

      <hr style="margin:10px 0;border:none;border-top:1px dashed rgba(0,0,0,0.06)">

      <div style="font-size:13px;color:#334155">
        <div><strong>Proveedor:</strong> ${f.proveedor || "-"}</div>
        <div><strong>RUC:</strong> ${prov ? prov.ruc : "-"}</div>
        <div><strong>Cantidad / Monto:</strong> ${f.cantidad || "-"}</div>
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

/* --------------------- Modal detalle (dinámico) --------------------- */
// creamos modal secundario dinámicamente (si no existe)
let modalDetalle = document.getElementById("modalDetalleFactura");
if (!modalDetalle) {
  modalDetalle = document.createElement("div");
  modalDetalle.id = "modalDetalleFactura";
  modalDetalle.style.position = "fixed";
  modalDetalle.style.inset = "0";
  modalDetalle.style.display = "none";
  modalDetalle.style.alignItems = "center";
  modalDetalle.style.justifyContent = "center";
  modalDetalle.style.zIndex = "1100";
  modalDetalle.innerHTML = `
    <div style="position:absolute;inset:0;background:rgba(0,0,0,0.45)"></div>
    <div style="position:relative;z-index:1110;max-width:560px;width:calc(100% - 32px);background:linear-gradient(180deg,#fff,#f8feff);border-radius:12px;padding:18px;box-shadow:0 12px 30px rgba(2,6,23,0.18)">
      <button id="cerrarDetalle" style="position:absolute;right:12px;top:8px;border:none;background:transparent;font-size:20px;cursor:pointer">&times;</button>
      <div id="modalDetalleContenido"></div>
    </div>`;
  document.body.appendChild(modalDetalle);

  document.getElementById("cerrarDetalle").addEventListener("click", ()=> {
    modalDetalle.style.display = "none";
  });
}

// delegación para botones "Ver Detalles" en modal de búsqueda o tabla principal
document.addEventListener("click", (e)=>{
  const id = e.target.dataset.id;
  if (e.target.classList.contains("ver-detalle") || e.target.classList.contains("ver-detalle-card")) {
    // encontrar factura por id
    const factura = facturasGuardadas.find(x => x.id === id);
    if (!factura) return alert("Factura no encontrada (puede haberse eliminado).");

    const prov = proveedoresGuardados.find(p => p.nombre === factura.proveedor) || null;
    const prod = productosGuardados.find(p => p.nombre === factura.producto) || null;

    const html = `
      <h4 style="margin-top:0;color:#073642">Detalle de factura</h4>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <div style="flex:1;min-width:180px"><strong>ID:</strong> ${factura.idFactura || "-"}</div>
        <div style="flex:1;min-width:180px"><strong>Número:</strong> ${factura.numero || "-"}</div>
      </div>
      <hr>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <div style="flex:1">
          <h6 style="margin:0">Proveedor</h6>
          <div><strong>Nombre:</strong> ${factura.proveedor || "-"}</div>
          <div><strong>RUC:</strong> ${prov ? prov.ruc : "-"}</div>
          <div><strong>Dirección:</strong> ${prov ? prov.direccion || "-" : "-"}</div>
        </div>
        <div style="flex:1">
          <h6 style="margin:0">Producto</h6>
          <div><strong>Nombre:</strong> ${factura.producto || "-"}</div>
          <div><strong>Producto OF:</strong> ${prod ? prod.productoOf || "-" : "-"}</div>
          <div><strong>Descripción:</strong> ${prod ? prod.descripcion || "-" : "-"}</div>
        </div>
      </div>
      <hr>
      <div>
        <div><strong>Cantidad / Monto:</strong> ${factura.cantidad || factura.monto || "-"}</div>
        <div><strong>Fecha:</strong> ${factura.fecha || "-"}</div>
        <div style="margin-top:10px"><button id="cerrarDetalleBtn" class="btn btn-sm btn-primary">Cerrar</button></div>
      </div>
    `;
    document.getElementById("modalDetalleContenido").innerHTML = html;
    modalDetalle.style.display = "flex";

    // cerrar con botón interno
    document.getElementById("cerrarDetalleBtn")?.addEventListener("click", ()=> modalDetalle.style.display = "none");
  }
});

/* --------------------- Eliminar (delegado) --------------------- */
document.addEventListener("click", async (e)=>{
  if (e.target.classList.contains("btn-delete")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    if (!id || !tipo) return;
    if (!confirm("¿Seguro que desea eliminar?")) return;
    try {
      await deleteDoc(doc(db, tipo, id));
    } catch(err){ console.error("Eliminar error:", err); alert("No se pudo eliminar."); }
  }
});

/* --------------------- Cierre modal buscador al hacer click fuera --------------------- */
modalBuscador?.addEventListener("click", (ev)=>{
  // cerrar si hace click en el backdrop (no en el contenido)
  if (ev.target === modalBuscador) modalBuscador.classList.remove("show");
});

/* --------------------- Mensaje de ayuda al cargar (opcional) --------------------- */
console.log("Dashboard cargado. Esperando cambios en Firestore... (onSnapshot activo).");


