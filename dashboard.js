// ==========================
//  DASHBOARD DISCOVERY PETS
// ==========================

import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Referencias a colecciones
const refProductos = collection(db, "productos");
const refProveedores = collection(db, "proveedores");
const refFacturas = collection(db, "facturas");

// Elementos del DOM
const facturasList = document.getElementById("facturasList");
const countFacturas = document.getElementById("countFacturas");
const countProveedores = document.getElementById("countProveedores");
const countProductos = document.getElementById("countProductos");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const modalFactura = document.getElementById("modalFactura");
const modalFacturaBody = document.getElementById("modalFacturaBody");
const modalExtra = document.getElementById("modalExtra");
const modalExtraBody = document.getElementById("modalExtraBody");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");

// ==========================
// Cerrar Sesión
// ==========================
btnCerrarSesion.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ==========================
// Contadores en Dashboard
// ==========================
async function actualizarContadores() {
  const factSnap = await getDocs(refFacturas);
  const provSnap = await getDocs(refProveedores);
  const prodSnap = await getDocs(refProductos);

  countFacturas.textContent = factSnap.size;
  countProveedores.textContent = provSnap.size;
  countProductos.textContent = prodSnap.size;
}
actualizarContadores();

// ==========================
// Listado en tiempo real de facturas
// ==========================
onSnapshot(refFacturas, (snapshot) => {
  facturasList.innerHTML = "";
  snapshot.forEach((docu) => {
    const f = docu.data();
    const li = document.createElement("li");
    li.className =
      "p-3 bg-white rounded-xl shadow-sm mb-2 border border-gray-100 hover:shadow-md cursor-pointer transition";
    li.innerHTML = `
      <div class="flex justify-between items-center">
        <div>
          <strong class="text-sky-600">Factura ${f.codigo}</strong><br>
          <small>${f.fecha}</small><br>
          <span class="text-gray-700">Proveedor: <b>${f.proveedor}</b></span><br>
          <span class="text-gray-700">Producto: <b>${f.producto}</b></span><br>
          <span class="text-gray-700">Monto: S/. ${f.monto.toFixed(2)}</span>
        </div>
        <button class="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition deleteBtn">🗑️</button>
      </div>
    `;

    li.querySelector(".deleteBtn").addEventListener("click", async (e) => {
      e.stopPropagation();
      if (confirm("¿Eliminar esta factura?")) {
        await deleteDoc(doc(db, "facturas", docu.id));
      }
    });

    li.addEventListener("click", () => mostrarModalFactura(f));
    facturasList.appendChild(li);
  });
});

// ==========================
// Buscador de producto -> facturas relacionadas
// ==========================
searchInput.addEventListener("input", async (e) => {
  const texto = e.target.value.trim().toLowerCase();
  searchResults.innerHTML = "";
  if (texto === "") return;

  const q = query(refFacturas, where("producto", ">=", texto));
  const snapshot = await getDocs(refFacturas);

  snapshot.forEach((docu) => {
    const f = docu.data();
    if (f.producto.toLowerCase().includes(texto)) {
      const div = document.createElement("div");
      div.className =
        "p-3 bg-white border rounded-xl mb-2 shadow-sm hover:bg-sky-50 cursor-pointer transition";
      div.innerHTML = `
        <strong class="text-sky-600">Factura ${f.codigo}</strong> - 
        <small>${f.fecha}</small><br>
        <span>Proveedor: <b>${f.proveedor}</b></span> |
        <span>Producto: <b>${f.producto}</b></span>
      `;
      div.addEventListener("click", () => mostrarModalFactura(f));
      searchResults.appendChild(div);
    }
  });
});

// ==========================
// Mostrar modal de factura
// ==========================
function mostrarModalFactura(f) {
  modalFacturaBody.innerHTML = `
    <h3 class="text-lg font-bold mb-2 text-sky-600">Factura ${f.codigo}</h3>
    <p><b>Fecha:</b> ${f.fecha}</p>
    <p><b>Proveedor:</b> <span class="text-blue-600 underline cursor-pointer" id="verProveedor">${f.proveedor}</span></p>
    <p><b>Producto:</b> <span class="text-emerald-600 underline cursor-pointer" id="verProducto">${f.producto}</span></p>
    <p><b>Monto:</b> S/. ${f.monto.toFixed(2)}</p>
    <p><b>Tipo:</b> ${f.tipo}</p>
  `;
  modalFactura.showModal();

  document.getElementById("verProveedor").addEventListener("click", () => {
    if (confirm("¿Deseas ver la información del proveedor?")) {
      mostrarInfoExtra("proveedor", f.proveedor);
    }
  });
  document.getElementById("verProducto").addEventListener("click", () => {
    if (confirm("¿Deseas ver la información del producto?")) {
      mostrarInfoExtra("producto", f.producto);
    }
  });
}

// ==========================
// Mostrar modal extra (proveedor o producto)
// ==========================
async function mostrarInfoExtra(tipo, nombre) {
  let ref = tipo === "proveedor" ? refProveedores : refProductos;
  const snapshot = await getDocs(ref);
  let data = null;
  snapshot.forEach((docu) => {
    const d = docu.data();
    if (d.nombre.toLowerCase() === nombre.toLowerCase()) data = d;
  });

  if (!data) {
    alert(`No se encontró el ${tipo}`);
    return;
  }

  modalExtraBody.innerHTML = `
    <h3 class="text-lg font-bold text-sky-600 mb-2">${tipo === "proveedor" ? "Proveedor" : "Producto"}: ${data.nombre}</h3>
    ${tipo === "proveedor"
      ? `<p><b>RUC:</b> ${data.ruc}</p><p><b>Dirección:</b> ${data.direccion}</p><p><b>Teléfono:</b> ${data.telefono}</p>`
      : `<p><b>Precio:</b> S/. ${data.precio.toFixed(2)}</p><p><b>Categoría:</b> ${data.categoria}</p><p><b>Stock:</b> ${data.stock}</p>`
    }
  `;
  modalExtra.showModal();
}
