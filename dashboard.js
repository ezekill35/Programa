import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
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

// ======================= VALIDACIONES INPUTS =======================
const rucProveedorInput = document.getElementById('rucProveedor');
const cantidadProductoInput = document.getElementById('cantidadProducto');
const valorUnitarioProductoInput = document.getElementById('valorUnitarioProducto');
const montoFacturaInput = document.getElementById('montoFactura');

// Solo números para RUC (max 11)
rucProveedorInput.addEventListener('input', e => {
  e.target.value = e.target.value.replace(/\D/g,'').slice(0,11);
});

// Solo números para Cantidad (enteros)
cantidadProductoInput.addEventListener('input', e => {
  e.target.value = e.target.value.replace(/\D/g,'');
});

// Solo números decimales para valor unitario y monto
[valorUnitarioProductoInput, montoFacturaInput].forEach(input=>{
  input.addEventListener('input', e => {
    let val = e.target.value.replace(/[^0-9.]/g,'');
    const parts = val.split('.');
    if(parts.length>2) val = parts[0]+'.'+parts.slice(1).join('');
    e.target.value = val;
  });
});

// ======================= PROVEEDORES =======================
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");

proveedorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if(rucProveedorInput.value.length !== 11){
    alert('RUC debe tener 11 dígitos');
    rucProveedorInput.focus();
    return;
  }
  const ruc = rucProveedorInput.value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();

  await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion });
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
      <td><button class="btn-delete" data-id="${docu.id}" data-tipo="proveedores">🗑️</button></td>
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
  const cantidad = document.getElementById("cantidadProducto").value.trim();
  const unidad = document.getElementById("unidadProducto").value.trim();
  const valor = document.getElementById("valorUnitarioProducto").value.trim();

  await addDoc(collection(db, "productos"), { nombre, cantidad, unidad, valor });
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
      <td>${p.cantidad}</td>
      <td>${p.unidad}</td>
      <td>${p.valor}</td>
      <td><button class="btn-delete" data-id="${docu.id}" data-tipo="productos">🗑️</button></td>
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
  const monto = document.getElementById("montoFactura").value;
  const moneda = document.getElementById("monedaFactura").value;
  const tipo = document.getElementById("tipoFactura").value;

  if (!proveedor || !producto) {
    alert("Debe seleccionar un proveedor y un producto.");
    return;
  }

  await addDoc(collection(db, "facturas"), { numero, fecha, proveedor, producto, monto, moneda, tipo });
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

function mostrarFacturas(facturas){
  tablaFacturas.innerHTML = "";
  facturas.forEach(f => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${f.numero}</td>
      <td class="ver-proveedor" data-nombre="${f.proveedor}" style="cursor:pointer;color:#007bff">${f.proveedor}</td>
      <td class="ver-producto" data-nombre="${f.producto}" style="cursor:pointer;color:#007bff">${f.producto}</td>
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
buscador.addEventListener("keypress", e => {
  if(e.key === "Enter"){
    const valor = buscador.value.trim().toLowerCase();
    const filtradas = facturasGuardadas.filter(f => f.producto.toLowerCase().includes(valor));
    mostrarFacturas(filtradas);
  }
});

buscador.addEventListener("input", () => {
  if(buscador.value.trim() === "") mostrarFacturas(facturasGuardadas);
});

document.getElementById('btnRefresh').addEventListener('click', () => {
  buscador.value = '';
  buscador.dispatchEvent(new Event('input', { bubbles: true }));
});

// ======================= ELIMINAR REGISTRO =======================
document.addEventListener("click", async (e) => {
  if(e.target.classList.contains("btn-delete")){
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    if(confirm("¿Desea eliminar este registro?")) await deleteDoc(doc(db, tipo, id));
  }

  if(e.target.classList.contains("ver-proveedor")){
    const nombre = e.target.dataset.nombre;
    if(confirm(`¿Deseas ver los datos de ${nombre}?`)) mostrarModalDatos("proveedores","nombre",nombre);
  }

  if(e.target.classList.contains("ver-producto")){
    const nombre = e.target.dataset.nombre;
    if(confirm(`¿Deseas ver los datos de ${nombre}?`)) mostrarModalDatos("productos","nombre",nombre);
  }
});

// ======================= MODAL DETALLE =======================
async function mostrarModalDatos(coleccion, campo, valor){
  const modal = document.getElementById("modalDetalle");
  const modalContenido = document.getElementById("modalContenido");
  modalContenido.innerHTML = "<p>Cargando datos...</p>";

  onSnapshot(collection(db, coleccion), snap => {
    snap.forEach(docu => {
      const data = docu.data();
      if(data[campo] === valor){
        modalContenido.innerHTML = `
          <h3>${coleccion === "proveedores" ? "Proveedor" : "Producto"}: ${data.nombre}</h3>
          <p><strong>RUC:</strong> ${data.ruc || "-"}</p>
          <p><strong>Dirección:</strong> ${data.direccion || "-"}</p>
          <p><strong>Cantidad:</strong> ${data.cantidad || "-"}</p>
          <p><strong>Unidad:</strong> ${data.unidad || "-"}</p>
          <p><strong>Valor:</strong> ${data.valor || "-"}</p>
        `;
      }
    });
  });

  modal.style.display = "flex";
}

document.getElementById("cerrarModal").addEventListener("click", () => {
  document.getElementById("modalDetalle").style.display = "none";
});



