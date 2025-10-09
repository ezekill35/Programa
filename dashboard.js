const db = firebase.firestore();

// Colecciones
const proveedoresCol = db.collection('proveedores');
const facturasCol = db.collection('facturas');
const gastosCol = db.collection('gastos');
const serviciosCol = db.collection('servicios');

// Elementos
const tablaProv = document.getElementById('tablaProveedores');
const tablaFac = document.getElementById('tablaFacturas');
const tablaGasto = document.getElementById('tablaGastos');
const tablaServ = document.getElementById('tablaServicios');

const formProv = document.getElementById('formProveedor');
const formFac = document.getElementById('formFactura');
const formGasto = document.getElementById('formGasto');
const formServ = document.getElementById('formServicio');

const proveedorSelect = document.getElementById('proveedorFactura');

// ---------------- Funciones ----------------
function cargarProveedoresSelect(){
  proveedorSelect.innerHTML = '<option value="">Seleccione proveedor</option>';
  proveedoresCol.get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const option = document.createElement('option');
      option.value = doc.id;
      option.textContent = `${data.ruc} - ${data.nombre}`;
      proveedorSelect.appendChild(option);
    });
  });
}

// Actualizar select en tiempo real
cargarProveedoresSelect();
proveedoresCol.onSnapshot(() => cargarProveedoresSelect());

// ---------------- CRUD Proveedores ----------------
formProv.addEventListener('submit', e => {
  e.preventDefault();
  proveedoresCol.add({
    ruc: formProv.rucProv.value,
    nombre: formProv.nombreProv.value,
    producto: formProv.productoProv.value,
    direccion: formProv.direccionProv.value
  });
  formProv.reset();
});

proveedoresCol.onSnapshot(snapshot => {
  tablaProv.innerHTML = '';
  snapshot.forEach(doc => {
    const data = doc.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${data.ruc}</td>
      <td>${data.nombre}</td>
      <td>${data.producto}</td>
      <td>${data.direccion}</td>
      <td>
        <button class="btn btn-warning editProv">Editar</button>
        <button class="btn btn-danger delProv">Eliminar</button>
      </td>`;
    tablaProv.appendChild(tr);

    tr.querySelector('.delProv').addEventListener('click', () => proveedoresCol.doc(doc.id).delete());
  });
});

// ---------------- CRUD Facturas ----------------
formFac.addEventListener('submit', e => {
  e.preventDefault();
  const proveedorId = proveedorSelect.value;
  if(!proveedorId){ alert("Seleccione proveedor"); return; }

  facturasCol.add({
    proveedor: proveedorId,
    tipo: formFac.tipoFactura.value,
    monto: parseFloat(formFac.montoFactura.value),
    moneda: document.getElementById('monedaFactura').value,
    fecha: formFac.fechaFactura.value,
    descripcion: formFac.descFactura.value
  });
  formFac.reset();
});

facturasCol.onSnapshot(snapshot => {
  tablaFac.innerHTML = '';
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    proveedoresCol.doc(data.proveedor).get().then(provDoc => {
      const provNombre = provDoc.exists ? provDoc.data().nombre : "Desconocido";
      const provRuc = provDoc.exists ? provDoc.data().ruc : "--";

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${provRuc} - ${provNombre}</td>
        <td>${data.tipo}</td>
        <td>${data.monto.toLocaleString('es-PE',{style:'currency', currency:data.moneda})}</td>
        <td>${data.fecha}</td>
        <td>${data.descripcion}</td>
        <td>
          <button class="btn btn-warning editFac">Editar</button>
          <button class="btn btn-danger delFac">Eliminar</button>
        </td>`;
      tablaFac.appendChild(tr);

      tr.querySelector('.delFac').addEventListener('click', () => facturasCol.doc(docSnap.id).delete());
    });
  });
});

// ---------------- CRUD Gastos ----------------
formGasto.addEventListener('submit', e => {
  e.preventDefault();
  gastosCol.add({
    nombre: formGasto.nombreGasto.value,
    tipo: formGasto.tipoGasto.value,
    monto: parseFloat(formGasto.montoGasto.value),
    fecha: formGasto.fechaGasto.value
  });
  formGasto.reset();
});

gastosCol.onSnapshot(snapshot => {
  tablaGasto.innerHTML = '';
  snapshot.forEach(doc => {
    const data = doc.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.tipo}</td>
      <td>${data.monto}</td>
      <td>${data.fecha}</td>
      <td>
        <button class="btn btn-warning editGasto">Editar</button>
        <button class="btn btn-danger delGasto">Eliminar</button>
      </td>`;
    tablaGasto.appendChild(tr);
    tr.querySelector('.delGasto').addEventListener('click', () => gastosCol.doc(doc.id).delete());
  });
});

// ---------------- CRUD Servicios ----------------
formServ.addEventListener('submit', e => {
  e.preventDefault();
  serviciosCol.add({
    nombre: formServ.nombreServ.value,
    precio: parseFloat(formServ.precioServ.value),
    fecha: formServ.fechaServ.value,
    descripcion: formServ.descServ.value
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
        <button class="btn btn-warning editServ">Editar</button>
        <button class="btn btn-danger delServ">Eliminar</button>
      </td>`;
    tablaServ.appendChild(tr);
    tr.querySelector('.delServ').addEventListener('click', () => serviciosCol.doc(doc.id).delete());
  });
});


