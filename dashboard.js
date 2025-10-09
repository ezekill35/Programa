// Referencias a Firebase
const auth = firebase.auth();
const db = firebase.firestore();

// Logout
document.getElementById('logoutBtn').addEventListener('click', ()=>{
  auth.signOut().then(()=> window.location='index.html');
});

// Sidebar navegación
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.content-section');

navBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    navBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const sec = btn.dataset.section;
    sections.forEach(s=> s.style.display = s.id === sec ? 'block' : 'none');
  });
});

// -------------------- PROVEEDORES --------------------
const formProv = document.getElementById('formProveedor');
const tablaProv = document.getElementById('tablaProveedores');

formProv.addEventListener('submit', e=>{
  e.preventDefault();
  const nombre = document.getElementById('nombreProv').value;
  const producto = document.getElementById('productoProv').value;
  const ruc = document.getElementById('rucProv').value;
  const direccion = document.getElementById('direccionProv').value;

  db.collection('proveedores').add({ruc,nombre,producto,direccion})
    .then(()=> formProv.reset());
});

// Render proveedores en tiempo real
db.collection('proveedores').orderBy('ruc').onSnapshot(snapshot=>{
  tablaProv.innerHTML='';
  snapshot.forEach(doc=>{
    const d = doc.data();
    tablaProv.innerHTML += `
      <tr>
        <td>${d.ruc}</td><td>${d.nombre}</td><td>${d.producto}</td><td>${d.direccion}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editarProv('${doc.id}')">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarProv('${doc.id}')">Eliminar</button>
        </td>
      </tr>`;
  });

  // Actualizar select de proveedores en facturas
  const sel = document.getElementById('proveedorFactura');
  sel.innerHTML = '<option value="">Seleccione proveedor</option>';
  snapshot.forEach(doc=>{
    const d = doc.data();
    sel.innerHTML += `<option value="${doc.id}">${d.nombre}</option>`;
  });
});

window.eliminarProv = id=> db.collection('proveedores').doc(id).delete();
window.editarProv = id=>{
  db.collection('proveedores').doc(id).get().then(doc=>{
    const d = doc.data();
    document.getElementById('nombreProv').value = d.nombre;
    document.getElementById('productoProv').value = d.producto;
    document.getElementById('rucProv').value = d.ruc;
    document.getElementById('direccionProv').value = d.direccion;

    formProv.onsubmit = e=>{
      e.preventDefault();
      db.collection('proveedores').doc(id).update({
        ruc: document.getElementById('rucProv').value,
        nombre: document.getElementById('nombreProv').value,
        producto: document.getElementById('productoProv').value,
        direccion: document.getElementById('direccionProv').value
      }).then(()=>{
        formProv.reset();
        formProv.onsubmit = null;
      });
    };
  });
};

// -------------------- FACTURAS --------------------
const formFac = document.getElementById('formFactura');
const tablaFac = document.getElementById('tablaFacturas');

formFac.addEventListener('submit', e=>{
  e.preventDefault();
  const proveedorId = document.getElementById('proveedorFactura').value;
  const tipo = document.getElementById('tipoFactura').value;
  const monto = document.getElementById('montoFactura').value;
  const moneda = document.getElementById('monedaFactura').value;
  const fecha = document.getElementById('fechaFactura').value;
  const desc = document.getElementById('descFactura').value;

  if(!proveedorId) return alert('Seleccione un proveedor');
  db.collection('facturas').add({proveedorId,tipo,monto,moneda,fecha,desc})
    .then(()=> formFac.reset());
});

// Render facturas en tiempo real
db.collection('facturas').onSnapshot(snapshot=>{
  tablaFac.innerHTML='';
  snapshot.forEach(doc=>{
    const d = doc.data();
    db.collection('proveedores').doc(d.proveedorId).get().then(p=>{
      const prov = p.data()?.nombre || 'Desconocido';
      tablaFac.innerHTML += `
        <tr>
          <td>${prov}</td><td>${d.tipo}</td><td>${d.moneda} ${d.monto}</td><td>${d.fecha}</td><td>${d.desc}</td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="editarFac('${doc.id}')">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="eliminarFac('${doc.id}')">Eliminar</button>
          </td>
        </tr>`;
    });
  });
});

window.eliminarFac = id=> db.collection('facturas').doc(id).delete();
window.editarFac = id=>{
  db.collection('facturas').doc(id).get().then(doc=>{
    const d = doc.data();
    document.getElementById('proveedorFactura').value = d.proveedorId;
    document.getElementById('tipoFactura').value = d.tipo;
    document.getElementById('montoFactura').value = d.monto;
    document.getElementById('monedaFactura').value = d.moneda;
    document.getElementById('fechaFactura').value = d.fecha;
    document.getElementById('descFactura').value = d.desc;

    formFac.onsubmit = e=>{
      e.preventDefault();
      db.collection('facturas').doc(id).update({
        proveedorId: document.getElementById('proveedorFactura').value,
        tipo: document.getElementById('tipoFactura').value,
        monto: document.getElementById('montoFactura').value,
        moneda: document.getElementById('monedaFactura').value,
        fecha: document.getElementById('fechaFactura').value,
        desc: document.getElementById('descFactura').value
      }).then(()=>{
        formFac.reset();
        formFac.onsubmit = null;
      });
    };
  });
};

// -------------------- GASTOS --------------------
const formGas = document.getElementById('formGasto');
const tablaGas = document.getElementById('tablaGastos');

formGas.addEventListener('submit', e=>{
  e.preventDefault();
  const nombre = document.getElementById('nombreGasto').value;
  const tipo = document.getElementById('tipoGasto').value;
  const monto = document.getElementById('montoGasto').value;
  const fecha = document.getElementById('fechaGasto').value;
  db.collection('gastos').add({nombre,tipo,monto,fecha}).then(()=> formGas.reset());
});

db.collection('gastos').onSnapshot(snapshot=>{
  tablaGas.innerHTML='';
  snapshot.forEach(doc=>{
    const d = doc.data();
    tablaGas.innerHTML += `
      <tr>
        <td>${d.nombre}</td><td>${d.tipo}</td><td>S/. ${d.monto}</td><td>${d.fecha}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editarGas('${doc.id}')">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarGas('${doc.id}')">Eliminar</button>
        </td>
      </tr>`;
  });
});

window.eliminarGas = id=> db.collection('gastos').doc(id).delete();
window.editarGas = id=>{
  db.collection('gastos').doc(id).get().then(doc=>{
    const d = doc.data();
    document.getElementById('nombreGasto').value = d.nombre;
    document.getElementById('tipoGasto').value = d.tipo;
    document.getElementById('montoGasto').value = d.monto;
    document.getElementById('fechaGasto').value = d.fecha;

    formGas.onsubmit = e=>{
      e.preventDefault();
      db.collection('gastos').doc(id).update({
        nombre: document.getElementById('nombreGasto').value,
        tipo: document.getElementById('tipoGasto').value,
        monto: document.getElementById('montoGasto').value,
        fecha: document.getElementById('fechaGasto').value
      }).then(()=>{
        formGas.reset();
        formGas.onsubmit=null;
      });
    };
  });
};

// -------------------- SERVICIOS --------------------
const formServ = document.getElementById('formServicio');
const tablaServ = document.getElementById('tablaServicios');

formServ.addEventListener('submit', e=>{
  e.preventDefault();
  const nombre = document.getElementById('nombreServ').value;
  const precio = document.getElementById('precioServ').value;
  const fecha = document.getElementById('fechaServ').value;
  const desc = document.getElementById('descServ').value;
  db.collection('servicios').add({nombre,precio,fecha,descripcion:desc}).then(()=> formServ.reset());
});

db.collection('servicios').onSnapshot(snapshot=>{
  tablaServ.innerHTML='';
  snapshot.forEach(doc=>{
    const d = doc.data();
    tablaServ.innerHTML += `
      <tr>
        <td>${d.nombre}</td><td>S/. ${d.precio}</td><td>${d.fecha}</td><td>${d.descripcion}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editarServ('${doc.id}')">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarServ('${doc.id}')">Eliminar</button>
        </td>
      </tr>`;
  });
});

window.eliminarServ = id=> db.collection('servicios').doc(id).delete();
window.editarServ = id=>{
  db.collection('servicios').doc(id).get().then(doc=>{
    const d = doc.data();
    document.getElementById('nombreServ').value = d.nombre;
    document.getElementById('precioServ').value = d.precio;
    document.getElementById('fechaServ').value = d.fecha;
    document.getElementById('descServ').value = d.descripcion;

    formServ.onsubmit = e=>{
      e.preventDefault();
      db.collection('servicios').doc(id).update({
        nombre: document.getElementById('nombreServ').value,
        precio: document.getElementById('precioServ').value,
        fecha: document.getElementById('fechaServ').value,
        descripcion: document.getElementById('descServ').value
      }).then(()=> {formServ.reset(); formServ.onsubmit=null;});
    };
  });
};

