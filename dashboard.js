// ---------------- FIRESTORE ----------------
const db = firebase.firestore();

// ---------------- COLECCIONES ----------------
const proveedoresCol = db.collection('proveedores');
const facturasCol = db.collection('facturas');
const gastosCol = db.collection('gastos');
const serviciosCol = db.collection('servicios');

// ---------------- ELEMENTOS ----------------
const tablaProv = document.getElementById('tablaProveedores');
const tablaFac = document.getElementById('tablaFacturas');
const tablaGasto = document.getElementById('tablaGastos');
const tablaServ = document.getElementById('tablaServicios');

const formProv = document.getElementById('formProveedor');
const formFac = document.getElementById('formFactura');
const formGasto = document.getElementById('formGasto');
const formServ = document.getElementById('formServicio');

const proveedorSelect = document.getElementById('proveedorFactura');

// ---------------- FUNCIONES ----------------
function cargarProveedoresSelect() {
  proveedorSelect.innerHTML = '<option value="">Seleccione proveedor</option>';
  proveedoresCol.get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const option = document.createElement('option');
      option.value = doc.id; // ID del proveedor
      option.textContent = `${data.nombre} (${data.ruc})`; // Mostrar nombre + RUC
      proveedorSelect.appendChild(option);
    });
  });
}

// ---------------- CARGAR PROVEEDORES EN SELECT EN TIEMPO REAL ----------------
proveedoresCol.onSnapshot(() => {
  cargarProveedoresSelect();
});

// ---------------- CRUD PROVEEDORES ----------------
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
        <button class="btn btn-sm btn-warning editProv">Editar</button>
        <button class="btn btn-sm btn-danger delProv">Eliminar</button>
      </td>`;
    tablaProv.appendChild(tr);

    tr.querySelector('.delProv').addEventListener('click', () => proveedoresCol.doc(doc.id).delete());
    tr.querySelector('.editProv').addEventListener('click', () => {
      const r = prompt("RUC:", data.ruc);
      const n = prompt("Nombre:", data.nombre);
      const p = prompt("Producto:", data.producto);
      const d = prompt("Dirección:", data.direccion);
      if (r && n && p && d) proveedoresCol.doc(doc.id).update({ ruc: r, nombre: n, producto: p, direccion: d });
    });
  });
});

// ---------------- CRUD FACTURAS ----------------
formFac.addEventListener('submit', e => {
  e.preventDefault();
  const proveedorId = proveedorSelect.value;
  if(!proveedorId){ alert("Seleccione un proveedor"); return; }

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
        <td>${provNombre} (${provRuc})</td>
        <td>${data.tipo}</td>
        <td>${data.monto.toLocaleString('es-PE',{style:'currency', currency:data.moneda})}</td>
        <td>${data.fecha}</td>
        <td>${data.descripcion}</td>
        <td>
          <button class="btn btn-sm btn-warning editFac">Editar</button>
          <button class="btn btn-sm btn-danger delFac">Eliminar</button>
        </td>`;
      tablaFac.appendChild(tr);

      tr.querySelector('.delFac').addEventListener('click', () => facturasCol.doc(docSnap.id).delete());
      tr.querySelector('.editFac').addEventListener('click', () => {
        const t = prompt("Tipo:", data.tipo);
        const m = prompt("Monto:", data.monto);
        const mon = prompt("Moneda (PEN/USD):", data.moneda);
        const f = prompt("Fecha:", data.fecha);
        const d = prompt("Descripción:", data.descripcion);
        const pId = prompt("Proveedor ID:", data.proveedor);
        if(t && m && f && d && pId && mon){
          facturasCol.doc(docSnap.id).update({ tipo:t, monto:parseFloat(m), moneda:mon, fecha:f, descripcion:d, proveedor:pId });
        }
      });
    });
  });
});

// ---------------- CRUD GASTOS ----------------
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
      <td>${data.monto.toLocaleString('es-PE',{style:'currency', currency:'PEN'})}</td>
      <td>${data.fecha}</td>
      <td>
        <button class="btn btn-sm btn-warning editGasto">Editar</button>
        <button class="btn btn-sm btn-danger delGasto">Eliminar</button>
      </td>`;
    tablaGasto.appendChild(tr);

    tr.querySelector('.delGasto').addEventListener('click', () => gastosCol.doc(doc.id).delete());
    tr.querySelector('.editGasto').addEventListener('click', () => {
      const n = prompt("Nombre:", data.nombre);
      const t = prompt("Tipo:", data.tipo);
      const m = prompt("Monto:", data.monto);
      const f = prompt("Fecha:", data.fecha);
      if(n && t && m && f) gastosCol.doc(doc.id).update({ nombre:n, tipo:t, monto:parseFloat(m), fecha:f });
    });
  });
});

// ---------------- CRUD SERVICIOS ----------------
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
      <td>${data.precio.toLocaleString('es-PE',{style:'currency',currency:'PEN'})}</td>
      <td>${data.fecha}</td>
      <td>${data.descripcion}</td>
      <td>
        <button class="btn btn-sm btn-warning editServ">Editar</button>
        <button class="btn btn-sm btn-danger delServ">Eliminar</button>
      </td>`;
    tablaServ.appendChild(tr);

    tr.querySelector('.delServ').addEventListener('click', () => serviciosCol.doc(doc.id).delete());
    tr.querySelector('.editServ').addEventListener('click', () => {
      const n = prompt("Nombre:", data.nombre);
      const p = prompt("Precio:", data.precio);
      const f = prompt("Fecha:", data.fecha);
      const d = prompt("Descripción:", data.descripcion);
      if(n && p && f && d) serviciosCol.doc(doc.id).update({ nombre:n, precio:parseFloat(p), fecha:f, descripcion:d });
    });
  });
});

// ---------------- CONTADORES ----------------
function actualizarContadores(){
  proveedoresCol.get().then(s=> document.getElementById('countProveedores').textContent = s.size);
  facturasCol.get().then(s=> document.getElementById('countFacturas').textContent = s.size);
  gastosCol.get().then(s=> document.getElementById('countGastos').textContent = s.size);
  serviciosCol.get().then(s=> document.getElementById('countServicios').textContent = s.size);
}
setInterval(actualizarContadores, 1000);

