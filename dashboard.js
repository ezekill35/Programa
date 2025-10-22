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
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===================== REFERENCIAS =====================
const colProveedores = collection(db, "proveedores");
const colProductos = collection(db, "productos");
const colFacturas = collection(db, "facturas");

const tablaProveedores = document.getElementById("tablaProveedores");
const tablaProductos = document.getElementById("tablaProductos");
const tablaFacturas = document.getElementById("tablaFacturas");

const formProveedor = document.getElementById("formProveedor");
const formProducto = document.getElementById("formProducto");
const formFactura = document.getElementById("formFactura");

// ===================== ID AUTOMÁTICO =====================
function generarID(prefix) {
  const random = Math.floor(Math.random() * 9000) + 1000;
  const fecha = new Date().getTime().toString().slice(-4);
  return `${prefix}-${fecha}${random}`;
}

// ===================== REGISTRO EN TIEMPO REAL =====================
onSnapshot(colProveedores, (snap) => {
  tablaProveedores.innerHTML = "";
  snap.forEach((docu) => {
    const d = docu.data();
    tablaProveedores.innerHTML += `
      <tr>
        <td>${d.idProveedor}</td>
        <td>${d.nombre}</td>
        <td>${d.tipoDocumento}</td>
        <td>${d.numeroDocumento}</td>
        <td>${d.telefono}</td>
        <td>${d.email}</td>
        <td>${d.direccion}</td>
        <td>
          <button class="ver" data-tipo="proveedor" data-nombre="${d.nombre}">🔍</button>
          <button class="editar" data-tipo="proveedor" data-id="${docu.id}">✏️</button>
          <button class="eliminar" data-tipo="proveedor" data-id="${docu.id}">🗑️</button>
        </td>
      </tr>`;
  });
  actualizarSelectsFactura();
});

onSnapshot(colProductos, (snap) => {
  tablaProductos.innerHTML = "";
  snap.forEach((docu) => {
    const d = docu.data();
    tablaProductos.innerHTML += `
      <tr>
        <td>${d.idProducto}</td>
        <td>${d.nombre}</td>
        <td>${d.categoria}</td>
        <td>${d.presentacionCantidad} ${d.presentacionTipo}</td>
        <td>${d.precio}</td>
        <td>${d.moneda}</td>
        <td>${d.descripcion}</td>
        <td>
          <button class="ver" data-tipo="producto" data-nombre="${d.nombre}">🔍</button>
          <button class="editar" data-tipo="producto" data-id="${docu.id}">✏️</button>
          <button class="eliminar" data-tipo="producto" data-id="${docu.id}">🗑️</button>
        </td>
      </tr>`;
  });
  actualizarSelectsFactura();
});

onSnapshot(colFacturas, (snap) => {
  tablaFacturas.innerHTML = "";
  snap.forEach((docu) => {
    const d = docu.data();
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
          <button class="ver" data-tipo="factura" data-id="${docu.id}">🔍</button>
          <button class="editar" data-tipo="factura" data-id="${docu.id}">✏️</button>
          <button class="eliminar" data-tipo="factura" data-id="${docu.id}">🗑️</button>
        </td>
      </tr>`;
  });
});

// ===================== ACTUALIZAR SELECTS DE FACTURA =====================
async function actualizarSelectsFactura() {
  const selectProv = document.getElementById("facturaProveedor");
  const selectProd = document.getElementById("facturaProducto");

  selectProv.innerHTML = "<option value=''>Seleccionar proveedor</option>";
  selectProd.innerHTML = "<option value=''>Seleccionar producto</option>";

  const provSnap = await getDocs(colProveedores);
  provSnap.forEach(p => {
    selectProv.innerHTML += `<option value="${p.data().nombre}">${p.data().nombre}</option>`;
  });

  const prodSnap = await getDocs(colProductos);
  prodSnap.forEach(p => {
    selectProd.innerHTML += `<option value="${p.data().nombre}">${p.data().nombre}</option>`;
  });
}

// ===================== CÁLCULO AUTOMÁTICO DE IGV Y TOTAL =====================
document.getElementById("montoFactura").addEventListener("input", e => {
  const monto = parseFloat(e.target.value) || 0;
  const igv = monto * 0.18;
  const total = monto + igv;
  document.getElementById("igvFactura").value = igv.toFixed(2);
  document.getElementById("totalFactura").value = total.toFixed(2);
});

// ===================== FORMULARIOS DE REGISTRO =====================
formProveedor.addEventListener("submit", async e => {
  e.preventDefault();
  await addDoc(colProveedores, {
    idProveedor: generarID("PROV"),
    nombre: e.target.nombre.value,
    tipoDocumento: e.target.tipoDocumento.value,
    numeroDocumento: e.target.numeroDocumento.value,
    telefono: e.target.telefono.value,
    email: e.target.email.value,
    direccion: e.target.direccion.value
  });
  formProveedor.reset();
});

formProducto.addEventListener("submit", async e => {
  e.preventDefault();
  await addDoc(colProductos, {
    idProducto: generarID("PROD"),
    nombre: e.target.nombre.value,
    categoria: e.target.categoria.value,
    presentacionCantidad: e.target.presentacionCantidad.value,
    presentacionTipo: e.target.presentacionTipo.value,
    precio: parseFloat(e.target.precio.value),
    moneda: e.target.moneda.value,
    descripcion: e.target.descripcion.value
  });
  formProducto.reset();
});

formFactura.addEventListener("submit", async e => {
  e.preventDefault();
  await addDoc(colFacturas, {
    idFactura: generarID("FACT"),
    fecha: e.target.fecha.value,
    proveedor: e.target.facturaProveedor.value,
    producto: e.target.facturaProducto.value,
    subtotal: parseFloat(e.target.montoFactura.value),
    igv: parseFloat(e.target.igvFactura.value),
    total: parseFloat(e.target.totalFactura.value),
    tipo: e.target.tipo.value,
    moneda: e.target.moneda.value
  });
  formFactura.reset();
});

// ===================== VER / EDITAR / ELIMINAR =====================
document.addEventListener("click", async (e) => {
  // -------- ELIMINAR --------
  if (e.target.classList.contains("eliminar")) {
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    const colNombre = tipo === "proveedor" ? "proveedores" : tipo === "producto" ? "productos" : "facturas";
    if (confirm(`¿Desea eliminar este ${tipo}?`)) {
      await deleteDoc(doc(db, colNombre, id));
    }
  }

  // -------- VER DETALLE --------
  if (e.target.classList.contains("ver")) {
    const tipo = e.target.dataset.tipo;
    if (tipo === "factura") {
      const id = e.target.dataset.id;
      const snap = await getDocs(query(colFacturas, where("__name__", "==", id)));
      if (!snap.empty) {
        const f = snap.docs[0].data();
        alert(
          `📄 DETALLE DE FACTURA\n\n` +
          `ID: ${f.idFactura}\nProveedor: ${f.proveedor}\nProducto: ${f.producto}\n\n` +
          `Subtotal: S/ ${f.subtotal.toFixed(2)}\nIGV: S/ ${f.igv.toFixed(2)}\nTotal: S/ ${f.total.toFixed(2)}`
        );
      }
    }
  }
});

// ===================== NUEVO: REGISTRO SI NO EXISTE EN SELECT =====================
const selectProveedorFactura = document.getElementById("facturaProveedor");
const selectProductoFactura = document.getElementById("facturaProducto");

function existeEnSelect(select, valor) {
  return Array.from(select.options).some(opt => opt.text.toLowerCase() === valor.toLowerCase());
}

selectProveedorFactura.addEventListener("change", e => {
  const valor = e.target.value.trim();
  if (valor && !existeEnSelect(selectProveedorFactura, valor)) {
    const confirmar = confirm(`El proveedor "${valor}" no está registrado. ¿Desea agregarlo ahora?`);
    if (confirmar) {
      document.querySelector("#panelProveedores").style.display = "block";
      document.getElementById("nombreProveedor").value = valor;
      document.getElementById("panelProveedores").scrollIntoView({ behavior: "smooth" });
    } else e.target.value = "";
  }
});

selectProductoFactura.addEventListener("change", e => {
  const valor = e.target.value.trim();
  if (valor && !existeEnSelect(selectProductoFactura, valor)) {
    const confirmar = confirm(`El producto "${valor}" no está registrado. ¿Desea agregarlo ahora?`);
    if (confirmar) {
      document.querySelector("#panelProductos").style.display = "block";
      document.getElementById("nombreProducto").value = valor;
      document.getElementById("panelProductos").scrollIntoView({ behavior: "smooth" });
    } else e.target.value = "";
  }
});
