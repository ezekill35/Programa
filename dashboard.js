import { db, auth } from "./firebase.js";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ================= NAVEGACIÓN =================
const botones = document.querySelectorAll(".menu-btn");
const secciones = document.querySelectorAll(".seccion");
botones.forEach(btn => btn.addEventListener("click", () => {
  botones.forEach(b => b.classList.remove("activo"));
  btn.classList.add("activo");
  secciones.forEach(sec => sec.classList.remove("activa"));
  document.getElementById(btn.dataset.target).classList.add("activa");
}));

// ================= CERRAR SESIÓN =================
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ================= PROVEEDORES =================
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");
let proveedoresGuardados = [];

proveedorForm.addEventListener("submit", async e => {
  e.preventDefault();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();
  const telefono = document.getElementById("telefonoProveedor").value.trim();
  await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion, telefono });
  proveedorForm.reset();
});

// ================= PRODUCTOS =================
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");
let productosGuardados = [];

productoForm.addEventListener("submit", async e => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const unidad = document.getElementById("unidadProducto").value.trim();
  const material = document.getElementById("materialP").value.trim();
  const maquinaria = document.getElementById("maquinaria").value.trim();
  const productoOf = document.getElementById("productoOf").value.trim();
  const insumosExtra = document.getElementById("insumosExtra").value.trim();
  await addDoc(collection(db, "productos"), { nombre, unidad, material, maquinaria, productoOf, insumosExtra });
  productoForm.reset();
});

// ================= FACTURAS =================
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");
let facturasGuardadas = [];

facturaForm.addEventListener("submit", async e => {
  e.preventDefault();
  const idFactura = document.getElementById("idFactura").value.trim();
  const numero = document.getElementById("numeroFactura").value.trim();
  const fecha = document.getElementById("fechaEmisionFactura").value;
  const proveedor = document.getElementById("proveedorFactura").value;
  const producto = document.getElementById("productoFactura").value;
  const monto = parseFloat(document.getElementById("montoFactura").value);
  const moneda = document.getElementById("monedaFactura").value;
  const tipo = document.getElementById("tipoFactura").value;

  if(!proveedor || !producto){
    alert("Debe seleccionar proveedor y producto");
    return;
  }

  await addDoc(collection(db, "facturas"), { idFactura, numero, fecha, proveedor, producto, monto, moneda, tipo });
  facturaForm.reset();
});

// =================== SNAPSHOTS ===================
onSnapshot(collection(db, "proveedores"), snapshot => {
  proveedoresGuardados = [];
  const proveedorSelect = document.getElementById("proveedorFactura");
  proveedorSelect.innerHTML = '<option value="">Seleccione proveedor</option>';
  tablaProveedores.innerHTML = "";
  snapshot.forEach(docu => {
    const p = docu.data();
    proveedoresGuardados.push({ id: docu.id, ...p });

    // Tabla
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.ruc}</td>
      <td>${p.nombre}</td>
      <td>${p.direccion}</td>
      <td>${p.telefono||'-'}</td>
      <td>
        <button class="btn btn-edit" data-id="${docu.id}" data-tipo="proveedores">✏️ Editar</button>
        <button class="btn btn-save" data-id="${docu.id}" data-tipo="proveedores" style="display:none">💾 Guardar</button>
        <button class="btn btn-delete" data-id="${docu.id}" data-tipo="proveedores">🗑️ Eliminar</button>
      </td>`;
    tablaProveedores.appendChild(fila);

    // Select
    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = p.nombre;
    proveedorSelect.appendChild(option);
  });
});

onSnapshot(collection(db, "productos"), snapshot => {
  productosGuardados = [];
  const productoSelect = document.getElementById("productoFactura");
  productoSelect.innerHTML = '<option value="">Seleccione producto</option>';
  tablaProductos.innerHTML = "";
  snapshot.forEach(docu => {
    const p = docu.data();
    productosGuardados.push({ id: docu.id, ...p });

    // Tabla
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.unidad}</td>
      <td>${p.material}</td>
      <td>${p.maquinaria}</td>
      <td>${p.productoOf}</td>
      <td>${p.insumosExtra}</td>
      <td>
        <button class="btn btn-edit" data-id="${docu.id}" data-tipo="productos">✏️ Editar</button>
        <button class="btn btn-save" data-id="${docu.id}" data-tipo="productos" style="display:none">💾 Guardar</button>
        <button class="btn btn-delete" data-id="${docu.id}" data-tipo="productos">🗑️ Eliminar</button>
      </td>`;
    tablaProductos.appendChild(fila);

    // Select
    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = p.nombre;
    productoSelect.appendChild(option);
  });
});

onSnapshot(collection(db, "facturas"), snapshot => {
  facturasGuardadas = [];
  snapshot.forEach(docu => facturasGuardadas.push({ id: docu.id, ...docu.data() }));
  mostrarFacturas(facturasGuardadas);
});

// =================== MOSTRAR FACTURAS ===================
function mostrarFacturas(facturas){
  tablaFacturas.innerHTML="";
  if(facturas.length===0){
    const fila = document.createElement("tr");
    fila.innerHTML = `<td colspan="8" style="text-align:center;color:#555">No se encontraron coincidencias</td>`;
    tablaFacturas.appendChild(fila);
    return;
  }

  facturas.forEach(f=>{
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${f.idFactura||'-'}</td>
      <td>${f.numero}</td>
      <td class="ver-proveedor" data-nombre="${f.proveedor}" style="cursor:pointer;color:#007bff">${f.proveedor}</td>
      <td class="ver-producto" data-nombre="${f.producto}" style="cursor:pointer;color:#007bff">${f.producto}</td>
      <td>${f.moneda}${f.monto}</td>
      <td>${f.tipo}</td>
      <td>${f.fecha}</td>
      <td>
        <button class="btn btn-edit" data-id="${f.id}" data-tipo="facturas">✏️ Editar</button>
        <button class="btn btn-save" data-id="${f.id}" data-tipo="facturas" style="display:none">💾 Guardar</button>
        <button class="btn btn-delete" data-id="${f.id}" data-tipo="facturas">🗑️ Eliminar</button>
      </td>`;
    tablaFacturas.appendChild(fila);
  });
}

// =================== BUSCADOR ===================
const buscador = document.getElementById("buscadorFactura");
buscador.addEventListener("keydown", e=>{
  if(e.key==="Enter"){
    e.preventDefault();
    const valor = buscador.value.trim().toLowerCase();
    const filtradas = facturasGuardadas.filter(f=>f.producto.toLowerCase().includes(valor));
    mostrarFacturas(filtradas);
  }
});
document.getElementById("btnRefresh").addEventListener("click", ()=>{
  buscador.value="";
  mostrarFacturas(facturasGuardadas);
});

// =================== ACCIONES ===================
document.addEventListener("click", async e=>{
  const id = e.target.dataset.id;
  const tipo = e.target.dataset.tipo;

  if(e.target.classList.contains("btn-delete")){
    if(confirm("¿Desea eliminar este registro?")) await deleteDoc(doc(db,tipo,id));
  }

  if(e.target.classList.contains("btn-edit")) mostrarInputsEdicion(e.target);
  if(e.target.classList.contains("btn-save")) guardarEdicion(e.target);

  if(e.target.classList.contains("ver-proveedor")) mostrarModalDatos("proveedores", e.target.dataset.nombre);
  if(e.target.classList.contains("ver-producto")) mostrarModalDatos("productos", e.target.dataset.nombre);
});

// =================== FUNCIONES EDITAR / GUARDAR ===================
function mostrarInputsEdicion(btn){
  const fila = btn.closest("tr");
  const tipo = btn.dataset.tipo;
  let registro;

  if(tipo==="proveedores") registro = proveedoresGuardados.find(r=>r.id===btn.dataset.id);
  else if(tipo==="productos") registro = productosGuardados.find(r=>r.id===btn.dataset.id);
  else registro = facturasGuardadas.find(r=>r.id===btn.dataset.id);

  if(!registro) return;

  if(tipo==="proveedores"){
    fila.cells[0].innerHTML=`<input value="${registro.ruc}">`;
    fila.cells[1].innerHTML=`<input value="${registro.nombre}">`;
    fila.cells[2].innerHTML=`<input value="${registro.direccion}">`;
    fila.cells[3].innerHTML=`<input value="${registro.telefono||''}">`;
  }
  else if(tipo==="productos"){
    fila.cells[0].innerHTML=`<input value="${registro.nombre}">`;
    fila.cells[1].innerHTML=`<input value="${registro.unidad}">`;
    fila.cells[2].innerHTML=`<input value="${registro.material}">`;
    fila.cells[3].innerHTML=`<input value="${registro.maquinaria}">`;
    fila.cells[4].innerHTML=`<input value="${registro.productoOf}">`;
    fila.cells[5].innerHTML=`<input value="${registro.insumosExtra}">`;
  }
  else if(tipo==="facturas"){
    fila.cells[0].innerHTML=`<input value="${registro.idFactura||''}">`;
    fila.cells[1].innerHTML=`<input value="${registro.numero}">`;
    fila.cells[2].innerHTML=`<select>${proveedoresGuardados.map(p=>`<option value="${p.nombre}" ${p.nombre===registro.proveedor?'selected':''}>${p.nombre}</option>`).join('')}</select>`;
    fila.cells[3].innerHTML=`<select>${productosGuardados.map(p=>`<option value="${p.nombre}" ${p.nombre===registro.producto?'selected':''}>${p.nombre}</option>`).join('')}</select>`;
    fila.cells[4].innerHTML=`<input type="number" step="0.01" value="${registro.monto}">`;
    fila.cells[5].innerHTML=`<select><option value="FACTURA" ${registro.tipo==="FACTURA"?'selected':''}>FACTURA</option><option value="BOLETA DE VENTA" ${registro.tipo==="BOLETA DE VENTA"?'selected':''}>BOLETA DE VENTA</option></select>`;
    fila.cells[6].innerHTML=`<input type="date" value="${registro.fecha}">`;
  }

  btn.style.display="none";
  fila.querySelector(".btn-save").style.display="inline-block";
}

async function guardarEdicion(btn){
  const fila = btn.closest("tr");
  const tipo = btn.dataset.tipo;
  const id = btn.dataset.id;
  let registro;

  if(tipo==="proveedores") registro = proveedoresGuardados.find(r=>r.id===id);
  else if(tipo==="productos") registro = productosGuardados.find(r=>r.id===id);
  else registro = facturasGuardadas.find(r=>r.id===id);

  if(!registro) return;

  const inputs = fila.querySelectorAll("input, select");
  const datosActualizados = {};

  if(tipo==="proveedores"){
    datosActualizados.ruc = inputs[0].value.trim();
    datosActualizados.nombre = inputs[1].value.trim();
    datosActualizados.direccion = inputs[2].value.trim();
    datosActualizados.telefono = inputs[3].value.trim();
  } else if(tipo==="productos"){
    datosActualizados.nombre = inputs[0].value.trim();
    datosActualizados.unidad = inputs[1].value.trim();
    datosActualizados.material = inputs[2].value.trim();
    datosActualizados.maquinaria = inputs[3].value.trim();
    datosActualizados.productoOf = inputs[4].value.trim();
    datosActualizados.insumosExtra = inputs[5].value.trim();
  } else if(tipo==="facturas"){
    datosActualizados.idFactura = inputs[0].value.trim();
    datosActualizados.numero = inputs[1].value.trim();
    datosActualizados.proveedor = inputs[2].value;
    datosActualizados.producto = inputs[3].value;
    datosActualizados.monto = parseFloat(inputs[4].value);
    datosActualizados.tipo = inputs[5].value;
    datosActualizados.fecha = inputs[6].value;
  }

  await updateDoc(doc(db, tipo, registro.id), datosActualizados);
  fila.querySelector(".btn-edit").style.display="inline-block";
  btn.style.display="none";

  if(tipo==="facturas") mostrarFacturas(facturasGuardadas);
}

// =================== MODAL ===================
async function mostrarModalDatos(coleccion, valor){
  const modal=document.getElementById("modalDetalle");
  const modalContenido=document.getElementById("modalContenido");
  modalContenido.innerHTML="Cargando...";
  const datos = coleccion==="proveedores"?proveedoresGuardados:productosGuardados;
  const registro = datos.find(r=>r.nombre===valor);
  if(!registro) return;
  let html=`<h3>${coleccion==="proveedores"?"Proveedor":"Producto"}: ${registro.nombre}</h3>`;
  for(const key in registro) if(key!=="id" && key!=="nombre") html+=`<p><strong>${key}:</strong> ${registro[key]||"-"}</p>`;
  modalContenido.innerHTML=html;
  modal.classList.add("show");
}

document.getElementById("cerrarModal").addEventListener("click",()=>document.getElementById("modalDetalle").classList.remove("show"));


