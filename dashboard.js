// -------- Logout --------
function logout() {
  auth.signOut().then(() => window.location.href = "index.html");
}

// -------- Mostrar Secciones --------
function showSection(section) {
  document.querySelectorAll(".content-section").forEach(sec => sec.style.display = "none");
  const target = document.getElementById(section + "-section");
  if(target) target.style.display = "block";
  document.getElementById("dashboard-title").textContent =
    section.charAt(0).toUpperCase() + section.slice(1);
}

// -------- PRODUCTOS --------
function addProduct() {
  const sku = document.getElementById("product-sku").value;
  const name = document.getElementById("product-name").value;
  const brand = document.getElementById("product-brand").value;
  const price = parseFloat(document.getElementById("product-price").value);
  const stock = parseInt(document.getElementById("product-stock").value);
  const unit = document.getElementById("product-unit").value;
  const category = document.getElementById("product-category").value;

  db.collection("productos").add({ sku, name, brand, price, stock, unit, category })
    .then(() => {
      alert("✅ Producto agregado");
      document.getElementById("add-product-form").reset();
      loadProducts();
    })
    .catch(err => console.error(err));
}

function loadProducts() {
  const list = document.getElementById("products-list");
  list.innerHTML = "";
  db.collection("productos").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      list.innerHTML += `
        <div class="item-card">
          <strong>${data.name}</strong> - ${data.sku} <br>
          S/ ${data.price} | Stock: ${data.stock} | ${data.category}
          <button onclick="deleteProduct('${doc.id}')">Eliminar</button>
        </div>
      `;
    });
  });
}

function deleteProduct(id) {
  if(confirm("¿Eliminar este producto?")) {
    db.collection("productos").doc(id).delete().then(() => loadProducts());
  }
}

// -------- PROVEEDORES --------
function addProvider() {
  const name = document.getElementById("provider-name").value;
  const business = document.getElementById("provider-business").value;
  const phone = document.getElementById("provider-phone").value;
  const fax = document.getElementById("provider-fax").value;
  const address = document.getElementById("provider-address").value;
  const productType = document.getElementById("provider-product-type").value;

  db.collection("proveedores").add({ name, business, phone, fax, address, productType })
    .then(() => {
      alert("✅ Proveedor agregado");
      document.getElementById("add-provider-form").reset();
      loadProviders();
    })
    .catch(err => console.error(err));
}

function loadProviders() {
  const list = document.getElementById("providers-list");
  list.innerHTML = "";
  db.collection("proveedores").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      list.innerHTML += `
        <div class="item-card">
          <strong>${data.business}</strong> - Contacto: ${data.name} <br>
          Tel: ${data.phone} | Fax: ${data.fax || "-"} <br>
          Productos: ${data.productType || "No especificado"}
          <button onclick="deleteProvider('${doc.id}')">Eliminar</button>
        </div>
      `;
    });
  });
}

function deleteProvider(id) {
  if(confirm("¿Eliminar este proveedor?")) {
    db.collection("proveedores").doc(id).delete().then(() => loadProviders());
  }
}

// -------- COMPRAS --------
function addPurchase() {
  const provider = document.getElementById("purchase-provider").value;
  const invoiceNumber = document.getElementById("purchase-invoice-number").value;
  const total = parseFloat(document.getElementById("purchase-total").value);
  const date = document.getElementById("purchase-date").value;

  db.collection("compras").add({ provider, invoiceNumber, total, date })
    .then(() => {
      alert("✅ Compra registrada");
      document.getElementById("add-purchase-form").reset();
      loadPurchases();
    })
    .catch(err => console.error(err));
}

function loadPurchases() {
  const list = document.getElementById("purchases-list");
  list.innerHTML = "";
  db.collection("compras").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      list.innerHTML += `
        <div class="item-card">
          ${data.provider} | Factura: ${data.invoiceNumber} | Total: S/ ${data.total} | ${data.date}
          <button onclick="deletePurchase('${doc.id}')">Eliminar</button>
        </div>
      `;
    });
  });
}

function deletePurchase(id) {
  if(confirm("¿Eliminar esta compra?")) {
    db.collection("compras").doc(id).delete().then(() => loadPurchases());
  }
}

// -------- VENTAS --------
function addSale() {
  const client = document.getElementById("sale-client").value;
  const total = parseFloat(document.getElementById("sale-total").value);
  const date = document.getElementById("sale-date").value;

  db.collection("ventas").add({ client, total, date })
    .then(() => {
      alert("✅ Venta registrada");
      document.getElementById("add-sale-form").reset();
      loadSales();
    })
    .catch(err => console.error(err));
}

function loadSales() {
  const list = document.getElementById("sales-list");
  list.innerHTML = "";
  db.collection("ventas").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      list.innerHTML += `
        <div class="item-card">
          Cliente: ${data.client} | Total: S/ ${data.total} | ${data.date}
          <button onclick="deleteSale('${doc.id}')">Eliminar</button>
        </div>
      `;
    });
  });
}

function deleteSale(id) {
  if(confirm("¿Eliminar esta venta?")) {
    db.collection("ventas").doc(id).delete().then(() => loadSales());
  }
}

// -------- GASTOS --------
function addExpense() {
  const description = document.getElementById("expense-description").value;
  const type = document.getElementById("expense-type").value;
  const quantity = parseInt(document.getElementById("expense-quantity").value);
  const unitPrice = parseFloat(document.getElementById("expense-unit-price").value);
  const date = document.getElementById("expense-date").value;
  const total = quantity * unitPrice;

  db.collection("gastos").add({ description, type, quantity, unitPrice, date, total })
    .then(() => {
      alert("✅ Gasto registrado");
      document.getElementById("add-expense-form").reset();
      loadExpenses();
    })
    .catch(err => console.error(err));
}

function loadExpenses() {
  const list = document.getElementById("expenses-list");
  list.innerHTML = "";
  db.collection("gastos").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      list.innerHTML += `
        <div class="item-card">
          ${data.description} | Tipo: ${data.type} | Cant: ${data.quantity} | Total: S/ ${data.total} | ${data.date}
          <button onclick="deleteExpense('${doc.id}')">Eliminar</button>
        </div>
      `;
    });
  });
}

// -------- Inicializar Dashboard --------
function initializeDashboard() {
  loadProducts();
  loadProviders();
  loadPurchases();
  loadSales();
  loadExpenses();
  showSection("products");
}

// Cargar dashboard al abrir
window.onload = () => {
  auth.onAuthStateChanged(user => {
    if(user) {
      initializeDashboard();
    } else {
      window.location.href = "index.html";
    }
  });
};

