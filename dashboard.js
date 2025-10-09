// ============================
// 📘 DASHBOARD.JS — DISCOVERY PETS
// ============================

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Dashboard Discovery Pets iniciado correctamente.");

  // Referencias principales
  const secciones = document.querySelectorAll(".seccion");
  const botonesMenu = document.querySelectorAll(".menu-opcion");
  const buscadorInput = document.getElementById("buscador");
  const cerrarSesionBtn = document.getElementById("cerrarSesion");

  // Mostrar sección inicial (Facturas)
  mostrarSeccion("facturas");

  // 🔹 Navegación entre secciones
  botonesMenu.forEach((boton) => {
    boton.addEventListener("click", (e) => {
      e.preventDefault();
      const seccion = boton.getAttribute("data-seccion");
      mostrarSeccion(seccion);
    });
  });

  function mostrarSeccion(nombre) {
    secciones.forEach((sec) => {
      sec.style.display = sec.id === nombre ? "block" : "none";
    });
  }

  // ============================
  // 🔍 Buscador Global
  // ============================
  if (buscadorInput) {
    buscadorInput.addEventListener("input", (e) => {
      const valor = e.target.value.toLowerCase();
      filtrarRegistros(valor);
    });
  }

  function filtrarRegistros(valor) {
    const filas = document.querySelectorAll("table tbody tr");
    filas.forEach((fila) => {
      const texto = fila.textContent.toLowerCase();
      fila.style.display = texto.includes(valor) ? "" : "none";
    });
  }

  // ============================
  // 🚪 Cerrar Sesión
  // ============================
  if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("usuarioActivo");
      window.location.href = "index.html";
    });
  }

  // ============================
  // 🧾 REGISTRO DE FACTURAS
  // ============================
  const formFactura = document.getElementById("formFactura");
  const tablaFacturas = document.querySelector(".tabla-facturas tbody");

  if (formFactura && tablaFacturas) {
    formFactura.addEventListener("submit", (e) => {
      e.preventDefault();

      const numero = formFactura.numero.value.trim();
      const proveedor = formFactura.proveedor.value.trim();
      const producto = formFactura.producto.value.trim();
      const monto = parseFloat(formFactura.monto.value.trim() || 0).toFixed(2);
      const moneda = formFactura.moneda.value;
      const tipo = formFactura.tipo.value;

      if (!numero || !proveedor || !producto) {
        alert("Por favor, complete todos los campos de la factura.");
        return;
      }

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${numero}</td>
        <td>${proveedor}</td>
        <td>${producto}</td>
        <td>${monto} ${moneda}</td>
        <td>${tipo}</td>
        <td>
          <button class="btn-editar">✏️</button>
          <button class="btn-eliminar">🗑️</button>
        </td>
      `;
      tablaFacturas.appendChild(fila);
      formFactura.reset();
    });

    tablaFacturas.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-eliminar")) {
        e.target.closest("tr").remove();
      } else if (e.target.classList.contains("btn-editar")) {
        const fila = e.target.closest("tr");
        const celdas = fila.querySelectorAll("td");

        formFactura.numero.value = celdas[0].textContent;
        formFactura.proveedor.value = celdas[1].textContent;
        formFactura.producto.value = celdas[2].textContent;
        formFactura.monto.value = parseFloat(celdas[3].textContent);
        formFactura.tipo.value = celdas[4].textContent;

        fila.remove();
      }
    });
  }

  // ============================
  // 👷 REGISTRO DE PROVEEDORES
  // ============================
  const formProveedor = document.getElementById("formProveedor");
  const tablaProveedores = document.querySelector(".tabla-proveedores tbody");

  if (formProveedor && tablaProveedores) {
    formProveedor.addEventListener("submit", (e) => {
      e.preventDefault();

      const nombre = formProveedor.nombre.value.trim();
      const ruc = formProveedor.ruc.value.trim();
      const telefono = formProveedor.telefono.value.trim();

      if (!nombre || !ruc || !telefono) {
        alert("Por favor, complete todos los campos del proveedor.");
        return;
      }

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${nombre}</td>
        <td>${ruc}</td>
        <td>${telefono}</td>
        <td>
          <button class="btn-editar">✏️</button>
          <button class="btn-eliminar">🗑️</button>
        </td>
      `;
      tablaProveedores.appendChild(fila);
      formProveedor.reset();
    });

    tablaProveedores.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-eliminar")) {
        e.target.closest("tr").remove();
      } else if (e.target.classList.contains("btn-editar")) {
        const fila = e.target.closest("tr");
        const celdas = fila.querySelectorAll("td");
        formProveedor.nombre.value = celdas[0].textContent;
        formProveedor.ruc.value = celdas[1].textContent;
        formProveedor.telefono.value = celdas[2].textContent;
        fila.remove();
      }
    });
  }

  // ============================
  // 📦 REGISTRO DE PRODUCTOS
  // ============================
  const formProducto = document.getElementById("formProducto");
  const tablaProductos = document.querySelector(".tabla-productos tbody");

  if (formProducto && tablaProductos) {
    formProducto.addEventListener("submit", (e) => {
      e.preventDefault();

      const nombre = formProducto.nombre.value.trim();
      const descripcion = formProducto.descripcion.value.trim();
      const cantidad = formProducto.cantidad.value.trim();
      const unidad = formProducto.unidad.value.trim();
      const valor = parseFloat(formProducto.valor.value.trim() || 0).toFixed(2);

      if (!nombre || !descripcion || !cantidad || !unidad) {
        alert("Por favor, complete todos los campos del producto.");
        return;
      }

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${nombre}</td>
        <td>${descripcion}</td>
        <td>${cantidad}</td>
        <td>${unidad}</td>
        <td>${valor}</td>
        <td>
          <button class="btn-editar">✏️</button>
          <button class="btn-eliminar">🗑️</button>
        </td>
      `;
      tablaProductos.appendChild(fila);
      formProducto.reset();
    });

    tablaProductos.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-eliminar")) {
        e.target.closest("tr").remove();
      } else if (e.target.classList.contains("btn-editar")) {
        const fila = e.target.closest("tr");
        const celdas = fila.querySelectorAll("td");

        formProducto.nombre.value = celdas[0].textContent;
        formProducto.descripcion.value = celdas[1].textContent;
        formProducto.cantidad.value = celdas[2].textContent;
        formProducto.unidad.value = celdas[3].textContent;
        formProducto.valor.value = celdas[4].textContent;
        fila.remove();
      }
    });
  }

  // ============================
  // 💸 REGISTRO DE GASTOS
  // ============================
  const formGasto = document.getElementById("formGasto");
  const tablaGastos = document.querySelector(".tabla-gastos tbody");

  if (formGasto && tablaGastos) {
    formGasto.addEventListener("submit", (e) => {
      e.preventDefault();

      const descripcion = formGasto.descripcion.value.trim();
      const monto = parseFloat(formGasto.monto.value.trim() || 0).toFixed(2);

      if (!descripcion || !monto) {
        alert("Por favor, complete los campos del gasto.");
        return;
      }

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${descripcion}</td>
        <td>${monto}</td>
        <td>
          <button class="btn-eliminar">🗑️</button>
        </td>
      `;
      tablaGastos.appendChild(fila);
      formGasto.reset();
    });

    tablaGastos.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-eliminar")) {
        e.target.closest("tr").remove();
      }
    });
  }

  // ============================
  // 📊 GENERAR REPORTE
  // ============================
  const btnGenerarReporte = document.getElementById("generarReporte");
  if (btnGenerarReporte) {
    btnGenerarReporte.addEventListener("click", () => {
      alert("🧾 Reporte generado correctamente (ejemplo funcional).");
    });
  }
});

