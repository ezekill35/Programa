import { db, auth } from "./firebase.js";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const btnProveedores = document.getElementById("btnProveedores");
const btnFacturas = document.getElementById("btnFacturas");
const btnProductos = document.getElementById("btnProductos");
const btnReportes = document.getElementById("btnReportes");

const sections = {
  proveedores: document.getElementById("sectionProveedores"),
  facturas: document.getElementById("sectionFacturas"),
  productos: document.getElementById("sectionProductos"),
  reportes: document.getElementById("sectionReportes")
};

function mostrarSeccion(nombre) {
  Object.values(sections).forEach(sec => sec.classList.add("d-none"));
  sections[nombre].classList.remove("d-none");
}

// Mostrar la primera sección por defecto
mostrarSeccion("proveedores");

// Eventos de navegación
btnProveedores.addEventListener("click", () => mostrarSeccion("proveedores"));
btnFacturas.addEventListener("click", () => mostrarSeccion("facturas"));
btnProductos.addEventListener("click", () => mostrarSeccion("productos"));
btnReportes.addEventListener("click", () => mostrarSeccion("reportes"));

// 🔐 Cerrar sesión
document.getElementById("btnLogout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ✅ Guardar proveedores
const formProveedor = document.getElementById("formProveedor");
formProveedor.addEventListener("submit", async (e) => {
  e.preventDefault();
  await addDoc(collection(db, "proveedores"), {
    nombre: provNombre.value,
    ruc: provRuc.value,
    telefono: provTelefono.value
  });
  formProveedor.reset();
  cargarDatos();
});

// ✅ Guardar facturas
const formFactura = document.getElementById("formFactura");
formFactura.addEventListener("submit", async (e) => {
  e.preventDefault();
  await addDoc(collection(db, "facturas"), {
    numero: numFactura.value,
    tipo: tipoFactura.value,
    monto: montoFactura.value,
    moneda: monedaFactura.value,
    proveedor: provFactura.value,
    producto: prodFactura.value
  });
  formFactura.reset();
  cargarDatos();
});

// ✅ Guardar productos
const formProducto = document.getElementById("formProducto");
formProducto.addEventListener("submit", async (e) => {
  e.preventDefault();
  await addDoc(collection(db, "productos"), {
    nombre: prodNombre.value,
    descripcion: prodDesc.value,
    cantidad: prodCant.value,
    unidad: prodUnidad.value,
    valor: prodValor.value
  });
  formProducto.reset();
  cargarDatos();
});

// 🔍 Buscador unificado
const globalSearch = document.getElementById("globalSearch");
globalSearch.addEventListener("input", cargarDatos);

// 🧾 Cargar datos
async function cargarDatos() {
  const search = globalSearch.value.toLowerCase();

  const proveedoresSnap = await getDocs(collection(db, "proveedores"));
  const facturasSnap = await getDocs(collection(db, "facturas"));
  const productosSnap = await getDocs(collection(db, "productos"));

  const listaProv = document.getElementById("listaProveedores");
  const listaFact = document.getElementById("listaFacturas");
  const listaProd = document.getElementById("listaProductos");

  listaProv.innerHTML = "";
  listaFact.innerHTML = "";
  listaProd.innerHTML = "";

  proveedoresSnap.forEach(docu => {
    const data = docu.data();
    if (data.nombre.toLowerCase().includes(search) || data.ruc.includes(search))
      listaProv.innerHTML += `<li class="list-group-item bg-transparent text-white">${data.nombre} - ${data.ruc}</li>`;
  });

  facturasSnap.forEach(docu => {
    const data = docu.data();
    if (
      data.numero.toLowerCase().includes(search) ||
      data.proveedor.toLowerCase().includes(search) ||
      data.producto.toLowerCase().includes(search)
    )
      listaFact.innerHTML += `<li class="list-group-item bg-transparent text-white">${data.numero} - ${data.proveedor} - ${data.monto} ${data.moneda}</li>`;
  });

  productosSnap.forEach(docu => {
    const data = docu.data();
    if (data.nombre.toLowerCase().includes(search))
      listaProd.innerHTML += `<li class="list-group-item bg-transparent text-white">${data.nombre} (${data.cantidad} ${data.unidad})</li>`;
  });
}

cargarDatos();

// 🔒 Control de sesión
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
});


