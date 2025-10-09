// Referencias a Firebase
const proveedoresCol = db.collection('proveedores');
const facturasCol = db.collection('facturas');
const gastosCol = db.collection('gastos');
const serviciosCol = db.collection('servicios');

// ------------------ Función para cambiar secciones ------------------
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.content-section');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    sections.forEach(s => s.style.display = 'none');
    navBtns.forEach(b => b.classList.remove('active'));
    document.getElementById(btn.dataset.section).style.display = 'block';
    btn.classList.add('active');
  });
});

// ------------------ Logout ------------------
document.getElementById('logoutBtn').addEventListener('click', () => {
  auth.signOut().then(() => window.location.href = 'index.html');
});

// ------------------ PROVEEDORES ------------------
const formProveedor = document.getElementById('formProveedor');
const tablaProveedores = document.getElementById('tablaProveedores');
const proveedorFacturaSelect = document.getElementById('proveedorFactura');

formProveedor.addEventListener('submit', e => {
  e.preventDefault();
  const ruc = document.getElementById('rucProv').value;
  const nombre = document.getElementById('nombreProv').value;
  const producto = document.getElementById('productoProv').value;
  const direccion = document.getElementById('direccionProv').value;

  proveedoresCol.add({ ruc, nombre, producto, direccion });
  formProveedor.reset();
});

// Escuchar proveedores en tiempo real
proveedoresCol.onSnapshot(snapshot => {
  tablaProveedores.innerHTML = '';
  proveedorFacturaSelect.innerHTML = '<option value="">Seleccione proveedor</option>';
  snapshot.forEach(doc => {
    const data = doc.data();
    tablaProveedores.innerHTML += `
      <tr>
        <td>${data.ruc}</td>
        <td>${data.nombre}</td>
        <td>${data.producto}</td>
        <td>${data.direccion}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editProveedor('${doc.id}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteProveedor('${doc.id}')">Eliminar</button>
        </td>
      </tr>
    `;
    proveedorFacturaSelect.innerHTML += `<option value="${doc.id}">${data.nombre}</option>`;
  });
});

// Editar y eliminar
window.editProveedor = id => {
  proveedoresCol.doc(id).get().then(doc => {
    const data = doc.data();
    document.getElementById('rucProv').value = data.ruc;
    document.getElementById('nombreProv').value = data.nombre;
    document.getElementById('productoProv').value = data.producto;
    document.getElementById('direccionProv').value = data.direccion;

    formProveedor.onsubmit = e => {
      e.preventDefault();
      proveedoresCol.doc(id).update({
        ruc: document.getElementById('rucProv').value,
        nombre: document.getElementById('nombreProv').value,
        producto: document.getElementById('productoProv').value,
        direccion: document.getElementById('direccionProv').value
      });
      formProveedor.reset();
      formProveedor.onsubmit = defaultProveedorSubmit;
    };
  });
};

window.deleteProveedor = id => proveedoresCol.doc(id).delete();

// Guardar función original
const defaultProveedorSubmit = formProveedor.onsubmit;

// ------------------ FACTURAS ------------------
const formFactura = document.getElementById('formFactura');
const tablaFacturas = document.getElementById('tablaFacturas');

formFactura.addEventListener('submit', e => {
  e.preventDefault();
  const proveedor = document.getElementById('proveedorFactura').value;
  const tipo = document.getElementById('tipoFactura').value;
  const monto = document.getElementById('montoFactura').value;
  const moneda = document.getElementById('monedaFactura').value;
  const fecha = document.getElementById('fechaFactura').value;
  const desc = document.getElementById('descFactura').value;

  facturasCol.add({ proveedor, tipo, monto, moneda, fecha, desc });
  formFactura.reset();
});

facturasCol.onSnapshot(snapshot => {
  tablaFacturas.innerHTML = '';
  snapshot.forEach(doc => {
    const data = doc.data();
    const provNombre = proveedorFacturaSelect.querySelector(`option[value="${data.proveedor}"]`)?.text || 'Sin proveedor';
    tablaFacturas.innerHTML += `
      <tr>
        <td>${provNombre}</td>
        <td>${data.tipo}</td>
        <td>${data.monto} ${data.moneda}</td>
        <td>${data.fecha}</td>
        <td>${data.desc}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editFactura('${doc.id}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteFactura('${doc.id}')">Eliminar</button>
        </td>
      </tr>
    `;
  });
});

// Editar y eliminar facturas
window.editFactura = id => {
  facturasCol.doc(id).get().then(doc => {
    const data = doc.data();
    document.getElementById('proveedorFactura').value = data.proveedor;
    document.getElementById('tipoFactura').value = data.tipo;
    document.getElementById('montoFactura').value = data.monto;
    document.getElementById('monedaFactura').value = data.moneda;
    document.getElementById('fechaFactura').value = data.fecha;
    document.getElementById('descFactura').value = data.desc;

    formFactura.onsubmit = e => {
      e.preventDefault();
      facturasCol.doc(id).update({
        proveedor: document.getElementById('proveedorFactura').value,
        tipo: document.getElementById('tipoFactura').value,
        monto: document.getElementById('montoFactura').value,
        moneda: document.getElementById('monedaFactura').value,
        fecha: document.getElementById('fechaFactura').value,
        desc: document.getElementById('descFactura').value
      });
      formFactura.reset();
      formFactura.onsubmit = defaultFacturaSubmit;
    };
  });
};

window.deleteFactura = id => facturasCol.doc(id).delete();
const defaultFacturaSubmit = formFactura.onsubmit;

// ------------------ GASTOS ------------------
const formGasto = document.getElementById('formGasto');
const tablaGastos = document.getElementById('tablaGastos');

formGasto.addEventListener('submit', e => {
  e.preventDefault();
  const nombre = document.getElementById('nombreGasto').value;
  const tipo = document.getElementById('tipoGasto').value;
  const monto = document.getElementById('montoGasto').value;
  const fecha = document.getElementById('fechaGasto').value;

  gastosCol.add({ nombre, tipo, monto, fecha });
  formGasto.reset();
});

gastosCol.onSnapshot(snapshot => {
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
          <button class="btn btn-sm btn-warning" onclick="editGasto('${doc.id}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteGasto('${doc.id}')">Eliminar</button>
        </td>
      </tr>
    `;
  });
});

window.editGasto = id => {
  gastosCol.doc(id).get().then(doc => {
    const data = doc.data();
    document.getElementById('nombreGasto').value = data.nombre;
    document.getElementById('tipoGasto').value = data.tipo;
    document.getElementById('montoGasto').value = data.monto;
    document.getElementById('fechaGasto').value = data.fecha;

    formGasto.onsubmit = e => {
      e.preventDefault();
      gastosCol.doc(id).update({
        nombre: document.getElementById('nombreGasto').value,
        tipo: document.getElementById('tipoGasto').value,
        monto: document.getElementById('montoGasto').value,
        fecha: document.getElementById('fechaGasto').value
      });
      formGasto.reset();
      formGasto.onsubmit = defaultGastoSubmit;
    };
  });
};

window.deleteGasto = id => gastosCol.doc(id).delete();
const defaultGastoSubmit = formGasto.onsubmit;

// ------------------ SERVICIOS ------------------
const formServicio = document.getElementById('formServicio');
const tablaServicios = document.getElementById('tablaServicios');

formServicio.addEventListener('submit', e => {
  e.preventDefault();
  const nombre = document.getElementById('nombreServ').value;
  const precio = document.getElementById('precioServ').value;
  const fecha = document.getElementById('fechaServ').value;
  const desc = document.getElementById('descServ').value;

  serviciosCol.add({ nombre, precio, fecha, desc });
  formServicio.reset();
});

serviciosCol.onSnapshot(snapshot => {
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
          <button class="btn btn-sm btn-warning" onclick="editServicio('${doc.id}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteServicio('${doc.id}')">Eliminar</button>
        </td>
      </tr>
    `;
  });
});

window.editServicio = id => {
  serviciosCol.doc(id).get().then(doc => {
    const data = doc.data();
    document.getElementById('nombreServ').value = data.nombre;
    document.getElementById('precioServ').value = data.precio;
    document.getElementById('fechaServ').value = data.fecha;
    document.getElementById('descServ').value = data.desc;

    formServicio.onsubmit = e => {
      e.preventDefault();
      serviciosCol.doc(id).update({
        nombre: document.getElementById('nombreServ').value,
        precio: document.getElementById('precioServ').value,
        fecha: document.getElementById('fechaServ').value,
        desc: document.getElementById('descServ').value
      });
      formServicio.reset();
      formServicio.onsubmit = defaultServicioSubmit;
    };
  });
};

window.deleteServicio = id => serviciosCol.doc(id).delete();
const defaultServicioSubmit = formServicio.onsubmit;


