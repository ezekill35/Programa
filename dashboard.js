// Esperar a que el usuario esté logueado
auth.onAuthStateChanged(user => {
  if (user) {
    initializeDashboard();
  } else {
    window.location.href = "index.html";
  }
});

// -------- Inicializar Dashboard --------
function initializeDashboard() {
  updateResumen();
  loadProducts();
  loadProviders();
  loadInvoices();
  loadSales();
  loadExpenses();
}

// -------- Resumen Rápido --------
function updateResumen() {
  db.collection("productos").get().then(snapshot => {
    document.getElementById("total-productos").textContent = snapshot.size;
    let stockBajo = 0;
    snapshot.forEach(doc => { if (doc.data().stock < 10) stockBajo++; });
    document.getElementById("stock-bajo").textContent = stockBajo;
  });
  db.collection("proveedores").get().then(snapshot => {
    document.getElementById("total-proveedores").textContent = snapshot.size;
  });
  // Ventas del mes
  db.collection("ventas").get().then(snapshot => {
    let total = 0;
    snapshot.forEach(doc => { total += doc.data().total; });
    document.getElementById("ventas-mes").textContent = `S/ ${total.toFixed(2)}`;
  });
}

// -------- Secciones --------
function showSection(section) {
  document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(section + "-section").classList.add("active");
}

// -------- CRUD Productos --------
function addProduct() {
  const data = {
    sku: document.getElementById("product-sku").value,
    name: document.getElementById("product-name").value,
    brand: document.getElementById("product-brand").value,
    price: parseFloat(document.getElementById("product-price").value),
    stock: parseInt(document.getElementById("product-stock").value),
    unit: document.getElementById("product-unit").value,
    category: document.getElementById("product-category").value
  };
  db.collection("productos").add(data).then(() => {
    loadProducts();
    updateResumen();
    document.getElementById("add-product-form").reset();
  });
}

function loadProducts() {
  const list = document.getElementById("productos-list");
  list.innerHTML = "";
  db.collection("productos").get().then(snapshot => {
    snapshot.forEach(doc => {
      const p = doc.data();
      list.innerHTML += `<div class="card mb-2 p-2 shadow-sm">
        <b>${p.sku}</b> - ${p.name} | ${p.brand} | S/ ${p.price} | Stock: ${p.stock} | ${p.category}
      </div>`;
    });
  });
}

// -------- CRUD Proveedores --------
function addProvider() {
  const data = {
    contact: document.getElementById("provider-contact").value,
    name: document.getElementById("provider-name").value,
    phone: document.getElementById("provider-phone").value,
    fax: document.getElementById("provider-fax").value,
    address: document.getElementById("provider-address").value,
    products: document.getElementById("provider-products").value
  };
  db.collection("proveedores").add(data).then(() => {
    loadProviders();
    updateResumen();
    document.getElementById("add-provider-form").reset();
  });
}

function loadProviders() {
  const list = document.getElementById("providers-list");
  list.innerHTML = "";
  db.collection("proveedores").get().then(snapshot => {
    snapshot.forEach(doc => {
      const p = doc.data();
      list.innerHTML += `<div class="card mb-2 p-2 shadow-sm">
        <b>${p.name}</b> | Contacto: ${p.contact} | Tel: ${p.phone} | Fax: ${p.fax || 'No especificado'} | Productos: ${p.products || 'No especificado'}
      </div>`;
    });
  });
}

// -------- Compras / Facturas --------
function addInvoice() {
  const data = {
    ruc: document.getElementById("invoice-ruc").value,
    number: document.getElementById("invoice-number").value,
    description: document.getElementById("invoice-description").value,
    quantity: parseInt(document.getElementById("invoice-quantity").value),
    unitPrice: parseFloat(document.getElementById("invoice-unit-price").value),
    date: document.getElementById("invoice-date").value
  };
  db.collection("compras").add(data).then(() => {
    loadInvoices();
    document.getElementById("add-invoice-form").reset();
  });
}

function loadInvoices() {
  const list = document.getElementById("invoices-list");
  list.innerHTML = "";
  db.collection("compras").get().then(snapshot => {
    snapshot.forEach(doc => {
      const i = doc.data();
      list.innerHTML += `<div class="card mb-2 p-2 shadow-sm">${i.ruc} - ${i.number} - ${i.description} - Cant: ${i.quantity} - S/ ${i.unitPrice} - ${i.date}</div>`;
    });
  });
}

// -------- Ventas --------
function addSale() {
  const data = {
    client: document.getElementById("sale-client").value,
    total: parseFloat(document.getElementById("sale-total").value)
  };
  db.collection("ventas").add(data).then(() => {
    loadSales();
    updateResumen();
    document.getElementById("add-sale-form").reset();
  });
}

function loadSales() {
  const list = document.getElementById("sales-list");
  list.innerHTML = "";
  db.collection("ventas").get().then(snapshot => {
    snapshot.forEach(doc => {
      const s = doc.data();
      list.innerHTML += `<div class="card mb-2 p-2 shadow-sm">${s.client} - S/ ${s.total}</div>`;
    });
  });
}

// -------- Gastos --------
function addExpense() {
  const data = {
    desc: document.getElementById("expense-desc").value,
    type: document.getElementById("expense-type").value,
    quantity: parseInt(document.getElementById("expense-quantity").value),
    unitValue: parseFloat(document.getElementById("expense-unit").value),
    date: document.getElementById("expense-date").value
  };
  db.collection("gastos").add(data).then(() => {
    loadExpenses();
    document.getElementById("add-expense-form").reset();
  });
}

function loadExpenses() {
  const list = document.getElementById("expenses-list");
  list.innerHTML = "";
  db.collection("gastos").get().then(snapshot => {
    snapshot.forEach(doc => {
      const e = doc.data();
      const total = e.quantity * e.unitValue;
      list.innerHTML += `<div class="card mb-2 p-2 shadow-sm">${e.desc} | ${e.type} | ${e.quantity} x S/ ${e.unitValue} = S/ ${total}</div>`;
    });
  });
}
