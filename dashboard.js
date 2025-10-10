// ---------------------- Autenticación y Sesión ----------------------
document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("user");

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // Cerrar sesión
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "index.html";
    });
  }

  // Inicializar navegación
  setupNavigation();
  setupSearch();
  setupForms();
});

// ---------------------- Navegación entre secciones ----------------------
function setupNavigation() {
  const sections = document.querySelectorAll(".section");
  const navButtons = document.querySelectorAll(".nav-btn");

  // Mostrar solo la primera sección (Facturas)
  sections.forEach((s, i) => (s.style.display = i === 0 ? "block" : "none"));

  // Al hacer clic en un botón de navegación
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-section");
      sections.forEach((s) => {
        s.style.display = s.id === target ? "block" : "none";
      });
    });
  });
}

// ---------------------- Buscador Global ----------------------
function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();

    // Buscar en todas las tablas del dashboard
    const rows = document.querySelectorAll("table tbody tr");
    rows.forEach((row) => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(query) ? "" : "none";
    });
  });
}

// ---------------------- Formularios ----------------------
function setupForms() {
  setupFacturaForm();
  setupProveedorForm();
  setupProductoForm();
  setupGastoForm();
}

// FACTURAS
function setupFacturaForm() {
  const facturaForm = document.getElementById("facturaForm");
  if (!facturaForm) return;

  facturaForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const numero = document.getElementById("numeroFactura").value.trim();
    const proveedor = document.getElementById("proveedorFactura").value.trim();
    const producto = document.getElementById("productoFactura").value.trim();
    const monto = document.getElementById("montoFactura").value.trim();
    const tipoMoneda = document.getElementById("tipoMonedaFactura").value;
    const tipoFactura = document.getElementById("tipoFactura").value;

    if (!numero || !proveedor || !producto || !monto) {
      alert("Por favor completa todos los campos de la factura");
      return;
    }

    const tbody = document.querySelector("#tablaFacturas tbody");
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${numero}</td>
      <td>${proveedor}</td>
      <td>${producto}</td>
      <td>${tipoMoneda} ${parseFloat(monto).toFixed(2)}</td>
      <td>${tipoFactura}</td>
      <td>
        <button class="edit-btn">Editar</button>
      </td>
    `;

    tbody.appendChild(row);
    facturaForm.reset();
  });
}

// PROVEEDORES
function setupProveedorForm() {
  const proveedorForm = document.getElementById("proveedorForm");
  if (!proveedorForm) return;

  proveedorForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombreProveedor").value.trim();
    const ruc = document.getElementById("rucProveedor").value.trim();

    if (!nombre || !ruc) {
      alert("Completa los campos del proveedor");
      return;
    }

    if (!/^\d+$/.test(ruc)) {
      alert("El RUC debe contener solo números");
      return;
    }

    const tbody = document.querySelector("#tablaProveedores tbody");
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${nombre}</td>
      <td>${ruc}</td>
      <td><button class="edit-btn">Editar</button></td>
    `;

    tbody.appendChild(row);
    proveedorForm.reset();
  });
}

// PRODUCTOS
function setupProductoForm() {
  const productoForm = document.getElementById("productoForm");
  if (!productoForm) return;

  productoForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombreProducto").value.trim();
    const descripcion = document.getElementById("descripcionProducto").value.trim();
    const cantidad = document.getElementById("cantidadProducto").value.trim();
    const unidad = document.getElementById("unidadProducto").value.trim();
    const valor = document.getElementById("valorProducto").value.trim();

    if (!nombre || !cantidad || !valor) {
      alert("Completa todos los campos del producto");
      return;
    }

    const tbody = document.querySelector("#tablaProductos tbody");
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${nombre}</td>
      <td>${descripcion}</td>
      <td>${cantidad}</td>
      <td>${unidad}</td>
      <td>S/. ${parseFloat(valor).toFixed(2)}</td>
      <td><button class="edit-btn">Editar</button></td>
    `;

    tbody.appendChild(row);
    productoForm.reset();
  });
}

// GASTOS
function setupGastoForm() {
  const gastoForm = document.getElementById("gastoForm");
  if (!gastoForm) return;

  gastoForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const descripcion = document.getElementById("descripcionGasto").value.trim();
    const monto = document.getElementById("montoGasto").value.trim();
    const tipoMoneda = document.getElementById("tipoMonedaGasto").value;

    if (!descripcion || !monto) {
      alert("Completa los campos del gasto");
      return;
    }

    const tbody = document.querySelector("#tablaGastos tbody");
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${descripcion}</td>
      <td>${tipoMoneda} ${parseFloat(monto).toFixed(2)}</td>
      <td><button class="edit-btn">Editar</button></td>
    `;

    tbody.appendChild(row);
    gastoForm.reset();
  });
}



