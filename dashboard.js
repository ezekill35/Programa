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

botones.forEach(btn => {
  btn.addEventListener("click", () => {
    botones.forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    secciones.forEach(sec => sec.classList.remove("activa"));
    document.getElementById(btn.dataset.target).classList.add("activa");
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

proveedorForm.addEventListener("submit", async e => {
  e.preventDefault();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();
  const telefono = document.getElementById("telefonoProveedor").value.trim();
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
      <td>${p.telefono || "-"}</td>
      <td>
        <button class="btn-edit" data-id="${docu.id}" data-tipo="proveedores">✏️</button>
        <button class="btn-delete" data-id="${docu.id}" data-tipo="proveedores">🗑️</button>
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

productoForm.addEventListener("submit", async e => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const unidad = document.getElementById("unidadProducto").value.trim();
  const material = document.getElementById("materialP").value.trim();
  const maquinaria = document.getElementById("maquinaria").value.trim();
  const productoFinal = document.getElementById("productoOf").value.trim();
  const insumosExtra = document.getElementById("insumosExtra").value.trim();

  await addDoc(collection(db, "productos"), {
    nombre, unidad, material, maquinaria, productoFinal, insumosExtra
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
      <td>${p.material || "-"}</td>
      <td>${p.maquinaria || "-"}</td>
      <td>${p.productoFinal || "-"}</td>
      <td>${p.insumosExtra || "-"}</td>
      <td>
        <button class="btn-edit" data-id="${docu.id}" data-tipo="productos">✏️</button>
        <button class="btn-delete" data-id="${docu.id}" data-tipo="productos">🗑️</button>
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

facturaForm.addEventListener("submit", async e => {
  e.preventDefault();
  const numero = document.getElementById("numeroFactura").value.trim();
  const fecha = document.getElementById("fechaEmisionFactura").value;
  const proveedor = document.getElementById("proveedorFactura").value;
  const producto = document.getElementById("productoFactura").value;
  const monto = document.getElementById("montoFactura").value.trim();
  const moneda = document.getElementById("monedaFactura").value.trim();
  const tipo = document.getElementById("tipoFactura").value.trim();

  if (!proveedor || !producto) { alert("Debe seleccionar proveedor y producto."); return; }

  await addDoc(collection(db, "facturas"), { numero, fecha, proveedor, producto, monto, moneda, tipo });
  facturaForm.reset();
});

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
      <td>${f.id}</td>
      <td contenteditable="true" class="edit-numero">${f.numero}</td>
      <td class="ver-proveedor" data-nombre="${f.proveedor}" style="cursor:pointer;color:#007bff">${f.proveedor}</td>
      <td class="ver-producto" data-nombre="${f.producto}" style="cursor:pointer;color:#007bff">${f.producto}</td>
      <td contenteditable="true" class="edit-monto">${f.monto}</td>
      <td contenteditable="true" class="edit-moneda">${f.moneda}</td>
      <td contenteditable="true" class="edit-tipo">${f.tipo}</td>
      <td><input type="date" class="edit-fecha" value="${f.fecha}"></td>
      <td>
        <button class="btn-save" data-id="${f.id}">💾</button>
        <button class="btn-delete" data-id="${f.id}" data-tipo="facturas">🗑️</button>
      </td>
    `;
    tablaFacturas.appendChild(fila);
  });
}

// ======================= BUSCADOR =======================
const buscador = document.getElementById("buscadorFactura");
const btnRefresh = document.getElementById("btnRefresh");

buscador.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    const valor = buscador.value.trim().toLowerCase();
    const filtradas = facturasGuardadas.filter(f => f.producto.toLowerCase().includes(valor));
    mostrarFacturas(filtradas);
  }
});
btnRefresh.addEventListener("click", () => mostrarFacturas(facturasGuardadas));
buscador.addEventListener("input", () => { if (buscador.value.trim()==="") mostrarFacturas(facturasGuardadas); });

// ======================= ELIMINAR / EDITAR =======================
document.addEventListener("click", async e => {
  if (e.target.classList.contains("btn-delete")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    if (confirm("¿Desea eliminar este registro?")) await deleteDoc(doc(db, tipo, id));
  }

  if (e.target.classList.contains("btn-save")) {
    const fila = e.target.closest("tr");
    const id = e.target.dataset.id;
    const numero = fila.querySelector(".edit-numero").textContent.trim();
    const monto = fila.querySelector(".edit-monto").textContent.trim();
    const moneda = fila.querySelector(".edit-moneda").textContent.trim();
    const tipoFac = fila.querySelector(".edit-tipo").textContent.trim();
    const fecha = fila.querySelector(".edit-fecha").value;

    await updateDoc(doc(db, "facturas", id), { numero, monto, moneda, tipo: tipoFac, fecha });
    alert("Factura actualizada correctamente");
  }

  if (e.target.classList.contains("ver-proveedor")) {
    mostrarModalDatos("proveedores", "nombre", e.target.dataset.nombre);
  }

  if (e.target.classList.contains("ver-producto")) {
    mostrarModalDatos("productos", "nombre", e.target.dataset.nombre);
  }
});

// ======================= MODAL =======================
const modal = document.getElementById("modalDetalle");
const modalContenido = document.getElementById("modalContenido");
document.getElementById("cerrarModal").addEventListener("click", () => { modal.style.display="none"; });

async function mostrarModalDatos(coleccion, campo, valor) {
  modal.style.display = "flex";
  modalContenido.innerHTML = "<p>Cargando datos...</p>";

  onSnapshot(collection(db, coleccion), snap => {
    snap.forEach(docu => {
      const data = docu.data();
      if (data[campo] === valor) {
        if (coleccion === "proveedores") {
          modalContenido.innerHTML = `<h3>Proveedor: ${data.nombre}</h3>
            <p><strong>RUC:</strong> ${data.ruc}</p>
            <p><strong>Dirección:</strong> ${data.direccion}</p>
            <p><strong>Teléfono:</strong> ${data.telefono || "-"}</p>`;
        } else {
          modalContenido.innerHTML = `<h3>Producto: ${data.nombre}</h3>
            <p><strong>Unidad:</strong> ${data.unidad}</p>
            <p><strong>Material:</strong> ${data.material || "-"}</p>
            <p><strong>Maquinaria:</strong> ${data.maquinaria || "-"}</p>
            <p><strong>Producto final:</strong> ${data.productoFinal || "-"}</p>
            <p><strong>Insumos extra:</strong> ${data.insumosExtra || "-"}</p>`;
        }
      }
    });
  });
}




