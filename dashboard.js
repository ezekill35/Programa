// Variables
const sections = document.querySelectorAll('.content-section');
const navButtons = document.querySelectorAll('.nav-btn');
const logoutBtn = document.querySelector('.logout-btn');

// Cambiar sección
navButtons.forEach(btn=>{
  btn.addEventListener('click',()=>{
    sections.forEach(sec=>sec.classList.add('d-none'));
    document.getElementById(btn.dataset.section).classList.remove('d-none');
    navButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Logout
logoutBtn.addEventListener('click',()=>{
  auth.signOut().then(()=> window.location.href="index.html");
});

// Función actualizar select proveedores en facturas
function updateProveedorSelect() {
  const select = document.getElementById('proveedorFactura');
  select.innerHTML = '<option value="">Seleccione proveedor</option>';
  db.collection('proveedores').get().then(snapshot=>{
    snapshot.forEach(doc=>{
      const data = doc.data();
      const option = document.createElement('option');
      option.value = doc.id;
      option.text = `${data.nombre} (${data.ruc})`;
      select.appendChild(option);
    });
  });
}

// CRUD Proveedores
const tablaProveedores = document.getElementById('tablaProveedores');
db.collection('proveedores').onSnapshot(snapshot=>{
  tablaProveedores.innerHTML = '';
  let count = 0;
  snapshot.forEach(doc=>{
    const data = doc.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${data.ruc}</td>
      <td>${data.nombre}</td>
      <td>${data.producto}</td>
      <td>${data.direccion}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editProveedor('${doc.id}')">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="deleteProveedor('${doc.id}')">Eliminar</button>
      </td>`;
    tablaProveedores.appendChild(tr);
    count++;
  });
  document.getElementById('countProveedores').innerText = count;
  updateProveedorSelect();
});

// Agregar proveedor
document.getElementById('formProveedor').addEventListener('submit',e=>{
  e.preventDefault();
  db.collection('proveedores').add({
    ruc: document.getElementById('rucProv').value,
    nombre: document.getElementById('nombreProv').value,
    producto: document.getElementById('productoProv').value,
    direccion: document.getElementById('direccionProv').value
  });
  e.target.reset();
});

// Editar / eliminar
window.editProveedor = function(id){
  db.collection('proveedores').doc(id).get().then(doc=>{
    const data = doc.data();
    document.getElementById('rucProv').value = data.ruc;
    document.getElementById('nombreProv').value = data.nombre;
    document.getElementById('productoProv').value = data.producto;
    document.getElementById('direccionProv').value = data.direccion;

    // Cambiar submit para actualizar
    const form = document.getElementById('formProveedor');
    form.removeEventListener('submit', submitAgregar);
    form.addEventListener('submit', function submitActualizar(e){
      e.preventDefault();
      db.collection('proveedores').doc(id).update({
        ruc: document.getElementById('rucProv').value,
        nombre: document.getElementById('nombreProv').value,
        producto: document.getElementById('productoProv').value,
        direccion: document.getElementById('direccionProv').value
      });
      e.target.reset();
      form.removeEventListener('submit', submitActualizar);
      form.addEventListener('submit', submitAgregar);
    });
  });
}

window.deleteProveedor = function(id){
  if(confirm('¿Eliminar proveedor?')){
    db.collection('proveedores').doc(id).delete();
  }
}

// Mantengo referencia del submit original
const submitAgregar = e=>{
  e.preventDefault();
  db.collection('proveedores').add({
    ruc: document.getElementById('rucProv').value,
    nombre: document.getElementById('nombreProv').value,
    producto: document.getElementById('productoProv').value,
    direccion: document.getElementById('direccionProv').value
  });
  e.target.reset();
}
document.getElementById('formProveedor').addEventListener('submit', submitAgregar);

// CRUD Facturas (similar a proveedores)
const tablaFacturas = document.getElementById('tablaFacturas');
db.collection('facturas').onSnapshot(snapshot=>{
  tablaFacturas.innerHTML = '';
  let count = 0;
  snapshot.forEach(doc=>{
    const f = doc.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${f.proveedorNombre || ''}</td>
      <td>${f.tipo}</td>
      <td>${f.monto} ${f.moneda}</td>
      <td>${f.fecha}</td>
      <td>${f.descripcion}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteFactura('${doc.id}')">Eliminar</button>
      </td>`;
    tablaFacturas.appendChild(tr);
    count++;
  });
  document.getElementById('countFacturas').innerText = count;
});

// Agregar factura
document.getElementById('formFactura').addEventListener('submit', e=>{
  e.preventDefault();
  const proveedorId = document.getElementById('proveedorFactura').value;
  db.collection('proveedores').doc(proveedorId).get().then(doc=>{
    const proveedorNombre = doc.data().nombre;
    db.collection('facturas').add({
      proveedorId,
      proveedorNombre,
      tipo: document.getElementById('tipoFactura').value,
      monto: document.getElementById('montoFactura').value,
      moneda: document.getElementById('monedaFactura').value,
      fecha: document.getElementById('fechaFactura').value,
      descripcion: document.getElementById('descFactura').value
    });
    e.target.reset();
  });
});

window.deleteFactura = function(id){
  if(confirm('¿Eliminar factura?')){
    db.collection('facturas').doc(id).delete();
  }
}


