import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ======================= NAVEGACIÓN =======================
const botones = document.querySelectorAll(".menu-btn");
const secciones = document.querySelectorAll(".seccion");

botones.forEach((btn) => {
  btn.addEventListener("click", () => {
    botones.forEach((b) => b.classList.remove("activo"));
    btn.classList.add("activo");
    secciones.forEach((sec) => {
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
  const telefono = document.getElementById("telefonoProveedor").value.trim();

  await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion, telefono });
  proveedorForm.reset();
});

onSnapshot(collection(db, "proveedores"), (snapshot) => {
  tablaProveedores.innerHTML = "";
  const proveedorSelect = document.getElementById("proveedorFactura");
  proveedorSelect.innerHTML = '<option value="">Seleccione proveedor</option>';

  snapshot.forEach((docu) => {
    const p = docu.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.ruc}</td>
      <td>${p.nombre}</td>
      <td>${p.direccion}</td>
      <td>${p.telefono || "-"}</td>
      <td>
        <button class="btn-delete" data-id="${docu.id}" data-tipo="proveedores">🗑️</button>
        <button class="btn-edit" data-id="${docu.id}" data-tipo="proveedores">✏️</button>
      </td>
    `;
    tablaProveedores.appendChild(fila);

    const option = document.createElement("option");
    option.value = p.nombre;
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
  const materialP = document.getElementById("materialP").value.trim();
  const maquinaria = document.getElementById("maquinaria").value.trim();
  const productoOf = document.getElementById("productoOf").value.trim();
  const insumosExtra = document.getElementById("insumosExtra").value.trim();

  await addDoc(collection(db, "productos"), {
    nombre,
    unidad,
    materialP,
    maquinaria,
    productoOf,
    insumosExtra,
  });
  productoForm.reset();
});

onSnapshot(collection(db, "productos"), (snapshot) => {
  tablaProductos.innerHTML = "";
  const productoSelect = document.getElementById("productoFactura");
  productoSelect.innerHTML = '<option value="">Seleccione producto</option>';

  snapshot.forEach((docu) => {
    const p = docu.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.unidad}</td>
      <td>${p.materialP || "-"}</td>
      <td>${p.maquinaria || "-"}</td>
      <td>${p.productoOf || "-"}</td>
      <td>${p.insumosExtra || "-"}</td>
      <td>
        <button class="btn-delete" data-id="${docu.id}" data-tipo="productos">🗑️</button>
        <button class="btn-edit" data-id="${docu.id}" data-tipo="productos">✏️</button>
      </td>
    `;
    tablaProductos.appendChild(fila);

    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = p.nombre;
    productoSelect.appendChild(option);
  });
});

// ======================= FACTURAS =======================
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");

let facturasGuardadas = [];

facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const numero = document.getElementById("numeroFactura").value.trim();
  const fecha = document.getElementById("fechaEmisionFactura").value;
  const proveedor = document.getElementById("proveedorFactura").value;
  const producto = document.getElementById("productoFactura").value;
  const monto = document.getElementById("montoFactura").value.trim();
  const moneda = document.getElementById("monedaFactura").value;
  const tipo = document.getElementById("tipoFactura").value;

  if (!proveedor || !producto) {
    alert("Debe seleccionar un proveedor y un producto.");
    return;
  }

  await addDoc(collection(db, "facturas"), {
    numero,
    fecha,
    proveedor,
    producto,
    monto,
    moneda,
    tipo,
  });
  facturaForm.reset();
});

onSnapshot(collection(db, "facturas"), (snapshot) => {
  facturasGuardadas = [];
  snapshot.forEach((docu) => {
    facturasGuardadas.push({ id: docu.id, ...docu.data() });
  });
  mostrarFacturas(facturasGuardadas);
});

function mostrarFacturas(facturas) {
  tablaFacturas.innerHTML = "";
  facturas.forEach((f) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td contenteditable="true" class="edit-factura" data-campo="numero" data-id="${f.id}">${f.numero}</td>
      <td>${f.proveedor}</td>
      <td>${f.producto}</td>
      <td contenteditable="true" class="edit-factura" data-campo="monto" data-id="${f.id}">${f.monto}</td>
      <td contenteditable="true" class="edit-factura" data-campo="moneda" data-id="${f.id}">${f.moneda}</td>
      <td contenteditable="true" class="edit-factura" data-campo="tipo" data-id="${f.id}">${f.tipo}</td>
      <td contenteditable="true" class="edit-factura" data-campo="fecha" data-id="${f.id}">${f.fecha}</td>
      <td>
        <button class="btn-delete" data-id="${f.id}" data-tipo="facturas">🗑️</button>
      </td>
    `;
    tablaFacturas.appendChild(fila);
  });
}

// ======================= EDITAR FACTURA EN LÍNEA =======================
document.addEventListener("blur", async (e) => {
  if (e.target.classList.contains("edit-factura")) {
    const id = e.target.dataset.id;
    const campo = e.target.dataset.campo;
    const valor = e.target.textContent.trim();
    await updateDoc(doc(db, "facturas", id), { [campo]: valor });
  }
}, true);

// ======================= BUSCADOR =======================
const buscador = document.getElementById("buscadorFactura");

buscador.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const valor = buscador.value.trim().toLowerCase();
    const filtradas = facturasGuardadas.filter(
      (f) =>
        f.producto.toLowerCase().includes(valor) ||
        f.proveedor.toLowerCase().includes(valor)
    );
    mostrarFacturas(filtradas);
  }
});

buscador.addEventListener("input", () => {
  if (buscador.value.trim() === "") mostrarFacturas(facturasGuardadas);
});

// ======================= ELIMINAR =======================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-delete")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    if (confirm("¿Desea eliminar este registro?")) {
      await deleteDoc(doc(db, tipo, id));
    }
  }
});



