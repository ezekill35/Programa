// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, getDocs
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// --- Configuración Firebase ---
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

// ===================== SESIÓN =====================
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
});

document.getElementById("btnCerrarSesion").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ===================== COLECCIONES =====================
const colProveedores = collection(db, "proveedores");
const colProductos = collection(db, "productos");
const colFacturas = collection(db, "facturas");

// ===================== ELEMENTOS =====================
const tablaProveedores = document.getElementById("tablaProveedores");
const tablaProductos = document.getElementById("tablaProductos");
const tablaFacturas = document.getElementById("tablaFacturas");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

const tipoFactura = document.getElementById("tipoFactura");
const campoExtraFactura = document.getElementById("campoExtraFactura");
const detalleExtra = document.getElementById("detalleExtra");

// ===================== CAMBIO DE SECCIÓN =====================
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("activo"));
    document.querySelectorAll(".seccion").forEach(s => s.classList.remove("activa"));
    btn.classList.add("activo");
    document.getElementById(btn.dataset.target).classList.add("activa");
  });
});

// ===================== FUNCIONES AUXILIARES =====================
async function cargarProveedoresSelect() {
  const select = document.getElementById("proveedorFactura");
  select.innerHTML = '<option value="">Seleccionar proveedor</option>';
  const snap = await getDocs(colProveedores);
  snap.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.data().nombre;
    opt.textContent = d.data().nombre;
    select.appendChild(opt);
  });
}

async function cargarProductosSelect() {
  const select = document.getElementById("productoFactura");
  select.innerHTML = '<option value="">Seleccionar producto</option>';
  const snap = await getDocs(colProductos);
  snap.forEach(d => {
    const prod = d.data();
    const opt = document.createElement("option");
    opt.value = prod.nombre;
    opt.textContent = `${prod.nombre} (${prod.presentacion})`;
    select.appendChild(opt);
  });
}

function generarIdFactura() {
  return "FAC-" + Date.now().toString().slice(-6);
}

function calcularIGVyTotal() {
  const subtotal = parseFloat(document.getElementById("subtotalFactura").value) || 0;
  const igv = subtotal * 0.18;
  const total = subtotal + igv;
  document.getElementById("igvFactura").value = igv.toFixed(2);
  document.getElementById("totalFactura").value = total.toFixed(2);
}

// ===================== CAMBIO DE TIPO DE FACTURA =====================
tipoFactura.addEventListener("change", () => {
  const valor = tipoFactura.value;
  campoExtraFactura.style.display = (valor === "Nota de crédito" || valor === "Nota de débito") ? "block" : "none";
});

// ===================== PROVEEDORES =====================
document.getElementById("formProveedor").addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    tipoDocumento: document.getElementById("tipoDocumentoProveedor").value,
    numeroDocumento: document.getElementById("numeroDocumentoProveedor").value.trim(),
    nombre: document.getElementById("nombreProveedor").value.trim(),
    telefono: document.getElementById("telefonoProveedor").value.trim(),
    direccion: document.getElementById("direccionProveedor").value.trim()
  };
  await addDoc(colProveedores, data);
  e.target.reset();
});

onSnapshot(colProveedores, snapshot => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach(docu => {
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.tipoDocumento}</td>
      <td>${d.numeroDocumento}</td>
      <td>${d.nombre}</td>
      <td>${d.telefono || ""}</td>
      <td>${d.direccion || ""}</td>
      <td>
        <button class="btn-editar" data-tipo="proveedor" data-id="${docu.id}">✏️</button>
        <button class="btn-eliminar" data-tipo="proveedor" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaProveedores.appendChild(tr);
  });
  cargarProveedoresSelect();
});

// ===================== PRODUCTOS =====================
document.getElementById("formProducto").addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    nombre: document.getElementById("nombreProducto").value.trim(),
    presentacion: document.getElementById("presentacionProducto").value,
    cantidadPresentacion: document.getElementById("cantidadPresentacion").value.trim(),
    precio: parseFloat(document.getElementById("precioProducto").value),
    descripcion: document.getElementById("descripcionProducto").value.trim()
  };
  await addDoc(colProductos, data);
  e.target.reset();
});

onSnapshot(colProductos, snapshot => {
  tablaProductos.innerHTML = "";
  snapshot.forEach(docu => {
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.nombre}</td>
      <td>${d.presentacion}${d.cantidadPresentacion ? " (" + d.cantidadPresentacion + ")" : ""}</td>
      <td>S/. ${d.precio.toFixed(2)}</td>
      <td>${d.descripcion || ""}</td>
      <td>
        <button class="btn-editar" data-tipo="producto" data-id="${docu.id}">✏️</button>
        <button class="btn-eliminar" data-tipo="producto" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaProductos.appendChild(tr);
  });
  cargarProductosSelect();
});

// ===================== FACTURAS =====================
document.getElementById("subtotalFactura").addEventListener("input", calcularIGVyTotal);
document.getElementById("idFactura").value = generarIdFactura();

document.getElementById("formFactura").addEventListener("submit", async e => {
  e.preventDefault();
  const idAuto = generarIdFactura();
  const subtotal = parseFloat(document.getElementById("subtotalFactura").value) || 0;
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  const data = {
    idFactura: idAuto,
    fecha: document.getElementById("fechaFactura").value,
    tipo: tipoFactura.value,
    detalleExtra: detalleExtra.value.trim(),
    proveedor: document.getElementById("proveedorFactura").value,
    producto: document.getElementById("productoFactura").value,
    subtotal,
    igv,
    total
  };

  await addDoc(colFacturas, data);
  e.target.reset();
  document.getElementById("idFactura").value = generarIdFactura();
});

onSnapshot(colFacturas, snapshot => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(docu => {
    const f = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.idFactura}</td>
      <td>${f.fecha}</td>
      <td>${f.proveedor}</td>
      <td>${f.producto}</td>
      <td>S/. ${f.subtotal.toFixed(2)}</td>
      <td>S/. ${f.igv.toFixed(2)}</td>
      <td><b>S/. ${f.total.toFixed(2)}</b></td>
      <td>${f.tipo}${f.detalleExtra ? " (" + f.detalleExtra + ")" : ""}</td>
      <td>
        <button class="btn-editar" data-tipo="factura" data-id="${docu.id}">✏️</button>
        <button class="btn-eliminar" data-tipo="factura" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  });
});

// ===================== BUSCADOR =====================
searchInput.addEventListener("input", async () => {
  const q = searchInput.value.toLowerCase().trim();
  searchResults.innerHTML = "";
  if (!q) return;

  const resProds = await getDocs(colProductos);
  const resFacts = await getDocs(colFacturas);

  resProds.forEach(docu => {
    const d = docu.data();
    if (d.nombre.toLowerCase().includes(q)) {
      const div = document.createElement("div");
      div.className = "resultado-item";
      div.textContent = "Producto: " + d.nombre;
      div.onclick = () => alert(`Producto: ${d.nombre}\nPresentación: ${d.presentacion}\nPrecio: S/. ${d.precio}`);
      searchResults.appendChild(div);
    }
  });

  resFacts.forEach(docu => {
    const f = docu.data();
    if (f.idFactura.toLowerCase().includes(q) || f.proveedor.toLowerCase().includes(q)) {
      const div = document.createElement("div");
      div.className = "resultado-item";
      div.textContent = "Factura: " + f.idFactura + " - " + f.proveedor;
      div.onclick = () => alert(
        `Factura ${f.idFactura}\nProveedor: ${f.proveedor}\nProducto: ${f.producto}\nSubtotal: S/. ${f.subtotal}\nIGV: S/. ${f.igv}\nTotal: S/. ${f.total}`
      );
      searchResults.appendChild(div);
    }
  });
});

// ===================== ELIMINAR =====================
document.addEventListener("click", async e => {
  if (e.target.classList.contains("btn-eliminar")) {
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    if (confirm("¿Eliminar registro?")) {
      const ref = doc(db, tipo + "es", id);
      await deleteDoc(ref);
    }
  }
});

  }
});

// ===================== ID AUTOMÁTICO =====================
document.getElementById("idFactura").value = generarIdFactura();
