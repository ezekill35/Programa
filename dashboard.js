import { db, auth } from "./firebase.js";
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ===================== NAVEGACIÓN =====================
const botones = document.querySelectorAll(".menu-btn");
const secciones = document.querySelectorAll(".seccion");
botones.forEach(btn => {
  btn.addEventListener("click", () => {
    botones.forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    secciones.forEach(sec => sec.classList.remove("activa"));
    document.getElementById(btn.dataset.target).classList.add("activa");
  });
});

// ===================== CERRAR SESIÓN =====================
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ===================== PROVEEDORES =====================
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");

proveedorForm.addEventListener("submit", async e => {
  e.preventDefault();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();
  const telefono = document.getElementById("telefonoProveedor")?.value.trim() || "";

  await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion, telefono });
  proveedorForm.reset();
});

onSnapshot(collection(db, "proveedores"), snapshot => {
  tablaProveedores.innerHTML = "";
  const proveedorSelect = document.getElementById("proveedorFactura");
  proveedorSelect.innerHTML = '<option value="">Seleccione proveedor</option>';

  snapshot.forEach(docu => {
    const p = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="valor">${p.ruc}</span><input class="editInput" value="${p.ruc}" style="display:none"/></td>
      <td><span class="valor">${p.nombre}</span><input class="editInput" value="${p.nombre}" style="display:none"/></td>
      <td><span class="valor">${p.direccion}</span><input class="editInput" value="${p.direccion}" style="display:none"/></td>
      <td><span class="valor">${p.telefono || ""}</span><input class="editInput" value="${p.telefono || ""}" style="display:none"/></td>
      <td>
        <button class="btn editarBtn">Editar</button>
        <button class="btn secondary eliminarBtn">Eliminar</button>
      </td>
    `;
    tablaProveedores.appendChild(tr);

    const editarBtn = tr.querySelector(".editarBtn");
    const eliminarBtn = tr.querySelector(".eliminarBtn");
    const inputs = tr.querySelectorAll(".editInput");
    const spans = tr.querySelectorAll(".valor");

    editarBtn.addEventListener("click", async () => {
      if(editarBtn.textContent==="Editar"){
        inputs.forEach(i=>i.style.display="inline-block");
        spans.forEach(s=>s.style.display="none");
        editarBtn.textContent="Guardar";
      } else {
        const updated = {
          ruc: inputs[0].value,
          nombre: inputs[1].value,
          direccion: inputs[2].value,
          telefono: inputs[3].value
        };
        await updateDoc(doc(db,"proveedores",docu.id), updated);
        spans.forEach((s,i)=>{s.textContent=Object.values(updated)[i]; s.style.display="inline"});
        inputs.forEach(i=>i.style.display="none");
        editarBtn.textContent="Editar";
      }
    });

    eliminarBtn.addEventListener("click", async ()=>{
      if(confirm("¿Desea eliminar este proveedor?")) await deleteDoc(doc(db,"proveedores",docu.id));
    });

    // select proveedor
    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = p.nombre;
    proveedorSelect.appendChild(option);
  });
});

// ===================== PRODUCTOS =====================
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");

productoForm.addEventListener("submit", async e => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const unidad = document.getElementById("unidadProducto").value.trim();
  const materialP = document.getElementById("materialP")?.value.trim() || "";
  const maquinaria = document.getElementById("maquinaria")?.value.trim() || "";
  const productoOf = document.getElementById("productoOf")?.value.trim() || "";
  const insumosExtra = document.getElementById("insumosExtra")?.value.trim() || "";

  await addDoc(collection(db,"productos"), { nombre, unidad, materialP, maquinaria, productoOf, insumosExtra });
  productoForm.reset();
});

onSnapshot(collection(db,"productos"), snapshot => {
  tablaProductos.innerHTML = "";
  const productoSelect = document.getElementById("productoFactura");
  productoSelect.innerHTML = '<option value="">Seleccione producto</option>';

  snapshot.forEach(docu => {
    const p = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="valor">${p.nombre}</span><input class="editInput" value="${p.nombre}" style="display:none"/></td>
      <td><span class="valor">${p.unidad}</span><input class="editInput" value="${p.unidad}" style="display:none"/></td>
      <td><span class="valor">${p.materialP}</span><input class="editInput" value="${p.materialP}" style="display:none"/></td>
      <td><span class="valor">${p.maquinaria}</span><input class="editInput" value="${p.maquinaria}" style="display:none"/></td>
      <td><span class="valor">${p.productoOf}</span><input class="editInput" value="${p.productoOf}" style="display:none"/></td>
      <td><span class="valor">${p.insumosExtra}</span><input class="editInput" value="${p.insumosExtra}" style="display:none"/></td>
      <td>
        <button class="btn editarBtn">Editar</button>
        <button class="btn secondary eliminarBtn">Eliminar</button>
      </td>
    `;
    tablaProductos.appendChild(tr);

    const editarBtn = tr.querySelector(".editarBtn");
    const eliminarBtn = tr.querySelector(".eliminarBtn");
    const inputs = tr.querySelectorAll(".editInput");
    const spans = tr.querySelectorAll(".valor");

    editarBtn.addEventListener("click", async ()=>{
      if(editarBtn.textContent==="Editar"){
        inputs.forEach(i=>i.style.display="inline-block");
        spans.forEach(s=>s.style.display="none");
        editarBtn.textContent="Guardar";
      } else {
        const updated = {
          nombre: inputs[0].value,
          unidad: inputs[1].value,
          materialP: inputs[2].value,
          maquinaria: inputs[3].value,
          productoOf: inputs[4].value,
          insumosExtra: inputs[5].value
        };
        await updateDoc(doc(db,"productos",docu.id), updated);
        spans.forEach((s,i)=>{s.textContent=Object.values(updated)[i]; s.style.display="inline"});
        inputs.forEach(i=>i.style.display="none");
        editarBtn.textContent="Editar";
      }
    });

    eliminarBtn.addEventListener("click", async ()=>{
      if(confirm("¿Desea eliminar este producto?")) await deleteDoc(doc(db,"productos",docu.id));
    });

    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = p.nombre;
    productoSelect.appendChild(option);
  });
});

// ===================== FACTURAS =====================
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");
let facturasGuardadas = [];

facturaForm.addEventListener("submit", async e=>{
  e.preventDefault();
  const numero = document.getElementById("numeroFactura").value.trim();
  const fecha = document.getElementById("fechaEmisionFactura").value;
  const proveedor = document.getElementById("proveedorFactura").value;
  const producto = document.getElementById("productoFactura").value;
  const monto = document.getElementById("montoFactura").value;
  const tipo = document.getElementById("tipoFactura").value;
  const idFactura = document.getElementById("idFactura")?.value.trim() || "";

  await addDoc(collection(db,"facturas"), { numero, fecha, proveedor, producto, monto, tipo, idFactura });
  facturaForm.reset();
});

onSnapshot(collection(db,"facturas"), snapshot => {
  tablaFacturas.innerHTML = "";
  facturasGuardadas = [];
  snapshot.forEach(docu=>{
    const f = docu.data();
    f.id = docu.id;
    facturasGuardadas.push(f);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="valor">${f.numero}</span><input class="editInput" value="${f.numero}" style="display:none"/></td>
      <td><span class="valor">${f.proveedor}</span><input class="editInput" value="${f.proveedor}" style="display:none"/></td>
      <td><span class="valor">${f.producto}</span><input class="editInput" value="${f.producto}" style="display:none"/></td>
      <td><span class="valor">${f.monto}</span><input class="editInput" value="${f.monto}" style="display:none"/></td>
      <td><span class="valor">${f.tipo}</span>
        <select class="editInput" style="display:none">
          <option ${f.tipo==="Compra"?"selected":""}>Compra</option>
          <option ${f.tipo==="Gasto"?"selected":""}>Gasto</option>
          <option ${f.tipo==="Servicio"?"selected":""}>Servicio</option>
        </select>
      </td>
      <td><span class="valor">${f.fecha}</span><input type="date" class="editInput" value="${f.fecha}" style="display:none"/></td>
      <td><span class="valor">${f.idFactura || ""}</span><input class="editInput" value="${f.idFactura || ""}" style="display:none"/></td>
      <td>
        <button class="btn editarBtn">Editar</button>
        <button class="btn secondary eliminarBtn">Eliminar</button>
      </td>
    `;
    tablaFacturas.appendChild(tr);

    const editarBtn = tr.querySelector(".editarBtn");
    const eliminarBtn = tr.querySelector(".eliminarBtn");
    const inputs = tr.querySelectorAll(".editInput");
    const spans = tr.querySelectorAll(".valor");

    editarBtn.addEventListener("click", async ()=>{
      if(editarBtn.textContent==="Editar"){
        inputs.forEach(i=>i.style.display="inline-block");
        spans.forEach(s=>s.style.display="none");
        editarBtn.textContent="Guardar";
      } else {
        const updated = {
          numero: inputs[0].value,
          proveedor: inputs[1].value,
          producto: inputs[2].value,
          monto: inputs[3].value,
          tipo: inputs[4].value,
          fecha: inputs[5].value,
          idFactura: inputs[6].value
        };
        await updateDoc(doc(db,"facturas",docu.id), updated);
        spans.forEach((s,i)=>{s.textContent=Object.values(updated)[i]; s.style.display="inline"});
        inputs.forEach(i=>i.style.display="none");
        editarBtn.textContent="Editar";
      }
    });

    eliminarBtn.addEventListener("click", async ()=>{
      if(confirm("¿Desea eliminar esta factura?")) await deleteDoc(doc(db,"facturas",docu.id));
    });
  });
});

// ======================= BUSCADOR MODAL =======================
const buscador = document.getElementById('buscadorFactura');
const modalResultados = document.getElementById('modalResultados');
const resultsContainer = document.getElementById('resultsContainer');
const resultTitle = document.getElementById('resultTitle');
const resultSub = document.getElementById('resultSub');

function construirResultados(busqueda){
  resultsContainer.innerHTML = "";
  const filtradas = facturasGuardadas.filter(f=>f.producto.toLowerCase().includes(busqueda.toLowerCase()));
  if(filtradas.length===0){
    resultsContainer.innerHTML='<div class="muted">No hay facturas que coincidan.</div>';
  }
  filtradas.forEach(f=>{
    const card = document.createElement('div');
    card.className='fact-card';
    card.tabIndex=0;
    card.innerHTML=`
      <h4>Factura ${f.numero}</h4>
      <div style="font-size:14px;color:#034c57"><strong>${f.producto}</strong></div>
      <div style="margin-top:8px">
        <div class="muted">Proveedor</div>
        <div><span class="ver-proveedor" data-nombre="${f.proveedor}" style="cursor:pointer;color:var(--accent)">${f.proveedor}</span></div>
      </div>
      <div class="meta">
        <div>${f.fecha}</div>
        <div>${f.monto}</div>
      </div>
    `;
    card.addEventListener('click', ()=>{
      alert(`Abrir modal detalle para factura ${f.numero}`); // reemplazar por tu modal real
    });
    resultsContainer.appendChild(card);
  });
  resultTitle.textContent=`🔍 Resultados relacionados con "${busqueda}"`;
  resultSub.textContent=`${filtradas.length} factura(s) mostradas.`;
}

buscador.addEventListener('keypress', (e)=>{
  if(e.key==='Enter'){
    e.preventDefault();
    const term = buscador.value.trim();
    construirResultados(term);
    modalResultados.classList.add('show');
    modalResultados.style.display='flex';
  }
});

document.getElementById('btnRefresh').addEventListener('click', ()=>{
  buscador.value='';
  construirResultados('');
  modalResultados.classList.remove('show');
  modalResultados.style.display='none';
});




