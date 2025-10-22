// ===================== FIREBASE CONFIG ===================== 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, query, where, updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  databaseURL: "https://discovery-pets-default-rtdb.firebaseio.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ===================== VERIFICAR SESIÓN =====================
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
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

const proveedorFactura = document.getElementById("proveedorFactura");
const productoFactura = document.getElementById("productoFactura");
const tipoMoneda = document.getElementById("tipoMoneda");
const presentacionProducto = document.getElementById("presentacionProducto");

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

// ===================== AUXILIARES =====================
function mostrarModalFactura(f){
  modalFacturaBody.innerHTML = `
    <h3 class="text-sky-600 font-bold text-lg mb-2">Factura ${f.idFactura}</h3>
    <p><b>Fecha:</b> ${f.fecha}</p>
    <p><b>Proveedor:</b> <span class="link-info" data-tipo="proveedor" data-nombre="${f.proveedor}" style="color:#f97316;">${f.proveedor}</span></p>
    <p><b>Producto:</b> <span class="link-info" data-tipo="producto" data-nombre="${f.producto}" style="color:#14b8a6;">${f.producto}</span></p>
    <p><b>Subtotal:</b> ${f.moneda==='soles' ? 'S/. ' : '$ '}${f.subtotal.toFixed(2)}</p>
    <p><b>IGV (18%):</b> ${f.moneda==='soles' ? 'S/. ' : '$ '}${f.igv.toFixed(2)}</p>
    <p><b>Total:</b> ${f.moneda==='soles' ? 'S/. ' : '$ '}${f.total.toFixed(2)}</p>
    <p><b>Tipo:</b> ${f.tipo}</p>
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
    tipoDocumento: document.getElementById("tipoDocumentoProveedor").value,
    numeroDocumento: document.getElementById("numeroDocumentoProveedor").value,
    nombre: document.getElementById("nombreProveedor").value.trim(),
    direccion: document.getElementById("direccionProveedor").value.trim(),
    telefono: document.getElementById("telefonoProveedor").value.trim()
  };
  await addDoc(colProveedores, data);
  formProveedor.reset();
});

// Tiempo real proveedores
onSnapshot(colProveedores, snapshot=>{
  tablaProveedores.innerHTML="";
  proveedorFactura.innerHTML = '<option value="">Seleccionar proveedor</option>';
  snapshot.forEach(docu=>{
    const d=docu.data();
    const tr=document.createElement("tr");
    tr.dataset.id=docu.id;
    tr.innerHTML=`
      <td>${d.tipoDocumento} - ${d.numeroDocumento}</td>
      <td>${d.nombre}</td>
      <td>${d.direccion||""}</td>
      <td>${d.telefono||""}</td>
      <td>
        <button class="btn-accion editar" data-tipo="proveedor" data-id="${docu.id}">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="proveedor" data-nombre="${d.nombre}">🔍</button>
        <button class="btn-accion eliminar" data-tipo="proveedor" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaProveedores.appendChild(tr);

    const opt=document.createElement("option");
    opt.value=d.nombre;
    opt.textContent=d.nombre;
    proveedorFactura.appendChild(opt);
  });
  countProveedores.textContent=snapshot.size;
});

// ===================== PRODUCTOS =====================
formProducto.addEventListener("submit", async e=>{
  e.preventDefault();
  const data = {
    nombre: document.getElementById("nombreProducto").value.trim(),
    presentacion: presentacionProducto.value,
    cantidad: parseInt(document.getElementById("cantidadPresentacion").value),
    precio: parseFloat(document.getElementById("precioProducto").value),
    moneda: document.getElementById("tipoMoneda").value,
    descripcion: document.getElementById("descripcionProducto").value.trim()
  };
  await addDoc(colProductos, data);
  formProducto.reset();
});

// Tiempo real productos
onSnapshot(colProductos, snapshot=>{
  tablaProductos.innerHTML="";
  productoFactura.innerHTML = '<option value="">Seleccionar producto</option>';
  snapshot.forEach(docu=>{
    const d=docu.data();
    const tr=document.createElement("tr");
    tr.dataset.id=docu.id;
    tr.innerHTML=`
      <td>${d.nombre}</td>
      <td>${d.cantidad} ${d.presentacion}</td>
      <td>${d.moneda === 'soles' ? 'S/. ' : '$ '}${d.precio}</td>
      <td style="white-space: pre-line;">${d.descripcion||""}</td>
      <td>
        <button class="btn-accion editar" data-tipo="producto" data-id="${docu.id}">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="producto" data-nombre="${d.nombre}">🔍</button>
        <button class="btn-accion eliminar" data-tipo="producto" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaProductos.appendChild(tr);

    const opt=document.createElement("option");
    opt.value=d.nombre;
    opt.textContent=d.nombre;
    productoFactura.appendChild(opt);
  });
  countProductos.textContent=snapshot.size;
});

// ===================== FACTURAS =====================
formFactura.addEventListener("submit", async e=>{
  e.preventDefault();
  const subtotal = parseFloat(document.getElementById("montoFactura").value) || 0;
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  const data = {
    idFactura: document.getElementById("idFactura").value.trim(),
    fecha: document.getElementById("fechaFactura").value,
    proveedor: proveedorFactura.value,
    producto: productoFactura.value,
    subtotal: subtotal,
    igv: igv,
    total: total,
    tipo: document.getElementById("tipoFactura").value,
    moneda: tipoMoneda.value
  };
  await addDoc(colFacturas, data);
  formFactura.reset();
});

// Tiempo real facturas
onSnapshot(colFacturas, snapshot=>{
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
      <td>${f.moneda==='soles' ? 'S/. ' : '$ '}${f.subtotal.toFixed(2)}</td>
      <td>${f.moneda==='soles' ? 'S/. ' : '$ '}${f.igv.toFixed(2)}</td>
      <td>${f.moneda==='soles' ? 'S/. ' : '$ '}${f.total.toFixed(2)}</td>
      <td>${f.tipo}</td>
      <td>
        <button class="btn-accion editar" data-tipo="factura" data-id="${docu.id}">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="factura" data-id="${docu.id}">🔍</button>
        <button class="btn-accion eliminar" data-tipo="factura" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  });
  countFacturas.textContent=snapshot.size;

  // Actualizar buscador en tiempo real
  const texto = buscador.value.trim().toLowerCase();
  panelFacturas.innerHTML = "";
  if(texto){
    snapshot.forEach(docu=>{
      const f=docu.data();
      if(f.producto.toLowerCase().includes(texto)){
        const div=document.createElement("div");
        div.className="resultado-item";
        div.textContent=f.idFactura;
        div.addEventListener("click", ()=>mostrarModalFactura(f));
        panelFacturas.appendChild(div);
      }
    });
  }
});

// ===================== BUSCADOR =====================
buscador.addEventListener("input", ()=>{}); // Se actualiza automáticamente por onSnapshot

// ===================== CLICK GLOBAL =====================
document.addEventListener("click", async e=>{
  // EDITAR
  if(e.target.classList.contains("editar")){
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    let colNombre = tipo==="proveedor"?"proveedores":tipo==="producto"?"productos":"facturas";
    const snap = await getDocs(query(collection(db, colNombre), where("__name__","==",id)));
    if(!snap.empty){
      const d = snap.docs[0].data();
      modalEditarBody.innerHTML = `
        <h5>Editar ${tipo}</h5>
        ${tipo==="proveedor"?`
          <label>Tipo Doc</label><input id="editTipoDoc" class="form-control mb-1" value="${d.tipoDocumento||''}">
          <label>Número Doc</label><input id="editNumDoc" class="form-control mb-1" value="${d.numeroDocumento||''}">
          <label>Nombre</label><input id="editNombre" class="form-control mb-1" value="${d.nombre||''}">
          <label>Dirección</label><input id="editDir" class="form-control mb-1" value="${d.direccion||''}">
          <label>Teléfono</label><input id="editTel" class="form-control mb-1" value="${d.telefono||''}">`:
        tipo==="producto"?`
          <label>Nombre</label><input id="editNombre" class="form-control mb-1" value="${d.nombre||''}">
          <label>Presentación</label><input id="editPresent" class="form-control mb-1" value="${d.presentacion||''}">
          <label>Cantidad</label><input id="editCantidad" type="number" class="form-control mb-1" value="${d.cantidad||0}">
          <label>Precio</label><input id="editPrecio" type="number" step="0.01" class="form-control mb-1" value="${d.precio||0}">
          <label>Moneda</label>
          <select id="editMoneda" class="form-select mb-1">
            <option value="soles" ${d.moneda==='soles'?'selected':''}>Soles</option>
            <option value="dolares" ${d.moneda==='dolares'?'selected':''}>Dólares</option>
          </select>
          <label>Descripción</label><textarea id="editDesc" class="form-control mb-1">${d.descripcion||''}</textarea>`:
        tipo==="factura"?`
          <label>ID</label><input id="editId" class="form-control mb-1" value="${d.idFactura||''}">
          <label>Fecha</label><input id="editFecha" type="date" class="form-control mb-1" value="${d.fecha||''}">
          <label>Proveedor</label><input id="editProv" class="form-control mb-1" value="${d.proveedor||''}">
          <label>Producto</label><input id="editProd" class="form-control mb-1" value="${d.producto||''}">
          <label>Subtotal</label><input id="editSub" type="number" step="0.01" class="form-control mb-1" value="${d.subtotal||0}">
          <label>IGV</label><input id="editIGV" type="number" step="0.01" class="form-control mb-1" value="${d.igv||0}">
          <label>Total</label><input id="editTotal" type="number" step="0.01" class="form-control mb-1" value="${d.total||0}">
          <label>Tipo</label><input id="editTipo" class="form-control mb-1" value="${d.tipo||''}">
          <label>Moneda</label>
          <select id="editMoneda" class="form-select mb-1">
            <option value="soles" ${d.moneda==='soles'?'selected':''}>Soles</option>
            <option value="dolares" ${d.moneda==='dolares'?'selected':''}>Dólares</option>
          </select>` : ''}
        <button id="guardarEdicion" class="btn btn-primary mt-2">Guardar cambios</button>
      `;
      modalEditar.showModal();

      document.getElementById("guardarEdicion").addEventListener("click", async () => {
        const dataActualizada = {};
        if(tipo==="proveedor"){
          dataActualizada.tipoDocumento = document.getElementById("editTipoDoc").value;
          dataActualizada.numeroDocumento = document.getElementById("editNumDoc").value;
          dataActualizada.nombre = document.getElementById("editNombre").value;
          dataActualizada.direccion = document.getElementById("editDir").value;
          dataActualizada.telefono = document.getElementById("editTel").value;
        } else if(tipo==="producto"){
          dataActualizada.nombre = document.getElementById("editNombre").value;
          dataActualizada.presentacion = document.getElementById("editPresent").value;
          dataActualizada.cantidad = parseInt(document.getElementById("editCantidad").value);
          dataActualizada.precio = parseFloat(document.getElementById("editPrecio").value);
          dataActualizada.moneda = document.getElementById("editMoneda").value;
          dataActualizada.descripcion = document.getElementById("editDesc").value;
        } else if(tipo==="factura"){
          dataActualizada.idFactura = document.getElementById("editId").value;
          dataActualizada.fecha = document.getElementById("editFecha").value;
          dataActualizada.proveedor = document.getElementById("editProv").value;
          dataActualizada.producto = document.getElementById("editProd").value;
          dataActualizada.subtotal = parseFloat(document.getElementById("editSub").value);
          dataActualizada.igv = parseFloat(document.getElementById("editIGV").value);
          dataActualizada.total = parseFloat(document.getElementById("editTotal").value);
          dataActualizada.tipo = document.getElementById("editTipo").value;
          dataActualizada.moneda = document.getElementById("editMoneda").value;
        }
        await updateDoc(doc(db, colNombre, id), dataActualizada);
        modalEditar.close();
      });
    }
  }

  // ELIMINAR
  if(e.target.classList.contains("eliminar")){
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    const colNombre = tipo==="proveedor"?"proveedores":tipo==="producto"?"productos":"facturas";
    if(confirm(`¿Desea eliminar este ${tipo}?`)){
      await deleteDoc(doc(db, colNombre, id));
    }
  }

  // VER DETALLE
  if(e.target.classList.contains("ver")){
    const tipo = e.target.dataset.tipo;
    if(tipo==="factura"){
      const id = e.target.dataset.id;
      const snap = await getDocs(query(colFacturas, where("__name__","==",id)));
      if(!snap.empty){
        mostrarModalFactura(snap.docs[0].data());
      }
    } else {
      const nombre = e.target.dataset.nombre;
      modalExtraBody.innerHTML = `<p>${tipo.toUpperCase()}: ${nombre}</p>`;
      modalExtra.showModal();
    }
  }
});
