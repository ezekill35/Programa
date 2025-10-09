document.addEventListener("DOMContentLoaded", () => {
  const secciones = document.querySelectorAll(".seccion");
  const buscador = document.getElementById("buscadorGlobal");
  const listaFacturas = document.getElementById("listaFacturas");

  // Mostrar secciones
  window.mostrarSeccion = (id) => {
    secciones.forEach(s => s.style.display = "none");
    document.getElementById(id).style.display = "block";
  };

  // Cerrar sesión
  window.cerrarSesion = () => {
    alert("Sesión cerrada correctamente");
    window.location.href = "index.html";
  };

  const proveedores = [];
  const productos = [];
  const facturas = [];

  // === PROVEEDORES ===
  document.getElementById("formProveedor").addEventListener("submit", e => {
    e.preventDefault();
    const nombre = nombreProveedor.value.trim();
    const ruc = rucProveedor.value.trim();
    const telefono = telefonoProveedor.value.trim();
    proveedores.push({ nombre, ruc, telefono });
    actualizarSelects();
    listarProveedores();
    e.target.reset();
  });

  function listarProveedores() {
    listaProveedores.innerHTML = proveedores.map(p => `<p>${p.nombre} - ${p.ruc}</p>`).join("");
  }

  // === PRODUCTOS ===
  document.getElementById("formProducto").addEventListener("submit", e => {
    e.preventDefault();
    const prod = {
      nombre: nombreProducto.value.trim(),
      descripcion: descripcionProducto.value.trim(),
      cantidad: cantidadProducto.value,
      unidad: unidadProducto.value.trim(),
      valor: valorUnitario.value
    };
    productos.push(prod);
    actualizarSelects();
    listarProductos();
    e.target.reset();
  });

  function listarProductos() {
    listaProductos.innerHTML = productos.map(p => `<p>${p.nombre} - ${p.descripcion}</p>`).join("");
  }

  // Actualizar selects
  function actualizarSelects() {
    proveedorFactura.innerHTML = proveedores.map(p => `<option>${p.nombre}</option>`).join("");
    productoFactura.innerHTML = productos.map(p => `<option>${p.nombre}</option>`).join("");
  }

  // === FACTURAS ===
  document.getElementById("formFactura").addEventListener("submit", e => {
    e.preventDefault();
    const f = {
      numero: numeroFactura.value,
      proveedor: proveedorFactura.value,
      producto: productoFactura.value,
      monto: montoFactura.value,
      moneda: tipoMoneda.value,
      tipo: tipoFactura.value
    };
    facturas.push(f);
    listarFacturas();
    e.target.reset();
  });

  function listarFacturas() {
    listaFacturas.innerHTML = facturas.map(f => `
      <p style="cursor:pointer;" onclick="abrirEdicion('${f.numero}')">
        ${f.numero} - ${f.proveedor} - ${f.producto} - ${f.monto} ${f.moneda}
      </p>
    `).join("");
  }

  // === BUSCADOR GLOBAL ===
  buscador.addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    const resultados = facturas.filter(f =>
      f.numero.toLowerCase().includes(q) ||
      f.proveedor.toLowerCase().includes(q) ||
      f.producto.toLowerCase().includes(q)
    );
    listaFacturas.innerHTML = resultados.map(f => `
      <p style="cursor:pointer;" onclick="abrirEdicion('${f.numero}')">
        ${f.numero} - ${f.proveedor} - ${f.producto} - ${f.monto} ${f.moneda}
      </p>
    `).join("");
  });

  // === MODAL DE EDICIÓN ===
  window.abrirEdicion = (numero) => {
    const f = facturas.find(x => x.numero === numero);
    if (!f) return;
    document.getElementById("editarNumero").value = f.numero;
    document.getElementById("editarMonto").value = f.monto;
    document.getElementById("modalEdicion").style.display = "block";
  };

  window.cerrarModal = () => {
    document.getElementById("modalEdicion").style.display = "none";
  };

  window.guardarEdicion = () => {
    const num = document.getElementById("editarNumero").value;
    const nuevoMonto = document.getElementById("editarMonto").value;
    const f = facturas.find(x => x.numero === num);
    if (f) f.monto = nuevoMonto;
    listarFacturas();
    cerrarModal();
  };

  // === REPORTE ===
  window.generarReporte = () => {
    const cont = document.getElementById("contenidoReporte");
    cont.innerHTML = facturas.map(f => `
      <div>${f.numero} - ${f.proveedor} - ${f.producto} - ${f.monto} ${f.moneda}</div>
    `).join("");
  };
});

