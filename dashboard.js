import { db, auth } from "./firebase.js";
import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ---- CONTROL DE SESIÓN ----
onAuthStateChanged(auth, user => {
  if (!user) window.location.href = "index.html";
  else localStorage.setItem("lastActivity", Date.now());
});
document.addEventListener("mousemove", ()=>localStorage.setItem("lastActivity", Date.now()));
document.addEventListener("keydown", ()=>localStorage.setItem("lastActivity", Date.now()));
document.addEventListener("click", ()=>localStorage.setItem("lastActivity", Date.now()));
setInterval(()=>{
  const last = parseInt(localStorage.getItem("lastActivity")||0);
  if(Date.now()-last>12*60*60*1000){ 
    signOut(auth); 
    localStorage.removeItem("lastActivity"); 
    window.location.href="index.html";
  }
},60000);

document.getElementById("btnCerrarSesion").addEventListener("click", async ()=>{
  await signOut(auth); localStorage.removeItem("lastActivity"); window.location.href="index.html";
});

// ---- NAVEGACIÓN ----
document.querySelectorAll(".nav-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("activo"));
    btn.classList.add("activo");
    const target = btn.dataset.target;
    document.querySelectorAll(".seccion").forEach(sec=>sec.classList.remove("activa"));
    document.getElementById(target).classList.add("activa");
  });
});

// ---- VARIABLES DOM ----
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const modalFactura = document.getElementById("modalFactura");
const modalFacturaBody = document.getElementById("modalFacturaBody");
const modalExtra = document.getElementById("modalExtra");
const modalExtraBody = document.getElementById("modalExtraBody");

// Formulario Proveedores
const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.getElementById("tablaProveedores");

// Formulario Productos
const formProducto = document.getElementById("formProducto");
const tablaProductos = document.getElementById("tablaProductos");

// Formulario Facturas
const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas");
const proveedorFacturaSelect = document.getElementById("proveedorFactura");
const productoFacturaSelect = document.getElementById("productoFactura");

// ---- FUNCIONES AUXILIARES ----
async function fetchProveedores(){
  const snap = await getDocs(collection(db,"proveedores"));
  const data = [];
  proveedorFacturaSelect.innerHTML = "";
  tablaProveedores.innerHTML = "";
  snap.forEach(docu=>{
    const d = docu.data(); d.id=docu.id; data.push(d);
    // Para select de factura
    const option = document.createElement("option");
    option.value = docu.id;
    option.textContent = d.nombre;
    proveedorFacturaSelect.appendChild(option);
    // Para tabla
    const tr = document.createElement("tr");
    tr.innerHTML=`
      <td>${d.ruc||""}</td>
      <td>${d.nombre||""}</td>
      <td>${d.direccion||""}</td>
      <td>${d.telefono||""}</td>
      <td>
        <button class="btn-accion" data-id="${d.id}" data-type="editProv">✏️</button>
        <button class="btn-accion" data-id="${d.id}" data-type="delProv">🗑️</button>
      </td>
    `;
    tablaProveedores.appendChild(tr);
  });
  return data;
}

async function fetchProductos(){
  const snap = await getDocs(collection(db,"productos"));
  const data = [];
  productoFacturaSelect.innerHTML="";
  tablaProductos.innerHTML="";
  snap.forEach(docu=>{
    const d = docu.data(); d.id=docu.id; data.push(d);
    // Para select de factura
    const option = document.createElement("option");
    option.value = docu.id;
    option.textContent = d.nombre;
    productoFacturaSelect.appendChild(option);
    // Para tabla
    const tr = document.createElement("tr");
    tr.innerHTML=`
      <td>${d.nombre||""}</td>
      <td>${d.cantidad||""}</td>
      <td>${d.precio||""}</td>
      <td>${d.descripcion||""}</td>
      <td>
        <button class="btn-accion" data-id="${d.id}" data-type="editProd">✏️</button>
        <button class="btn-accion" data-id="${d.id}" data-type="delProd">🗑️</button>
      </td>
    `;
    tablaProductos.appendChild(tr);
  });
  return data;
}

async function fetchFacturas(){
  const snap = await getDocs(collection(db,"facturas"));
  tablaFacturas.innerHTML="";
  snap.forEach(docu=>{
    const f = docu.data(); f.id=docu.id;
    const tr = document.createElement("tr");
    tr.innerHTML=`
      <td>${f.id}</td>
      <td>${f.fecha}</td>
      <td><span class="link-info" data-prov="${f.proveedorId}">${f.proveedorNombre}</span></td>
      <td>${f.productoNombre}</td>
      <td>${f.monto}</td>
      <td>${f.tipo}</td>
      <td>
        <button class="btn-accion" data-id="${f.id}" data-type="editFact">✏️</button>
        <button class="btn-accion" data-id="${f.id}" data-type="delFact">🗑️</button>
      </td>
    `;
    tablaFacturas.appendChild(tr);
    // Click en proveedor dentro de factura
    tr.querySelector(".link-info").addEventListener("click", e=>{
      if(confirm("¿Deseas ver los datos del proveedor?")) showProveedor(f.proveedorId);
    });
  });
}

// ---- REGISTRAR PROVEEDOR ----
formProveedor?.addEventListener("submit", async e=>{
  e.preventDefault();
  const ruc=document.getElementById("rucProveedor").value;
  const nombre=document.getElementById("nombreProveedor").value;
  const direccion=document.getElementById("direccionProveedor").value;
  const telefono=document.getElementById("telefonoProveedor").value;
  await addDoc(collection(db,"proveedores"),{ruc,nombre,direccion,telefono});
  formProveedor.reset(); fetchProveedores();
});

// ---- REGISTRAR PRODUCTO ----
formProducto?.addEventListener("submit", async e=>{
  e.preventDefault();
  const nombre=document.getElementById("nombreProducto").value;
  const cantidad=document.getElementById("cantidadProducto").value;
  const precio=document.getElementById("precioProducto").value;
  const descripcion=document.getElementById("descripcionProducto").value;
  await addDoc(collection(db,"productos"),{nombre,cantidad,precio,descripcion});
  formProducto.reset(); fetchProductos();
});

// ---- REGISTRAR FACTURA ----
formFactura?.addEventListener("submit", async e=>{
  e.preventDefault();
  const idFactura=document.getElementById("idFactura").value;
  const fecha=document.getElementById("fechaFactura").value;
  const monto=document.getElementById("montoFactura").value;
  const tipo=document.getElementById("tipoFactura").value;
  const proveedorId=document.getElementById("proveedorFactura").value;
  const productoId=document.getElementById("productoFactura").value;

  // Obtener nombres
  const provDoc=await getDocs(doc(db,"proveedores",proveedorId));
  const prodDoc=await getDocs(doc(db,"productos",productoId));
  let proveedorNombre="", productoNombre="";
  try{proveedorNombre=provDoc.data().nombre}catch{}
  try{productoNombre=prodDoc.data().nombre}catch{}
  
  await addDoc(collection(db,"facturas"),{idFactura,fecha,monto,tipo,proveedorId,productoId,proveedorNombre,productoNombre});
  formFactura.reset(); fetchFacturas();
});

// ---- BUSCADOR PRODUCTO ----
searchInput.addEventListener("input", async ()=>{
  const term=searchInput.value.toLowerCase();
  searchResults.innerHTML="";
  if(!term) return;
  const productosSnap=await getDocs(collection(db,"productos"));
  productosSnap.forEach(p=>{
    const data=p.data();
    if(data.nombre.toLowerCase().includes(term)){
      const div=document.createElement("div");
      div.className="resultado-item";
      div.textContent=data.nombre;
      div.addEventListener("click", ()=>showFacturasProducto(p.id,data.nombre));
      searchResults.appendChild(div);
    }
  });
});

// ---- MODALES ----
async function showFacturasProducto(productId, nombreProducto){
  const facturasSnap = await getDocs(collection(db,"facturas"));
  const relacionadas=[];
  facturasSnap.forEach(f=>{
    const data=f.data();
    if(data.productoId===productId) relacionadas.push({...data,id:f.id});
  });
  modalFacturaBody.innerHTML="";
  relacionadas.forEach(f=>{
    const div=document.createElement("div");
    div.innerHTML=`
      <p><b>Factura:</b> ${f.id}</p>
      <p><b>Fecha:</b> ${f.fecha}</p>
      <p><b>Proveedor:</b> <span class="link-info" data-prov="${f.proveedorId}">${f.proveedorNombre}</span></p>
      <p><b>Producto:</b> ${nombreProducto}</p>
      <p><b>Monto:</b> S/. ${f.monto}</p>
      <p><b>Tipo:</b> ${f.tipo}</p>
      <hr>
    `;
    div.querySelector(".link-info").addEventListener("click", e=>{
      const provId=e.target.dataset.prov;
      if(confirm("¿Deseas ver los datos del proveedor?")) showProveedor(provId);
    });
    modalFacturaBody.appendChild(div);
  });
  modalFactura.showModal();
}

async function showProveedor(provId){
  const docRef = doc(db,"proveedores",provId);
  const docSnap = await getDocs(docRef);
  let data={};
  try{data=docSnap.data()}catch(e){alert("Proveedor no encontrado");return;}
  modalExtraBody.innerHTML=`
    <p><b>Nombre:</b> ${data.nombre||""}</p>
    <p><b>RUC:</b> ${data.ruc||""}</p>
    <p><b>Dirección:</b> ${data.direccion||""}</p>
    <p><b>Teléfono:</b> ${data.telefono||""}</p>
  `;
  modalExtra.showModal();
}

document.getElementById("cerrarModalFactura").addEventListener("click", ()=>modalFactura.close());
document.getElementById("cerrarModalExtra").addEventListener("click", ()=>modalExtra.close());

// ---- BOTONES EDITAR/ELIMINAR ----
document.addEventListener("click", async e=>{
  const type=e.target.dataset.type;
  const id=e.target.dataset.id;
  if(!type||!id) return;

  if(type==="delProv"){ if(confirm("Eliminar proveedor?")){ await deleteDoc(doc(db,"proveedores",id)); fetchProveedores(); fetchFacturas(); } }
  if(type==="delProd"){ if(confirm("Eliminar producto?")){ await deleteDoc(doc(db,"productos",id)); fetchProductos(); fetchFacturas(); } }
  if(type==="delFact"){ if(confirm("Eliminar factura?")){ await deleteDoc(doc(db,"facturas",id)); fetchFacturas(); } }

  if(type==="editProv"){ 
    const nombre=prompt("Nuevo nombre:"); 
    if(nombre) await updateDoc(doc(db,"proveedores",id),{nombre}); 
    fetchProveedores(); fetchFacturas();
  }
  if(type==="editProd"){ 
    const nombre=prompt("Nuevo nombre:"); 
    if(nombre) await updateDoc(doc(db,"productos",id),{nombre}); 
    fetchProductos(); fetchFacturas();
  }
  if(type==="editFact"){ 
    const monto=prompt("Nuevo monto:"); 
    if(monto) await updateDoc(doc(db,"facturas",id),{monto}); 
    fetchFacturas();
  }
});

// ---- CONTADORES ----
async function updateCounters(){
  const f=(await getDocs(collection(db,"facturas"))).size;
  const p=(await getDocs(collection(db,"proveedores"))).size;
  const prod=(await getDocs(collection(db,"productos"))).size;
  document.getElementById("countFacturas").textContent=f;
  document.getElementById("countProveedores").textContent=p;
  document.getElementById("countProductos").textContent=prod;
}

// ---- INICIALIZACIÓN ----
async function initDashboard(){
  await fetchProveedores();
  await fetchProductos();
  await fetchFacturas();
  updateCounters();
}

initDashboard();



