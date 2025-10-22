// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Configuración del proyecto Discovery Pets
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322"
};

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===================== REFERENCIAS FIRESTORE =====================
const colProveedores = collection(db, "proveedores");
const colProductos = collection(db, "productos");
const colFacturas = collection(db, "facturas");

// ===================== ELEMENTOS HTML =====================
const formProveedor = document.getElementById("formProveedor");
const formProducto = document.getElementById("formProducto");
const formFactura = document.getElementById("formFactura");

const tablaProveedores = document.getElementById("tablaProveedores");
const tablaProductos = document.getElementById("tablaProductos");
const tablaFacturas = document.getElementById("tablaFacturas");

const countProveedores = document.getElementById("countProveedores");
const countProductos = document.getElementById("countProductos");
const countFacturas = document.getElementById("countFacturas");

const proveedorFactura = document.getElementById("proveedorFactura");
const productoFactura = document.getElementById("productoFactura");
const tipoMoneda = document.getElementById("tipoMoneda");

// ===================== PROVEEDORES =====================
formProveedor.addEventListener("submit", async e => {
  e.preventDefault();

  const data = {
    nombre: document.getElementById("nombreProveedor").value,
    tipoDocumento: document.getElementById("tipoDocumento").value,
    numeroDocumento: document.getElementById("numeroDocumento").value,
    direccion: document.getElementById("direccionProveedor").value,
    telefono: document.getElementById("telefonoProveedor").value,
    correo: document.getElementById("correoProveedor").value
  };

  await addDoc(colProveedores, data);
  formProveedor.reset();
  alert("Proveedor registrado correctamente ✅");
});

// Escucha en tiempo real
onSnapshot(colProveedores, snapshot => {
  tablaProveedores.innerHTML = "";
  proveedorFactura.innerHTML = '<option value="">Seleccione...</option>';
  snapshot.forEach(docu => {
    const p = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.tipoDocumento}</td>
      <td>${p.numeroDocumento}</td>
      <td>${p.direccion}</td>
      <td>${p.telefono}</td>
      <td>${p.correo}</td>
      <td>
        <button class="btn-accion eliminar" data-tipo="proveedor" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaProveedores.appendChild(tr);

    // Añadir proveedor al select de facturas
    const opt = document.createElement("option");
    opt.value = p.nombre;
    opt.textContent = p.nombre;
    proveedorFactura.appendChild(opt);
  });
  countProveedores.textContent = snapshot.size;
});

// ===================== PRODUCTOS =====================
formProducto.addEventListener("submit", async e => {
  e.preventDefault();

  const data = {
    nombre: document.getElementById("nombreProducto").value,
    categoria: document.getElementById("categoriaProducto").value,
    presentacion: document.getElementById("presentacionProducto").value,
    precio: parseFloat(document.getElementById("precioProducto").value),
    stock: parseInt(document.getElementById("stockProducto").value)
  };

  await addDoc(colProductos, data);
  formProducto.reset();
  alert("Producto registrado correctamente ✅");
});

onSnapshot(colProductos, snapshot => {
  tablaProductos.innerHTML = "";
  productoFactura.innerHTML = '<option value="">Seleccione...</option>';
  snapshot.forEach(docu => {
    const p = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.categoria}</td>
      <td>${p.presentacion}</td>
      <td>${p.precio.toFixed(2)}</td>
      <td>${p.stock}</td>
      <td>
        <button class="btn-accion eliminar" data-tipo="producto" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaProductos.appendChild(tr);

    // Añadir producto al select de facturas
    const opt = document.createElement("option");
    opt.value = p.nombre;
    opt.textContent = p.nombre;
    productoFactura.appendChild(opt);
  });
  countProductos.textContent = snapshot.size;
});

// ===================== FACTURAS =====================
formFactura.addEventListener("submit", async e => {
  e.preventDefault();

  const proveedorSel = proveedorFactura.value.trim();
  const productoSel = productoFactura.value.trim();

  // Verificar proveedor
  const proveedoresSnap = await getDocs(colProveedores);
  const existeProveedor = proveedoresSnap.docs.some(doc => doc.data().nombre === proveedorSel);

  if (!existeProveedor) {
    if (confirm("El proveedor no existe. ¿Deseas registrarlo ahora?")) {
      document.querySelector('[data-target="proveedores"]').click();
    }
    return;
  }

  // Verificar producto
  const productosSnap = await getDocs(colProductos);
  const existeProducto = productosSnap.docs.some(doc => doc.data().nombre === productoSel);

  if (!existeProducto) {
    if (confirm("El producto no existe. ¿Deseas registrarlo ahora?")) {
      document.querySelector('[data-target="productos"]').click();
    }
    return;
  }

  const subtotal = parseFloat(document.getElementById("montoFactura").value) || 0;
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  const idAuto = "FAC-" + Date.now().toString().slice(-6);

  const data = {
    idFactura: idAuto,
    fecha: document.getElementById("fechaFactura").value,
    proveedor: proveedorSel,
    producto: productoSel,
    subtotal,
    igv,
    total,
    tipo: document.getElementById("tipoFactura").value,
    moneda: tipoMoneda.value
  };

  await addDoc(colFacturas, data);
  formFactura.reset();
  alert("Factura registrada correctamente ✅");
});

onSnapshot(colFacturas, snapshot => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(docu => {
    const f = docu.data();
    if (!f.subtotal || isNaN(f.subtotal)) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.idFactura || "(sin ID)"}</td>
      <td>${f.fecha}</td>
      <td>${f.proveedor}</td>
      <td>${f.producto}</td>
      <td>${f.moneda === 'soles' ? 'S/. ' : '$ '}${f.subtotal.toFixed(2)}</td>
      <td>${f.moneda === 'soles' ? 'S/. ' : '$ '}${f.igv.toFixed(2)}</td>
      <td>${f.moneda === 'soles' ? 'S/. ' : '$ '}${f.total.toFixed(2)}</td>
      <td>${f.tipo}</td>
      <td>
        <button class="btn-accion eliminar" data-tipo="factura" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  });
  countFacturas.textContent = snapshot.size;
});

// ===================== ELIMINAR REGISTROS =====================
document.addEventListener("click", async e => {
  if (e.target.classList.contains("eliminar")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    let ref;

    if (tipo === "proveedor") ref = doc(db, "proveedores", id);
    if (tipo === "producto") ref = doc(db, "productos", id);
    if (tipo === "factura") ref = doc(db, "facturas", id);

    if (confirm(`¿Seguro que deseas eliminar este ${tipo}?`)) {
      await deleteDoc(ref);
      alert(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} eliminado correctamente 🗑️`);
    }
  }
});

