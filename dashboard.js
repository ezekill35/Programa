// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, query, updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===================== UTILIDADES =====================
function generarIdFactura() {
  return "FAC-" + Math.floor(Math.random() * 100000).toString().padStart(5, "0");
}

function mostrarSeccion(id) {
  document.querySelectorAll(".seccion").forEach(sec => sec.classList.remove("activa"));
  document.getElementById(id).classList.add("activa");
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("activo"));
  document.querySelector(`[data-target="${id}"]`).classList.add("activo");
}

// ===================== NAVEGACIÓN =====================
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => mostrarSeccion(btn.dataset.target));
});

// ===================== PROVEEDORES =====================
const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.getElementById("tablaProveedores");

async function cargarProveedores() {
  onSnapshot(collection(db, "proveedores"), (snapshot) => {
    tablaProveedores.innerHTML = "";
    snapshot.forEach((docu) => {
      const p = docu.data();
      const fila = `
        <tr>
          <td>${p.tipoDocumento} - ${p.numeroDocumento}</td>
          <td>${p.nombre}</td>
          <td>${p.direccion || ""}</td>
          <td>${p.telefono || ""}</td>
          <td>
            <button class="btn-accion text-primary" data-id="${docu.id}" data-tipo="editarProveedor">✏️</button>
            <button class="btn-accion text-danger" data-id="${docu.id}" data-tipo="eliminarProveedor">🗑️</button>
          </td>
        </tr>`;
      tablaProveedores.innerHTML += fila;
    });
    actualizarContadores();
    llenarSelectProveedores();
  });
}

formProveedor.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nuevo = {
    tipoDocumento: tipoDocumentoProveedor.value,
    numeroDocumento: numeroDocumentoProveedor.value,
    nombre: nombreProveedor.value,
    direccion: direccionProveedor.value,
    telefono: telefonoProveedor.value
  };
  await addDoc(collection(db, "proveedores"), nuevo);
  formProveedor.reset();
});

tablaProveedores.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;
  if (e.target.dataset.tipo === "eliminarProveedor") {
    await deleteDoc(doc(db, "proveedores", id));
  }
  if (e.target.dataset.tipo === "editarProveedor") {
    const modal = document.getElementById("modalEditar");
    const datos = (await getDocs(query(collection(db, "proveedores")))).docs.find(d => d.id === id).data();
    modal.innerHTML = `
      <h4>Editar Proveedor</h4>
      <input id="editNombre" class="form-control mb-2" value="${datos.nombre}">
      <input id="editDireccion" class="form-control mb-2" value="${datos.direccion || ""}">
      <input id="editTelefono" class="form-control mb-2" value="${datos.telefono || ""}">
      <button id="guardarCambios" class="btn btn-success">Guardar</button>
    `;
    modal.showModal();
    modal.querySelector("#guardarCambios").addEventListener("click", async () => {
      await updateDoc(doc(db, "proveedores", id), {
        nombre: editNombre.value,
        direccion: editDireccion.value,
        telefono: editTelefono.value
      });
      modal.close();
    });
  }
});

async function llenarSelectProveedores() {
  const select = document.getElementById("proveedorFactura");
  select.innerHTML = `<option value="">Seleccione proveedor</option>`;
  const snap = await getDocs(collection(db, "proveedores"));
  snap.forEach(d => {
    select.innerHTML += `<option value="${d.data().nombre}">${d.data().nombre}</option>`;
  });
}

// ===================== PRODUCTOS =====================
const formProducto = document.getElementById("formProducto");
const tablaProductos = document.getElementById("tablaProductos");

async function cargarProductos() {
  onSnapshot(collection(db, "productos"), (snapshot) => {
    tablaProductos.innerHTML = "";
    snapshot.forEach((docu) => {
      const p = docu.data();
      const fila = `
        <tr>
          <td>${p.nombre}</td>
          <td>${p.presentacion} (${p.cantidad})</td>
          <td>${p.precio} ${p.moneda}</td>
          <td>${p.descripcion || ""}</td>
          <td>
            <button class="btn-accion text-primary" data-id="${docu.id}" data-tipo="editarProducto">✏️</button>
            <button class="btn-accion text-danger" data-id="${docu.id}" data-tipo="eliminarProducto">🗑️</button>
          </td>
        </tr>`;
      tablaProductos.innerHTML += fila;
    });
    actualizarContadores();
    llenarSelectProductos();
  });
}

formProducto.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nuevo = {
    nombre: nombreProducto.value,
    presentacion: presentacionProducto.value,
    cantidad: cantidadPresentacion.value,
    precio: parseFloat(precioProducto.value),
    moneda: tipoMoneda.value,
    descripcion: descripcionProducto.value
  };
  await addDoc(collection(db, "productos"), nuevo);
  formProducto.reset();
});

tablaProductos.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;
  if (e.target.dataset.tipo === "eliminarProducto") {
    await deleteDoc(doc(db, "productos", id));
  }
  if (e.target.dataset.tipo === "editarProducto") {
    const modal = document.getElementById("modalEditar");
    const datos = (await getDocs(query(collection(db, "productos")))).docs.find(d => d.id === id).data();
    modal.innerHTML = `
      <h4>Editar Producto</h4>
      <input id="editNombreP" class="form-control mb-2" value="${datos.nombre}">
      <input id="editPrecioP" class="form-control mb-2" value="${datos.precio}">
      <textarea id="editDescripcionP" class="form-control mb-2">${datos.descripcion || ""}</textarea>
      <button id="guardarCambiosP" class="btn btn-success">Guardar</button>
    `;
    modal.showModal();
    modal.querySelector("#guardarCambiosP").addEventListener("click", async () => {
      await updateDoc(doc(db, "productos", id), {
        nombre: editNombreP.value,
        precio: parseFloat(editPrecioP.value),
        descripcion: editDescripcionP.value
      });
      modal.close();
    });
  }
});

async function llenarSelectProductos() {
  const select = document.getElementById("productoFactura");
  select.innerHTML = `<option value="">Seleccione producto</option>`;
  const snap = await getDocs(collection(db, "productos"));
  snap.forEach(d => {
    select.innerHTML += `<option value="${d.data().nombre}">${d.data().nombre}</option>`;
  });
}

// ===================== FACTURAS =====================
const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas");

async function cargarFacturas() {
  onSnapshot(collection(db, "facturas"), (snapshot) => {
    tablaFacturas.innerHTML = "";
    snapshot.forEach((docu) => {
      const f = docu.data();
      const fila = `
        <tr>
          <td>${f.idFactura}</td>
          <td>${f.fecha}</td>
          <td>${f.proveedor}</td>
          <td>${f.producto}</td>
          <td>${f.subtotal.toFixed(2)}</td>
          <td>${f.igv.toFixed(2)}</td>
          <td>${f.total.toFixed(2)}</td>
          <td>${f.tipo}</td>
          <td><button class="btn-accion text-danger" data-id="${docu.id}" data-tipo="eliminarFactura">🗑️</button></td>
        </tr>`;
      tablaFacturas.innerHTML += fila;
    });
    actualizarContadores();
  });
}

formFactura.addEventListener("submit", async (e) => {
  e.preventDefault();

  const proveedor = proveedorFactura.value;
  const producto = productoFactura.value;

  // Validar existencia
  const provSnap = await getDocs(collection(db, "proveedores"));
  const prodSnap = await getDocs(collection(db, "productos"));
  const existeProv = provSnap.docs.some(d => d.data().nombre === proveedor);
  const existeProd = prodSnap.docs.some(d => d.data().nombre === producto);

  if (!existeProv) {
    if (confirm("Proveedor no encontrado. ¿Deseas registrarlo?")) mostrarSeccion("proveedores");
    return;
  }
  if (!existeProd) {
    if (confirm("Producto no encontrado. ¿Deseas registrarlo?")) mostrarSeccion("productos");
    return;
  }

  const subtotal = parseFloat(montoFactura.value);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  await addDoc(collection(db, "facturas"), {
    idFactura: idFactura.value || generarIdFactura(),
    fecha: fechaFactura.value,
    tipo: tipoFactura.value,
    proveedor,
    producto,
    subtotal,
    igv,
    total
  });

  formFactura.reset();
  idFactura.value = generarIdFactura();
});

tablaFacturas.addEventListener("click", async (e) => {
  if (e.target.dataset.tipo === "eliminarFactura") {
    await deleteDoc(doc(db, "facturas", e.target.dataset.id));
  }
});

// ===================== CARGAS INICIALES =====================
window.addEventListener("DOMContentLoaded", () => {
  idFactura.value = generarIdFactura();
  cargarProveedores();
  cargarProductos();
  cargarFacturas();
});

// ===================== CONTADORES =====================
function actualizarContadores() {
  getDocs(collection(db, "facturas")).then(s => countFacturas.textContent = s.size);
  getDocs(collection(db, "proveedores")).then(s => countProveedores.textContent = s.size);
  getDocs(collection(db, "productos")).then(s => countProductos.textContent = s.size);
}

// ===================== BUSCADOR GLOBAL =====================
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
searchInput.addEventListener("input", async () => {
  const texto = searchInput.value.toLowerCase();
  searchResults.innerHTML = "";
  if (texto === "") return;

  const productos = await getDocs(collection(db, "productos"));
  productos.forEach(d => {
    const p = d.data();
    if (p.nombre.toLowerCase().includes(texto)) {
      searchResults.innerHTML += `<div class="resultado-item" onclick="mostrarSeccion('productos')">📦 ${p.nombre}</div>`;
    }
  });

  const facturas = await getDocs(collection(db, "facturas"));
  facturas.forEach(d => {
    const f = d.data();
    if (f.idFactura.toLowerCase().includes(texto) || f.proveedor.toLowerCase().includes(texto)) {
      searchResults.innerHTML += `<div class="resultado-item" onclick="mostrarSeccion('facturas')">🧾 ${f.idFactura} - ${f.proveedor}</div>`;
    }
  });
});

