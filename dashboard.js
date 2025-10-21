// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, updateDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  getAuth, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// ✅ Configuración correcta de tu proyecto Discovery Pets
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322"
};

// Inicialización
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
// ===================== SESIÓN =====================
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
});

btnCerrarSesion?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ===================== NAVEGACIÓN ENTRE SECCIONES =====================
const botonesNav = document.querySelectorAll(".nav-btn");
const secciones = document.querySelectorAll(".seccion");

botonesNav.forEach(btn => {
  btn.addEventListener("click", () => {
    botonesNav.forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    const target = btn.dataset.target;
    secciones.forEach(sec => sec.classList.toggle("activa", sec.id === target));
  });
});

// ===================== CRUD PROVEEDORES =====================
const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.getElementById("tablaProveedores");
const countProveedores = document.getElementById("countProveedores");
const proveedorSelectFactura = document.getElementById("proveedorFactura");

formProveedor.addEventListener("submit", async (e) => {
  e.preventDefault();
  const tipo = formProveedor.tipoDocumentoProveedor.value;
  const numero = formProveedor.numeroDocumentoProveedor.value;
  const nombre = formProveedor.nombreProveedor.value;
  const direccion = formProveedor.direccionProveedor.value;
  const telefono = formProveedor.telefonoProveedor.value;

  await addDoc(collection(db, "proveedores"), {
    tipoDocumento: tipo,
    numeroDocumento: numero,
    nombre,
    direccion,
    telefono
  });
  formProveedor.reset();
});

onSnapshot(collection(db, "proveedores"), (snapshot) => {
  tablaProveedores.innerHTML = "";
  proveedorSelectFactura.innerHTML = `<option value="">Seleccione proveedor</option>`;
  snapshot.forEach(docu => {
    const p = docu.data();
    const id = docu.id;

    // Tabla
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.tipoDocumento}</td>
      <td>${p.numeroDocumento}</td>
      <td>${p.nombre}</td>
      <td>${p.direccion || "-"}</td>
      <td>${p.telefono || "-"}</td>
      <td>
        <button class="btn-accion text-primary" data-editar-proveedor="${id}">✏️</button>
        <button class="btn-accion text-danger" data-eliminar-proveedor="${id}">🗑️</button>
      </td>`;
    tablaProveedores.appendChild(fila);

    // Selector en Factura
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = p.nombre;
    proveedorSelectFactura.appendChild(opt);
  });

  countProveedores.textContent = snapshot.size;
});

// Eliminar / Editar proveedor
tablaProveedores.addEventListener("click", async (e) => {
  const id = e.target.dataset.eliminarProveedor;
  const idEdit = e.target.dataset.editarProveedor;
  if (id) await deleteDoc(doc(db, "proveedores", id));
  if (idEdit) abrirModalEditar("proveedores", idEdit);
});

// ===================== CRUD PRODUCTOS =====================
const formProducto = document.getElementById("formProducto");
const tablaProductos = document.getElementById("tablaProductos");
const countProductos = document.getElementById("countProductos");
const productoSelectFactura = document.getElementById("productoFactura");

formProducto.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = formProducto.nombreProducto.value;
  const presentacion = formProducto.presentacionProducto.value;
  const precio = parseFloat(formProducto.precioProducto.value);
  const descripcion = formProducto.descripcionProducto.value;

  await addDoc(collection(db, "productos"), {
    nombre, presentacion, precio, descripcion
  });
  formProducto.reset();
});

onSnapshot(collection(db, "productos"), (snapshot) => {
  tablaProductos.innerHTML = "";
  productoSelectFactura.innerHTML = `<option value="">Seleccione producto</option>`;
  snapshot.forEach(docu => {
    const p = docu.data();
    const id = docu.id;

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.presentacion}</td>
      <td>S/. ${p.precio.toFixed(2)}</td>
      <td>${p.descripcion || "-"}</td>
      <td>
        <button class="btn-accion text-primary" data-editar-producto="${id}">✏️</button>
        <button class="btn-accion text-danger" data-eliminar-producto="${id}">🗑️</button>
      </td>`;
    tablaProductos.appendChild(fila);

    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = p.nombre;
    productoSelectFactura.appendChild(opt);
  });

  countProductos.textContent = snapshot.size;
});

// Eliminar / Editar producto
tablaProductos.addEventListener("click", async (e) => {
  const id = e.target.dataset.eliminarProducto;
  const idEdit = e.target.dataset.editarProducto;
  if (id) await deleteDoc(doc(db, "productos", id));
  if (idEdit) abrirModalEditar("productos", idEdit);
});

// ===================== CRUD FACTURAS =====================
const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas");
const countFacturas = document.getElementById("countFacturas");

formFactura.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fecha = formFactura.fechaFactura.value;
  const tipo = formFactura.tipoFactura.value;
  const proveedor = formFactura.proveedorFactura.value;
  const producto = formFactura.productoFactura.value;
  const monto = parseFloat(formFactura.montoFactura.value);

  if (!proveedor || !producto) {
    alert("Selecciona proveedor y producto");
    return;
  }

  await addDoc(collection(db, "facturas"), {
    fecha,
    tipo,
    proveedor,
    producto,
    monto
  });
  formFactura.reset();
});

onSnapshot(collection(db, "facturas"), async (snapshot) => {
  tablaFacturas.innerHTML = "";
  countFacturas.textContent = snapshot.size;
  const proveedores = await getDocs(collection(db, "proveedores"));
  const productos = await getDocs(collection(db, "productos"));

  snapshot.forEach(docu => {
    const f = docu.data();
    const id = docu.id;
    const proveedor = proveedores.docs.find(d => d.id === f.proveedor)?.data()?.nombre || "—";
    const producto = productos.docs.find(d => d.id === f.producto)?.data()?.nombre || "—";

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${id}</td>
      <td>${f.fecha}</td>
      <td>${proveedor}</td>
      <td>${producto}</td>
      <td>S/. ${f.monto.toFixed(2)}</td>
      <td>${f.tipo}</td>
      <td>
        <button class="btn-accion text-primary" data-detalle-factura="${id}">🔍</button>
        <button class="btn-accion text-danger" data-eliminar-factura="${id}">🗑️</button>
      </td>`;
    tablaFacturas.appendChild(fila);
  });
});

// Eliminar / detalle factura
tablaFacturas.addEventListener("click", async (e) => {
  const id = e.target.dataset.eliminarFactura;
  const idDetalle = e.target.dataset.detalleFactura;

  if (id) await deleteDoc(doc(db, "facturas", id));

  if (idDetalle) {
    const modal = document.getElementById("modalFactura");
    const body = document.getElementById("modalFacturaBody");
    const docu = await getDoc(doc(db, "facturas", idDetalle));
    const f = docu.data();

    body.innerHTML = `
      <h4>Detalle de Factura</h4>
      <p><b>Fecha:</b> ${f.fecha}</p>
      <p><b>Tipo:</b> ${f.tipo}</p>
      <p><b>Monto:</b> S/. ${f.monto.toFixed(2)}</p>`;
    modal.showModal();
  }
});

document.getElementById("cerrarModalFactura").addEventListener("click", () => {
  document.getElementById("modalFactura").close();
});

// ===================== BUSCADOR =====================
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

searchInput.addEventListener("input", async () => {
  const texto = searchInput.value.toLowerCase();
  if (!texto) {
    searchResults.innerHTML = "";
    return;
  }

  const [factSnap, prodSnap] = await Promise.all([
    getDocs(collection(db, "facturas")),
    getDocs(collection(db, "productos"))
  ]);

  const facturas = factSnap.docs
    .filter(d => d.id.toLowerCase().includes(texto))
    .map(d => ({ tipo: "Factura", id: d.id }));

  const productos = prodSnap.docs
    .filter(d => d.data().nombre.toLowerCase().includes(texto))
    .map(d => ({ tipo: "Producto", nombre: d.data().nombre }));

  const resultados = [...facturas, ...productos];

  searchResults.innerHTML = resultados.length
    ? resultados.map(r => `<div class="resultado-item">${r.tipo}: ${r.nombre || r.id}</div>`).join("")
    : `<p class="text-muted">Sin resultados.</p>`;
});

// ===================== MODAL EDITAR (genérico) =====================
async function abrirModalEditar(coleccion, id) {
  const modal = document.getElementById("modalEditar");
  const body = document.getElementById("modalEditarBody");
  const docRef = doc(db, coleccion, id);
  const docu = await getDoc(docRef);
  const data = docu.data();

  body.innerHTML = `
    <h5>Editar ${coleccion.slice(0, -1)}</h5>
    ${Object.keys(data).map(k =>
      `<div class="mb-2">
        <label class="form-label">${k}</label>
        <input type="text" class="form-control" id="edit_${k}" value="${data[k]}">
      </div>`
    ).join("")}
    <button class="btn btn-success mt-2" id="guardarEdicion">Guardar</button>
  `;

  modal.showModal();

  document.getElementById("guardarEdicion").onclick = async () => {
    const nuevosDatos = {};
    Object.keys(data).forEach(k => {
      nuevosDatos[k] = document.getElementById(`edit_${k}`).value;
    });
    await updateDoc(docRef, nuevosDatos);
    modal.close();
  };

  document.getElementById("cerrarModalEditar").onclick = () => modal.close();
}
