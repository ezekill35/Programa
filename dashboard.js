// dashboard.js
import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// -------------------- MENSAJES --------------------
function showMessage(text, type = "success") {
  const div = document.createElement("div");
  div.textContent = text;
  div.className = `alert ${type}`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// -------------------- NAVEGACIÓN --------------------
const options = document.querySelectorAll(".option");
const sections = document.querySelectorAll(".section");

options.forEach((opt) => {
  opt.addEventListener("click", () => {
    if (opt.classList.contains("logout")) {
      signOut(auth).then(() => (window.location.href = "index.html"));
      return;
    }

    options.forEach((o) => o.classList.remove("active"));
    sections.forEach((s) => s.classList.remove("active"));

    opt.classList.add("active");
    document.getElementById(opt.dataset.section).classList.add("active");
  });
});

// -------------------- PROVEEDORES --------------------
const formProveedores = document.getElementById("formProveedores");
const tablaProveedores = document.getElementById("tablaProveedores");

formProveedores.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("provNombre").value.trim();
  const direccion = document.getElementById("provDireccion").value.trim();
  const producto = document.getElementById("provProducto").value.trim();
  const ruc = document.getElementById("provRuc").value.trim();

  if (!nombre || !direccion || !producto || !ruc)
    return showMessage("Completa todos los campos", "error");

  try {
    await addDoc(collection(db, "proveedores"), {
      nombre,
      direccion,
      producto,
      ruc,
    });
    formProveedores.reset();
    showMessage("Proveedor guardado correctamente 🏪");
  } catch (error) {
    showMessage("Error al guardar: " + error.message, "error");
  }
});

onSnapshot(collection(db, "proveedores"), (snapshot) => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach((doc) => {
    const p = doc.data();
    tablaProveedores.innerHTML += `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.direccion}</td>
        <td>${p.producto}</td>
        <td>${p.ruc}</td>
      </tr>`;
  });
  document.getElementById("countProveedores").textContent = snapshot.size;
});

// -------------------- FACTURAS --------------------
const formFacturas = document.getElementById("formFacturas");
const tablaFacturas = document.getElementById("tablaFacturas");

formFacturas.addEventListener("submit", async (e) => {
  e.preventDefault();
  const proveedor = document.getElementById("facProveedor").value.trim();
  const fecha = document.getElementById("facFecha").value.trim();
  const monto = parseFloat(document.getElementById("facMonto").value) || 0;
  const tipo = document.getElementById("facTipo").value.trim();
  const descripcion = document.getElementById("facDescripcion").value.trim();
  const moneda = document.getElementById("facMoneda").value;

  if (!proveedor || !fecha || !tipo)
    return showMessage("Completa los campos obligatorios", "error");

  try {
    await addDoc(collection(db, "facturas"), {
      proveedor,
      fecha,
      monto,
      tipo,
      descripcion,
      moneda,
    });
    formFacturas.reset();
    showMessage("Factura registrada correctamente 📑");
  } catch (error) {
    showMessage("Error al guardar factura: " + error.message, "error");
  }
});

onSnapshot(collection(db, "facturas"), (snapshot) => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach((doc) => {
    const f = doc.data();
    tablaFacturas.innerHTML += `
      <tr>
        <td>${f.proveedor}</td>
        <td>${f.fecha}</td>
        <td>${f.moneda} ${f.monto.toFixed(2)}</td>
        <td>${f.tipo}</td>
        <td>${f.descripcion}</td>
      </tr>`;
  });
  document.getElementById("countFacturas").textContent = snapshot.size;
});

// -------------------- GASTOS --------------------
const formGastos = document.getElementById("formGastos");
const tablaGastos = document.getElementById("tablaGastos");

formGastos.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("gasNombre").value.trim();
  const fecha = document.getElementById("gasFecha").value.trim();
  const tipo = document.getElementById("gasTipo").value.trim();
  const monto = parseFloat(document.getElementById("gasMonto").value) || 0;

  if (!nombre || !fecha || !tipo)
    return showMessage("Completa los campos obligatorios", "error");

  try {
    await addDoc(collection(db, "gastos"), { nombre, fecha, tipo, monto });
    formGastos.reset();
    showMessage("Gasto agregado correctamente 💰");
  } catch (error) {
    showMessage("Error al guardar gasto: " + error.message, "error");
  }
});

onSnapshot(collection(db, "gastos"), (snapshot) => {
  tablaGastos.innerHTML = "";
  snapshot.forEach((doc) => {
    const g = doc.data();
    tablaGastos.innerHTML += `
      <tr>
        <td>${g.nombre}</td>
        <td>${g.fecha}</td>
        <td>${g.tipo}</td>
        <td>S/. ${g.monto.toFixed(2)}</td>
      </tr>`;
  });
  document.getElementById("countGastos").textContent = snapshot.size;
});

// -------------------- SERVICIOS --------------------
const formServicios = document.getElementById("formServicios");
const tablaServicios = document.getElementById("tablaServicios");

formServicios.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("serNombre").value.trim();
  const fecha = document.getElementById("serFecha").value.trim();
  const descripcion = document.getElementById("serDescripcion").value.trim();
  const precio = parseFloat(document.getElementById("serPrecio").value) || 0;

  if (!nombre || !fecha || !descripcion)
    return showMessage("Completa todos los campos", "error");

  try {
    await addDoc(collection(db, "servicios"), {
      nombre,
      fecha,
      descripcion,
      precio,
    });
    formServicios.reset();
    showMessage("Servicio guardado correctamente 🛠");
  } catch (error) {
    showMessage("Error al guardar servicio: " + error.message, "error");
  }
});

onSnapshot(collection(db, "servicios"), (snapshot) => {
  tablaServicios.innerHTML = "";
  snapshot.forEach((doc) => {
    const s = doc.data();
    tablaServicios.innerHTML += `
      <tr>
        <td>${s.nombre}</td>
        <td>${s.fecha}</td>
        <td>${s.descripcion}</td>
        <td>S/. ${s.precio.toFixed(2)}</td>
      </tr>`;
  });
  document.getElementById("countServicios").textContent = snapshot.size;
});







