import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ================= NAVIGATION =================
const botones = document.querySelectorAll(".menu-btn");
const secciones = document.querySelectorAll(".seccion");

botones.forEach(btn => {
  btn.addEventListener("click", () => {
    botones.forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    secciones.forEach(sec => {
      sec.classList.remove("activa");
      if(sec.id === btn.dataset.target) sec.classList.add("activa");
    });
  });
});

// ================= LOGOUT =================
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ================= PROVEEDORES =================
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");

proveedorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();
  const telefono = document.getElementById("telefonoProveedor").value.trim();

  await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion, telefono });
  proveedorForm.reset();
});

onSnapshot(collection(db, "proveedores"), snapshot => {
  tablaProveedores.innerHTML = "";
  const proveedorSelect = document.getElementById("proveedorFactura");
  proveedorSelect.innerHTML = '<option value="">Seleccione proveedor</option>';
  snapshot.forEach(docu => {
    const p = docu.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td contenteditable="false">${p.ruc}</td>
      <td contenteditable="false">${p.nombre}</td>
      <td contenteditable="false">${p.direccion}</td>
      <td contenteditable="false">${p.telefono}</td>
      <td>
        <button class="btn-edit" data-id="${docu.id}" data-tipo="proveedores">✏️ Editar</button>
        <button class="btn-save" data-id="${docu.id}" data-tipo="proveedores">💾 Guardar</button>
        <button class="btn-delete" data-id="${docu.id}" data-tipo="proveedores">🗑️ Eliminar</button>
      </td>
    `;
    tablaProveedores.appendChild(fila);

    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = p.nombre;
    proveedorSelect.appendChild(option);
  });
});

// ================= PRODUCTOS =================
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");

productoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const unidad = document.getElementById("unidadProducto").value.trim();
  const material = document.getElementById("materialP").value.trim();
  const maquinaria = document.getElementById("maquinaria").value.trim();
  const productoFinal = document.getElementById("productoOf").value.trim();
  const insumos = document.getElementById("insumosExtra").value.trim();

  await addDoc(collection(db, "productos"), { nombre, unidad, material, maquinaria, productoFinal, insumos });
  productoForm.reset();
});

onSnapshot(collection(db, "productos"), snapshot => {
  tablaProductos.innerHTML = "";
  const productoSelect = document.getElementById("productoFactura");
  productoSelect.innerHTML = '<option value="">Seleccione producto</option>';
  snapshot.forEach(docu => {
    const p = docu.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td contenteditable="false">${p.nombre}</td>
      <td contenteditable="false">${p.unidad}</td>
      <td contenteditable="false">${p.material}</td>
      <td contenteditable="false">${p.maquinaria}</td>
      <td contenteditable="false">${p.productoFinal}</td>
      <td contenteditable="false">${p.insumos}</td>
      <td>
        <button class="btn-edit" data-id="${docu.id}" data-tipo="productos">✏️ Editar</button>
        <button class="btn-save" data-id="${docu.id}" data-tipo="productos">💾 Guardar</button>
        <button class="btn-delete" data-id="${docu.id}" data-tipo="productos">🗑️ Eliminar</button>
      </td>
    `;
    tablaProductos.appendChild(fila);

    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = p.nombre;
    productoSelect.appendChild(option);
  });
});

// ================= FACTURAS =================
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");

let facturasGuardadas = [];

facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const idFactura = document.getElementById("idFactura").value.trim();
  const numero = document.getElementById("numeroFactura").value.trim();
  const fecha = document.getElementById("fechaEmisionFactura").value;
  const proveedor = document.getElementById("proveedorFactura").value;
  const producto = document.getElementById("productoFactura").value;
  const monto = document.getElementById("montoFactura").value.trim();
  const moneda = document.getElementById("monedaFactura").value;
  const tipo = document.getElementById("tipoFactura").value;

  if(!proveedor || !producto){
    alert("Debe seleccionar proveedor y producto");
    return;
  }

  await addDoc(collection(db,"facturas"), {idFactura, numero, fecha, proveedor, producto, monto, moneda, tipo});
  facturaForm.reset();
});

onSnapshot(collection(db,"facturas"), snapshot => {
  facturasGuardadas = [];
  snapshot.forEach(docu => {
    facturasGuardadas.push({id:docu.id, ...docu.data()});
  });
  mostrarFacturas(facturasGuardadas);
});

function mostrarFacturas(facturas){
  tablaFacturas.innerHTML = "";
  facturas.forEach(f => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td contenteditable="false">${f.idFactura}</td>
      <td contenteditable="false">${f.numero}</td>
      <td class="ver-proveedor" style="cursor:pointer;color:#007bff">${f.proveedor}</td>
      <td class="ver-producto" style="cursor:pointer;color:#007bff">${f.producto}</td>
      <td contenteditable="false">${f.moneda}${f.monto}</td>
      <td contenteditable="false">${f.tipo}</td>
      <td contenteditable="false">${f.fecha}</td>
      <td>
        <button class="btn-edit" data-id="${f.id}" data-tipo="facturas">✏️ Editar</button>
        <button class="btn-save" data-id="${f.id}" data-tipo="facturas">💾 Guardar</button>
        <button class="btn-delete" data-id="${f.id}" data-tipo="facturas">🗑️ Eliminar</button>
      </td>
    `;
    tablaFacturas.appendChild(fila);
  });
}

// ================= BUSCADOR =================
const buscador = document.getElementById("buscadorFactura");
const btnRefresh = document.getElementById("btnRefresh");

buscador.addEventListener("keypress", e => {
  if(e.key === "Enter"){
    const valor = buscador.value.trim().toLowerCase();
    const filtradas = facturasGuardadas.filter(f => f.producto.toLowerCase().includes(valor));
    mostrarFacturas(filtradas);
  }
});

buscador.addEventListener("input", () => {
  if(buscador.value.trim()==="") mostrarFacturas(facturasGuardadas);
});

btnRefresh.addEventListener("click", () => {
  buscador.value = "";
  mostrarFacturas(facturasGuardadas);
});

// ================= EDITAR / GUARDAR / ELIMINAR =================
document.addEventListener("click", async (e) => {
  const target = e.target;

  // Eliminar
  if(target.classList.contains("btn-delete")){
    const id = target.dataset.id;
    const tipo = target.dataset.tipo;
    if(confirm("¿Desea eliminar este registro?")){
      await deleteDoc(doc(db,tipo,id));
    }
  }

  // Editar
  if(target.classList.contains("btn-edit")){
    const fila = target.closest("tr");
    fila.querySelectorAll("td[contenteditable]").forEach(td => td.contentEditable = "true");
    target.style.display = "none";
    fila.querySelector(".btn-save").style.display = "inline-block";
  }

  // Guardar
  if(target.classList.contains("btn-save")){
    const fila = target.closest("tr");
    const id = target.dataset.id;
    const tipo = target.dataset.tipo;
    let data = {};
    fila.querySelectorAll("td").forEach((td,index)=>{
      if(tipo==="proveedores"){
        if(index===0) data.ruc = td.textContent.trim();
        if(index===1) data.nombre = td.textContent.trim();
        if(index===2) data.direccion = td.textContent.trim();
        if(index===3) data.telefono = td.textContent.trim();
      } else if(tipo==="productos"){
        if(index===0) data.nombre = td.textContent.trim();
        if(index===1) data.unidad = td.textContent.trim();
        if(index===2) data.material = td.textContent.trim();
        if(index===3) data.maquinaria = td.textContent.trim();
        if(index===4) data.productoFinal = td.textContent.trim();
        if(index===5) data.insumos = td.textContent.trim();
      } else if(tipo==="facturas"){
        if(index===0) data.idFactura = td.textContent.trim();
        if(index===1) data.numero = td.textContent.trim();
        if(index===2) data.proveedor = td.textContent.trim();
        if(index===3) data.producto = td.textContent.trim();
        if(index===4) data.monto = td.textContent.trim().replace(/S\/|\$/,"");
        if(index===5) data.tipo = td.textContent.trim();
        if(index===6) data.fecha = td.textContent.trim();
      }
    });
    await updateDoc(doc(db,tipo,id), data);
    fila.querySelectorAll("td[contenteditable]").forEach(td => td.contentEditable = "false");
    target.style.display = "none";
    fila.querySelector(".btn-edit").style.display = "inline-block";
  }

  // Ver detalles
  if(target.classList.contains("ver-proveedor")){
    const nombre = target.textContent;
    mostrarModalDatos("proveedores","nombre",nombre);
  }
  if(target.classList.contains("ver-producto")){
    const nombre = target.textContent;
    mostrarModalDatos("productos","nombre",nombre);
  }
});

// ================= MODAL =================
async function mostrarModalDatos(coleccion, campo, valor){
  const modal = document.getElementById("modalDetalle");
  const modalContenido = document.getElementById("modalContenido");
  modalContenido.innerHTML = "<p>Cargando...</p>";
  onSnapshot(collection(db,coleccion), snap => {
    snap.forEach(docu => {
      const data = docu.data();
      if(data[campo]===valor){
        modalContenido.innerHTML = `
          <h3>${coleccion==="proveedores"?"Proveedor":"Producto"}: ${data.nombre}</h3>
          <p><strong>RUC:</strong> ${data.ruc||"-"}</p>
          <p><strong>Dirección:</strong> ${data.direccion||"-"}</p>
          <p><strong>Teléfono:</strong> ${data.telefono||"-"}</p>
          <p><strong>Unidad:</strong> ${data.unidad||"-"}</p>
          <p><strong>Material:</strong> ${data.material||"-"}</p>
          <p><strong>Maquinaria:</strong> ${data.maquinaria||"-"}</p>
          <p><strong>Producto final:</strong> ${data.productoFinal||"-"}</p>
          <p><strong>Insumos extra:</strong> ${data.insumos||"-"}</p>
        `;
      }
    });
  });
  modal.style.display = "flex";
}

document.getElementById("cerrarModal").addEventListener("click", () => {
  document.getElementById("modalDetalle").style.display = "none";
});




