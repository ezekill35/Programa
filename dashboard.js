// ------------------ Configuración Firebase ------------------
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:xxxxxxxxxxxxxx"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ------------------ Helpers ------------------
const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => document.querySelectorAll(selector);

// ------------------ Sidebar Tabs ------------------
qsa(".menu-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    qsa(".menu-btn").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    const target = btn.dataset.target;
    qsa(".seccion").forEach(sec => sec.classList.remove("activa"));
    qs(`#${target}`).classList.add("activa");
  });
});

// ------------------ Proveedores ------------------
const proveedorForm = qs("#proveedorForm");
const tablaProveedores = qs("#tablaProveedores");

const renderProveedores = (snapshot) => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach(doc => {
    const data = doc.data();
    tablaProveedores.innerHTML += `
      <tr>
        <td>${data.ruc}</td>
        <td>${data.nombre}</td>
        <td>${data.direccion || ""}</td>
        <td>${data.telefono || ""}</td>
        <td>
          <button class="btn secondary" onclick="eliminarProveedor('${doc.id}')">Eliminar</button>
        </td>
      </tr>`;
  });
};

proveedorForm.addEventListener("submit", e => {
  e.preventDefault();
  const ruc = qs("#rucProveedor").value.trim();
  const nombre = qs("#nombreProveedor").value.trim();
  const direccion = qs("#direccionProveedor").value.trim();
  const telefono = qs("#telefonoProveedor").value.trim();

  if (!ruc || !nombre) return alert("RUC y Nombre son obligatorios");

  db.collection("proveedores").add({ ruc, nombre, direccion, telefono })
    .then(() => proveedorForm.reset());
});

const eliminarProveedor = (id) => db.collection("proveedores").doc(id).delete();

// Real-time listener
db.collection("proveedores").orderBy("nombre").onSnapshot(renderProveedores);

// ------------------ Productos ------------------
const productoForm = qs("#productoForm");
const tablaProductos = qs("#tablaProductos");
const categoriaProducto = qs("#categoriaProducto");

const renderProductos = (snapshot) => {
  tablaProductos.innerHTML = "";
  snapshot.forEach(doc => {
    const data = doc.data();
    tablaProductos.innerHTML += `
      <tr>
        <td>${data.nombre}</td>
        <td>${data.cantidad || ""}</td>
        <td>${data.unidad || ""}</td>
        <td>${data.valorUnitario || ""}</td>
        <td>${data.descripcion || ""}</td>
        <td>${data.categoria || ""}</td>
        <td>
          <button class="btn secondary" onclick="eliminarProducto('${doc.id}')">Eliminar</button>
        </td>
      </tr>`;
  });
};

productoForm.addEventListener("submit", e => {
  e.preventDefault();
  const nombre = qs("#nombreProducto").value.trim();
  const cantidad = qs("#cantidadProducto").value.trim();
  const unidad = qs("#unidadProducto").value.trim();
  const valorUnitario = qs("#valorUnitarioProducto").value.trim();
  const descripcion = qs("#descripcionProducto").value.trim();
  const categoria = categoriaProducto.value;

  if (!nombre) return alert("Nombre es obligatorio");

  db.collection("productos").add({ nombre, cantidad, unidad, valorUnitario, descripcion, categoria })
    .then(() => productoForm.reset());
});

const eliminarProducto = (id) => db.collection("productos").doc(id).delete();

// Real-time listener
db.collection("productos").orderBy("nombre").onSnapshot(renderProductos);

// ------------------ Facturas ------------------
const facturaForm = qs("#facturaForm");
const tablaFacturas = qs("#tablaFacturas");
const proveedorFactura = qs("#proveedorFactura");
const productoFactura = qs("#productoFactura");

// Llenar select proveedores
db.collection("proveedores").orderBy("nombre").onSnapshot(snapshot => {
  proveedorFactura.innerHTML = `<option value="">Seleccione proveedor</option>`;
  snapshot.forEach(doc => {
    proveedorFactura.innerHTML += `<option value="${doc.id}">${doc.data().nombre}</option>`;
  });
});

// Llenar select productos
db.collection("productos").orderBy("nombre").onSnapshot(snapshot => {
  productoFactura.innerHTML = `<option value="">Seleccione producto</option>`;
  snapshot.forEach(doc => {
    productoFactura.innerHTML += `<option value="${doc.id}">${doc.data().nombre}</option>`;
  });
});

// Render facturas
const renderFacturas = (snapshot) => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(doc => {
    const f = doc.data();
    tablaFacturas.innerHTML += `
      <tr>
        <td>${doc.id}</td>
        <td>${f.numeroFactura || ""}</td>
        <td>${f.proveedorNombre || ""}</td>
        <td>${f.productoNombre || ""}</td>
        <td>${f.monto ? f.moneda+f.monto : ""}</td>
        <td>${f.tipo}</td>
        <td>${f.fechaEmision || ""}</td>
        <td>
          <button class="btn secondary" onclick="eliminarFactura('${doc.id}')">Eliminar</button>
        </td>
      </tr>`;
  });
};

facturaForm.addEventListener("submit", async e => {
  e.preventDefault();
  const numeroFactura = qs("#numeroFactura").value.trim();
  const fechaEmision = qs("#fechaEmisionFactura").value;
  const proveedorId = proveedorFactura.value;
  const productoId = productoFactura.value;
  const monto = qs("#montoFactura").value.trim();
  const moneda = qs("#monedaFactura").value;
  const tipo = qs("#tipoFactura").value;

  if (!proveedorId || !productoId) return alert("Debe seleccionar proveedor y producto");

  // Obtener nombres para mostrar
  const provDoc = await db.collection("proveedores").doc(proveedorId).get();
  const prodDoc = await db.collection("productos").doc(productoId).get();

  db.collection("facturas").add({
    numeroFactura,
    fechaEmision,
    proveedorId,
    proveedorNombre: provDoc.data().nombre,
    productoId,
    productoNombre: prodDoc.data().nombre,
    monto,
    moneda,
    tipo
  }).then(() => facturaForm.reset());
});

const eliminarFactura = (id) => db.collection("facturas").doc(id).delete();

// Real-time listener
db.collection("facturas").orderBy("fechaEmision", "desc").onSnapshot(renderFacturas);

// ------------------ Búsqueda Facturas ------------------
const buscadorFactura = qs("#buscadorFactura");
const btnRefresh = qs("#btnRefresh");

buscadorFactura.addEventListener("keypress", async e => {
  if (e.key === "Enter") {
    e.preventDefault();
    const queryText = buscadorFactura.value.trim().toLowerCase();
    if (!queryText) return;
    const snapshot = await db.collection("facturas").get();
    const filtered = snapshot.docs.filter(doc => doc.data().productoNombre.toLowerCase().includes(queryText));
    renderFacturas({ forEach: (cb) => filtered.forEach(cb) });
  }
});

btnRefresh.addEventListener("click", () => {
  buscadorFactura.value = "";
  db.collection("facturas").orderBy("fechaEmision", "desc").get().then(renderFacturas);
});

// ------------------ Logout ------------------
qs("#logoutBtn").addEventListener("click", () => {
  firebase.auth().signOut().then(() => location.href = "login.html");
});





