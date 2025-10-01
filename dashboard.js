import { auth, db } from "./firebase.js";
import { 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
  collection, addDoc, getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const userInfo = document.getElementById("userInfo");
const btnLogout = document.getElementById("btnLogout");

// 🔹 Verifica usuario logueado
onAuthStateChanged(auth, async (user) => {
  if (user) {
    userInfo.textContent = `Bienvenido, ${user.email}`;
    cargarDatos();
  } else {
    window.location.href = "index.html";
  }
});

// 🔹 Logout
btnLogout.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// =============== PRODUCTOS ===============
const formProducto = document.getElementById("formProducto");
formProducto.addEventListener("submit", async (e) => {
  e.preventDefault();
  await addDoc(collection(db, "productos"), {
    nombre: document.getElementById("prodNombre").value,
    precio: parseFloat(document.getElementById("prodPrecio").value),
    stock: parseInt(document.getElementById("prodStock").value),
    categoria: document.getElementById("prodCategoria").value
  });
  formProducto.reset();
  cargarDatos();
});

// =============== PROVEEDORES ===============
const formProveedor = document.getElementById("formProveedor");
formProveedor.addEventListener("submit", async (e) => {
  e.preventDefault();
  await addDoc(collection(db, "proveedores"), {
    nombre: document.getElementById("provNombre").value,
    ruc: document.getElementById("provRuc").value,
    telefono: document.getElementById("provTelefono").value
  });
  formProveedor.reset();
  cargarDatos();
});

// =============== FACTURAS ===============
const formFactura = document.getElementById("formFactura");
formFactura.addEventListener("submit", async (e) => {
  e.preventDefault();
  await addDoc(collection(db, "facturas"), {
    numero: document.getElementById("facNumero").value,
    proveedor: document.getElementById("facProveedor").value,
    fecha: document.getElementById("facFecha").value,
    total: parseFloat(document.getElementById("facTotal").value)
  });
  formFactura.reset();
  cargarDatos();
});

// =============== SERVICIOS ===============
const formServicio = document.getElementById("formServicio");
formServicio.addEventListener("submit", async (e) => {
  e.preventDefault();
  await addDoc(collection(db, "servicios"), {
    nombre: document.getElementById("servNombre").value,
    precio: parseFloat(document.getElementById("servPrecio").value),
    duracion: document.getElementById("servDuracion").value
  });
  formServicio.reset();
  cargarDatos();
});

// =============== CARGAR DATOS ===============
async function cargarDatos() {
  // Productos
  const productosSnap = await getDocs(collection(db, "productos"));
  const tablaProductos = document.getElementById("tablaProductos");
  tablaProductos.innerHTML = "";
  productosSnap.forEach(doc => {
    const p = doc.data();
    tablaProductos.innerHTML += `
      <tr>
        <td>${doc.id}</td>
        <td>${p.nombre}</td>
        <td>S/. ${p.precio}</td>
        <td>${p.stock}</td>
        <td>${p.categoria}</td>
      </tr>
    `;
  });

  // Proveedores
  const proveedoresSnap = await getDocs(collection(db, "proveedores"));
  const tablaProveedores = document.getElementById("tablaProveedores");
  const facProveedor = document.getElementById("facProveedor");
  tablaProveedores.innerHTML = "";
  facProveedor.innerHTML = `<option value="">Seleccione proveedor</option>`;
  proveedoresSnap.forEach(doc => {
    const pr = doc.data();
    tablaProveedores.innerHTML += `
      <tr>
        <td>${doc.id}</td>
        <td>${pr.nombre}</td>
        <td>${pr.ruc}</td>
        <td>${pr.telefono}</td>
      </tr>
    `;
    facProveedor.innerHTML += `<option value="${pr.nombre}">${pr.nombre}</option>`;
  });

  // Facturas
  const facturasSnap = await getDocs(collection(db, "facturas"));
  const tablaFacturas = document.getElementById("tablaFacturas");
  tablaFacturas.innerHTML = "";
  facturasSnap.forEach(doc => {
    const f = doc.data();
    tablaFacturas.innerHTML += `
      <tr>
        <td>${f.numero}</td>
        <td>${f.proveedor}</td>
        <td>${f.fecha}</td>
        <td>S/. ${f.total}</td>
      </tr>
    `;
  });

  // Servicios
  const serviciosSnap = await getDocs(collection(db, "servicios"));
  const tablaServicios = document.getElementById("tablaServicios");
  tablaServicios.innerHTML = "";
  serviciosSnap.forEach(doc => {
    const s = doc.data();
    tablaServicios.innerHTML += `
      <tr>
        <td>${doc.id}</td>
        <td>${s.nombre}</td>
        <td>S/. ${s.precio}</td>
        <td>${s.duracion}</td>
      </tr>
    `;
  });
}


