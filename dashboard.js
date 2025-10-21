// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, doc, deleteDoc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
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
onAuthStateChanged(auth, user => {
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

// ===================== TOAST =====================
function showToast(msg, color="#14b8a6") {
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.cssText = `position:fixed;bottom:20px;right:20px;padding:10px 20px;background:${color};color:white;border-radius:8px;z-index:999;opacity:0;transition:0.3s;`;
  document.body.appendChild(t);
  setTimeout(()=>t.style.opacity=1,50);
  setTimeout(()=>{t.style.opacity=0;setTimeout(()=>t.remove(),300)},3000);
}

// ===================== CERRAR SESIÓN =====================
document.getElementById("btnCerrarSesion").addEventListener("click", async ()=>{
  await signOut(auth);
  window.location.href = "index.html";
});

// ===================== NAV =====================
document.querySelectorAll(".nav-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("activo"));
    document.querySelectorAll(".seccion").forEach(s=>s.classList.remove("activa"));
    btn.classList.add("activo");
    document.getElementById(btn.dataset.target).classList.add("activa");
    buscador.style.display = btn.dataset.target==="facturas"?"block":"none";
    if(btn.dataset.target!=="facturas") { buscador.value=""; panelFacturas.innerHTML=""; }
  });
});

// ===================== CARGAR SELECTS =====================
async function cargarProveedoresSelect(){
  const sel = document.getElementById("proveedorFactura");
  sel.innerHTML='<option value="">Seleccionar proveedor</option>';
  const snap = await getDocs(colProveedores);
  snap.forEach(d=>{
    const o=document.createElement("option");
    o.value=d.data().nombre; o.textContent=d.data().nombre;
    sel.appendChild(o);
  });
}
async function cargarProductosSelect(){
  const sel = document.getElementById("productoFactura");
  sel.innerHTML='<option value="">Seleccionar producto</option>';
  const snap = await getDocs(colProductos);
  snap.forEach(d=>{
    const o=document.createElement("option");
    o.value=d.data().nombre; o.textContent=d.data().nombre;
    sel.appendChild(o);
  });
}

// ===================== MODALES =====================
function mostrarModalFactura(f){
  modalFacturaBody.innerHTML=`
    <h3>Factura ${f.idFactura||''}</h3>
    <p><b>Fecha:</b> ${f.fecha||''}</p>
    <p><b>Proveedor:</b> ${f.proveedor||''}</p>
    <p><b>Producto:</b> ${f.producto||''}</p>
    <p><b>Monto:</b> S/. ${f.monto||0}</p>
    <p><b>Tipo:</b> ${f.tipo||''}</p>
  `;
  modalFactura.showModal();
}
cerrarModalFactura.addEventListener("click", ()=>modalFactura.close());
cerrarModalExtra.addEventListener("click", ()=>modalExtra.close());
cerrarModalEditar.addEventListener("click", ()=>modalEditar.close());

// ===================== PROVEEDORES =====================
formProveedor.addEventListener("submit", async e=>{
  e.preventDefault();
  await addDoc(colProveedores,{
    ruc: document.getElementById("rucProveedor").value.trim(),
    nombre: document.getElementById("nombreProveedor").value.trim(),
    direccion: document.getElementById("direccionProveedor").value.trim(),
    telefono: document.getElementById("telefonoProveedor").value.trim()
  });
  formProveedor.reset();
  showToast("Proveedor registrado ✅");
});

onSnapshot(colProveedores,snapshot=>{
  tablaProveedores.innerHTML="";
  snapshot.forEach(docu=>{
    const d=docu.data();
    const tr=document.createElement("tr");
    tr.dataset.id=docu.id;
    tr.innerHTML=`
      <td>${d.ruc}</td><td>${d.nombre}</td><td>${d.direccion||''}</td><td>${d.telefono||''}</td>
      <td>
        <button class="btn-accion editar" data-tipo="proveedor" data-id="${docu.id}">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="proveedor" data-nombre="${d.nombre}">🔍</button>
        <button class="btn-accion eliminar" data-tipo="proveedor" data-id="${docu.id}">🗑️</button>
      </td>
    `;
    tablaProveedores.appendChild(tr);
  });
  countProveedores.textContent=snapshot.size;
  cargarProveedoresSelect();
});

// ===================== PRODUCTOS =====================
formProducto.addEventListener("submit", async e=>{
  e.preventDefault();
  await addDoc(colProductos,{
    nombre: document.getElementById("nombreProducto").value.trim(),
    cantidad: parseInt(document.getElementById("cantidadPresentacion").value),
    precio: parseFloat(document.getElementById("precioProducto").value),
    descripcion: document.getElementById("descripcionProducto").value.trim()
  });
  formProducto.reset();
  showToast("Producto registrado ✅");
});

onSnapshot(colProductos,snapshot=>{
  tablaProductos.innerHTML="";
  snapshot.forEach(docu=>{
    const d=docu.data();
    const tr=document.createElement("tr");
    tr.dataset.id=docu.id;
    tr.innerHTML=`
      <td>${d.nombre}</td><td>${d.cantidad}</td><td>${d.precio}</td><td>${d.descripcion||''}</td>
      <td>
        <button class="btn-accion editar" data-tipo="producto" data-id="${docu.id}">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="producto" data-nombre="${d.nombre}">🔍</button>
        <button class="btn-accion eliminar" data-tipo="producto" data-id="${docu.id}">🗑️</button>
      </td>
    `;
    tablaProductos.appendChild(tr);
  });
  countProductos.textContent=snapshot.size;
  cargarProductosSelect();
});

// ===================== FACTURAS =====================
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
  showToast("Factura registrada ✅");
});

onSnapshot(colFacturas,snapshot=>{
  tablaFacturas.innerHTML="";
  snapshot.forEach(docu=>{
    const f=docu.data();
    const tr=document.createElement("tr");
    tr.dataset.id=docu.id;
    tr.innerHTML=`
      <td>${f.idFactura}</td><td>${f.fecha}</td><td>${f.proveedor}</td><td>${f.producto}</td><td>${f.monto}</td><td>${f.tipo}</td>
      <td>
        <button class="btn-accion editar" data-tipo="factura" data-id="${docu.id}">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="factura" data-id="${docu.id}">🔍</button>
        <button class="btn-accion eliminar" data-tipo="factura" data-id="${docu.id}">🗑️</button>
      </td>
    `;
    tablaFacturas.appendChild(tr);
  });
  countFacturas.textContent=snapshot.size;
});

// ===================== BUSCADOR =====================
buscador.style.display="none";
buscador.addEventListener("input", async ()=>{
  const t=buscador.value.trim().toLowerCase();
  panelFacturas.innerHTML="";
  if(!t) return;
  const snap = await getDocs(colFacturas);
  snap.forEach(docu=>{
    const f=docu.data();
    if(f.producto.toLowerCase().includes(t)){
      const d=document.createElement("div");
      d.className="resultado-item";
      d.textContent=f.idFactura;
      d.addEventListener("click", ()=>mostrarModalFactura(f));
      panelFacturas.appendChild(d);
    }
  });
});

// ===================== CLICK GLOBAL =====================
document.addEventListener("click", async e=>{
  const t=e.target;
  // EDITAR
  if(t.classList.contains("editar")){
    const tipo = t.dataset.tipo;
    const id = t.dataset.id;
    let colRef = tipo==="proveedor"?colProveedores:tipo==="producto"?colProductos:colFacturas;
    const snap = await getDocs(query(colRef, where("__name__","==",id)));
    if(!snap.empty){
      const d=snap.docs[0].data();
      modalEditarBody.innerHTML = `<h5>Editar ${tipo}</h5>`;
      if(tipo==="proveedor"){
        modalEditarBody.innerHTML += `
          <label>RUC</label><input id="editRuc" class="form-control mb-1" value="${d.ruc||''}">
          <label>Nombre</label><input id="editNombre" class="form-control mb-1" value="${d.nombre||''}">
          <label>Dirección</label><input id="editDir" class="form-control mb-1" value="${d.direccion||''}">
          <label>Teléfono</label><input id="editTel" class="form-control mb-1" value="${d.telefono||''}">
        `;
      } else if(tipo==="producto"){
        modalEditarBody.innerHTML += `
          <label>Nombre</label><input id="editNombre" class="form-control mb-1" value="${d.nombre||''}">
          <label>Cantidad</label><input id="editCantidad" type="number" class="form-control mb-1" value="${d.cantidad||0}">
          <label>Precio</label><input id="editPrecio" type="number" step="0.01" class="form-control mb-1" value="${d.precio||0}">
          <label>Descripción</label><textarea id="editDesc" class="form-control mb-1">${d.descripcion||''}</textarea>
        `;
      } else if(tipo==="factura"){
        modalEditarBody.innerHTML += `
          <label>ID</label><input id="editId" class="form-control mb-1" value="${d.idFactura||''}">
          <label>Fecha</label><input id="editFecha" type="date" class="form-control mb-1" value="${d.fecha||''}">
          <label>Proveedor</label><input id="editProv" class="form-control mb-1" value="${d.proveedor||''}">
          <label>Producto</label><input id="editProd" class="form-control mb-1" value="${d.producto||''}">
          <label>Monto</label><input id="editMonto" type="number" step="0.01" class="form-control mb-1" value="${d.monto||0}">
          <label>Tipo</label><input id="editTipo" class="form-control mb-1" value="${d.tipo||''}">
        `;
      }
      modalEditarBody.innerHTML += `<button id="guardarEdit" class="btn btn-primary mt-2">Guardar</button>`;
      modalEditar.showModal();

      document.getElementById("guardarEdit").addEventListener("click", async ()=>{
        const upd={};
        if(tipo==="proveedor"){
          upd.ruc=document.getElementById("editRuc").value.trim();
          upd.nombre=document.getElementById("editNombre").value.trim();
          upd.direccion=document.getElementById("editDir").value.trim();
          upd.telefono=document.getElementById("editTel").value.trim();
        } else if(tipo==="producto"){
          upd.nombre=document.getElementById("editNombre").value.trim();
          upd.cantidad=parseInt(document.getElementById("editCantidad").value);
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
        await updateDoc(doc(db,colRef.id,id),upd);
        modalEditar.close();
        showToast(`${tipo} actualizado ✅`);
      });
    }
  }

  // VER
  if(t.classList.contains("link-info")){
    const tipo = t.dataset.tipo;
    const nombre = t.dataset.nombre;
    let colRef = tipo==="proveedor"?colProveedores:colProductos;
    const snap = await getDocs(query(colRef, where("nombre","==",nombre)));
    if(!snap.empty){
      const d=snap.docs[0].data();
      modalExtraBody.innerHTML = tipo==="proveedor"?
        `<h5>${nombre}</h5><p>RUC: ${d.ruc}<br>Dir: ${d.direccion||''}<br>Tel: ${d.telefono||''}</p>`:
        `<h5>${nombre}</h5><p>Cantidad: ${d.cantidad}<br>Precio: ${d.precio}<br>Desc: ${d.descripcion||''}</p>`;
      modalExtra.showModal();
    }
  }

  // ELIMINAR
  if(t.classList.contains("eliminar")){
    const tipo = t.dataset.tipo;
    const id = t.dataset.id;
    let colRef = tipo==="proveedor"?colProveedores:tipo==="producto"?colProductos:colFacturas;
    if(confirm("¿Deseas eliminar este registro?")) {
      await deleteDoc(doc(db,colRef.id,id));
      showToast(`${tipo} eliminado 🗑️`,"#dc2626");
    }
  }

});


