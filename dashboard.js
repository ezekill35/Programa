// Inicializar Firebase
var firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322"
};
firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();
var db = firebase.firestore();

// Redirigir si no está logueado
auth.onAuthStateChanged(user=>{
  if(!user) window.location.href="index.html";
});

// Cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", ()=>{
  auth.signOut().then(()=> window.location.href="index.html");
});

// Navegación
document.querySelectorAll('.nav-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.content-section').forEach(s=>s.classList.remove('active'));
    document.getElementById(btn.dataset.section).classList.add('active');
  });
});

// ------------------ CRUD PROVEEDORES ------------------
var proveedoresCol = db.collection('proveedores');
var tablaProv = document.getElementById('tablaProveedores');
var formProv = document.getElementById('formProveedor');

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

proveedoresCol.onSnapshot(snapshot=>{
  tablaProv.innerHTML='';
  snapshot.forEach(doc=>{
    const data = doc.data();
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

    tr.querySelector('.delProv').addEventListener('click', ()=> proveedoresCol.doc(doc.id).delete());
    tr.querySelector('.editProv').addEventListener('click', ()=>{
      const n = prompt("Nombre:", data.nombre);
      const p = prompt("Producto:", data.producto);
      const r = prompt("RUC:", data.ruc);
      const d = prompt("Dirección:", data.direccion);
      if(n && p && r && d) proveedoresCol.doc(doc.id).update({nombre:n,producto:p,ruc:r,direccion:d});
    });
  });
});

// ------------------ CRUD FACTURAS ------------------
var facturasCol = db.collection('facturas');
var tablaFac = document.getElementById('tablaFacturas');
var formFac = document.getElementById('formFactura');
var proveedorSelect = document.getElementById('proveedorFactura');

// Poblar select de proveedores en tiempo real
proveedoresCol.onSnapshot(snapshot=>{
  proveedorSelect.innerHTML='<option value="">Seleccione proveedor</option>';
  snapshot.forEach(doc=>{
    proveedorSelect.innerHTML += `<option value="${doc.id}">${doc.data().nombre}</option>`;
  });
});

formFac.addEventListener('submit', e=>{
  e.preventDefault();
  facturasCol.add({
    proveedor: proveedorSelect.value,
    tipo: formFac.tipoFactura.value,
    monto: parseFloat(formFac.montoFactura.value),
    fecha: formFac.fechaFactura.value,
    descripcion: formFac.descFactura.value
  });
  formFac.reset();
});

facturasCol.onSnapshot(snapshot=>{
  tablaFac.innerHTML='';
  snapshot.forEach(doc=>{
    const data = doc.data();
    var provNombre = "Desconocido";
    proveedoresCol.doc(data.proveedor).get().then(p=>{
      provNombre = p.exists?p.data().nombre:"Desconocido";
      const tr = document.createElement('tr');
      tr.innerHTML=`
        <td>${provNombre}</td>
        <td>${data.tipo}</td>
        <td>${data.monto}</td>
        <td>${data.fecha}</td>
        <td>${data.descripcion}</td>
        <td>
          <button class="btn btn-sm btn-warning editFac">Editar</button>
          <button class="btn btn-sm btn-danger delFac">Eliminar</button>
        </td>`;
      tablaFac.appendChild(tr);

      tr.querySelector('.delFac').addEventListener('click', ()=> facturasCol.doc(doc.id).delete());
      tr.querySelector('.editFac').addEventListener('click', ()=>{
        const t = prompt("Tipo:", data.tipo);
        const m = prompt("Monto:", data.monto);
        const f = prompt("Fecha:", data.fecha);
        const d = prompt("Descripción:", data.descripcion);
        const p = prompt("Proveedor ID:", data.proveedor);
        if(t && m && f && d && p) facturasCol.doc(doc.id).update({tipo:t,monto:parseFloat(m),fecha:f,descripcion:d,proveedor:p});
      });
    });
  });
});

// ------------------ CRUD GASTOS ------------------
var gastosCol = db.collection('gastos');
var tablaGasto = document.getElementById('tablaGastos');
var formGasto = document.getElementById('formGasto');

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
  snapshot.forEach(doc=>{
    const data = doc.data();
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

    tr.querySelector('.delGasto').addEventListener('click', ()=> gastosCol.doc(doc.id).delete());
    tr.querySelector('.editGasto').addEventListener('click', ()=>{
      const n = prompt("Nombre:", data.nombre);
      const t = prompt("Tipo:", data.tipo);
      const m = prompt("Monto:", data.monto);
      const f = prompt("Fecha:", data.fecha);
      if(n && t && m && f) gastosCol.doc(doc.id).update({nombre:n,tipo:t,monto:parseFloat(m),fecha:f});
    });
  });
});

// ------------------ CRUD SERVICIOS ------------------
var serviciosCol = db.collection('servicios');
var tablaServ = document.getElementById('tablaServicios');
var formServ = document.getElementById('formServicio');

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
  snapshot.forEach(doc=>{
    const data = doc.data();
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

    tr.querySelector('.delServ').addEventListener('click', ()=> serviciosCol.doc(doc.id).delete());
    tr.querySelector('.editServ').addEventListener('click', ()=>{
      const n = prompt("Nombre:", data.nombre);
      const p = prompt("Precio:", data.precio);
      const f = prompt("Fecha:", data.fecha);
      const d = prompt("Descripción:", data.descripcion);
      if(n && p && f && d) serviciosCol.doc(doc.id).update({nombre:n,precio:parseFloat(p),fecha:f,descripcion:d});
    });
  });
});

// ------------------ Reportes ------------------
document.getElementById('countProveedores').textContent=0;
document.getElementById('countFacturas').textContent=0;
document.getElementById('countGastos').textContent=0;
document.getElementById('countServicios').textContent=0;

proveedoresCol.onSnapshot(snap=>document.getElementById('countProveedores').textContent = snap.size);
facturasCol.onSnapshot(snap=>document.getElementById('countFacturas').textContent = snap.size);
gastosCol.onSnapshot(snap=>document.getElementById('countGastos').textContent = snap.size);
serviciosCol.onSnapshot(snap=>document.getElementById('countServicios').textContent = snap.size);








