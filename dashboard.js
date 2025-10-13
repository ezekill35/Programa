import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
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

proveedorForm.addEventListener("submit", async e => {
  e.preventDefault();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();
  const telefono = document.getElementById("telefonoProveedor").value.trim();
  await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion, telefono });
  proveedorForm.reset();
});

let proveedoresGuardados = [];
onSnapshot(collection(db, "proveedores"), snapshot => {
  proveedoresGuardados = [];
  tablaProveedores.innerHTML = "";
  snapshot.forEach(docu => {
    const p = docu.data();
    proveedoresGuardados.push({ id: docu.id, ...p });
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.ruc}</td>
      <td>${p.nombre}</td>
      <td>${p.direccion}</td>
      <td>${p.telefono || "-"}</td>
      <td>
        <button class="btn btn-edit" data-id="${docu.id}" data-tipo="proveedores">✏️ Editar</button>
        <button class="btn btn-delete" data-id="${docu.id}" data-tipo="proveedores">🗑️ Eliminar</button>
      </td>`;
    tablaProveedores.appendChild(fila);
  });
});

// ======================= PRODUCTOS =======================
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");

productoForm.addEventListener("submit", async e => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const unidad = document.getElementById("unidadProducto").value.trim();
  const materialP = document.getElementById("materialP").value.trim();
  const maquinaria = document.getElementById("maquinaria").value.trim();
  const productoOF = document.getElementById("productoOF").value.trim();
  const insumosExtra = document.getElementById("insumosExtra").value.trim();
  const descripcion = document.getElementById("descripcionProducto").value.trim();

  await addDoc(collection(db, "productos"), { nombre, unidad, materialP, maquinaria, productoOF, insumosExtra, descripcion });
  productoForm.reset();
});

let productosGuardados = [];
onSnapshot(collection(db, "productos"), snapshot => {
  productosGuardados = [];
  tablaProductos.innerHTML = "";
  const productoSelect = document.getElementById("productoFactura");
  productoSelect.innerHTML = '<option value="">Seleccione producto</option>';

  snapshot.forEach(docu => {
    const p = docu.data();
    productosGuardados.push({ id: docu.id, ...p });

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.unidad}</td>
      <td>${p.materialP}</td>
      <td>${p.maquinaria}</td>
      <td>${p.productoOF}</td>
      <td>${p.insumosExtra}</td>
      <td>${p.descripcion || "-"}</td>
      <td>
        <button class="btn btn-edit" data-id="${docu.id}" data-tipo="productos">✏️ Editar</button>
        <button class="btn btn-delete" data-id="${docu.id}" data-tipo="productos">🗑️ Eliminar</button>
      </td>`;
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

facturaForm.addEventListener("submit", async e => {
  e.preventDefault();
  const idFactura = document.getElementById("idFactura").value.trim();
  const numero = document.getElementById("numeroFactura").value.trim();
  const fecha = document.getElementById("fechaEmisionFactura").value;
  const proveedor = document.getElementById("proveedorFactura").value;
  const producto = document.getElementById("productoFactura").value;
  const monto = document.getElementById("montoFactura").value;
  const moneda = document.getElementById("monedaFactura").value;
  const tipo = document.getElementById("tipoFactura").value;

  if (!proveedor || !producto) {
    alert("Debe seleccionar un proveedor y un producto.");
    return;
  }

  await addDoc(collection(db, "facturas"), { idFactura, numero, fecha, proveedor, producto, monto, moneda, tipo });
  facturaForm.reset();
});

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
      <td>${f.idFactura || "-"}</td>
      <td>${f.numero}</td>
      <td class="ver-proveedor" data-nombre="${f.proveedor}" style="cursor:pointer;color:#007bff">${f.proveedor}</td>
      <td class="ver-producto" data-nombre="${f.producto}" style="cursor:pointer;color:#007bff">${f.producto}</td>
      <td>${f.moneda}${f.monto}</td>
      <td>${f.tipo}</td>
      <td>${f.fecha}</td>
      <td>
        <button class="btn btn-edit" data-id="${f.id}" data-tipo="facturas">✏️ Editar</button>
        <button class="btn btn-delete" data-id="${f.id}" data-tipo="facturas">🗑️ Eliminar</button>
      </td>`;
    tablaFacturas.appendChild(fila);
  });
}

// ======================= BUSCADOR =======================
const buscador = document.getElementById("buscadorFactura");
buscador.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    const valor = buscador.value.trim().toLowerCase();
    const filtradas = facturasGuardadas.filter(f => f.producto.toLowerCase().includes(valor));
    mostrarResultadosBuscador(filtradas);
  }
});
document.getElementById("btnRefresh").addEventListener("click", () => {
  mostrarFacturas(facturasGuardadas);
  const divExistente = document.querySelector(".resultados-buscador");
  if (divExistente) divExistente.remove();
  buscador.value = "";
});

function mostrarResultadosBuscador(facturas) {
  let divExistente = document.querySelector(".resultados-buscador");
  if (divExistente) divExistente.remove();

  const resultadosDiv = document.createElement("div");
  resultadosDiv.className = "card resultados-buscador";
  resultadosDiv.innerHTML = `<h3>Resultados de búsqueda</h3>`;

  if (facturas.length === 0) {
    resultadosDiv.innerHTML += "<p>No se encontraron facturas.</p>";
  } else {
    const tabla = document.createElement("table");
    const thead = document.createElement("thead");
    thead.innerHTML = `<tr><th>ID</th><th>Número</th><th>Proveedor</th><th>Producto</th><th>Monto</th><th>Tipo</th><th>Fecha</th></tr>`;
    tabla.appendChild(thead);
    const tbody = document.createElement("tbody");
    facturas.forEach(f => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${f.idFactura || "-"}</td>
        <td>${f.numero}</td>
        <td>${f.proveedor}</td>
        <td>${f.producto}</td>
        <td>${f.moneda}${f.monto}</td>
        <td>${f.tipo}</td>
        <td>${f.fecha}</td>`;
      tbody.appendChild(tr);
    });
    tabla.appendChild(tbody);
    resultadosDiv.appendChild(tabla);
  }

  document.querySelector(".main").prepend(resultadosDiv);
}

// ======================= ACCIONES =======================
document.addEventListener("click", async e => {
  const id = e.target.dataset.id;
  const tipo = e.target.dataset.tipo;

  // Eliminar
  if (e.target.classList.contains("btn-delete")) {
    if (confirm("¿Desea eliminar este registro?")) {
      await deleteDoc(doc(db, tipo, id));
    }
  }

  // Editar
  if (e.target.classList.contains("btn-edit")) {
    if (tipo === "proveedores") editarFila(e.target, proveedoresGuardados, tipo);
    if (tipo === "productos") editarFila(e.target, productosGuardados, tipo);
    if (tipo === "facturas") editarFila(e.target, facturasGuardadas, tipo);
  }

  // Ver detalle
  if (e.target.classList.contains("ver-proveedor")) {
    mostrarModalDatos("proveedores", e.target.dataset.nombre);
  }
  if (e.target.classList.contains("ver-producto")) {
    mostrarModalDatos("productos", e.target.dataset.nombre);
  }
});

// ======================= FUNCIONES EDITAR =======================
async function editarFila(btn, datos, coleccion) {
  const fila = btn.closest("tr");
  const registro = datos.find(d => d.id === btn.dataset.id);

  if (btn.classList.contains("btn-save")) return; // evita duplicar

  // Reemplazar celdas por inputs
  if (coleccion === "proveedores") {
    fila.cells[0].innerHTML = `<input value="${registro.ruc}">`;
    fila.cells[1].innerHTML = `<input value="${registro.nombre}">`;
    fila.cells[2].innerHTML = `<input value="${registro.direccion}">`;
    fila.cells[3].innerHTML = `<input value="${registro.telefono || ''}">`;
  }
  if (coleccion === "productos") {
    fila.cells[0].innerHTML = `<input value="${registro.nombre}">`;
    fila.cells[1].innerHTML = `<input value="${registro.unidad}">`;
    fila.cells[2].innerHTML = `<input value="${registro.materialP}">`;
    fila.cells[3].innerHTML = `<input value="${registro.maquinaria}">`;
    fila.cells[4].innerHTML = `<input value="${registro.productoOF}">`;
    fila.cells[5].innerHTML = `<input value="${registro.insumosExtra}">`;
    fila.cells[6].innerHTML = `<input value="${registro.descripcion || ''}">`;
  }
  if (coleccion === "facturas") {
    fila.cells[0].innerHTML = `<input value="${registro.idFactura || ''}">`;
    fila.cells[1].innerHTML = `<input value="${registro.numero}">`;
    fila.cells[2].innerHTML = `<input value="${registro.proveedor}">`;
    fila.cells[3].innerHTML = `<input value="${registro.producto}">`;
    fila.cells[4].innerHTML = `<input type="number" step="0.01" value="${registro.monto}">`;
    fila.cells[5].innerHTML = `<select><option value="FACTURA" ${registro.tipo==="FACTURA"?"selected":""}>FACTURA</option><option value="BOLETA DE VENTA" ${registro.tipo==="BOLETA DE VENTA"?"selected":""}>BOLETA DE VENTA</option></select>`;
    fila.cells[6].innerHTML = `<input type="date" value="${registro.fecha}">`;
  }

  // Cambiar botones
  btn.textContent = "💾 Guardar";
  btn.classList.remove("btn-edit");
  btn.classList.add("btn-save");

  btn.onclick = async () => {
    const inputs = fila.querySelectorAll("input, select");
    const datosActualizados = {};

    if (coleccion === "proveedores") {
      datosActualizados.ruc = inputs[0].value.trim();
      datosActualizados.nombre = inputs[1].value.trim();
      datosActualizados.direccion = inputs[2].value.trim();
      datosActualizados.telefono = inputs[3].value.trim();
    }
    if (coleccion === "productos") {
      datosActualizados.nombre = inputs[0].value.trim();
      datosActualizados.unidad = inputs[1].value.trim();
      datosActualizados.materialP = inputs[2].value.trim();
      datosActualizados.maquinaria = inputs[3].value.trim();
      datosActualizados.productoOF = inputs[4].value.trim();
      datosActualizados.insumosExtra = inputs[5].value.trim();
      datosActualizados.descripcion = inputs[6].value.trim();
    }
    if (coleccion === "facturas") {
      datosActualizados.idFactura = inputs[0].value.trim();
      datosActualizados.numero = inputs[1].value.trim();
      datosActualizados.proveedor = inputs[2].value.trim();
      datosActualizados.producto = inputs[3].value.trim();
      datosActualizados.monto = parseFloat(inputs[4].value);
      datosActualizados.tipo = inputs[5].value;
      datosActualizados.fecha = inputs[6].value;
    }

    await updateDoc(doc(db, coleccion, registro.id), datosActualizados);
    btn.textContent = "✏️ Editar";
    btn.classList.remove("btn-save");
    btn.classList.add("btn-edit");
    mostrarFacturas(facturasGuardadas);
  };
}

// ======================= MODAL =======================
async function mostrarModalDatos(coleccion, valor) {
  const modal = document.getElementById("modalDetalle");
  const modalContenido = document.getElementById("modalContenido");
  modalContenido.innerHTML = "Cargando...";

  const datos = coleccion === "proveedores" ? proveedoresGuardados : productosGuardados;
  const registro = datos.find(r => r.nombre === valor);
  if (!registro) return;

  let html = `<h3>${coleccion === "proveedores" ? "Proveedor" : "Producto"}: ${registro.nombre}</h3>`;
  for (const key in registro) {
    if (key !== "id" && key !== "nombre") {
      html += `<p><strong>${key}:</strong> ${registro[key] || "-"}</p>`;
    }
  }
  modalContenido.innerHTML = html;
  modal.classList.add("show");
}

document.getElementById("cerrarModal").addEventListener("click", () => {
  document.getElementById("modalDetalle").classList.remove("show");
});

