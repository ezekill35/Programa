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

// ===================== PANEL DERECHO =====================
let panelDerecho = document.getElementById("panelDerecho");
if(!panelDerecho){
  panelDerecho = document.createElement("div");
  panelDerecho.id = "panelDerecho";
  panelDerecho.style.position = "fixed";
  panelDerecho.style.top = "80px";
  panelDerecho.style.right = "0";
  panelDerecho.style.width = "350px";
  panelDerecho.style.height = "80%";
  panelDerecho.style.background = "#ffffff";
  panelDerecho.style.borderLeft = "2px solid #ddd";
  panelDerecho.style.padding = "1rem";
  panelDerecho.style.overflowY = "auto";
  panelDerecho.style.boxShadow = "-4px 0 15px rgba(0,0,0,0.1)";
  panelDerecho.style.display = "none";
  document.body.appendChild(panelDerecho);
}

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

    if(btn.dataset.target === "facturas"){
      buscador.style.display = "block";
    } else {
      buscador.style.display = "none";
      buscador.value = "";
      panelFacturas.innerHTML = "";
      panelDerecho.style.display = "none";
    }
  });
});

// ===================== AUXILIARES =====================
async function cargarProveedoresSelect() {
  const select = document.getElementById("proveedorFactura");
  select.innerHTML = '<option value="">Seleccionar proveedor</option>';
  const snap = await getDocs(colProveedores);
  snap.forEach(docu => {
    const d = docu.data();
    const opt = document.createElement("option");
    opt.value = d.nombre;
    opt.textContent = d.nombre;
    select.appendChild(opt);
  });
}

async function cargarProductosSelect() {
  const select = document.getElementById("productoFactura");
  select.innerHTML = '<option value="">Seleccionar producto</option>';
  const snap = await getDocs(colProductos);
  snap.forEach(docu => {
    const d = docu.data();
    const opt = document.createElement("option");
    opt.value = d.nombre;
    opt.textContent = d.nombre;
    select.appendChild(opt);
  });
}

// ===================== MOSTRAR PANEL DERECHO PARA EDITAR/VER =====================
function abrirPanelEditar(tipo, data, docId){
  panelDerecho.innerHTML = `
    <h4>${tipo.charAt(0).toUpperCase()+tipo.slice(1)}: ${tipo==="factura"?data.idFactura:data.nombre}</h4>
    <form id="formEditar${tipo}">
      ${tipo==="proveedor"?`
        <label>RUC:</label><input type="text" name="ruc" class="form-control mb-1" value="${data.ruc}" required>
        <label>Nombre:</label><input type="text" name="nombre" class="form-control mb-1" value="${data.nombre}" required>
        <label>Dirección:</label><input type="text" name="direccion" class="form-control mb-1" value="${data.direccion||''}">
        <label>Teléfono:</label><input type="text" name="telefono" class="form-control mb-1" value="${data.telefono||''}">`
      : tipo==="producto"?`
        <label>Nombre:</label><input type="text" name="nombre" class="form-control mb-1" value="${data.nombre}" required>
        <label>Cantidad:</label><input type="number" name="cantidad" class="form-control mb-1" value="${data.cantidad}" required>
        <label>Precio:</label><input type="number" name="precio" class="form-control mb-1" value="${data.precio}" step="0.01" required>
        <label>Descripción:</label><textarea name="descripcion" class="form-control mb-1" rows="3">${data.descripcion||''}</textarea>`
      : tipo==="factura"?`
        <label>ID Factura:</label><input type="text" name="idFactura" class="form-control mb-1" value="${data.idFactura}" required>
        <label>Fecha:</label><input type="date" name="fecha" class="form-control mb-1" value="${data.fecha}" required>
        <label>Proveedor:</label><select name="proveedor" class="form-control mb-1" required></select>
        <label>Producto:</label><select name="producto" class="form-control mb-1" required></select>
        <label>Monto:</label><input type="number" name="monto" class="form-control mb-1" value="${data.monto}" step="0.01" required>
        <label>Tipo:</label><input type="text" name="tipo" class="form-control mb-1" value="${data.tipo}" required>` : ''}
      <button type="submit" class="btn btn-success mt-2">Guardar</button>
      <button type="button" id="cerrarPanel" class="btn btn-secondary mt-2">Cerrar</button>
    </form>
  `;
  panelDerecho.style.display="block";

  // Cargar select de proveedores/productos si es factura
  if(tipo==="factura"){
    const selProv = panelDerecho.querySelector("select[name='proveedor']");
    const selProd = panelDerecho.querySelector("select[name='producto']");
    getDocs(colProveedores).then(snap=>{
      selProv.innerHTML='<option value="">Seleccionar proveedor</option>';
      snap.forEach(d=>{selProv.innerHTML+=`<option value="${d.data().nombre}" ${d.data().nombre===data.proveedor?'selected':''}>${d.data().nombre}</option>`;});
    });
    getDocs(colProductos).then(snap=>{
      selProd.innerHTML='<option value="">Seleccionar producto</option>';
      snap.forEach(d=>{selProd.innerHTML+=`<option value="${d.data().nombre}" ${d.data().nombre===data.producto?'selected':''}>${d.data().nombre}</option>`;});
    });
  }

  // Guardar cambios
  panelDerecho.querySelector("form").addEventListener("submit", async e=>{
    e.preventDefault();
    const formData = new FormData(e.target);
    let obj={};
    formData.forEach((v,k)=>obj[k]=k==="cantidad"?parseInt(v):k==="precio"||k==="monto"?parseFloat(v):v);
    await updateDoc(doc(db,tipo==="proveedor"?"proveedores":tipo==="producto"?"productos":"facturas",docId),obj);
    panelDerecho.style.display="none";
  });

  // Cerrar panel
  panelDerecho.querySelector("#cerrarPanel").addEventListener("click", ()=>panelDerecho.style.display="none");
}

// ===================== PROVEEDORES =====================
formProveedor.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    ruc: document.getElementById("rucProveedor").value.trim(),
    nombre: document.getElementById("nombreProveedor").value.trim(),
    direccion: document.getElementById("direccionProveedor").value.trim(),
    telefono: document.getElementById("telefonoProveedor").value.trim()
  };
  await addDoc(colProveedores, data);
  formProveedor.reset();
});

onSnapshot(colProveedores, snapshot => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach(docu => {
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.dataset.id = docu.id;
    tr.innerHTML = `
      <td>${d.ruc}</td>
      <td>${d.nombre}</td>
      <td>${d.direccion||""}</td>
      <td>${d.telefono||""}</td>
      <td>
        <button class="btn-accion ver" data-tipo="proveedor" data-nombre="${d.nombre}">🔍</button>
        <button class="btn-accion editar" data-tipo="proveedor" data-id="${docu.id}">✏️</button>
        <button class="btn-accion eliminar" data-id="${docu.id}" data-tipo="proveedor">🗑️</button>
      </td>`;
    tablaProveedores.appendChild(tr);
  });
  countProveedores.textContent = snapshot.size;
  cargarProveedoresSelect();
});

// ===================== PRODUCTOS =====================
formProducto.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    nombre: document.getElementById("nombreProducto").value.trim(),
    cantidad: parseInt(document.getElementById("cantidadProducto").value),
    precio: parseFloat(document.getElementById("precioProducto").value),
    descripcion: document.getElementById("descripcionProducto").value.trim()
  };
  await addDoc(colProductos, data);
  formProducto.reset();
});

onSnapshot(colProductos, snapshot => {
  tablaProductos.innerHTML = "";
  snapshot.forEach(docu => {
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.dataset.id = docu.id;
    tr.innerHTML = `
      <td>${d.nombre}</td>
      <td>${d.cantidad}</td>
      <td>${d.precio}</td>
      <td>${d.descripcion||""}</td>
      <td>
        <button class="btn-accion ver" data-tipo="producto" data-nombre="${d.nombre}">🔍</button>
        <button class="btn-accion editar" data-tipo="producto" data-id="${docu.id}">✏️</button>
        <button class="btn-accion eliminar" data-id="${docu.id}" data-tipo="producto">🗑️</button>
      </td>`;
    tablaProductos.appendChild(tr);
  });
  countProductos.textContent = snapshot.size;
  cargarProductosSelect();
});

// ===================== FACTURAS =====================
formFactura.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    idFactura: document.getElementById("idFactura").value.trim(),
    fecha: document.getElementById("fechaFactura").value,
    proveedor: document.getElementById("proveedorFactura").value,
    producto: document.getElementById("productoFactura").value,
    monto: parseFloat(document.getElementById("montoFactura").value),
    tipo: document.getElementById("tipoFactura").value
  };
  await addDoc(colFacturas, data);
  formFactura.reset();
});

onSnapshot(colFacturas, snapshot => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(docu => {
    const f = docu.data();
    const tr = document.createElement("tr");
    tr.dataset.id = docu.id;
    tr.innerHTML = `
      <td>${f.idFactura}</td>
      <td>${f.fecha}</td>
      <td>${f.proveedor}</td>
      <td>${f.producto}</td>
      <td>${f.monto}</td>
      <td>${f.tipo}</td>
      <td>
        <button class="btn-accion ver" data-tipo="factura" data-id="${docu.id}">🔍</button>
        <button class="btn-accion editar" data-tipo="factura" data-id="${docu.id}">✏️</button>
        <button class="btn-accion eliminar" data-id="${docu.id}" data-tipo="factura">🗑️</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  });
  countFacturas.textContent = snapshot.size;
});

// ===================== BUSCADOR =====================
buscador.style.display="none";

buscador.addEventListener("input", async ()=>{
  const texto = buscador.value.trim().toLowerCase();
  panelFacturas.innerHTML="";
  panelDerecho.style.display="none";
  if(!texto) return;
  const snap = await getDocs(colFacturas);
  snap.forEach(docu=>{
    const f = docu.data();
    if(f.producto.toLowerCase().includes(texto)){
      const div = document.createElement("div");
      div.className="resultado-item";
      div.style.background="#e0f2fe";
      div.style.padding="0.5rem";
      div.style.marginBottom="5px";
      div.style.cursor="pointer";
      div.innerHTML=`Factura: <strong>${f.idFactura}</strong> - Producto: ${f.producto}`;
      div.addEventListener("click", async ()=>{
        if(!confirm("¿Deseas ver los datos de la factura?")) return;
        abrirPanelEditar("factura", f, docu.id);
      });
      panelFacturas.appendChild(div);
    }
  });
});

// ===================== CLICK GLOBAL =====================
document.addEventListener("click", async e=>{
  // VER DETALLES
  if(e.target.classList.contains("ver")){
    const tipo = e.target.dataset.tipo;
    if(tipo==="factura"){
      const snap = await getDocs(query(colFacturas, where("idFactura","==",tablaFacturas.querySelector(`[data-id='${e.target.dataset.id}']`).children[0].textContent)));
      if(!snap.empty) abrirPanelEditar("factura", snap.docs[0].data(), snap.docs[0].id);
    } else {
      const nombre = e.target.dataset.nombre;
      const col = tipo==="proveedor"?colProveedores:colProductos;
      const snap = await getDocs(query(col, where("nombre","==",nombre)));
      if(snap.empty) alert("No se encontró información.");
      else abrirPanelEditar(tipo, snap.docs[0].data(), snap.docs[0].id);
    }
  }

  // EDITAR BOTÓN
  if(e.target.classList.contains("editar")){
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    const col = tipo==="proveedor"?colProveedores:tipo==="producto"?colProductos:colFacturas;
    const snap = await getDocs(query(col, where("__name__","==",id)));
    if(!snap.empty) abrirPanelEditar(tipo, snap.docs[0].data(), id);
  }

  // ELIMINAR
  if(e.target.classList.contains("eliminar")){
    if(!confirm("¿Seguro que deseas eliminar este registro?")) return;
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    const docRef = tipo==="proveedor"?doc(db,"proveedores",id):tipo==="producto"?doc(db,"productos",id):doc(db,"facturas",id);
    await deleteDoc(docRef);
  }
});


