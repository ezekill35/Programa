// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  deleteDoc, doc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// ===================== CONFIGURACIÓN FIREBASE =====================
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

// ===================== SEGURIDAD DE SESIÓN =====================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});

document.getElementById("btnCerrarSesion").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ===================== NAVEGACIÓN ENTRE SECCIONES =====================
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");

    const target = btn.dataset.target;
    document.querySelectorAll(".seccion").forEach(sec => sec.classList.remove("activa"));
    document.getElementById(target).classList.add("activa");
  });
});

// ===================== ACTUALIZAR LISTAS EN TIEMPO REAL =====================
const tablaProveedores = document.getElementById("tablaProveedores");
const tablaProductos = document.getElementById("tablaProductos");
const tablaFacturas = document.getElementById("tablaFacturas");
const proveedorSelect = document.getElementById("proveedorFactura");
const productoSelect = document.getElementById("productoFactura");

const colProveedores = collection(db, "proveedores");
const colProductos = collection(db, "productos");
const colFacturas = collection(db, "facturas");

// ===================== GENERADOR DE ID DE FACTURA =====================
let contadorFactura = 0;
function generarIdFactura() {
  contadorFactura++;
  return `FAC-${String(contadorFactura).padStart(4, "0")}`;
}

// ===================== IGV AUTOMÁTICO =====================
const subtotalInput = document.getElementById("subtotalFactura");
const igvInput = document.getElementById("igvFactura");
const totalInput = document.getElementById("totalFactura");

subtotalInput.addEventListener("input", () => {
  const subtotal = parseFloat(subtotalInput.value) || 0;
  const igv = subtotal * 0.18;
  const total = subtotal + igv;
  igvInput.value = igv.toFixed(2);
  totalInput.value = total.toFixed(2);
});

// ===================== MOSTRAR MOTIVO SI ES NOTA =====================
const tipoFacturaSelect = document.getElementById("tipoFactura");
const campoMotivo = document.getElementById("campoMotivo");

tipoFacturaSelect.addEventListener("change", () => {
  const tipo = tipoFacturaSelect.value;
  campoMotivo.style.display =
    tipo === "Nota de crédito" || tipo === "Nota de débito" ? "block" : "none";
});

// ===================== REGISTRAR PROVEEDOR =====================
document.getElementById("formProveedor").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    ruc: rucProveedor.value,
    nombre: nombreProveedor.value,
    direccion: direccionProveedor.value,
    telefono: telefonoProveedor.value
  };
  await addDoc(colProveedores, data);
  e.target.reset();
});

// ===================== REGISTRAR PRODUCTO =====================
document.getElementById("formProducto").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    nombre: nombreProducto.value,
    presentacion: presentacionProducto.value,
    cantidad: cantidadPresentacion.value,
    precio: precioProducto.value,
    descripcion: descripcionProducto.value
  };
  await addDoc(colProductos, data);
  e.target.reset();
});

// ===================== REGISTRAR FACTURA =====================
document.getElementById("formFactura").addEventListener("submit", async (e) => {
  e.preventDefault();
  const idFactura = generarIdFactura();
  const data = {
    idFactura,
    fecha: fechaFactura.value,
    tipo: tipoFactura.value,
    motivo: motivoFactura.value || "",
    proveedor: proveedorFactura.value,
    producto: productoFactura.value,
    subtotal: subtotalFactura.value,
    igv: igvFactura.value,
    total: totalFactura.value
  };
  await addDoc(colFacturas, data);
  e.target.reset();
  document.getElementById("idFactura").value = generarIdFactura();
});

// ===================== LISTAS EN TIEMPO REAL =====================
onSnapshot(colProveedores, (snapshot) => {
  tablaProveedores.innerHTML = "";
  proveedorSelect.innerHTML = '<option value="">Seleccionar proveedor</option>';
  snapshot.forEach(docu => {
    const p = docu.data();
    tablaProveedores.innerHTML += `
      <tr>
        <td>${p.ruc}</td>
        <td>${p.nombre}</td>
        <td>${p.direccion}</td>
        <td>${p.telefono}</td>
        <td>
          <button class="btn-accion text-primary" data-edit-prov="${docu.id}">✏️</button>
          <button class="btn-accion text-danger" data-del-prov="${docu.id}">🗑️</button>
        </td>
      </tr>`;
    proveedorSelect.innerHTML += `<option value="${p.nombre}">${p.nombre}</option>`;
  });
  document.getElementById("countProveedores").textContent = snapshot.size;
});

onSnapshot(colProductos, (snapshot) => {
  tablaProductos.innerHTML = "";
  productoSelect.innerHTML = '<option value="">Seleccionar producto</option>';
  snapshot.forEach(docu => {
    const p = docu.data();
    tablaProductos.innerHTML += `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.presentacion}</td>
        <td>${p.cantidad}</td>
        <td>S/. ${p.precio}</td>
        <td>${p.descripcion}</td>
        <td>
          <button class="btn-accion text-primary" data-edit-prod="${docu.id}">✏️</button>
          <button class="btn-accion text-danger" data-del-prod="${docu.id}">🗑️</button>
        </td>
      </tr>`;
    productoSelect.innerHTML += `<option value="${p.nombre}">${p.nombre}</option>`;
  });
  document.getElementById("countProductos").textContent = snapshot.size;
});

onSnapshot(colFacturas, (snapshot) => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(docu => {
    const f = docu.data();
    tablaFacturas.innerHTML += `
      <tr>
        <td>${f.idFactura}</td>
        <td>${f.fecha}</td>
        <td>${f.proveedor}</td>
        <td>${f.producto}</td>
        <td>S/. ${f.subtotal}</td>
        <td>S/. ${f.igv}</td>
        <td>S/. ${f.total}</td>
        <td>${f.tipo}</td>
        <td>
          <button class="btn-accion text-info" data-view="${docu.id}">👁️</button>
          <button class="btn-accion text-primary" data-edit-fact="${docu.id}">✏️</button>
          <button class="btn-accion text-danger" data-del-fact="${docu.id}">🗑️</button>
        </td>
      </tr>`;
  });
  document.getElementById("countFacturas").textContent = snapshot.size;
});

// ===================== ELIMINAR REGISTROS =====================
document.addEventListener("click", async (e) => {
  if (e.target.dataset.delProv) await deleteDoc(doc(db, "proveedores", e.target.dataset.delProv));
  if (e.target.dataset.delProd) await deleteDoc(doc(db, "productos", e.target.dataset.delProd));
  if (e.target.dataset.delFact) await deleteDoc(doc(db, "facturas", e.target.dataset.delFact));
});

// ===================== DETALLE DE FACTURA =====================
const modalFactura = document.getElementById("modalFactura");
const modalFacturaBody = document.getElementById("modalFacturaBody");
document.getElementById("cerrarModalFactura").onclick = () => modalFactura.close();

document.addEventListener("click", async (e) => {
  if (e.target.dataset.view) {
    const id = e.target.dataset.view;
    const docs = await getDocs(colFacturas);
    docs.forEach(docu => {
      if (docu.id === id) {
        const f = docu.data();
        modalFacturaBody.innerHTML = `
          <h4>Detalle de Factura</h4>
          <p><strong>${f.idFactura}</strong></p>
          <p>Fecha: ${f.fecha}</p>
          <p>Proveedor: <span class="link-info">${f.proveedor}</span></p>
          <p>Producto: <span class="link-info">${f.producto}</span></p>
          <p>Subtotal: S/. ${f.subtotal}</p>
          <p>IGV (18%): S/. ${f.igv}</p>
          <p><strong>Total: S/. ${f.total}</strong></p>
          <p>Tipo: ${f.tipo}${f.motivo ? ` — ${f.motivo}` : ""}</p>`;
        modalFactura.showModal();
      }
    });
  }
});

// ===================== BUSCADOR =====================
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
searchInput.addEventListener("input", async () => {
  const term = searchInput.value.toLowerCase();
  searchResults.innerHTML = "";
  if (!term) return;

  const facturasSnap = await getDocs(colFacturas);
  facturasSnap.forEach(docu => {
    const f = docu.data();
    if (f.producto.toLowerCase().includes(term) || f.proveedor.toLowerCase().includes(term)) {
      searchResults.innerHTML += `
        <div class="resultado-item" data-view="${docu.id}">
          <strong>${f.idFactura}</strong> — ${f.proveedor} — ${f.producto} — Total: S/. ${f.total}
        </div>`;
    }
  });
});
