import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ======================= NAVEGACIÓN =======================
const botones = document.querySelectorAll(".menu-btn");
const secciones = document.querySelectorAll(".seccion");
botones.forEach((btn) => {
  btn.addEventListener("click", () => {
    botones.forEach((b) => b.classList.remove("activo"));
    btn.classList.add("activo");
    secciones.forEach((sec) => sec.classList.remove("activa"));
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

proveedorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();
  const telefono = document.getElementById("telefonoProveedor").value.trim();

  await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion, telefono });
  proveedorForm.reset();
});

// Actualizar tabla proveedores en tiempo real
onSnapshot(collection(db, "proveedores"), (snapshot) => {
  tablaProveedores.innerHTML = "";
  const proveedorSelect = document.getElementById("proveedorFactura");
  proveedorSelect.innerHTML = '<option value="">Seleccione proveedor</option>';

  snapshot.forEach((docu) => {
    const p = docu.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td><input type="text" value="${p.ruc}" disabled></td>
      <td><input type="text" value="${p.nombre}" disabled></td>
      <td><input type="text" value="${p.direccion}" disabled></td>
      <td><input type="text" value="${p.telefono}" disabled></td>
      <td>
        <button class="btn-edit" data-id="${docu.id}" data-tipo="proveedores">✏️</button>
        <button class="btn-save" data-id="${docu.id}" data-tipo="proveedores" style="display:none">💾</button>
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

// Actualizar tabla productos en tiempo real
onSnapshot(collection(db, "productos"), (snapshot) => {
  tablaProductos.innerHTML = "";
  const productoSelect = document.getElementById("productoFactura");
  productoSelect.innerHTML = '<option value="">Seleccione producto</option>';

  snapshot.forEach((docu) => {
    const p = docu.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td><input type="text" value="${p.nombre}" disabled></td>
      <td><input type="text" value="${p.unidad}" disabled></td>
      <td><input type="text" value="${p.material}" disabled></td>
      <td><input type="text" value="${p.maquinaria}" disabled></td>
      <td><input type="text" value="${p.productoFinal}" disabled></td>
      <td><input type="text" value="${p.insumosExtra}" disabled></td>
      <td>
        <button class="btn-edit" data-id="${docu.id}" data-tipo="productos">✏️</button>
        <button class="btn-save" data-id="${docu.id}" data-tipo="productos" style="display:none">💾</button>
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

facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const idFactura = document.getElementById("idFactura").value.trim();
  const numero = document.getElementById("numeroFactura").value.trim();
  const fecha = document.getElementById("fechaEmisionFactura").value;
  const proveedor = document.getElementById("proveedorFactura").value;
  const producto = document.getElementById("productoFactura").value;
  const monto = document.getElementById("montoFactura").value.trim();
  const moneda = document.getElementById("monedaFactura").value;
  const tipo = document.getElementById("tipoFactura").value;

  if (!proveedor || !producto) {
    alert("Seleccione proveedor y producto.");
    return;
  }

  await addDoc(collection(db, "facturas"), { idFactura, numero, fecha, proveedor, producto, monto, moneda, tipo });
  facturaForm.reset();
});

// Mostrar facturas en tiempo real
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
      <td><input type="text" value="${f.idFactura}" disabled></td>
      <td><input type="text" value="${f.numero}" disabled></td>
      <td class="ver-proveedor" data-nombre="${f.proveedor}" style="cursor:pointer;color:#007bff">${f.proveedor}</td>
      <td class="ver-producto" data-nombre="${f.producto}" style="cursor:pointer;color:#007bff">${f.producto}</td>
      <td><input type="text" value="${f.monto}" disabled></td>
      <td>${f.moneda}</td>
      <td><input type="text" value="${f.tipo}" disabled></td>
      <td><input type="date" value="${f.fecha}" disabled></td>
      <td>
        <button class="btn-edit" data-id="${f.id}" data-tipo="facturas">✏️</button>
        <button class="btn-save" data-id="${f.id}" data-tipo="facturas" style="display:none">💾</button>
        <button class="btn-delete" data-id="${f.id}" data-tipo="facturas">🗑️</button>
      </td>
    `;
    tablaFacturas.appendChild(fila);
  });
}

// ======================= BUSCADOR =======================
const buscador = document.getElementById("buscadorFactura");
const btnRefresh = document.getElementById("btnRefresh");

buscador.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const valor = buscador.value.trim().toLowerCase();
    const filtradas = facturasGuardadas.filter(f => f.producto.toLowerCase().includes(valor));
    mostrarFacturas(filtradas);
  }
});

buscador.addEventListener("input", () => {
  if (!buscador.value.trim()) mostrarFacturas(facturasGuardadas);
});

btnRefresh.addEventListener("click", () => {
  buscador.value = "";
  mostrarFacturas(facturasGuardadas);
});

// ======================= BOTONES EDITAR / GUARDAR / ELIMINAR =======================
document.addEventListener("click", async (e) => {
  const target = e.target;
  const id = target.dataset.id;
  const tipo = target.dataset.tipo;

  // EDITAR
  if (target.classList.contains("btn-edit")) {
    const fila = target.closest("tr");
    fila.querySelectorAll("input").forEach(inp => inp.disabled = false);
    target.style.display = "none";
    fila.querySelector(".btn-save").style.display = "inline-block";
  }

  // GUARDAR
  if (target.classList.contains("btn-save")) {
    const fila = target.closest("tr");
    const inputs = fila.querySelectorAll("input");
    const datos = {};
    if(tipo === "proveedores") datos.ruc = inputs[0].value.trim(), datos.nombre = inputs[1].value.trim(), datos.direccion = inputs[2].value.trim(), datos.telefono = inputs[3].value.trim();
    if(tipo === "productos") datos.nombre = inputs[0].value.trim(), datos.unidad = inputs[1].value.trim(), datos.material = inputs[2].value.trim(), datos.maquinaria = inputs[3].value.trim(), datos.productoFinal = inputs[4].value.trim(), datos.insumosExtra = inputs[5].value.trim();
    if(tipo === "facturas") datos.idFactura = inputs[0].value.trim(), datos.numero = inputs[1].value.trim(), datos.monto = inputs[4].value.trim(), datos.tipo = inputs[6].value.trim(), datos.fecha = inputs[7].value;

    await updateDoc(doc(db, tipo, id), datos);
    inputs.forEach(inp => inp.disabled = true);
    target.style.display = "none";
    fila.querySelector(".btn-edit").style.display = "inline-block";
  }

  // ELIMINAR
  if (target.classList.contains("btn-delete")) {
    if(confirm("¿Desea eliminar este registro?")) await deleteDoc(doc(db, tipo, id));
  }

  // Ver proveedor/producto en modal
  if(target.classList.contains("ver-proveedor")) mostrarModalDatos("proveedores", target.dataset.nombre);
  if(target.classList.contains("ver-producto")) mostrarModalDatos("productos", target.dataset.nombre);
});

// ======================= MODAL DETALLE =======================
function mostrarModalDatos(coleccion, valor) {
  const modal = document.createElement("div");
  modal.classList.add("modal","show");
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-card">
      <button class="close-x">✖</button>
      <div id="modalContenido"><p>Cargando datos...</p></div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector(".close-x").addEventListener("click", () => modal.remove());

  onSnapshot(collection(db, coleccion), (snapshot) => {
    const data = snapshot.docs.map(d => d.data()).find(d => d.nombre === valor);
    if(!data) return;
    const html = Object.entries(data).map(([k,v]) => `<p><strong>${k}:</strong> ${v || '-'}</p>`).join('');
    modal.querySelector("#modalContenido").innerHTML = `<h3>${coleccion === "proveedores" ? "Proveedor" : "Producto"}: ${valor}</h3>` + html;
  });
}




