// Navegación entre secciones
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.content-section');

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    sections.forEach(s => s.classList.remove('active'));
    document.getElementById(btn.dataset.section).classList.add('active');

    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Logout
document.querySelector('.logout-btn').addEventListener('click', () => {
  auth.signOut().then(() => window.location.href = 'index.html');
});

// Helper para actualizar conteos
function updateCounts() {
  db.collection('proveedores').get().then(snap => document.getElementById('countProveedores').textContent = snap.size);
  db.collection('facturas').get().then(snap => document.getElementById('countFacturas').textContent = snap.size);
  db.collection('gastos').get().then(snap => document.getElementById('countGastos').textContent = snap.size);
  db.collection('servicios').get().then(snap => document.getElementById('countServicios').textContent = snap.size);
}
updateCounts();

// ---------------- PROVEEDORES ----------------
const formProveedor = document.getElementById('formProveedor');
const tablaProveedores = document.getElementById('tablaProveedores');
const msgProv = document.getElementById('msgProv');

formProveedor.addEventListener('submit', async e => {
  e.preventDefault();
  const nombre = document.getElementById('nombreProv').value;
  const producto = document.getElementById('productoProv').value;
  const ruc = document.getElementById('rucProv').value;
  const direccion = document.getElementById('direccionProv').value;

  try {
    await db.collection('proveedores').add({ nombre, producto, ruc, direccion });
    formProveedor.reset();
    msgProv.textContent = '';
    updateCounts();
    loadProveedores();
  } catch(err) { msgProv.textContent = err.message; }
});

function loadProveedores() {
  tablaProveedores.innerHTML = '';
  db.collection('proveedores').get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      tablaProveedores.innerHTML += `
        <tr>
          <td>${data.nombre}</td>
          <td>${data.producto}</td>
          <td>${data.ruc}</td>
          <td>${data.direccion}</td>
          <td>
            <button class="btn btn-sm btn-danger" onclick="deleteDoc('proveedores','${doc.id}')">Eliminar</button>
          </td>
        </tr>`;
    });
  });
}

// ---------------- FACTURAS ----------------
const formFactura = document.getElementById('formFactura');
const tablaFacturas = document.getElementById('tablaFacturas');
formFactura.addEventListener('submit', async e => {
  e.preventDefault();
  const proveedor = document.getElementById('proveedorFactura').value;
  const tipo = document.getElementById('tipoFactura').value;
  const monto = parseFloat(document.getElementById('montoFactura').value);
  const fecha = document.getElementById('fechaFactura').value;
  const desc = document.getElementById('descFactura').value;

  try {
    await db.collection('facturas').add({ proveedor, tipo, monto, fecha, desc });
    formFactura.reset();
    updateCounts();
    loadFacturas();
  } catch(err) { document.getElementById('msgFactura').textContent = err.message; }
});

function loadFacturas() {
  tablaFacturas.innerHTML = '';
  db.collection('facturas').get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      tablaFacturas.innerHTML += `
        <tr>
          <td>${data.proveedor}</td>
          <td>${data.tipo}</td>
          <td>${data.monto}</td>
          <td>${data.fecha}</td>
          <td>${data.desc}</td>
          <td><button class="btn btn-sm btn-danger" onclick="deleteDoc('facturas','${doc.id}')">Eliminar</button></td>
        </tr>`;
    });
  });
}

// ---------------- GASTOS ----------------
const formGasto = document.getElementById('formGasto');
const tablaGastos = document.getElementById('tablaGastos');
formGasto.addEventListener('submit', async e => {
  e.preventDefault();
  const nombre = document.getElementById('nombreGasto').value;
  const tipo = document.getElementById('tipoGasto').value;
  const monto = parseFloat(document.getElementById('montoGasto').value);
  const fecha = document.getElementById('fechaGasto').value;

  try {
    await db.collection('gastos').add({ nombre, tipo, monto, fecha });
    formGasto.reset();
    updateCounts();
    loadGastos();
  } catch(err) { document.getElementById('msgGasto').textContent = err.message; }
});

function loadGastos() {
  tablaGastos.innerHTML = '';
  db.collection('gastos').get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      tablaGastos.innerHTML += `
        <tr>
          <td>${data.nombre}</td>
          <td>${data.tipo}</td>
          <td>${data.monto}</td>
          <td>${data.fecha}</td>
          <td><button class="btn btn-sm btn-danger" onclick="deleteDoc('gastos','${doc.id}')">Eliminar</button></td>
        </tr>`;
    });
  });
}

// ---------------- SERVICIOS ----------------
const formServicio = document.getElementById('formServicio');
const tablaServicios = document.getElementById('tablaServicios');
formServicio.addEventListener('submit', async e => {
  e.preventDefault();
  const nombre = document.getElementById('nombreServ').value;
  const precio = parseFloat(document.getElementById('precioServ').value);
  const fecha = document.getElementById('fechaServ').value;
  const desc = document.getElementById('descServ').value;

  try {
    await db.collection('servicios').add({ nombre, precio, fecha, desc });
    formServicio.reset();
    updateCounts();
    loadServicios();
  } catch(err) { document.getElementById('msgServ').textContent = err.message; }
});

function loadServicios() {
  tablaServicios.innerHTML = '';
  db.collection('servicios').get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      tablaServicios.innerHTML += `
        <tr>
          <td>${data.nombre}</td>
          <td>${data.precio}</td>
          <td>${data.fecha}</td>
          <td>${data.desc}</td>
          <td><button class="btn btn-sm btn-danger" onclick="deleteDoc('servicios','${doc.id}')">Eliminar</button></td>
        </tr>`;
    });
  });
}

// ---------------- DELETE ----------------
function deleteDoc(collection, id) {
  db.collection(collection).doc(id).delete().then(() => updateCounts());
}

// Cargar todo al iniciar
loadProveedores();
loadFacturas();
loadGastos();
loadServicios();













