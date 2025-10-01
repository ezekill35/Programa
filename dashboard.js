import { db } from "./firebase.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Función de navegación
window.mostrarSeccion = (seccion) => {
  document.querySelectorAll("section").forEach(s => s.classList.add("hidden"));
  document.getElementById(seccion).classList.remove("hidden");
};

// ------------------- PROVEEDORES -------------------
const proveedorForm = document.getElementById("proveedorForm");
const listaProveedores = document.getElementById("listaProveedores");
const selectProveedorFactura = document.getElementById("selectProveedorFactura");

async function cargarProveedores() {
  listaProveedores.innerHTML = "";
  selectProveedorFactura.innerHTML = "";
  const snapshot = await getDocs(collection(db, "proveedores"));
  snapshot.forEach(doc => {
    const data = doc.data();
    // Lista
    const div = document.createElement("div");
    div.textContent = `Nombre: ${data.nombre}, RUC: ${data.ruc}, Dirección: ${data.direccion}`;
    listaProveedores.appendChild(div);
    // Select para facturas
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = data.nombre;
    selectProveedorFactura.appendChild(option);
  });
}

proveedorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProveedor").value;
  const ruc = document.getElementById("rucProveedorInput").value;
  const direccion = document.getElementById("direccionProveedor").value;

  await addDoc(collection(db, "proveedores"), { nombre, ruc, direccion });
  proveedorForm.reset();
  cargarProveedores();
});

// Cargar al inicio
cargarProveedores();

// ------------------- FACTURAS -------------------
const facturaForm = document.getElementById("facturaForm");
facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const proveedorId = selectProveedorFactura.value;
  const descripcion = document.getElementById("descripcionFactura").value;
  const direccion = document.getElementById("direccionFactura").value;

  await addDoc(collection(db, "facturas"), { proveedorId, descripcion, direccion, fecha: new Date() });
  facturaForm.reset();
  alert("Factura registrada!");
});

// ------------------- GASTOS -------------------
const gastoForm = document.getElementById("gastoForm");
gastoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const descripcion = document.getElementById("gastoDescripcion").value;
  const monto = document.getElementById("gastoMonto").value;
  await addDoc(collection(db, "gastos"), { descripcion, monto, fecha: new Date() });
  gastoForm.reset();
  alert("Gasto registrado!");
});

// ------------------- SERVICIOS -------------------
const servicioForm = document.getElementById("servicioForm");
servicioForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("servicioNombre").value;
  const costo = document.getElementById("servicioCosto").value;
  await addDoc(collection(db, "servicios"), { nombre, costo, fecha: new Date() });
  servicioForm.reset();
  alert("Servicio registrado!");
});


