import {
  db,
  auth
} from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import {
  signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ======================= NAVEGACIÓN LATERAL =======================
const botonesNav = document.querySelectorAll(".nav button");
const secciones = document.querySelectorAll(".seccion");

botonesNav.forEach(btn => {
  btn.addEventListener("click", () => {
    botonesNav.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    secciones.forEach(sec => {
      sec.classList.remove("activa");
      if (sec.id === btn.dataset.target) sec.classList.add("activa");
    });
  });
});

// ======================= CERRAR SESIÓN =======================
document.getElementById("logout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ======================= PROVEEDORES =======================
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");
let idProveedorEditando = null;

proveedorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();

  if (idProveedorEditando) {
    await updateDoc(doc(db, "proveedores", idProveedorEditando), {
      ruc,
      nombre,
      direccion
    });
    idProveedorEditando = null;
  } else {
    await addDoc(collection(db, "proveedores"), {
      ruc,
      nombre,
      direccion
    });
  }
  proveedorForm.reset();
});

// Cargar en tiempo real proveedores
onSnapshot(collection(db, "proveedores"), (snapshot) => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach(docu => {
    const p = docu.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.ruc}</td>
      <td>${p.nombre}</td>
      <td>${p.direccion}</td>
      <td>
        <button class="btn-edit" data-id="${docu.id}" data-tipo="proveedor">✏️</button>
        <button class="btn-delete" data-id="${docu.id}" data-tipo="proveedor">🗑️</button>
      </td>
    `;
    tablaProveedores.appendChild(fila);
  });
  actualizarSelectProveedores();
});

// ======================= PRODUCTOS =======================
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");
let idProductoEditando = null;

productoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const cantidad = document.getElementById("cantidadProducto").value.trim();
  const unidad = document.getElementById("unidadProducto").value.trim();
  const valor = document.getElementById("valorUnitarioProducto").value.trim();

  if (idProductoEditando) {
    await updateDoc(doc(db, "productos", idProductoEditando), {
      nombre,
      cantidad,
      unidad,
      valor
    });
    idProductoEditando = null;
  } else {
    await addDoc(collection(db, "productos"), {
      nombre,
      cantidad,
      unidad,
      valor
    });
  }
  productoForm.reset();
});

onSnapshot(collection(db, "productos"), (snapshot) => {
  tablaProductos.innerHTML = "";
  snapshot.forEach(docu => {
    const p = docu.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.cantidad}</td>
      <td>${p.unidad}</td>
      <td>${p.valor}</td>
      <td>
        <button class="btn-edit" data-id="${docu.id}" data-tipo="producto">✏️</button>
        <button class="btn-delete" data-id="${docu.id}" data-tipo="producto">🗑️</button>
      </td>
    `;
    tablaProductos.appendChild(fila);
  });
  actualizarSelectProductos();
});

// ======================= FACTURAS =======================
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");

facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const numero = document.getElementById("numeroFactura").value.trim();
  const fecha = document.getElementById("fechaEmisionFactura").value;
  const proveedor = document.getElementById("proveedorFactura").value;
  const producto = document.getElementById("productoFactura").value;
  const monto = document.getElementById("montoFactura").value;
  const moneda = document.getElementById("monedaFactura").value;
  const tipo = document.getElementById("tipoFactura").value;

  await addDoc(collection(db, "facturas"), {
    numero,
    fecha,
    proveedor,
    producto,
    monto,
    moneda,
    tipo
  });
  facturaForm.reset();
});

onSnapshot(collection(db, "facturas"), (snapshot) => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(docu => {
    const f = docu.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${f.numero}</td>
      <td>${f.proveedor}</td>
      <td>${f.producto}</td>
      <td>${f.moneda}${f.monto}</td>
      <td>${f.tipo}</td>
      <td>${f.fecha}</td>
      <td><button class="btn-delete" data-id="${docu.id}" data-tipo="factura">🗑️</button></td>
    `;
    tablaFacturas.appendChild(fila);
  });
});

// ======================= MODAL DETALLE =======================
const modal = document.getElementById("detalleModal");
const tituloModal = document.getElementById("tituloModal");
const contenidoModal = document.getElementById("contenidoModal");
const cerrarModal = document.getElementById("cerrarModal");
cerrarModal.addEventListener("click", () => modal.style.display = "none");

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-edit")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    editarRegistro(id, tipo);
  }
  if (e.target.classList.contains("btn-delete")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    eliminarRegistro(id, tipo);
  }
});

async function editarRegistro(id, tipo) {
  const docRef = doc(db, tipo + "s", id);
  const snap = await getDocs(collection(db, tipo + "s"));
  snap.forEach(d => {
    if (d.id === id) {
      const data = d.data();
      modal.style.display = "flex";
      tituloModal.textContent = `Editar ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
      contenidoModal.innerHTML = `
        ${Object.keys(data).map(key => `
          <div class="mb-2">
            <label>${key}</label>
            <input id="edit-${key}" type="text" value="${data[key]}" class="form-control">
          </div>
        `).join("")}
        <button id="guardarCambios" class="btn-primary mt-3">Guardar Cambios</button>
      `;
      document.getElementById("guardarCambios").addEventListener("click", async () => {
        const nuevosDatos = {};
        Object.keys(data).forEach(k => {
          nuevosDatos[k] = document.getElementById(`edit-${k}`).value;
        });
        await updateDoc(docRef, nuevosDatos);
        modal.style.display = "none";
      });
    }
  });
}

async function eliminarRegistro(id, tipo) {
  if (confirm("¿Seguro de eliminar este registro?")) {
    await deleteDoc(doc(db, tipo + "s", id));
  }
}

// ======================= ACTUALIZAR SELECTS =======================
async function actualizarSelectProveedores() {
  const proveedorSelect = document.getElementById("proveedorFactura");
  proveedorSelect.innerHTML = "";
  const snapshot = await getDocs(collection(db, "proveedores"));
  snapshot.forEach(d => {
    const p = d.data();
    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = p.nombre;
    proveedorSelect.appendChild(option);
  });
}

async function actualizarSelectProductos() {
  const productoSelect = document.getElementById("productoFactura");
  productoSelect.innerHTML = "";
  const snapshot = await getDocs(collection(db, "productos"));
  snapshot.forEach(d => {
    const p = d.data();
    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = p.nombre;
    productoSelect.appendChild(option);
  });
}






