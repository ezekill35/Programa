import { auth, db } from "./firebase.js";
import {
  signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// SECCIONES
const secciones = ["proveedor", "factura", "gastos", "servicio"];
let seccionActual = "proveedor";

const tituloSeccion = document.getElementById("tituloSeccion");
const tablaHeader = document.getElementById("tablaHeader");
const tablaBody = document.getElementById("tablaBody");
const buscador = document.getElementById("buscador");

function mostrarSeccion(seccion) {
  seccionActual = seccion;
  tituloSeccion.textContent = seccion.charAt(0).toUpperCase() + seccion.slice(1);

  // ocultar todos los formularios
  document.querySelectorAll(".formulario").forEach(f => f.classList.add("hidden"));
  // mostrar el formulario actual
  document.getElementById(`form${seccion.charAt(0).toUpperCase() + seccion.slice(1)}`).classList.remove("hidden");

  // destacar opción activa
  secciones.forEach(s => document.getElementById(`op${s.charAt(0).toUpperCase() + s.slice(1)}`).classList.remove("active"));
  document.getElementById(`op${seccion.charAt(0).toUpperCase() + seccion.slice(1)}`).classList.add("active");

  cargarTabla();
}

window.mostrarSeccion = mostrarSeccion;

// CERRAR SESIÓN
document.getElementById("btnLogout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// AGREGAR DATOS
async function agregarDatos(seccion, datos) {
  try {
    await addDoc(collection(db, seccion), datos);
    cargarTabla();
    if(seccion === "proveedor") cargarSelectProveedor();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

// EVENTOS AGREGAR
document.getElementById("btnAddProveedor").addEventListener("click", () => {
  const rut = document.getElementById("rutProveedor").value;
  const nombre = document.getElementById("nombreProveedor").value;
  const direccion = document.getElementById("direccionProveedor").value;
  if(!rut || !nombre) return alert("RUT y Nombre son obligatorios");
  agregarDatos("proveedor", { rut, nombre, direccion });
});

document.getElementById("btnAddFactura").addEventListener("click", () => {
  const ruc = document.getElementById("rucFactura").value;
  const proveedor = document.getElementById("selectProveedorFactura").value;
  const descripcion = document.getElementById("descripcionFactura").value;
  const fecha = document.getElementById("fechaFactura").value;
  if(!ruc || !proveedor) return alert("RUC y Proveedor son obligatorios");
  agregarDatos("factura", { ruc, proveedor, descripcion, fecha });
});

document.getElementById("btnAddGasto").addEventListener("click", () => {
  const nombre = document.getElementById("nombreGasto").value;
  const monto = document.getElementById("montoGasto").value;
  const fecha = document.getElementById("fechaGasto").value;
  if(!nombre) return alert("Nombre es obligatorio");
  agregarDatos("gastos", { nombre, monto, fecha });
});

document.getElementById("btnAddServicio").addEventListener("click", () => {
  const nombre = document.getElementById("nombreServicio").value;
  const costo = document.getElementById("costoServicio").value;
  const fecha = document.getElementById("fechaServicio").value;
  if(!nombre) return alert("Nombre es obligatorio");
  agregarDatos("servicio", { nombre, costo, fecha });
});

// CARGAR SELECT PROVEEDOR EN FACTURA
async function cargarSelectProveedor() {
  const select = document.getElementById("selectProveedorFactura");
  select.innerHTML = '<option value="">Selecciona un proveedor</option>';
  const snapshot = await getDocs(collection(db, "proveedor"));
  snapshot.forEach(doc => {
    const data = doc.data();
    select.innerHTML += `<option value="${data.nombre}">${data.nombre}</option>`;
  });
}

// CARGAR TABLA
async function cargarTabla() {
  let datos = [];
  tablaBody.innerHTML = "";

  const snapshot = await getDocs(collection(db, seccionActual));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    datos.push({ id: docSnap.id, ...data });
  });

  // FILTRO BUSCADOR
  const busqueda = buscador.value.toLowerCase();
  datos = datos.filter(d => {
    return Object.values(d).some(v => String(v).toLowerCase().includes(busqueda));
  });

  // HEADER TABLA
  tablaHeader.innerHTML = "";
  if(datos.length > 0) {
    Object.keys(datos[0]).forEach(k => {
      if(k !== "id") tablaHeader.innerHTML += `<th>${k.toUpperCase()}</th>`;
    });
    tablaHeader.innerHTML += `<th>ACCIONES</th>`;
  }

  // BODY TABLA
  datos.forEach(d => {
    let row = "<tr>";
    Object.keys(d).forEach(k => {
      if(k !== "id") row += `<td>${d[k]}</td>`;
    });
    row += `<td><button onclick="eliminarRegistro('${d.id}')">Eliminar</button></td>`;
    row += "</tr>";
    tablaBody.innerHTML += row;
  });
}

window.cargarTabla = cargarTabla;

// ELIMINAR
async function eliminarRegistro(id) {
  await deleteDoc(doc(db, seccionActual, id));
  cargarTabla();
}

window.eliminarRegistro = eliminarRegistro;

// BUSCADOR
buscador.addEventListener("input", cargarTabla);

// Inicial
mostrarSeccion("proveedor");
cargarSelectProveedor();





