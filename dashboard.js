import { auth } from "./firebase.js";
import { 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Referencias DOM
const menuItems = document.querySelectorAll(".menu-item");
const sectionTitle = document.getElementById("section-title");
const sectionContent = document.getElementById("section-content");

// Cambiar de sección
menuItems.forEach(item => {
  item.addEventListener("click", () => {
    // Quitar active de todos
    menuItems.forEach(i => i.classList.remove("active"));
    // Poner active al actual
    item.classList.add("active");

    const section = item.getAttribute("data-section");
    if (section) {
      sectionTitle.textContent = item.textContent;
      renderSection(section);
    }

    // Logout
    if (item.classList.contains("logout")) {
      signOut(auth).then(() => {
        alert("Sesión cerrada ✅");
        window.location.href = "index.html";
      });
    }
  });
});

// Render dinámico
function renderSection(section) {
  switch (section) {
    case "productos":
      sectionContent.innerHTML = `
        <h3>Gestión de Productos</h3>
        <p>Aquí podrás registrar y ver productos.</p>
        <form id="form-producto">
          <input type="text" placeholder="Código / SKU" required>
          <input type="text" placeholder="Nombre" required>
          <input type="text" placeholder="Marca">
          <input type="number" placeholder="Precio S/" required>
          <input type="number" placeholder="Stock Inicial" required>
          <input type="text" placeholder="Categoría">
          <button class="btn">Agregar Producto</button>
        </form>
      `;
      break;

    case "proveedores":
      sectionContent.innerHTML = `
        <h3>Gestión de Proveedores</h3>
        <form>
          <input type="text" placeholder="RUC" required>
          <input type="text" placeholder="Nombre" required>
          <input type="text" placeholder="Dirección">
          <input type="text" placeholder="Teléfono">
          <button class="btn">Registrar Proveedor</button>
        </form>
      `;
      break;

    case "facturas":
      sectionContent.innerHTML = `
        <h3>Facturas</h3>
        <form>
          <input type="text" placeholder="RUC Proveedor" required>
          <select>
            <option>Seleccionar Proveedor</option>
            <option>Proveedor 1</option>
            <option>Proveedor 2</option>
          </select>
          <input type="text" placeholder="Número de Factura" required>
          <input type="date" required>
          <button class="btn">Registrar Factura</button>
        </form>
      `;
      break;

    case "ventas":
      sectionContent.innerHTML = `
        <h3>Gestión de Ventas</h3>
        <p>Aquí registrarás ventas a clientes.</p>
      `;
      break;

    case "gastos":
      sectionContent.innerHTML = `
        <h3>Gestión de Gastos</h3>
        <p>Registra los gastos de tu negocio aquí.</p>
      `;
      break;

    default:
      sectionContent.innerHTML = "<p>Selecciona una opción del menú.</p>";
  }
}


