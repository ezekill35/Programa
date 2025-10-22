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
  storageBucket: "discovery-pets.firebasestorage.app",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322",
  measurementId: "G-0WMLRY8FGM"
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
const tipoDocumentoProveedor = document.getElementById("tipoDocumentoProveedor");
const numeroDocumentoProveedor = document.getElementById("numeroDocumentoProveedor");
const nombreProveedor = document.getElementById("nombreProveedor");
const direccionProveedor = document.getElementById("direccionProveedor");
const telefonoProveedor = document.getElementById("telefonoProveedor");

const formProducto = document.getElementById("formProducto");
const tablaProductos = document.getElementById("tablaProductos");
const nombreProducto = document.getElementById("nombreProducto");
const cantidadPresentacion = document.getElementById("cantidadPresentacion");
const precioProducto = document.getElementById("precioProducto");
const tipoMoneda = document.getElementById("tipoMoneda");
const descripcionProducto = document.getElementById("descripcionProducto");

const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas");
const idFactura = document.getElementById("idFactura");
const fechaFactura = document.getElementById("fechaFactura");
const proveedorFactura = document.getElementById("proveedorFactura");
const productoFactura = document.getElementById("productoFactura");
const montoFactura = document.getElementById("montoFactura");
const tipoFactura = document.getElementById("tipoFactura");
const detalleAdicional = document.getElementById("detalleAdicional");
const campoAdicional = document.getElementById("campoAdicional");
const igvFactura = document.getElementById("igvFactura");
const totalFactura = document.getElementById("totalFactura");

const countProveedores = document.getElementById("countProveedores");
const countProductos = document.getElementById("countProductos");
const countFacturas = document.getElementById("countFacturas");

const buscador = document.getElementById("searchInput");
const panelFacturas = document.getElementById("searchResults");

// Modales
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

    if(btn.dataset.target==="facturas") buscador.style.display="block";
    else { buscador.style.display="none"; buscador.value=""; panelFacturas.innerHTML=""; }
  });
});

// ===================== AUXILIARES =====================
async function cargarProveedoresSelect(){
  proveedorFactura.innerHTML = '<option value="">Seleccionar proveedor</option>';
  const snap = await getDocs(colProveedores);
  snap.forEach(d=>{
    const opt = document.createElement("option");
    opt.value = d.data().nombre;
    opt.textContent = d.data().nombre;
    proveedorFactura.appendChild(opt);
  });
}

async function cargarProductosSelect(){
  productoFactura.innerHTML = '<option value="">Seleccionar producto</option>';
  const snap = await getDocs(colProductos);
  snap.forEach(d=>{
    const opt = document.createElement("option");
    opt.value = d.data().nombre;
    opt.textContent = d.data().nombre;
    productoFactura.appendChild(opt);
  });
}

function calcularIGV(){
  const subtotal = parseFloat(montoFactura.value)||0;
  const igv = subtotal*0.18;
  igvFactura.value = igv.toFixed(2);
  totalFactura.value = (subtotal+igv).toFixed(2);
}
montoFactura.addEventListener("input", calcularIGV);

tipoFactura.addEventListener("change", ()=>{
  campoAdicional.style.display = tipoFactura.value==="Nota de Crédito"||tipoFactura.value==="Nota de Débito"?"block":"none";
});

// ===================== PROVEEDORES =====================
formProveedor.addEventListener("submit", async e=>{
  e.preventDefault();
  const data = {
    tipoDocumento: tipoDocumentoProveedor.value,
    numeroDocumento: numeroDocumentoProveedor.value,
    nombre: nombreProveedor.value,
    direccion: direccionProveedor.value,
    telefono: telefonoProveedor.value
  };
  await addDoc(colProveedores, data);
  formProveedor.reset();
});

onSnapshot(colProveedores, snapshot=>{
  tablaProveedores.innerHTML="";
  snapshot.forEach(docu=>{
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.dataset.id = docu.id;
    tr.innerHTML = `
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
  });
  countProveedores.textContent = snapshot.size;
  cargarProveedoresSelect();
});

// ===================== PRODUCTOS =====================
formProducto.addEventListener("submit", async e=>{
  e.preventDefault();
  const data = {
    nombre: nombreProducto.value,
    cantidad: parseInt(cantidadPresentacion.value),
    precio: parseFloat(precioProducto.value),
    moneda: tipoMoneda.value,
    descripcion: descripcionProducto.value
  };
  await addDoc(colProductos, data);
  formProducto.reset();
});

onSnapshot(colProductos, snapshot=>{
  tablaProductos.innerHTML="";
  snapshot.forEach(docu=>{
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.dataset.id = docu.id;
    tr.innerHTML = `
      <td>${d.nombre}</td>
      <td>${d.cantidad}</td>
      <td>${d.moneda==='soles'?'S/. ':'$ '}${d.precio}</td>
      <td>${d.descripcion||""}</td>
      <td>
        <button class="btn-accion editar" data-tipo="producto" data-id="${docu.id}">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="producto" data-nombre="${d.nombre}">🔍</button>
        <button class="btn-accion eliminar" data-tipo="producto" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaProductos.appendChild(tr);
  });
  countProductos.textContent = snapshot.size;
  cargarProductosSelect();
});

// ===================== FACTURAS =====================
formFactura.addEventListener("submit", async e=>{
  e.preventDefault();
  const data = {
    idFactura: idFactura.value,
    fecha: fechaFactura.value,
    proveedor: proveedorFactura.value,
    producto: productoFactura.value,
    monto: parseFloat(montoFactura.value),
    igv: parseFloat(igvFactura.value),
    total: parseFloat(totalFactura.value),
    tipo: tipoFactura.value,
    detalleAdicional: detalleAdicional.value||'',
    moneda: tipoMoneda.value
  };
  await addDoc(colFacturas,data);
  formFactura.reset();
  campoAdicional.style.display='none';
});

onSnapshot(colFacturas, snapshot=>{
  tablaFacturas.innerHTML="";
  snapshot.forEach(docu=>{
    const f = docu.data();
    const tr = document.createElement("tr");
    tr.dataset.id = docu.id;
    tr.innerHTML = `
      <td>${f.idFactura}</td>
      <td>${f.fecha}</td>
      <td>${f.proveedor}</td>
      <td>${f.producto}</td>
      <td>${f.moneda==='soles'?'S/. ':'$ '}${f.monto}</td>
      <td>${f.tipo}</td>
      <td>
        <button class="btn-accion editar" data-tipo="factura" data-id="${docu.id}">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="factura" data-id="${docu.id}">🔍</button>
        <button class="btn-accion eliminar" data-tipo="factura" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  });
  countFacturas.textContent = snapshot.size;
});

// ===================== BUSCADOR =====================
buscador.addEventListener("input", async ()=>{
  const texto = buscador.value.trim().toLowerCase();
  panelFacturas.innerHTML="";
  if(!texto) return;
  const snap = await getDocs(colFacturas);
  snap.forEach(docu=>{
    const f = docu.data();
    if(f.producto.toLowerCase().includes(texto)){
      const div = document.createElement("div");
      div.className="resultado-item";
      div.textContent=f.idFactura;
      div.addEventListener("click",()=>mostrarModalFactura(f));
      panelFacturas.appendChild(div);
    }
  });
});

// ===================== MODALES =====================
function mostrarModalFactura(f){
  modalFacturaBody.innerHTML = `
    <h3>Factura ${f.idFactura}</h3>
    <p><b>Fecha:</b> ${f.fecha}</p>
    <p><b>Proveedor:</b> ${f.proveedor}</p>
    <p><b>Producto:</b> ${f.producto}</p>
    <p><b>Monto:</b> ${f.moneda==='soles'?'S/. ':'$ '}${f.monto}</p>
    <p><b>IGV:</b> ${f.igv}</p>
    <p><b>Total:</b> ${f.total}</p>
    <p><b>Tipo:</b> ${f.tipo}</p>
    <p><b>Detalle adicional:</b> ${f.detalleAdicional||''}</p>
  `;
  modalFactura.showModal();
}

cerrarModalFactura.addEventListener("click", ()=>modalFactura.close());
cerrarModalExtra.addEventListener("click", ()=>modalExtra.close());
cerrarModalEditar.addEventListener("click", ()=>modalEditar.close());

// ===================== CLICK GLOBAL =====================
document.addEventListener("click", async e=>{
  const target = e.target;

  // ---------- EDITAR ----------
  if(target.classList.contains("editar")){
    const tipo = target.dataset.tipo;
    const id = target.dataset.id;
    const colName = tipo==="proveedor"?"proveedores":tipo==="producto"?"productos":"facturas";
    const docRef = doc(db,colName,id);
    const snap = await getDocs(query(collection(db,colName), where("__name__","==",id)));
    if(!snap.empty){
      const d = snap.docs[0].data();
      modalEditarBody.innerHTML = `
        <h5>Editar ${tipo}</h5>
        ${tipo==="proveedor"?`
          <label>Tipo Documento</label><input class="form-control mb-1" id="editTipoDoc" value="${d.tipoDocumento||''}">
          <label>Número Documento</label><input class="form-control mb-1" id="editNumDoc" value="${d.numeroDocumento||''}">
          <label>Nombre</label><input class="form-control mb-1" id="editNombre" value="${d.nombre||''}">
          <label>Dirección</label><input class="form-control mb-1" id="editDir" value="${d.direccion||''}">
          <label>Teléfono</label><input class="form-control mb-1" id="editTel" value="${d.telefono||''}">`: 
        tipo==="producto"?`
          <label>Nombre</label><input class="form-control mb-1" id="editNombre" value="${d.nombre||''}">
          <label>Cantidad</label><input type="number" class="form-control mb-1" id="editCantidad" value="${d.cantidad||0}">
          <label>Precio</label><input type="number" step="0.01" class="form-control mb-1" id="editPrecio" value="${d.precio||0}">
          <label>Moneda</label>
          <select class="form-select mb-1" id="editMoneda">
            <option value="soles" ${d.moneda==='soles'?'selected':''}>Soles</option>
            <option value="dolares" ${d.moneda==='dolares'?'selected':''}>Dólares</option>
          </select>
          <label>Descripción</label><textarea class="form-control mb-1" id="editDesc">${d.descripcion||''}</textarea>`:
        tipo==="factura"?`
          <label>ID Factura</label><input class="form-control mb-1" id="editId" value="${d.idFactura||''}">
          <label>Fecha</label><input type="date" class="form-control mb-1" id="editFecha" value="${d.fecha||''}">
          <label>Proveedor</label><input class="form-control mb-1" id="editProv" value="${d.proveedor||''}">
          <label>Producto</label><input class="form-control mb-1" id="editProd" value="${d.producto||''}">
          <label>Monto</label><input type="number" step="0.01" class="form-control mb-1" id="editMonto" value="${d.monto||0}">
          <label>Tipo</label><input class="form-control mb-1" id="editTipo" value="${d.tipo||''}">`:``}
        <button id="guardarEdit" class="btn btn-primary mt-2">Guardar</button>
      `;
      modalEditar.showModal();

      document.getElementById("guardarEdit").onclick = async ()=>{
        const upd = {};
        if(tipo==="proveedor"){
          upd.tipoDocumento = document.getElementById("editTipoDoc").value;
          upd.numeroDocumento = document.getElementById("editNumDoc").value;
          upd.nombre = document.getElementById("editNombre").value;
          upd.direccion = document.getElementById("editDir").value;
          upd.telefono = document.getElementById("editTel").value;
        } else if(tipo==="producto"){
          upd.nombre = document.getElementById("editNombre").value;
          upd.cantidad = parseInt(document.getElementById("editCantidad").value);
          upd.precio = parseFloat(document.getElementById("editPrecio").value);
          upd.moneda = document.getElementById("editMoneda").value;
          upd.descripcion = document.getElementById("editDesc").value;
        } else if(tipo==="factura"){
          upd.idFactura = document.getElementById("editId").value;
          upd.fecha = document.getElementById("editFecha").value;
          upd.proveedor = document.getElementById("editProv").value;
          upd.producto = document.getElementById("editProd").value;
          upd.monto = parseFloat(document.getElementById("editMonto").value);
          upd.tipo = document.getElementById("editTipo").value;
        }
        await updateDoc(docRef, upd);
        modalEditar.close();
      }
    }
  }

  // ---------- VER DETALLES ----------
  if(target.classList.contains("link-info")){
    const tipo = target.dataset.tipo;
    const nombre = target.dataset.nombre;
    let colRef = tipo==="proveedor"?colProveedores:colProductos;
    const snap = await getDocs(query(colRef,where("nombre","==",nombre)));
    if(!snap.empty){
      const d = snap.docs[0].data();
      modalExtraBody.innerHTML = tipo==="proveedor"?
        `<h3>${d.nombre}</h3><p>${d.tipoDocumento} - ${d.numeroDocumento}</p><p>${d.direccion||''}</p><p>${d.telefono||''}</p>`:
        `<h3>${d.nombre}</h3><p>Cantidad: ${d.cantidad}</p><p>Precio: ${d.moneda==='soles'?'S/. ':'$ '}${d.precio}</p><p>${d.descripcion||''}</p>`;
      modalExtra.showModal();
    }
  }

  // ---------- ELIMINAR ----------
  if(target.classList.contains("eliminar")){
    const tipo = target.dataset.tipo;
    const id = target.dataset.id;
    if(confirm("¿Eliminar registro?")){
      await deleteDoc(doc(db,tipo==="proveedor"?"proveedores":tipo==="producto"?"productos":"facturas",id));
    }
  }
});




