// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, updateDoc, getDoc
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

// ===================== REFERENCIAS =====================
const colProveedores = collection(db, "proveedores");
const colProductos = collection(db, "productos");
const colFacturas = collection(db, "facturas");

// ===================== ELEMENTOS =====================
const listaProveedores = document.getElementById("listaProveedores");
const listaProductos = document.getElementById("listaProductos");
const listaFacturas = document.getElementById("listaFacturas");
const selectProveedor = document.getElementById("selectProveedor");
const selectProducto = document.getElementById("selectProducto");

const contadorProveedores = document.getElementById("contadorProveedores");
const contadorProductos = document.getElementById("contadorProductos");
const contadorFacturas = document.getElementById("contadorFacturas");

// ===================== UTILITARIAS =====================
function generarIdFactura() {
  return `F${Date.now().toString().slice(-6)}`;
}

function calcularTotales(precio, cantidad) {
  const subtotal = precio * cantidad;
  const igv = subtotal * 0.18;
  const total = subtotal + igv;
  return { subtotal, igv, total };
}

function formatoMoneda(num) {
  return `S/ ${num.toFixed(2)}`;
}

// ===================== LISTADOS EN TIEMPO REAL =====================
onSnapshot(colProveedores, (snapshot) => {
  listaProveedores.innerHTML = "";
  selectProveedor.innerHTML = '<option value="">Seleccionar proveedor</option>';
  let count = 0;

  snapshot.forEach((docu) => {
    const d = docu.data();
    count++;
    listaProveedores.innerHTML += `
      <tr>
        <td>${d.nombre}</td>
        <td>${d.tipoDocumento} ${d.numeroDocumento}</td>
        <td>${d.telefono}</td>
        <td>${d.correo}</td>
        <td>
          <button class="btn-editar" data-id="${docu.id}" data-tipo="proveedor">✏️</button>
          <button class="btn-eliminar" data-id="${docu.id}" data-tipo="proveedor">🗑️</button>
        </td>
      </tr>`;
    selectProveedor.innerHTML += `<option value="${docu.id}">${d.nombre}</option>`;
  });
  contadorProveedores.textContent = count;
});

onSnapshot(colProductos, (snapshot) => {
  listaProductos.innerHTML = "";
  selectProducto.innerHTML = '<option value="">Seleccionar producto</option>';
  let count = 0;

  snapshot.forEach((docu) => {
    const d = docu.data();
    count++;
    listaProductos.innerHTML += `
      <tr>
        <td>${d.nombre}</td>
        <td>${d.presentacion} (${d.unidad})</td>
        <td>${formatoMoneda(parseFloat(d.precio))}</td>
        <td>${d.stock}</td>
        <td>
          <button class="btn-editar" data-id="${docu.id}" data-tipo="producto">✏️</button>
          <button class="btn-eliminar" data-id="${docu.id}" data-tipo="producto">🗑️</button>
        </td>
      </tr>`;
    selectProducto.innerHTML += `<option value="${docu.id}">${d.nombre}</option>`;
  });
  contadorProductos.textContent = count;
});

onSnapshot(colFacturas, async (snapshot) => {
  listaFacturas.innerHTML = "";
  let count = 0;

  for (const docu of snapshot.docs) {
    const d = docu.data();
    count++;

    const proveedorSnap = await getDoc(doc(db, "proveedores", d.proveedorId));
    const productoSnap = await getDoc(doc(db, "productos", d.productoId));

    const proveedorNombre = proveedorSnap.exists() ? proveedorSnap.data().nombre : "—";
    const productoNombre = productoSnap.exists() ? productoSnap.data().nombre : "—";

    listaFacturas.innerHTML += `
      <tr>
        <td>${d.idFactura}</td>
        <td>${proveedorNombre}</td>
        <td>${productoNombre}</td>
        <td>${formatoMoneda(d.total)}</td>
        <td>
          <button class="btn-ver" data-id="${docu.id}" data-tipo="factura">👁️</button>
          <button class="btn-editar" data-id="${docu.id}" data-tipo="factura">✏️</button>
          <button class="btn-eliminar" data-id="${docu.id}" data-tipo="factura">🗑️</button>
        </td>
      </tr>`;
  }
  contadorFacturas.textContent = count;
});

// ===================== REGISTRO DE FACTURA =====================
document.getElementById("formFactura").addEventListener("submit", async (e) => {
  e.preventDefault();
  const proveedorId = selectProveedor.value;
  const productoId = selectProducto.value;
  const cantidad = parseFloat(document.getElementById("cantidad").value);
  const precio = parseFloat(document.getElementById("precio").value);

  if (!proveedorId) {
    if (confirm("Proveedor no encontrado. ¿Deseas registrarlo ahora?")) {
      document.getElementById("panelProveedores").scrollIntoView({ behavior: "smooth" });
    }
    return;
  }

  if (!productoId) {
    if (confirm("Producto no encontrado. ¿Deseas registrarlo ahora?")) {
      document.getElementById("panelProductos").scrollIntoView({ behavior: "smooth" });
    }
    return;
  }

  const { subtotal, igv, total } = calcularTotales(precio, cantidad);
  const idFactura = generarIdFactura();

  await addDoc(colFacturas, {
    idFactura,
    proveedorId,
    productoId,
    cantidad,
    precio,
    subtotal,
    igv,
    total,
    fecha: new Date().toISOString(),
  });

  e.target.reset();
});

// ===================== MODAL DETALLE FACTURA =====================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-ver")) {
    const id = e.target.dataset.id;
    const docRef = doc(db, "facturas", id);
    const snap = await getDoc(docRef);
    const d = snap.data();

    const proveedorSnap = await getDoc(doc(db, "proveedores", d.proveedorId));
    const productoSnap = await getDoc(doc(db, "productos", d.productoId));

    const proveedor = proveedorSnap.exists() ? proveedorSnap.data().nombre : "—";
    const producto = productoSnap.exists() ? productoSnap.data().nombre : "—";

    document.getElementById("modalDetalleContenido").innerHTML = `
      <h3>Factura ${d.idFactura}</h3>
      <p><b>Proveedor:</b> ${proveedor}</p>
      <p><b>Producto:</b> ${producto}</p>
      <p><b>Cantidad:</b> ${d.cantidad}</p>
      <p><b>Precio Unitario:</b> ${formatoMoneda(d.precio)}</p>
      <p><b>Subtotal:</b> ${formatoMoneda(d.subtotal)}</p>
      <p><b>IGV (18%):</b> ${formatoMoneda(d.igv)}</p>
      <p><b>Total:</b> ${formatoMoneda(d.total)}</p>
    `;
    document.getElementById("modalDetalle").classList.add("visible");
  }
});

// ===================== ELIMINAR Y EDITAR =====================
document.addEventListener("click", async (e) => {
  // Eliminar registro
  if (e.target.classList.contains("btn-eliminar")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    const colRef = tipo === "proveedor" ? colProveedores : tipo === "producto" ? colProductos : colFacturas;

    if (confirm("¿Seguro que deseas eliminar este registro?")) {
      await deleteDoc(doc(db, colRef.id, id));
    }
  }

  // ===================== LÓGICA DE EDICIÓN =====================
  if (e.target.classList.contains("btn-editar")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    const colRef = tipo === "proveedor" ? "proveedores" : tipo === "producto" ? "productos" : "facturas";
    const snap = await getDoc(doc(db, colRef, id));
    const d = snap.data();

    const modal = document.getElementById("modalEditar");
    const form = modal.querySelector("form");

    modal.classList.add("visible");

    form.innerHTML = "";

    if (tipo === "proveedor") {
      form.innerHTML = `
        <label>Nombre</label>
        <input type="text" id="editNombre" value="${d.nombre}">
        <label>Tipo Documento</label>
        <input type="text" id="editTipoDocumento" value="${d.tipoDocumento}">
        <label>Número Documento</label>
        <input type="text" id="editNumeroDocumento" value="${d.numeroDocumento}">
        <label>Teléfono</label>
        <input type="text" id="editTelefono" value="${d.telefono}">
        <label>Correo</label>
        <input type="text" id="editCorreo" value="${d.correo}">
      `;
    } else if (tipo === "producto") {
      form.innerHTML = `
        <label>Nombre</label>
        <input type="text" id="editNombre" value="${d.nombre}">
        <label>Presentación</label>
        <input type="text" id="editPresentacion" value="${d.presentacion}">
        <label>Unidad</label>
        <input type="text" id="editUnidad" value="${d.unidad}">
        <label>Precio</label>
        <input type="number" id="editPrecio" value="${d.precio}">
        <label>Stock</label>
        <input type="number" id="editStock" value="${d.stock}">
      `;
    } else if (tipo === "factura") {
      form.innerHTML = `
        <label>ID Factura</label>
        <input type="text" id="editIdFactura" value="${d.idFactura}" disabled>
        <label>Cantidad</label>
        <input type="number" id="editCantidad" value="${d.cantidad}">
        <label>Precio</label>
        <input type="number" id="editPrecio" value="${d.precio}">
      `;
    }

    const btnGuardar = document.createElement("button");
    btnGuardar.textContent = "Guardar cambios";
    btnGuardar.type = "button";
    btnGuardar.classList.add("btn-guardar");
    form.appendChild(btnGuardar);

    btnGuardar.addEventListener("click", async () => {
      let nuevosDatos = {};

      if (tipo === "proveedor") {
        nuevosDatos = {
          nombre: document.getElementById("editNombre").value,
          tipoDocumento: document.getElementById("editTipoDocumento").value,
          numeroDocumento: document.getElementById("editNumeroDocumento").value,
          telefono: document.getElementById("editTelefono").value,
          correo: document.getElementById("editCorreo").value,
        };
      } else if (tipo === "producto") {
        nuevosDatos = {
          nombre: document.getElementById("editNombre").value,
          presentacion: document.getElementById("editPresentacion").value,
          unidad: document.getElementById("editUnidad").value,
          precio: parseFloat(document.getElementById("editPrecio").value),
          stock: parseInt(document.getElementById("editStock").value),
        };
      } else if (tipo === "factura") {
        const cantidad = parseFloat(document.getElementById("editCantidad").value);
        const precio = parseFloat(document.getElementById("editPrecio").value);
        const { subtotal, igv, total } = calcularTotales(precio, cantidad);
        nuevosDatos = { cantidad, precio, subtotal, igv, total };
      }

      await updateDoc(doc(db, colRef, id), nuevosDatos);
      alert("Registro actualizado correctamente.");
      modal.classList.remove("visible");
    });
  }
});

// ===================== CERRAR MODALES =====================
document.getElementById("cerrarModalDetalle").addEventListener("click", () => {
  document.getElementById("modalDetalle").classList.remove("visible");
});
document.getElementById("cerrarModalEditar").addEventListener("click", () => {
  document.getElementById("modalEditar").classList.remove("visible");
});

