// ===============================
// DASHBOARD.JS - DISCOVERY PETS
// ===============================

// Esperar que el DOM cargue
document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // ELEMENTOS GLOBALES
  // ===============================
  const secciones = document.querySelectorAll(".seccion");
  const menuBtns = document.querySelectorAll(".menu-btn");
  const buscador = document.getElementById("buscadorGlobal");
  const logoutBtn = document.getElementById("logoutBtn");

  // ===============================
  // EVITAR RECARGA AUTOMÁTICA
  // ===============================
  document.querySelectorAll("form").forEach(form => {
    form.addEventListener("submit", (e) => e.preventDefault());
  });

  // ===============================
  // NAVEGACIÓN ENTRE SECCIONES
  // ===============================
  menuBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      secciones.forEach(sec => sec.style.display = "none");
      document.getElementById(target).style.display = "block";

      // Actualizar botón activo
      menuBtns.forEach(b => b.classList.remove("activo"));
      btn.classList.add("activo");
    });
  });

  // Mostrar la primera sección por defecto
  document.getElementById("facturas").style.display = "block";

  // ===============================
  // FUNCIÓN CERRAR SESIÓN
  // ===============================
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("usuarioActivo");
    window.location.href = "index.html";
  });

  // ===============================
  // BUSCADOR GLOBAL
  // ===============================
  buscador.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase();

    document.querySelectorAll("table tbody tr").forEach(row => {
      const contenido = row.innerText.toLowerCase();
      row.style.display = contenido.includes(texto) ? "" : "none";
    });
  });

  // ===============================
  // REGISTRO DE DATOS (EJEMPLO)
  // ===============================
  const facturaForm = document.getElementById("facturaForm");
  const facturaTabla = document.getElementById("tablaFacturas");

  facturaForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const numero = document.getElementById("numeroFactura").value;
    const proveedor = document.getElementById("proveedorFactura").value;
    const producto = document.getElementById("productoFactura").value;
    const monto = document.getElementById("montoFactura").value;
    const tipo = document.getElementById("tipoFactura").value;
    const moneda = document.getElementById("monedaFactura").value;

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${numero}</td>
      <td>${proveedor}</td>
      <td>${producto}</td>
      <td>${moneda} ${monto}</td>
      <td>${tipo}</td>
      <td>
        <button class="editar">✏️</button>
        <button class="eliminar">🗑️</button>
      </td>
    `;

    facturaTabla.appendChild(fila);
    facturaForm.reset();

    // Eliminar registro
    fila.querySelector(".eliminar").addEventListener("click", () => {
      fila.remove();
    });

    // Editar registro
    fila.querySelector(".editar").addEventListener("click", () => {
      document.getElementById("numeroFactura").value = numero;
      document.getElementById("proveedorFactura").value = proveedor;
      document.getElementById("productoFactura").value = producto;
      document.getElementById("montoFactura").value = monto;
      document.getElementById("tipoFactura").value = tipo;
      document.getElementById("monedaFactura").value = moneda;
      fila.remove();
    });
  });

});




