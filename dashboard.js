import { db, auth } from "./firebase.js";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
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
const proveedorSelect = document.getElementById("proveedorFactura");

proveedorForm.addEventListener("submit", async e => {
  e.preventDefault();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const telefono = document.getElementById("telefonoProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();
  await addDoc(collection(db, "proveedores"), { ruc, nombre, telefono, direccion });
  proveedorForm.reset();
});

onSnapshot(collection(db, "proveedores"), snapshot => {
  tablaProveedores.innerHTML = "";
  proveedorSelect.innerHTML = '<option value="">Seleccione proveedor</option>';
  snapshot.forEach(docu => {
    const p = docu.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.ruc}</td>
      <td>${p.nombre}</td>
      <td>${p.telefono || '-'}</td>
      <td>${p.direccion || '-'}</td>
      <td>
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
const productoSelect = document.getElementById("productoFactura");

productoForm.addEventListener("submit", async e => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const cantidad = document.getElementById("cantidadProducto").value.trim();
  const precio = document.getElementById("precioProducto").value.trim();
  const descripcion = document.getElementById("descripcionProducto").value.trim();
  await addDoc(collection(db, "productos"), { nombre, cantidad, precio, descripcion });
  productoForm.reset();
});

onSnapshot(collection(db, "productos"), snapshot => {
  tablaProductos.innerHTML = "";
  productoSelect.innerHTML = '<option value="">Seleccione producto</option>';
  snapshot.forEach(docu => {
    const p = docu.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.cantidad}</td>
      <td>${p.precio}</td>
      <td>${p.descripcion || '-'}</td>
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

facturaForm.addEventListener("submit", async e => {
  e.preventDefault();
  const proveedor = document.getElementById("proveedorFactura").value;
  const producto = document.getElementById("productoFactura").value;
  const cantidad = document.getElementById("cantidadFactura").value.trim();
  const fecha = document.getElementById("fechaFactura").value;
  if (!proveedor || !producto) return alert("Seleccione proveedor y producto");
  await addDoc(collection(db, "facturas"), { proveedor, producto, cantidad, fecha });
  facturaForm.reset();
});

onSnapshot(collection(db, "facturas"), snapshot => {
  facturasGuardadas = [];
  snapshot.forEach(docu => facturasGuardadas.push({ id: docu.id, ...docu.data() }));
  mostrarFacturas(facturasGuardadas);
});

function mostrarFacturas(facturas) {
  tablaFacturas.innerHTML = "";
  facturas.forEach(f => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${f.proveedor}</td>
      <td>${f.producto}</td>
      <td>${f.cantidad}</td>
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
document.getElementById("btnRefresh").addEventListener("click", ()=>{
  buscador.value = '';
  mostrarFacturas(facturasGuardadas);
});

// ======================= ELIMINAR =======================
document.addEventListener("click", async e => {
  if(e.target.classList.contains("btn-delete")){
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    if(confirm("Desea eliminar este registro?")) await deleteDoc(doc(db,tipo,id));
  }
});

// ======================= MODAL DETALLE =======================
async function mostrarModalDatos(coleccion, campo, valor){
  const modal = document.getElementById("modalDetalle");
  const modalContenido = document.getElementById("modalContenido");
  modalContenido.innerHTML = "<p>Cargando...</p>";
  onSnapshot(collection(db, coleccion), snap => {
    snap.forEach(docu=>{
      const data = docu.data();
      if(data[campo]===valor){
        modalContenido.innerHTML=`
          <h3>${coleccion==="proveedores"?"Proveedor":"Producto"}: ${data.nombre}</h3>
          <p><strong>RUC:</strong> ${data.ruc||'-'}</p>
          <p><strong>Teléfono:</strong> ${data.telefono||'-'}</p>
          <p><strong>Dirección:</strong> ${data.direccion||'-'}</p>
          <p><strong>Cantidad:</strong> ${data.cantidad||'-'}</p>
          <p><strong>Precio:</strong> ${data.precio||'-'}</p>
          <p><strong>Descripción:</strong> ${data.descripcion||'-'}</p>
        `;
      }
    });
  });
  modal.style.display="flex";
}

document.getElementById("cerrarModal").addEventListener("click", ()=>{
  document.getElementById("modalDetalle").style.display="none";
});



