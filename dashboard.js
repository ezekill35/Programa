import { auth, db } from "./firebase.js";
import {
  collection, addDoc, getDocs, onSnapshot, doc, deleteDoc, query, where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ====== NAVEGACIÓN ======
const botonesMenu = document.querySelectorAll(".menu-btn");
const secciones = document.querySelectorAll(".seccion");
botonesMenu.forEach(b => {
  b.addEventListener("click", () => {
    botonesMenu.forEach(btn => btn.classList.remove("active"));
    b.classList.add("active");
    secciones.forEach(sec => sec.classList.add("d-none"));
    document.getElementById(b.dataset.target).classList.remove("d-none");
  });
});

// ====== CERRAR SESIÓN ======
document.getElementById("logoutBtn").addEventListener("click", async ()=>{
  await signOut(auth);
  window.location.href="index.html";
});

// ====== REFERENCIAS ======
const colProveedores = collection(db,"proveedores");
const colProductos = collection(db,"productos");
const colFacturas = collection(db,"facturas");

// ====== PROVEEDORES ======
const proveedorForm = document.getElementById("proveedorForm");
proveedorForm.addEventListener("submit", async e=>{
  e.preventDefault();
  const ruc = rucProveedor.value.trim();
  const nombre = nombreProveedor.value.trim();
  const direccion = direccionProveedor.value.trim();
  const telefono = telefonoProveedor.value.trim();
  if(!ruc || !nombre) return alert("RUC y nombre requeridos");
  await addDoc(colProveedores,{ruc,nombre,direccion,telefono});
  proveedorForm.reset();
});
onSnapshot(colProveedores, snap=>{
  const tabla = document.getElementById("tablaProveedores");
  tabla.innerHTML="";
  snap.forEach(docu=>{
    const p = docu.data();
    tabla.innerHTML+=`
      <tr>
        <td>${p.ruc}</td><td>${p.nombre}</td><td>${p.direccion||"-"}</td><td>${p.telefono||"-"}</td>
        <td><button class="btn btn-sm btn-danger eliminar" data-id="${docu.id}" data-tipo="proveedor">🗑</button></td>
      </tr>`;
  });
});

// ====== PRODUCTOS ======
const productoForm = document.getElementById("productoForm");
productoForm.addEventListener("submit", async e=>{
  e.preventDefault();
  const nombre = nombreProducto.value.trim();
  const cantidad = parseInt(cantidadProducto.value);
  const precio = parseFloat(precioProducto.value);
  const descripcion = descripcionProducto.value.trim();
  if(!nombre || isNaN(cantidad) || isNaN(precio))
    return alert("Campos obligatorios");
  await addDoc(colProductos,{nombre,cantidad,precio,descripcion});
  productoForm.reset();
});
onSnapshot(colProductos, snap=>{
  const tabla = document.getElementById("tablaProductos");
  const select = document.getElementById("productoFactura");
  tabla.innerHTML=""; select.innerHTML='<option value="">Seleccionar producto</option>';
  snap.forEach(docu=>{
    const p=docu.data();
    tabla.innerHTML+=`
      <tr>
        <td>${p.nombre}</td><td>${p.cantidad}</td><td>${p.precio.toFixed(2)}</td><td>${p.descripcion||"-"}</td>
        <td><button class="btn btn-sm btn-danger eliminar" data-id="${docu.id}" data-tipo="producto">🗑</button></td>
      </tr>`;
    const opt=document.createElement("option"); opt.value=p.nombre; opt.textContent=p.nombre; select.appendChild(opt);
  });
});

// ====== FACTURAS ======
const facturaForm=document.getElementById("facturaForm");
facturaForm.addEventListener("submit",async e=>{
  e.preventDefault();
  const idFactura=idFacturaEl.value.trim();
  const fecha=fechaFactura.value;
  const proveedor=proveedorFactura.value;
  const producto=productoFactura.value;
  const monto=parseFloat(montoFactura.value);
  const tipo=tipoFactura.value;
  if(!idFactura||!fecha||!proveedor||!producto||isNaN(monto)) return alert("Completa todos los campos");
  await addDoc(colFacturas,{idFactura,fecha,proveedor,producto,monto,tipo});
  facturaForm.reset();
});
onSnapshot(colFacturas,snap=>{
  const tabla=document.getElementById("tablaFacturas");
  tabla.innerHTML="";
  snap.forEach(docu=>{
    const f=docu.data();
    tabla.innerHTML+=`
      <tr class="factura-row" data-id="${docu.id}" data-json='${JSON.stringify(f)}'>
        <td>${f.idFactura}</td><td>${f.fecha}</td><td>${f.proveedor}</td>
        <td>${f.producto}</td><td>${f.monto.toFixed(2)}</td><td>${f.tipo}</td>
        <td><button class="btn btn-sm btn-danger eliminar" data-id="${docu.id}" data-tipo="factura">🗑</button></td>
      </tr>`;
  });
});

// ====== LLENAR SELECT PROVEEDOR ======
onSnapshot(colProveedores,snap=>{
  const select=document.getElementById("proveedorFactura");
  select.innerHTML='<option value="">Seleccionar proveedor</option>';
  snap.forEach(docu=>{
    const p=docu.data();
    const opt=document.createElement("option");
    opt.value=p.nombre; opt.textContent=p.nombre;
    select.appendChild(opt);
  });
});

// ====== ELIMINAR ======
document.addEventListener("click",async e=>{
  if(e.target.matches(".eliminar")){
    const id=e.target.dataset.id;
    const tipo=e.target.dataset.tipo;
    let ref;
    if(tipo==="proveedor") ref=doc(db,"proveedores",id);
    if(tipo==="producto") ref=doc(db,"productos",id);
    if(tipo==="factura") ref=doc(db,"facturas",id);
    await deleteDoc(ref);
  }
});

// ====== BUSCAR FACTURAS POR PRODUCTO ======
const resultados = document.getElementById("resultadosBusqueda");
document.getElementById("btnBuscar").addEventListener("click", async ()=>{
  const texto = document.getElementById("buscadorFactura").value.trim().toLowerCase();
  if(!texto) return alert("Escribe un producto");
  const q=query(colFacturas,where("producto","==",texto));
  const snap=await getDocs(q);
  resultados.innerHTML="<h5>Resultados:</h5>";
  if(snap.empty){ resultados.innerHTML+="<p class='text-muted'>No se encontraron facturas.</p>"; return; }
  snap.forEach(docu=>{
    const f=docu.data();
    resultados.innerHTML+=`
      <button class="btn btn-light w-100 factura-busqueda my-1" data-json='${JSON.stringify(f)}'>
        ${f.idFactura} - ${f.producto} - ${f.proveedor} (${f.monto.toFixed(2)})
      </button>`;
  });
});

// ====== MOSTRAR DETALLE FACTURA ======
const modal=document.getElementById("modalDetalle");
const modalContenido=document.getElementById("modalContenido");
document.addEventListener("click",e=>{
  if(e.target.matches(".factura-busqueda") || e.target.closest(".factura-row")){
    const data=JSON.parse(e.target.dataset.json||e.target.closest(".factura-row").dataset.json);
    modalContenido.innerHTML=`
      <h5>Factura ${data.idFactura}</h5>
      <p><b>Fecha:</b> ${data.fecha}</p>
      <p><b>Proveedor:</b> <span class="link-info ver-info" data-tipo="proveedor" data-nombre="${data.proveedor}">${data.proveedor}</span></p>
      <p><b>Producto:</b> <span class="link-info ver-info" data-tipo="producto" data-nombre="${data.producto}">${data.producto}</span></p>
      <p><b>Monto:</b> S/. ${data.monto.toFixed(2)}</p>
      <p><b>Tipo:</b> ${data.tipo}</p>`;
    modal.style.display="block";
  }
});
document.getElementById("cerrarModal").onclick=()=>modal.style.display="none";

// ====== VER INFORMACIÓN DE PRODUCTO/PROVEEDOR ======
const modalInfo=document.getElementById("modalInfo");
const modalContenidoInfo=document.getElementById("modalContenidoInfo");
document.addEventListener("click",async e=>{
  if(e.target.matches(".ver-info")){
    const nombre=e.target.dataset.nombre;
    const tipo=e.target.dataset.tipo;
    if(!confirm(`¿Deseas ver información del ${tipo} "${nombre}"?`)) return;
    let col = tipo==="proveedor"?colProveedores:colProductos;
    const q=query(col,where("nombre","==",nombre));
    const snap=await getDocs(q);
    if(snap.empty){ alert("No se encontró información"); return; }
    const data=snap.docs[0].data();
    let html="";
    if(tipo==="proveedor"){
      html=`<h5>Proveedor</h5>
      <p><b>Nombre:</b> ${data.nombre}</p>
      <p><b>RUC:</b> ${data.ruc}</p>
      <p><b>Dirección:</b> ${data.direccion||"-"}</p>
      <p><b>Teléfono:</b> ${data.telefono||"-"}</p>`;
    } else {
      html=`<h5>Producto</h5>
      <p><b>Nombre:</b> ${data.nombre}</p>
      <p><b>Cantidad:</b> ${data.cantidad}</p>
      <p><b>Precio:</b> S/. ${data.precio.toFixed(2)}</p>
      <p><b>Descripción:</b> ${data.descripcion||"-"}</p>`;
    }
    modalContenidoInfo.innerHTML=html;
    modalInfo.style.display="block";
  }
});
document.getElementById("cerrarInfo").onclick=()=>modalInfo.style.display="none";

// ====== REFRESH ======
document.getElementById("btnRefresh").onclick=()=>{
  document.getElementById("buscadorFactura").value="";
  resultados.innerHTML="";
};
