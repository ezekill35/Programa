document.addEventListener("DOMContentLoaded", () => {
  const secciones = document.querySelectorAll(".seccion");
  const botones = document.querySelectorAll(".menu-opcion");

  // ✅ Mostrar sección activa
  function mostrarSeccion(id) {
    secciones.forEach(sec => sec.style.display = sec.id === id ? "block" : "none");
    botones.forEach(btn => {
      btn.classList.toggle("activo", btn.getAttribute("data-seccion") === id);
    });
  }

  // ✅ Navegación lateral
  botones.forEach(btn => {
    btn.addEventListener("click", () => {
      const seccion = btn.getAttribute("data-seccion");
      mostrarSeccion(seccion);
    });
  });

  // Mostrar primera sección al cargar
  mostrarSeccion("facturas");

  // ====================
  // 🔍 BUSCADOR GLOBAL
  // ====================
  const buscador = document.getElementById("buscador");
  if (buscador) {
    buscador.addEventListener("input", e => {
      const valor = e.target.value.toLowerCase();
      document.querySelectorAll("tbody tr").forEach(fila => {
        const texto = fila.textContent.toLowerCase();
        fila.style.display = texto.includes(valor) ? "" : "none";
      });
    });
  }

  // ====================
  // 🚪 CERRAR SESIÓN
  // ====================
  const cerrarSesion = document.getElementById("cerrarSesion");
  if (cerrarSesion) {
    cerrarSesion.addEventListener("click", () => {
      localStorage.removeItem("usuarioActivo");
      window.location.href = "index.html";
    });
  }

  // ====================
  // 🧾 FACTURAS
  // ====================
  const formFactura = document.getElementById("formFactura");
  const tablaFacturas = document.querySelector(".tabla-facturas tbody");
  if (formFactura && tablaFacturas) {
    formFactura.addEventListener("submit", e => {
      e.preventDefault();
      const datos = Object.fromEntries(new FormData(formFactura).entries());
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${datos.numero}</td>
        <td>${datos.proveedor}</td>
        <td>${datos.producto}</td>
        <td>${datos.monto} ${datos.moneda}</td>
        <td>${datos.tipo}</td>
        <td><button class="btn-eliminar">🗑️</button></td>
      `;
      tablaFacturas.appendChild(fila);
      formFactura.reset();
    });
  }

  // ====================
  // 🏢 PROVEEDORES
  // ====================
  const formProveedor = document.getElementById("formProveedor");
  const tablaProveedores = document.querySelector(".tabla-proveedores tbody");
  if (formProveedor && tablaProveedores) {
    formProveedor.addEventListener("submit", e => {
      e.preventDefault();
      const datos = Object.fromEntries(new FormData(formProveedor).entries());
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${datos.nombre}</td>
        <td>${datos.ruc}</td>
        <td>${datos.telefono}</td>
        <td><button class="btn-eliminar">🗑️</button></td>
      `;
      tablaProveedores.appendChild(fila);
      formProveedor.reset();
    });
  }

  // ====================
  // 📦 PRODUCTOS
  // ====================
  const formProducto = document.getElementById("formProducto");
  const tablaProductos = document.querySelector(".tabla-productos tbody");
  if (formProducto && tablaProductos) {
    formProducto.addEventListener("submit", e => {
      e.preventDefault();
      const datos = Object.fromEntries(new FormData(formProducto).entries());
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${datos.nombre}</td>
        <td>${datos.descripcion}</td>
        <td>${datos.cantidad}</td>
        <td>${datos.unidad}</td>
        <td>${datos.valor}</td>
        <td><button class="btn-eliminar">🗑️</button></td>
      `;
      tablaProductos.appendChild(fila);
      formProducto.reset();
    });
  }

  // ====================
  // 💸 GASTOS
  // ====================
  const formGasto = document.getElementById("formGasto");
  const tablaGastos = document.querySelector(".tabla-gastos tbody");
  if (formGasto && tablaGastos) {
    formGasto.addEventListener("submit", e => {
      e.preventDefault();
      const datos = Object.fromEntries(new FormData(formGasto).entries());
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${datos.descripcion}</td>
        <td>${datos.monto}</td>
        <td><button class="btn-eliminar">🗑️</button></td>
      `;
      tablaGastos.appendChild(fila);
      formGasto.reset();
    });
  }

  // ====================
  // 🧾 REPORTE
  // ====================
  const btnReporte = document.getElementById("generarReporte");
  if (btnReporte) {
    btnReporte.addEventListener("click", () => {
      alert("Reporte generado correctamente (ejemplo).");
    });
  }
});


