import { auth } from "./firebase.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// Inicializamos Firestore
const db = getFirestore();

// ==================== CIERRE DE SESIÓN ====================
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});

// ==================== NAVEGACIÓN ====================
const menuBtns = document.querySelectorAll(".menu-btn");
const secciones = document.querySelectorAll(".seccion");

menuBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    menuBtns.forEach((b) => b.classList.remove("activo"));
    btn.classList.add("activo");
    secciones.forEach((s) => s.classList.remove("activa"));
    document.getElementById(btn.dataset.target).classList.add("activa");
  });
});

// ==================== PROVEEDORES ====================
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");

proveedorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();

  if (!ruc || !nombre) return alert("Completa todos los campos requeridos.");

  await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion });
  proveedorForm.reset();
});

onSnapshot(collection(db, "proveedores"), (snapshot) => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.ruc}</td>
      <td>${data.nombre}</td>
      <td>${data.direccion || "-"}</td>
      <td>
        <button class="btn-edit" data-id="${docSnap.id}" data-tipo="proveedor">✏️</button>
        <button class="btn-delete" data-id="${docSnap.id}" data-tipo="proveedor">🗑️</button>
      </td>`;
    tablaProveedores.appendChild(tr);
  });
  cargarProveedoresSelect();
});

// ==================== PRODUCTOS ====================
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");

productoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const cantidad = parseInt(document.getElementById("cantidadProducto").value);
  const unidad = document.getElementById("unidadProducto").value.trim();
  const precio = parseFloat(document.getElementById("valorUnitarioProducto").value);

  if (!nombre || isNaN(cantidad) || isNaN(precio))
    return alert("Completa correctamente los campos obligatorios.");

  await addDoc(collection(db, "productos"), { nombre, cantidad, unidad, precio });
  productoForm.reset();
});

onSnapshot(collection(db, "productos"), (snapshot) => {
  tablaProductos.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.cantidad}</td>
      <td>${data.unidad || "-"}</td>
      <td>S/ ${data.precio.toFixed(2)}</td>
      <td>
        <button class="btn-edit" data-id="${docSnap.id}" data-tipo="producto">✏️</button>
        <button class="btn-delete" data-id="${docSnap.id}" data-tipo="producto">🗑️</button>
      </td>`;
    tablaProductos.appendChild(tr);
  });
  cargarProductosSelect();
});

// ==================== FACTURAS ====================
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");
const proveedorFactura = document.getElementById("proveedorFactura");
const productoFactura = document.getElementById("productoFactura");

facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const numero = document.getElementById("numeroFactura").value.trim();
  const fecha = document.getElementById("fechaEmisionFactura").value;
  const proveedor = proveedorFactura.value;
  const producto = productoFactura.value;
  const monto = parseFloat(document.getElementById("montoFactura").value);
  const moneda = document.getElementById("monedaFactura").value;
  const tipo = document.getElementById("tipoFactura").value;

  if (!proveedor || !producto || isNaN(monto))
    return alert("Completa todos los campos obligatorios.");

  await addDoc(collection(db, "facturas"), {
    numero,
    fecha,
    proveedor,
    producto,
    monto,
    moneda,
    tipo,
  });
  facturaForm.reset();
});

onSnapshot(collection(db, "facturas"), (snapshot) => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const f = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.numero || "-"}</td>
      <td>${f.proveedor}</td>
      <td>${f.producto}</td>
      <td>${f.moneda} ${f.monto.toFixed(2)}</td>
      <td>${f.tipo}</td>
      <td>${f.fecha || "-"}</td>
      <td>
        <button class="btn-edit" data-id="${docSnap.id}" data-tipo="factura">✏️</button>
        <button class="btn-delete" data-id="${docSnap.id}" data-tipo="factura">🗑️</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  });
});

// ==================== ELIMINAR Y EDITAR ====================
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const id = btn.dataset.id;
  const tipo = btn.dataset.tipo;

  if (btn.classList.contains("btn-delete")) {
    if (confirm("¿Seguro que deseas eliminar este registro?")) {
      await deleteDoc(doc(db, tipo + "s", id));
    }
  }

  if (btn.classList.contains("btn-edit")) {
    const nuevoValor = prompt("Editar campo principal (nombre o monto):");
    if (nuevoValor) {
      const ref = doc(db, tipo + "s", id);
      if (tipo === "producto") await updateDoc(ref, { nombre: nuevoValor });
      else if (tipo === "proveedor") await updateDoc(ref, { nombre: nuevoValor });
      else if (tipo === "factura") await updateDoc(ref, { monto: parseFloat(nuevoValor) });
    }
  }
});

// ==================== BUSCADOR FACTURAS ====================
const buscadorFactura = document.getElementById("buscadorFactura");
const btnRefresh = document.getElementById("btnRefresh");

buscadorFactura.addEventListener("input", async () => {
  const texto = buscadorFactura.value.toLowerCase();
  const snapshot = await getDocs(collection(db, "facturas"));
  tablaFacturas.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const f = docSnap.data();
    if (f.producto.toLowerCase().includes(texto)) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${f.numero || "-"}</td>
        <td>${f.proveedor}</td>
        <td>${f.producto}</td>
        <td>${f.moneda} ${f.monto.toFixed(2)}</td>
        <td>${f.tipo}</td>
        <td>${f.fecha || "-"}</td>
        <td>
          <button class="btn-edit" data-id="${docSnap.id}" data-tipo="factura">✏️</button>
          <button class="btn-delete" data-id="${docSnap.id}" data-tipo="factura">🗑️</button>
        </td>`;
      tablaFacturas.appendChild(tr);
    }
  });
});

btnRefresh.addEventListener("click", () => {
  buscadorFactura.value = "";
});

// ==================== CARGAR SELECTS ====================
async function cargarProveedoresSelect() {
  const snapshot = await getDocs(collection(db, "proveedores"));
  proveedorFactura.innerHTML = '<option value="">Seleccionar proveedor</option>';
  snapshot.forEach((d) => {
    const p = d.data();
    const opt = document.createElement("option");
    opt.value = p.nombre;
    opt.textContent = `${p.nombre} (${p.ruc})`;
    proveedorFactura.appendChild(opt);
  });
}

async function cargarProductosSelect() {
  const snapshot = await getDocs(collection(db, "productos"));
  productoFactura.innerHTML = '<option value="">Seleccionar producto</option>';
  snapshot.forEach((d) => {
    const p = d.data();
    const opt = document.createElement("option");
    opt.value = p.nombre;
    opt.textContent = `${p.nombre} - S/ ${p.precio}`;
    productoFactura.appendChild(opt);
  });
}

