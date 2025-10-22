// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, updateDoc, query, where, getDoc
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
        <td>${Number(d.subtotal).toFixed(2)}</td>
        <td>${Number(d.igv).toFixed(2)}</td>
        <td>${Number(d.total).toFixed(2)}</td>
        <td class="acciones">
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
  selProvFactura.innerHTML = `<option value="">Seleccionar proveedor</option>`;
  proveedores.forEach((p) => {
    selProvFactura.innerHTML += `<option value="${p.nombre}">${p.nombre}</option>`;
  });
});

onSnapshot(colProductos, (snapshot) => {
  const productos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  renderProductos(productos);
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
      document.getElementById("panelProveedores").style.display = "block";
      document.getElementById("panelProveedores").scrollIntoView({ behavior: "smooth" });
    }
    return;
  }

  if (!producto) {
    if (confirm("No se encontró el producto. ¿Deseas registrar uno nuevo?")) {
      document.getElementById("panelProductos").style.display = "block";
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
    <h3 class="titulo-modal">Factura ${data.idFactura}</h3>
    <p><strong>Fecha:</strong> ${data.fecha}</p>
    <p><strong>Proveedor:</strong> ${data.proveedor}</p>
    <p><strong>Producto:</strong> ${data.producto}</p>
    <hr>
    <p><strong>Subtotal:</strong> S/ ${Number(data.subtotal).toFixed(2)}</p>
    <p><strong>IGV:</strong> S/ ${Number(data.igv).toFixed(2)}</p>
    <p><strong>Total:</strong> S/ ${Number(data.total).toFixed(2)}</p>
  `;
  modalExtra.showModal();
}

// ===================== VER / EDITAR / ELIMINAR =====================
document.addEventListener("click", async (e) => {
  // -------- VER --------
  if (e.target.classList.contains("ver")) {
    const id = e.target.dataset.id;
    const docRef = doc(db, "facturas", id);
    const snap = await getDoc(docRef);
    if (snap.exists()) mostrarModalFactura(snap.data());
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
    const docRef = doc(db, "facturas", id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const f = snap.data();
      document.getElementById("facturaFecha").value = f.fecha;
      selProvFactura.value = f.proveedor;
      selProdFactura.value = f.producto;
      document.getElementById("facturaSubtotal").value = f.subtotal;
      document.getElementById("facturaIGV").value = f.igv;
      document.getElementById("facturaTotal").value = f.total;
      document.getElementById("facturaTipo").value = f.tipo;
      document.getElementById("facturaMoneda").value = f.moneda;

      if (confirm("¿Deseas guardar los cambios?")) {
        await updateDoc(docRef, {
          fecha: f.fecha,
          proveedor: f.proveedor,
          producto: f.producto,
          subtotal: f.subtotal,
          igv: f.igv,
          total: f.total,
          tipo: f.tipo,
          moneda: f.moneda,
        });
      }
    }
  }
});
