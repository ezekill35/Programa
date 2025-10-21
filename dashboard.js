// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, onSnapshot, doc, deleteDoc, query, where, updateDoc 
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

// ===================== PANEL FLOTANTE =====================
const panelFlotante = document.createElement("div");
panelFlotante.style.position = "fixed";
panelFlotante.style.top = "0";
panelFlotante.style.right = "-400px";
panelFlotante.style.width = "350px";
panelFlotante.style.height = "100%";
panelFlotante.style.background = "#fff";
panelFlotante.style.boxShadow = "-4px 0 20px rgba(0,0,0,0.2)";
panelFlotante.style.padding = "1rem";
panelFlotante.style.transition = "right 0.3s";
panelFlotante.style.overflowY = "auto";
document.body.appendChild(panelFlotante);

const cerrarPanel = document.createElement("button");
cerrarPanel.textContent = "Cerrar";
cerrarPanel.className = "btn btn-secondary mt-2";
cerrarPanel.addEventListener("click", () => { panelFlotante.style.right = "-400px"; });

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
    buscador.style.display = btn.dataset.target === "facturas" ? "block" : "none";
    if(btn.dataset.target !== "facturas") { buscador.value=""; panelFacturas.innerHTML=""; }
  });
});

// ===================== AUXILIARES =====================
function calcularIGV(subtotal){ return (subtotal*0.18).toFixed(2); }
function calcularTotal(subtotal){ return (subtotal*1.18).toFixed(2); }

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

// ===================== MOSTRAR MODAL FACTURA =====================
function mostrarModalFactura(f){
  const igv = calcularIGV(f.monto);
  const total = calcularTotal(f.monto);

  modalFacturaBody.innerHTML = `
    <h3 class="text-sky-600 font-bold text-lg mb-2">Factura ${f.idFactura}</h3>
    <p><b>Fecha:</b> ${f.fecha}</p>
    <p><b>Proveedor:</b> <span class="link-info ver-detalle" data-tipo="proveedor" data-nombre="${f.proveedor}">${f.proveedor}</span></p>
    <p><b>Producto:</b> <span class="link-info ver-detalle" data-tipo="producto" data-nombre="${f.producto}">${f.producto}</span></p>
    <p><b>Subtotal:</b> S/. ${parseFloat(f.monto).toFixed(2)}</p>
    <p><b>IGV:</b> S/. ${igv}</p>
    <p><b>Total:</b> S/. ${total}</p>
    <p><b>Tipo:</b> ${f.tipo}</p>
  `;

  modalFactura.showModal();

  // ===================== LISTENER DINÁMICO =====================
  modalFacturaBody.querySelectorAll(".ver-detalle").forEach(el => {
    el.addEventListener("click", async () => {
      const tipo = el.dataset.tipo;
      const nombre = el.dataset.nombre;
      let snap;
      if(tipo==="proveedor") snap = await getDocs(query(colProveedores, where("nombre","==",nombre)));
      if(tipo==="producto") snap = await getDocs(query(colProductos, where("nombre","==",nombre)));
      
      if(!snap.empty){
        const d = snap.docs[0].data();
        if(tipo==="proveedor"){
          panelFlotante.innerHTML = `
            <h5>Proveedor: ${d.nombre}</h5>
            <p><b>Tipo Documento:</b> ${d.tipoDocumento||''}</p>
            <p><b>RUC / DNI:</b> ${d.ruc||''}</p>
            <p><b>Dirección:</b> ${d.direccion||''}</p>
            <p><b>Teléfono:</b> ${d.telefono||''}</p>
          `;
        } else if(tipo==="producto"){
          panelFlotante.innerHTML = `
            <h5>Producto: ${d.nombre}</h5>
            <p><b>Presentación:</b> ${d.cantidad} ${d.presentacion||''}</p>
            <p><b>Precio:</b> S/. ${parseFloat(d.precio).toFixed(2)}</p>
            <p><b>Descripción:</b> ${d.descripcion||''}</p>
          `;
        }
        panelFlotante.appendChild(cerrarPanel);
        panelFlotante.style.right="0";
      }
    });
  });
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
    ruc: document.getElementById("rucProveedor").value.trim(),
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
      <td>${d.tipoDocumento||''}</td>
      <td>${d.ruc||''}</td>
      <td>${d.nombre||''}</td>
      <td>${d.direccion||''}</td>
      <td>${d.telefono||''}</td>
      <td>
        <button class="editar btn-accion" data-id="${docu.id}" data-tipo="proveedor">✏️</button>
        <button class="eliminar btn-accion" data-id="${docu.id}" data-tipo="proveedor">🗑️</button>
      </td>
    `;
    tablaProveedores.appendChild(tr);
  });
  countProveedores.textContent = snapshot.size;
  cargarProveedoresSelect();
});

// ===================== PRODUCTOS =====================
formProducto.addEventListener("submit", async e=>{
  e.preventDefault();
  const data = {
    nombre: document.getElementById("nombreProducto").value.trim(),
    presentacion: document.getElementById("presentacionProducto").value,
    cantidad: parseInt(document.getElementById("cantidadPresentacion").value),
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
      <td>${d.nombre||''}</td>
      <td>${d.cantidad} ${d.presentacion||''}</td>
      <td>S/. ${parseFloat(d.precio||0).toFixed(2)}</td>
      <td>${d.descripcion||''}</td>
      <td>
        <button class="editar btn-accion" data-id="${docu.id}" data-tipo="producto">✏️</button>
        <button class="eliminar btn-accion" data-id="${docu.id}" data-tipo="producto">🗑️</button>
      </td>
    `;
    tablaProductos.appendChild(tr);
  });
  countProductos.textContent = snapshot.size;
  cargarProductosSelect();
});

// ===================== FACTURAS =====================
formFactura.addEventListener("submit", async e=>{
  e.preventDefault();
  const data = {
    idFactura: "F"+Date.now(),
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
    const f = docu.data();
    const igv = calcularIGV(f.monto);
    const total = calcularTotal(f.monto);
    const tr=document.createElement("tr");
    tr.dataset.id=docu.id;
    tr.innerHTML=`
      <td>${f.idFactura||''}</td>
      <td>${f.fecha||''}</td>
      <td><span class="link-info ver-detalle" data-tipo="proveedor" data-nombre="${f.proveedor}">${f.proveedor||''}</span></td>
      <td><span class="link-info ver-detalle" data-tipo="producto" data-nombre="${f.producto}">${f.producto||''}</span></td>
      <td>S/. ${parseFloat(f.monto||0).toFixed(2)}</td>
      <td>S/. ${igv}</td>
      <td>S/. ${total}</td>
      <td>${f.tipo||''}</td>
      <td>
        <button class="editar btn-accion" data-id="${docu.id}" data-tipo="factura">✏️</button>
        <button class="eliminar btn-accion" data-id="${docu.id}" data-tipo="factura">🗑️</button>
      </td>
    `;
    tablaFacturas.appendChild(tr);

    // click en tabla de facturas para abrir modal
    tr.querySelectorAll(".ver-detalle").forEach(el=>{
      el.addEventListener("click", async ()=>{
        const tipo = el.dataset.tipo;
        const nombre = el.dataset.nombre;
        let snap;
        if(tipo==="proveedor") snap = await getDocs(query(colProveedores, where("nombre","==",nombre)));
        if(tipo==="producto") snap = await getDocs(query(colProductos, where("nombre","==",nombre)));
        if(!snap.empty){
          const d = snap.docs[0].data();
          panelFlotante.innerHTML = tipo==="proveedor" ? `
            <h5>Proveedor: ${d.nombre}</h5>
            <p><b>Tipo Documento:</b> ${d.tipoDocumento||''}</p>
            <p><b>RUC / DNI:</b> ${d.ruc||''}</p>
            <p><b>Dirección:</b> ${d.direccion||''}</p>
            <p><b>Teléfono:</b> ${d.telefono||''}</p>
          ` : `
            <h5>Producto: ${d.nombre}</h5>
            <p><b>Presentación:</b> ${d.cantidad} ${d.presentacion||''}</p>
            <p><b>Precio:</b> S/. ${parseFloat(d.precio).toFixed(2)}</p>
            <p><b>Descripción:</b> ${d.descripcion||''}</p>
          `;
          panelFlotante.appendChild(cerrarPanel);
          panelFlotante.style.right="0";
        }
      });
    });
  });
  countFacturas.textContent = snapshot.size;
});

// ===================== BUSCADOR =====================
buscador.style.display="none";
buscador.addEventListener("input", async ()=>{
  const texto = buscador.value.trim().toLowerCase();
  panelFacturas.innerHTML="";
  if(!texto) return;
  const snap = await getDocs(colFacturas);
  snap.forEach(docu=>{
    const f = docu.data();
    if(f.producto.toLowerCase().includes(texto) || f.proveedor.toLowerCase().includes(texto) || f.idFactura.toLowerCase().includes(texto)){
      const div = document.createElement("div");
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
    const snap = await getDocs(query(collection(db, colNombre), where("__name__","==",id)));
    if(!snap.empty){
      const d = snap.docs[0].data();
      modalEditarBody.innerHTML = `
        <h5>Editar ${tipo}</h5>
        ${tipo==="proveedor"?`
          <label>RUC</label><input id="editRuc" class="form-control mb-1" value="${d.ruc||''}">
          <label>Nombre</label><input id="editNombre" class="form-control mb-1" value="${d.nombre||''}">
          <label>Dirección</label><input id="editDir" class="form-control mb-1" value="${d.direccion||''}">
          <label>Teléfono</label><input id="editTel" class="form-control mb-1" value="${d.telefono||''}">`:
        tipo==="producto"?`
          <label>Nombre</label><input id="editNombre" class="form-control mb-1" value="${d.nombre||''}">
          <label>Cantidad</label><input id="editCantidad" type="number" class="form-control mb-1" value="${d.cantidad||0}">
          <label>Presentación</label><input id="editPresentacion" class="form-control mb-1" value="${d.presentacion||''}">
          <label>Precio</label><input id="editPrecio" type="number" step="0.01" class="form-control mb-1" value="${d.precio||0}">
          <label>Descripción</label><textarea id="editDesc" class="form-control mb-1">${d.descripcion||''}</textarea>`:
        tipo==="factura"?`
          <label>ID</label><input id="editId" class="form-control mb-1" value="${d.idFactura||''}">
          <label>Fecha</label><input id="editFecha" type="date" class="form-control mb-1" value="${d.fecha||''}">
          <label>Proveedor</label><input id="editProv" class="form-control mb-1" value="${d.proveedor||''}">
          <label>Producto</label><input id="editProd" class="form-control mb-1" value="${d.producto||''}">
          <label>Monto</label><input id="editMonto" type="number" step="0.01" class="form-control mb-1" value="${d.monto||0}">
          <label>Tipo</label><input id="editTipo" class="form-control mb-1" value="${d.tipo||''}">`:``}
        <button id="guardarEdit" class="btn btn-primary mt-2">Guardar</button>
      `;
      modalEditar.showModal();

      const btnGuardar = document.getElementById("guardarEdit");
      btnGuardar.replaceWith(btnGuardar.cloneNode(true));
      document.getElementById("guardarEdit").addEventListener("click", async ()=>{
        const upd = {};
        if(tipo==="proveedor"){
          upd.ruc=document.getElementById("editRuc").value.trim();
          upd.nombre=document.getElementById("editNombre").value.trim();
          upd.direccion=document.getElementById("editDir").value.trim();
          upd.telefono=document.getElementById("editTel").value.trim();
        } else if(tipo==="producto"){
          upd.nombre=document.getElementById("editNombre").value.trim();
          upd.cantidad=parseInt(document.getElementById("editCantidad").value);
          upd.presentacion=document.getElementById("editPresentacion").value;
          upd.precio=parseFloat(document.getElementById("editPrecio").value);
          upd.descripcion=document.getElementById("editDesc").value.trim();
        } else if(tipo==="factura"){
          upd.idFactura=document.getElementById("editId").value.trim();
          upd.fecha=document.getElementById("editFecha").value;
          upd.proveedor=document.getElementById("editProv").value.trim();
          upd.producto=document.getElementById("editProd").value.trim();
          upd.monto=parseFloat(document.getElementById("editMonto").value);
          upd.tipo=document.getElementById("editTipo").value.trim();
        }
        await updateDoc(doc(db,colNombre,id),upd);
        modalEditar.close();
      });
    }
  }

  // --------- ELIMINAR ---------
  if(e.target.classList.contains("eliminar")){
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    let colNombre = tipo==="proveedor"?"proveedores":tipo==="producto"?"productos":"facturas";
    await deleteDoc(doc(db,colNombre,id));
  }
});


