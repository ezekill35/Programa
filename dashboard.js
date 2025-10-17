// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, doc, deleteDoc, query, where, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
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

const panelDerecho = document.getElementById("panelDerecho");
const contenidoPanel = document.getElementById("contenidoPanel");
const cerrarPanel = document.getElementById("cerrarPanel");

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
    buscador.style.display = (btn.dataset.target === "facturas") ? "block" : "none";
    panelFacturas.innerHTML = "";
    panelDerecho.style.display = "none";
  });
});

// ===================== CARGAR SELECTS =====================
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

// ===================== CRUD PROVEEDORES =====================
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

// ===================== CRUD PRODUCTOS =====================
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
      <td contenteditable="true" class="editable" data-field="descripcion">${d.descripcion || ""}</td>
      <td>
        <button class="btn-accion eliminar" data-id="${docu.id}" data-tipo="producto">🗑️</button>
      </td>`;
    tablaProductos.appendChild(tr);
  });
  countProductos.textContent = snapshot.size;
  cargarProductosSelect();
});

// ===================== CRUD FACTURAS =====================
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
      </td>`;
    tablaFacturas.appendChild(tr);
  });
  countFacturas.textContent = snapshot.size;
});

// ===================== EDIT INLINE =====================
document.addEventListener("blur", async e => {
  if (e.target.classList.contains("editable")) {
    const tr = e.target.closest("tr");
    const tipo = tr.querySelector(".eliminar").dataset.tipo;
    const id = tr.dataset.id;
    const docRef = doc(db, tipo === "proveedor" ? "proveedores" : tipo === "producto" ? "productos" : "facturas", id);
    const celdas = tr.querySelectorAll(".editable");
    let data = {};
    celdas.forEach(td => {
      const field = td.dataset.field;
      let val = td.textContent.trim();
      if (field === "cantidad") val = parseInt(val) || 0;
      if (field === "precio" || field === "monto") val = parseFloat(val) || 0;
      data[field] = val;
    });
    await updateDoc(docRef, data);
  }
}, true);

// ===================== ELIMINAR =====================
document.addEventListener("click", async e => {
  if (e.target.classList.contains("eliminar")) {
    if (!confirm("¿Seguro que deseas eliminar este registro?")) return;
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    const docRef = doc(db, tipo === "proveedor" ? "proveedores" : tipo === "producto" ? "productos" : "facturas", id);
    await deleteDoc(docRef);
  }
});

// ===================== BUSCADOR =====================
buscador.addEventListener("input", async () => {
  const texto = buscador.value.trim().toLowerCase();
  panelFacturas.innerHTML = "";
  panelDerecho.style.display = "none";
  if (!texto) return;

  const snap = await getDocs(colFacturas);
  snap.forEach(docu => {
    const f = docu.data();
    if (f.producto.toLowerCase().includes(texto)) {
      const div = document.createElement("div");
      div.className = "resultado-item";
      div.style.background="#fef9c3";
      div.innerHTML = `<strong>${f.idFactura}</strong>`;
      div.addEventListener("click", () => mostrarFacturaPanel(f));
      panelFacturas.appendChild(div);
    }
  });
});

// ===================== MOSTRAR FACTURA EN PANEL =====================
function mostrarFacturaPanel(f) {
  panelDerecho.style.display = "block";
  contenidoPanel.innerHTML = `
    <h4>Factura: ${f.idFactura}</h4>
    <p><b>Fecha:</b> ${f.fecha}</p>
    <p><b>Monto:</b> S/. ${f.monto}</p>
    <p><b>Tipo:</b> ${f.tipo}</p>
    <p><b>Proveedor:</b> <span class="link-info" data-tipo="proveedor" data-nombre="${f.proveedor}" style="color:#f97316; cursor:pointer;">${f.proveedor}</span></p>
    <p><b>Producto:</b> <span class="link-info" data-tipo="producto" data-nombre="${f.producto}" style="color:#14b8a6; cursor:pointer;">${f.producto}</span></p>
  `;
}

// ===================== PANEL PROVEEDOR/PRODUCTO =====================
document.addEventListener("click", async e => {
  if (e.target.classList.contains("link-info")) {
    const tipo = e.target.dataset.tipo;
    const nombre = e.target.dataset.nombre;
    if (!confirm(`¿Deseas ver los datos de este ${tipo}?`)) return;
    const col = tipo === "proveedor" ? colProveedores : colProductos;
    const snap = await getDocs(query(col, where("nombre","==",nombre)));
    if (snap.empty) {
      contenidoPanel.innerHTML = `<p>No se encontró información.</p>`;
    } else {
      const d = snap.docs[0].data();
      if(tipo==="proveedor"){
        contenidoPanel.innerHTML = `
          <h4>Proveedor: ${d.nombre}</h4>
          <p><b>RUC:</b> ${d.ruc}</p>
          <p><b>Dirección:</b> ${d.direccion}</p>
          <p><b>Teléfono:</b> ${d.telefono}</p>
        `;
      } else {
        contenidoPanel.innerHTML = `
          <h4>Producto: ${d.nombre}</h4>
          <p><b>Cantidad:</b> ${d.cantidad}</p>
          <p><b>Precio:</b> S/. ${d.precio}</p>
          <p><b>Descripción:</b><br>${d.descripcion.replace(/\n/g,"<br>")}</p>
        `;
      }
    }
  }
});

// ===================== CERRAR PANEL =====================
cerrarPanel.addEventListener("click",()=>{panelDerecho.style.display="none";});



