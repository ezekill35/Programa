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
        <button class="btn-accion editar" data-id="${docu.id}" data-tipo="proveedor">✏️</button>
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
    tr.innerHTML = `
      <td>${d.nombre}</td>
      <td>${d.cantidad}</td>
      <td>${d.precio}</td>
      <td style="white-space: pre-line;">${d.descripcion}</td>
      <td>
        <button class="btn-accion editar" data-id="${docu.id}" data-tipo="producto">✏️</button>
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
        <button class="btn-accion editar" data-id="${docu.id}" data-tipo="factura">✏️</button>
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
    if(f.producto.toLowerCase().includes(texto)){
      const div = document.createElement("div");
      div.className = "resultado-item";
      div.textContent = f.idFactura;
      div.style.cursor = "pointer";
      div.addEventListener("click", () => mostrarModalFactura(f));
      panelFacturas.appendChild(div);
    }
  });
});

// ===================== CLICK GLOBAL =====================
document.addEventListener("click", async e => {
  // EDITAR EN LISTA
  if(e.target.classList.contains("editar")){
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    const tr = e.target.closest("tr");

    const docRef = doc(db, tipo==="proveedor"?"proveedores":tipo==="producto"?"productos":"facturas", id);
    const celdas = tr.querySelectorAll("td");
    
    // Mostrar panel flotante con valores actuales
    let html = `<h4>Editar ${tipo}</h4>`;
    if(tipo==="proveedor"){
      html += `
        <label>RUC:<input type="text" id="editRuc" value="${celdas[0].textContent}"></label>
        <label>Nombre:<input type="text" id="editNombre" value="${celdas[1].textContent}"></label>
        <label>Dirección:<input type="text" id="editDireccion" value="${celdas[2].textContent}"></label>
        <label>Teléfono:<input type="text" id="editTelefono" value="${celdas[3].textContent}"></label>`;
    } else if(tipo==="producto"){
      html += `
        <label>Nombre:<input type="text" id="editNombre" value="${celdas[0].textContent}"></label>
        <label>Cantidad:<input type="number" id="editCantidad" value="${celdas[1].textContent}"></label>
        <label>Precio:<input type="number" id="editPrecio" value="${celdas[2].textContent}"></label>
        <label>Descripción:<textarea id="editDescripcion">${celdas[3].textContent}</textarea></label>`;
    } else {
      html += `
        <label>ID:<input type="text" id="editIdFactura" value="${celdas[0].textContent}"></label>
        <label>Fecha:<input type="date" id="editFecha" value="${celdas[1].textContent}"></label>
        <label>Proveedor:<input type="text" id="editProveedor" value="${celdas[2].textContent}"></label>
        <label>Producto:<input type="text" id="editProducto" value="${celdas[3].textContent}"></label>
        <label>Monto:<input type="number" id="editMonto" value="${celdas[4].textContent}"></label>
        <label>Tipo:<input type="text" id="editTipo" value="${celdas[5].textContent}"></label>`;
    }
    html += `<button id="btnGuardarEdit">Guardar</button>`;
    modalExtraBody.innerHTML = html;
    modalExtra.showModal();

    document.getElementById("btnGuardarEdit").addEventListener("click", async () => {
      if(tipo==="proveedor"){
        await updateDoc(docRef, {
          ruc: document.getElementById("editRuc").value,
          nombre: document.getElementById("editNombre").value,
          direccion: document.getElementById("editDireccion").value,
          telefono: document.getElementById("editTelefono").value
        });
      } else if(tipo==="producto"){
        await updateDoc(docRef, {
          nombre: document.getElementById("editNombre").value,
          cantidad: parseInt(document.getElementById("editCantidad").value),
          precio: parseFloat(document.getElementById("editPrecio").value),
          descripcion: document.getElementById("editDescripcion").value
        });
      } else {
        await updateDoc(docRef, {
          idFactura: document.getElementById("editIdFactura").value,
          fecha: document.getElementById("editFecha").value,
          proveedor: document.getElementById("editProveedor").value,
          producto: document.getElementById("editProducto").value,
          monto: parseFloat(document.getElementById("editMonto").value),
          tipo: document.getElementById("editTipo").value
        });
      }
      modalExtra.close();
    });
  }

  // VER PROVEEDOR / PRODUCTO DESDE MODAL FACTURA
  if(e.target.classList.contains("link-info")){
    const tipo = e.target.dataset.tipo;
    const nombre = e.target.dataset.nombre;

    if(!confirm(`¿Deseas ver los datos del ${tipo} ${nombre}?`)) return;

    const col = tipo==="proveedor"?colProveedores:colProductos;
    const snap = await getDocs(col);
    let docEncontrado = null;
    snap.forEach(docu => {
      const d = docu.data();
      if(d.nombre.trim().toLowerCase() === nombre.trim().toLowerCase()) docEncontrado = d;
    });

    if(!docEncontrado){
      modalExtraBody.innerHTML = `<p>No se encontró información del ${tipo} ${nombre}.</p>`;
    } else {
      let html = `<h3>${tipo.toUpperCase()}: ${docEncontrado.nombre}</h3>`;
      if(tipo==="proveedor"){
        html += `<p><b>RUC:</b> ${docEncontrado.ruc}</p>
                 <p><b>Dirección:</b> ${docEncontrado.direccion || "-"}</p>
                 <p><b>Teléfono:</b> ${docEncontrado.telefono || "-"}</p>`;
      } else {
        html += `<p><b>Cantidad:</b> ${docEncontrado.cantidad}</p>
                 <p><b>Precio:</b> ${docEncontrado.precio}</p>
                 <p><b>Descripción:</b> <span style="white-space: pre-line;">${docEncontrado.descripcion}</span></p>`;
      }
      modalExtraBody.innerHTML = html;
      modalExtra.showModal();
    }
  }
});

