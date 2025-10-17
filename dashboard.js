// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, doc, deleteDoc, query, where, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
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

const modalEditar = document.getElementById("modalEditar");
const formEditar = document.getElementById("formEditar");
const camposEditar = document.getElementById("camposEditar");
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
    buscador.style.display = btn.dataset.target === "facturas" ? "block" : "none";
    if(btn.dataset.target !== "facturas") { buscador.value=""; panelFacturas.innerHTML=""; }
  });
});

// ===================== AUXILIARES =====================
async function cargarProveedoresSelect() {
  const select = document.getElementById("proveedorFactura");
  select.innerHTML = '<option value="">Seleccionar proveedor</option>';
  const snap = await getDocs(colProveedores);
  snap.forEach(docu => {
    const opt = document.createElement("option");
    opt.value = docu.data().nombre;
    opt.textContent = docu.data().nombre;
    select.appendChild(opt);
  });
}

async function cargarProductosSelect() {
  const select = document.getElementById("productoFactura");
  select.innerHTML = '<option value="">Seleccionar producto</option>';
  const snap = await getDocs(colProductos);
  snap.forEach(docu => {
    const opt = document.createElement("option");
    opt.value = docu.data().nombre;
    opt.textContent = docu.data().nombre;
    select.appendChild(opt);
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

cerrarModalFactura.addEventListener("click",()=>modalFactura.close());
cerrarModalExtra.addEventListener("click",()=>modalExtra.close());

// ===================== REGISTRAR =====================
formProveedor.addEventListener("submit", async e=>{
  e.preventDefault();
  await addDoc(colProveedores,{
    ruc: document.getElementById("rucProveedor").value,
    nombre: document.getElementById("nombreProveedor").value,
    direccion: document.getElementById("direccionProveedor").value,
    telefono: document.getElementById("telefonoProveedor").value
  });
  formProveedor.reset();
});

formProducto.addEventListener("submit", async e=>{
  e.preventDefault();
  await addDoc(colProductos,{
    nombre: document.getElementById("nombreProducto").value,
    cantidad: parseInt(document.getElementById("cantidadProducto").value),
    precio: parseFloat(document.getElementById("precioProducto").value),
    descripcion: document.getElementById("descripcionProducto").value
  });
  formProducto.reset();
});

formFactura.addEventListener("submit", async e=>{
  e.preventDefault();
  await addDoc(colFacturas,{
    idFactura: document.getElementById("idFactura").value,
    fecha: document.getElementById("fechaFactura").value,
    proveedor: document.getElementById("proveedorFactura").value,
    producto: document.getElementById("productoFactura").value,
    monto: parseFloat(document.getElementById("montoFactura").value),
    tipo: document.getElementById("tipoFactura").value
  });
  formFactura.reset();
});

// ===================== CARGAR TABLAS EN TIEMPO REAL =====================
onSnapshot(colProveedores, snapshot => {
  tablaProveedores.innerHTML="";
  snapshot.forEach(docu=>{
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${d.ruc}</td><td>${d.nombre}</td><td>${d.direccion}</td><td>${d.telefono}</td>
      <td>
        <button class="btn-accion text-primary" onclick="abrirModalEditar('proveedor','${docu.id}',${JSON.stringify(d).replaceAll('"','&quot;')})">✏️</button>
        <button class="btn-accion text-danger" onclick="eliminar('proveedores','${docu.id}')">🗑️</button>
      </td>`;
    tablaProveedores.appendChild(tr);
  });
  countProveedores.textContent = snapshot.size;
  cargarProveedoresSelect();
});

onSnapshot(colProductos, snapshot => {
  tablaProductos.innerHTML="";
  snapshot.forEach(docu=>{
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${d.nombre}</td><td>${d.cantidad}</td><td>S/. ${d.precio.toFixed(2)}</td><td>${d.descripcion}</td>
      <td>
        <button class="btn-accion text-primary" onclick="abrirModalEditar('producto','${docu.id}',${JSON.stringify(d).replaceAll('"','&quot;')})">✏️</button>
        <button class="btn-accion text-danger" onclick="eliminar('productos','${docu.id}')">🗑️</button>
      </td>`;
    tablaProductos.appendChild(tr);
  });
  countProductos.textContent = snapshot.size;
  cargarProductosSelect();
});

onSnapshot(colFacturas, snapshot => {
  tablaFacturas.innerHTML="";
  snapshot.forEach(docu=>{
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${d.idFactura}</td><td>${d.fecha}</td><td>${d.proveedor}</td><td>${d.producto}</td><td>S/. ${d.monto.toFixed(2)}</td><td>${d.tipo}</td>
      <td>
        <button class="btn-accion text-primary" onclick="abrirModalEditar('factura','${docu.id}',${JSON.stringify(d).replaceAll('"','&quot;')})">✏️</button>
        <button class="btn-accion text-danger" onclick="eliminar('facturas','${docu.id}')">🗑️</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  });
  countFacturas.textContent = snapshot.size;
});

// ===================== ELIMINAR =====================
window.eliminar = async (coleccion,id)=>{
  if(confirm("¿Deseas eliminar este registro?")) await deleteDoc(doc(db,coleccion,id));
};

// ===================== MODAL EDITAR =====================
window.abrirModalEditar = (tipo,id,datos)=>{
  camposEditar.innerHTML="";
  modalEditar.dataset.tipo = tipo;
  modalEditar.dataset.id = id;
  for(const key in datos){
    const value = datos[key];
    const div = document.createElement("div");
    div.className="col-12 mb-2";
    div.innerHTML=`<label class="form-label">${key}</label>
                   <input type="text" class="form-control" name="${key}" value="${value}">`;
    camposEditar.appendChild(div);
  }
  modalEditar.showModal();
  setTimeout(()=>modalEditar.style.transform="translateY(0)",10);
};

cerrarModalEditar.addEventListener("click",()=>{
  modalEditar.style.transform="translateY(-50px)";
  modalEditar.style.opacity=0;
  setTimeout(()=>modalEditar.close(),300);
});

formEditar.addEventListener("submit", async e=>{
  e.preventDefault();
  const tipo = modalEditar.dataset.tipo;
  const id = modalEditar.dataset.id;
  const datos = {};
  new FormData(formEditar).forEach((v,k)=>datos[k]=v);
  await updateDoc(doc(db,tipo,id),datos);
  modalEditar.close();
});

// ===================== BUSCADOR =====================
buscador.addEventListener("input",async()=>{
  const q = buscador.value.trim().toLowerCase();
  if(!q){panelFacturas.innerHTML=""; return;}
  const snap = await getDocs(colFacturas);
  panelFacturas.innerHTML="";
  snap.forEach(docu=>{
    const f = docu.data();
    if(f.idFactura.toLowerCase().includes(q) || f.proveedor.toLowerCase().includes(q)){
      const div = document.createElement("div");
      div.className="resultado-item";
      div.textContent=`${f.idFactura} - ${f.proveedor} - S/. ${f.monto.toFixed(2)}`;
      div.onclick = ()=>mostrarModalFactura(f);
      panelFacturas.appendChild(div);
    }
  });
});


