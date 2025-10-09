// dashboard.js

// 🔹 Inicializar Firebase (ya configurado en firebase.js)
import { auth, db } from './firebase.js';
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// ✅ Controlar acceso al dashboard
let redirecting = false;

onAuthStateChanged(auth, (user) => {
  if (!user && !redirecting) {
    redirecting = true;
    window.location.href = "index.html";
  } else if (user) {
    console.log("Usuario autenticado:", user.email);
  }
});

// 🔹 Botón cerrar sesión
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.replace("index.html"); // ✅ Reemplaza en el historial
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  });
}

// 🔹 Cambiar entre secciones del menú
const menuItems = document.querySelectorAll(".menu-item");
const sections = document.querySelectorAll(".section");

menuItems.forEach(item => {
  item.addEventListener("click", () => {
    // Quitar la clase activa de todos
    menuItems.forEach(i => i.classList.remove("active"));
    sections.forEach(s => s.style.display = "none");

    // Activar el seleccionado
    item.classList.add("active");
    const target = item.getAttribute("data-target");
    document.getElementById(target).style.display = "block";
  });
});

// 🔹 Funcionalidad de buscador general
const buscador = document.getElementById("buscador");
const listaFacturas = document.getElementById("listaFacturas");

if (buscador) {
  buscador.addEventListener("input", async (e) => {
    const query = e.target.value.toLowerCase();
    listaFacturas.innerHTML = "";

    const q = await db.collection("facturas").get();
    q.forEach(doc => {
      const data = doc.data();
      if (
        data.proveedor?.toLowerCase().includes(query) ||
        data.producto?.toLowerCase().includes(query) ||
        data.numeroFactura?.toLowerCase().includes(query)
      ) {
        const item = document.createElement("div");
        item.classList.add("factura-item");
        item.innerHTML = `
          <strong>${data.numeroFactura}</strong> - 
          ${data.producto || "Sin producto"} (${data.proveedor})
          <button class="editarFactura" data-id="${doc.id}">✏️ Editar</button>
        `;
        listaFacturas.appendChild(item);
      }
    });
  });
}

// 🔹 Editar factura desde el buscador
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("editarFactura")) {
    const id = e.target.dataset.id;
    abrirVentanaEdicion(id);
  }
});

// 🔹 Ventana de edición emergente 3D
function abrirVentanaEdicion(id) {
  const overlay = document.createElement("div");
  overlay.className = "overlay-3d";
  overlay.innerHTML = `
    <div class="ventana-edicion">
      <h3>Editar Factura</h3>
      <form id="formEditar">
        <input type="text" id="editProducto" placeholder="Producto">
        <input type="text" id="editProveedor" placeholder="Proveedor">
        <input type="number" id="editMonto" placeholder="Monto">
        <button type="submit">Guardar</button>
        <button type="button" id="cerrarVentana">Cancelar</button>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("cerrarVentana").onclick = () => overlay.remove();

  document.getElementById("formEditar").onsubmit = async (e) => {
    e.preventDefault();
    const producto = document.getElementById("editProducto").value;
    const proveedor = document.getElementById("editProveedor").value;
    const monto = parseFloat(document.getElementById("editMonto").value);

    await db.collection("facturas").doc(id).update({
      producto, proveedor, monto
    });
    overlay.remove();
    alert("Factura actualizada correctamente ✅");
  };
}

