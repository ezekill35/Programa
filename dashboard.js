import { db, auth } from './firebase.js';
import { collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.16.5/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.16.5/firebase-auth.js";

// ------------------- ELEMENTOS -------------------
const sections = document.querySelectorAll('.content-section');
const navBtns = document.querySelectorAll('.nav-btn');

const logoutBtn = document.getElementById('logoutBtn');

// Proveedores
const formProveedor = document.getElementById('formProveedor');
const tablaProveedores = document.getElementById('tablaProveedores');
const msgProv = document.getElementById('msgProv');

// Facturas
const formFactura = document.getElementById('formFactura');
const tablaFacturas = document.getElementById('tablaFacturas');
const proveedorFacturaSelect = document.getElementById('proveedorFactura');
const msgFactura = document.getElementById('msgFactura');

// Gastos
const formGasto = document.getElementById('formGasto');
const tablaGastos = document.getElementById('tablaGastos');
const msgGasto = document.getElementById('msgGasto');

// Servicios
const formServicio = document.getElementById('formServicio');
const tablaServicios = document.getElementById('tablaServicios');
const msgServ = document.getElementById('msgServ');

// Reportes
const countProveedores = document.getElementById('countProveedores');
const countFacturas = document.getElementById('countFacturas');
const countGastos = document.getElementById('countGastos');
const countServicios = document.getElementById('countServicios');

// ------------------- NAV -------------------
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    sections.forEach(sec => sec.classList.remove('active'));
    document.getElementById(btn.dataset.section).classList.add('active');

    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ------------------- LOGOUT -------------------
logoutBtn.addEventListener('click', () => {
  signOut(auth).then(() => {
    window.location.href = 'index.html';
  });
});

// ------------------- PROVEEDORES -------------------
const proveedoresCol = collection(db, 'proveedores');

const renderProveedores = (docs) => {
  tablaProveedores.innerHTML = '';
  proveedorFacturaSelect.innerHTML = '<option value="">Selecciona proveedor</option>';
  docs.forEach(docu => {
    const data = docu.data();
    tablaProveedores.innerHTML += `
      <tr>
        <td>${data.nombre}</td>
        <td>${data.producto}</td>
        <td>${data.ruc}</td>
        <td>${data.direccion}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editProveedor('${docu.id}', '${data.nombre}', '${data.producto}', '${data.ruc}', '${data.direccion}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteProveedor('${docu.id}')">Eliminar</button>
        </td>
      </tr>
    `;
    proveedorFacturaSelect.innerHTML += `<option value="${docu.id}">${data.nombre}</option>`;
  });
  countProveedores.textContent = docs.length;
};

// Tiempo real
onSnapshot(proveedoresCol, snapshot => {
  renderProveedores(snapshot.docs);
});

// Agregar proveedor
formProveedor.addEventListener('submit', async e => {
  e.preventDefault();
  const nombre = document.getElementById('nombreProv').value.trim();
  const producto = document.getElementById('productoProv').value.trim();
  const ruc = document.getElementById('rucProv').value.trim();
  const direccion = document.getElementById('direccionProv').value.trim();

  if(!nombre || !producto || !ruc || !direccion) return;

  try {
    await addDoc(proveedoresCol, { nombre, producto, ruc, direccion });
    msgProv.style.color = 'green';
    msgProv.textContent = 'Proveedor agregado';
    formProveedor.reset();
  } catch(err) {
    msgProv.style.color = 'red';
    msgProv.textContent = err.message;
  }
});

// Editar y eliminar proveedores
window.deleteProveedor = async (id) => {
  if(confirm('¿Eliminar proveedor?')) {
    await deleteDoc(doc(db, 'proveedores', id));
  }
};

window.editProveedor = async (id, nombre, producto, ruc, direccion) => {
  const newNombre = prompt('Nombre:', nombre);
  const newProducto = prompt('Producto:', producto);
  const newRuc = prompt('RUC:', ruc);
  const newDireccion = prompt('Dirección:', direccion);
  if(newNombre && newProducto && newRuc && newDireccion) {
    await updateDoc(doc(db, 'proveedores', id), {
      nombre: newNombre,
      producto: newProducto,
      ruc: newRuc,
      direccion: newDireccion
    });
  }
};

// ------------------- FACTURAS -------------------
const facturasCol = collection(db, 'facturas');

const renderFacturas = (docs) => {
  tablaFacturas.innerHTML = '';
  docs.forEach(docu => {
    const data = docu.data();
    tablaFacturas.innerHTML += `
      <tr>
        <td>${data.proveedorNombre}</td>
        <td>${data.tipo}</td>
        <td>${data.monto}</td>
        <td>${data.fecha}</td>
        <td>${data.descripcion}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editFactura('${docu.id}', '${data.proveedorId}', '${data.tipo}', '${data.monto}', '${data.fecha}', '${data.descripcion}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteFactura('${docu.id}')">Eliminar</button>
        </td>
      </tr>
    `;
  });
  countFacturas.textContent = docs.length;
};

onSnapshot(facturasCol, snapshot => {
  const docs = snapshot.docs.map(d => {
    const data = d.data();
    // agregar nombre de proveedor
    const proveedorDoc = proveedorFacturaSelect.querySelector(`option[value="${data.proveedorId}"]`);
    data.proveedorNombre = proveedorDoc ? proveedorDoc.textContent : '';
    return { ...data, id: d.id };
  });
  renderFacturas(docs);
});

formFactura.addEventListener('submit', async e => {
  e.preventDefault();
  const proveedorId = proveedorFacturaSelect.value;
  const tipo = document.getElementById('tipoFactura').value;
  const monto = parseFloat(document.getElementById('montoFactura').value);
  const fecha = document.getElementById('fechaFactura').value;
  const descripcion = document.getElementById('descFactura').value;

  if(!proveedorId || !tipo || !monto || !fecha) return;

  await addDoc(facturasCol, { proveedorId, tipo, monto, fecha, descripcion });
  msgFactura.style.color = 'green';
  msgFactura.textContent = 'Factura agregada';
  formFactura.reset();
});

window.deleteFactura = async (id) => {
  if(confirm('¿Eliminar factura?')) {
    await deleteDoc(doc(db, 'facturas', id));
  }
};

window.editFactura = async (id, proveedorId, tipo, monto, fecha, descripcion) => {
  const newProveedorId = prompt('Proveedor ID:', proveedorId);
  const newTipo = prompt('Tipo:', tipo);
  const newMonto = parseFloat(prompt('Monto:', monto));
  const newFecha = prompt('Fecha:', fecha);
  const newDesc = prompt('Descripción:', descripcion);

  if(newProveedorId && newTipo && newMonto && newFecha) {
    await updateDoc(doc(db, 'facturas', id), {
      proveedorId: newProveedorId,
      tipo: newTipo,
      monto: newMonto,
      fecha: newFecha,
      descripcion: newDesc
    });
  }
};

// ------------------- GASTOS -------------------
const gastosCol = collection(db, 'gastos');

const renderGastos = docs => {
  tablaGastos.innerHTML = '';
  docs.forEach(docu => {
    const data = docu.data();
    tablaGastos.innerHTML += `
      <tr>
        <td>${data.nombre}</td>
        <td>${data.tipo}</td>
        <td>${data.monto}</td>
        <td>${data.fecha}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editGasto('${docu.id}', '${data.nombre}', '${data.tipo}', '${data.monto}', '${data.fecha}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteGasto('${docu.id}')">Eliminar</button>
        </td>
      </tr>
    `;
  });
  countGastos.textContent = docs.length;
};

onSnapshot(gastosCol, snapshot => renderGastos(snapshot.docs));

formGasto.addEventListener('submit', async e => {
  e.preventDefault();
  const nombre = document.getElementById('nombreGasto').value;
  const tipo = document.getElementById('tipoGasto').value;
  const monto = parseFloat(document.getElementById('montoGasto').value);
  const fecha = document.getElementById('fechaGasto').value;
  if(!nombre || !tipo || !monto || !fecha) return;
  await addDoc(gastosCol, { nombre, tipo, monto, fecha });
  msgGasto.style.color = 'green';
  msgGasto.textContent = 'Gasto agregado';
  formGasto.reset();
});

window.deleteGasto = async (id) => {
  if(confirm('¿Eliminar gasto?')) await deleteDoc(doc(db, 'gastos', id));
};

window.editGasto = async (id, nombre, tipo, monto, fecha) => {
  const newNombre = prompt('Nombre:', nombre);
  const newTipo = prompt('Tipo:', tipo);
  const newMonto = parseFloat(prompt('Monto:', monto));
  const newFecha = prompt('Fecha:', fecha);
  if(newNombre && newTipo && newMonto && newFecha) {
    await updateDoc(doc(db, 'gastos', id), { nombre:newNombre, tipo:newTipo, monto:newMonto, fecha:newFecha });
  }
};

// ------------------- SERVICIOS -------------------
const serviciosCol = collection(db, 'servicios');

const renderServicios = docs => {
  tablaServicios.innerHTML = '';
  docs.forEach(docu => {
    const data = docu.data();
    tablaServicios.innerHTML += `
      <tr>
        <td>${data.nombre}</td>
        <td>${data.precio}</td>
        <td>${data.fecha}</td>
        <td>${data.descripcion}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editServicio('${docu.id}', '${data.nombre}', '${data.precio}', '${data.fecha}', '${data.descripcion}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteServicio('${docu.id}')">Eliminar</button>
        </td>
      </tr>
    `;
  });
  countServicios.textContent = docs.length;
};

onSnapshot(serviciosCol, snapshot => renderServicios(snapshot.docs));

formServicio.addEventListener('submit', async e => {
  e.preventDefault();
  const nombre = document.getElementById('nombreServ').value;
  const precio = parseFloat(document.getElementById('precioServ').value);
  const fecha = document.getElementById('fechaServ').value;
  const descripcion = document.getElementById('descServ').value;
  if(!nombre || !precio || !fecha) return;
  await addDoc(serviciosCol, { nombre, precio, fecha, descripcion });
  msgServ.style.color = 'green';
  msgServ.textContent = 'Servicio agregado';
  formServicio.reset();
});

window.deleteServicio = async (id) => {
  if(confirm('¿Eliminar servicio?')) await deleteDoc(doc(db, 'servicios', id));
};

window.editServicio = async (id, nombre, precio, fecha, descripcion) => {
  const newNombre = prompt('Nombre:', nombre);
  const newPrecio = parseFloat(prompt('Precio:', precio));
  const newFecha = prompt('Fecha:', fecha);
  const newDesc = prompt('Descripción:', descripcion);
  if(newNombre && newPrecio && newFecha) {
    await updateDoc(doc(db, 'servicios', id), { nombre:newNombre, precio:newPrecio, fecha:newFecha, descripcion:newDesc });
  }
};







