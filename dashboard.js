// ===============================
// 📦 Importar módulos de Firebase
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ===============================
// 🔥 Configuración de Firebase
// ===============================
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "743510443727",
  appId: "1:743510443727:web:b340b8e9c2ef63fb9c6542"
};

// Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===============================
// 🎨 Menú lateral interactivo
// ===============================
const botonesMenu = document.querySelectorAll('.menu-btn');
const secciones = document.querySelectorAll('.seccion');

botonesMenu.forEach(btn => {
  btn.addEventListener('click', () => {
    botonesMenu.forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');
    secciones.forEach(sec => sec.style.display = 'none');
    const target = document.getElementById(btn.dataset.target);
    if (target) target.style.display = 'block';
  });
});

// ===============================
// 🏪 PROVEEDORES
// ===============================
const formProveedores = document.getElementById('formProveedores');
const tablaProveedores = document.getElementById('tablaProveedores');

formProveedores.addEventListener('submit', async e => {
  e.preventDefault();
  const ruc = document.getElementById('rucProveedor').value.trim();
  const nombre = document.getElementById('nombreProveedor').value.trim();
  const producto = document.getElementById('productoProveedor').value.trim();
  const direccion = document.getElementById('direccionProveedor').value.trim();

  if (!/^[0-9]{11}$/.test(ruc)) {
    alert('⚠️ El RUC debe tener 11 dígitos numéricos.');
    return;
  }

  try {
    await addDoc(collection(db, 'proveedores'), { ruc, nombre, producto, direccion });
    alert('✅ Proveedor guardado correctamente.');
    formProveedores.reset();
  } catch (error) {
    console.error('Error al guardar proveedor:', error);
  }
});

onSnapshot(collection(db, 'proveedores'), snapshot => {
  tablaProveedores.innerHTML = '';
  snapshot.forEach(docu => {
    const p = docu.data();
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${p.ruc}</td>
      <td>${p.nombre}</td>
      <td>${p.producto}</td>
      <td>${p.direccion}</td>
      <td>
        <button class="btn-eliminar" data-id="${docu.id}">🗑️</button>
      </td>
    `;
    tablaProveedores.appendChild(fila);
  });

  tablaProveedores.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('¿Eliminar este proveedor?')) {
        await deleteDoc(doc(db, 'proveedores', btn.dataset.id));
      }
    });
  });
});

// ===============================
// 🧾 FACTURAS
// ===============================
const formFacturas = document.getElementById('formFacturas');
const tablaFacturas = document.getElementById('tablaFacturas');

formFacturas.addEventListener('submit', async e => {
  e.preventDefault();
  const proveedor = document.getElementById('facturaProveedor').value;
  const tipo = document.getElementById('facturaTipo').value;
  const monto = parseFloat(document.getElementById('facturaMonto').value);
  const fecha = document.getElementById('facturaFecha').value;
  const descripcion = document.getElementById('facturaDescripcion').value.trim();

  if (!proveedor || !tipo || !monto || !fecha) {
    alert('⚠️ Complete todos los campos.');
    return;
  }

  try {
    await addDoc(collection(db, 'facturas'), { proveedor, tipo, monto, fecha, descripcion });
    alert('✅ Factura agregada correctamente.');
    formFacturas.reset();
  } catch (error) {
    console.error('Error al guardar factura:', error);
  }
});

onSnapshot(collection(db, 'facturas'), snapshot => {
  tablaFacturas.innerHTML = '';
  snapshot.forEach(docu => {
    const f = docu.data();
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${f.proveedor}</td>
      <td>${f.tipo}</td>
      <td>S/. ${f.monto.toFixed(2)}</td>
      <td>${f.fecha}</td>
      <td>${f.descripcion}</td>
      <td>
        <button class="btn-eliminar" data-id="${docu.id}">🗑️</button>
      </td>
    `;
    tablaFacturas.appendChild(fila);
  });

  tablaFacturas.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('¿Eliminar esta factura?')) {
        await deleteDoc(doc(db, 'facturas', btn.dataset.id));
      }
    });
  });
});

// ===============================
// 💰 GASTOS
// ===============================
const formGastos = document.getElementById('formGastos');
const tablaGastos = document.getElementById('tablaGastos');

formGastos.addEventListener('submit', async e => {
  e.preventDefault();
  const nombre = document.getElementById('gastoNombre').value.trim();
  const tipo = document.getElementById('gastoTipo').value;
  const monto = parseFloat(document.getElementById('gastoMonto').value);
  const fecha = document.getElementById('gastoFecha').value;

  if (!nombre || !tipo || !monto || !fecha) {
    alert('⚠️ Complete todos los campos.');
    return;
  }

  try {
    await addDoc(collection(db, 'gastos'), { nombre, tipo, monto, fecha });
    alert('✅ Gasto guardado correctamente.');
    formGastos.reset();
  } catch (error) {
    console.error('Error al guardar gasto:', error);
  }
});

onSnapshot(collection(db, 'gastos'), snapshot => {
  tablaGastos.innerHTML = '';
  snapshot.forEach(docu => {
    const g = docu.data();
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${g.nombre}</td>
      <td>${g.tipo}</td>
      <td>S/. ${g.monto.toFixed(2)}</td>
      <td>${g.fecha}</td>
      <td><button class="btn-eliminar" data-id="${docu.id}">🗑️</button></td>
    `;
    tablaGastos.appendChild(fila);
  });

  tablaGastos.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('¿Eliminar este gasto?')) {
        await deleteDoc(doc(db, 'gastos', btn.dataset.id));
      }
    });
  });
});

// ===============================
// 🛠 SERVICIOS
// ===============================
const formServicios = document.getElementById('formServicios');
const tablaServicios = document.getElementById('tablaServicios');

formServicios.addEventListener('submit', async e => {
  e.preventDefault();
  const nombre = document.getElementById('servicioNombre').value.trim();
  const precio = parseFloat(document.getElementById('servicioPrecio').value);
  const fecha = document.getElementById('servicioFecha').value;
  const descripcion = document.getElementById('servicioDescripcion').value.trim();

  if (!nombre || !precio || !fecha) {
    alert('⚠️ Complete todos los campos.');
    return;
  }

  try {
    await addDoc(collection(db, 'servicios'), { nombre, precio, fecha, descripcion });
    alert('✅ Servicio agregado correctamente.');
    formServicios.reset();
  } catch (error) {
    console.error('Error al guardar servicio:', error);
  }
});

onSnapshot(collection(db, 'servicios'), snapshot => {
  tablaServicios.innerHTML = '';
  snapshot.forEach(docu => {
    const s = docu.data();
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${s.nombre}</td>
      <td>S/. ${s.precio.toFixed(2)}</td>
      <td>${s.fecha}</td>
      <td>${s.descripcion}</td>
      <td><button class="btn-eliminar" data-id="${docu.id}">🗑️</button></td>
    `;
    tablaServicios.appendChild(fila);
  });

  tablaServicios.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('¿Eliminar este servicio?')) {
        await deleteDoc(doc(db, 'servicios', btn.dataset.id));
      }
    });
  });
});

// ===============================
// 🚪 Cerrar sesión (simple)
const btnCerrar = document.createElement('button');
btnCerrar.textContent = '🚪 Cerrar sesión';
btnCerrar.classList.add('btn-cerrar');
document.querySelector('.sidebar').appendChild(btnCerrar);
btnCerrar.addEventListener('click', () => {
  window.location.href = 'index.html';
});









