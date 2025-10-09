// Inicializar Firebase
var firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322",
  measurementId: "G-0WMLRY8FGM"
};
firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();
var db = firebase.firestore();

// ---------------- Navegación entre secciones ----------------
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.content-section');
navBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    navBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    sections.forEach(s=>s.style.display='none');
    document.getElementById(btn.dataset.section).style.display='block';
  });
});

// ---------------- Cerrar sesión ----------------
document.getElementById('logoutBtn').addEventListener('click', ()=>{
  auth.signOut().then(()=> window.location.href='index.html');
});

// ------------------ CRUD Proveedores ------------------
const proveedoresCol = db.collection('proveedores');
const formProv = document.getElementById('formProveedor');
const tablaProv = document.getElementById('tablaProveedores');
const proveedorSelect = document.getElementById('proveedorFactura');

formProv.addEventListener('submit', e=>{
  e.preventDefault();
  proveedoresCol.add({
    nombre: formProv.nombreProv.value,
    producto: formProv.productoProv.value,
    ruc: formProv.rucProv.value,
    direccion: formProv.direccionProv.value
  });
  formProv.reset();
});

// Actualizar tabla y select en tiempo real
proveedoresCol.onSnapshot(snapshot=>{
  tablaProv.innerHTML='';
  proveedorSelect.innerHTML='<option value="">Seleccione proveedor</option>';
  snapshot.forEach(docu=>{
    const data = docu.data();
    const tr = document.createElement('tr');
    tr.innerHTML=`
      <td>${data.nombre}</td>
      <td>${data.producto}</td>
      <td>${data.ruc}</td>
      <td>${data.direccion}</td>
      <td>
        <button class="btn btn-sm btn-warning editProv">Editar</button>
        <button class="btn btn-sm btn-danger delProv">Eliminar</button>
      </td>`;
    tablaProv.appendChild(tr);

    // Select proveedores para facturas
    const option = document.createElement('option');
    option.value = docu.id;
    option.textContent = data.nombre;
    proveedorSelect.appendChild(option);

    tr.querySelector('.delProv').addEventListener('click', ()=> proveedoresCol.doc(docu.id).delete());
    tr.querySelector('.editProv').addEventListener('click', ()=>{
      const newNombre = prompt("Nombre:", data.nombre);
      const newProducto = prompt("Producto:", data.producto);
      const newRuc = prompt("RUC:", data.ruc);
      const newDireccion = prompt("Dirección:", data.direccion);
      if(newNombre && newProducto && newRuc && newDireccion){
        proveedoresCol.doc(docu.id).update({nombre:newNombre, producto:newProducto, ruc:newRuc, direccion:newDireccion});
      }
    });
  });
});

// ------------------ CRUD Facturas ------------------
const facturasCol = db.collection('facturas');
const formFactura = document.getElementById('formFactura');
const tablaFactura = document.getElementById('tablaFacturas');

formFactura.addEventListener('submit', e=>{
  e.preventDefault();
  facturasCol.add({
    proveedor: proveedorSelect.value,
    tipo: formFactura.tipoFactura.value,
    monto: parseFloat(formFactura.montoFactura.value),
    fecha: formFactura.fechaFactura.value,
    descripcion: formFactura.descFactura.value
  });
  formFactura.reset();
});

facturasCol.onSnapshot(snapshot=>{
  tablaFactura.innerHTML='';
  snapshot.forEach(docu=>{
    const data = docu.data();
    const proveedorNombre = proveedorSelect.querySelector(`option[value="${data.proveedor}"]`)?.textContent || "Desconocido";
    const tr = document.createElement('tr');
    tr.innerHTML=`
      <td>${proveedorNombre}</td>
      <td>${data.tipo}</td>
      <td>${data.monto}</td>
      <td>${data.fecha}</td>
      <td>${data.descripcion}</td>
      <td>
        <button class="btn btn-sm btn-warning editFac">Editar</button>
        <button class="btn btn-sm btn-danger delFac">Eliminar</button>
      </td>`;
    tablaFactura.appendChild(tr);

    tr.querySelector('.delFac').addEventListener('click', ()=> facturasCol.doc(docu.id).delete());
    tr.querySelector('.editFac').addEventListener('click', ()=>{
      const newTipo = prompt("Tipo:", data.tipo);
      const newMonto = prompt("Monto:", data.monto);
      const newFecha = prompt("Fecha:", data.fecha);
      const newDesc = prompt("Descripción:", data.descripcion);
      const newProveedor = prompt("Proveedor (ID):", data.proveedor);
      if(newTipo && newMonto && newFecha && newDesc && newProveedor){
        facturasCol.doc(docu.id).update({
          tipo:newTipo,
          monto:parseFloat(newMonto),
          fecha:newFecha,
          descripcion:newDesc,
          proveedor:newProveedor
        });
      }
    });
  });
});

// ------------------ CRUD Gastos ------------------
const gastosCol = db.collection('gastos');
const formGasto = document.getElementById('formGasto');
const tablaGasto = document.getElementById('tablaGastos');

formGasto.addEventListener('submit', e=>{
  e.preventDefault();
  gastosCol.add({
    nombre: formGasto.nombreGasto.value,
    tipo: formGasto.tipoGasto.value,
    monto: parseFloat(formGasto.montoGasto.value),
    fecha: formGasto.fechaGasto.value
  });
  formGasto.reset();
});

gastosCol.onSnapshot(snapshot=>{
  tablaGasto.innerHTML='';
  snapshot.forEach(docu=>{
    const data = docu.data();
    const tr = document.createElement('tr');
    tr.innerHTML=`
      <td>${data.nombre}</td>
      <td>${data.tipo}</td>
      <td>${data.monto}</td>
      <td>${data.fecha}</td>
      <td>
        <button class="btn btn-sm btn-warning editGasto">Editar</button>
        <button class="btn btn-sm btn-danger delGasto">Eliminar</button>
      </td>`;
    tablaGasto.appendChild(tr);

    tr.querySelector('.delGasto').addEventListener('click', ()=> gastosCol.doc(docu.id).delete());
    tr.querySelector('.editGasto').addEventListener('click', ()=>{
      const newNombre = prompt("Nombre:", data.nombre);
      const newTipo = prompt("Tipo:", data.tipo);
      const newMonto = prompt("Monto:", data.monto);
      const newFecha = prompt("Fecha:", data.fecha);
      if(newNombre && newTipo && newMonto && newFecha){
        gastosCol.doc(docu.id).update({nombre:newNombre,tipo:newTipo,monto:parseFloat(newMonto),fecha:newFecha});
      }
    });
  });
});

// ------------------ CRUD Servicios ------------------
const serviciosCol = db.collection('servicios');
const formServ = document.getElementById('formServicio');
const tablaServ = document.getElementById('tablaServicios');

formServ.addEventListener('submit', e=>{
  e.preventDefault();
  serviciosCol.add({
    nombre: formServ.nombreServ.value,
    precio: parseFloat(formServ.precioServ.value),
    fecha: formServ.fechaServ.value,
    descripcion: formServ.descServ.value
  });
  formServ.reset();
});

serviciosCol.onSnapshot(snapshot=>{
  tablaServ.innerHTML='';
  snapshot.forEach(docu=>{
    const data = docu.data();
    const tr = document.createElement('tr');
    tr.innerHTML=`
      <td>${data.nombre}</td>
      <td>${data.precio}</td>
      <td>${data.fecha}</td>
      <td>${data.descripcion}</td>
      <td>
        <button class="btn btn-sm btn-warning editServ">Editar</button>
        <button class="btn btn-sm btn-danger delServ">Eliminar</button>
      </td>`;
    tablaServ.appendChild(tr);

    tr.querySelector('.delServ').addEventListener('click', ()=> serviciosCol.doc(docu.id).delete());
    tr.querySelector('.editServ').addEventListener('click', ()=>{
      const newNombre = prompt("Nombre:", data.nombre);
      const newPrecio = prompt("Precio:", data.precio);
      const newFecha = prompt("Fecha:", data.fecha);
      const newDesc = prompt("Descripción:", data.descripcion);
      if(newNombre && newPrecio && newFecha && newDesc){
        serviciosCol.doc(docu.id).update({nombre:newNombre,precio:parseFloat(newPrecio),fecha:newFecha,descripcion:newDesc});
      }
    });
  });
});

// ------------------ Reportes ------------------
const countProveedores = document.getElementById('countProveedores');
const countFacturas = document.getElementById('countFacturas');
const countGastos = document.getElementById('countGastos');
const countServicios = document.getElementById('countServicios');

proveedoresCol.onSnapshot(snap=>countProveedores.textContent = snap.size);
facturasCol.onSnapshot(snap=>countFacturas.textContent = snap.size);
gastosCol.onSnapshot(snap=>countGastos.textContent = snap.size);
serviciosCol.onSnapshot(snap=>countServicios.textContent = snap.size);







