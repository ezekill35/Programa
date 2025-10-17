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

const modalEditar = document.getElementById("modalEditar");
const modalEditarBody = document.getElementById("modalEditarBody");
const cerrarModalEditar = document.getElementById("cerrarModalEditar");

const modalFactura = document.getElementById("modalFactura");
const modalFacturaBody = document.getElementById("modalFacturaBody");
const cerrarModalFactura = document.getElementById("cerrarModalFactura");

const modalExtra = document.getElementById("modalExtra");
const modalExtraBody = document.getElementById("modalExtraBody");
const cerrarModalExtra = document.getElementById("cerrarModalExtra");

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

// ===================== REGISTRO =====================
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

// ===================== SNAPSHOTS =====================
function crearFilaEditable(tr, docu, tipo) {
  const d = docu.data();
  tr.dataset.id = docu.id;
  tr.innerHTML = tipo === "proveedor" ? `
      <td>${d.ruc}</td>
      <td>${d.nombre}</td>
      <td>${d.direccion || ""}</td>
      <td>${d.telefono || ""}</td>
      <td>
        <button class="btn-accion editar" data-id="${docu.id}" data-tipo="proveedor">✏️ Editar</button>
        <button class="btn-accion eliminar" data-id="${docu.id}" data-tipo="proveedor">🗑️</button>
      </td>` :
    tipo === "producto" ? `
      <td>${d.nombre}</td>
      <td>${d.cantidad}</td>
      <td>${d.precio}</td>
      <td>${d.descripcion || ""}</td>
      <td>
        <button class="btn-accion editar" data-id="${docu.id}" data-tipo="producto">✏️ Editar</button>
        <button class="btn-accion eliminar" data-id="${docu.id}" data-tipo="producto">🗑️</button>
      </td>` :
      `
      <td>${d.idFactura}</td>
      <td>${d.fecha}</td>
      <td>${d.proveedor}</td>
      <td>${d.producto}</td>
      <td>${d.monto}</td>
      <td>${d.tipo}</td>
      <td>
        <button class="btn-accion editar" data-id="${docu.id}" data-tipo="factura">✏️ Editar</button>
        <button class="btn-accion eliminar" data-id="${docu.id}" data-tipo="factura">🗑️</button>
      </td>`;
}

onSnapshot(colProveedores, snapshot => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach(docu => {
    const tr = document.createElement("tr");
    crearFilaEditable(tr, docu, "proveedor");
    tablaProveedores.appendChild(tr);
  });
  countProveedores.textContent = snapshot.size;
  cargarProveedoresSelect();
});

onSnapshot(colProductos, snapshot => {
  tablaProductos.innerHTML = "";
  snapshot.forEach(docu => {
    const tr = document.createElement("tr");
    crearFilaEditable(tr, docu, "producto");
    tablaProductos.appendChild(tr);
  });
  countProductos.textContent = snapshot.size;
  cargarProductosSelect();
});

onSnapshot(colFacturas, snapshot => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(docu => {
    const tr = document.createElement("tr");
    crearFilaEditable(tr, docu, "factura");
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
      div.style.padding = "5px";
      div.style.marginBottom = "3px";
      div.style.borderRadius = "5px";
      div.innerHTML = `<strong>${f.idFactura}</strong>`;
      div.addEventListener("click", () => {
        modalFacturaBody.innerHTML = `
          <h4>Factura ${f.idFactura}</h4>
          <p><b>Fecha:</b> ${f.fecha}</p>
          <p><b>Proveedor:</b> <span class="link-info" data-tipo="proveedor" data-nombre="${f.proveedor}" style="color:#f97316;">${f.proveedor}</span></p>
          <p><b>Producto:</b> <span class="link-info" data-tipo="producto" data-nombre="${f.producto}" style="color:#14b8a6;">${f.producto}</span></p>
          <p><b>Monto:</b> S/. ${f.monto}</p>
          <p><b>Tipo:</b> ${f.tipo}</p>
        `;
        modalFactura.showModal();
      });
      panelFacturas.appendChild(div);
    }
  });
});

// ===================== CERRAR MODALES =====================
cerrarModalFactura.addEventListener("click", () => modalFactura.close());
cerrarModalExtra.addEventListener("click", () => modalExtra.close());
cerrarModalEditar.addEventListener("click", () => modalEditar.close());

// ===================== CLICK GLOBAL =====================
document.addEventListener("click", async e => {
  // BOTON EDITAR LISTA
  if(e.target.classList.contains("editar")){
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    const docRef = doc(db, tipo === "proveedor" ? "proveedores" : tipo === "producto" ? "productos" : "facturas", id);
    const snap = await getDocs(query(tipo === "proveedor" ? colProveedores : tipo === "producto" ? colProductos : colFacturas, where("__name__", "==", id)));
    if(snap.empty) return;
    const d = snap.docs[0].data();
    
    // Generar formulario en modal
    let html = "";
    if(tipo === "proveedor"){
      html = `
        <label>RUC:</label><input type="text" id="editRuc" class="form-control" value="${d.ruc}">
        <label>Nombre:</label><input type="text" id="editNombre" class="form-control" value="${d.nombre}">
        <label>Dirección:</label><input type="text" id="editDireccion" class="form-control" value="${d.direccion || ''}">
        <label>Teléfono:</label><input type="text" id="editTelefono" class="form-control" value="${d.telefono || ''}">
        <button id="guardarEditar" class="btn btn-primary mt-2">Guardar</button>`;
    } else if(tipo === "producto"){
      html = `
        <label>Nombre:</label><input type="text" id="editNombre" class="form-control" value="${d.nombre}">
        <label>Cantidad:</label><input type="number" id="editCantidad" class="form-control" value="${d.cantidad}">
        <label>Precio:</label><input type="number" id="editPrecio" class="form-control" value="${d.precio}" step="0.01">
        <label>Descripción:</label><textarea id="editDescripcion" class="form-control">${d.descripcion || ''}</textarea>
        <button id="guardarEditar" class="btn btn-primary mt-2">Guardar</button>`;
    } else {
      html = `
        <label>ID Factura:</label><input type="text" id="editIdFactura" class="form-control" value="${d.idFactura}">
        <label>Fecha:</label><input type="date" id="editFecha" class="form-control" value="${d.fecha}">
        <label>Proveedor:</label><input type="text" id="editProveedor" class="form-control" value="${d.proveedor}">
        <label>Producto:</label><input type="text" id="editProducto" class="form-control" value="${d.producto}">
        <label>Monto:</label><input type="number" id="editMonto" class="form-control" value="${d.monto}" step="0.01">
        <label>Tipo:</label><input type="text" id="editTipo" class="form-control" value="${d.tipo}">
        <button id="guardarEditar" class="btn btn-primary mt-2">Guardar</button>`;
    }

    modalEditarBody.innerHTML = html;
    modalEditar.showModal();

    document.getElementById("guardarEditar").addEventListener("click", async () => {
      let dataEdit = {};
      if(tipo === "proveedor"){
        dataEdit = {
          ruc: document.getElementById("editRuc").value.trim(),
          nombre: document.getElementById("editNombre").value.trim(),
          direccion: document.getElementById("editDireccion").value.trim(),
          telefono: document.getElementById("editTelefono").value.trim()
        };
      } else if(tipo === "producto"){
        dataEdit = {
          nombre: document.getElementById("editNombre").value.trim(),
          cantidad: parseInt(document.getElementById("editCantidad").value),
          precio: parseFloat(document.getElementById("editPrecio").value),
          descripcion: document.getElementById("editDescripcion").value.trim()
        };
      } else {
        dataEdit = {
          idFactura: document.getElementById("editIdFactura").value.trim(),
          fecha: document.getElementById("editFecha").value,
          proveedor: document.getElementById("editProveedor").value.trim(),
          producto: document.getElementById("editProducto").value.trim(),
          monto: parseFloat(document.getElementById("editMonto").value),
          tipo: document.getElementById("editTipo").value.trim()
        };
      }
      await updateDoc(docRef, dataEdit);
      modalEditar.close();
    }, { once: true });
  }

  // VER DATOS DESDE PANEL FACTURA
  if(e.target.classList.contains("link-info")){
    const tipo = e.target.dataset.tipo;
    const nombre = e.target.dataset.nombre;
    if(!confirm(`Deseas ver los datos del ${tipo} "${nombre}"?`)) return;
    const col = tipo === "proveedor" ? colProveedores : colProductos;
    const snap = await getDocs(query(col, where("nombre", "==", nombre)));
    if(snap.empty){
      modalExtraBody.innerHTML = "<p>No se encontró información.</p>";
    } else {
      const d = snap.docs[0].data();
      modalExtraBody.innerHTML = tipo === "proveedor"
        ? `<h4>Proveedor</h4><p><b>Nombre:</b> ${d.nombre}</p><p><b>RUC:</b> ${d.ruc}</p><p><b>Dirección:</b> ${d.direccion}</p><p><b>Teléfono:</b> ${d.telefono}</p>`
        : `<h4>Producto</h4><p><b>Nombre:</b> ${d.nombre}</p><p><b>Cantidad:</b> ${d.cantidad}</p><p><b>Precio:</b> S/. ${d.precio}</p><p><b>Descripción:</b> ${d.descripcion}</p>`;
      modalExtra.showModal();
    }
  }

  // ELIMINAR
  if(e.target.classList.contains("eliminar")){
    if(!confirm("¿Seguro que deseas eliminar este registro?")) return;
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    const docRef =
      tipo === "proveedor"
        ? doc(db,"proveedores",id)
        : tipo === "producto"
        ? doc(db,"productos",id)
        : doc(db,"facturas",id);
    await deleteDoc(docRef);
  }
});
