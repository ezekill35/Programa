// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, query, where, updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

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
const contenidoModalFactura = document.getElementById("modalFacturaBody");
const cerrarModalFactura = document.getElementById("cerrarModalFactura");

const modalExtra = document.getElementById("modalExtra");
const modalExtraBody = document.getElementById("modalExtraBody");
const cerrarModalExtra = document.getElementById("cerrarModalExtra");

// ===================== MODAL EDITAR =====================
const modalEditar = document.getElementById("modalEditar");
const formEditar = document.getElementById("formEditar");
const btnCerrarEditar = document.getElementById("btnCerrarEditar");

const editId = document.getElementById("editId");
const editNombre = document.getElementById("editNombre");
const editRuc = document.getElementById("editRuc");
const editDireccion = document.getElementById("editDireccion");
const editTelefono = document.getElementById("editTelefono");

const editCantidad = document.getElementById("editCantidad");
const editPrecio = document.getElementById("editPrecio");
const editDescripcion = document.getElementById("editDescripcion");

const editFecha = document.getElementById("editFecha");
const editProveedorFactura = document.getElementById("editProveedorFactura");
const editProductoFactura = document.getElementById("editProductoFactura");
const editMonto = document.getElementById("editMonto");
const editTipo = document.getElementById("editTipo");

let docEditar = null;
let tipoEditar = "";

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

    // Mostrar buscador solo en facturas
    if(btn.dataset.target === "facturas"){
      buscador.style.display = "block";
    } else {
      buscador.style.display = "none";
      buscador.value = "";
      panelFacturas.innerHTML = "";
    }
  });
});

// ===================== AUXILIARES =====================
async function cargarProveedoresSelect(selectElement){
  selectElement.innerHTML = '<option value="">Seleccionar proveedor</option>';
  const snap = await getDocs(colProveedores);
  snap.forEach(docu => {
    const d = docu.data();
    const opt = document.createElement("option");
    opt.value = d.nombre;
    opt.textContent = d.nombre;
    selectElement.appendChild(opt);
  });
}

async function cargarProductosSelect(selectElement){
  selectElement.innerHTML = '<option value="">Seleccionar producto</option>';
  const snap = await getDocs(colProductos);
  snap.forEach(docu => {
    const d = docu.data();
    const opt = document.createElement("option");
    opt.value = d.nombre;
    opt.textContent = d.nombre;
    selectElement.appendChild(opt);
  });
}

function mostrarModalFactura(f) {
  contenidoModalFactura.innerHTML = `
    <h3 class="text-sky-600 font-bold text-lg mb-2">Factura ${f.idFactura}</h3>
    <p><b>Fecha:</b> ${f.fecha}</p>
    <p><b>Proveedor:</b> <span class="link-info" data-tipo="proveedor" data-nombre="${f.proveedor}" style="color:#f97316;">${f.proveedor}</span></p>
    <p><b>Producto:</b> <span class="link-info" data-tipo="producto" data-nombre="${f.producto}" style="color:#14b8a6;">${f.producto}</span></p>
    <p><b>Monto:</b> S/. ${f.monto}</p>
    <p><b>Tipo:</b> ${f.tipo}</p>`;
  modalFactura.showModal();
}

// ===================== CERRAR MODALES =====================
cerrarModalFactura.addEventListener("click", () => modalFactura.close());
cerrarModalExtra.addEventListener("click", () => modalExtra.close());
btnCerrarEditar.addEventListener("click", () => modalEditar.close());

// ===================== CRUD PROVEEDORES =====================
formProveedor.addEventListener("submit", async e => {
  e.preventDefault();
  await addDoc(colProveedores,{
    ruc: document.getElementById("rucProveedor").value.trim(),
    nombre: document.getElementById("nombreProveedor").value.trim(),
    direccion: document.getElementById("direccionProveedor").value.trim(),
    telefono: document.getElementById("telefonoProveedor").value.trim()
  });
  formProveedor.reset();
});

onSnapshot(colProveedores,snapshot=>{
  tablaProveedores.innerHTML="";
  snapshot.forEach(docu=>{
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.dataset.id = docu.id;
    tr.innerHTML=`
      <td>${d.ruc}</td>
      <td>${d.nombre}</td>
      <td>${d.direccion||""}</td>
      <td>${d.telefono||""}</td>
      <td>
        <button class="btn-accion eliminar" data-id="${docu.id}" data-tipo="proveedor">🗑️</button>
        <button class="btn-accion editar" data-id="${docu.id}" data-tipo="proveedor">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="proveedor" data-nombre="${d.nombre}">🔍</button>
      </td>`;
    tablaProveedores.appendChild(tr);
  });
  countProveedores.textContent = snapshot.size;
});

// ===================== CRUD PRODUCTOS =====================
formProducto.addEventListener("submit", async e => {
  e.preventDefault();
  await addDoc(colProductos,{
    nombre: document.getElementById("nombreProducto").value.trim(),
    cantidad: parseInt(document.getElementById("cantidadProducto").value),
    precio: parseFloat(document.getElementById("precioProducto").value),
    descripcion: document.getElementById("descripcionProducto").value.trim()
  });
  formProducto.reset();
});

onSnapshot(colProductos,snapshot=>{
  tablaProductos.innerHTML="";
  snapshot.forEach(docu=>{
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.dataset.id = docu.id;
    tr.innerHTML=`
      <td>${d.nombre}</td>
      <td>${d.cantidad}</td>
      <td>${d.precio}</td>
      <td>${d.descripcion||""}</td>
      <td>
        <button class="btn-accion eliminar" data-id="${docu.id}" data-tipo="producto">🗑️</button>
        <button class="btn-accion editar" data-id="${docu.id}" data-tipo="producto">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="producto" data-nombre="${d.nombre}">🔍</button>
      </td>`;
    tablaProductos.appendChild(tr);
  });
  countProductos.textContent = snapshot.size;
});

// ===================== CRUD FACTURAS =====================
formFactura.addEventListener("submit", async e=>{
  e.preventDefault();
  await addDoc(colFacturas,{
    idFactura: document.getElementById("idFactura").value.trim(),
    fecha: document.getElementById("fechaFactura").value,
    proveedor: document.getElementById("proveedorFactura").value,
    producto: document.getElementById("productoFactura").value,
    monto: parseFloat(document.getElementById("montoFactura").value),
    tipo: document.getElementById("tipoFactura").value
  });
  formFactura.reset();
});

onSnapshot(colFacturas,snapshot=>{
  tablaFacturas.innerHTML="";
  snapshot.forEach(docu=>{
    const f = docu.data();
    const tr = document.createElement("tr");
    tr.dataset.id = docu.id;
    tr.innerHTML=`
      <td>${f.idFactura}</td>
      <td>${f.fecha}</td>
      <td>${f.proveedor}</td>
      <td>${f.producto}</td>
      <td>${f.monto}</td>
      <td>${f.tipo}</td>
      <td>
        <button class="btn-accion eliminar" data-id="${docu.id}" data-tipo="factura">🗑️</button>
        <button class="btn-accion editar" data-id="${docu.id}" data-tipo="factura">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="factura">${f.idFactura}</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  });
  countFacturas.textContent = snapshot.size;
});

// ===================== BUSCADOR FACTURAS =====================
buscador.style.display="none";
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
      div.innerHTML=`<strong class="link-info" data-tipo="factura">${f.idFactura}</strong>`;
      div.addEventListener("click",()=>mostrarModalFactura(f));
      panelFacturas.appendChild(div);
    }
  });
});

// ===================== CLICK GLOBAL =====================
document.addEventListener("click", async e=>{
  // ELIMINAR
  if(e.target.classList.contains("eliminar")){
    if(!confirm("¿Seguro que deseas eliminar este registro?")) return;
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    const docRef = tipo==="proveedor"?doc(db,"proveedores",id):tipo==="producto"?doc(db,"productos",id):doc(db,"facturas",id);
    await deleteDoc(docRef);
  }

  // VER DETALLES
  if(e.target.classList.contains("link-info")){
    const tipo = e.target.dataset.tipo;
    if(tipo==="factura"){
      const snap = await getDocs(query(colFacturas,where("idFactura","==",e.target.textContent)));
      if(!snap.empty) mostrarModalFactura(snap.docs[0].data());
      return;
    }
    const nombre = e.target.dataset.nombre;
    const col = tipo==="proveedor"?colProveedores:colProductos;
    const snap = await getDocs(query(col,where("nombre","==",nombre)));
    if(snap.empty){
      modalExtraBody.innerHTML="<p>No se encontró información.</p>";
    } else {
      const d = snap.docs[0].data();
      modalExtraBody.innerHTML = tipo==="proveedor"
        ? `<h4>Proveedor</h4><p><b>Nombre:</b>${d.nombre}</p><p><b>RUC:</b>${d.ruc}</p><p><b>Dirección:</b>${d.direccion}</p><p><b>Teléfono:</b>${d.telefono}</p>`
        : `<h4>Producto</h4><p><b>Nombre:</b>${d.nombre}</p><p><b>Cantidad:</b>${d.cantidad}</p><p><b>Precio:</b> S/. ${d.precio}</p><p><b>Descripción:</b>${d.descripcion}</p>`;
      modalExtra.showModal();
    }
  }

  // EDITAR - ABRIR MODAL
  if(e.target.classList.contains("editar")){
    tipoEditar = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    docEditar = doc(tipoEditar==="proveedor"?db.collection("proveedores"):tipoEditar==="producto"?db.collection("productos"):db.collection("facturas"), id);
    
    // Cargar datos al modal según tipo
    const tr = e.target.closest("tr");
    if(tipoEditar==="proveedor"){
      editRuc.value = tr.children[0].textContent;
      editNombre.value = tr.children[1].textContent;
      editDireccion.value = tr.children[2].textContent;
      editTelefono.value = tr.children[3].textContent;
      modalEditar.showModal();
    } else if(tipoEditar==="producto"){
      editNombre.value = tr.children[0].textContent;
      editCantidad.value = tr.children[1].textContent;
      editPrecio.value = tr.children[2].textContent;
      editDescripcion.value = tr.children[3].textContent;
      modalEditar.showModal();
    } else if(tipoEditar==="factura"){
      editId.value = tr.children[0].textContent;
      editFecha.value = tr.children[1].textContent;
      editProveedorFactura.value = tr.children[2].textContent;
      editProductoFactura.value = tr.children[3].textContent;
      editMonto.value = tr.children[4].textContent;
      editTipo.value = tr.children[5].textContent;
      cargarProveedoresSelect(editProveedorFactura);
      cargarProductosSelect(editProductoFactura);
      modalEditar.showModal();
    }
  }
});

// ===================== GUARDAR MODAL EDITAR =====================
formEditar.addEventListener("submit", async e=>{
  e.preventDefault();
  if(!docEditar) return;

  if(tipoEditar==="proveedor"){
    await updateDoc(docEditar,{
      ruc: editRuc.value,
      nombre: editNombre.value,
      direccion: editDireccion.value,
      telefono: editTelefono.value
    });
  } else if(tipoEditar==="producto"){
    await updateDoc(docEditar,{
      nombre: editNombre.value,
      cantidad: parseInt(editCantidad.value),
      precio: parseFloat(editPrecio.value),
      descripcion: editDescripcion.value
    });
  } else if(tipoEditar==="factura"){
    await updateDoc(docEditar,{
      idFactura: editId.value,
      fecha: editFecha.value,
      proveedor: editProveedorFactura.value,
      producto: editProductoFactura.value,
      monto: parseFloat(editMonto.value),
      tipo: editTipo.value
    });
  }

  modalEditar.close();
});

