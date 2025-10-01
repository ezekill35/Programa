import { auth, db } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// ---------- MENÚ LATERAL ----------
const secciones = {
  Proveedor: document.getElementById("seccionProveedor"),
  Factura: document.getElementById("seccionFactura"),
  Gastos: document.getElementById("seccionGastos"),
  Servicio: document.getElementById("seccionServicio")
};

const menuItems = {
  Proveedor: document.getElementById("menuProveedor"),
  Factura: document.getElementById("menuFactura"),
  Gastos: document.getElementById("menuGastos"),
  Servicio: document.getElementById("menuServicio")
};

Object.keys(menuItems).forEach(key => {
  menuItems[key].addEventListener("click", () => {
    Object.values(secciones).forEach(sec => sec.classList.add("hidden"));
    Object.values(menuItems).forEach(item => item.style.background = "");
    secciones[key].classList.remove("hidden");
    menuItems[key].style.background = "#1abc9c";
  });
});

// ---------- CERRAR SESIÓN ----------
document.getElementById("btnLogout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ---------- FUNCIONES FIRESTORE ----------
async function cargarTabla(coleccion, tablaBody) {
  tablaBody.innerHTML = "";
  const snapshot = await getDocs(collection(db, coleccion));
  snapshot.forEach(docu => {
    const data = docu.data();
    const row = document.createElement("tr");
    row.innerHTML = Object.values(data).map(val => `<td>${val}</td>`).join("") + `<td><button class="eliminar">Eliminar</button></td>`;
    row.querySelector(".eliminar").addEventListener("click", async () => {
      await deleteDoc(doc(db, coleccion, docu.id));
      row.remove();
    });
    tablaBody.appendChild(row);
  });
}

// ---------- PROVEEDOR ----------
const tablaProveedor = document.querySelector("#tablaProveedor tbody");
document.getElementById("agregarProveedor").addEventListener("click", async () => {
  const ruc = document.getElementById("rucProveedor").value;
  const nombre = document.getElementById("nombreProveedor").value;
  const direccion = document.getElementById("direccionProveedor").value;
  if (!ruc || !nombre) return alert("RUC y Nombre son obligatorios");
  await addDoc(collection(db, "proveedor"), { ruc, nombre, direccion });
  document.getElementById("rucProveedor").value = "";
  document.getElementById("nombreProveedor").value = "";
  document.getElementById("direccionProveedor").value = "";
  cargarTabla("proveedor", tablaProveedor);
  cargarSelectProveedor();
});
document.getElementById("buscarProveedor").addEventListener("input", () => {
  const filter = document.getElementById("buscarProveedor").value.toLowerCase();
  Array.from(tablaProveedor.rows).forEach(row => {
    row.style.display = row.cells[0].textContent.toLowerCase().includes(filter) || row.cells[1].textContent.toLowerCase().includes(filter) ? "" : "none";
  });
});
cargarTabla("proveedor", tablaProveedor);

// ---------- SELECT PROVEEDOR PARA FACTURA ----------
const selectProveedorFactura = document.getElementById("selectProveedorFactura");
async function cargarSelectProveedor() {
  selectProveedorFactura.innerHTML = `<option value="">-- Seleccionar Proveedor --</option>`;
  const snapshot = await getDocs(collection(db, "proveedor"));
  snapshot.forEach(docu => {
    const p = docu.data();
    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = `${p.nombre} (${p.ruc})`;
    selectProveedorFactura.appendChild(option);
  });
}
cargarSelectProveedor();

// ---------- FACTURA ----------
const tablaFactura = document.querySelector("#tablaFactura tbody");
document.getElementById("agregarFactura").addEventListener("click", async () => {
  const ruc = document.getElementById("rucFactura").value;
  const proveedor = selectProveedorFactura.value;
  const descripcion = document.getElementById("descripcionFactura").value;
  const fecha = document.getElementById("fechaFactura").value;
  if (!ruc || !proveedor) return alert("RUC y Proveedor son obligatorios");
  await addDoc(collection(db, "factura"), { ruc, proveedor, descripcion, fecha });
  document.getElementById("rucFactura").value = "";
  document.getElementById("descripcionFactura").value = "";
  document.getElementById("fechaFactura").value = "";
  cargarTabla("factura", tablaFactura);
});
document.getElementById("buscarFactura").addEventListener("input", () => {
  const filter = document.getElementById("buscarFactura").value.toLowerCase();
  Array.from(tablaFactura.rows).forEach(row => {
    row.style.display = row.cells[0].textContent.toLowerCase().includes(filter) || row.cells[2].textContent.toLowerCase().includes(filter) ? "" : "none";
  });
});
cargarTabla("factura", tablaFactura);

// ---------- GASTOS ----------
const tablaGasto = document.querySelector("#tablaGasto tbody");
document.getElementById("agregarGasto").addEventListener("click", async () => {
  const nombre = document.getElementById("nombreGasto").value;
  const monto = document.getElementById("montoGasto").value;
  const fecha = document.getElementById("fechaGasto").value;
  if (!nombre) return alert("Nombre es obligatorio");
  await addDoc(collection(db, "gasto"), { nombre, monto, fecha });
  document.getElementById("nombreGasto").value = "";
  document.getElementById("montoGasto").value = "";
  document.getElementById("fechaGasto").value = "";
  cargarTabla("gasto", tablaGasto);
});
document.getElementById("buscarGasto").addEventListener("input", () => {
  const filter = document.getElementById("buscarGasto").value.toLowerCase();
  Array.from(tablaGasto.rows).forEach(row => {
    row.style.display = row.cells[0].textContent.toLowerCase().includes(filter) ? "" : "none";
  });
});
cargarTabla("gasto", tablaGasto);

// ---------- SERVICIO ----------
const tablaServicio = document.querySelector("#tablaServicio tbody");
document.getElementById("agregarServicio").addEventListener("click", async () => {
  const nombre = document.getElementById("nombreServicio").value;
  const monto = document.getElementById("montoServicio").value;
  const fecha = document.getElementById("fechaServicio").value;
  if (!nombre) return alert("Nombre es obligatorio");
  await addDoc(collection(db, "servicio"), { nombre, monto, fecha });
  document.getElementById("nombreServicio").value = "";
  document.getElementById("montoServicio").value = "";
  document.getElementById("fechaServicio").value = "";
  cargarTabla("servicio", tablaServicio);
});
document.getElementById("buscarServicio").addEventListener("input", () => {
  const filter = document.getElementById("buscarServicio").value.toLowerCase();
  Array.from(tablaServicio.rows).forEach(row => {
    row.style.display = row.cells[0].textContent.toLowerCase().includes(filter) ? "" : "none";
  });
});
cargarTabla("servicio", tablaServicio);






