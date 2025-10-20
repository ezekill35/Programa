// dashboard.js
// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, query, where, updateDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

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

// ===================== VERIFICAR SESIÓN =====================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Redirigir a login si no hay usuario
    window.location.href = "index.html";
  }
});

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
const modalFacturaBody = document.getElementById("modalFacturaBody");
const cerrarModalFactura = document.getElementById("cerrarModalFactura");

const modalExtra = document.getElementById("modalExtra");
const modalExtraBody = document.getElementById("modalExtraBody");
const cerrarModalExtra = document.getElementById("cerrarModalExtra");

const modalEditar = document.getElementById("modalEditar");
const modalEditarBody = document.getElementById("modalEditarBody");
const cerrarModalEditar = document.getElementById("cerrarModalEditar");

// otros campos del formulario factura
const campoAdicional = document.getElementById("campoAdicional");
const tipoFacturaSelect = document.getElementById("tipoFactura");
const montoInput = document.getElementById("montoFactura"); // subtotal
const igvInput = document.getElementById("igvFactura");
const totalInput = document.getElementById("totalFactura");
const idFacturaInput = document.getElementById("idFactura");

// campos productos
const presentacionSelect = document.getElementById("presentacionProducto");
const cantidadPresentacionInput = document.getElementById("cantidadPresentacion");

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

    if(btn.dataset.target === "facturas") buscador.style.display = "block";
    else { buscador.style.display = "none"; buscador.value=""; panelFacturas.innerHTML=""; }
  });
});

// ===================== UTILIDADES =====================
function generateInvoiceId(){
  // ID legible, único por timestamp (últimos 8 dígitos para reducir longitud)
  const now = new Date();
  const stamp = now.toISOString().slice(0,19).replace(/[-:T]/g,''); // YYYYMMDDHHMMSS
  return `F-${stamp}`;
}

function format2(n){
  return Number(n || 0).toFixed(2);
}

function computeIgvAndTotal(subtotal){
  const s = parseFloat(subtotal) || 0;
  const igv = s * 0.18;
  const total = s + igv;
  return { igv, total };
}

// Establecer nuevo ID al cargar la página y después de cada registro
function setNewInvoiceId(){
  idFacturaInput.value = generateInvoiceId();
}
setNewInvoiceId();

// Mostrar campo adicional si es nota crédito/débito
tipoFacturaSelect.addEventListener("change", () => {
  const v = tipoFacturaSelect.value;
  if(v === "Nota de Crédito" || v === "Nota de Débito"){
    campoAdicional.style.display = "block";
  } else {
    campoAdicional.style.display = "none";
    document.getElementById("detalleAdicional").value = "";
  }
});

// Calcular IGV y total al cambiar subtotal
montoInput.addEventListener("input", () => {
  const { igv, total } = computeIgvAndTotal(montoInput.value);
  igvInput.value = format2(igv);
  totalInput.value = format2(total);
});

// ===================== AUXILIARES =====================
async function cargarProveedoresSelect(){
  const select = document.getElementById("proveedorFactura");
  select.innerHTML = '<option value="">Seleccionar proveedor</option>';
  const snap = await getDocs(colProveedores);
  snap.forEach(d => {
    const data = d.data();
    const opt = document.createElement("option");
    // vamos a mostrar "Nombre (TipoDoc)" pero guardar solo el nombre para búsqueda como antes
    opt.value = data.nombre || "";
    opt.textContent = `${data.tipoDocumento ? data.tipoDocumento + ' - ' : ''}${data.nombre || ''}`;
    select.appendChild(opt);
  });
}

async function cargarProductosSelect(){
  const select = document.getElementById("productoFactura");
  select.innerHTML = '<option value="">Seleccionar producto</option>';
  const snap = await getDocs(colProductos);
  snap.forEach(d => {
    const data = d.data();
    const opt = document.createElement("option");
    opt.value = data.nombre || "";
    opt.textContent = data.nombre || "";
    select.appendChild(opt);
  });
}

// ===================== MOSTRAR FACTURA =====================
function mostrarModalFactura(f){
  // f expected to have: idFactura, fecha, proveedor, producto, subtotal, igv, total, tipo, detalleAdicional (opt)
  modalFacturaBody.innerHTML = `
    <h3 class="text-sky-600 font-bold text-lg mb-2">Factura ${f.idFactura}</h3>
    <p><b>Fecha:</b> ${f.fecha}</p>
    <p><b>Proveedor:</b> <span class="link-info" data-tipo="proveedor" data-nombre="${f.proveedor}" style="color:#f97316;">Ver proveedor</span></p>
    <p><b>Producto:</b> <span class="link-info" data-tipo="producto" data-nombre="${f.producto}" style="color:#14b8a6;">Ver producto</span></p>
    <p><b>Subtotal:</b> S/. ${format2(f.subtotal)}</p>
    <p><b>IGV (18%):</b> S/. ${format2(f.igv)}</p>
    <p><b>Total:</b> S/. ${format2(f.total)}</p>
    <p><b>Tipo:</b> ${f.tipo}${f.detalleAdicional ? ' — ' + f.detalleAdicional : ''}</p>
  `;
  modalFactura.showModal();
}

// ===================== CERRAR MODALES =====================
cerrarModalFactura.addEventListener("click", ()=>modalFactura.close());
cerrarModalExtra.addEventListener("click", ()=>modalExtra.close());
cerrarModalEditar.addEventListener("click", ()=>modalEditar.close());

// ===================== PROVEEDORES =====================
formProveedor.addEventListener("submit", async e=>{
  e.preventDefault();
  const data = {
    tipoDocumento: document.getElementById("tipoDocumentoProveedor").value || "",
    nombre: document.getElementById("nombreProveedor").value.trim(),
    direccion: document.getElementById("direccionProveedor").value.trim(),
    telefono: document.getElementById("telefonoProveedor").value.trim()
  };
  await addDoc(colProveedores, data);
  formProveedor.reset();
});

onSnapshot(colProveedores, snapshot=>{
  tablaProveedores.innerHTML="";
  snapshot.forEach(docu=>{
    const d=docu.data();
    const tr=document.createElement("tr");
    tr.dataset.id=docu.id;
    tr.innerHTML=`
      <td>${d.tipoDocumento||""}</td>
      <td>${d.nombre||""}</td>
      <td>${d.direccion||""}</td>
      <td>${d.telefono||""}</td>
      <td>
        <button class="btn-accion editar" data-tipo="proveedor" data-id="${docu.id}">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="proveedor" data-nombre="${d.nombre||""}">🔍</button>
        <button class="btn-accion eliminar" data-tipo="proveedor" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaProveedores.appendChild(tr);
  });
  countProveedores.textContent=snapshot.size;
  cargarProveedoresSelect();
});

// ===================== PRODUCTOS =====================
formProducto.addEventListener("submit", async e=>{
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const presentacion = document.getElementById("presentacionProducto").value;
  const cantidadPresentacion = parseInt(document.getElementById("cantidadPresentacion").value) || 0;
  const precio = parseFloat(document.getElementById("precioProducto").value) || 0;
  const descripcion = document.getElementById("descripcionProducto").value.trim();

  // guardamos presentacion y cantidadPresentacion por separado y también una etiqueta combinada para mostrar fácilmente
  const displayPresentacion = `${cantidadPresentacion} ${presentacion}`.trim();

  const data = {
    nombre,
    presentacion, // Unidad, Docena, etc.
    cantidadPresentacion,
    displayPresentacion,
    precio,
    descripcion
  };
  await addDoc(colProductos,data);
  formProducto.reset();
});

onSnapshot(colProductos, snapshot=>{
  tablaProductos.innerHTML="";
  snapshot.forEach(docu=>{
    const d=docu.data();
    const tr=document.createElement("tr");
    tr.dataset.id=docu.id;
    tr.innerHTML=`
      <td>${d.nombre||""}</td>
      <td>${d.displayPresentacion||(""/* fallback */)}</td>
      <td>${format2(d.precio)}</td>
      <td style="white-space: pre-line;">${d.descripcion||""}</td>
      <td>
        <button class="btn-accion editar" data-tipo="producto" data-id="${docu.id}">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="producto" data-nombre="${d.nombre||""}">🔍</button>
        <button class="btn-accion eliminar" data-tipo="producto" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaProductos.appendChild(tr);
  });
  countProductos.textContent=snapshot.size;
  cargarProductosSelect();
});

// ===================== FACTURAS =====================
formFactura.addEventListener("submit", async e=>{
  e.preventDefault();

  // Calcular IGV y total de nuevo por seguridad
  const subtotal = parseFloat(document.getElementById("montoFactura").value) || 0;
  const { igv, total } = computeIgvAndTotal(subtotal);

  const data = {
    idFactura: document.getElementById("idFactura").value.trim() || generateInvoiceId(),
    fecha: document.getElementById("fechaFactura").value,
    proveedor: document.getElementById("proveedorFactura").value,
    producto: document.getElementById("productoFactura").value,
    subtotal: subtotal,
    igv: igv,
    total: total,
    tipo: document.getElementById("tipoFactura").value,
    detalleAdicional: document.getElementById("detalleAdicional") ? document.getElementById("detalleAdicional").value.trim() : ""
  };
  await addDoc(colFacturas,data);
  formFactura.reset();
  // nueva id disponible después del registro
  setNewInvoiceId();
  igvInput.value = "";
  totalInput.value = "";
});

// Observador facturas
onSnapshot(colFacturas,snapshot=>{
  tablaFacturas.innerHTML="";
  snapshot.forEach(docu=>{
    const f=docu.data();
    const tr=document.createElement("tr");
    tr.dataset.id=docu.id;
    tr.innerHTML=`
      <td>${f.idFactura}</td>
      <td>${f.fecha}</td>
      <td>${f.proveedor}</td>
      <td>${f.producto}</td>
      <td>${format2(f.subtotal)}</td>
      <td>${format2(f.igv)}</td>
      <td>${format2(f.total)}</td>
      <td>${f.tipo||""}</td>
      <td>
        <button class="btn-accion editar" data-tipo="factura" data-id="${docu.id}">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="factura" data-id="${docu.id}">🔍</button>
        <button class="btn-accion eliminar" data-tipo="factura" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  });
  countFacturas.textContent=snapshot.size;
});

// ===================== BUSCADOR =====================
buscador.style.display="none";
buscador.addEventListener("input", async ()=>{
  const texto=buscador.value.trim().toLowerCase();
  panelFacturas.innerHTML="";
  if(!texto) return;
  const snap = await getDocs(colFacturas);
  snap.forEach(docu=>{
    const f = docu.data();
    if((f.producto || "").toLowerCase().includes(texto) || (f.idFactura || "").toLowerCase().includes(texto)){
      const div=document.createElement("div");
      div.className="resultado-item";
      div.textContent=`${f.idFactura} — ${f.producto}`;
      div.addEventListener("click", ()=>mostrarModalFactura(f));
      panelFacturas.appendChild(div);
    }
  });
});

// ===================== CLICK GLOBAL =====================
document.addEventListener("click", async e=>{

  // --------- EDITAR ---------
  if(e.target.classList.contains("editar")){
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    let colNombre = tipo==="proveedor" ? "proveedores" : tipo==="producto" ? "productos" : "facturas";
    const docRef = doc(db, colNombre, id);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
      const d = docSnap.data();
      // construir formulario de edición según tipo
      if(tipo === "proveedor"){
        modalEditarBody.innerHTML = `
          <h5>Editar proveedor</h5>
          <label>Tipo documento</label>
          <input id="editTipoDoc" class="form-control mb-1" value="${d.tipoDocumento||''}">
          <label>Nombre / Razón</label><input id="editNombre" class="form-control mb-1" value="${d.nombre||''}">
          <label>Dirección</label><input id="editDir" class="form-control mb-1" value="${d.direccion||''}">
          <label>Teléfono</label><input id="editTel" class="form-control mb-1" value="${d.telefono||''}">
          <button id="guardarEdit" class="btn btn-primary mt-2">Guardar</button>
        `;
      } else if(tipo === "producto"){
        modalEditarBody.innerHTML = `
          <h5>Editar producto</h5>
          <label>Nombre</label><input id="editNombre" class="form-control mb-1" value="${d.nombre||''}">
          <label>Presentación</label>
          <select id="editPresentacion" class="form-select mb-1">
            <option ${d.presentacion==='Unidad'?'selected':''}>Unidad</option>
            <option ${d.presentacion==='Docena'?'selected':''}>Docena</option>
            <option ${d.presentacion==='Ciento'?'selected':''}>Ciento</option>
            <option ${d.presentacion==='Millar'?'selected':''}>Millar</option>
          </select>
          <label>Cantidad presentación</label><input id="editCantPres" type="number" class="form-control mb-1" value="${d.cantidadPresentacion||0}">
          <label>Precio</label><input id="editPrecio" type="number" step="0.01" class="form-control mb-1" value="${d.precio||0}">
          <label>Descripción</label><textarea id="editDesc" class="form-control mb-1">${d.descripcion||''}</textarea>
          <button id="guardarEdit" class="btn btn-primary mt-2">Guardar</button>
        `;
      } else if(tipo === "factura"){
        modalEditarBody.innerHTML = `
          <h5>Editar factura</h5>
          <label>ID</label><input id="editId" class="form-control mb-1" value="${d.idFactura||''}">
          <label>Fecha</label><input id="editFecha" type="date" class="form-control mb-1" value="${d.fecha||''}">
          <label>Proveedor</label><input id="editProv" class="form-control mb-1" value="${d.proveedor||''}">
          <label>Producto</label><input id="editProd" class="form-control mb-1" value="${d.producto||''}">
          <label>Subtotal</label><input id="editSubtotal" type="number" step="0.01" class="form-control mb-1" value="${d.subtotal||0}">
          <label>Tipo</label>
          <select id="editTipo" class="form-select mb-1">
            <option ${d.tipo==='Factura'?'selected':''}>Factura</option>
            <option ${d.tipo==='Boleta'?'selected':''}>Boleta</option>
            <option ${d.tipo==='Ticket'?'selected':''}>Ticket</option>
            <option ${d.tipo==='Nota de Crédito'?'selected':''}>Nota de Crédito</option>
            <option ${d.tipo==='Nota de Débito'?'selected':''}>Nota de Débito</option>
          </select>
          <label>Detalle adicional (opcional)</label><input id="editDetalleAd" class="form-control mb-1" value="${d.detalleAdicional||''}">
          <button id="guardarEdit" class="btn btn-primary mt-2">Guardar</button>
        `;
      }

      modalEditar.showModal();

      // prevenir duplicar listeners: reemplazamos el botón por un clon (sin handlers)
      const btnGuardar = document.getElementById("guardarEdit");
      if(btnGuardar){
        btnGuardar.replaceWith(btnGuardar.cloneNode(true));
        document.getElementById("guardarEdit").addEventListener("click", async ()=>{
          const upd = {};
          if(tipo === "proveedor"){
            upd.tipoDocumento = document.getElementById("editTipoDoc").value.trim();
            upd.nombre = document.getElementById("editNombre").value.trim();
            upd.direccion = document.getElementById("editDir").value.trim();
            upd.telefono = document.getElementById("editTel").value.trim();
          } else if(tipo === "producto"){
            upd.nombre = document.getElementById("editNombre").value.trim();
            upd.presentacion = document.getElementById("editPresentacion").value;
            upd.cantidadPresentacion = parseInt(document.getElementById("editCantPres").value) || 0;
            upd.displayPresentacion = `${upd.cantidadPresentacion} ${upd.presentacion}`;
            upd.precio = parseFloat(document.getElementById("editPrecio").value) || 0;
            upd.descripcion = document.getElementById("editDesc").value.trim();
          } else if(tipo === "factura"){
            upd.idFactura = document.getElementById("editId").value.trim();
            upd.fecha = document.getElementById("editFecha").value;
            upd.proveedor = document.getElementById("editProv").value.trim();
            upd.producto = document.getElementById("editProd").value.trim();
            const newSubtotal = parseFloat(document.getElementById("editSubtotal").value) || 0;
            const { igv, total } = computeIgvAndTotal(newSubtotal);
            upd.subtotal = newSubtotal;
            upd.igv = igv;
            upd.total = total;
            upd.tipo = document.getElementById("editTipo").value;
            upd.detalleAdicional = document.getElementById("editDetalleAd").value.trim();
          }
          await updateDoc(doc(db, colNombre, id), upd);
          modalEditar.close();
        });
      }
    } // if doc exists
  }

  // --------- VER DETALLES (link-info) ---------
  if(e.target.classList.contains("link-info")){
    const tipo = e.target.dataset.tipo;
    const nombre = e.target.dataset.nombre;
    if(!nombre) return;
    if(!confirm(`Deseas ver los datos de ${tipo} ${nombre}?`)) return;
    let colRef = tipo==="proveedor" ? colProveedores : colProductos;
    const snap = await getDocs(query(colRef, where(tipo==="proveedor" ? "nombre" : "nombre","==", nombre)));
    if(!snap.empty){
      const d = snap.docs[0].data();
      if(tipo === "proveedor"){
        modalExtraBody.innerHTML = `
          <h5>Proveedor: ${d.nombre}</h5>
          <p>Tipo documento: ${d.tipoDocumento||''}<br>Dirección: ${d.direccion||''}<br>Tel: ${d.telefono||''}</p>
        `;
      } else {
        modalExtraBody.innerHTML = `
          <h5>Producto: ${d.nombre}</h5>
          <p>Presentación: ${d.displayPresentacion || ( (d.cantidadPresentacion||'') + ' ' + (d.presentacion||'') ) }<br>Precio: S/. ${format2(d.precio)}<br>Descripción: ${d.descripcion||''}</p>
        `;
      }
      modalExtra.showModal();
    } else {
      alert("No se encontró información relacionada.");
    }
  }

  // --------- ELIMINAR ---------
  if(e.target.classList.contains("eliminar")){
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    let colRef = tipo==="proveedor"?colProveedores:tipo==="producto"?colProductos:colFacturas;
    if(confirm("¿Deseas eliminar este registro?")) {
      await deleteDoc(doc(db, colRef.id, id));
    }
  }

  // --------- VER FACTURA desde Lista (botón 🔍) ---------
  if(e.target.matches('button.ver[data-tipo="factura"]') || (e.target.classList.contains("ver") && e.target.dataset.tipo === "factura")){
    const id = e.target.dataset.id;
    if(!id) return;
    const docRef = doc(db, "facturas", id);
    const snap = await getDoc(docRef);
    if(snap.exists()){
      mostrarModalFactura(snap.data());
    } else {
      alert("Factura no encontrada.");
    }
  }
});

