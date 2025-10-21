// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  getAuth, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

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
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html";
  }
});

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ===================== VARIABLES =====================
const tablaProveedores = document.getElementById("tablaProveedores");
const tablaProductos = document.getElementById("tablaProductos");
const tablaFacturas = document.getElementById("tablaFacturas");

// ===================== CRUD: PROVEEDORES =====================
const formProveedor = document.getElementById("formProveedor");
const colProveedores = collection(db, "proveedores");

formProveedor.addEventListener("submit", async (e) => {
  e.preventDefault();
  const tipo = document.getElementById("tipoProveedor").value;
  const nombre = document.getElementById("nombreProveedor").value;
  const direccion = document.getElementById("direccionProveedor").value;
  const telefono = document.getElementById("telefonoProveedor").value;

  await addDoc(colProveedores, { tipo, nombre, direccion, telefono });
  formProveedor.reset();
  showToast("Proveedor registrado correctamente ✅");
});

onSnapshot(colProveedores, (snapshot) => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach((docu) => {
    const d = docu.data();
    tablaProveedores.innerHTML += `
      <tr>
        <td>${d.tipo}</td>
        <td>${d.nombre}</td>
        <td>${d.direccion}</td>
        <td>${d.telefono || "-"}</td>
        <td>
          <button class="btn btn-sm btn-warning editarProveedor" data-id="${docu.id}">✏️</button>
          <button class="btn btn-sm btn-danger eliminarProveedor" data-id="${docu.id}">🗑️</button>
        </td>
      </tr>
    `;
  });
});

// ===================== CRUD: PRODUCTOS =====================
const formProducto = document.getElementById("formProducto");
const colProductos = collection(db, "productos");

formProducto.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value;
  const presentacion = document.getElementById("presentacionProducto").value;
  const cantidad = document.getElementById("cantidadProducto").value;
  const precio = document.getElementById("precioProducto").value;
  const moneda = document.getElementById("monedaProducto").value;
  const descripcion = document.getElementById("descripcionProducto").value;

  await addDoc(colProductos, { nombre, presentacion, cantidad, precio, moneda, descripcion });
  formProducto.reset();
  showToast("Producto registrado correctamente 🛒");
});

onSnapshot(colProductos, (snapshot) => {
  tablaProductos.innerHTML = "";
  snapshot.forEach((docu) => {
    const d = docu.data();
    tablaProductos.innerHTML += `
      <tr>
        <td>${d.nombre}</td>
        <td>${d.presentacion} (${d.cantidad})</td>
        <td>${d.moneda} ${d.precio}</td>
        <td>${d.descripcion || "-"}</td>
        <td>
          <button class="btn btn-sm btn-warning editarProducto" data-id="${docu.id}">✏️</button>
          <button class="btn btn-sm btn-danger eliminarProducto" data-id="${docu.id}">🗑️</button>
        </td>
      </tr>
    `;
  });
});

// ===================== CRUD: FACTURAS =====================
const formFactura = document.getElementById("formFactura");
const colFacturas = collection(db, "facturas");

formFactura.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fecha = document.getElementById("fechaFactura").value;
  const tipo = document.getElementById("tipoFactura").value;
  const proveedor = document.getElementById("proveedorFactura").value;
  const producto = document.getElementById("productoFactura").value;
  const subtotal = parseFloat(document.getElementById("montoFactura").value);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  await addDoc(colFacturas, { fecha, tipo, proveedor, producto, subtotal, igv, total });
  formFactura.reset();
  showToast("Factura registrada correctamente 🧾");
});

onSnapshot(colFacturas, (snapshot) => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach((docu) => {
    const d = docu.data();
    tablaFacturas.innerHTML += `
      <tr>
        <td>${docu.id}</td>
        <td>${d.fecha}</td>
        <td><a href="#" class="detalleProveedor" data-nombre="${d.proveedor}">${d.proveedor}</a></td>
        <td><a href="#" class="detalleProducto" data-nombre="${d.producto}">${d.producto}</a></td>
        <td>S/. ${d.subtotal.toFixed(2)}</td>
        <td>S/. ${d.igv.toFixed(2)}</td>
        <td>S/. ${d.total.toFixed(2)}</td>
        <td>${d.tipo}</td>
        <td>
          <button class="btn btn-sm btn-danger eliminarFactura" data-id="${docu.id}">🗑️</button>
        </td>
      </tr>
    `;
  });
});

// ===================== PANEL FLOTANTE DE DETALLE =====================
const panelFlotante = document.getElementById("panelFlotante");
const panelContenido = document.getElementById("panelContenido");
const cerrarPanel = document.getElementById("cerrarPanel");

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("detalleProveedor")) {
    e.preventDefault();
    const nombre = e.target.dataset.nombre;
    const q = await getDocs(colProveedores);
    let proveedor = "";
    q.forEach(d => {
      const data = d.data();
      if (data.nombre === nombre) {
        proveedor = `
          <h4>Proveedor: ${data.nombre}</h4>
          <p><strong>Tipo:</strong> ${data.tipo}</p>
          <p><strong>Dirección:</strong> ${data.direccion}</p>
          <p><strong>Teléfono:</strong> ${data.telefono || "-"}</p>
        `;
      }
    });
    panelContenido.innerHTML = proveedor || "<p>No se encontró información del proveedor.</p>";
    panelFlotante.classList.add("visible");
  }

  if (e.target.classList.contains("detalleProducto")) {
    e.preventDefault();
    const nombre = e.target.dataset.nombre;
    const q = await getDocs(colProductos);
    let producto = "";
    q.forEach(d => {
      const data = d.data();
      if (data.nombre === nombre) {
        producto = `
          <h4>Producto: ${data.nombre}</h4>
          <p><strong>Presentación:</strong> ${data.presentacion}</p>
          <p><strong>Cantidad:</strong> ${data.cantidad}</p>
          <p><strong>Precio:</strong> ${data.moneda} ${data.precio}</p>
          <p><strong>Descripción:</strong> ${data.descripcion || "-"}</p>
        `;
      }
    });
    panelContenido.innerHTML = producto || "<p>No se encontró información del producto.</p>";
    panelFlotante.classList.add("visible");
  }

  if (e.target === cerrarPanel) {
    panelFlotante.classList.remove("visible");
  }
});

// ===================== TOAST =====================
function showToast(msg) {
  const toast = document.createElement("div");
  toast.className = "toast-notify";
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}


