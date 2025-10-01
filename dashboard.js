// dashboard.js
import { auth, db, verificarSesion } from "./firebase.js";
import { collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ==========================
// 📌 Verificar sesión
// ==========================
verificarSesion(user => {
  console.log("Usuario activo:", user.email);
  cargarTodo();
});

// ==========================
// 📌 FUNCIONES DE DATOS
// ==========================
async function cargarDatos(coleccion, tablaId) {
  const tabla = document.getElementById(tablaId);
  tabla.innerHTML = "";
  const snapshot = await getDocs(collection(db, coleccion));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    let fila = "<tr>";
    Object.values(data).forEach(valor => fila += `<td>${valor}</td>`);
    fila += `<td><button class="btnEliminar" data-id="${docSnap.id}" data-coleccion="${coleccion}">❌</button></td>`;
    fila += "</tr>";
    tabla.innerHTML += fila;
  });
  activarEliminacion();
}

// Agregar registro
async function agregarRegistro(coleccion, datos, tablaId) {
  try {
    await addDoc(collection(db, coleccion), datos);
    alert("✅ Registro agregado correctamente");
    cargarDatos(coleccion, tablaId);
  } catch (error) {
    alert("❌ Error al agregar: " + error.message);
  }
}

// ==========================
// 📌 BOTONES DE ELIMINAR
// ==========================
function activarEliminacion() {
  document.querySelectorAll(".btnEliminar").forEach(btn => {
    btn.addEventListener("click", async () => {
      const coleccion = btn.dataset.coleccion;
      const id = btn.dataset.id;
      if (confirm("¿Deseas eliminar este registro?")) {
        await deleteDoc(doc(db, coleccion, id));
        alert("✅ Registro eliminado");
        cargarDatos(coleccion, `tabla${coleccion.charAt(0).toUpperCase() + coleccion.slice(1)}`);
      }
    });
  });
}

// ==========================
// 📌 BUSCADORES EN TIEMPO REAL
// ==========================
function activarBuscador(inputId, tablaId) {
  const input = document.getElementById(inputId);
  input.addEventListener("input", () => {
    const filtro = input.value.toLowerCase();
    const filas = document.querySelectorAll(`#${tablaId} tr`);
    filas.forEach(fila => {
      fila.style.display = fila.innerText.toLowerCase().includes(filtro) ? "" : "none";
    });
  });
}

// ==========================
// 📌 CARGAR TODO
// ==========================
async function cargarTodo() {
  await cargarDatos("proveedores", "tablaProveedores");
  await cargarDatos("facturas", "tablaFacturas");
  await cargarDatos("servicios", "tablaServicios");
  await cargarDatos("ventas", "tablaVentas");
  await cargarDatos("gastos", "tablaGastos");

  activarBuscador("buscarProveedores", "tablaProveedores");
  activarBuscador("buscarFacturas", "tablaFacturas");
  activarBuscador("buscarServicios", "tablaServicios");
  activarBuscador("buscarVentas", "tablaVentas");
  activarBuscador("buscarGastos", "tablaGastos");
}

// ==========================
// 📌 FORMULARIOS
// ==========================

// Proveedores
document.getElementById("formProveedor").addEventListener("submit", e => {
  e.preventDefault();
  const datos = {
    ruc: e.target.ruc.value,
    nombre: e.target.nombre.value,
    direccion: e.target.direccion.value,
    telefono: e.target.telefono.value
  };
  agregarRegistro("proveedores", datos, "tablaProveedores");
  e.target.reset();
});

// Facturas con búsqueda de proveedor por RUC
const inputRUC = document.getElementById("inputRUC");
const nombreProveedorP = document.getElementById("nombreProveedor");

inputRUC.addEventListener("input", async () => {
  const ruc = inputRUC.value.trim();
  if (!ruc) {
    nombreProveedorP.textContent = "";
    return;
  }

  const snapshot = await getDocs(collection(db, "proveedores"));
  let encontrado = false;
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.ruc === ruc) {
      nombreProveedorP.textContent = `Proveedor: ${data.nombre}`;
      encontrado = true;
    }
  });

  if (!encontrado) {
    nombreProveedorP.innerHTML = `Proveedor no encontrado. <button id="btnAgregarProveedor">Agregar proveedor</button>`;
    document.getElementById("btnAgregarProveedor").addEventListener("click", () => {
      mostrarSeccion("proveedores");
      document.getElementById("formProveedor").ruc.value = ruc;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

document.getElementById("formFactura").addEventListener("submit", async e => {
  e.preventDefault();
  const ruc = e.target.ruc.value.trim();
  let nombreProveedor = "";

  const snapshot = await getDocs(collection(db, "proveedores"));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.ruc === ruc) nombreProveedor = data.nombre;
  });

  const datos = {
    ruc: ruc,
    proveedor: nombreProveedor || "No registrado",
    fecha: e.target.fecha.value,
    monto: e.target.monto.value
  };

  agregarRegistro("facturas", datos, "tablaFacturas");
  e.target.reset();
  nombreProveedorP.textContent = "";
});

// Servicios
document.getElementById("formServicio").addEventListener("submit", e => {
  e.preventDefault();
  const datos = {
    nombre: e.target.nombre.value,
    descripcion: e.target.descripcion.value,
    precio: e.target.precio.value
  };
  agregarRegistro("servicios", datos, "tablaServicios");
  e.target.reset();
});

// Ventas
document.getElementById("formVenta").addEventListener("submit", e => {
  e.preventDefault();
  const datos = {
    cliente: e.target.cliente.value,
    producto: e.target.producto.value,
    total: e.target.total.value
  };
  agregarRegistro("ventas", datos, "tablaVentas");
  e.target.reset();
});

// Gastos
document.getElementById("formGasto").addEventListener("submit", e => {
  e.preventDefault();
  const datos = {
    categoria: e.target.categoria.value,
    descripcion: e.target.descripcion.value,
    monto: e.target.monto.value,
    fecha: e.target.fecha.value
  };
  agregarRegistro("gastos", datos, "tablaGastos");
  e.target.reset();
});

// ==========================
// 📌 LOGOUT
// ==========================
document.getElementById("btnLogout").addEventListener("click", async () => {
  if (confirm("¿Deseas cerrar sesión?")) {
    await signOut(auth);
    window.location.href = "index.html";
  }
});

// ==========================
// 📌 FUNCION PARA MOSTRAR SECCIONES
// ==========================
function mostrarSeccion(id) {
  document.querySelectorAll(".seccion").forEach(sec => sec.classList.add("oculto"));
  document.getElementById(id).classList.remove("oculto");
}

window.mostrarSeccion = mostrarSeccion; // Exponer a global



