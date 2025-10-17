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

const panelFactura = document.getElementById("panelFactura");
const panelFacturaBody = document.getElementById("panelFacturaBody");
const cerrarPanelFactura = document.getElementById("cerrarPanelFactura");

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
    // Mostrar buscador solo en facturas
    buscador.style.display = btn.dataset.target === "facturas" ? "block" : "none";
    buscador.value = "";
    panelFacturas.innerHTML = "";
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

function mostrarPanelFactura(f) {
  panelFacturaBody.innerHTML = `
    <h5>Factura ID: ${f.idFactura}</h5>
    <p><b>Fecha:</b> ${f.fecha}</p>
    <p><b>Proveedor:</b> <span class="link-info" data-tipo="proveedor" data-nombre="${f.proveedor}">${f.proveedor}</span></p>
    <p><b>Producto:</b> <span class="link-info" data-tipo="producto" data-nombre="${f.producto}">${f.producto}</span></p>
    <p><b>Monto:</b> S/. ${f.monto}</p>
    <p><b>Tipo:</b> ${f.tipo}</p>
  `;
  panelFactura.showModal();
}

// ===================== CERRAR MODALES =====================
cerrarModalExtra.addEventListener("click", () => modalExtra.close());
cerrarPanelFactura.addEventListener("click", () => panelFactura.close());

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
      <td contenteditable="true" class="editable" data-field="ruc">${d.ruc}</td>
      <td contenteditable="true" class="editable" data-field="nombre">${d.nombre}</td>
      <td contenteditable="true" class="editable" data-field="direccion">${d.direccion || ""}</td>
      <td contenteditable="true" class="editable" data-field="telefono">${d.telefono || ""}</td>
      <td>
        <button class="btn-accion eliminar" data-id="${docu.id}" data-tipo="proveedor">🗑️</button>
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
      <td contenteditable="true" class="editable" data-field="nombre">${d.nombre}</td>
      <td contenteditable="true" class="editable" data-field="cantidad">${d.cantidad}</td>
      <td contenteditable="true" class="editable" data-field="precio">${d.precio}</td>
      <td contenteditable="true" class="editable" data-field="descripcion" style="white-space: pre-line;">${d.descripcion || ""}</td>
      <td>
        <button class="btn-accion eliminar" data-id="${docu.id}" data-tipo="producto">🗑️</button>
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
      <td contenteditable="true" class="editable" data-field="idFactura">${f.idFactura}</td>
      <td contenteditable="true" class="editable" data-field="fecha">${f.fecha}</td>
      <td contenteditable="true" class="editable" data-field="proveedor">${f.proveedor}</td>
      <td contenteditable="true" class="editable" data-field="producto">${f.producto}</td>
      <td contenteditable="true" class="editable" data-field="monto">${f.monto}</td>
      <td contenteditable="true" class="editable" data-field="tipo">${f.tipo}</td>
      <td>
        <button class="btn-accion eliminar" data-id="${docu.id}" data-tipo="factura">🗑️</button>
        <button class="btn-accion ver" data-tipo="factura">🔍</button>
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
      div.innerHTML = `<strong>${f.idFactura}</strong>`;
      div.addEventListener("click", () => mostrarPanelFactura(f));
      panelFacturas.appendChild(div);
    }
  });
});

// ===================== CLICK GLOBAL =====================
document.addEventListener("click", async e => {
  // EDIT INLINE EN LA TABLA
  if (e.target.classList.contains("editable")) {
    e.target.addEventListener("blur", async ev => {
      const campo = ev.target.dataset.field;
      const valor = ev.target.textContent.trim();
      const id = ev.target.closest("tr").dataset.id;
      const tipo = ev.target.closest("tr").querySelector(".eliminar").dataset.tipo;
      await updateDoc(doc(db, tipo + "s", id), { [campo]: valor });
    }, { once: true });
  }

  // ELIMINAR
  if (e.target.classList.contains("eliminar")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    if (confirm("¿Deseas eliminar este registro?")) {
      await deleteDoc(doc(db, tipo + "s", id));
    }
  }

  // VER DATOS DESDE PANEL FACTURA
  if (e.target.classList.contains("link-info")) {
    const nombre = e.target.dataset.nombre;
    const tipo = e.target.dataset.tipo;
    if (confirm(`¿Deseas ver los datos de ${tipo}: ${nombre}?`)) {
      let col = tipo === "proveedor" ? colProveedores : colProductos;
      const q = query(col, where("nombre", "==", nombre));
      const snap = await getDocs(q);
      snap.forEach(docu => {
        const d = docu.data();
        let html = "<h5>Detalle " + tipo + "</h5>";
        for (const key in d) {
          html += `<p><b>${key}:</b> ${d[key]}</p>`;
        }
        modalExtraBody.innerHTML = html;
        modalExtra.showModal();
      });
    }
  }

  // VER FACTURA DESDE LISTA
  if (e.target.classList.contains("ver")) {
    const tr = e.target.closest("tr");
    const id = tr.dataset.id;
    const docu = await getDocs(query(colFacturas, where("__name__", "==", id)));
    docu.forEach(d => mostrarPanelFactura(d.data()));
  }
});
