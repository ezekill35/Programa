// ==================== CONFIG FIREBASE ====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ✅ Configura con tus credenciales Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:1234567890abcdef"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==================== CRUD COMPLETO ====================

const proveedoresCol = collection(db, "proveedores");
const productosCol = collection(db, "productos");
const facturasCol = collection(db, "facturas");

// Cambiar secciones
const botonesMenu = document.querySelectorAll(".menu-btn");
const secciones = document.querySelectorAll("section");
botonesMenu.forEach(btn => {
  btn.addEventListener("click", () => {
    botonesMenu.forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    secciones.forEach(s => s.classList.remove("seccion-activa"));
    document.getElementById(btn.dataset.target).classList.add("seccion-activa");
  });
});

// --- PROVEEDORES ---
const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.querySelector("#tablaProveedores tbody");

formProveedor.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    nombre: provNombre.value,
    ruc: provRuc.value,
    direccion: provDireccion.value,
    telefono: provTelefono.value,
    numero: provNumero.value
  };
  await addDoc(proveedoresCol, data);
  formProveedor.reset();
});

onSnapshot(proveedoresCol, snapshot => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach(docu => {
    const p = docu.data();
    const fila = `<tr>
      <td>${p.nombre}</td><td>${p.ruc}</td><td>${p.direccion}</td>
      <td>${p.telefono}</td><td>${p.numero}</td>
      <td><button class="btn-eliminar" data-id="${docu.id}" data-col="proveedores">Eliminar</button></td>
    </tr>`;
    tablaProveedores.insertAdjacentHTML("beforeend", fila);
  });
  cargarSelectProveedores();
});

// --- PRODUCTOS ---
const formProducto = document.getElementById("formProducto");
const tablaProductos = document.querySelector("#tablaProductos tbody");

formProducto.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    nombre: prodNombre.value,
    precio: parseFloat(prodPrecio.value),
    cantidad: parseInt(prodCantidad.value),
    descripcion: prodDescripcion.value
  };
  await addDoc(productosCol, data);
  formProducto.reset();
});

onSnapshot(productosCol, snapshot => {
  tablaProductos.innerHTML = "";
  snapshot.forEach(docu => {
    const p = docu.data();
    const fila = `<tr>
      <td>${p.nombre}</td><td>S/. ${p.precio.toFixed(2)}</td><td>${p.cantidad}</td><td>${p.descripcion}</td>
      <td><button class="btn-eliminar" data-id="${docu.id}" data-col="productos">Eliminar</button></td>
    </tr>`;
    tablaProductos.insertAdjacentHTML("beforeend", fila);
  });
  cargarSelectProductos();
});

// --- FACTURAS ---
const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.querySelector("#tablaFacturas tbody");
const selProveedor = document.getElementById("factProveedor");
const selProducto = document.getElementById("factProducto");

formFactura.addEventListener("submit", async e => {
  e.preventDefault();
  if (!selProveedor.value || !selProducto.value) return alert("Selecciona proveedor y producto");
  await addDoc(facturasCol, {
    proveedor: selProveedor.value,
    producto: selProducto.value,
    cantidad: parseInt(factCantidad.value),
    total: parseFloat(factTotal.value),
    fecha: new Date().toISOString()
  });
  formFactura.reset();
});

onSnapshot(facturasCol, snapshot => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(docu => {
    const f = docu.data();
    const fila = `<tr>
      <td>${f.proveedor}</td><td>${f.producto}</td><td>${f.cantidad}</td><td>S/. ${f.total.toFixed(2)}</td>
      <td>
        <button class="btn-detalles" data-id="${docu.id}">Detalles</button>
        <button class="btn-eliminar" data-id="${docu.id}" data-col="facturas">Eliminar</button>
      </td>
    </tr>`;
    tablaFacturas.insertAdjacentHTML("beforeend", fila);
  });
});

// --- ELIMINAR Y DETALLES ---
document.addEventListener("click", async e => {
  if (e.target.classList.contains("btn-eliminar")) {
    const col = e.target.dataset.col;
    const id = e.target.dataset.id;
    if (confirm("¿Eliminar este registro?")) await deleteDoc(doc(db, col, id));
  }
  if (e.target.classList.contains("btn-detalles")) {
    const id = e.target.dataset.id;
    const snap = await getDoc(doc(db, "facturas", id));
    if (snap.exists()) {
      const f = snap.data();
      alert(`📄 DETALLES FACTURA
Proveedor: ${f.proveedor}
Producto: ${f.producto}
Cantidad: ${f.cantidad}
Total: S/. ${f.total}
Fecha: ${new Date(f.fecha).toLocaleString()}`);
    }
  }
});

// --- SELECTS DINÁMICOS ---
function cargarSelectProveedores() {
  onSnapshot(proveedoresCol, snap => {
    selProveedor.innerHTML = "<option value=''>Seleccionar proveedor</option>";
    snap.forEach(d => selProveedor.innerHTML += `<option>${d.data().nombre}</option>`);
  });
}
function cargarSelectProductos() {
  onSnapshot(productosCol, snap => {
    selProducto.innerHTML = "<option value=''>Seleccionar producto</option>";
    snap.forEach(d => selProducto.innerHTML += `<option>${d.data().nombre}</option>`);
  });
}

// --- BUSCADOR ---
const buscador = document.getElementById("buscadorFactura");
const btnRefresh = document.getElementById("btnRefresh");
buscador.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    const val = buscador.value.toLowerCase();
    document.querySelectorAll("#tablaFacturas tbody tr").forEach(row => {
      const texto = row.children[1].textContent.toLowerCase();
      row.style.display = texto.includes(val) ? "" : "none";
    });
  }
});
btnRefresh.addEventListener("click", () => {
  buscador.value = "";
  document.querySelectorAll("#tablaFacturas tbody tr").forEach(r => (r.style.display = ""));
});


