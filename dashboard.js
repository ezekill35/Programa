import { auth, db } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// ELEMENTOS
const menuItems = {
  Proveedor: document.getElementById("menuProveedor"),
  Factura: document.getElementById("menuFactura"),
  Gastos: document.getElementById("menuGastos"),
  Servicio: document.getElementById("menuServicio"),
};
const formSections = {
  Proveedor: document.getElementById("formProveedor"),
  Factura: document.getElementById("formFactura"),
  Gastos: document.getElementById("formGastos"),
  Servicio: document.getElementById("formServicio"),
};
const tituloSeccion = document.getElementById("tituloSeccion");
const tablaBody = document.getElementById("tablaBody");
const tablaHeader = document.getElementById("tablaHeader");

// LOGOUT
document.getElementById("btnLogout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// MENU SELECCIÓN
Object.keys(menuItems).forEach((key) => {
  menuItems[key].addEventListener("click", () => mostrarSeccion(key));
});

function mostrarSeccion(seccion) {
  // Ocultar todas
  Object.values(formSections).forEach(f => f.classList.add("hidden"));
  Object.values(menuItems).forEach(m => m.classList.remove("active"));

  // Mostrar seleccionada
  formSections[seccion].classList.remove("hidden");
  menuItems[seccion].classList.add("active");
  tituloSeccion.textContent = seccion;

  cargarTabla(seccion);
}

// CARGAR TABLA
async function cargarTabla(seccion) {
  tablaBody.innerHTML = "";
  tablaHeader.innerHTML = "";

  let campos = [];
  switch (seccion) {
    case "Proveedor": campos = ["RUC","Nombre","Dirección"]; break;
    case "Factura": campos = ["RUC","Tipo","Descripción","Fecha"]; break;
    case "Gastos": campos = ["Descripción","Monto","Fecha"]; break;
    case "Servicio": campos = ["Descripción","Costo","Fecha"]; break;
  }

  // Crear encabezado
  campos.forEach(c => {
    const th = document.createElement("th");
    th.textContent = c;
    tablaHeader.appendChild(th);
  });
  const thAccion = document.createElement("th");
  thAccion.textContent = "Acción";
  tablaHeader.appendChild(thAccion);

  // Obtener datos Firestore
  const q = collection(db, seccion.toLowerCase());
  const snap = await getDocs(q);
  snap.forEach(docSnap => {
    const tr = document.createElement("tr");
    campos.forEach(c => {
      const td = document.createElement("td");
      td.textContent = docSnap.data()[c] || "";
      tr.appendChild(td);
    });
    // Botón eliminar
    const tdAccion = document.createElement("td");
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.addEventListener("click", async () => {
      await deleteDoc(doc(db, seccion.toLowerCase(), docSnap.id));
      cargarTabla(seccion);
    });
    tdAccion.appendChild(btnEliminar);
    tr.appendChild(tdAccion);

    tablaBody.appendChild(tr);
  });
}

// AGREGAR DATOS
document.getElementById("btnAgregarProveedor")?.addEventListener("click", async () => {
  const RUC = document.getElementById("provRUC").value;
  const Nombre = document.getElementById("provNombre").value;
  const Dirección = document.getElementById("provDireccion").value;
  await addDoc(collection(db, "proveedor"), { RUC, Nombre, Dirección });
  cargarTabla("Proveedor");
});

document.getElementById("btnAgregarFactura")?.addEventListener("click", async () => {
  const RUC = document.getElementById("factRUC").value;
  const Tipo = document.getElementById("factTipo").value;
  const Descripción = document.getElementById("factDescripcion").value;
  const Fecha = document.getElementById("factFecha").value;
  await addDoc(collection(db, "factura"), { RUC, Tipo, Descripción, Fecha });
  cargarTabla("Factura");
});

document.getElementById("btnAgregarGasto")?.addEventListener("click", async () => {
  const Descripción = document.getElementById("gastoDescripcion").value;
  const Monto = document.getElementById("gastoMonto").value;
  const Fecha = document.getElementById("gastoFecha").value;
  await addDoc(collection(db, "gastos"), { Descripción, Monto, Fecha });
  cargarTabla("Gastos");
});

document.getElementById("btnAgregarServicio")?.addEventListener("click", async () => {
  const Descripción = document.getElementById("servDescripcion").value;
  const Costo = document.getElementById("servCosto").value;
  const Fecha = document.getElementById("servFecha").value;
  await addDoc(collection(db, "servicio"), { Descripción, Costo, Fecha });
  cargarTabla("Servicio");
});

// Inicializa con Proveedor
mostrarSeccion("Proveedor");



