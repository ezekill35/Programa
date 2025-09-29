// ==============================================
// Firebase
// ==============================================
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:a073cc5af230b32f4c5322",
  measurementId: "G-W5RGYVTW3V"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ==============================================
// LOGOUT
// ==============================================
function logout() {
  auth.signOut().then(() => window.location.href = "index.html");
}

// ==============================================
// DASHBOARD SECTIONS
// ==============================================
function showSection(section) {
  document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(section + "-section").classList.add("active");
}

// ==============================================
// PRODUCTOS
// ==============================================
function addProduct() {
  const sku = document.getElementById("product-sku").value;
  const description = document.getElementById("product-description").value;
  const brand = document.getElementById("product-brand").value;
  const price = parseFloat(document.getElementById("product-price").value);
  const stock = parseInt(document.getElementById("product-stock").value);
  const unit = document.getElementById("product-unit").value;
  const category = document.getElementById("product-category").value;
  const forWhom = document.getElementById("product-for").value;

  db.collection("productos").add({
    sku, description, brand, price, stock, unit, category, forWhom, created: new Date()
  }).then(() => {
    clearProductForm();
    loadProducts();
    updateSummary();
  });
}

function loadProducts() {
  const list = document.getElementById("products-list-view");
  list.innerHTML = "";
  db.collection("productos").get().then(snapshot => {
    snapshot.forEach(doc => {
      const p = doc.data();
      list.innerHTML += `
        <div class="data-card">
          <b>${p.sku}</b> - ${p.description} (${p.brand})<br>
          Precio: S/ ${p.price.toFixed(2)}, Stock: ${p.stock} ${p.unit}<br>
          Categoría: ${p.category}, Para: ${p.forWhom}
        </div>
      `;
    });
  });
}

function clearProductForm() {
  document.getElementById("form-productos").reset();
}

function filterProducts() {
  const filter = document.getElementById("search-product").value.toLowerCase();
  const list = document.getElementById("products-list-view");
  list.querySelectorAll(".data-card").forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(filter) ? "block" : "none";
  });
}

// ==============================================
// PROVEEDORES
// ==============================================
function addProvider() {
  const contact = document.getElementById("provider-contact").value;
  const name = document.getElementById("provider-name").value;
  const phone = document.getElementById("provider-phone").value;
  const fax = document.getElementById("provider-fax").value;
  const address = document.getElementById("provider-address").value;
  const productType = document.getElementById("provider-product-type").value;

  db.collection("proveedores").add({
    contact, name, phone, fax, address, productType, created: new Date()
  }).then(() => {
    clearProviderForm();
    loadProviders();
    loadInvoiceProviders();
    updateSummary();
  });
}

function loadProviders() {
  const list = document.getElementById("providers-list-view");
  list.innerHTML = "";
  db.collection("proveedores").get().then(snapshot => {
    snapshot.forEach(doc => {
      const p = doc.data();
      list.innerHTML += `
        <div class="data-card">
          <b>${p.name}</b><br>
          Contacto: ${p.contact}<br>
          Teléfono: ${p.phone} | Fax: ${p.fax || "No especificado"}<br>
          Productos: ${p.productType || "No especificado"}
        </div>
      `;
    });
  });
}

function clearProviderForm() {
  document.getElementById("form-proveedores").reset();
}

function filterProviders() {
  const filter = document.getElementById("search-provider").value.toLowerCase();
  const list = document.getElementById("providers-list-view");
  list.querySelectorAll(".data-card").forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(filter) ? "block" : "none";
  });
}

// ==============================================
// COMPRAS / FACTURAS
// ==============================================
function addInvoice() {
  const ruc = document.getElementById("invoice-ruc").value;
  const number = document.getElementById("invoice-number").value;
  const provider = document.getElementById("invoice-provider").value;
  const product = document.getElementById("invoice-product").value;
  const quantity = parseInt(document.getElementById("invoice-quantity").value);
  const unitPrice = parseFloat(document.getElementById("invoice-unit-price").value);
  const taxRate = parseFloat(document.getElementById("invoice-tax-rate").value);
  const total = (quantity * unitPrice) * (1 + taxRate/100);
  const date = document.getElementById("invoice-date").value;

  db.collection("facturas").add({
    ruc, number, provider, product, quantity, unitPrice, taxRate, total, date, created: new Date()
  }).then(() => {
    clearInvoiceForm();
    loadInvoices();
    updateSummary();
  });
}

function loadInvoices() {
  const list = document.getElementById("invoices-list-view");
  list.innerHTML = "";
  db.collection("facturas").orderBy("created","desc").limit(5).get().then(snapshot => {
    snapshot.forEach(doc => {
      const f = doc.data();
      list.innerHTML += `<div class="data-card">
        ${f.date} - ${f.provider} - ${f.product} - Total: S/ ${f.total.toFixed(2)}
      </div>`;
    });
  });
}

function clearInvoiceForm() {
  document.getElementById("add-invoice-form").reset();
  document.getElementById("invoice-total").value = "";
}

function calculateInvoiceTotals() {
  const quantity = parseFloat(document.getElementById("invoice-quantity").value) || 0;
  const unitPrice = parseFloat(document.getElementById("invoice-unit-price").value) || 0;
  const taxRate = parseFloat(document.getElementById("invoice-tax-rate").value) || 0;
  const total = (quantity * unitPrice) * (1 + taxRate/100);
  document.getElementById("invoice-total").value = total.toFixed(2);
}

function loadInvoiceProviders() {
  const select = document.getElementById("invoice-provider");
  select.innerHTML = '<option value="">Seleccione un proveedor</option>';
  db.collection("proveedores").get().then(snapshot => {
    snapshot.forEach(doc => {
      const p = doc.data();
      select.innerHTML += `<option value="${p.name}">${p.name}</option>`;
    });
  });
}

// ==============================================
// VENTAS
// ==============================================
function addSale() {
  const client = document.getElementById("sale-client").value;
  const total = parseFloat(document.getElementById("sale-total").value);
  const date = document.getElementById("sale-date").value;

  db.collection("ventas").add({client, total, date, created: new Date()}).then(() => {
    clearSaleForm();
    updateSummary();
  });
}

function clearSaleForm() {
  document.getElementById("form-sales").reset();
}

// ==============================================
// GASTOS
// ==============================================
function addExpense() {
  const description = document.getElementById("expense-description").value;
  const type = document.getElementById("expense-type").value;
  const quantity = parseFloat(document.getElementById("expense-quantity").value);
  const unitPrice = parseFloat(document.getElementById("expense-unit-price").value);
  const total = quantity * unitPrice;
  const date = document.getElementById("expense-date").value;

  db.collection("gastos").add({description, type, quantity, unitPrice, total, date, created: new Date()}).then(() => {
    clearExpenseForm();
    loadExpenses();
    updateSummary();
  });
}

function clearExpenseForm() {
  document.getElementById("form-expenses").reset();
  document.getElementById("expense-total").value = "";
}

function loadExpenses() {
  const list = document.getElementById("expenses-list-view");
  list.innerHTML = "";
  db.collection("gastos").get().then(snapshot => {
    snapshot.forEach(doc => {
      const e = doc.data();
      list.innerHTML += `<div class="data-card">
        ${e.date} - ${e.description} (${e.type}) - Total: S/ ${e.total.toFixed(2)}
      </div>`;
    });
  });
}

// ==============================================
// RESUMEN RÁPIDO
// ==============================================
function updateSummary() {
  // Productos
  db.collection("productos").get().then(snapshot => {
    document.getElementById("summary-total-products").textContent = snapshot.size;
    let lowStock = 0;
    snapshot.forEach(doc => { if(doc.data().stock < 10) lowStock++; });
    document.getElementById("summary-low-stock").textContent = lowStock;
  });

  // Proveedores
  db.collection("proveedores").get().then(snapshot => {
    document.getElementById("summary-total-providers").textContent = snapshot.size;
  });

  // Ventas
  db.collection("ventas").get().then(snapshot => {
    let total = 0;
    snapshot.forEach(doc => { total += doc.data().total; });
    document.getElementById("summary-sales").textContent = `S/ ${total.toFixed(2)}`;
  });

  // Últimas Facturas
  loadInvoices();
}

// ==============================================
// INICIALIZACIÓN
// ==============================================
window.onload = () => {
  loadProducts();
  loadProviders();
  loadInvoiceProviders();
  loadInvoices();
  loadExpenses();
  updateSummary();
};







