document.addEventListener('DOMContentLoaded', () => {
  // Redirigir si no hay usuario logueado
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'index.html';
    }
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    auth.signOut().then(() => window.location.href = 'index.html');
  });

  // Navegación de secciones
  const navBtns = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.content-section');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.section;
      sections.forEach(sec => sec.classList.remove('active'));
      document.getElementById(target).classList.add('active');
    });
  });

  // --- PROVEEDORES ---
  const formProv = document.getElementById('formProveedor');
  const tablaProveedores = document.getElementById('tablaProveedores');

  formProv.addEventListener('submit', e => {
    e.preventDefault();
    const ruc = document.getElementById('rucProv').value;
    const nombre = document.getElementById('nombreProv').value;
    const producto = document.getElementById('productoProv').value;
    const direccion = document.getElementById('direccionProv').value;

    db.collection('proveedores').add({ ruc, nombre, producto, direccion });
    formProv.reset();
  });

  function renderProveedor(doc) {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', doc.id);
    tr.innerHTML = `
      <td>${doc.data().ruc}</td>
      <td>${doc.data().nombre}</td>
      <td>${doc.data().producto}</td>
      <td>${doc.data().direccion}</td>
      <td>
        <button class="btn btn-warning btn-edit">Editar</button>
        <button class="btn btn-danger btn-delete">Eliminar</button>
      </td>
    `;
    tablaProveedores.appendChild(tr);

    // Eliminar
    tr.querySelector('.btn-delete').addEventListener('click', () => {
      db.collection('proveedores').doc(doc.id).delete();
    });

    // Editar
    tr.querySelector('.btn-edit').addEventListener('click', () => {
      const ruc = prompt('RUC:', doc.data().ruc);
      const nombre = prompt('Nombre:', doc.data().nombre);
      const producto = prompt('Producto:', doc.data().producto);
      const direccion = prompt('Dirección:', doc.data().direccion);
      db.collection('proveedores').doc(doc.id).update({ ruc, nombre, producto, direccion });
    });
  }

  db.collection('proveedores').onSnapshot(snapshot => {
    tablaProveedores.innerHTML = '';
    snapshot.forEach(doc => renderProveedor(doc));
    document.getElementById('countProveedores').innerText = snapshot.size;

    // Actualizar select de proveedores en facturas
    const provSelect = document.getElementById('proveedorFactura');
    provSelect.innerHTML = '<option value="">Seleccione proveedor</option>';
    snapshot.forEach(doc => {
      const opt = document.createElement('option');
      opt.value = doc.data().nombre;
      opt.textContent = doc.data().nombre;
      provSelect.appendChild(opt);
    });
  });

  // --- FACTURAS ---
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

    db.collection('facturas').add({ proveedor, tipo, monto, moneda, fecha, desc });
    formFactura.reset();
  });

  function renderFactura(doc) {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', doc.id);
    tr.innerHTML = `
      <td>${doc.data().proveedor}</td>
      <td>${doc.data().tipo}</td>
      <td>${doc.data().moneda} ${doc.data().monto}</td>
      <td>${doc.data().fecha}</td>
      <td>${doc.data().desc}</td>
      <td>
        <button class="btn btn-warning btn-edit">Editar</button>
        <button class="btn btn-danger btn-delete">Eliminar</button>
      </td>
    `;
    tablaFacturas.appendChild(tr);

    tr.querySelector('.btn-delete').addEventListener('click', () => {
      db.collection('facturas').doc(doc.id).delete();
    });

    tr.querySelector('.btn-edit').addEventListener('click', () => {
      const proveedor = prompt('Proveedor:', doc.data().proveedor);
      const tipo = prompt('Tipo:', doc.data().tipo);
      const monto = prompt('Monto:', doc.data().monto);
      const moneda = prompt('Moneda:', doc.data().moneda);
      const fecha = prompt('Fecha:', doc.data().fecha);
      const desc = prompt('Descripción:', doc.data().desc);
      db.collection('facturas').doc(doc.id).update({ proveedor, tipo, monto, moneda, fecha, desc });
    });
  }

  db.collection('facturas').onSnapshot(snapshot => {
    tablaFacturas.innerHTML = '';
    snapshot.forEach(doc => renderFactura(doc));
    document.getElementById('countFacturas').innerText = snapshot.size;
  });

  // --- GASTOS ---
  const formGasto = document.getElementById('formGasto');
  const tablaGastos = document.getElementById('tablaGastos');

  formGasto.addEventListener('submit', e => {
    e.preventDefault();
    const nombre = document.getElementById('nombreGasto').value;
    const tipo = document.getElementById('tipoGasto').value;
    const monto = document.getElementById('montoGasto').value;
    const fecha = document.getElementById('fechaGasto').value;

    db.collection('gastos').add({ nombre, tipo, monto, fecha });
    formGasto.reset();
  });

  function renderGasto(doc) {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', doc.id);
    tr.innerHTML = `
      <td>${doc.data().nombre}</td>
      <td>${doc.data().tipo}</td>
      <td>${doc.data().monto}</td>
      <td>${doc.data().fecha}</td>
      <td>
        <button class="btn btn-warning btn-edit">Editar</button>
        <button class="btn btn-danger btn-delete">Eliminar</button>
      </td>
    `;
    tablaGastos.appendChild(tr);

    tr.querySelector('.btn-delete').addEventListener('click', () => {
      db.collection('gastos').doc(doc.id).delete();
    });

    tr.querySelector('.btn-edit').addEventListener('click', () => {
      const nombre = prompt('Nombre:', doc.data().nombre);
      const tipo = prompt('Tipo:', doc.data().tipo);
      const monto = prompt('Monto:', doc.data().monto);
      const fecha = prompt('Fecha:', doc.data().fecha);
      db.collection('gastos').doc(doc.id).update({ nombre, tipo, monto, fecha });
    });
  }

  db.collection('gastos').onSnapshot(snapshot => {
    tablaGastos.innerHTML = '';
    snapshot.forEach(doc => renderGasto(doc));
    document.getElementById('countGastos').innerText = snapshot.size;
  });

  // --- SERVICIOS ---
  const formServ = document.getElementById('formServicio');
  const tablaServicios = document.getElementById('tablaServicios');

  formServ.addEventListener('submit', e => {
    e.preventDefault();
    const nombre = document.getElementById('nombreServ').value;
    const precio = document.getElementById('precioServ').value;
    const fecha = document.getElementById('fechaServ').value;
    const desc = document.getElementById('descServ').value;

    db.collection('servicios').add({ nombre, precio, fecha, desc });
    formServ.reset();
  });

  function renderServicios(doc) {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', doc.id);
    tr.innerHTML = `
      <td>${doc.data().nombre}</td>
      <td>${doc.data().precio}</td>
      <td>${doc.data().fecha}</td>
      <td>${doc.data().desc}</td>
      <td>
        <button class="btn btn-warning btn-edit">Editar</button>
        <button class="btn btn-danger btn-delete">Eliminar</button>
      </td>
    `;
    tablaServicios.appendChild(tr);

    tr.querySelector('.btn-delete').addEventListener('click', () => {
      db.collection('servicios').doc(doc.id).delete();
    });

    tr.querySelector('.btn-edit').addEventListener('click', () => {
      const nombre = prompt("Nombre:", doc.data().nombre);
      const precio = prompt("Precio:", doc.data().precio);
      const fecha = prompt("Fecha:", doc.data().fecha);
      const desc = prompt("Descripción:", doc.data().desc);
      db.collection('servicios').doc(doc.id).update({ nombre, precio, fecha, desc });
    });
  }

  db.collection('servicios').onSnapshot(snapshot => {
    tablaServicios.innerHTML = '';
    snapshot.forEach(doc => renderServicios(doc));
    document.getElementById('countServicios').innerText = snapshot.size;
  });
});

