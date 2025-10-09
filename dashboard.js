// -------------------- Configuración Firestore --------------------
const db = firebase.firestore();

// -------------------- Sidebar Navigation --------------------
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.content-section');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    sections.forEach(sec => sec.style.display = 'none');
    const sec = document.getElementById(btn.dataset.section);
    sec.style.display = 'block';
  });
});

// -------------------- LOGOUT --------------------
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  });
});

// -------------------- PROVEEDORES --------------------
const formProveedor = document.getElementById('formProveedor');
const tablaProveedores = document.getElementById('tablaProveedores');

function renderProveedores() {
  tablaProveedores.innerHTML = '';
  db.collection('proveedores').orderBy('rucProv').onSnapshot(snapshot => {
    snapshot.forEach(doc => {
      const p = doc.data();
      tablaProveedores.innerHTML += `
        <tr>
          <td>${p.rucProv}</td>
          <td>${p.nombreProv}</td>
          <td>${p.productoProv}</td>
          <td>${p.direccionProv}</td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="editarProveedor('${doc.id}')">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="eliminarProveedor('${doc.id}')">Eliminar</button>
          </td>
        </tr>
      `;
    });
    actualizarSelectProveedores();
  });
}

formProveedor.addEventListener('submit', e => {
  e.preventDefault();
  db.collection('proveedores').add({
    rucProv: formProveedor.rucProv.value,
    nombreProv: formProveedor.nombreProv.value,
    productoProv: formProveedor.productoProv.value,
    direccionProv: formProveedor.direccionProv.value
  });
  formProveedor.reset();
});

window.eliminarProveedor = function(id){
  db.collection('proveedores').doc(id).delete();
}

window.editarProveedor = function(id){
  const docRef = db.collection('proveedores').doc(id);
  docRef.get().then(doc => {
    const p = doc.data();
    const ruc = prompt("RUC:", p.rucProv) || p.rucProv;
    const nombre = prompt("Nombre:", p.nombreProv) || p.nombreProv;
    const producto = prompt("Producto:", p.productoProv) || p.productoProv;
    const direccion = prompt("Dirección:", p.direccionProv) || p.direccionProv;

    docRef.update({ rucProv: ruc, nombreProv: nombre, productoProv: producto, direccionProv: direccion });
  });
}

// -------------------- FACTURAS --------------------
const formFactura = document.getElementById('formFactura');
const tablaFacturas = document.getElementById('tablaFacturas');
const proveedorFactura = document.getElementById('proveedorFactura');

function actualizarSelectProveedores() {
  proveedorFactura.innerHTML = '';
  db.collection('proveedores').orderBy('nombreProv').get().then(snapshot => {
    snapshot.forEach(doc => {
      const p = doc.data();
      const option = document.createElement('option');
      option.value = p.nombreProv;
      option.textContent = `${p.nombreProv} (${p.rucProv})`;
      proveedorFactura.appendChild(option);
    });
  });
}

function renderFacturas() {
  tablaFacturas.innerHTML = '';
  db.collection('facturas').onSnapshot(snapshot => {
    snapshot.forEach(doc => {
      const f = doc.data();
      tablaFacturas.innerHTML += `
        <tr>
          <td>${f.proveedorFactura}</td>
          <td>${f.tipoFactura}</td>
          <td>${f.montoFactura} ${f.monedaFactura}</td>
          <td>${f.fechaFactura}</td>
          <td>${f.descFactura}</td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="editarFactura('${doc.id}')">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="eliminarFactura('${doc.id}')">Eliminar</button>
          </td>
        </tr>
      `;
    });
  });
}

formFactura.addEventListener('submit', e => {
  e.preventDefault();
  db.collection('facturas').add({
    proveedorFactura: formFactura.proveedorFactura.value,
    tipoFactura: formFactura.tipoFactura.value,
    montoFactura: formFactura.montoFactura.value,
    monedaFactura: formFactura.monedaFactura.value,
    fechaFactura: formFactura.fechaFactura.value,
    descFactura: formFactura.descFactura.value
  });
  formFactura.reset();
});

window.eliminarFactura = function(id) { db.collection('facturas').doc(id).delete(); }
window.editarFactura = function(id) {
  const docRef = db.collection('facturas').doc(id);
  docRef.get().then(doc => {
    const f = doc.data();
    const proveedor = prompt("Proveedor:", f.proveedorFactura) || f.proveedorFactura;
    const tipo = prompt("Tipo:", f.tipoFactura) || f.tipoFactura;
    const monto = prompt("Monto:", f.montoFactura) || f.montoFactura;
    const moneda = prompt("Moneda:", f.monedaFactura) || f.monedaFactura;
    const fecha = prompt("Fecha:", f.fechaFactura) || f.fechaFactura;
    const desc = prompt("Descripción:", f.descFactura) || f.descFactura;

    docRef.update({ proveedorFactura: proveedor, tipoFactura: tipo, montoFactura: monto, monedaFactura: moneda, fechaFactura: fecha, descFactura: desc });
  });
}

// -------------------- GASTOS --------------------
const formGasto = document.getElementById('formGasto');
const tablaGastos = document.getElementById('tablaGastos');

formGasto.addEventListener('submit', e => {
  e.preventDefault();
  db.collection('gastos').add({
    nombreGasto: formGasto.nombreGasto.value,
    tipoGasto: formGasto.tipoGasto.value,
    montoGasto: formGasto.montoGasto.value,
    fechaGasto: formGasto.fechaGasto.value
  });
  formGasto.reset();
});

function renderGastos() {
  tablaGastos.innerHTML = '';
  db.collection('gastos').onSnapshot(snapshot => {
    snapshot.forEach(doc => {
      const g = doc.data();
      tablaGastos.innerHTML += `
        <tr>
          <td>${g.nombreGasto}</td>
          <td>${g.tipoGasto}</td>
          <td>${g.montoGasto}</td>
          <td>${g.fechaGasto}</td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="editarGasto('${doc.id}')">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="eliminarGasto('${doc.id}')">Eliminar</button>
          </td>
        </tr>
      `;
    });
  });
}

window.eliminarGasto = id => db.collection('gastos').doc(id).delete();
window.editarGasto = id => {
  const docRef = db.collection('gastos').doc(id);
  docRef.get().then(doc => {
    const g = doc.data();
    const nombre = prompt("Nombre:", g.nombreGasto) || g.nombreGasto;
    const tipo = prompt("Tipo:", g.tipoGasto) || g.tipoGasto;
    const monto = prompt("Monto:", g.montoGasto) || g.montoGasto;
    const fecha = prompt("Fecha:", g.fechaGasto) || g.fechaGasto;
    docRef.update({ nombreGasto: nombre, tipoGasto: tipo, montoGasto: monto, fechaGasto: fecha });
  });
}

// -------------------- SERVICIOS --------------------
const formServicio = document.getElementById('formServicio');
const tablaServicios = document.getElementById('tablaServicios');

formServicio.addEventListener('submit', e => {
  e.preventDefault();
  db.collection('servicios').add({
    nombreServ: formServicio.nombreServ.value,
    precioServ: formServicio.precioServ.value,
    fechaServ: formServicio.fechaServ.value,
    descServ: formServicio.descServ.value
  });
  formServicio.reset();
});

function renderServicios() {
  tablaServicios.innerHTML = '';
  db.collection('servicios').onSnapshot(snapshot => {
    snapshot.forEach(doc => {
      const s = doc.data();
      tablaServicios.innerHTML += `
        <tr>
          <td>${s.nombreServ}</td>
          <td>${s.precioServ}</td>
          <td>${s.fechaServ}</td>
          <td>${s.descServ}</td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="editarServicio('${doc.id}')">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="eliminarServicio('${doc.id}')">Eliminar</button>
          </td>
        </tr>
      `;
    });
  });
}

window.eliminarServicio = id => db.collection('servicios').doc(id).delete();
window.editarServicio = id => {
  const docRef = db.collection('servicios').doc(id);
  docRef.get().then(doc => {
    const s = doc.data();
    const nombre = prompt("Nombre:", s.nombreServ) || s.nombreServ;
    const precio = prompt("Precio:", s.precioServ) || s.precioServ;
    const fecha = prompt("Fecha:", s.fechaServ) || s.fechaServ;
    const desc = prompt("Descripción:", s.descServ) || s.descServ;
    docRef.update({ nombreServ: nombre, precioServ: precio, fechaServ: fecha, descServ: desc });
  });
}

// -------------------- Inicialización --------------------
document.addEventListener('DOMContentLoaded', () => {
  renderProveedores();
  renderFacturas();
  renderGastos();
  renderServicios();
});


