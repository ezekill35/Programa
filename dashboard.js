// dashboard.js
import { db, auth } from "./firebase.js";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// ------------ Navegación ----------------
const navButtons = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".content-section");

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    sections.forEach(sec => sec.classList.remove("active"));
    document.getElementById(btn.dataset.section).classList.add("active");
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ------------ Cerrar sesión ----------------
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ------------ Proveedores ----------------
const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.getElementById("tablaProveedores");
const proveedorSelect = document.getElementById("proveedorFactura");

formProveedor.addEventListener("submit", async e => {
  e.preventDefault();
  await addDoc(collection(db, "proveedores"), {
    ruc: document.getElementById("rucProv").value,
    nombre: document.getElementById("nombreProv").value,
    producto: document.getElementById("productoProv").value,
    direccion: document.getElementById("direccionProv").value
  });
  formProveedor.reset();
});

// Listar proveedores en tiempo real
onSnapshot(collection(db, "proveedores"), snapshot => {
  tablaProveedores.innerHTML = "";
  proveedorSelect.innerHTML = "<option value=''>Seleccione proveedor</option>";
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.ruc}</td>
      <td>${data.nombre}</td>
      <td>${data.producto}</td>
      <td>${data.direccion}</td>
      <td>
        <button onclick="editarProveedor('${docSnap.id}', '${data.ruc}', '${data.nombre}', '${data.producto}', '${data.direccion}')">Editar</button>
        <button onclick="eliminarProveedor('${docSnap.id}')">Eliminar</button>
      </td>
    `;
    tablaProveedores.appendChild(tr);

    // Para facturas
    const option = document.createElement("option");
    option.value = data.nombre;
    option.textContent = data.nombre;
    proveedorSelect.appendChild(option);
  });
});

window.eliminarProveedor = async (id) => {
  await deleteDoc(doc(db, "proveedores", id));
};

window.editarProveedor = async (id, ruc, nombre, producto, direccion) => {
  const nuevoRuc = prompt("RUC:", ruc);
  const nuevoNombre = prompt("Nombre:", nombre);
  const nuevoProducto = prompt("Producto:", producto);
  const nuevaDireccion = prompt("Dirección:", direccion);
  await updateDoc(doc(db, "proveedores", id), {
    ruc: nuevoRuc,
    nombre: nuevoNombre,
    producto: nuevoProducto,
    direccion: nuevaDireccion
  });
};

// ------------ Facturas ----------------
const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas");

formFactura.addEventListener("submit", async e => {
  e.preventDefault();
  await addDoc(collection(db, "facturas"), {
    proveedor: document.getElementById("proveedorFactura").value,
    tipo: document.getElementById("tipoFactura").value,
    monto: Number(document.getElementById("montoFactura").value),
    moneda: document.getElementById("monedaFactura").value,
    fecha: document.getElementById("fechaFactura").value,
    descripcion: document.getElementById("descFactura").value
  });
  formFactura.reset();
});

// Listar facturas en tiempo real
onSnapshot(collection(db, "facturas"), snapshot => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.proveedor}</td>
      <td>${data.tipo}</td>
      <td>${data.moneda} ${data.monto}</td>
      <td>${data.fecha}</td>
      <td>${data.descripcion}</td>
      <td>
        <button onclick="eliminarFactura('${docSnap.id}')">Eliminar</button>
      </td>
    `;
    tablaFacturas.appendChild(tr);
  });
});

window.eliminarFactura = async (id) => {
  await deleteDoc(doc(db, "facturas", id));
};

// ------------ Gastos ----------------
const formGasto = document.getElementById("formGasto");
const tablaGastos = document.getElementById("tablaGastos");

formGasto.addEventListener("submit", async e => {
  e.preventDefault();
  await addDoc(collection(db, "gastos"), {
    nombre: document.getElementById("nombreGasto").value,
    tipo: document.getElementById("tipoGasto").value,
    monto: Number(document.getElementById("montoGasto").value),
    fecha: document.getElementById("fechaGasto").value
  });
  formGasto.reset();
});

onSnapshot(collection(db, "gastos"), snapshot => {
  tablaGastos.innerHTML = "";
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.tipo}</td>
      <td>${data.monto}</td>
      <td>${data.fecha}</td>
      <td>
        <button onclick="eliminarGasto('${docSnap.id}')">Eliminar</button>
      </td>
    `;
    tablaGastos.appendChild(tr);
  });
});

window.eliminarGasto = async (id) => {
  await deleteDoc(doc(db, "gastos", id));
};

// ------------ Servicios ----------------
const formServicio = document.getElementById("formServicio");
const tablaServicios = document.getElementById("tablaServicios");

formServicio.addEventListener("submit", async e => {
  e.preventDefault();
  await addDoc(collection(db, "servicios"), {
    nombre: document.getElementById("nombreServ").value,
    precio: Number(document.getElementById("precioServ").value),
    fecha: document.getElementById("fechaServ").value,
    descripcion: document.getElementById("descServ").value
  });
  formServicio.reset();
});

onSnapshot(collection(db, "servicios"), snapshot => {
  tablaServicios.innerHTML = "";
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.precio}</td>
      <td>${data.fecha}</td>
      <td>${data.descripcion}</td>
      <td>
        <button onclick="eliminarServicio('${docSnap.id}')">Eliminar</button>
      </td>
    `;
    tablaServicios.appendChild(tr);
  });
});

window.eliminarServicio = async (id) => {
  await deleteDoc(doc(db, "servicios", id));
};


