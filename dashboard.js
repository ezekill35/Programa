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
  if (!user) {
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

function mostrarModalFactura(f){
  modalFacturaBody.innerHTML = `
    <h3 class="text-sky-600 font-bold text-lg mb-2">Factura ${f.idFactura}</h3>
    <p><b>Fecha:</b> ${f.fecha}</p>
    <p><b>Proveedor:</b> <span class="link-info" data-tipo="proveedor" data-nombre="${f.proveedor}" style="color:#f97316;">${f.proveedor}</span></p>
    <p><b>Producto:</b> <span class="link-info" data-tipo="producto" data-nombre="${f.producto}" style="color:#14b8a6;">${f.producto}</span></p>
    <p><b>Monto:</b> S/. ${f.monto}</p>
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
  const tipo = document.getElementById("tipoDocumentoProveedor").value;
  const data = {
    tipoDocumento: tipo,
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
      <td>${d.tipoDocumento}</td>
      <td>${d.nombre}</td>
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

// ===================== PRODUCTOS =====================
formProducto.addEventListener("submit", async e=>{
  e.preventDefault();
  const data={
    nombre: document.getElementById("nombreProducto").value.trim(),
    presentacion: document.getElementById("presentacionProducto").value,
    cantidadPresentacion: parseInt(document.getElementById("cantidadPresentacion").value),
    precio: parseFloat(document.getElementById("precioProducto").value),
    descripcion: document.getElementById("descripcionProducto").value.trim()
  };
  await addDoc(colProductos, data);
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
      <td>${d.presentacion}</td>
      <td>${d.cantidadPresentacion}</td>
      <td>${d.precio}</td>
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

// ===================== FACTURAS =====================
formFactura.addEventListener("submit", async e=>{
  e.preventDefault();
  const data={
    idFactura: document.getElementById("idFactura").value.trim() || Date.now().toString(),
    fecha: document.getElementById("fechaFactura").value,
    proveedor: document.getElementById("proveedorFactura").value,
    producto: document.getElementById("productoFactura").value,
    monto: parseFloat(document.getElementById("montoFactura").value),
    tipo: document.getElementById("tipoFactura").value
  };
  await addDoc(colFacturas, data);
  formFactura.reset();
});

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
      <td>${f.monto}</td>
      <td>${(f.monto*0.18).toFixed(2)}</td>
      <td>${(f.monto*1.18).toFixed(2)}</td>
      <td>${f.tipo}</td>
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
    if(f.producto.toLowerCase().includes(texto)){
      const div=document.createElement("div");
      div.className="resultado-item";
      div.textContent=f.idFactura;
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
    let colNombre = tipo==="proveedor"?"proveedores":tipo==="producto"?"productos":"facturas";
    const docRef = doc(db, colNombre, id);
    const snap = await getDocs(query(collection(db, colNombre), where("__name__","==",id)));
    if(!snap.empty){
      const d = snap.docs[0].data();
      modalEditarBody.innerHTML = `
        <h5>Editar ${tipo}</h5>
        ${tipo==="proveedor"?`
          <label>Tipo Documento</label><input id="editTipoDoc" class="form-control mb-1" value="${d.tipoDocumento||''}">
          <label>Nombre</label><input id="editNombre" class="form-control mb-1" value="${d.nombre||''}">
          <label>Dirección</label><input id="editDireccion" class="form-control mb-1" value="${d.direccion||''}">
          <label>Teléfono</label><input id="editTelefono" class="form-control mb-1" value="${d.telefono||''}">
        `:tipo==="producto"?`
          <label>Nombre</label><input id="editNombre" class="form-control mb-1" value="${d.nombre||''}">
          <label>Presentación</label><input id="editPresentacion" class="form-control mb-1" value="${d.presentacion||''}">
          <label>Cantidad</label><input id="editCantidad" type="number" class="form-control mb-1" value="${d.cantidadPresentacion||1}">
          <label>Precio</label><input id="editPrecio" type="number" class="form-control mb-1" value="${d.precio||0}">
          <label>Descripción</label><textarea id="editDescripcion" class="form-control mb-1">${d.descripcion||''}</textarea>
        `:`
          <label>Proveedor</label><input id="editProveedor" class="form-control mb-1" value="${d.proveedor||''}">
          <label>Producto</label><input id="editProducto" class="form-control mb-1" value="${d.producto||''}">
          <label>Monto</label><input id="editMonto" type="number" class="form-control mb-1" value="${d.monto||0}">
          <label>Tipo</label><input id="editTipo" class="form-control mb-1" value="${d.tipo||''}">
        `}
        <button id="guardarCambios" class="btn btn-success mt-2">Guardar</button>
      `;
      modalEditar.showModal();

      document.getElementById("guardarCambios").addEventListener("click", async ()=>{
        let updates={};
        if(tipo==="proveedor"){
          updates={
            tipoDocumento: document.getElementById("editTipoDoc").value,
            nombre: document.getElementById("editNombre").value,
            direccion: document.getElementById("editDireccion").value,
            telefono: document.getElementById("editTelefono").value
          };
        }else if(tipo==="producto"){
          updates={
            nombre: document.getElementById("editNombre").value,
            presentacion: document.getElementById("editPresentacion").value,
            cantidadPresentacion: parseInt(document.getElementById("editCantidad").value),
            precio: parseFloat(document.getElementById("editPrecio").value),
            descripcion: document.getElementById("editDescripcion").value
          };
        }else{
          updates={
            proveedor: document.getElementById("editProveedor").value,
            producto: document.getElementById("editProducto").value,
            monto: parseFloat(document.getElementById("editMonto").value),
            tipo: document.getElementById("editTipo").value
          };
        }
        await updateDoc(docRef, updates);
        modalEditar.close();
      });
    }
  }

  // --------- ELIMINAR ---------
  if(e.target.classList.contains("eliminar")){
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    let colNombre = tipo==="proveedor"?"proveedores":tipo==="producto"?"productos":"facturas";
    if(confirm(`¿Eliminar ${tipo}?`)){
      await deleteDoc(doc(db, colNombre, id));
    }
  }

  // --------- VER DETALLE ---------
  if(e.target.classList.contains("ver") && e.target.dataset.tipo==="factura"){
    const id = e.target.dataset.id;
    const snap = await getDocs(query(collection(db, "facturas"), where("__name__","==",id)));
    if(!snap.empty) mostrarModalFactura(snap.docs[0].data());
  }

});

