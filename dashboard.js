// Variables globales
var proveedoresCol = db.collection('proveedores');
var facturasCol = db.collection('facturas');
var gastosCol = db.collection('gastos');
var serviciosCol = db.collection('servicios');

// Formularios y tablas
var formProv = document.getElementById('formProveedor');
var tablaProv = document.getElementById('tablaProveedores');
var proveedorSelect = document.getElementById('proveedorFactura');

var formFac = document.getElementById('formFactura');
var tablaFac = document.getElementById('tablaFacturas');

var formGasto = document.getElementById('formGasto');
var tablaGasto = document.getElementById('tablaGastos');

var formServ = document.getElementById('formServicio');
var tablaServ = document.getElementById('tablaServicios');

// Logout
document.getElementById('logoutBtn').addEventListener('click', function(){
  auth.signOut().then(()=> window.location='index.html');
});

// ------------------ SIDEBAR NAV ------------------
document.querySelectorAll('.nav-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.content-section').forEach(sec=>sec.classList.remove('active'));
    document.getElementById(btn.dataset.section).classList.add('active');
  });
});

// ------------------ PROVEEDORES ------------------
formProv.addEventListener('submit', e=>{
  e.preventDefault();
  proveedoresCol.add({
    ruc: document.getElementById('rucProv').value,
    nombre: document.getElementById('nombreProv').value,
    producto: document.getElementById('productoProv').value,
    direccion: document.getElementById('direccionProv').value
  });
  formProv.reset();
});

function eliminarProv(id){ proveedoresCol.doc(id).delete(); }
function editarProv(id){
  proveedoresCol.doc(id).get().then(doc=>{
    const d = doc.data();
    document.getElementById('rucProv').value = d.ruc;
    document.getElementById('nombreProv').value = d.nombre;
    document.getElementById('productoProv').value = d.producto;
    document.getElementById('direccionProv').value = d.direccion;

    formProv.onsubmit = function(e){
      e.preventDefault();
      proveedoresCol.doc(id).update({
        ruc: document.getElementById('rucProv').value,
        nombre: document.getElementById('nombreProv').value,
        producto: document.getElementById('productoProv').value,
        direccion: document.getElementById('direccionProv').value
      });
      formProv.reset();
      formProv.onsubmit = defaultProvSubmit;
    }
  });
}

const defaultProvSubmit = formProv.onsubmit;

// Real-time snapshot proveedores
proveedoresCol.onSnapshot(snapshot=>{
  tablaProv.innerHTML='';
  proveedorSelect.innerHTML='<option value="">Seleccione proveedor</option>';
  snapshot.forEach(doc=>{
    const d = doc.data();
    tablaProv.innerHTML+=`
      <tr>
        <td>${d.ruc}</td><td>${d.nombre}</td><td>${d.producto}</td><td>${d.direccion}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editarProv('${doc.id}')">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarProv('${doc.id}')">Eliminar</button>
        </td>
      </tr>`;
    proveedorSelect.innerHTML+=`<option value="${d.nombre}">${d.nombre}</option>`;
  });
  document.getElementById('countProveedores').innerText=snapshot.size;
});

// ------------------ FACTURAS ------------------
formFac.addEventListener('submit', e=>{
  e.preventDefault();
  facturasCol.add({
    proveedor: document.getElementById('proveedorFactura').value,
    tipo: document.getElementById('tipoFactura').value,
    monto: document.getElementById('montoFactura').value,
    moneda: document.getElementById('monedaFactura').value,
    fecha: document.getElementById('fechaFactura').value,
    descripcion: document.getElementById('descFactura').value
  });
  formFac.reset();
});

function eliminarFac(id){ facturasCol.doc(id).delete(); }
function editarFac(id){
  facturasCol.doc(id).get().then(doc=>{
    const d = doc.data();
    document.getElementById('proveedorFactura').value = d.proveedor;
    document.getElementById('tipoFactura').value = d.tipo;
    document.getElementById('montoFactura').value = d.monto;
    document.getElementById('monedaFactura').value = d.moneda;
    document.getElementById('fechaFactura').value = d.fecha;
    document.getElementById('descFactura').value = d.descripcion;

    formFac.onsubmit = function(e){
      e.preventDefault();
      facturasCol.doc(id).update({
        proveedor: document.getElementById('proveedorFactura').value,
        tipo: document.getElementById('tipoFactura').value,
        monto: document.getElementById('montoFactura').value,
        moneda: document.getElementById('monedaFactura').value,
        fecha: document.getElementById('fechaFactura').value,
        descripcion: document.getElementById('descFactura').value
      });
      formFac.reset();
      formFac.onsubmit = defaultFacSubmit;
    }
  });
}

const defaultFacSubmit = formFac.onsubmit;

// Real-time snapshot facturas
facturasCol.onSnapshot(snapshot=>{
  tablaFac.innerHTML='';
  snapshot.forEach(doc=>{
    const d=doc.data();
    tablaFac.innerHTML+=`
      <tr>
        <td>${d.proveedor}</td><td>${d.tipo}</td><td>${d.monto} ${d.moneda}</td>
        <td>${d.fecha}</td><td>${d.descripcion}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editarFac('${doc.id}')">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarFac('${doc.id}')">Eliminar</button>
        </td>
      </tr>`;
  });
  document.getElementById('countFacturas').innerText=snapshot.size;
});

// ------------------ GASTOS ------------------
formGasto.addEventListener('submit', e=>{
  e.preventDefault();
  gastosCol.add({
    nombre: document.getElementById('nombreGasto').value,
    tipo: document.getElementById('tipoGasto').value,
    monto: document.getElementById('montoGasto').value,
    fecha: document.getElementById('fechaGasto').value
  });
  formGasto.reset();
});

function eliminarGasto(id){ gastosCol.doc(id).delete(); }

// Real-time snapshot gastos
gastosCol.onSnapshot(snapshot=>{
  tablaGasto.innerHTML='';
  snapshot.forEach(doc=>{
    const d=doc.data();
    tablaGasto.innerHTML+=`
      <tr>
        <td>${d.nombre}</td><td>${d.tipo}</td><td>${d.monto}</td>
        <td>${d.fecha}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="eliminarGasto('${doc.id}')">Eliminar</button>
        </td>
      </tr>`;
  });
  document.getElementById('countGastos').innerText=snapshot.size;
});

// ------------------ SERVICIOS ------------------
formServ.addEventListener('submit', e=>{
  e.preventDefault();
  serviciosCol.add({
    nombre: document.getElementById('nombreServ').value,
    precio: document.getElementById('precioServ').value,
    fecha: document.getElementById('fechaServ').value,
    descripcion: document.getElementById('descServ').value
  });
  formServ.reset();
});

function eliminarServ(id){ serviciosCol.doc(id).delete(); }

// Real-time snapshot servicios
serviciosCol.onSnapshot(snapshot=>{
  tablaServ.innerHTML='';
  snapshot.forEach(doc=>{
    const d=doc.data();
    tablaServ.innerHTML+=`
      <tr>
        <td>${d.nombre}</td><td>${d.precio}</td><td>${d.fecha}</td><td>${d.descripcion}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="eliminarServ('${doc.id}')">Eliminar</button>
        </td>
      </tr>`;
  });
  document.getElementById('countServicios').innerText=snapshot.size;
});

