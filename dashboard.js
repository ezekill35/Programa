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
        <button class="btn btn-edit" data-id="${docu.id}" data-tipo="proveedores">✏️ Editar</button>
        <button class="btn btn-delete" data-id="${docu.id}" data-tipo="proveedores">🗑️ Eliminar</button>
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
  const material = document.getElementById("materialP").value.trim();
  const maquinaria = document.getElementById("maquinaria").value.trim();
  const productoFinal = document.getElementById("productoOf").value.trim();
  const insumosExtra = document.getElementById("insumosExtra").value.trim();

  await addDoc(collection(db, "productos"), { nombre, unidad, material, maquinaria, productoFinal, insumosExtra });
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
      <td>${p.material}</td>
      <td>${p.maquinaria}</td>
      <td>${p.productoFinal}</td>
      <td>${p.insumosExtra}</td>
      <td>
        <button class="btn btn-edit" data-id="${docu.id}" data-tipo="productos">✏️ Editar</button>
        <button class="btn btn-delete" data-id="${docu.id}" data-tipo="productos">🗑️ Eliminar</button>
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
  const idFactura = document.getElementById("idFactura").value.trim();
  const numero = document.getElementById("numeroFactura").value.trim();
  const fecha = document.getElementById("fechaEmisionFactura").value;
  const proveedor = document.getElementById("proveedorFactura").value;
  const producto = document.getElementById("productoFactura").value;
  const monto = document.getElementById("montoFactura").value;
  const moneda = document.getElementById("monedaFactura").value;
  const tipo = document.getElementById("tipoFactura").value;

  if (!proveedor || !producto) { alert("Debe seleccionar proveedor y producto."); return; }

  await addDoc(collection(db, "facturas"), { idFactura, numero, fecha, proveedor, producto, monto, moneda, tipo });
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
      <td>${f.idFactura}</td>
      <td>${f.numero}</td>
      <td class="ver-proveedor" data-nombre="${f.proveedor}" style="cursor:pointer;color:#007bff">${f.proveedor}</td>
      <td class="ver-producto" data-nombre="${f.producto}" style="cursor:pointer;color:#007bff">${f.producto}</td>
      <td>${f.moneda}${f.monto}</td>
      <td>${f.tipo}</td>
      <td>${f.fecha}</td>
      <td>
        <button class="btn btn-edit" data-id="${f.id}" data-tipo="facturas">✏️ Editar</button>
        <button class="btn btn-delete" data-id="${f.id}" data-tipo="facturas">🗑️ Eliminar</button>
      </td>
    `;
    tablaFacturas.appendChild(fila);
  });
}

// ======================= BUSCADOR INTELIGENTE =======================
const buscador = document.getElementById("buscadorFactura");
buscador.addEventListener("input", () => {
  const valor = buscador.value.trim().toLowerCase();
  if (!valor) { mostrarFacturas(facturasGuardadas); return; }
  const filtradas = facturasGuardadas.filter(f => f.producto.toLowerCase().includes(valor));
  mostrarFacturas(filtradas);
});

document.getElementById("btnRefresh").addEventListener("click", () => {
  buscador.value = "";
  mostrarFacturas(facturasGuardadas);
});

// ======================= ELIMINAR =======================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-delete")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    if (confirm("¿Desea eliminar este registro?")) await deleteDoc(doc(db, tipo, id));
  }

  if (e.target.classList.contains("ver-proveedor")) {
    const nombre = e.target.dataset.nombre;
    mostrarModalDatos("proveedores", "nombre", nombre);
  }
  if (e.target.classList.contains("ver-producto")) {
    const nombre = e.target.dataset.nombre;
    mostrarModalDatos("productos", "nombre", nombre);
  }

  // ======================= EDITAR =======================
  if (e.target.classList.contains("btn-edit")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    let collectionName = tipo;
    const dataRef = doc(db, collectionName, id);
    const fila = e.target.closest("tr");
    Array.from(fila.children).forEach(td => {
      td.contentEditable = true;
    });

    e.target.textContent = "💾 Guardar";
    e.target.classList.remove("btn-edit");
    e.target.classList.add("btn-save");
  }

  if (e.target.classList.contains("btn-save")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    const fila = e.target.closest("tr");
    const hijos = fila.children;
    let actualizar = {};

    if (tipo === "proveedores") actualizar = { ruc: hijos[0].textContent, nombre: hijos[1].textContent, direccion: hijos[2].textContent, telefono: hijos[3].textContent };
    if (tipo === "productos") actualizar = { nombre: hijos[0].textContent, unidad: hijos[1].textContent, material: hijos[2].textContent, maquinaria: hijos[3].textContent, productoFinal: hijos[4].textContent, insumosExtra: hijos[5].textContent };
    if (tipo === "facturas") actualizar = { idFactura: hijos[0].textContent, numero: hijos[1].textContent, proveedor: hijos[2].textContent, producto: hijos[3].textContent, monto: hijos[4].textContent.replace(/[S/$]/g,""), tipo: hijos[5].textContent, fecha: hijos[6].textContent };

    await updateDoc(doc(db, tipo, id), actualizar);

    // Restaurar botones y quitar editable
    Array.from(fila.children).forEach(td => td.contentEditable = false);
    e.target.textContent = "✏️ Editar";
    e.target.classList.remove("btn-save");
    e.target.classList.add("btn-edit");
  }
});

// ======================= MODAL =======================
const modal = document.getElementById("modalDetalle");
const modalContenido = document.getElementById("modalContenido");
document.getElementById("cerrarModal").addEventListener("click", () => modal.style.display = "none");

async function mostrarModalDatos(coleccion, campo, valor) {
  modal.style.display = "flex";
  modalContenido.innerHTML = "<p>Cargando...</p>";
  onSnapshot(collection(db, coleccion), (snap) => {
    snap.forEach(docu => {
      const data = docu.data();
      if (data[campo] === valor) {
        let html = `<h3>${coleccion} - ${valor}</h3>`;
        for (let key in data) { html += `<p><strong>${key}:</strong> ${data[key]}</p>`; }
        modalContenido.innerHTML = html;
      }
    });
  });
}





