// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, updateDoc, query, where
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// ===================== CONFIGURACIÓN DEL PROYECTO =====================
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===================== REFERENCIAS A COLECCIONES =====================
const colProveedores = collection(db, "proveedores");
const colProductos = collection(db, "productos");
const colFacturas = collection(db, "facturas");

// ===================== ELEMENTOS DOM =====================
const tablaProveedores = document.getElementById("tablaProveedores");
const tablaProductos = document.getElementById("tablaProductos");
const tablaFacturas = document.getElementById("tablaFacturas");

const selProvFactura = document.getElementById("facturaProveedor");
const selProdFactura = document.getElementById("facturaProducto");

const modalExtra = document.getElementById("modalExtra");
const modalExtraBody = document.getElementById("modalExtraBody");
const modalEditar = document.getElementById("modalEditar");

// ===================== RENDERIZAR DATOS =====================
function renderProveedores(data) {
  tablaProveedores.innerHTML = "";
  data.forEach((d) => {
    tablaProveedores.innerHTML += `
      <tr>
        <td>${d.nombre}</td>
        <td>${d.tipoDocumento}</td>
        <td>${d.numDocumento}</td>
        <td>${d.telefono}</td>
        <td>${d.correo}</td>
        <td>${d.direccion}</td>
      </tr>`;
  });
}

function renderProductos(data) {
  tablaProductos.innerHTML = "";
  data.forEach((d) => {
    tablaProductos.innerHTML += `
      <tr>
        <td>${d.nombre}</td>
        <td>${d.categoria}</td>
        <td>${d.presentacion} ${d.unidad}</td>
        <td>${d.precio}</td>
        <td>${d.moneda}</td>
        <td>${d.descripcion}</td>
      </tr>`;
  });
}

function renderFacturas(data) {
  tablaFacturas.innerHTML = "";
  data.forEach((d) => {
    tablaFacturas.innerHTML += `
      <tr>
        <td>${d.idFactura}</td>
        <td>${d.fecha}</td>
        <td>${d.proveedor}</td>
        <td>${d.producto}</td>
        <td>${d.subtotal.toFixed(2)}</td>
        <td>${d.igv.toFixed(2)}</td>
        <td>${d.total.toFixed(2)}</td>
        <td>
          <button class="ver" data-tipo="factura" data-id="${d.id}">👁️ Ver</button>
          <button class="editar" data-tipo="factura" data-id="${d.id}">✏️</button>
          <button class="eliminar" data-tipo="factura" data-id="${d.id}">🗑️</button>
        </td>
      </tr>`;
  });
}

// ===================== SNAPSHOTS EN TIEMPO REAL =====================
onSnapshot(colProveedores, (snapshot) => {
  const proveedores = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  renderProveedores(proveedores);

  // Actualizar select en factura
  selProvFactura.innerHTML = `<option value="">Seleccionar proveedor</option>`;
  proveedores.forEach((p) => {
    selProvFactura.innerHTML += `<option value="${p.nombre}">${p.nombre}</option>`;
  });
});

onSnapshot(colProductos, (snapshot) => {
  const productos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  renderProductos(productos);

  // Actualizar select en factura
  selProdFactura.innerHTML = `<option value="">Seleccionar producto</option>`;
  productos.forEach((p) => {
    selProdFactura.innerHTML += `<option value="${p.nombre}">${p.nombre}</option>`;
  });
});

onSnapshot(colFacturas, (snapshot) => {
  const facturas = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  renderFacturas(facturas);
});

// ===================== GENERADOR DE ID AUTOMÁTICO =====================
function generarIdFactura() {
  const ahora = new Date();
  const id = "F" + ahora.getFullYear().toString().slice(2)
    + (ahora.getMonth() + 1).toString().padStart(2, "0")
    + ahora.getDate().toString().padStart(2, "0")
    + "-" + ahora.getHours().toString().padStart(2, "0")
    + ahora.getMinutes().toString().padStart(2, "0")
    + ahora.getSeconds().toString().padStart(2, "0");
  return id;
}

// ===================== REGISTRAR FACTURA =====================
document.getElementById("formFactura").addEventListener("submit", async (e) => {
  e.preventDefault();

  const proveedor = selProvFactura.value.trim();
  const producto = selProdFactura.value.trim();

  if (!proveedor) {
    if (confirm("No se encontró el proveedor. ¿Deseas registrar uno nuevo?")) {
      document.getElementById("panelProveedores").scrollIntoView({ behavior: "smooth" });
    }
    return;
  }

  if (!producto) {
    if (confirm("No se encontró el producto. ¿Deseas registrar uno nuevo?")) {
      document.getElementById("panelProductos").scrollIntoView({ behavior: "smooth" });
    }
    return;
  }

  const factura = {
    idFactura: generarIdFactura(),
    fecha: document.getElementById("facturaFecha").value,
    proveedor,
    producto,
    subtotal: parseFloat(document.getElementById("facturaSubtotal").value) || 0,
    igv: parseFloat(document.getElementById("facturaIGV").value) || 0,
    total: parseFloat(document.getElementById("facturaTotal").value) || 0,
    tipo: document.getElementById("facturaTipo").value,
    moneda: document.getElementById("facturaMoneda").value,
  };

  await addDoc(colFacturas, factura);
  e.target.reset();
});

// ===================== MODAL DETALLE FACTURA =====================
function mostrarModalFactura(data) {
  modalExtraBody.innerHTML = `
    <h3>Factura ${data.idFactura}</h3>
    <p><b>Fecha:</b> ${data.fecha}</p>
    <p><b>Proveedor:</b> ${data.proveedor}</p>
    <p><b>Producto:</b> ${data.producto}</p>
    <hr>
    <p><b>Subtotal:</b> S/ ${data.subtotal.toFixed(2)}</p>
    <p><b>IGV:</b> S/ ${data.igv.toFixed(2)}</p>
    <p><b>Total:</b> S/ ${data.total.toFixed(2)}</p>
  `;
  modalExtra.showModal();
}

// ===================== EDITAR / VER / ELIMINAR =====================
document.addEventListener("click", async (e) => {
  // -------- VER --------
  if (e.target.classList.contains("ver")) {
    const id = e.target.dataset.id;
    const snap = await getDocs(query(colFacturas, where("__name__", "==", id)));
    if (!snap.empty) mostrarModalFactura(snap.docs[0].data());
  }

  // -------- ELIMINAR --------
  if (e.target.classList.contains("eliminar")) {
    const id = e.target.dataset.id;
    if (confirm("¿Desea eliminar esta factura?")) {
      await deleteDoc(doc(db, "facturas", id));
    }
  }

  // -------- EDITAR --------
  if (e.target.classList.contains("editar")) {
    const id = e.target.dataset.id;
    const snap = await getDocs(query(colFacturas, where("__name__", "==", id)));
    if (snap.empty) return;
    const data = snap.docs[0].data();

    // Mostrar modal de edición
    modalEditar.showModal();
    document.getElementById("editIdFactura").value = data.idFactura;
    document.getElementById("editFecha").value = data.fecha;
    document.getElementById("editProveedor").value = data.proveedor;
    document.getElementById("editProducto").value = data.producto;
    document.getElementById("editSubtotal").value = data.subtotal;
    document.getElementById("editIGV").value = data.igv;
    document.getElementById("editTotal").value = data.total;
    document.getElementById("editTipo").value = data.tipo;
    document.getElementById("editMoneda").value = data.moneda;

    // Guardar cambios
    document.getElementById("btnGuardarEdit").onclick = async () => {
      const docRef = doc(db, "facturas", id);
      await updateDoc(docRef, {
        fecha: document.getElementById("editFecha").value,
        proveedor: document.getElementById("editProveedor").value,
        producto: document.getElementById("editProducto").value,
        subtotal: parseFloat(document.getElementById("editSubtotal").value) || 0,
        igv: parseFloat(document.getElementById("editIGV").value) || 0,
        total: parseFloat(document.getElementById("editTotal").value) || 0,
        tipo: document.getElementById("editTipo").value,
        moneda: document.getElementById("editMoneda").value,
      });
      modalEditar.close();
    };
  }
});

