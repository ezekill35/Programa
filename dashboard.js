// ---------------- Navegación ----------------
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

// ---------------- GLOBAL DELETE ----------------
window.deleteDoc = function(collection, id) {
  if(confirm("¿Seguro quieres eliminar este registro?")) {
    db.collection(collection).doc(id).delete();
  }
}

// ---------------- PROVEEDORES ----------------
const tablaProveedores = document.getElementById('tablaProveedores');
const msgProv = document.getElementById('msgProv');
const formProveedor = document.getElementById('formProveedor');
let editProveedorId = null;

formProveedor.addEventListener('submit', async e => {
  e.preventDefault();
  const ruc = document.getElementById('rucProv').value.trim();
  const nombre = document.getElementById('nombreProv').value.trim();
  const producto = document.getElementById('productoProv').value.trim();
  const direccion = document.getElementById('direccionProv').value.trim();

  if (!/^[0-9]+$/.test(ruc)) {
    msgProv.textContent = "El RUC debe contener solo números";
    return;
  }

  try {
    if(editProveedorId) {
      await db.collection('proveedores').doc(editProveedorId).update({ ruc, nombre, producto, direccion });
      editProveedorId = null;
      formProveedor.querySelector('button').textContent = "Agregar";
    } else {
      await db.collection('proveedores').add({ ruc, nombre, producto, direccion });
    }
    formProveedor.reset();
    msgProv.textContent = '';
  } catch(err) {
    msgProv.textContent = err.message;
  }
});

db.collection('proveedores').onSnapshot(snapshot => {
  tablaProveedores.innerHTML = '';
  proveedorFacturaSelect.innerHTML = '<option value="">Selecciona un proveedor</option>'; // Para facturas
  snapshot.forEach(doc => {
    const data = doc.data();

    // Tabla proveedores
    tablaProveedores.innerHTML += `
      <tr>
        <td>${data.ruc}</td>
        <td>${data.nombre}</td>
        <td>${data.producto}</td>
        <td>${data.direccion}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editProveedor('${doc.id}','${data.ruc}','${data.nombre}','${data.producto}','${data.direccion}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteDoc('proveedores','${doc.id}')">Eliminar</button>
        </td>
      </tr>`;

    // Select de proveedores para facturas
    proveedorFacturaSelect.innerHTML += `<option value="${data.nombre}">${data.nombre} (RUC: ${data.ruc})</option>`;
  });
});

function editProveedor(id, ruc, nombre, producto, direccion) {
  document.getElementById('rucProv').value = ruc;
  document.getElementById('nombreProv').value = nombre;
  document.getElementById('productoProv').value = producto;
  document.getElementById('direccionProv').value = direccion;
  editProveedorId = id;
  formProveedor.querySelector('button').textContent = "Actualizar";
}

// ---------------- FACTURAS ----------------
const tablaFacturas = document.getElementById('tablaFacturas');
const formFactura = document.getElementById('formFactura');
let editFacturaId = null;
const proveedorFacturaSelect = document.getElementById('proveedorFactura');

formFactura.addEventListener('submit', async e => {
  e.preventDefault();
  const proveedor = proveedorFacturaSelect.value;
  const tipo = document.getElementById('tipoFactura').value.trim();
  const monto = parseFloat(document.getElementById('montoFactura').value);
  const fecha = document.getElementById('fechaFactura').value;
  const desc = document.getElementById('descFactura').value.trim();

  if(!proveedor) {
    document.getElementById('msgFactura').textContent = "Selecciona un proveedor";
    return;
  }

  try {
    if(editFacturaId) {
      await db.collection('facturas').doc(editFacturaId).update({ proveedor, tipo, monto, fecha, desc });
      editFacturaId = null;
      formFactura.querySelector('button').textContent = "Agregar";
    } else {
      await db.collection('facturas').add({ proveedor, tipo, monto, fecha, desc });
    }
    formFactura.reset();
    document.getElementById('msgFactura').textContent = '';
  } catch(err) {
    document.getElementById('msgFactura').textContent = err.message;
  }
});

db.collection('facturas').onSnapshot(snapshot => {
  tablaFacturas.innerHTML = '';
  snapshot.forEach(doc => {
    const data = doc.data();
    tablaFacturas.innerHTML += `
      <tr>
        <td>${data.proveedor}</td>
        <td>${data.tipo}</td>
        <td>${data.monto}</td>
        <td>${data.fecha}</td>
        <td>${data.desc}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editFactura('${doc.id}','${data.proveedor}','${data.tipo}','${data.monto}','${data.fecha}','${data.desc}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteDoc('facturas','${doc.id}')">Eliminar</button>
        </td>
      </tr>`;
  });
});

function editFactura(id, proveedor, tipo, monto, fecha, desc) {
  proveedorFacturaSelect.value = proveedor;
  document.getElementById('tipoFactura').value = tipo;
  document.getElementById('montoFactura').value = monto;
  document.getElementById('fechaFactura').value = fecha;
  document.getElementById('descFactura').value = desc;
  editFacturaId = id;
  formFactura.querySelector('button').textContent = "Actualizar";
}

// ---------------- GASTOS ----------------
const tablaGastos = document.getElementById('tablaGastos');
const formGasto = document.getElementById('formGasto');
let editGastoId = null;

formGasto.addEventListener('submit', async e => {
  e.preventDefault();
  const nombre = document.getElementById('nombreGasto').value.trim();
  const tipo = document.getElementById('tipoGasto').value.trim();
  const monto = parseFloat(document.getElementById('montoGasto').value);
  const fecha = document.getElementById('fechaGasto').value;

  try {
    if(editGastoId) {
      await db.collection('gastos').doc(editGastoId).update({ nombre, tipo, monto, fecha });
      editGastoId = null;
      formGasto.querySelector('button').textContent = "Agregar";
    } else {
      await db.collection('gastos').add({ nombre, tipo, monto, fecha });
    }
    formGasto.reset();
    document.getElementById('msgGasto').textContent = '';
  } catch(err) {
    document.getElementById('msgGasto').textContent = err.message;
  }
});

db.collection('gastos').onSnapshot(snapshot => {
  tablaGastos.innerHTML = '';
  snapshot.forEach(doc => {
    const data = doc.data();
    tablaGastos.innerHTML += `
      <tr>
        <td>${data.nombre}</td>
        <td>${data.tipo}</td>
        <td>${data.monto}</td>
        <td>${data.fecha}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editGasto('${doc.id}','${data.nombre}','${data.tipo}','${data.monto}','${data.fecha}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteDoc('gastos','${doc.id}')">Eliminar</button>
        </td>
      </tr>`;
  });
});

function editGasto(id, nombre, tipo, monto, fecha) {
  document.getElementById('nombreGasto').value = nombre;
  document.getElementById('tipoGasto').value = tipo;
  document.getElementById('montoGasto').value = monto;
  document.getElementById('fechaGasto').value = fecha;
  editGastoId = id;
  formGasto.querySelector('button').textContent = "Actualizar";
}

// ---------------- SERVICIOS ----------------
const tablaServicios = document.getElementById('tablaServicios');
const formServicio = document.getElementById('formServicio');
let editServicioId = null;

formServicio.addEventListener('submit', async e => {
  e.preventDefault();
  const nombre = document.getElementById('nombreServ').value.trim();
  const precio = parseFloat(document.getElementById('precioServ').value);
  const fecha = document.getElementById('fechaServ').value;
  const desc = document.getElementById('descServ').value.trim();

  try {
    if(editServicioId) {
      await db.collection('servicios').doc(editServicioId).update({ nombre, precio, fecha, desc });
      editServicioId = null;
      formServicio.querySelector('button').textContent = "Agregar";
    } else {
      await db.collection('servicios').add({ nombre, precio, fecha, desc });
    }
    formServicio.reset();
    document.getElementById('msgServ').textContent = '';
  } catch(err) {
    document.getElementById('msgServ').textContent = err.message;
  }
});

db.collection('servicios').onSnapshot(snapshot => {
  tablaServicios.innerHTML = '';
  snapshot.forEach(doc => {
    const data = doc.data();
    tablaServicios.innerHTML += `
      <tr>
        <td>${data.nombre}</td>
        <td>${data.precio}</td>
        <td>${data.fecha}</td>
        <td>${data.desc}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editServicio('${doc.id}','${data.nombre}','${data.precio}','${data.fecha}','${data.desc}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteDoc('servicios','${doc.id}')">Eliminar</button>
        </td>
      </tr>`;
  });
});

function editServicio(id, nombre, precio, fecha, desc) {
  document.getElementById('nombreServ').value = nombre;
  document.getElementById('precioServ').value = precio;
  document.getElementById('fechaServ').value = fecha;
  document.getElementById('descServ').value = desc;
  editServicioId = id;
  formServicio.querySelector('button').textContent = "Actualizar";
}












