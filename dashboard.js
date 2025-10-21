// dashboard.js
// Módulo principal: Firebase + lógica CRUD, buscador y modales
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, query, where, updateDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

/* ===================== CONFIG FIREBASE (usa tu proyecto Discovery Pets) ===================== */
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

/* ===================== VERIFICAR SESIÓN ===================== */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});

/* ===================== COLECCIONES ===================== */
const colProveedores = collection(db, "proveedores");
const colProductos = collection(db, "productos");
const colFacturas = collection(db, "facturas");

/* ===================== ELEMENTOS ===================== */
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

/* ===================== CERRAR SESIÓN ===================== */
document.getElementById("btnCerrarSesion").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

/* ===================== NAVEGACIÓN ===================== */
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("activo"));
    document.querySelectorAll(".seccion").forEach(s => s.classList.remove("activa"));
    btn.classList.add("activo");
    document.getElementById(btn.dataset.target).classList.add("activa");

    // mostrar buscador sólo para facturas
    if(btn.dataset.target === "facturas") buscador.style.display = "block";
    else { buscador.style.display = "none"; buscador.value=""; panelFacturas.innerHTML=""; }
  });
});

/* ===================== AUXILIARES ===================== */
async function cargarProveedoresSelect(){
  const select = document.getElementById("proveedorFactura");
  select.innerHTML = '<option value="">Seleccionar proveedor</option>';
  const snap = await getDocs(colProveedores);
  snap.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.data().nombre;
    opt.textContent = d.data().nombre;
    select.appendChild(opt);
  });
}

async function cargarProductosSelect(){
  const select = document.getElementById("productoFactura");
  select.innerHTML = '<option value="">Seleccionar producto</option>';
  const snap = await getDocs(colProductos);
  snap.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.data().nombre;
    opt.textContent = d.data().nombre;
    select.appendChild(opt);
  });
}

/* Mostrar modal detalle factura */
function mostrarModalFactura(f){
  const simbolo = f.moneda === "USD" ? "$" : f.moneda === "EUR" ? "€" : "S/.";
  modalFacturaBody.innerHTML = `
    <h5 class="fw-bold">Factura ${f.idFactura || "(sin ID)"}</h5>
    <p><b>Fecha:</b> ${f.fecha}</p>
    <p><b>Proveedor:</b> <span class="link-info" data-tipo="proveedor" data-nombre="${f.proveedor}" style="color:#0ea5a4;">${f.proveedor}</span></p>
    <p><b>Producto:</b> <span class="link-info" data-tipo="producto" data-nombre="${f.producto}" style="color:#075985;">${f.producto}</span></p>
    <p><b>Subtotal:</b> ${simbolo} ${Number(f.monto).toFixed(2)}</p>
    <p><b>IGV:</b> ${simbolo} ${Number(f.igv).toFixed(2)}</p>
    <p><b>Total:</b> ${simbolo} ${Number(f.total).toFixed(2)}</p>
    <p><b>Tipo:</b> ${f.tipo}</p>
  `;
  modalFactura.showModal();
}

/* ===================== CERRAR MODALES ===================== */
cerrarModalFactura.addEventListener("click", ()=>modalFactura.close());
cerrarModalExtra.addEventListener("click", ()=>modalExtra.close());
cerrarModalEditar.addEventListener("click", ()=>modalEditar.close());

/* ===================== PROVEEDORES ===================== */
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
        <button class="btn-accion ver link-info" data-tipo="proveedor" data-nombre="${d.nombre}">🔍</button>
        <button class="btn-accion eliminar" data-tipo="proveedor" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaProveedores.appendChild(tr);
  });
  countProveedores.textContent=snapshot.size;
  cargarProveedoresSelect();
});

/* ===================== PRODUCTOS ===================== */
formProducto.addEventListener("submit", async e=>{
  e.preventDefault();
  const data={
    nombre: document.getElementById("nombreProducto").value.trim(),
    presentacion: document.getElementById("presentacionProducto").value,
    cantidadPresentacion: parseInt(document.getElementById("cantidadPresentacion").value || 0),
    precio: parseFloat(document.getElementById("precioProducto").value || 0),
    descripcion: document.getElementById("descripcionProducto").value.trim()
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
      <td>${d.nombre}</td>
      <td>${d.presentacion||""}</td>
      <td>${d.cantidadPresentacion||0}</td>
      <td>${Number(d.precio||0).toFixed(2)}</td>
      <td style="white-space: pre-line;">${d.descripcion||""}</td>
      <td>
        <button class="btn-accion editar" data-tipo="producto" data-id="${docu.id}">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="producto" data-nombre="${d.nombre}">🔍</button>
        <button class="btn-accion eliminar" data-tipo="producto" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaProductos.appendChild(tr);
  });
  countProductos.textContent=snapshot.size;
  cargarProductosSelect();
});

/* ===================== FACTURAS ===================== */
function calcularIGYTotal(subtotal){
  const igv = subtotal * 0.18;
  const total = subtotal + igv;
  return { igv, total };
}

document.getElementById("montoFactura").addEventListener("input", ()=>{
  const val = parseFloat(document.getElementById("montoFactura").value || 0);
  const { igv, total } = calcularIGYTotal(val);
  document.getElementById("igvFactura").value = igv.toFixed(2);
  document.getElementById("totalFactura").value = total.toFixed(2);
});

document.getElementById("tipoFactura").addEventListener("change", (e)=>{
  const tipo = e.target.value;
  const campo = document.getElementById("campoAdicional");
  campo.style.display = (tipo.includes("Nota")) ? "block" : "none";
});

formFactura.addEventListener("submit", async e=>{
  e.preventDefault();
  const monto = parseFloat(document.getElementById("montoFactura").value || 0);
  const { igv, total } = calcularIGYTotal(monto);

  const data={
    idFactura: document.getElementById("idFactura").value.trim(),
    fecha: document.getElementById("fechaFactura").value,
    proveedor: document.getElementById("proveedorFactura").value,
    producto: document.getElementById("productoFactura").value,
    monto: monto,
    igv: igv,
    total: total,
    tipo: document.getElementById("tipoFactura").value,
    moneda: document.getElementById("monedaFactura").value || "PEN",
    detalle: document.getElementById("detalleAdicional").value || ""
  };
  await addDoc(colFacturas,data);
  formFactura.reset();
  document.getElementById("igvFactura").value = "";
  document.getElementById("totalFactura").value = "";
});

onSnapshot(colFacturas,snapshot=>{
  tablaFacturas.innerHTML="";
  snapshot.forEach(docu=>{
    const f=docu.data();
    const tr=document.createElement("tr");
    tr.dataset.id=docu.id;
    const simbolo = f.moneda === "USD" ? "$" : f.moneda === "EUR" ? "€" : "S/.";
    tr.innerHTML=`
      <td>${f.idFactura||""}</td>
      <td>${f.fecha||""}</td>
      <td>${f.proveedor||""}</td>
      <td>${f.producto||""}</td>
      <td>${simbolo} ${Number(f.monto||0).toFixed(2)}</td>
      <td>${simbolo} ${Number(f.igv||0).toFixed(2)}</td>
      <td>${simbolo} ${Number(f.total||0).toFixed(2)}</td>
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

/* ===================== BUSCADOR ===================== */
buscador.style.display="none";
buscador.addEventListener("input", async ()=>{
  const texto = buscador.value.trim().toLowerCase();
  panelFacturas.innerHTML = "";
  if(!texto) return;
  const snap = await getDocs(colFacturas);
  snap.forEach(docu=>{
    const f = docu.data();
    if( (f.producto && f.producto.toLowerCase().includes(texto)) ||
        (f.idFactura && f.idFactura.toLowerCase().includes(texto)) ){
      const div = document.createElement("div");
      div.className = "resultado-item panel";
      div.textContent = `${f.idFactura || "(sin ID)"} — ${f.producto} — ${f.proveedor}`;
      div.addEventListener("click", ()=>mostrarModalFactura(f));
      panelFacturas.appendChild(div);
    }
  });
});

/* ===================== CLICK GLOBAL (editar / ver / eliminar) ===================== */
document.addEventListener("click", async e=>{
  const target = e.target;

  // ---------- EDITAR ----------
  if(target.classList.contains("editar")){
    const tipo = target.dataset.tipo;
    const id = target.dataset.id;
    const colNombre = tipo==="proveedor" ? "proveedores" : tipo==="producto" ? "productos" : "facturas";
    const docRef = doc(db, colNombre, id);
    const snap = await getDoc(docRef);
    if(snap.exists()){
      const d = snap.data();
      modalEditarBody.innerHTML = `
        <h5>Editar ${tipo}</h5>
        ${tipo==="proveedor" ? `
          <label class="tiny">Tipo documento</label>
          <input id="editTipoDoc" class="form-control mb-1" value="${d.tipoDocumento||''}">
          <label>Nombre</label><input id="editNombre" class="form-control mb-1" value="${d.nombre||''}">
          <label>Dirección</label><input id="editDir" class="form-control mb-1" value="${d.direccion||''}">
          <label>Teléfono</label><input id="editTel" class="form-control mb-1" value="${d.telefono||''}">` :
        tipo==="producto" ? `
          <label>Nombre</label><input id="editNombre" class="form-control mb-1" value="${d.nombre||''}">
          <label>Presentación</label><input id="editPresent" class="form-control mb-1" value="${d.presentacion||''}">
          <label>Cantidad</label><input id="editCantidad" type="number" class="form-control mb-1" value="${d.cantidadPresentacion||0}">
          <label>Precio</label><input id="editPrecio" type="number" step="0.01" class="form-control mb-1" value="${d.precio||0}">
          <label>Descripción</label><textarea id="editDesc" class="form-control mb-1">${d.descripcion||''}</textarea>` :
        `
          <label>ID</label><input id="editId" class="form-control mb-1" value="${d.idFactura||''}">
          <label>Fecha</label><input id="editFecha" type="date" class="form-control mb-1" value="${d.fecha||''}">
          <label>Proveedor</label><input id="editProv" class="form-control mb-1" value="${d.proveedor||''}">
          <label>Producto</label><input id="editProd" class="form-control mb-1" value="${d.producto||''}">
          <label>Monto</label><input id="editMonto" type="number" step="0.01" class="form-control mb-1" value="${d.monto||0}">
          <label>Tipo</label><input id="editTipo" class="form-control mb-1" value="${d.tipo||''}">
        `}
        <div class="text-end mt-2">
          <button id="guardarEdit" class="btn btn-primary">Guardar</button>
        </div>
      `;
      modalEditar.showModal();

      // evitar duplicados de listeners: crear nuevo listener para este boton
      const guardarBtn = document.getElementById("guardarEdit");
      guardarBtn.addEventListener("click", async ()=>{
        const upd = {};
        if(tipo==="proveedor"){
          upd.tipoDocumento = document.getElementById("editTipoDoc").value.trim();
          upd.nombre = document.getElementById("editNombre").value.trim();
          upd.direccion = document.getElementById("editDir").value.trim();
          upd.telefono = document.getElementById("editTel").value.trim();
        } else if(tipo==="producto"){
          upd.nombre = document.getElementById("editNombre").value.trim();
          upd.presentacion = document.getElementById("editPresent").value.trim();
          upd.cantidadPresentacion = parseInt(document.getElementById("editCantidad").value || 0);
          upd.precio = parseFloat(document.getElementById("editPrecio").value || 0);
          upd.descripcion = document.getElementById("editDesc").value.trim();
        } else if(tipo==="factura"){
          const monto = parseFloat(document.getElementById("editMonto").value || 0);
          const { igv, total } = calcularIGYTotal(monto);
          upd.idFactura = document.getElementById("editId").value.trim();
          upd.fecha = document.getElementById("editFecha").value;
          upd.proveedor = document.getElementById("editProv").value.trim();
          upd.producto = document.getElementById("editProd").value.trim();
          upd.monto = monto;
          upd.igv = igv;
          upd.total = total;
          upd.tipo = document.getElementById("editTipo").value.trim();
        }
        await updateDoc(doc(db, colNombre, id), upd);
        modalEditar.close();
      });
    }
  }

  // ---------- VER DETALLES (link-info) ----------
  if(target.classList.contains("link-info")){
    const tipo = target.dataset.tipo;
    const nombre = target.dataset.nombre;
    if(confirm(`¿Deseas ver los datos de ${tipo} ${nombre}?`)){
      let colRef = tipo==="proveedor"? colProveedores : colProductos;
      const snap = await getDocs(query(colRef, where("nombre","==",nombre)));
      if(!snap.empty){
        const d = snap.docs[0].data();
        modalExtraBody.innerHTML = `
          <h5>${tipo} ${nombre}</h5>
          <p>${tipo==="proveedor" ? `Tipo: ${d.tipoDocumento||''}<br>Dirección: ${d.direccion||''}<br>Tel: ${d.telefono||''}` :
            `Presentación: ${d.presentacion||''}<br>Cantidad: ${d.cantidadPresentacion||0}<br>Precio: ${Number(d.precio||0).toFixed(2)}<br>Descripción: ${d.descripcion||''}` }</p>
        `;
        modalExtra.showModal();
      } else {
        alert("No se encontraron datos relacionados.");
      }
    }
  }

  // ---------- ELIMINAR ----------
  if(target.classList.contains("eliminar")){
    const tipo = target.dataset.tipo;
    const id = target.dataset.id;
    const colNombre = tipo==="proveedor"? "proveedores" : tipo==="producto" ? "productos" : "facturas";
    if(confirm("¿Deseas eliminar este registro?")){
      await deleteDoc(doc(db, colNombre, id));
    }
  }
});

/* ===================== Inicialización: cargar selects y ocultar buscador ===================== */
(async function init(){
  buscador.style.display = "none";
  await cargarProveedoresSelect();
  await cargarProductosSelect();
})();




});


