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
const modalFacturaBody = document.getElementById("modalFacturaBody");
const modalExtra = document.getElementById("modalExtra");
const modalExtraBody = document.getElementById("modalExtraBody");
const cerrarModalFactura = document.getElementById("cerrarModalFactura");
const cerrarModalExtra = document.getElementById("cerrarModalExtra");

const modalEditar = document.createElement("dialog");
modalEditar.id = "modalEditar";
modalEditar.style.border = "none";
modalEditar.style.borderRadius = "10px";
modalEditar.style.padding = "1.5rem";
modalEditar.style.boxShadow = "0 5px 25px rgba(0,0,0,0.3)";
document.body.appendChild(modalEditar);
const modalEditarBody = document.createElement("div");
modalEditar.appendChild(modalEditarBody);
const cerrarModalEditar = document.createElement("button");
cerrarModalEditar.textContent = "Cerrar";
cerrarModalEditar.className = "btn btn-secondary mt-3";
cerrarModalEditar.addEventListener("click", () => modalEditar.close());
modalEditar.appendChild(cerrarModalEditar);

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
    if(btn.dataset.target === "facturas"){
      buscador.style.display = "block";
    } else {
      buscador.style.display = "none";
      buscador.value = "";
      panelFacturas.innerHTML = "";
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

function mostrarModalFactura(f) {
  modalFacturaBody.innerHTML = `
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
      <td>${d.direccion || ""}</td>
      <td>${d.telefono || ""}</td>
      <td>
        <button class="btn-accion editar" data-tipo="proveedor" data-id="${docu.id}">✏️</button>
        <button class="btn-accion eliminar" data-tipo="proveedor" data-id="${docu.id}">🗑️</button>
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
    // ✅ Clase para que la descripción respete saltos de línea
    tr.innerHTML = `
      <td>${d.nombre}</td>
      <td>${d.cantidad}</td>
      <td>${d.precio}</td>
      <td class="descripcion" style="white-space: pre-wrap; word-break: break-word;">${d.descripcion || ""}</td>
      <td>
        <button class="btn-accion editar" data-tipo="producto" data-id="${docu.id}">✏️</button>
        <button class="btn-accion eliminar" data-tipo="producto" data-id="${docu.id}">🗑️</button>
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
        <button class="btn-accion editar" data-tipo="factura" data-id="${docu.id}">✏️</button>
        <button class="btn-accion eliminar" data-tipo="factura" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  });
  countFacturas.textContent = snapshot.size;
});

// ===================== BUSCADOR =====================
buscador.style.display = "none";
buscador.addEventListener("input", async () => {
  const texto = buscador.value.trim().toLowerCase();
  panelFacturas.innerHTML = "";
  if (!texto) return;

  const snap = await getDocs(colFacturas);
  snap.forEach(docu => {
    const f = docu.data();
    if (f.producto.toLowerCase().includes(texto)) {
      const div = document.createElement("div");
      div.className = "resultado-item";
      div.style.cursor = "pointer";
      div.style.background = "#e0f2fe";
      div.style.padding = "0.5rem";
      div.style.marginBottom = "5px";
      div.style.borderRadius = "5px";
      div.innerHTML = `<strong>${f.idFactura}</strong>`;
      div.addEventListener("click", () => mostrarModalFactura(f));
      panelFacturas.appendChild(div);
    }
  });
});

// ===================== CLICK GLOBAL =====================
document.addEventListener("click", async e => {
  // EDITAR EN LISTA
  if (e.target.classList.contains("editar")) {
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    let snap;
    if(tipo==="proveedor") snap = await getDocs(query(colProveedores, where("nombre", "==", e.target.closest("tr").cells[1].textContent)));
    else if(tipo==="producto") snap = await getDocs(query(colProductos, where("nombre", "==", e.target.closest("tr").cells[0].textContent)));
    else snap = await getDocs(query(colFacturas, where("idFactura", "==", e.target.closest("tr").cells[0].textContent)));
    if(!snap.empty){
      const d = snap.docs[0].data();
      let contenido = "";
      if(tipo==="proveedor"){
        contenido = `
          <h4>Editar Proveedor</h4>
          <label>RUC</label><input id="edit_ruc" class="form-control" value="${d.ruc}">
          <label>Nombre</label><input id="edit_nombre" class="form-control" value="${d.nombre}">
          <label>Dirección</label><input id="edit_direccion" class="form-control" value="${d.direccion}">
          <label>Teléfono</label><input id="edit_telefono" class="form-control" value="${d.telefono}">
          <button id="guardarEditar" class="btn btn-success mt-2">Guardar</button>`;
      } else if(tipo==="producto"){
        contenido = `
          <h4>Editar Producto</h4>
          <label>Nombre</label><input id="edit_nombre" class="form-control" value="${d.nombre}">
          <label>Cantidad</label><input type="number" id="edit_cantidad" class="form-control" value="${d.cantidad}">
          <label>Precio</label><input type="number" id="edit_precio" class="form-control" value="${d.precio}">
          <label>Descripción</label><textarea id="edit_descripcion" class="form-control">${d.descripcion}</textarea>
          <button id="guardarEditar" class="btn btn-success mt-2">Guardar</button>`;
      } else {
        contenido = `
          <h4>Editar Factura</h4>
          <label>ID</label><input id="edit_idFactura" class="form-control" value="${d.idFactura}">
          <label>Fecha</label><input type="date" id="edit_fecha" class="form-control" value="${d.fecha}">
          <label>Proveedor</label><input id="edit_proveedor" class="form-control" value="${d.proveedor}">
          <label>Producto</label><input id="edit_producto" class="form-control" value="${d.producto}">
          <label>Monto</label><input id="edit_monto" class="form-control" value="${d.monto}">
          <label>Tipo</label><input id="edit_tipo" class="form-control" value="${d.tipo}">
          <button id="guardarEditar" class="btn btn-success mt-2">Guardar</button>`;
      }
      modalEditarBody.innerHTML = contenido;
      modalEditar.showModal();

      document.getElementById("guardarEditar").addEventListener("click", async () => {
        let newData = {};
        if(tipo==="proveedor"){
          newData = {
            ruc: document.getElementById("edit_ruc").value,
            nombre: document.getElementById("edit_nombre").value,
            direccion: document.getElementById("edit_direccion").value,
            telefono: document.getElementById("edit_telefono").value
          };
        } else if(tipo==="producto"){
          newData = {
            nombre: document.getElementById("edit_nombre").value,
            cantidad: parseInt(document.getElementById("edit_cantidad").value),
            precio: parseFloat(document.getElementById("edit_precio").value),
            descripcion: document.getElementById("edit_descripcion").value
          };
        } else {
          newData = {
            idFactura: document.getElementById("edit_idFactura").value,
            fecha: document.getElementById("edit_fecha").value,
            proveedor: document.getElementById("edit_proveedor").value,
            producto: document.getElementById("edit_producto").value,
            monto: parseFloat(document.getElementById("edit_monto").value),
            tipo: document.getElementById("edit_tipo").value
          };
        }
        await updateDoc(doc(tipo==="proveedor"?colProveedores:tipo==="producto"?colProductos:colFacturas, id), newData);
        modalEditar.close();
      });
    }
  }

  // ELIMINAR
  if(e.target.classList.contains("eliminar")){
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    const col = tipo === "proveedor" ? colProveedores : tipo === "producto" ? colProductos : colFacturas;
    if(confirm("¿Deseas eliminar este registro?")){
      await deleteDoc(doc(col, id));
    }
  }

  // PANEL EXTRA DE PROVEEDOR/PRODUCTO DESDE MODAL FACTURA
  if(e.target.classList.contains("link-info")){
    const tipo = e.target.dataset.tipo;
    const nombre = e.target.dataset.nombre;
    if(confirm(`Deseas ver la información de ${tipo}: ${nombre}?`)){
      let snap;
      if(tipo==="proveedor") snap = await getDocs(query(colProveedores, where("nombre","==",nombre)));
      else snap = await getDocs(query(colProductos, where("nombre","==",nombre)));
      if(!snap.empty){
        const d = snap.docs[0].data();
        let contenido = `<h4>${tipo.charAt(0).toUpperCase()+tipo.slice(1)}: ${nombre}</h4>`;
        for(const k in d) contenido += `<p><b>${k}:</b> ${d[k]}</p>`;
        modalExtraBody.innerHTML = contenido;
        modalExtra.showModal();
      }
    }
  }
});

