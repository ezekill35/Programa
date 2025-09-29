// dashboard.js

// Mostrar secciones
function showSection(section) {
  document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(section + "-section").classList.add("active");
}

// Productos
function addProduct() {
  const prod = {
    sku: document.getElementById("prod-sku").value,
    nombre: document.getElementById("prod-nombre").value,
    marca: document.getElementById("prod-marca").value,
    precio: parseFloat(document.getElementById("prod-precio").value),
    stock: parseInt(document.getElementById("prod-stock").value),
    unidad: document.getElementById("prod-unidad").value,
    categoria: document.getElementById("prod-categoria").value
  };

  db.collection("productos").add(prod).then(() => {
    alert("Producto agregado ✅");
    document.getElementById("add-product-form").reset();
    loadProductos();
  });
}

function loadProductos() {
  const container = document.getElementById("productos-list");
  container.innerHTML = "";
  db.collection("productos").get().then(snapshot => {
    snapshot.forEach(doc => {
      const p = doc.data();
      container.innerHTML += `
        <div class="card p-2 mb-2 shadow-sm">
          <strong>${p.nombre}</strong> | SKU: ${p.sku} | Stock: ${p.stock} | Precio: S/ ${p.precio}
        </div>`;
    });
  });
}

// Proveedores
function addProveedor() {
  const prov = {
    contacto: document.getElementById("prov-contacto").value,
    nombre: document.getElementById("prov-nombre").value,
    telefono: document.getElementById("prov-telefono").value,
    fax: document.getElementById("prov-fax").value,
    direccion: document.getElementById("prov-direccion").value,
    productos: document.getElementById("prov-productos").value
  };
  db.collection("proveedores").add(prov).then(() => {
    alert("Proveedor agregado ✅");
    document.getElementById("add-proveedor-form").reset();
    loadProveedores();
  });
}

function loadProveedores() {
  const container = document.getElementById("proveedores-list");
  container.innerHTML = "";
  db.collection("proveedores").get().then(snapshot => {
    snapshot.forEach(doc => {
      const p = doc.data();
      container.innerHTML += `
        <div class="card p-2 mb-2 shadow-sm">
          <strong>${p.nombre}</strong> | Contacto: ${p.contacto} | Tel: ${p.telefono}
        </div>`;
    });
  });
}

// Compras
function addCompra() {
  const compra = {
    ruc: document.getElementById("comp-ruc").value,
    factura: document.getElementById("comp-factura").value,
    fecha: document.getElementById("comp-fecha").value,
    total: parseFloat(document.getElementById("comp-total").value)
  };
  db.collection("compras").add(compra).then(() => {
    alert("Compra registrada ✅");
    document.getElementById("add-compra-form").reset();
    loadCompras();
  });
}

function loadCompras() {
  const container = document.getElementById("compras-list");
  container.innerHTML = "";
  db.collection("compras").get().then(snapshot => {
    snapshot.forEach(doc => {
      const c = doc.data();
      container.innerHTML += `
        <div class="card p-2 mb-2 shadow-sm">
          Factura: ${c.factura} | RUC: ${c.ruc} | Total: S/ ${c.total}
        </div>`;
    });
  });
}

// Ventas
function addVenta() {
  const venta = {
    cliente: document.getElementById("venta-cliente").value,
    total: parseFloat(document.getElementById("venta-total").value)
  };
  db.collection("ventas").add(venta).then(() => {
    alert("Venta registrada ✅");
    document.getElementById("add-venta-form").reset();
    loadVentas();
  });
}

function loadVentas() {
  const container = document.getElementById("ventas-list");
  container.innerHTML = "";
  db.collection("ventas").get().then(snapshot => {
    snapshot.forEach(doc => {
      const v = doc.data();
      container.innerHTML += `
        <div class="card p-2 mb-2 shadow-sm">
          Cliente: ${v.cliente} | Total: S/ ${v.total}
        </div>`;
    });
  });
}

// Gastos
function addGasto() {
  const gasto = {
    descripcion: document.getElementById("gasto-desc").value,
    tipo: document.getElementById("gasto-tipo").value,
    cantidad: parseInt(document.getElementById("gasto-cantidad").value),
    valor: parseFloat(document.getElementById("gasto-valor").value),
    fecha: document.getElementById("gasto-fecha").value
  };
  db.collection("gastos").add(gasto).then(() => {
    alert("Gasto registrado ✅");
    document.getElementById("add-gasto-form").reset();
    loadGastos();
  });
}

function loadGastos() {
  const container = document.getElementById("gastos-list");
  container.innerHTML = "";
  db.collection("gastos").get().then(snapshot => {
    snapshot.forEach(doc => {
      const g = doc.data();
      container.innerHTML += `
        <div class="card p-2 mb-2 shadow-sm">
          ${g.descripcion} | Tipo: ${g.tipo} | Total: S/ ${g.valor * g.cantidad}
        </div>`;
    });
  });
}

// Cargar todo al inicio
window.addEventListener("DOMContentLoaded", () => {
  loadProductos();
  loadProveedores();
  loadCompras();
  loadVentas();
  loadGastos();
});


