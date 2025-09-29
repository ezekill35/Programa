// Cambiar secciones del dashboard
function showSection(section) {
  document.querySelectorAll(".content-section").forEach(s => s.classList.remove("active"));
  document.getElementById(section + "-section").classList.add("active");
}

// Cerrar sesión
function logout() {
  auth.signOut().then(() => window.location.href = "index.html");
}

// ----------------------
// PRODUCTOS
// ----------------------
function agregarProducto() {
  const sku = document.getElementById("producto-sku").value;
  const nombre = document.getElementById("producto-nombre").value;
  const marca = document.getElementById("producto-marca").value;
  const precio = parseFloat(document.getElementById("producto-precio").value);
  const stock = parseInt(document.getElementById("producto-stock").value);
  const categoria = document.getElementById("producto-categoria").value;

  db.collection("productos").add({ sku, nombre, marca, precio, stock, categoria })
    .then(() => {
      document.getElementById("producto-sku").value = "";
      document.getElementById("producto-nombre").value = "";
      document.getElementById("producto-marca").value = "";
      document.getElementById("producto-precio").value = "";
      document.getElementById("producto-stock").value = "";
      document.getElementById("producto-categoria").value = "";
      mostrarProductos();
    });
}

function mostrarProductos() {
  const lista = document.getElementById("lista-productos");
  lista.innerHTML = "";
  db.collection("productos").get().then(snapshot => {
    snapshot.forEach(doc => {
      const p = doc.data();
      lista.innerHTML += `<div class="card-item">
        <b>${p.nombre}</b> - ${p.categoria} - S/ ${p.precio} - Stock: ${p.stock}
      </div>`;
    });
  });
}

// ----------------------
// PROVEEDORES
// ----------------------
function agregarProveedor() {
  const nombre = document.getElementById("proveedor-nombre").value;
  const contacto = document.getElementById("proveedor-contacto").value;
  const telefono = document.getElementById("proveedor-telefono").value;
  const fax = document.getElementById("proveedor-fax").value;
  const direccion = document.getElementById("proveedor-direccion").value;
  const productos = document.getElementById("proveedor-productos").value;

  db.collection("proveedores").add({ nombre, contacto, telefono, fax, direccion, productos })
    .then(() => {
      document.getElementById("proveedor-nombre").value = "";
      document.getElementById("proveedor-contacto").value = "";
      document.getElementById("proveedor-telefono").value = "";
      document.getElementById("proveedor-fax").value = "";
      document.getElementById("proveedor-direccion").value = "";
      document.getElementById("proveedor-productos").value = "";
      mostrarProveedores();
      cargarSelectProveedores();
    });
}

function mostrarProveedores() {
  const lista = document.getElementById("lista-proveedores");
  lista.innerHTML = "";
  db.collection("proveedores").get().then(snapshot => {
    snapshot.forEach(doc => {
      const p = doc.data();
      lista.innerHTML += `<div class="card-item">
        <b>${p.nombre}</b> - Contacto: ${p.contacto} - Tel: ${p.telefono}
      </div>`;
    });
  });
}

function cargarSelectProveedores() {
  const select = document.getElementById("factura-proveedor");
  select.innerHTML = `<option value="">Seleccione un proveedor</option>`;
  db.collection("proveedores").get().then(snapshot => {
    snapshot.forEach(doc => {
      const p = doc.data();
      select.innerHTML += `<option value="${p.nombre}">${p.nombre}</option>`;
    });
  });
}

// ----------------------
// FACTURAS / COMPRAS
// ----------------------
function agregarFactura() {
  const ruc = document.getElementById("factura-ruc").value;
  const numero = document.getElementById("factura-numero").value;
  const proveedor = document.getElementById("factura-proveedor").value;
  const producto = document.getElementById("factura-producto").value;
  const cantidad = parseInt(document.getElementById("factura-cantidad").value);
  const precio = parseFloat(document.getElementById("factura-precio").value);
  const fecha = document.getElementById("factura-fecha").value;

  db.collection("facturas").add({ ruc, numero, proveedor, producto, cantidad, precio, fecha })
    .then(() => {
      document.getElementById("factura-ruc").value = "";
      document.getElementById("factura-numero").value = "";
      document.getElementById("factura-proveedor").value = "";
      document.getElementById("factura-producto").value = "";
      document.getElementById("factura-cantidad").value = "";
      document.getElementById("factura-precio").value = "";
      document.getElementById("factura-fecha").value = "";
      mostrarFacturas();
    });
}

function mostrarFacturas() {
  const lista = document.getElementById("lista-facturas");
  lista.innerHTML = "";
  db.collection("facturas").get().then(snapshot => {
    snapshot.forEach(doc => {
      const f = doc.data();
      lista.innerHTML += `<div class="card-item">
        <b>Proveedor:</b> ${f.proveedor} - <b>Producto:</b> ${f.producto} - S/ ${f.precio} x ${f.cantidad} - <b>Fecha:</b> ${f.fecha}
      </div>`;
    });
  });
}

// ----------------------
// VENTAS
// ----------------------
function agregarVenta() {
  const cliente = document.getElementById("venta-cliente").value;
  const producto = document.getElementById("venta-producto").value;
  const cantidad = parseInt(document.getElementById("venta-cantidad").value);
  const total = parseFloat(document.getElementById("venta-total").value);

  db.collection("ventas").add({ cliente, producto, cantidad, total })
    .then(() => {
      document.getElementById("venta-cliente").value = "";
      document.getElementById("venta-producto").value = "";
      document.getElementById("venta-cantidad").value = "";
      document.getElementById("venta-total").value = "";
      mostrarVentas();
    });
}

function mostrarVentas() {
  const lista = document.getElementById("lista-ventas");
  lista.innerHTML = "";
  db.collection("ventas").get().then(snapshot => {
    snapshot.forEach(doc => {
      const v = doc.data();
      lista.innerHTML += `<div class="card-item">
        <b>Cliente:</b> ${v.cliente} - <b>Producto:</b> ${v.producto} - Cantidad: ${v.cantidad} - Total: S/ ${v.total}
      </div>`;
    });
  });
}

// ----------------------
// GASTOS
// ----------------------
function agregarGasto() {
  const concepto = document.getElementById("gasto-concepto").value;
  const tipo = document.getElementById("gasto-tipo").value;
  const cantidad = parseInt(document.getElementById("gasto-cantidad").value);
  const valor = parseFloat(document.getElementById("gasto-valor").value);
  const fecha = document.getElementById("gasto-fecha").value;
  const total = cantidad * valor;

  db.collection("gastos").add({ concepto, tipo, cantidad, valor, total, fecha })
    .then(() => {
      document.getElementById("gasto-concepto").value = "";
      document.getElementById("gasto-tipo").value = "alquiler";
      document.getElementById("gasto-cantidad").value = 1;
      document.getElementById("gasto-valor").value = "";
      document.getElementById("gasto-fecha").value = "";
      document.getElementById("gasto-total").value = "";
      mostrarGastos();
    });
}

function mostrarGastos() {
  const lista = document.getElementById("lista-gastos");
  lista.innerHTML = "";
  db.collection("gastos").get().then(snapshot => {
    snapshot.forEach(doc => {
      const g = doc.data();
      lista.innerHTML += `<div class="card-item">
        <b>${g.tipo}</b> - ${g.concepto} - Cant: ${g.cantidad} - S/ ${g.total} - Fecha: ${g.fecha}
      </div>`;
    });
  });
}

// Inicializar listas al cargar
window.onload = function() {
  mostrarProductos();
  mostrarProveedores();
  cargarSelectProveedores();
  mostrarFacturas();
  mostrarVentas();
  mostrarGastos();
}

