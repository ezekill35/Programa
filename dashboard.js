// dashboard.js
import { db, auth } from "./firebase.js";
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// ================== FUNCION PARA CAMBIAR SECCIONES ==================
export function mostrarSeccion(seccionId) {
  document.querySelectorAll(".seccion").forEach(sec => sec.classList.add("oculto"));
  document.getElementById(seccionId).classList.remove("oculto");
}

// ================== CRUD PROVEEDORES ==================
async function cargarProveedores() {
  const tabla = document.getElementById("tablaProveedores");
  tabla.innerHTML = "";
  const snapshot = await getDocs(collection(db, "proveedores"));
  snapshot.forEach(docu => {
    const data = docu.data();
    let fila = `<tr>
      <td>${data.ruc}</td>
      <td>${data.nombre}</td>
      <td>${data.direccion}</td>
      <td>${data.telefono}</td>
      <td><button onclick="eliminarRegistro('proveedores','${docu.id}')">❌ Eliminar</button></td>
    </tr>`;
    tabla.innerHTML += fila;
  });
}

async function agregarProveedor(e) {
  e.preventDefault();
  const form = e.target;
  const ruc = form.ruc.value;
  const nombre = form.nombre.value;
  const direccion = form.direccion.value;
  const telefono = form.telefono.value;

  try {
    await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion, telefono });
    form.reset();
    cargarProveedores();
  } catch (err) {
    console.error("Error al agregar proveedor:", err);
  }
}

// ================== CRUD FACTURAS ==================
async function cargarFacturas() {
  const tabla = document.getElementById("tablaFacturas");
  tabla.innerHTML = "";
  const snapshot = await getDocs(collection(db, "facturas"));
  snapshot.forEach(docu => {
    const data = docu.data();
    let fila = `<tr>
      <td>${data.rucProveedor}</td>
      <td>${data.nombreProveedor}</td>
      <td>${data.fecha}</td>
      <td>${data.monto}</td>
      <td><button onclick="eliminarRegistro('facturas','${docu.id}')">❌ Eliminar</button></td>
    </tr>`;
    tabla.innerHTML += fila;
  });
}

async function agregarFactura(e) {
  e.preventDefault();
  const form = e.target;
  const rucProveedor = form.rucProveedor.value;

  // Buscar proveedor
  const q = query(collection(db, "proveedores"), where("ruc", "==", rucProveedor));
  const snap = await getDocs(q);
  let nombreProveedor = "";
  snap.forEach(d => { nombreProveedor = d.data().nombre; });

  if (!nombreProveedor) {
    alert("Proveedor no encontrado. Registra primero al proveedor.");
    return;
  }

  const fecha = form.fecha.value;
  const monto = form.monto.value;

  try {
    await addDoc(collection(db, "facturas"), { rucProveedor, nombreProveedor, fecha, monto });
    form.reset();
    cargarFacturas();
  } catch (err) {
    console.error("Error al agregar factura:", err);
  }
}

// ================== ELIMINAR REGISTROS ==================
window.eliminarRegistro = async (coleccion, id) => {
  await deleteDoc(doc(db, coleccion, id));
  cargarProveedores();
  cargarFacturas();
};

// ================== BUSCADORES ==================
function activarBuscador(inputId, tablaId) {
  const input = document.getElementById(inputId);
  input.addEventListener("keyup", () => {
    const filtro = input.value.toLowerCase();
    document.querySelectorAll(`#${tablaId} tr`).forEach(fila => {
      fila.style.display = fila.innerText.toLowerCase().includes(filtro) ? "" : "none";
    });
  });
}

// ================== EVENTOS ==================
document.getElementById("formProveedor").addEventListener("submit", agregarProveedor);
document.getElementById("formFactura").addEventListener("submit", agregarFactura);

activarBuscador("buscarProveedores", "tablaProveedores");
activarBuscador("buscarFacturas", "tablaFacturas");

// ================== LOGOUT ==================
document.getElementById("btnLogout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ================== INICIALIZAR ==================
cargarProveedores();
cargarFacturas();


