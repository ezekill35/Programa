import { db, auth } from "./firebase.js";
import { collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/7.20.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/7.20.0/firebase-auth.js";

// Navegación entre secciones
const navButtons = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".content-section");
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    sections.forEach(sec => sec.classList.remove("active"));
    document.getElementById(btn.dataset.section).classList.add("active");
  });
});

// Cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => window.location.href="index.html");
});

// --- CRUD Proveedores ---
const tablaProveedores = document.getElementById("tablaProveedores");
const formProveedor = document.getElementById("formProveedor");
const proveedorSelect = document.getElementById("proveedorFactura");

formProveedor.addEventListener("submit", async e => {
  e.preventDefault();
  const ruc = document.getElementById("rucProv").value;
  const nombre = document.getElementById("nombreProv").value;
  const producto = document.getElementById("productoProv").value;
  const direccion = document.getElementById("direccionProv").value;

  await addDoc(collection(db, "proveedores"), { ruc, nombre, producto, direccion });
  formProveedor.reset();
});

// --- Actualizar tabla y select de proveedores en tiempo real ---
onSnapshot(collection(db, "proveedores"), snapshot => {
  tablaProveedores.innerHTML = "";
  proveedorSelect.innerHTML = '<option value="">Seleccione proveedor</option>';
  snapshot.forEach(docu => {
    const data = docu.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.ruc}</td>
      <td>${data.nombre}</td>
      <td>${data.producto}</td>
      <td>${data.direccion}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteProveedor('${docu.id}')">Eliminar</button>
      </td>
    `;
    tablaProveedores.appendChild(row);

    const option = document.createElement("option");
    option.value = data.nombre;
    option.textContent = data.nombre;
    proveedorSelect.appendChild(option);
  });
});

window.deleteProveedor = async id => {
  if(confirm("Eliminar proveedor?")) {
    await deleteDoc(doc(db, "proveedores", id));
  }
};

// --- CRUD Facturas ---
const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas");

formFactura.addEventListener("submit", async e => {
  e.preventDefault();
  const proveedor = document.getElementById("proveedorFactura").value;
  const tipo = document.getElementById("tipoFactura").value;
  const monto = document.getElementById("montoFactura").value;
  const moneda = document.getElementById("monedaFactura").value;
  const fecha = document.getElementById("fechaFactura").value;
  const desc = document.getElementById("descFactura").value;

  await addDoc(collection(db, "facturas"), { proveedor, tipo, monto, moneda, fecha, desc });
  formFactura.reset();
});

onSnapshot(collection(db, "facturas"), snapshot => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(docu => {
    const data = docu.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.proveedor}</td>
      <td>${data.tipo}</td>
      <td>${data.moneda} ${data.monto}</td>
      <td>${data.fecha}</td>
      <td>${data.desc}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteFactura('${docu.id}')">Eliminar</button>
      </td>
    `;
    tablaFacturas.appendChild(row);
  });
});

window.deleteFactura = async id => {
  if(confirm("Eliminar factura?")) {
    await deleteDoc(doc(db, "facturas", id));
  }
};

// --- CRUD Gastos ---
const formGasto = document.getElementById("formGasto");
const tablaGastos = document.getElementById("tablaGastos");

formGasto.addEventListener("submit", async e => {
  e.preventDefault();
  const nombre = document.getElementById("nombreGasto").value;
  const tipo = document.getElementById("tipoGasto").value;
  const monto = document.getElementById("montoGasto").value;
  const fecha = document.getElementById("fechaGasto").value;

  await addDoc(collection(db, "gastos"), { nombre, tipo, monto, fecha });
  formGasto.reset();
});

onSnapshot(collection(db, "gastos"), snapshot => {
  tablaGastos.innerHTML = "";
  snapshot.forEach(docu => {
    const data = docu.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.tipo}</td>
      <td>${data.monto}</td>
      <td>${data.fecha}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteGasto('${docu.id}')">Eliminar</button>
      </td>
    `;
    tablaGastos.appendChild(row);
  });
});

window.deleteGasto = async id => {
  if(confirm("Eliminar gasto?")) {
    await deleteDoc(doc(db, "gastos", id));
  }
};

// --- CRUD Servicios ---
const formServicio = document.getElementById("formServicio");
const tablaServicios = document.getElementById("tablaServicios");

formServicio.addEventListener("submit", async e => {
  e.preventDefault();
  const nombre = document.getElementById("nombreServ").value;
  const precio = document.getElementById("precioServ").value;
  const fecha = document.getElementById("fechaServ").value;
  const desc = document.getElementById("descServ").value;

  await addDoc(collection(db, "servicios"), { nombre, precio, fecha, desc });
  formServicio.reset();
});

onSnapshot(collection(db, "servicios"), snapshot => {
  tablaServicios.innerHTML = "";
  snapshot.forEach(docu => {
    const data = docu.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.precio}</td>
      <td>${data.fecha}</td>
      <td>${data.desc}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteServicio('${docu.id}')">Eliminar</button>
      </td>
    `;
    tablaServicios.appendChild(row);
  });
});

window.deleteServicio = async id => {
  if(confirm("Eliminar servicio?")) {
    await deleteDoc(doc(db, "servicios", id));
  }
};

// --- Contadores de reportes ---
const countProveedores = document.getElementById("countProveedores");
const countFacturas = document.getElementById("countFacturas");
const countGastos = document.getElementById("countGastos");
const countServicios = document.getElementById("countServicios");

const updateCounts = () => {
  getDocs(collection(db, "proveedores")).then(s => countProveedores.textContent = s.size);
  getDocs(collection(db, "facturas")).then(s => countFacturas.textContent = s.size);
  getDocs(collection(db, "gastos")).then(s => countGastos.textContent = s.size);
  getDocs(collection(db, "servicios")).then(s => countServicios.textContent = s.size);
};

setInterval(updateCounts, 1000); // Actualiza cada segundo
updateCounts();



