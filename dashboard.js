// dashboard.js
import {
  getFirestore, collection, addDoc, onSnapshot, deleteDoc,
  doc, updateDoc, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { app } from "./firebase.js";

const db = getFirestore(app);
const auth = getAuth(app);

// --- ELEMENTOS ---
const menuBtns = document.querySelectorAll(".menu-btn");
const secciones = document.querySelectorAll(".seccion");
const logoutBtn = document.getElementById("logoutBtn");
const buscador = document.getElementById("buscadorGlobal");

// --- FORMULARIOS Y TABLAS ---
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");

const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");

const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");

const proveedorFactura = document.getElementById("proveedorFactura");
const productoFactura = document.getElementById("productoFactura");

// --- NAVEGACIÓN ENTRE SECCIONES ---
menuBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    menuBtns.forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    secciones.forEach(sec => sec.style.display = "none");
    document.getElementById(btn.dataset.target).style.display = "block";
  });
});

// --- CERRAR SESIÓN ---
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => window.location.href = "index.html");
});

// --- VALIDACIONES NUMÉRICAS ---
document.getElementById("rucProveedor").addEventListener("input", e => {
  e.target.value = e.target.value.replace(/\D/g, '');
});
document.getElementById("numeroFactura").addEventListener("input", e => {
  e.target.value = e.target.value.replace(/\D/g, '');
});

// --- GUARDAR PROVEEDOR ---
proveedorForm.addEventListener("submit", async e => {
  e.preventDefault();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();
  await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion });
  proveedorForm.reset();
});

// --- LISTAR PROVEEDORES EN TIEMPO REAL ---
onSnapshot(collection(db, "proveedores"), snapshot => {
  tablaProveedores.innerHTML = "";
  proveedorFactura.innerHTML = '<option value="">Seleccione proveedor</option>';
  snapshot.forEach(docu => {
    const p = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.ruc}</td>
      <td>${p.nombre}</td>
      <td>${p.direccion}</td>
      <td>
        <button class="btn-edit" data-id="${docu.id}" data-tipo="proveedor">✏️</button>
        <button class="btn-delete" data-id="${docu.id}" data-tipo="proveedor">🗑️</button>
      </td>`;
    tablaProveedores.appendChild(tr);
    proveedorFactura.innerHTML += `<option value="${p.nombre}">${p.nombre}</option>`;
  });
});

// --- GUARDAR PRODUCTO ---
productoForm.addEventListener("submit", async e => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const cantidad = document.getElementById("cantidadProducto").value;
  const unidad = document.getElementById("unidadProducto").value.trim();
  const valor = parseFloat(document.getElementById("valorUnitarioProducto").value);

  await addDoc(collection(db, "productos"), { nombre, cantidad, unidad, valor });
  productoForm.reset();
});

// --- LISTAR PRODUCTOS EN TIEMPO REAL ---
onSnapshot(collection(db, "productos"), snapshot => {
  tablaProductos.innerHTML = "";
  productoFactura.innerHTML = '<option value="">Seleccione producto</option>';
  snapshot.forEach(docu => {
    const p = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.cantidad}</td>
      <td>${p.unidad}</td>
      <td>${p.valor}</td>
      <td>
        <button class="btn-edit" data-id="${docu.id}" data-tipo="producto">✏️</button>
        <button class="btn-delete" data-id="${docu.id}" data-tipo="producto">🗑️</button>
      </td>`;
    tablaProductos.appendChild(tr);
    productoFactura.innerHTML += `<option value="${p.nombre}">${p.nombre}</option>`;
  });
});

// --- GUARDAR FACTURA ---
facturaForm.addEventListener("submit", async e => {
  e.preventDefault();
  const numero = document.getElementById("numeroFactura").value;
  const proveedor = proveedorFactura.value;
  const producto = productoFactura.value;
  const moneda = document.getElementById("monedaFactura").value;
  const monto = parseFloat(document.getElementById("montoFactura").value);
  const tipo = document.getElementById("tipoFactura").value;

  await addDoc(collection(db, "facturas"), {
    numero, proveedor, producto, monto, tipo, moneda
  });
  facturaForm.reset();
});

// --- LISTAR FACTURAS EN TIEMPO REAL ---
const cargarFacturas = () => {
  onSnapshot(collection(db, "facturas"), snapshot => {
    tablaFacturas.innerHTML = "";
    snapshot.forEach(docu => {
      const f = docu.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${f.numero}</td>
        <td>${f.proveedor}</td>
        <td>${f.producto}</td>
        <td>${f.moneda} ${f.monto}</td>
        <td>${f.tipo}</td>
        <td>
          <button class="btn-edit" data-id="${docu.id}" data-tipo="factura">✏️</button>
          <button class="btn-delete" data-id="${docu.id}" data-tipo="factura">🗑️</button>
        </td>`;
      tablaFacturas.appendChild(tr);
    });
  });
};
cargarFacturas();

// --- EDITAR / ELIMINAR ---
document.addEventListener("click", async e => {
  const btn = e.target;
  if (btn.classList.contains("btn-delete")) {
    const tipo = btn.dataset.tipo;
    const id = btn.dataset.id;
    await deleteDoc(doc(db, tipo + "s", id));
  }

  if (btn.classList.contains("btn-edit")) {
    const tipo = btn.dataset.tipo;
    const id = btn.dataset.id;
    let nuevosDatos = {};

    if (tipo === "proveedor") {
      const ruc = prompt("Nuevo RUC:");
      const nombre = prompt("Nuevo nombre:");
      const direccion = prompt("Nueva dirección:");
      nuevosDatos = { ruc, nombre, direccion };
    } else if (tipo === "producto") {
      const nombre = prompt("Nuevo nombre:");
      const cantidad = prompt("Nueva cantidad:");
      const unidad = prompt("Nueva unidad:");
      const valor = parseFloat(prompt("Nuevo valor:"));
      nuevosDatos = { nombre, cantidad, unidad, valor };
    } else if (tipo === "factura") {
      const numero = prompt("Nuevo número de factura:");
      const monto = parseFloat(prompt("Nuevo monto:"));
      const tipoF = prompt("Nuevo tipo (Factura Electrónica / Boleta):");
      nuevosDatos = { numero, monto, tipo: tipoF };
    }

    if (Object.values(nuevosDatos).some(v => v !== null && v !== "")) {
      await updateDoc(doc(db, tipo + "s", id), nuevosDatos);
    }
  }
});

// --- BUSCADOR POR PRODUCTO (solo al presionar Enter) ---
buscador.addEventListener("keypress", async e => {
  if (e.key === "Enter") {
    e.preventDefault();
    const texto = buscador.value.trim().toLowerCase();
    tablaFacturas.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "facturas"));
    let encontrados = 0;

    querySnapshot.forEach(docu => {
      const f = docu.data();
      if (texto && f.producto.toLowerCase().includes(texto)) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${f.numero}</td>
          <td>${f.proveedor}</td>
          <td>${f.producto}</td>
          <td>${f.moneda} ${f.monto}</td>
          <td>${f.tipo}</td>
          <td>
            <button class="btn-edit" data-id="${docu.id}" data-tipo="factura">✏️</button>
            <button class="btn-delete" data-id="${docu.id}" data-tipo="factura">🗑️</button>
          </td>`;
        tablaFacturas.appendChild(tr);
        encontrados++;
      }
    });

    if (encontrados === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="6" style="text-align:center; color:#ff7043; font-weight:600;">
        ⚠️ No se encontraron facturas relacionadas con ese producto.
      </td>`;
      tablaFacturas.appendChild(tr);
    }
  }
});




