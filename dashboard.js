// ================================
// Dashboard.js (Parte 1 de 2)
// ================================

// --- Inicializar Firebase ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:a7d9d08c909edc18b6a3f1"
};

// Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Helpers ---
const $ = (id) => document.getElementById(id);
const limpiarFormulario = (form) => form.reset();

// --- Cambiar secciones ---
document.querySelectorAll(".menu-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("section").forEach(sec => sec.style.display = "none");
    const target = btn.getAttribute("data-target");
    $(target).style.display = "block";
  });
});

// ================================
// PROVEEDORES
// ================================

const formProveedor = $("formProveedores");
const tablaProveedores = $("tablaProveedoresBody");

// Registrar proveedor
formProveedor.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = $("nombreProveedor").value.trim();
  const direccion = $("direccionProveedor").value.trim();
  const telefono = $("telefonoProveedor").value.trim();
  const numero = $("numeroProveedor").value.trim() || "—";

  if (!nombre) return alert("Ingrese el nombre del proveedor");

  await addDoc(collection(db, "proveedores"), { nombre, direccion, telefono, numero });
  limpiarFormulario(formProveedor);
});

// Mostrar en tiempo real
onSnapshot(collection(db, "proveedores"), (snapshot) => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach((docu) => {
    const data = docu.data();
    const fila = `
      <tr>
        <td>${data.nombre}</td>
        <td>${data.direccion}</td>
        <td>${data.telefono}</td>
        <td>${data.numero || "—"}</td>
        <td>
          <button class="btn-editar" data-id="${docu.id}">✏️</button>
          <button class="btn-eliminar" data-id="${docu.id}">🗑️</button>
        </td>
      </tr>`;
    tablaProveedores.innerHTML += fila;
  });
  cargarProveedoresSelect();
});

// Eliminar proveedor
tablaProveedores.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-eliminar")) {
    const id = e.target.getAttribute("data-id");
    await deleteDoc(doc(db, "proveedores", id));
  }
});

// ================================
// PRODUCTOS
// ================================

const formProducto = $("formProductos");
const tablaProductos = $("tablaProductosBody");

formProducto.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = $("nombreProducto").value.trim();
  const precio = parseFloat($("precioProducto").value) || 0;
  const cantidad = parseInt($("cantidadProducto").value) || 0;
  const descripcion = $("descripcionProducto").value.trim() || "—";

  if (!nombre) return alert("Ingrese el nombre del producto");

  await addDoc(collection(db, "productos"), { nombre, precio, cantidad, descripcion });
  limpiarFormulario(formProducto);
});

// Mostrar productos en tiempo real
onSnapshot(collection(db, "productos"), (snapshot) => {
  tablaProductos.innerHTML = "";
  snapshot.forEach((docu) => {
    const data = docu.data();
    const fila = `
      <tr>
        <td>${data.nombre}</td>
        <td>S/ ${data.precio.toFixed(2)}</td>
        <td>${data.cantidad}</td>
        <td>${data.descripcion || "—"}</td>
        <td>
          <button class="btn-editar" data-id="${docu.id}">✏️</button>
          <button class="btn-eliminar" data-id="${docu.id}">🗑️</button>
        </td>
      </tr>`;
    tablaProductos.innerHTML += fila;
  });
  cargarProductosSelect();
});

tablaProductos.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-eliminar")) {
    const id = e.target.getAttribute("data-id");
    await deleteDoc(doc(db, "productos", id));
  }
});

// ================================
// Cargar selects de factura
// ================================

async function cargarProveedoresSelect() {
  const select = $("selectProveedor");
  select.innerHTML = "";
  onSnapshot(collection(db, "proveedores"), (snapshot) => {
    select.innerHTML = `<option value="">Seleccione proveedor</option>`;
    snapshot.forEach((docu) => {
      const data = docu.data();
      select.innerHTML += `<option value="${docu.id}">${data.nombre}</option>`;
    });
  });
}

async function cargarProductosSelect() {
  const select = $("selectProducto");
  select.innerHTML = "";
  onSnapshot(collection(db, "productos"), (snapshot) => {
    select.innerHTML = `<option value="">Seleccione producto</option>`;
    snapshot.forEach((docu) => {
      const data = docu.data();
      select.innerHTML += `<option value="${docu.id}">${data.nombre}</option>`;
    });
  });
}
// ================================
// FACTURAS
// ================================

const formFactura = $("formFacturas");
const tablaFacturas = $("tablaFacturasBody");

formFactura.addEventListener("submit", async (e) => {
  e.preventDefault();

  const idFactura = $("idFactura").value.trim();
  const proveedorId = $("selectProveedor").value;
  const productoId = $("selectProducto").value;
  const cantidad = parseInt($("cantidadFactura").value) || 0;
  const precioUnit = parseFloat($("precioUnitario").value) || 0;
  const fecha = $("fechaFactura").value || new Date().toISOString().slice(0, 10);

  if (!idFactura || !proveedorId || !productoId) {
    return alert("Complete todos los campos obligatorios.");
  }

  const proveedorDoc = await getDoc(doc(db, "proveedores", proveedorId));
  const productoDoc = await getDoc(doc(db, "productos", productoId));

  if (!proveedorDoc.exists() || !productoDoc.exists()) {
    return alert("Proveedor o producto no válido.");
  }

  const proveedor = proveedorDoc.data();
  const producto = productoDoc.data();
  const total = cantidad * precioUnit;

  await addDoc(collection(db, "facturas"), {
    idFactura,
    proveedor: proveedor.nombre,
    producto: producto.nombre,
    cantidad,
    precioUnit,
    total,
    fecha,
  });

  limpiarFormulario(formFactura);
});

// Mostrar facturas en tiempo real
onSnapshot(collection(db, "facturas"), (snapshot) => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach((docu) => {
    const data = docu.data();
    const fila = `
      <tr>
        <td>${data.idFactura}</td>
        <td>${data.proveedor}</td>
        <td>${data.producto}</td>
        <td>${data.cantidad}</td>
        <td>S/ ${data.precioUnit.toFixed(2)}</td>
        <td>S/ ${data.total.toFixed(2)}</td>
        <td>${data.fecha}</td>
        <td>
          <button class="btn-detalle" data-id="${docu.id}">🔍</button>
          <button class="btn-eliminar" data-id="${docu.id}">🗑️</button>
        </td>
      </tr>`;
    tablaFacturas.innerHTML += fila;
  });
});

// Eliminar factura
tablaFacturas.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-eliminar")) {
    const id = e.target.getAttribute("data-id");
    await deleteDoc(doc(db, "facturas", id));
  }

  if (e.target.classList.contains("btn-detalle")) {
    const id = e.target.getAttribute("data-id");
    mostrarDetalleFactura(id);
  }
});

// ================================
// MODAL DE DETALLES DE FACTURA
// ================================

const modalDetalle = $("modalDetalle");
const modalContenido = $("modalContenido");
const modalCerrar = $("modalCerrar");

async function mostrarDetalleFactura(id) {
  const docu = await getDoc(doc(db, "facturas", id));
  if (docu.exists()) {
    const data = docu.data();
    modalContenido.innerHTML = `
      <h4>Detalle de Factura</h4>
      <p><strong>ID:</strong> ${data.idFactura}</p>
      <p><strong>Proveedor:</strong> ${data.proveedor}</p>
      <p><strong>Producto:</strong> ${data.producto}</p>
      <p><strong>Cantidad:</strong> ${data.cantidad}</p>
      <p><strong>Precio Unitario:</strong> S/ ${data.precioUnit.toFixed(2)}</p>
      <p><strong>Total:</strong> S/ ${data.total.toFixed(2)}</p>
      <p><strong>Fecha:</strong> ${data.fecha}</p>
    `;
    modalDetalle.style.display = "flex";
  }
}

modalCerrar.addEventListener("click", () => {
  modalDetalle.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalDetalle) modalDetalle.style.display = "none";
});

// ================================
// BUSCADOR INTERACTIVO (por producto)
// ================================

const buscadorInput = $("buscadorFactura");
const contenedorResultados = $("resultadosBusqueda");

buscadorInput.addEventListener("input", async () => {
  const valor = buscadorInput.value.toLowerCase().trim();
  if (valor === "") {
    contenedorResultados.innerHTML = "<p>Empieza a escribir para buscar...</p>";
    return;
  }

  onSnapshot(collection(db, "facturas"), (snapshot) => {
    let resultados = [];
    snapshot.forEach((docu) => {
      const data = docu.data();
      if (data.producto.toLowerCase().includes(valor)) resultados.push(data);
    });

    if (resultados.length === 0) {
      contenedorResultados.innerHTML = `<p>No se encontraron facturas con <b>${valor}</b>.</p>`;
      return;
    }

    contenedorResultados.innerHTML = resultados
      .map(
        (f) => `
        <div class="resultado-item">
          <h4>Factura: ${f.idFactura}</h4>
          <p><b>Producto:</b> ${f.producto}</p>
          <p><b>Proveedor:</b> ${f.proveedor}</p>
          <p><b>Cantidad:</b> ${f.cantidad}</p>
          <p><b>Total:</b> S/ ${f.total.toFixed(2)}</p>
          <p><b>Fecha:</b> ${f.fecha}</p>
        </div>`
      )
      .join("");
  });
});

// ================================
// FIN DEL ARCHIVO
// ================================


