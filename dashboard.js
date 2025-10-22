// dashboard.js (actualizado)
// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, query, where, updateDoc, orderBy
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

const buscador = document.getElementById("searchInput"); // header search
const panelFacturas = document.getElementById("searchResults");

// modales/dialogs
const modalFactura = document.getElementById("modalFactura");
const modalFacturaBody = document.getElementById("modalFacturaBody");
const cerrarModalFactura = document.getElementById("cerrarModalFactura");

const modalExtra = document.getElementById("modalExtra");
const modalExtraBody = document.getElementById("modalExtraBody");
const cerrarModalExtra = document.getElementById("cerrarModalExtra");

const modalEditar = document.getElementById("modalEditar");
const modalEditarBody = document.getElementById("modalEditarBody");
const cerrarModalEditar = document.getElementById("cerrarModalEditar");

// Factura form fields
const idFacturaInput = document.getElementById("idFactura"); // readonly field shown but will be set on submit
const fechaFacturaInput = document.getElementById("fechaFactura");
const tipoFacturaInput = document.getElementById("tipoFactura");
const proveedorFacturaSelect = document.getElementById("proveedorFactura");
const productoFacturaSelect = document.getElementById("productoFactura");
const campoAdicional = document.getElementById("campoAdicional");
const detalleAdicionalInput = document.getElementById("detalleAdicional");
const montoFacturaInput = document.getElementById("montoFactura");
const igvFacturaInput = document.getElementById("igvFactura");
const totalFacturaInput = document.getElementById("totalFactura");

// ===================== AUTENTICACIÓN =====================
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
});

// cerrar sesión
const btnCerrar = document.getElementById("btnCerrarSesion");
if (btnCerrar) btnCerrar.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ===================== AUXILIARES =====================

// generar ID formato FAC-YYYYMMDD-XXX (XXX aleatorio o secuencial simple)
function generarIdFactura() {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const rnd = Math.floor(Math.random() * 900) + 100; // 100-999
  return `FAC-${año}${mes}${dia}-${rnd}`;
}

// cargar selects de proveedores y productos (para el form de facturas)
async function cargarProveedoresSelect(){
  proveedorFacturaSelect.innerHTML = '<option value="">Seleccionar proveedor</option>';
  const snap = await getDocs(colProveedores);
  snap.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.data().nombre || "";
    opt.textContent = d.data().nombre || "";
    proveedorFacturaSelect.appendChild(opt);
  });
}

async function cargarProductosSelect(){
  productoFacturaSelect.innerHTML = '<option value="">Seleccionar producto</option>';
  const snap = await getDocs(colProductos);
  snap.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.data().nombre || "";
    opt.textContent = d.data().nombre || "";
    productoFacturaSelect.appendChild(opt);
  });
}

// mostrar modal de factura (detalle)
function mostrarModalFactura(f){
  modalFacturaBody.innerHTML = `
    <h3 class="text-sky-600 font-bold text-lg mb-2">Factura ${f.idFactura}</h3>
    <p><b>Fecha:</b> ${f.fecha}</p>
    <p><b>Proveedor:</b> <span class="link-info">${f.proveedor}</span></p>
    <p><b>Producto:</b> <span class="link-info">${f.producto}</span></p>
    <p><b>Subtotal:</b> ${f.moneda==='soles' ? 'S/. ' : '$ '}${(f.subtotal||0).toFixed(2)}</p>
    <p><b>IGV (18%):</b> ${f.moneda==='soles' ? 'S/. ' : '$ '}${(f.igv||0).toFixed(2)}</p>
    <p><b>Total:</b> ${f.moneda==='soles' ? 'S/. ' : '$ '}${(f.total||0).toFixed(2)}</p>
    <p><b>Tipo:</b> ${f.tipo}</p>
  `;
  if(typeof modalFactura.showModal === 'function') modalFactura.showModal();
  else alert("Detalle:\n" + JSON.stringify(f, null, 2));
}

// cerrar modales
if(cerrarModalFactura) cerrarModalFactura.addEventListener("click", ()=> modalFactura.close());
if(cerrarModalExtra) cerrarModalExtra.addEventListener("click", ()=> modalExtra.close());
if(cerrarModalEditar) cerrarModalEditar.addEventListener("click", ()=> modalEditar.close());

// ===================== PROVEEDORES =====================
// registrar proveedor
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

// proveedores en tiempo real + actualizar select
onSnapshot(colProveedores, snapshot=>{
  tablaProveedores.innerHTML="";
  proveedorFacturaSelect.innerHTML = '<option value="">Seleccionar proveedor</option>';
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
    proveedorFacturaSelect.appendChild(opt);
  });
  countProveedores.textContent=snapshot.size;
});

// ===================== PRODUCTOS =====================
// registrar producto
formProducto.addEventListener("submit", async e=>{
  e.preventDefault();
  const data = {
    nombre: document.getElementById("nombreProducto").value.trim(),
    presentacion: document.getElementById("presentacionProducto").value,
    cantidad: parseInt(document.getElementById("cantidadPresentacion").value) || 0,
    precio: parseFloat(document.getElementById("precioProducto").value) || 0,
    moneda: document.getElementById("tipoMoneda").value,
    descripcion: document.getElementById("descripcionProducto").value.trim()
  };
  await addDoc(colProductos, data);
  formProducto.reset();
});

// productos en tiempo real + actualizar select
onSnapshot(colProductos, snapshot=>{
  tablaProductos.innerHTML="";
  productoFacturaSelect.innerHTML = '<option value="">Seleccionar producto</option>';
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
    productoFacturaSelect.appendChild(opt);
  });
  countProductos.textContent=snapshot.size;
});

// ===================== FACTURAS =====================

// calcular IGV y total automáticamente al escribir monto
montoFacturaInput.addEventListener("input", ()=>{
  const subtotal = parseFloat(montoFacturaInput.value) || 0;
  const igv = +(subtotal * 0.18);
  const total = subtotal + igv;
  igvFacturaInput.value = igv.toFixed(2);
  totalFacturaInput.value = total.toFixed(2);
});

// mostrar/ocultar campo adicional si tipo es nota...
tipoFacturaInput.addEventListener("change", ()=>{
  const tipo = tipoFacturaInput.value;
  if(tipo.toLowerCase().includes("nota")) campoAdicional.style.display = "block";
  else { campoAdicional.style.display = "none"; detalleAdicionalInput.value=""; }
});

// registrar factura (genera ID solo al registrar)
formFactura.addEventListener("submit", async e=>{
  e.preventDefault();

  // generar id justo al registrar
  const nuevoId = generarIdFactura();
  idFacturaInput.value = nuevoId;

  const subtotal = parseFloat(montoFacturaInput.value) || 0;
  const igv = +(subtotal * 0.18);
  const total = +(subtotal + igv);

  const data = {
    idFactura: idFacturaInput.value || nuevoId,
    fecha: fechaFacturaInput.value,
    proveedor: proveedorFacturaSelect.value,
    producto: productoFacturaSelect.value,
    subtotal: subtotal,
    igv: igv,
    total: total,
    tipo: tipoFacturaInput.value,
    detalleAdicional: detalleAdicionalInput.value || "",
    moneda: "soles", // mantengo por defecto; puedes añadir select si quieres
    createdAt: new Date()
  };

  await addDoc(colFacturas, data);
  formFactura.reset();
  // limpiar campo ID (porque el usuario pidió generar solo al registrar)
  idFacturaInput.value = "";
});

// facturas en tiempo real (listado)
onSnapshot(query(colFacturas, orderBy("createdAt", "desc")), snapshot=>{
  tablaFacturas.innerHTML="";
  snapshot.forEach(docu=>{
    const f = docu.data();
    const tr=document.createElement("tr");
    tr.dataset.id = docu.id;
    tr.innerHTML = `
      <td>${f.idFactura || ""}</td>
      <td>${f.fecha || ""}</td>
      <td>${f.proveedor || ""}</td>
      <td>${f.producto || ""}</td>
      <td>${(f.subtotal||0).toFixed(2)}</td>
      <td>${(f.igv||0).toFixed(2)}</td>
      <td>${(f.total||0).toFixed(2)}</td>
      <td>${f.tipo || ""}</td>
      <td>
        <button class="btn-accion editar" data-tipo="factura" data-id="${docu.id}">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="factura" data-id="${docu.id}">🔍</button>
        <button class="btn-accion eliminar" data-tipo="factura" data-id="${docu.id}">🗑️</button>
      </td>
    `;
    tablaFacturas.appendChild(tr);
  });
  countFacturas.textContent = snapshot.size;
});

// ===================== BUSCADOR AVANZADO =====================
// usa el input global #searchInput
buscador.addEventListener("input", async ()=>{
  const texto = buscador.value.trim().toLowerCase();
  panelFacturas.innerHTML = "";
  if(!texto) return;

  // traemos todas las facturas (no ideal para +10k, pero OK para un dashboard simple)
  const snap = await getDocs(colFacturas);
  snap.forEach(docu=>{
    const f = docu.data();
    // algunos campos pueden ser undefined; convertimos a string
    const idF = (f.idFactura||"").toLowerCase();
    const proveedor = (f.proveedor||"").toLowerCase();
    const producto = (f.producto||"").toLowerCase();
    const tipo = (f.tipo||"").toLowerCase();
    const fecha = (f.fecha||"").toLowerCase();

    if(idF.includes(texto) || proveedor.includes(texto) || producto.includes(texto) || tipo.includes(texto) || fecha.includes(texto)){
      const div = document.createElement("div");
      div.className = "resultado-item";
      div.innerHTML = `<b>${f.idFactura||'ID no asignado'}</b> — ${f.proveedor||''} — ${f.producto||''}`;
      div.addEventListener("click", ()=>{
        mostrarModalFactura(f);
      });
      panelFacturas.appendChild(div);
    }
  });
});

// ===================== CLICK GLOBAL para EDITAR / ELIMINAR / VER =====================
document.addEventListener("click", async e=>{
  // --- EDITAR ---
  if(e.target.classList.contains("editar")){
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;

    if(tipo === "proveedor" || tipo === "producto"){
      // traer doc por id
      const snap = await getDocs(query(tipo === "proveedor" ? colProveedores : colProductos, where("__name__", "==", id)));
      if(!snap.empty){
        const d = snap.docs[0].data();
        modalEditarBody.innerHTML = `
          <h5>Editar ${tipo}</h5>
          ${tipo==="proveedor" ? `
            <label>Tipo Doc</label><input id="editTipoDoc" class="form-control mb-1" value="${d.tipoDocumento||''}">
            <label>Número Doc</label><input id="editNumDoc" class="form-control mb-1" value="${d.numeroDocumento||''}">
            <label>Nombre</label><input id="editNombre" class="form-control mb-1" value="${d.nombre||''}">
            <label>Dirección</label><input id="editDir" class="form-control mb-1" value="${d.direccion||''}">
            <label>Teléfono</label><input id="editTel" class="form-control mb-1" value="${d.telefono||''}">
          ` : `
            <label>Nombre</label><input id="editNombre" class="form-control mb-1" value="${d.nombre||''}">
            <label>Presentación</label><input id="editPresent" class="form-control mb-1" value="${d.presentacion||''}">
            <label>Cantidad</label><input id="editCantidad" type="number" class="form-control mb-1" value="${d.cantidad||0}">
            <label>Precio</label><input id="editPrecio" type="number" step="0.01" class="form-control mb-1" value="${d.precio||0}">
            <label>Moneda</label>
            <select id="editMoneda" class="form-select mb-1">
              <option value="soles" ${d.moneda==='soles'?'selected':''}>Soles</option>
              <option value="dolares" ${d.moneda==='dolares'?'selected':''}>Dólares</option>
            </select>
            <label>Descripción</label><textarea id="editDesc" class="form-control mb-1">${d.descripcion||''}</textarea>
          `}
          <button id="guardarEdicion" class="btn btn-primary mt-2">Guardar cambios</button>
        `;
        if(typeof modalEditar.showModal === 'function') modalEditar.showModal();

        document.getElementById("guardarEdicion").addEventListener("click", async () => {
          const dataActualizada = {};
          if(tipo==="proveedor"){
            dataActualizada.tipoDocumento = document.getElementById("editTipoDoc").value;
            dataActualizada.numeroDocumento = document.getElementById("editNumDoc").value;
            dataActualizada.nombre = document.getElementById("editNombre").value;
            dataActualizada.direccion = document.getElementById("editDir").value;
            dataActualizada.telefono = document.getElementById("editTel").value;
          } else {
            dataActualizada.nombre = document.getElementById("editNombre").value;
            dataActualizada.presentacion = document.getElementById("editPresent").value;
            dataActualizada.cantidad = parseInt(document.getElementById("editCantidad").value) || 0;
            dataActualizada.precio = parseFloat(document.getElementById("editPrecio").value) || 0;
            dataActualizada.moneda = document.getElementById("editMoneda").value;
            dataActualizada.descripcion = document.getElementById("editDesc").value;
          }
          await updateDoc(doc(db, tipo==="proveedor" ? "proveedores" : "productos", id), dataActualizada);
          modalEditar.close();
        }, { once: true });
      }
    }

    if(tipo === "factura"){
      // editar factura: abrimos modal con campos para editar y guardamos
      const snap = await getDocs(query(colFacturas, where("__name__", "==", id)));
      if(!snap.empty){
        const d = snap.docs[0].data();
        modalEditarBody.innerHTML = `
          <h5>Editar factura</h5>
          <label>ID</label><input id="editIdFactura" class="form-control mb-1" value="${d.idFactura||''}" readonly>
          <label>Fecha</label><input id="editFecha" type="date" class="form-control mb-1" value="${d.fecha||''}">
          <label>Proveedor</label><input id="editProv" class="form-control mb-1" value="${d.proveedor||''}">
          <label>Producto</label><input id="editProd" class="form-control mb-1" value="${d.producto||''}">
          <label>Subtotal</label><input id="editSub" type="number" step="0.01" class="form-control mb-1" value="${d.subtotal||0}">
          <label>IGV</label><input id="editIGV" type="number" step="0.01" class="form-control mb-1" value="${d.igv||0}">
          <label>Total</label><input id="editTotal" type="number" step="0.01" class="form-control mb-1" value="${d.total||0}">
          <label>Tipo</label><input id="editTipo" class="form-control mb-1" value="${d.tipo||''}">
          <button id="guardarEdicionFactura" class="btn btn-primary mt-2">Guardar cambios</button>
        `;
        if(typeof modalEditar.showModal === 'function') modalEditar.showModal();

        document.getElementById("guardarEdicionFactura").addEventListener("click", async ()=>{
          const actualizado = {
            // idFactura no se actualiza por seguridad
            fecha: document.getElementById("editFecha").value,
            proveedor: document.getElementById("editProv").value,
            producto: document.getElementById("editProd").value,
            subtotal: parseFloat(document.getElementById("editSub").value) || 0,
            igv: parseFloat(document.getElementById("editIGV").value) || 0,
            total: parseFloat(document.getElementById("editTotal").value) || 0,
            tipo: document.getElementById("editTipo").value || ""
          };
          await updateDoc(doc(db, "facturas", id), actualizado);
          modalEditar.close();
        }, { once: true });
      }
    }
  }

  // --- ELIMINAR ---
  if(e.target.classList.contains("eliminar")){
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    const colNombre = tipo==="proveedor"?"proveedores":tipo==="producto"?"productos":"facturas";
    if(confirm(`¿Desea eliminar este ${tipo}?`)){
      await deleteDoc(doc(db, colNombre, id));
    }
  }

  // --- VER DETALLE ---
  if(e.target.classList.contains("ver")){
    const tipo = e.target.dataset.tipo;
    if(tipo==="factura"){
      const id = e.target.dataset.id;
      const snap = await getDocs(query(colFacturas, where("__name__","==",id)));
      if(!snap.empty) mostrarModalFactura(snap.docs[0].data());
    } else {
      const nombre = e.target.dataset.nombre;
      modalExtraBody.innerHTML = `<p>${tipo.toUpperCase()}: ${nombre}</p>`;
      if(typeof modalExtra.showModal === 'function') modalExtra.showModal();
    }
  }
});

// ===================== FIN DEL ARCHIVO =====================

