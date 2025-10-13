import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ======================= NAVEGACIÓN =======================
const botones = document.querySelectorAll(".menu-btn");
const secciones = document.querySelectorAll(".seccion");

botones.forEach(btn => {
  btn.addEventListener("click", () => {
    botones.forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");

    secciones.forEach(sec => {
      sec.classList.remove("activa");
      if (sec.id === btn.dataset.target) sec.classList.add("activa");
    });
  });
});

// ======================= CERRAR SESIÓN =======================
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ======================= PROVEEDORES =======================
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");

proveedorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();
  const telefono = document.getElementById("telefonoProveedor")?.value.trim() || '';

  await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion, telefono });
  proveedorForm.reset();
});

onSnapshot(collection(db, "proveedores"), snapshot => {
  tablaProveedores.innerHTML = "";
  const proveedorSelect = document.getElementById("proveedorFactura");
  proveedorSelect.innerHTML = '<option value="">Seleccione proveedor</option>';

  snapshot.forEach(docu => {
    const p = docu.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.ruc}</td>
      <td>${p.nombre}</td>
      <td>${p.direccion}</td>
      <td>${p.telefono || '-'}</td>
      <td><button class="btn-delete" data-id="${docu.id}" data-tipo="proveedores">🗑️</button></td>
    `;
    tablaProveedores.appendChild(fila);

    const option = document.createElement("option");
    option.value = docu.id; // guardamos ID para referencia
    option.textContent = p.nombre;
    proveedorSelect.appendChild(option);
  });
});

// ======================= PRODUCTOS =======================
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");

productoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const unidad = document.getElementById("unidadProducto").value.trim();
  const mateP = document.getElementById("mateP")?.value.trim() || '';
  const maquinaria = document.getElementById("maquinaria")?.value.trim() || '';
  const productoOf = document.getElementById("productoOf")?.value.trim() || '';
  const insumosExtra = document.getElementById("insumosExtra")?.value.trim() || '';
  const valor = document.getElementById("valorUnitarioProducto").value.trim();

  await addDoc(collection(db, "productos"), {
    nombre, unidad, mateP, maquinaria, productoOf, insumosExtra, valor
  });
  productoForm.reset();
});

onSnapshot(collection(db, "productos"), snapshot => {
  tablaProductos.innerHTML = "";
  const productoSelect = document.getElementById("productoFactura");
  productoSelect.innerHTML = '<option value="">Seleccione producto</option>';

  snapshot.forEach(docu => {
    const p = docu.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.unidad}</td>
      <td>${p.mateP || '-'}</td>
      <td>${p.maquinaria || '-'}</td>
      <td>${p.productoOf || '-'}</td>
      <td>${p.insumosExtra || '-'}</td>
      <td>${p.valor}</td>
      <td><button class="btn-delete" data-id="${docu.id}" data-tipo="productos">🗑️</button></td>
    `;
    tablaProductos.appendChild(fila);

    const option = document.createElement("option");
    option.value = docu.id; // guardamos ID
    option.textContent = p.nombre;
    productoSelect.appendChild(option);
  });
});

// ======================= FACTURAS =======================
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");
let contadorFactura = 1; // serie para ID

facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const proveedorId = document.getElementById("proveedorFactura").value;
  const productoId = document.getElementById("productoFactura").value;
  const fecha = document.getElementById("fechaEmisionFactura").value;
  const monto = document.getElementById("montoFactura").value;
  const moneda = document.getElementById("monedaFactura").value;
  const tipo = document.getElementById("tipoFactura").value;

  if (!proveedorId || !productoId) {
    alert("Seleccione proveedor y producto");
    return;
  }

  const proveedorSnap = await getDoc(doc(db, "proveedores", proveedorId));
  const proveedor = proveedorSnap.data()?.nombre || '';
  const productoSnap = await getDoc(doc(db, "productos", productoId));
  const producto = productoSnap.data()?.nombre || '';

  const serie = String(contadorFactura).padStart(3, '0');
  const numero = String(Math.floor(Math.random() * 999999)).padStart(6, '0');
  const idFactura = `F${serie}-${numero}`;
  contadorFactura++;

  const facturaData = {
    idFactura,
    proveedor,
    producto,
    fecha,
    monto,
    moneda,
    tipo,
    proveedorId,
    productoId
  };

  await addDoc(collection(db, "facturas"), facturaData);
  facturaForm.reset();
});

// ======================= MOSTRAR FACTURAS =======================
let facturasGuardadas = [];
onSnapshot(collection(db, "facturas"), snapshot => {
  facturasGuardadas = [];
  snapshot.forEach(docu => {
    facturasGuardadas.push({ id: docu.id, ...docu.data() });
  });
  mostrarFacturas(facturasGuardadas);
});

function mostrarFacturas(facturas) {
  tablaFacturas.innerHTML = "";
  facturas.forEach(f => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${f.idFactura}</td>
      <td class="ver-proveedor" data-id="${f.proveedorId}" style="cursor:pointer;color:#007bff">${f.proveedor}</td>
      <td class="ver-producto" data-id="${f.productoId}" style="cursor:pointer;color:#007bff">${f.producto}</td>
      <td>${f.moneda}${f.monto}</td>
      <td>${f.tipo}</td>
      <td>${f.fecha}</td>
      <td><button class="btn-delete" data-id="${f.id}" data-tipo="facturas">🗑️</button></td>
    `;
    tablaFacturas.appendChild(fila);
  });
}

// ======================= BUSCADOR =======================
const buscador = document.getElementById("buscadorFactura");

buscador.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const valor = buscador.value.trim().toLowerCase();
    const filtradas = facturasGuardadas.filter(f =>
      f.producto.toLowerCase().includes(valor)
    );
    mostrarFacturas(filtradas);
  }
});

buscador.addEventListener("input", () => {
  if (buscador.value.trim() === "") mostrarFacturas(facturasGuardadas);
});

// ======================= ELIMINAR REGISTRO =======================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-delete")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    if (confirm("¿Desea eliminar este registro?")) {
      await deleteDoc(doc(db, tipo, id));
    }
  }

  // Ver datos del proveedor o producto
  if (e.target.classList.contains("ver-proveedor")) {
    const idProv = e.target.dataset.id;
    if (confirm(`¿Deseas ver los datos del proveedor?`)) {
      mostrarModalDatos("proveedores", "id", idProv);
    }
  }

  if (e.target.classList.contains("ver-producto")) {
    const idProd = e.target.dataset.id;
    if (confirm(`¿Deseas ver los datos del producto?`)) {
      mostrarModalDatos("productos", "id", idProd);
    }
  }
});

// ======================= MODAL DETALLE =======================
async function mostrarModalDatos(coleccion, campo, valor) {
  const modal = document.getElementById("modalDetalle");
  const modalContenido = document.getElementById("modalContenido");
  modalContenido.innerHTML = "<p>Cargando datos...</p>";

  const snap = await getDoc(doc(db, coleccion, valor));
  const data = snap.data();
  if (!data) { modalContenido.innerHTML = "<p>No se encontraron datos.</p>"; return; }

  modalContenido.innerHTML = `
    <h3>${coleccion === "proveedores" ? "Proveedor" : "Producto"}: ${data.nombre}</h3>
    <p><strong>RUC:</strong> ${data.ruc || "-"}</p>
    <p><strong>Dirección:</strong> ${data.direccion || "-"}</p>
    <p><strong>Teléfono:</strong> ${data.telefono || "-"}</p>
    <p><strong>Unidad:</strong> ${data.unidad || "-"}</p>
    <p><strong>Mate P:</strong> ${data.mateP || "-"}</p>
    <p><strong>Maquinaria:</strong> ${data.maquinaria || "-"}</p>
    <p><strong>Producto Of.:</strong> ${data.productoOf || "-"}</p>
    <p><strong>Insumos extra:</strong> ${data.insumosExtra || "-"}</p>
  `;
  modal.style.display = "flex";
}

document.getElementById("cerrarModal").addEventListener("click", () => {
  document.getElementById("modalDetalle").style.display = "none";
});




