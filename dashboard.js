// Firebase
const proveedoresCol = db.collection('proveedores');
const facturasCol = db.collection('facturas');
const gastosCol = db.collection('gastos');
const serviciosCol = db.collection('servicios');

// Elements
const tablaProv = document.getElementById('tablaProveedores');
const tablaFac = document.getElementById('tablaFacturas');
const tablaGasto = document.getElementById('tablaGastos');
const tablaServ = document.getElementById('tablaServicios');

const formProv = document.getElementById('formProveedor');
const formFac = document.getElementById('formFactura');
const formGasto = document.getElementById('formGasto');
const formServ = document.getElementById('formServicio');

const proveedorSelect = document.getElementById('proveedorFactura');

// ---------------- Sidebar navigation ----------------
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.content-section');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    sections.forEach(sec => sec.style.display='none');
    navBtns.forEach(b => b.classList.remove('active'));
    document.getElementById(btn.dataset.section).style.display='block';
    btn.classList.add('active');
  });
});

// ---------------- Logout ----------------
document.getElementById('logoutBtn').addEventListener('click', () => {
  firebase.auth().signOut().then(()=> window.location='index.html');
});

// ---------------- Real-time render ----------------

// Proveedores
proveedoresCol.onSnapshot(snapshot => {
  tablaProv.innerHTML = '';
  proveedorSelect.innerHTML = '<option value="">Seleccione proveedor</option>';
  snapshot.forEach(doc => {
    const data = doc.data();
    // Tabla
    tablaProv.innerHTML += `<tr>
      <td>${data.ruc}</td>
      <td>${data.nombre}</td>
      <td>${data.producto}</td>
      <td>${data.direccion}</td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="editarProv('${doc.id}')">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="eliminarProv('${doc.id}')">Eliminar</button>
      </td>
    </tr>`;
    // Select para facturas
    proveedorSelect.innerHTML += `<option value="${data.nombre}">${data.nombre}</option>`;
  });
  document.getElementById('countProveedores').innerText = snapshot.size;
});

// Facturas
facturasCol.onSnapshot(snapshot => {
  tablaFac.innerHTML = '';
  snapshot.forEach(doc => {
    const data = doc.data();
    tablaFac.innerHTML += `<tr>
      <td>${data.proveedor}</td>
      <td>${data.tipo}</td>
      <td>${data.monto} ${data.moneda}</td>
      <td>${data.fecha}</td>
      <td>${data.descripcion}</td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="editarFac('${doc.id}')">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="eliminarFac('${doc.id}')">Eliminar</button>
      </td>
    </tr>`;
  });
  document.getElementById('countFacturas').innerText = snapshot.size;
});

// Gastos
gastosCol.onSnapshot(snapshot => {
  tablaGasto.innerHTML = '';
  snapshot.forEach(doc => {
    const data = doc.data();
    tablaGasto.innerHTML += `<tr>
      <td>${data.nombre}</td>
      <td>${data.tipo}</td>
      <td>${data.monto}</td>
      <td>${data.fecha}</td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="editarGasto('${doc.id}')">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="eliminarGasto('${doc.id}')">Eliminar</button>
      </td>
    </tr>`;
  });
  document.getElementById('countGastos').innerText = snapshot.size;
});

// Servicios
serviciosCol.onSnapshot(snapshot => {
  tablaServ.innerHTML = '';
  snapshot.forEach(doc => {
    const data = doc.data();
    tablaServ.innerHTML += `<tr>
      <td>${data.nombre}</td>
      <td>${data.precio}</td>
      <td>${data.fecha}</td>
      <td>${data.descripcion}</td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="editarServ('${doc.id}')">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="eliminarServ('${doc.id}')">Eliminar</button>
      </td>
    </tr>`;
  });
  document.getElementById('countServicios').innerText = snapshot.size;
});

// ---------------- Form submissions ----------------

// Proveedor
formProv.addEventListener('submit', e => {
  e.preventDefault();
  proveedoresCol.add({
    ruc: document.getElementById('rucProv').value,
    nombre: document.getElementById('nombreProv').value,
    producto: document.getElementById('productoProv').value,
    direccion: document.getElementById('direccionProv').value
  });
  formProv.reset();
});

// Factura
formFac.addEventListener('submit', e => {
  e.preventDefault();
  facturasCol.add({
    proveedor: proveedorSelect.value,
    tipo: document.getElementById('tipoFactura').value,
    monto: document.getElementById('montoFactura').value,
    moneda: document.getElementById('monedaFactura').value,
    fecha: document.getElementById('fechaFactura').value,
    descripcion: document.getElementById('descFactura').value
  });
  formFac.reset();
});

// Gasto
formGasto.addEventListener('submit', e => {
  e.preventDefault();
  gastosCol.add({
    nombre: document.getElementById('nombreGasto').value,
    tipo: document.getElementById('tipoGasto').value,
    monto: document.getElementById('montoGasto').value,
    fecha: document.getElementById('fechaGasto').value
  });
  formGasto.reset();
});

// Servicio
formServ.addEventListener('submit', e => {
  e.preventDefault();
  serviciosCol.add({
    nombre: document.getElementById('nombreServ').value,
    precio: document.getElementById('precioServ').value,
    fecha: document.getElementById('fechaServ').value,
    descripcion: document.getElementById('descServ').value
  });
  formServ.reset();
});

// ---------------- Eliminar ----------------
function eliminarProv(id){ proveedoresCol.doc(id).delete(); }
function eliminarFac(id){ facturasCol.doc(id).delete(); }
function eliminarGasto(id){ gastosCol.doc(id).delete(); }
function eliminarServ(id){ serviciosCol.doc(id).delete(); }

// ---------------- Editar ----------------
// Para simplificar, edición básica usando prompt
function editarProv(id){
  const docRef = proveedoresCol.doc(id);
  docRef.get().then(doc => {
    if(doc.exists){
      const ruc = prompt('RUC', doc.data().ruc);
      const nombre = prompt('Nombre', doc.data().nombre);
      const producto = prompt('Producto', doc.data().producto);
      const direccion = prompt('Dirección', doc.data().direccion);
      docRef.update({ ruc, nombre, producto, direccion });
    }
  });
}

function editarFac(id){
  const docRef = facturasCol.doc(id);
  docRef.get().then(doc => {
    if(doc.exists){
      const proveedor = prompt('Proveedor', doc.data().proveedor);
      const tipo = prompt('Tipo', doc.data().tipo);
      const monto = prompt('Monto', doc.data().monto);
      const moneda = prompt('Moneda', doc.data().moneda);
      const fecha = prompt('Fecha', doc.data().fecha);
      const descripcion = prompt('Descripción', doc.data().descripcion);
      docRef.update({ proveedor, tipo, monto, moneda, fecha, descripcion });
    }
  });
}

function editarGasto(id){
  const docRef = gastosCol.doc(id);
  docRef.get().then(doc => {
    if(doc.exists){
      const nombre = prompt('Nombre', doc.data().nombre);
      const tipo = prompt('Tipo', doc.data().tipo);
      const monto = prompt('Monto', doc.data().monto);
      const fecha = prompt('Fecha', doc.data().fecha);
      docRef.update({ nombre, tipo, monto, fecha });
    }
  });
}

function editarServ(id){
  const docRef = serviciosCol.doc(id);
  docRef.get().then(doc => {
    if(doc.exists){
      const nombre = prompt('Nombre', doc.data().nombre);
      const precio = prompt('Precio', doc.data().precio);
      const fecha = prompt('Fecha', doc.data().fecha);
      const descripcion = prompt('Descripción', doc.data().descripcion);
      docRef.update({ nombre, precio, fecha, descripcion });
    }
  });
}


