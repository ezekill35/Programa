// =============================
// 🔐 Verificar sesión activa
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("user");
  if (!user) {
    window.location.href = "index.html";
  }
});

// =============================
// 📦 Referencias del DOM
// =============================
const logoutBtn = document.getElementById("logoutBtn");
const menuItems = document.querySelectorAll(".menu-item");
const sectionTitle = document.getElementById("section-title");
const sectionContent = document.getElementById("section-content");
const searchInput = document.getElementById("searchInput");

// Datos simulados (puedes conectar a Firebase después)
let facturas = [];
let proveedores = [];
let productos = [];

// =============================
// 🚪 Cerrar sesión
// =============================
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "index.html";
});

// =============================
// 📋 Función para cambiar secciones
// =============================
menuItems.forEach(item => {
  item.addEventListener("click", () => {
    const section = item.dataset.section;
    sectionTitle.textContent = section.charAt(0).toUpperCase() + section.slice(1);
    mostrarSeccion(section);
  });
});

// =============================
// 🔎 Buscador global
// =============================
searchInput.addEventListener("input", e => {
  const query = e.target.value.toLowerCase();
  mostrarResultados(query);
});

function mostrarResultados(query) {
  let resultados = facturas.filter(f =>
    f.numero.toLowerCase().includes(query) ||
    f.proveedor.toLowerCase().includes(query) ||
    f.producto.toLowerCase().includes(query)
  );

  sectionTitle.textContent = "Resultados de búsqueda";
  sectionContent.innerHTML = `
    <h3>Facturas encontradas</h3>
    <ul>
      ${resultados
        .map(
          f => `
          <li>
            <strong>N°:</strong> ${f.numero} |
            <strong>Proveedor:</strong> ${f.proveedor} |
            <strong>Producto:</strong> ${f.producto} |
            <strong>Monto:</strong> ${f.monto} ${f.moneda}
            <button class="btn btn-warning btn-sm" onclick="editarFactura('${f.numero}')">Editar</button>
          </li>
        `
        )
        .join("")}
    </ul>
  `;
}

// =============================
// 🧾 Mostrar secciones dinámicas
// =============================
function mostrarSeccion(seccion) {
  switch (seccion) {
    case "factura":
      sectionContent.innerHTML = `
        <h3>Registrar Factura</h3>
        <form id="facturaForm">
          <input type="text" id="numeroFactura" placeholder="Número de Factura" required><br>
          <input type="text" id="proveedorFactura" placeholder="Proveedor" required><br>
          <input type="text" id="productoFactura" placeholder="Producto" required><br>
          <div style="display:flex; gap:8px;">
            <select id="monedaFactura">
              <option value="PEN">Soles (PEN)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
            <input type="number" id="montoFactura" placeholder="Monto" step="0.01" required>
          </div><br>
          <button type="submit">Guardar Factura</button>
        </form>
      `;

      document
        .getElementById("facturaForm")
        .addEventListener("submit", e => {
          e.preventDefault();
          const numero = document.getElementById("numeroFactura").value;
          const proveedor = document.getElementById("proveedorFactura").value;
          const producto = document.getElementById("productoFactura").value;
          const monto = document.getElementById("montoFactura").value;
          const moneda = document.getElementById("monedaFactura").value;

          facturas.push({ numero, proveedor, producto, monto, moneda });
          alert("Factura registrada correctamente");
          e.target.reset();
        });
      break;

    case "proveedor":
      sectionContent.innerHTML = `
        <h3>Registrar Proveedor</h3>
        <form id="proveedorForm">
          <input type="text" id="nombreProveedor" placeholder="Nombre del Proveedor" required><br>
          <input type="text" id="rucProveedor" placeholder="RUC (solo números)" required pattern="\\d*"><br>
          <input type="text" id="telefonoProveedor" placeholder="Teléfono (solo números)" pattern="\\d*"><br>
          <button type="submit">Guardar Proveedor</button>
        </form>
      `;

      document
        .getElementById("proveedorForm")
        .addEventListener("submit", e => {
          e.preventDefault();
          const nombre = document.getElementById("nombreProveedor").value;
          const ruc = document.getElementById("rucProveedor").value;
          const telefono = document.getElementById("telefonoProveedor").value;

          proveedores.push({ nombre, ruc, telefono });
          alert("Proveedor registrado correctamente");
          e.target.reset();
        });
      break;

    case "producto":
      sectionContent.innerHTML = `
        <h3>Registrar Producto</h3>
        <form id="productoForm">
          <input type="text" id="nombreProducto" placeholder="Nombre del Producto" required><br>
          <textarea id="descripcionProducto" placeholder="Descripción"></textarea><br>
          <input type="number" id="cantidadProducto" placeholder="Cantidad" required><br>
          <input type="text" id="unidadProducto" placeholder="Unidad de Medida" required><br>
          <input type="number" id="valorProducto" placeholder="Valor Unitario" step="0.01" required><br>
          <button type="submit">Guardar Producto</button>
        </form>
      `;

      document
        .getElementById("productoForm")
        .addEventListener("submit", e => {
          e.preventDefault();
          const nombre = document.getElementById("nombreProducto").value;
          const descripcion = document.getElementById("descripcionProducto").value;
          const cantidad = document.getElementById("cantidadProducto").value;
          const unidad = document.getElementById("unidadProducto").value;
          const valor = document.getElementById("valorProducto").value;

          productos.push({ nombre, descripcion, cantidad, unidad, valor });
          alert("Producto registrado correctamente");
          e.target.reset();
        });
      break;

    case "reporte":
      sectionContent.innerHTML = `
        <h3>📊 Generar Reporte</h3>
        <button onclick="generarReporte()">Generar Reporte de Facturas</button>
        <div id="reporteResultados"></div>
      `;
      break;

    default:
      sectionContent.innerHTML = `<p>Selecciona una opción del menú</p>`;
  }
}

// =============================
// 🧾 Editar factura desde búsqueda
// =============================
function editarFactura(numeroFactura) {
  const factura = facturas.find(f => f.numero === numeroFactura);
  if (!factura) return alert("Factura no encontrada");

  sectionTitle.textContent = "Editar Factura";
  sectionContent.innerHTML = `
    <h3>Editando Factura ${factura.numero}</h3>
    <form id="editarFacturaForm">
      <input type="text" id="editProveedor" value="${factura.proveedor}" required><br>
      <input type="text" id="editProducto" value="${factura.producto}" required><br>
      <div style="display:flex; gap:8px;">
        <select id="editMoneda">
          <option value="PEN" ${factura.moneda === "PEN" ? "selected" : ""}>Soles (PEN)</option>
          <option value="USD" ${factura.moneda === "USD" ? "selected" : ""}>Dólares (USD)</option>
        </select>
        <input type="number" id="editMonto" value="${factura.monto}" step="0.01" required>
      </div><br>
      <button type="submit">Guardar Cambios</button>
    </form>
  `;

  document
    .getElementById("editarFacturaForm")
    .addEventListener("submit", e => {
      e.preventDefault();
      factura.proveedor = document.getElementById("editProveedor").value;
      factura.producto = document.getElementById("editProducto").value;
      factura.monto = document.getElementById("editMonto").value;
      factura.moneda = document.getElementById("editMoneda").value;
      alert("Factura actualizada correctamente");
      mostrarResultados("");
    });
}

// =============================
// 📊 Generar Reporte
// =============================
function generarReporte() {
  const reporteDiv = document.getElementById("reporteResultados");
  if (facturas.length === 0) {
    reporteDiv.innerHTML = `<p>No hay facturas registradas.</p>`;
    return;
  }

  let total = facturas.reduce(
    (sum, f) => sum + parseFloat(f.monto),
    0
  );

  reporteDiv.innerHTML = `
    <h4>Resumen de Facturas</h4>
    <p>Total de facturas: ${facturas.length}</p>
    <p>Monto total (Soles): S/. ${total.toFixed(2)}</p>
    <ul>
      ${facturas
        .map(
          f => `<li>${f.numero} - ${f.proveedor} - ${f.producto} - ${f.monto} ${f.moneda}</li>`
        )
        .join("")}
    </ul>
  `;
}
