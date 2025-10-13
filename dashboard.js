// ==========================
// DASHBOARD.JS - DISCOVERY PETS (Firestore v12.4.0)
// ==========================

import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import { db, auth } from "./firebase.js";

// ==========================
// AUTENTICACIÓN
// ==========================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});

document.getElementById("logout").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
});

// ==========================
// NAVEGACIÓN ENTRE SECCIONES
// ==========================
const menuLinks = document.querySelectorAll(".nav-link");
const secciones = document.querySelectorAll(".seccion");

menuLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    menuLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");

    secciones.forEach((sec) => (sec.style.display = "none"));
    document.querySelector(link.getAttribute("href")).style.display = "block";
  });
});

document.querySelector("#inicio").style.display = "block";

// ==========================
// CRUD: PROVEEDORES
// ==========================
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");
const proveedorFactura = document.getElementById("proveedorFactura");

proveedorForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombreProveedor").value.trim();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const telefono = document.getElementById("telefonoProveedor").value.trim();

  if (!/^\d+$/.test(ruc) || !/^\d+$/.test(telefono)) {
    alert("RUC y Teléfono deben contener solo números.");
    return;
  }

  await addDoc(collection(db, "proveedores"), { nombre, ruc, telefono });
  proveedorForm.reset();
});

onSnapshot(collection(db, "proveedores"), (snapshot) => {
  tablaProveedores.innerHTML = "";
  proveedorFactura.innerHTML = '<option value="">Seleccionar</option>';

  snapshot.forEach((docu) => {
    const data = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.ruc}</td>
      <td>${data.telefono}</td>
      <td><button class="btn btn-danger btn-sm eliminar" data-id="${docu.id}" data-tipo="proveedores">🗑️</button></td>
    `;
    tablaProveedores.appendChild(tr);

    const option = document.createElement("option");
    option.value = docu.id;
    option.textContent = data.nombre;
    proveedorFactura.appendChild(option);
  });
});

// ==========================
// CRUD: PRODUCTOS
// ==========================
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");
const productoFactura = document.getElementById("productoFactura");

productoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombreProducto").value.trim();
  const valorUnitario = parseFloat(document.getElementById("valorProducto").value);

  if (isNaN(valorUnitario)) {
    alert("Ingrese un valor numérico válido para el producto.");
    return;
  }

  await addDoc(collection(db, "productos"), { nombre, valorUnitario });
  productoForm.reset();
});

onSnapshot(collection(db, "productos"), (snapshot) => {
  tablaProductos.innerHTML = "";
  productoFactura.innerHTML = '<option value="">Seleccionar</option>';

  snapshot.forEach((docu) => {
    const data = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.valorUnitario.toFixed(2)}</td>
      <td><button class="btn btn-danger btn-sm eliminar" data-id="${docu.id}" data-tipo="productos">🗑️</button></td>
    `;
    tablaProductos.appendChild(tr);

    const option = document.createElement("option");
    option.value = docu.id;
    option.textContent = data.nombre;
    productoFactura.appendChild(option);
  });
});

// ==========================
// CRUD: FACTURAS
// ==========================
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");

facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const numero = document.getElementById("numeroFactura").value.trim();
  const fecha = document.getElementById("fechaFactura").value;
  const proveedorKey = document.getElementById("proveedorFactura").value;
  const productoKey = document.getElementById("productoFactura").value;
  const monto = parseFloat(document.getElementById("montoFactura").value);
  const tipo = document.getElementById("tipoFactura").value;
  const moneda = document.getElementById("monedaFactura").value;

  if (!numero || !fecha || !proveedorKey || !productoKey || isNaN(monto)) {
    alert("Complete todos los campos correctamente.");
    return;
  }

  await addDoc(collection(db, "facturas"), {
    numero, fecha, proveedorKey, productoKey, monto, tipo, moneda
  });

  facturaForm.reset();
});

onSnapshot(collection(db, "facturas"), async (snapshot) => {
  tablaFacturas.innerHTML = "";

  for (const docu of snapshot.docs) {
    const data = docu.data();
    const proveedorSnap = await getDoc(doc(db, "proveedores", data.proveedorKey));
    const productoSnap = await getDoc(doc(db, "productos", data.productoKey));

    const proveedor = proveedorSnap.exists() ? proveedorSnap.data().nombre : "—";
    const producto = productoSnap.exists() ? productoSnap.data().nombre : "—";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.numero}</td>
      <td>${data.fecha}</td>
      <td>${proveedor}</td>
      <td>${producto}</td>
      <td>${data.moneda}${data.monto.toFixed(2)}</td>
      <td>${data.tipo}</td>
      <td><button class="btn btn-danger btn-sm eliminar" data-id="${docu.id}" data-tipo="facturas">🗑️</button></td>
    `;
    tablaFacturas.appendChild(tr);
  }
});

// ==========================
// ELIMINAR ELEMENTOS
// ==========================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("eliminar")) {
    const id = e.target.getAttribute("data-id");
    const tipo = e.target.getAttribute("data-tipo");

    if (confirm("¿Deseas eliminar este registro?")) {
      await deleteDoc(doc(db, tipo, id));
    }
  }
});






