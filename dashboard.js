// dashboard.js
import { auth, db } from "./firebase.js"; // db = getFirestore(app)
import { collection, addDoc, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// ======= PROVEEDORES =======
const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.getElementById("tablaProveedores").querySelector("tbody");
const selectProveedorFactura = document.getElementById("selectProveedorFactura");

// Agregar proveedor a Firestore
formProveedor.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProveedor").value;
  const ruc = document.getElementById("rucProveedor").value;
  const direccion = document.getElementById("direccionProveedor").value;

  try {
    await addDoc(collection(db, "proveedores"), { nombre, ruc, direccion });
    formProveedor.reset();
  } catch (error) {
    console.error("Error al agregar proveedor:", error);
  }
});

// Actualizar tabla de proveedores en tiempo real
const proveedoresRef = collection(db, "proveedores");
onSnapshot(proveedoresRef, (snapshot) => {
  tablaProveedores.innerHTML = "";
  selectProveedorFactura.innerHTML = `<option value="">Seleccionar proveedor</option>`;
  snapshot.forEach(doc => {
    const data = doc.data();
    tablaProveedores.innerHTML += `<tr><td>${data.ruc}</td><td>${data.nombre}</td><td>${data.direccion}</td></tr>`;
    selectProveedorFactura.innerHTML += `<option value="${data.nombre}">${data.nombre}</option>`;
  });
});

// ======= FACTURAS =======
const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas").querySelector("tbody");

formFactura.addEventListener("submit", async (e) => {
  e.preventDefault();
  const proveedor = selectProveedorFactura.value;
  const numero = document.getElementById("numeroFactura").value;
  const fecha = document.getElementById("fechaFactura").value;
  const descripcion = document.getElementById("descripcionFactura").value;
  const monto = parseFloat(document.getElementById("montoFactura").value) || 0;

  try {
    await addDoc(collection(db, "facturas"), { proveedor, numero, fecha, descripcion, monto });
    formFactura.reset();
  } catch (error) {
    console.error("Error al agregar factura:", error);
  }
});

// Actualizar tabla de facturas en tiempo real
const facturasRef = collection(db, "facturas");
onSnapshot(facturasRef, (snapshot) => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(doc => {
    const f = doc.data();
    tablaFacturas.innerHTML += `<tr>
      <td>${f.proveedor}</td>
      <td>${f.numero}</td>
      <td>${f.fecha}</td>
      <td>${f.descripcion}</td>
      <td>${f.monto.toFixed(2)}</td>
    </tr>`;
  });
});

// ======= GASTOS =======
const formGasto = document.getElementById("formGasto");
const tablaGastos = document.getElementById("tablaGastos").querySelector("tbody");

formGasto.addEventListener("submit", async (e) => {
  e.preventDefault();
  const descripcion = document.getElementById("descripcionGasto").value;
  const monto = parseFloat(document.getElementById("montoGasto").value) || 0;

  try {
    await addDoc(collection(db, "gastos"), { descripcion, monto });
    formGasto.reset();
  } catch (error) {
    console.error("Error al agregar gasto:", error);
  }
});

const gastosRef = collection(db, "gastos");
onSnapshot(gastosRef, (snapshot) => {
  tablaGastos.innerHTML = "";
  snapshot.forEach(doc => {
    const g = doc.data();
    tablaGastos.innerHTML += `<tr><td>${g.descripcion}</td><td>${g.monto.toFixed(2)}</td></tr>`;
  });
});

// ======= SERVICIOS =======
const formServicio = document.getElementById("formServicio");
const tablaServicios = document.getElementById("tablaServicios").querySelector("tbody");

formServicio.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreServicio").value;
  const costo = parseFloat(document.getElementById("costoServicio").value) || 0;

  try {
    await addDoc(collection(db, "servicios"), { nombre, costo });
    formServicio.reset();
  } catch (error) {
    console.error("Error al agregar servicio:", error);
  }
});

const serviciosRef = collection(db, "servicios");
onSnapshot(serviciosRef, (snapshot) => {
  tablaServicios.innerHTML = "";
  snapshot.forEach(doc => {
    const s = doc.data();
    tablaServicios.innerHTML += `<tr><td>${s.nombre}</td><td>${s.costo.toFixed(2)}</td></tr>`;
  });
});

