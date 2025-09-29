// ====== Registro ======
function register() {
  const email = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;
  const errorMessage = document.getElementById("register-error");
  const successMessage = document.getElementById("register-success");

  errorMessage.textContent = "";
  successMessage.textContent = "";

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      successMessage.textContent = "✅ Usuario registrado correctamente";
      setTimeout(() => flipCard(), 2000);

      // Guardar en Firestore
      db.collection("usuarios").doc(userCredential.user.uid).set({
        email: email,
        creado: new Date()
      });
    })
    .catch(err => errorMessage.textContent = err.message);
}

// ====== Login ======
function login() {
  const email = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const errorMessage = document.getElementById("login-error");

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "dashboard.html")
    .catch(err => errorMessage.textContent = err.message);
}

// ====== Logout ======
function logout() {
  auth.signOut().then(() => window.location.href = "index.html");
}

// ====== UI ======
function togglePasswordVisibility(fieldId, iconElement) {
  const input = document.getElementById(fieldId);
  if (input.type === "password") {
    input.type = "text";
    iconElement.classList.replace("fa-eye-slash", "fa-eye");
  } else {
    input.type = "password";
    iconElement.classList.replace("fa-eye", "fa-eye-slash");
  }
}

function showSection(section) {
  document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(section + "-section").classList.add("active");
}

// ====== Dashboard ======
function initializeDashboard() {
  if (auth.currentUser) {
    console.log("✅ Dashboard cargado para:", auth.currentUser.email);
  }
}

// ====== Productos ======
function agregarProducto() {
  const sku = document.getElementById("prod-sku").value;
  const nombre = document.getElementById("prod-nombre").value;
  const marca = document.getElementById("prod-marca").value;
  const precio = parseFloat(document.getElementById("prod-precio").value);
  const categoria = document.getElementById("prod-categoria").value;

  db.collection("productos").add({ sku, nombre, marca, precio, categoria })
    .then(() => {
      alert("Producto agregado ✅");
      mostrarProductos();
    });
}

function mostrarProductos() {
  const lista = document.getElementById("productos-list");
  lista.innerHTML = "";
  db.collection("productos").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      lista.innerHTML += `<p>SKU: ${data.sku} | Nombre: ${data.nombre} | Marca: ${data.marca} | Precio: S/${data.precio} | Categoría: ${data.categoria}</p>`;
    });
  });
}

// ====== Proveedores ======
function agregarProveedor() {
  const nombre = document.getElementById("prov-nombre").value;
  const telefono = document.getElementById("prov-telefono").value;
  const direccion = document.getElementById("prov-direccion").value;

  db.collection("proveedores").add({ nombre, telefono, direccion })
    .then(() => {
      alert("Proveedor agregado ✅");
      mostrarProveedores();
    });
}

function mostrarProveedores() {
  const lista = document.getElementById("proveedores-list");
  lista.innerHTML = "";
  db.collection("proveedores").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      lista.innerHTML += `<p>${data.nombre} | Tel: ${data.telefono} | Dirección: ${data.direccion}</p>`;
    });
  });
}

// ====== Compras ======
function registrarCompra() {
  const proveedor = document.getElementById("comp-prov").value;
  const factura = document.getElementById("comp-factura").value;
  const fecha = document.getElementById("comp-fecha").value;
  const total = parseFloat(document.getElementById("comp-total").value);

  db.collection("compras").add({ proveedor, factura, fecha, total })
    .then(() => {
      alert("Compra registrada ✅");
      mostrarCompras();
    });
}

function mostrarCompras() {
  const lista = document.getElementById("compras-list");
  lista.innerHTML = "";
  db.collection("compras").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      lista.innerHTML += `<p>Proveedor: ${data.proveedor} | Factura: ${data.factura} | Fecha: ${data.fecha} | Total: S/${data.total}</p>`;
    });
  });
}

// ====== Ventas ======
function registrarVenta() {
  const cliente = document.getElementById("vent-cliente").value;
  const total = parseFloat(document.getElementById("vent-total").value);

  db.collection("ventas").add({ cliente, total, fecha: new Date() })
    .then(() => {
      alert("Venta registrada ✅");
      mostrarVentas();
    });
}

function mostrarVentas() {
  const lista = document.getElementById("ventas-list");
  lista.innerHTML = "";
  db.collection("ventas").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      lista.innerHTML += `<p>Cliente: ${data.cliente} | Total: S/${data.total} | Fecha: ${data.fecha.toDate().toLocaleDateString()}</p>`;
    });
  });
}

// ====== Gastos ======
function registrarGasto() {
  const concepto = document.getElementById("gast-concepto").value;
  const monto = parseFloat(document.getElementById("gast-monto").value);

  db.collection("gastos").add({ concepto, monto, fecha: new Date() })
    .then(() => {
      alert("Gasto registrado ✅");
      mostrarGastos();
    });
}

function mostrarGastos() {
  const lista = document.getElementById("gastos-list");
  lista.innerHTML = "";
  db.collection("gastos").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      lista.innerHTML += `<p>Concepto: ${data.concepto} | Monto: S/${data.monto} | Fecha: ${data.fecha.toDate().toLocaleDateString()}</p>`;
    });
  });
}

// ====== Inicializar dashboard si hay sesión ======
auth.onAuthStateChanged(user => {
  if (user && window.location.pathname.includes("dashboard.html")) {
    initializeDashboard();
    mostrarProductos();
    mostrarProveedores();
    mostrarCompras();
    mostrarVentas();
    mostrarGastos();
  } else if (!user && window.location.pathname.includes("dashboard.html")) {
    window.location.href = "index.html";
  }
});


