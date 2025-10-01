import { auth, db } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Menú
const menuItems = {
  Proveedor: document.getElementById("menuProveedor"),
  Factura: document.getElementById("menuFactura"),
  Gastos: document.getElementById("menuGastos"),
  Servicio: document.getElementById("menuServicio"),
};

const sections = {
  Proveedor: document.getElementById("seccionProveedor"),
  Factura: document.getElementById("seccionFactura"),
  Gastos: document.getElementById("seccionGastos"),
  Servicio: document.getElementById("seccionServicio"),
};

function cambiarSeccion(seccion) {
  Object.keys(sections).forEach(key => {
    sections[key].classList.add("hidden");
    menuItems[key].classList.remove("active");
  });
  sections[seccion].classList.remove("hidden");
  menuItems[seccion].classList.add("active");
  document.getElementById("tituloSeccion").textContent = seccion;
}

// Event listeners menú
Object.keys(menuItems).forEach(key => {
  menuItems[key].addEventListener("click", () => cambiarSeccion(key));
});

// Cerrar sesión
document.getElementById("btnLogout").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
});

// ------------------ CRUD Proveedor ------------------
const tablaProveedor = document.getElementById("tablaProveedor");
const buscarProveedor = document.getElementById("buscarProveedor");

async function cargarProveedores() {
  tablaProveedor.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "proveedores"));
  querySnapshot.forEach(docu => {
    const data = docu.data();
    tablaProveedor.innerHTML += `
      <tr>
        <td>${data.ruc}</td>
        <td>${data.nombre}</td>
        <td>${data.direccion}</td>
        <td><button onclick="eliminarProveedor('${docu.id}')">Eliminar</button></td>
      </tr>
    `;
  });
}

window.eliminarProveedor = async (id) => {
  await deleteDoc(doc(db, "proveedores", id));
  cargarProveedores();
};

document.getElementById("btnAgregarProveedor").addEventListener("click", async () => {
  const ruc = document.getElementById("provRuc").value;
  const nombre = document.getElementById("provNombre").value;
  const direccion = document.getElementById("provDireccion").value;
  if (ruc && nombre && direccion) {
    await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion });
    document.getElementById("provRuc").value = "";
    document.getElementById("provNombre").value = "";
    document.getElementById("provDireccion").value = "";
    cargarProveedores();
  }
});

buscarProveedor.addEventListener("input", async () => {
  const val = buscarProveedor.value.toLowerCase();
  tablaProveedor.innerHTML = "";
  const q = query(collection(db, "proveedores"));
  const snapshot = await getDocs(q);
  snapshot.forEach(docu => {
    const data = docu.data();
    if (data.ruc.toLowerCase().includes(val) || data.nombre.toLowerCase().includes(val)) {
      tablaProveedor.innerHTML += `
        <tr>
          <td>${data.ruc}</td>
          <td>${data.nombre}</td>
          <td>${data.direccion}</td>
          <td><button onclick="eliminarProveedor('${docu.id}')">Eliminar</button></td>
        </tr>
      `;
    }
  });
});

// TODO: Repetir lógica similar para Factura, Gastos y Servicio
// Cambiar IDs, campos y colecciones: "facturas", "gastos", "servicios"

// Inicialización
cargarProveedores();
cambiarSeccion("Proveedor");



