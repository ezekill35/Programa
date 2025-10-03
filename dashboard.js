import { auth, db } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ------------------ LOGOUT ------------------
document.getElementById("btnLogout").addEventListener("click", () => {
  signOut(auth).then(() => window.location.href = "index.html");
});
document.getElementById("menu-logout").addEventListener("click", () => {
  signOut(auth).then(() => window.location.href = "index.html");
});

// ------------------ NAVEGACIÓN ------------------
const sections = document.querySelectorAll(".section");
document.querySelectorAll(".sidebar ul li").forEach((li) => {
  li.addEventListener("click", () => {
    sections.forEach(s => s.classList.remove("active"));
    const sec = document.getElementById(li.id.replace("menu-", ""));
    if(sec) sec.classList.add("active");

    document.querySelectorAll(".sidebar ul li").forEach(i => i.classList.remove("active"));
    li.classList.add("active");
  });
});

// ====================== PROVEEDORES ======================
const formProveedor = document.getElementById("formProveedor");
const listaProveedores = document.getElementById("listaProveedores");
const btnAgregarProveedor = document.getElementById("btnAgregarProveedor");

btnAgregarProveedor.addEventListener("click", async () => {
  const ruc = document.getElementById("provRuc").value;
  const nombre = document.getElementById("provNombre").value;
  const direccion = document.getElementById("provDireccion").value;
  const correo = document.getElementById("provCorreo").value;
  const telefono = document.getElementById("provTelefono").value;
  const producto = document.getElementById("provProducto").value;

  if(!ruc || !nombre) return alert("RUC y Nombre son obligatorios.");

  await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion, correo, telefono, producto });
  formProveedor.reset();
  cargarProveedores();
});

async function cargarProveedores() {
  listaProveedores.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "proveedores"));
  const selectProveedor = document.getElementById("facRucProveedor");
  selectProveedor.innerHTML = `<option value="">-- Selecciona un Proveedor --</option>`;
  querySnapshot.forEach(docSnap => {
    const prov = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${prov.ruc}</td>
      <td>${prov.nombre}</td>
      <td>${prov.direccion}</td>
      <td>${prov.correo}</td>
      <td>${prov.telefono}</td>
      <td>${prov.producto}</td>
      <td><button onclick="eliminarProveedor('${docSnap.id}')">❌</button></td>
    `;
    listaProveedores.appendChild(tr);
    selectProveedor.innerHTML += `<option value="${prov.nombre}">${prov.nombre}</option>`;
  });

  document.getElementById("total-proveedores").textContent = querySnapshot.size;
}
window.eliminarProveedor = async (id) => {
  await deleteDoc(doc(db, "proveedores", id));
  cargarProveedores();
}

// ====================== FACTURAS ======================
const listaFacturas = document.getElementById("listaFacturas");
const btnAgregarFactura = document.getElementById("btnAgregarFactura");
const buscarFactura = document.getElementById("buscarFactura");

btnAgregarFactura.addEventListener("click", async () => {
  const proveedor = document.getElementById("facRucProveedor").value;
  const tipo = document.getElementById("facTipo").value;
  const descripcion = document.getElementById("facDescripcion").value;
  const fecha = document.getElementById("facFecha").value;
  const monto = document.getElementById("facMonto").value;

  if(!proveedor || !tipo || !monto) return alert("Proveedor, Tipo y Monto son obligatorios.");

  await addDoc(collection(db, "facturas"), { proveedor, tipo, descripcion, fecha, monto });
  document.getElementById("facTipo").value = "";
  document.getElementById("facDescripcion").value = "";
  document.getElementById("facFecha").value = "";
  document.getElementById("facMonto").value = "";
  cargarFacturas();
});

async function cargarFacturas() {
  listaFacturas.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "facturas"));
  querySnapshot.forEach(docSnap => {
    const fac = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${fac.proveedor}</td>
      <td>${fac.tipo}</td>
      <td>${fac.descripcion || ""}</td>
      <td>${fac.fecha || ""}</td>
      <td>${fac.monto}</td>
      <td><button onclick="eliminarFactura('${docSnap.id}')">❌</button></td>
    `;
    listaFacturas.appendChild(tr);
  });
  document.getElementById("total-facturas").textContent = querySnapshot.size;
}
window.eliminarFactura = async (id) => {
  await deleteDoc(doc(db, "facturas", id));
  cargarFacturas();
}

// Buscador de Facturas
buscarFactura.addEventListener("input", (e) => {
  const texto = e.target.value.toLowerCase();
  document.querySelectorAll("#listaFacturas tr").forEach(tr => {
    tr.style.display = tr.innerText.toLowerCase().includes(texto) ? "" : "none";
  });
});

// ====================== GASTOS ======================
const listaGastos = document.getElementById("listaGastos");
const btnAgregarGasto = document.getElementById("btnAgregarGasto");

btnAgregarGasto.addEventListener("click", async () => {
  const nombre = document.getElementById("gastoNombre").value;
  const tipo = document.getElementById("gastoTipo").value;
  const monto = document.getElementById("gastoMonto").value;
  const fecha = document.getElementById("gastoFecha").value;

  if(!nombre || !tipo || !monto) return alert("Todos los campos son obligatorios.");
  await addDoc(collection(db, "gastos"), { nombre, tipo, monto, fecha });
  document.getElementById("formGasto").reset();
  cargarGastos();
});

async function cargarGastos() {
  listaGastos.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "gastos"));
  querySnapshot.forEach(docSnap => {
    const gasto = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${gasto.nombre}</td>
      <td>${gasto.tipo}</td>
      <td>${gasto.monto}</td>
      <td>${gasto.fecha || ""}</td>
      <td><button onclick="eliminarGasto('${docSnap.id}')">❌</button></td>
    `;
    listaGastos.appendChild(tr);
  });
  document.getElementById("total-gastos").textContent = querySnapshot.size;
}
window.eliminarGasto = async (id) => {
  await deleteDoc(doc(db, "gastos", id));
  cargarGastos();
}

// ====================== SERVICIOS ======================
const listaServicios = document.getElementById("listaServicios");
const btnAgregarServicio = document.getElementById("btnAgregarServicio");

btnAgregarServicio.addEventListener("click", async () => {
  const nombre = document.getElementById("servNombre").value;
  const descripcion = document.getElementById("servDescripcion").value;
  const fecha = document.getElementById("servFecha").value;
  const precio = document.getElementById("servPrecio").value;

  if(!nombre || !precio) return alert("Nombre y Precio son obligatorios.");
  await addDoc(collection(db, "servicios"), { nombre, descripcion, fecha, precio });
  document.getElementById("servNombre").value = "";
  document.getElementById("servDescripcion").value = "";
  document.getElementById("servFecha").value = "";
  document.getElementById("servPrecio").value = "";
  cargarServicios();
});

async function cargarServicios() {
  listaServicios.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "servicios"));
  querySnapshot.forEach(docSnap => {
    const serv = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${serv.nombre}</td>
      <td>${serv.descripcion || ""}</td>
      <td>${serv.fecha || ""}</td>
      <td>${serv.precio}</td>
      <td><button onclick="eliminarServicio('${docSnap.id}')">❌</button></td>
    `;
    listaServicios.appendChild(tr);
  });
  document.getElementById("total-servicios").textContent = querySnapshot.size;
}
window.eliminarServicio = async (id) => {
  await deleteDoc(doc(db, "servicios", id));
  cargarServicios();
}

// ====================== INICIALIZACIÓN ======================
cargarProveedores();
cargarFacturas();
cargarGastos();
cargarServicios();




