// ---------------- FIREBASE ----------------
const app = firebase.initializeApp({
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
});

const db = firebase.firestore();
const auth = firebase.auth();

// ---------------- DASHBOARD ----------------
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "index.html";
  }
});

// ---------------- UTILS ----------------
function showSection(section) {
  document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(section + "-section").classList.add("active");

  // Actualizar active button
  document.querySelectorAll("#sidebar button").forEach(btn => btn.classList.remove("active"));
  document.querySelector(`#sidebar button[onclick="showSection('${section}')"]`).classList.add("active");
}

function logout() {
  auth.signOut().then(() => window.location.href = "index.html");
}

// ---------------- PRODUCTOS ----------------
function addProducto() {
  const sku = document.getElementById("producto-sku").value;
  const nombre = document.getElementById("producto-nombre").value;
  const marca = document.getElementById("producto-marca").value;
  const precio = parseFloat(document.getElementById("producto-precio").value);
  const stock = parseInt(document.getElementById("producto-stock").value);
  const categoria = document.getElementById("producto-categoria").value;
  const unidad = document.getElementById("producto-unidad").value;

  db.collection("productos").add({ sku, nombre, marca, precio, stock, categoria, unidad })
    .then(() => {
      alert("Producto agregado");
      clearProductoForm();
      listarProductos();
    });
}

function clearProductoForm() {
  document.getElementById("add-producto-form").reset();
}

function listarProductos() {
  db.collection("productos").get().then(snapshot => {
    const list = document.getElementById("productos-list");
    list.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const item = document.createElement("div");
      item.className = "card shadow-sm mb-2 p-2";
      item.innerHTML = `
        <b>${data.nombre}</b> (${data.sku}) - ${data.categoria} - Stock: ${data.stock} - S/ ${data.precio.toFixed(2)}
      `;
      list.appendChild(item);
    });

    document.getElementById("total-productos").textContent = snapshot.size;
    const stockBajo = snapshot.docs.filter(d => d.data().stock < 10).length;
    document.getElementById("stock-bajo").textContent = stockBajo;
  });
}

// ---------------- PROVEEDORES ----------------
function addProveedor() {
  const contacto = document.getElementById("proveedor-contacto").value;
  const nombre = document.getElementById("proveedor-nombre").value;
  const telefono = document.getElementById("proveedor-telefono").value;
  const fax = document.getElementById("proveedor-fax").value;
  const producto = document.getElementById("proveedor-producto").value;

  db.collection("proveedores").add({ contacto, nombre, telefono, fax, producto })
    .then(() => {
      alert("Proveedor agregado");
      clearProveedorForm();
      listarProveedores();
      llenarSelectProveedores();
    });
}

function clearProveedorForm() {
  document.getElementById("add-proveedor-form").reset();
}

function listarProveedores() {
  db.collection("proveedores").get().then(snapshot => {
    const list = document.getElementById("proveedores-list");
    list.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const item = document.createElement("div");
      item.className = "card shadow-sm mb-2 p-2";
      item.innerHTML = `<b>${data.nombre}</b> - Contacto: ${data.contacto} - Tel: ${data.telefono} - Fax: ${data.fax} - Producto: ${data.producto}`;
      list.appendChild(item);
    });

    document.getElementById("total-proveedores").textContent = snapshot.size;
  });
}

function llenarSelectProveedores() {
  const select = document.getElementById("invoice-provider");
  select.innerHTML = `<option value="">Seleccione un proveedor</option>`;
  db.collection("proveedores").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = data.nombre;
      select.appendChild(option);
    });
  });
}

// ---------------- FACTURAS ----------------
function addInvoice() {
  const ruc = document.getElementById("invoice-ruc").value;
  const numero = document.getElementById("invoice-number").value;
  const proveedorId = document.getElementById("invoice-provider").value;
  const fecha = document.getElementById("invoice-date").value;

  db.collection("facturas").add({ ruc, numero, proveedorId, fecha })
    .then(() => {
      alert("Factura registrada");
      clearInvoiceForm();
      listarFacturas();
    });
}

function clearInvoiceForm() {
  document.getElementById("add-invoice-form").reset();
}

function listarFacturas() {
  const list = document.getElementById("invoices-list");
  list.innerHTML = "";
  db.collection("facturas").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      db.collection("proveedores").doc(data.proveedorId).get().then(provDoc => {
        const provData = provDoc.data();
        const item = document.createElement("div");
        item.className = "card shadow-sm mb-2 p-2";
        item.innerHTML = `Factura: ${data.numero} - RUC: ${data.ruc} - Proveedor: ${provData ? provData.nombre : "Desconocido"} - Fecha: ${data.fecha}`;
        list.appendChild(item);
      });
    });
  });
}

// ---------------- VENTAS ----------------
function addVenta() {
  const cliente = document.getElementById("venta-cliente").value;
  const productoId = document.getElementById("venta-producto").value;
  const cantidad = parseInt(document.getElementById("venta-cantidad").value);
  const precio = parseFloat(document.getElementById("venta-precio").value);
  const fecha = document.getElementById("venta-fecha").value;

  db.collection("ventas").add({ cliente, productoId, cantidad, precio, fecha })
    .then(() => {
      alert("Venta registrada");
      document.getElementById("add-venta-form").reset();
      listarVentas();
    });
}

function listarVentas() {
  const list = document.getElementById("ventas-list");
  list.innerHTML = "";
  db.collection("ventas").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      db.collection("productos").doc(data.productoId).get().then(prodDoc => {
        const prodData = prodDoc.data();
        const item = document.createElement("div");
        item.className = "card shadow-sm mb-2 p-2";
        item.innerHTML = `Cliente: ${data.cliente} - Producto: ${prodData ? prodData.nombre : "Desconocido"} - Cantidad: ${data.cantidad} - Total: S/ ${(data.cantidad * data.precio).toFixed(2)} - Fecha: ${data.fecha}`;
        list.appendChild(item);
      });
    });
  });
}

// ---------------- GASTOS ----------------
function addGasto() {
  const descripcion = document.getElementById("gasto-descripcion").value;
  const tipo = document.getElementById("gasto-tipo").value;
  const cantidad = parseInt(document.getElementById("gasto-cantidad").value);
  const valorUnitario = parseFloat(document.getElementById("gasto-valor-unitario").value);
  const fecha = document.getElementById("gasto-fecha").value;

  const total = cantidad * valorUnitario;

  db.collection("gastos").add({ descripcion, tipo, cantidad, valorUnitario, total, fecha })
    .then(() => {
      alert("Gasto registrado");
      document.getElementById("add-gasto-form").reset();
      listarGastos();
    });
}

function listarGastos() {
  const list = document.getElementById("gastos-list");
  list.innerHTML = "";
  db.collection("gastos").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const item = document.createElement("div");
      item.className = "card shadow-sm mb-2 p-2";
      item.innerHTML = `${data.descripcion} - Tipo: ${data.tipo} - Total: S/ ${data.total.toFixed(2)} - Fecha: ${data.fecha}`;
      list.appendChild(item);
    });
  });
}

// ---------------- INIT ----------------
listarProductos();
listarProveedores();
llenarSelectProveedores();
listarFacturas();
listarVentas();
listarGastos();
