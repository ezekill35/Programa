import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ================= NAVEGACIÓN =================
const botones=document.querySelectorAll(".menu-btn");
const secciones=document.querySelectorAll(".seccion");
botones.forEach(btn=>{
  btn.addEventListener("click",()=>{
    botones.forEach(b=>b.classList.remove("activo"));
    btn.classList.add("activo");
    secciones.forEach(sec=>{
      sec.classList.remove("activa");
      if(sec.id===btn.dataset.target) sec.classList.add("activa");
    });
  });
});

// ================= CERRAR SESIÓN =================
document.getElementById("logoutBtn").addEventListener("click",async()=>{
  await signOut(auth);
  window.location.href="index.html";
});

// ================= PROVEEDORES =================
const proveedorForm=document.getElementById("proveedorForm");
const tablaProveedores=document.getElementById("tablaProveedores");

proveedorForm.addEventListener("submit",async e=>{
  e.preventDefault();
  const ruc=document.getElementById("rucProveedor").value.trim();
  const nombre=document.getElementById("nombreProveedor").value.trim();
  const direccion=document.getElementById("direccionProveedor").value.trim();
  const telefono=document.getElementById("telefonoProveedor").value.trim();
  await addDoc(collection(db,"proveedores"),{ruc,nombre,direccion,telefono});
  proveedorForm.reset();
});

let proveedoresGuardados=[];
onSnapshot(collection(db,"proveedores"), snapshot=>{
  proveedoresGuardados=[];
  tablaProveedores.innerHTML="";
  snapshot.forEach(docu=>{
    const p=docu.data();
    proveedoresGuardados.push({id:docu.id,...p});
    const fila=document.createElement("tr");
    fila.innerHTML=`
      <td>${p.ruc}</td>
      <td>${p.nombre}</td>
      <td>${p.direccion}</td>
      <td>${p.telefono||"-"}</td>
      <td>
        <button class="btn btn-edit" data-id="${docu.id}" data-tipo="proveedores">✏️ Editar</button>
        <button class="btn btn-save" data-id="${docu.id}" data-tipo="proveedores">💾 Guardar</button>
        <button class="btn btn-delete" data-id="${docu.id}" data-tipo="proveedores">🗑️ Eliminar</button>
      </td>`;
    tablaProveedores.appendChild(fila);
  });
});

// ================= PRODUCTOS =================
const productoForm=document.getElementById("productoForm");
const tablaProductos=document.getElementById("tablaProductos");

productoForm.addEventListener("submit",async e=>{
  e.preventDefault();
  const nombre=document.getElementById("nombreProducto").value.trim();
  const unidad=document.getElementById("unidadProducto").value.trim();
  const material=document.getElementById("materialP").value.trim();
  const maquinaria=document.getElementById("maquinaria").value.trim();
  const productoOF=document.getElementById("productoOF").value.trim();
  const insumosExtra=document.getElementById("insumosExtra").value.trim();

  await addDoc(collection(db,"productos"),{nombre,unidad,material,maquinaria,productoOF,insumosExtra});
  productoForm.reset();
});

let productosGuardados=[];
onSnapshot(collection(db,"productos"), snapshot=>{
  productosGuardados=[];
  tablaProductos.innerHTML="";
  const productoSelect=document.getElementById("productoFactura");
  productoSelect.innerHTML='<option value="">Seleccione producto</option>';

  snapshot.forEach(docu=>{
    const p=docu.data();
    productosGuardados.push({id:docu.id,...p});

    const fila=document.createElement("tr");
    fila.innerHTML=`
      <td>${p.nombre}</td>
      <td>${p.unidad}</td>
      <td>${p.material}</td>
      <td>${p.maquinaria}</td>
      <td>${p.productoOF}</td>
      <td>${p.insumosExtra}</td>
      <td>
        <button class="btn btn-edit" data-id="${docu.id}" data-tipo="productos">✏️ Editar</button>
        <button class="btn btn-save" data-id="${docu.id}" data-tipo="productos">💾 Guardar</button>
        <button class="btn btn-delete" data-id="${docu.id}" data-tipo="productos">🗑️ Eliminar</button>
      </td>`;
    tablaProductos.appendChild(fila);

    const option=document.createElement("option");
    option.value=p.nombre;
    option.textContent=p.nombre;
    productoSelect.appendChild(option);
  });
});

// ================= FACTURAS =================
const facturaForm=document.getElementById("facturaForm");
const tablaFacturas=document.getElementById("tablaFacturas");

facturaForm.addEventListener("submit",async e=>{
  e.preventDefault();
  const idFactura=document.getElementById("idFactura").value.trim();
  const numero=document.getElementById("numeroFactura").value.trim();
  const fecha=document.getElementById("fechaEmisionFactura").value;
  const proveedor=document.getElementById("proveedorFactura").value;
  const producto=document.getElementById("productoFactura").value;
  const monto=document.getElementById("montoFactura").value;
  const moneda=document.getElementById("monedaFactura").value;
  const tipo=document.getElementById("tipoFactura").value;

  if(!proveedor||!producto){
    alert("Debe seleccionar un proveedor y un producto.");
    return;
  }

  await addDoc(collection(db,"facturas"),{idFactura,numero,fecha,proveedor,producto,monto,moneda,tipo});
  facturaForm.reset();
});

let facturasGuardadas=[];
onSnapshot(collection(db,"facturas"), snapshot=>{
  facturasGuardadas=[];
  snapshot.forEach(docu=>{
    facturasGuardadas.push({id:docu.id,...docu.data()});
  });
  mostrarFacturas(facturasGuardadas);
});

function mostrarFacturas(array){
  tablaFacturas.innerHTML="";
  const lista=array.length>0?array:facturasGuardadas;
  lista.forEach(f=>{
    const fila=document.createElement("tr");
    fila.innerHTML=`
      <td>${f.idFactura||"-"}</td>
      <td>${f.numero}</td>
      <td class="ver-proveedor" data-nombre="${f.proveedor}" style="cursor:pointer;color:#007bff">${f.proveedor}</td>
      <td class="ver-producto" data-nombre="${f.producto}" style="cursor:pointer;color:#007bff">${f.producto}</td>
      <td>${f.moneda}${f.monto}</td>
      <td>${f.tipo}</td>
      <td>${f.fecha}</td>
      <td>
        <button class="btn btn-edit" data-id="${f.id}" data-tipo="facturas">✏️ Editar</button>
        <button class="btn btn-save" data-id="${f.id}" data-tipo="facturas">💾 Guardar</button>
        <button class="btn btn-delete" data-id="${f.id}" data-tipo="facturas">🗑️ Eliminar</button>
      </td>`;
    tablaFacturas.appendChild(fila);
  });
}

// ================= BUSCADOR =================
const buscador=document.getElementById("buscadorFactura");
const resultadosDiv=document.createElement("div");
resultadosDiv.className="card";
resultadosDiv.style.display="none";
resultadosDiv.innerHTML=`
<h3>Resultados de búsqueda</h3>
<div class="table-scroll">
  <table>
    <thead>
      <tr><th>ID</th><th>Número</th><th>Proveedor</th><th>Producto</th><th>Monto</th><th>Tipo</th><th>Fecha</th><th>Acción</th></tr>
    </thead>
    <tbody id="tablaResultados"></tbody>
  </table>
</div>`;
document.querySelector(".main").prepend(resultadosDiv);
const tablaResultados=document.getElementById("tablaResultados");

buscador.addEventListener("keydown", e=>{
  if(e.key==="Enter"){
    e.preventDefault();
    const valor=buscador.value.trim().toLowerCase();
    const filtradas=facturasGuardadas.filter(f=> f.producto.toLowerCase().includes(valor));
    mostrarResultadosBuscador(filtradas);
  }
});

function mostrarResultadosBuscador(facturas){
  tablaResultados.innerHTML="";
  resultadosDiv.style.display=facturas.length>0?"block":"none";
  if(facturas.length===0){
    tablaResultados.innerHTML='<tr><td colspan="8" style="text-align:center;color:#555">No se encontraron facturas</td></tr>';
    return;
  }
  facturas.forEach(f=>{
    const fila=document.createElement("tr");
    fila.innerHTML=`
      <td>${f.idFactura||"-"}</td>
      <td>${f.numero}</td>
      <td class="ver-proveedor" data-nombre="${f.proveedor}" style="cursor:pointer;color:#007bff">${f.proveedor}</td>
      <td class="ver-producto" data-nombre="${f.producto}" style="cursor:pointer;color:#007bff">${f.producto}</td>
      <td>${f.moneda}${f.monto}</td>
      <td>${f.tipo}</td>
      <td>${f.fecha}</td>
      <td>
        <button class="btn btn-edit" data-id="${f.id}" data-tipo="facturas">✏️ Editar</button>
        <button class="btn btn-save" data-id="${f.id}" data-tipo="facturas">💾 Guardar</button>
        <button class="btn btn-delete" data-id="${f.id}" data-tipo="facturas">🗑️ Eliminar</button>
      </td>`;
    tablaResultados.appendChild(fila);
  });
}

document.getElementById("btnRefresh").addEventListener("click", ()=>{
  buscador.value="";
  resultadosDiv.style.display="none";
  mostrarFacturas(facturasGuardadas);
});

// ================= ACCIONES =================
document.addEventListener("click", async e=>{
  const id=e.target.dataset.id;
  const tipo=e.target.dataset.tipo;

  // Eliminar
  if(e.target.classList.contains("btn-delete")){
    if(confirm("¿Desea eliminar este registro?")){
      await deleteDoc(doc(db,tipo,id));
    }
  }

  // Editar
  if(e.target.classList.contains("btn-edit")){
    const fila=e.target.closest("tr");
    [...fila.children].forEach((td,i)=>{
      if(i<fila.children.length-1){
        const valor=td.textContent;
        td.innerHTML=`<input value="${valor}" style="width:100%">`;
      }
    });
    e.target.style.display="none";
    fila.querySelector(".btn-save").style.display="inline-block";
  }

  // Guardar
  if(e.target.classList.contains("btn-save")){
    const fila=e.target.closest("tr");
    const inputs=[...fila.querySelectorAll("input")].map(inp=>inp.value);
    if(tipo==="proveedores"){
      await updateDoc(doc(db,tipo,id), {ruc:inputs[0],nombre:inputs[1],direccion:inputs[2],telefono:inputs[3]});
    }else if(tipo==="productos"){
      await updateDoc(doc(db,tipo,id), {nombre:inputs[0],unidad:inputs[1],material:inputs[2],maquinaria:inputs[3],productoOF:inputs[4],insumosExtra:inputs[5]});
    }else if(tipo==="facturas"){
      await updateDoc(doc(db,tipo,id), {idFactura:inputs[0],numero:inputs[1],proveedor:inputs[2],producto:inputs[3],monto:parseFloat(inputs[4]),tipo:inputs[5],fecha:inputs[6]});
    }
    mostrarFacturas(facturasGuardadas);
  }

  // Modal detalle
  if(e.target.classList.contains("ver-proveedor")){
    mostrarModalDatos("proveedores",e.target.dataset.nombre);
  }
  if(e.target.classList.contains("ver-producto")){
    mostrarModalDatos("productos",e.target.dataset.nombre);
  }
});

// ================= MODAL =================
const modal=document.getElementById("modalDetalle");
const cerrarModal=document.getElementById("cerrarModal");

async function mostrarModalDatos(coleccion,valor){
  modal.classList.add("show");
  const modalContenido=document.getElementById("modalContenido");
  const datos=coleccion==="proveedores"?proveedoresGuardados:productosGuardados;
  const registro=datos.find(r=>r.nombre===valor);
  if(!registro) return;
  let html=`<h3>${coleccion==="proveedores"?"Proveedor":"Producto"}: ${registro.nombre}</h3>`;
  for(const key in registro){
    if(key!=="id" && key!=="nombre"){
      html+=`<p><strong>${key}:</strong> ${registro[key]||"-"}</p>`;
    }
  }
  modalContenido.innerHTML=html;
}

cerrarModal.addEventListener("click",()=>modal.classList.remove("show"));
