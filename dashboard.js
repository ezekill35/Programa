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

const modalEditar = document.createElement("dialog");
modalEditar.id = "modalEditar";
modalEditar.innerHTML = `<h4>Editar</h4><form id="formEditar" class="row g-3"></form><button id="cerrarModalEditar" class="btn btn-secondary mt-3">Cerrar</button>`;
document.body.appendChild(modalEditar);
const formEditar = document.getElementById("formEditar");
document.getElementById("cerrarModalEditar").addEventListener("click", ()=>modalEditar.close());

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
    if(btn.dataset.target === "facturas") buscador.style.display = "block";
    else { buscador.style.display = "none"; buscador.value = ""; panelFacturas.innerHTML = ""; }
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

function mostrarModalFactura(f) {
  contenidoModalFactura.innerHTML = `
    <h3 class="text-sky-600 font-bold text-lg mb-2">Factura ${f.idFactura}</h3>
    <p><b>Fecha:</b> ${f.fecha}</p>
    <p><b>Proveedor:</b> <span class="link-info" data-tipo="proveedor" data-nombre="${f.proveedor}" style="color:#f97316; cursor:pointer;">${f.proveedor}</span></p>
    <p><b>Producto:</b> <span class="link-info" data-tipo="producto" data-nombre="${f.producto}" style="color:#14b8a6; cursor:pointer;">${f.producto}</span></p>
    <p><b>Monto:</b> S/. ${f.monto}</p>
    <p><b>Tipo:</b> ${f.tipo}</p>`;
  modalFactura.showModal();
}

// ===================== CERRAR MODALES =====================
cerrarModalFactura.addEventListener("click", () => modalFactura.close());
cerrarModalExtra.addEventListener("click", () => modalExtra.close());

// ===================== REGISTRAR =====================
formProveedor.addEventListener("submit", async e=>{
  e.preventDefault();
  const data = {
    ruc: document.getElementById("rucProveedor").value.trim(),
    nombre: document.getElementById("nombreProveedor").value.trim(),
    direccion: document.getElementById("direccionProveedor").value.trim(),
    telefono: document.getElementById("telefonoProveedor").value.trim()
  };
  await addDoc(colProveedores,data);
  formProveedor.reset();
});

formProducto.addEventListener("submit", async e=>{
  e.preventDefault();
  const data = {
    nombre: document.getElementById("nombreProducto").value.trim(),
    cantidad: parseInt(document.getElementById("cantidadProducto").value),
    precio: parseFloat(document.getElementById("precioProducto").value),
    descripcion: document.getElementById("descripcionProducto").value.trim().split("\n")
  };
  await addDoc(colProductos,data);
  formProducto.reset();
});

formFactura.addEventListener("submit", async e=>{
  e.preventDefault();
  const data = {
    idFactura: document.getElementById("idFactura").value.trim(),
    fecha: document.getElementById("fechaFactura").value,
    proveedor: document.getElementById("proveedorFactura").value,
    producto: document.getElementById("productoFactura").value,
    monto: parseFloat(document.getElementById("montoFactura").value),
    tipo: document.getElementById("tipoFactura").value
  };
  await addDoc(colFacturas,data);
  formFactura.reset();
});

// ===================== ON SNAPSHOT =====================
onSnapshot(colProveedores, snapshot=>{
  tablaProveedores.innerHTML="";
  snapshot.forEach(docu=>{
    const d=docu.data();
    const tr=document.createElement("tr");
    tr.dataset.id=docu.id;
    tr.innerHTML=`
      <td>${d.ruc}</td><td>${d.nombre}</td><td>${d.direccion||""}</td><td>${d.telefono||""}</td>
      <td>
        <button class="btn-accion" onclick="editar('proveedores','${docu.id}')">✏️</button>
        <button class="btn-accion eliminar" data-id="${docu.id}" data-tipo="proveedores">🗑️</button>
      </td>`;
    tablaProveedores.appendChild(tr);
  });
  countProveedores.textContent = snapshot.size;
  cargarProveedoresSelect();
});

onSnapshot(colProductos, snapshot=>{
  tablaProductos.innerHTML="";
  snapshot.forEach(docu=>{
    const d=docu.data();
    const tr=document.createElement("tr");
    tr.dataset.id=docu.id;
    tr.innerHTML=`
      <td>${d.nombre}</td><td>${d.cantidad}</td><td>${d.precio}</td>
      <td>${(d.descripcion||[]).join("<br>")}</td>
      <td>
        <button class="btn-accion" onclick="editar('productos','${docu.id}')">✏️</button>
        <button class="btn-accion eliminar" data-id="${docu.id}" data-tipo="productos">🗑️</button>
      </td>`;
    tablaProductos.appendChild(tr);
  });
  countProductos.textContent = snapshot.size;
  cargarProductosSelect();
});

onSnapshot(colFacturas, snapshot=>{
  tablaFacturas.innerHTML="";
  snapshot.forEach(docu=>{
    const f=docu.data();
    const tr=document.createElement("tr");
    tr.dataset.id=docu.id;
    tr.innerHTML=`
      <td>${f.idFactura}</td><td>${f.fecha}</td><td>${f.proveedor}</td><td>${f.producto}</td><td>${f.monto}</td><td>${f.tipo}</td>
      <td>
        <button class="btn-accion" onclick="editar('facturas','${docu.id}')">✏️</button>
        <button class="btn-accion eliminar" data-id="${docu.id}" data-tipo="facturas">🗑️</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  });
  countFacturas.textContent = snapshot.size;
});

// ===================== BUSCADOR AVANZADO =====================
buscador.addEventListener("input", async () => {
  const texto = buscador.value.trim().toLowerCase();
  panelFacturas.innerHTML="";
  if(!texto) return;

  const snapFacturas = await getDocs(colFacturas);

  snapFacturas.forEach(docu=>{
    const f=docu.data();
    if(f.producto.toLowerCase().includes(texto) || f.proveedor.toLowerCase().includes(texto) || f.idFactura.toLowerCase().includes(texto)){
      const div=document.createElement("div");
      div.className="resultado-item";
      div.style.cursor="pointer";
      div.style.background="#e0f2fe";
      div.innerHTML=`<strong>ID: ${f.idFactura}</strong> - ${f.proveedor} - ${f.producto}`;
      div.addEventListener("click", ()=>{
        panelFacturas.innerHTML=`
          <h5>Factura Seleccionada: ${f.idFactura}</h5>
          <p><b>Fecha:</b> ${f.fecha}</p>
          <p><b>Proveedor:</b> <span class="link-info" data-tipo="proveedor" data-nombre="${f.proveedor}" style="color:#f97316;">${f.proveedor}</span></p>
          <p><b>Producto:</b> <span class="link-info" data-tipo="producto" data-nombre="${f.producto}" style="color:#14b8a6;">${f.producto}</span></p>
          <p><b>Monto:</b> S/. ${f.monto}</p>
          <p><b>Tipo:</b> ${f.tipo}</p>
        `;

        panelFacturas.querySelectorAll(".link-info").forEach(el=>{
          el.addEventListener("click", async ()=>{
            if(!confirm(`¿Deseas ver los datos de ${el.dataset.nombre}?`)) return;
            const tipo = el.dataset.tipo;
            const nombre = el.dataset.nombre;
            const col = tipo==="proveedor"?colProveedores:colProductos;
            const snap = await getDocs(query(col, where("nombre","==",nombre)));
            if(snap.empty) modalExtraBody.innerHTML="<p>No se encontró información.</p>";
            else{
              const d=snap.docs[0].data();
              modalExtraBody.innerHTML=tipo==="proveedor"
                ? `<h4>Proveedor</h4><p><b>Nombre:</b> ${d.nombre}</p><p><b>RUC:</b> ${d.ruc}</p><p><b>Dirección:</b> ${d.direccion}</p><p><b>Teléfono:</b> ${d.telefono}</p>`
                : `<h4>Producto</h4><p><b>Nombre:</b> ${d.nombre}</p><p><b>Cantidad:</b> ${d.cantidad}</p><p><b>Precio:</b> S/. ${d.precio}</p><p><b>Descripción:</b><br>${(d.descripcion||[]).join("<br>")}</p>`;
              modalExtra.showModal();
            }
          });
        });
      });
      panelFacturas.appendChild(div);
    }
  });
});

// ===================== EDITAR =====================
window.editar = async (tipo,id)=>{
  const docRef = doc(db,tipo,id);
  const snap = await getDocs(collection(db,tipo));
  const docData = snap.docs.find(d=>d.id===id).data();

  formEditar.innerHTML="";
  if(tipo==="proveedores"){
    formEditar.innerHTML=`
      <div class="col-6"><input class="form-control" name="ruc" value="${docData.ruc}" required></div>
      <div class="col-6"><input class="form-control" name="nombre" value="${docData.nombre}" required></div>
      <div class="col-6"><input class="form-control" name="direccion" value="${docData.direccion}"></div>
      <div class="col-6"><input class="form-control" name="telefono" value="${docData.telefono}"></div>`;
  }else if(tipo==="productos"){
    formEditar.innerHTML=`
      <div class="col-6"><input class="form-control" name="nombre" value="${docData.nombre}" required></div>
      <div class="col-3"><input class="form-control" name="cantidad" type="number" value="${docData.cantidad}" required></div>
      <div class="col-3"><input class="form-control" name="precio" type="number" step="0.01" value="${docData.precio}" required></div>
      <div class="col-12"><textarea class="form-control" name="descripcion" rows="3">${(docData.descripcion||[]).join("\n")}</textarea></div>`;
  }else{
    formEditar.innerHTML=`
      <div class="col-4"><input class="form-control" name="idFactura" value="${docData.idFactura}" required></div>
      <div class="col-4"><input class="form-control" name="fecha" type="date" value="${docData.fecha}" required></div>
      <div class="col-4"><input class="form-control" name="monto" type="number" step="0.01" value="${docData.monto}" required></div>
      <div class="col-6"><input class="form-control" name="proveedor" value="${docData.proveedor}" required></div>
      <div class="col-6"><input class="form-control" name="producto" value="${docData.producto}" required></div>
      <div class="col-6"><input class="form-control" name="tipo" value="${docData.tipo}" required></div>`;
  }

  formEditar.onsubmit = async e=>{
    e.preventDefault();
    const formData = new FormData(formEditar);
    const updated = {};
    formData.forEach((v,k)=>{
      if(k==="cantidad") updated[k]=parseInt(v);
      else if(k==="precio"||k==="monto") updated[k]=parseFloat(v);
      else if(k==="descripcion") updated[k]=v.split("\n");
      else updated[k]=v;
    });
    await updateDoc(docRef,updated);
    modalEditar.close();
  };

  modalEditar.showModal();
};

// ===================== ELIMINAR =====================
document.addEventListener("click", async e=>{
  if(e.target.classList.contains("eliminar")){
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    if(!confirm("¿Deseas eliminar este registro?")) return;
    await deleteDoc(doc(db,tipo,id));
  }
});

