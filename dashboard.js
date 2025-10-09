// Asegúrate de que firebase.js ya está cargado
const proveedoresCol = db.collection('proveedores');
const facturasCol = db.collection('facturas');
const gastosCol = db.collection('gastos');
const serviciosCol = db.collection('servicios');

// -------------------- NAVEGACIÓN --------------------
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.content-section').forEach(sec => sec.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(btn.dataset.section).style.display = 'block';
    btn.classList.add('active');
  });
});

// -------------------- LOGOUT --------------------
document.getElementById('logoutBtn').addEventListener('click', () => {
  auth.signOut().then(() => window.location = 'index.html');
});

// -------------------- PROVEEDORES --------------------
const formProv = document.getElementById('formProveedor');
const tablaProv = document.getElementById('tablaProveedores');

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

// Render proveedores en tiempo real
proveedoresCol.onSnapshot(snapshot => {
  tablaProv.innerHTML = '';
  const selectProv = document.getElementById('proveedorFactura');
  selectProv.innerHTML = '<option value="">Seleccione proveedor</option>';
  snapshot.forEach(doc => {
    const data = doc.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${data.ruc}</td>
      <td>${data.nombre}</td>
      <td>${data.producto}</td>
      <td>${data.direccion}</td>
      <td>
        <button class="btn btn-sm btn-warning editProv" data-id="${doc.id}">Editar</button>
        <button class="btn btn-sm btn-danger delProv" data-id="${doc.id}">Eliminar</button>
      </td>`;
    tablaProv.appendChild(tr);

    // Agregar a select de facturas
    selectProv.innerHTML += `<option value="${doc.id}">${data.nombre}</option>`;
  });
  document.getElementById('countProveedores').innerText = snapshot.size;

  // Editar
  document.querySelectorAll('.editProv').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      proveedoresCol.doc(id).get().then(doc => {
        const data = doc.data();
        document.getElementById('rucProv').value = data.ruc;
        document.getElementById('nombreProv').value = data.nombre;
        document.getElementById('productoProv').value = data.producto;
        document.getElementById('direccionProv').value = data.direccion;

        formProv.onsubmit = ev => {
          ev.preventDefault();
          proveedoresCol.doc(id).update({
            ruc: document.getElementById('rucProv').value,
            nombre: document.getElementById('nombreProv').value,
            producto: document.getElementById('productoProv').value,
            direccion: document.getElementById('direccionProv').value
          });
          formProv.reset();
          formProv.onsubmit = null;
        };
      });
    };
  });

  // Eliminar
  document.querySelectorAll('.delProv').forEach(btn => {
    btn.onclick = () => proveedoresCol.doc(btn.dataset.id).delete();
  });
});

// -------------------- FACTURAS --------------------
const formFac = document.getElementById('formFactura');
const tablaFac = document.getElementById('tablaFacturas');

formFac.addEventListener('submit', e => {
  e.preventDefault();
  const provId = document.getElementById('proveedorFactura').value;
  proveedoresCol.doc(provId).get().then(docProv => {
    const provData = docProv.data();
    facturasCol.add({
      proveedorId: provId,
      proveedorNombre: provData.nombre,
      tipo: document.getElementById('tipoFactura').value,
      monto: parseFloat(document.getElementById('montoFactura').value),
      moneda: document.getElementById('monedaFactura').value,
      fecha: document.getElementById('fechaFactura').value,
      descripcion: document.getElementById('descFactura').value
    });
    formFac.reset();
  });
});

// Render facturas en tiempo real
facturasCol.onSnapshot(snapshot => {
  tablaFac.innerHTML = '';
  snapshot.forEach(doc => {
    const data = doc.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${data.proveedorNombre}</td>
      <td>${data.tipo}</td>
      <td>${data.monto} ${data.moneda}</td>
      <td>${data.fecha}</td>
      <td>${data.descripcion}</td>
      <td>
        <button class="btn btn-sm btn-warning editFac" data-id="${doc.id}">Editar</button>
        <button class="btn btn-sm btn-danger delFac" data-id="${doc.id}">Eliminar</button>
      </td>`;
    tablaFac.appendChild(tr);
  });
  document.getElementById('countFacturas').innerText = snapshot.size;

  // Editar y eliminar
  document.querySelectorAll('.editFac').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      facturasCol.doc(id).get().then(doc => {
        const data = doc.data();
        document.getElementById('proveedorFactura').value = data.proveedorId;
        document.getElementById('tipoFactura').value = data.tipo;
        document.getElementById('montoFactura').value = data.monto;
        document.getElementById('monedaFactura').value = data.moneda;
        document.getElementById('fechaFactura').value = data.fecha;
        document.getElementById('descFactura').value = data.descripcion;

        formFac.onsubmit = ev => {
          ev.preventDefault();
          facturasCol.doc(id).update({
            proveedorId: document.getElementById('proveedorFactura').value,
            tipo: document.getElementById('tipoFactura').value,
            monto: parseFloat(document.getElementById('montoFactura').value),
            moneda: document.getElementById('monedaFactura').value,
            fecha: document.getElementById('fechaFactura').value,
            descripcion: document.getElementById('descFactura').value
          });
          formFac.reset();
          formFac.onsubmit = null;
        };
      });
    };
  });

  document.querySelectorAll('.delFac').forEach(btn => {
    btn.onclick = () => facturasCol.doc(btn.dataset.id).delete();
  });
});

// -------------------- GASTOS --------------------
const formGas = document.getElementById('formGasto');
const tablaGas = document.getElementById('tablaGastos');

formGas.addEventListener('submit', e => {
  e.preventDefault();
  gastosCol.add({
    nombre: document.getElementById('nombreGasto').value,
    tipo: document.getElementById('tipoGasto').value,
    monto: parseFloat(document.getElementById('montoGasto').value),
    fecha: document.getElementById('fechaGasto').value
  });
  formGas.reset();
});

gastosCol.onSnapshot(snapshot => {
  tablaGas.innerHTML = '';
  snapshot.forEach(doc => {
    const data = doc.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.tipo}</td>
      <td>${data.monto}</td>
      <td>${data.fecha}</td>
      <td>
        <button class="btn btn-sm btn-warning editGas" data-id="${doc.id}">Editar</button>
        <button class="btn btn-sm btn-danger delGas" data-id="${doc.id}">Eliminar</button>
      </td>`;
    tablaGas.appendChild(tr);
  });
  document.getElementById('countGastos').innerText = snapshot.size;

  document.querySelectorAll('.editGas').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      gastosCol.doc(id).get().then(doc => {
        const data = doc.data();
        document.getElementById('nombreGasto').value = data.nombre;
        document.getElementById('tipoGasto').value = data.tipo;
        document.getElementById('montoGasto').value = data.monto;
        document.getElementById('fechaGasto').value = data.fecha;

        formGas.onsubmit = ev => {
          ev.preventDefault();
          gastosCol.doc(id).update({
            nombre: document.getElementById('nombreGasto').value,
            tipo: document.getElementById('tipoGasto').value,
            monto: parseFloat(document.getElementById('montoGasto').value),
            fecha: document.getElementById('fechaGasto').value
          });
          formGas.reset();
          formGas.onsubmit = null;
        };
      });
    };
  });

  document.querySelectorAll('.delGas').forEach(btn => gastosCol.doc(btn.dataset.id).delete());
});

// -------------------- SERVICIOS --------------------
const formServ = document.getElementById('formServicio');
const tablaServ = document.getElementById('tablaServicios');

formServ.addEventListener('submit', e => {
  e.preventDefault();
  serviciosCol.add({
    nombre: document.getElementById('nombreServ').value,
    precio: parseFloat(document.getElementById('precioServ').value),
    fecha: document.getElementById('fechaServ').value,
    descripcion: document.getElementById('descServ').value
  });
  formServ.reset();
});

serviciosCol.onSnapshot(snapshot => {
  tablaServ.innerHTML = '';
  snapshot.forEach(doc => {
    const data = doc.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.precio}</td>
      <td>${data.fecha}</td>
      <td>${data.descripcion}</td>
      <td>
        <button class="btn btn-sm btn-warning editServ" data-id="${doc.id}">Editar</button>
        <button class="btn btn-sm btn-danger delServ" data-id="${doc.id}">Eliminar</button>
      </td>`;
    tablaServ.appendChild(tr);
  });
  document.getElementById('countServicios').innerText = snapshot.size;

  document.querySelectorAll('.editServ').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      serviciosCol.doc(id).get().then(doc => {
        const data = doc.data();
        document.getElementById('nombreServ').value = data.nombre;
        document.getElementById('precioServ').value = data.precio;
        document.getElementById('fechaServ').value = data.fecha;
        document.getElementById('descServ').value = data.descripcion;

        formServ.onsubmit = ev => {
          ev.preventDefault();
          serviciosCol.doc(id).update({
            nombre: document.getElementById('nombreServ').value,
            precio: parseFloat(document.getElementById('precioServ').value),
            fecha: document.getElementById('fechaServ').value,
            descripcion: document.getElementById('descServ').value
          });
          formServ.reset();
          formServ.onsubmit = null;
        };
      });
    };
  });

  document.querySelectorAll('.delServ').forEach(btn => serviciosCol.doc(btn.dataset.id).delete());
});
