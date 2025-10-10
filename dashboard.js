import { db } from './firebase.js';
import { 
  collection, addDoc, onSnapshot, deleteDoc, doc, getDocs, query, where 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Referencias a elementos del DOM
const tablaFacturas = document.getElementById('tablaFacturas');
const tablaProveedores = document.getElementById('tablaProveedores');
const tablaProductos = document.getElementById('tablaProductos');
const selectProveedorFactura = document.getElementById('proveedorFactura');
const selectProductoFactura = document.getElementById('productoFactura');
const buscador = document.getElementById('buscadorGlobal');

// ==================== VALIDACIONES ==================== //
document.getElementById('rucProveedor').addEventListener('input', e => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
});
document.getElementById('numeroFactura').addEventListener('input', e => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

// ==================== CRUD PROVEEDORES ==================== //
document.getElementById('proveedorForm').addEventListener('submit', async e => {
  e.preventDefault();
  const ruc = document.getElementById('rucProveedor').value.trim();
  const nombre = document.getElementById('nombreProveedor').value.trim();
  const direccion = document.getElementById('direccionProveedor').value.trim();

  if (!ruc || !nombre || !direccion) return alert('Complete todos los campos.');

  await addDoc(collection(db, 'proveedores'), { ruc, nombre, direccion });
  e.target.reset();
});

onSnapshot(collection(db, 'proveedores'), snapshot => {
  tablaProveedores.innerHTML = '';
  selectProveedorFactura.innerHTML = '<option value="" disabled selected>Seleccione proveedor</option>';

  snapshot.forEach(docSnap => {
    const prov = docSnap.data();
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${prov.ruc}</td>
      <td>${prov.nombre}</td>
      <td>${prov.direccion}</td>
      <td><button class="btn btn-delete" onclick="eliminarProveedor('${docSnap.id}')">Eliminar</button></td>`;
    tablaProveedores.appendChild(row);

    const opt = document.createElement('option');
    opt.value = prov.nombre;
    opt.textContent = prov.nombre;
    selectProveedorFactura.appendChild(opt);
  });
});

window.eliminarProveedor = async id => await deleteDoc(doc(db, 'proveedores', id));

// ==================== CRUD PRODUCTOS ==================== //
document.getElementById('productoForm').addEventListener('submit', async e => {
  e.preventDefault();
  const nombre = document.getElementById('nombreProducto').value.trim();
  const cantidad = document.getElementById('cantidadProducto').value.trim();
  const unidad = document.getElementById('unidadProducto').value.trim();
  const valor = document.getElementById('valorUnitarioProducto').value.trim();

  if (!nombre || !cantidad || !unidad || !valor) return alert('Complete todos los campos.');

  await addDoc(collection(db, 'productos'), {
    nombre,
    cantidad,
    unidad,
    valor: parseFloat(valor)
  });
  e.target.reset();
});

onSnapshot(collection(db, 'productos'), snapshot => {
  tablaProductos.innerHTML = '';
  selectProductoFactura.innerHTML = '<option value="" disabled selected>Seleccione producto</option>';

  snapshot.forEach(docSnap => {
    const prod = docSnap.data();
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${prod.nombre}</td>
      <td>${prod.cantidad}</td>
      <td>${prod.unidad}</td>
      <td>${prod.valor}</td>
      <td><button class="btn btn-delete" onclick="eliminarProducto('${docSnap.id}')">Eliminar</button></td>`;
    tablaProductos.appendChild(row);

    const opt = document.createElement('option');
    opt.value = prod.nombre;
    opt.textContent = prod.nombre;
    selectProductoFactura.appendChild(opt);
  });
});

window.eliminarProducto = async id => await deleteDoc(doc(db, 'productos', id));

// ==================== CRUD FACTURAS ==================== //
document.getElementById('facturaForm').addEventListener('submit', async e => {
  e.preventDefault();
  const numero = document.getElementById('numeroFactura').value.trim();
  const proveedor = selectProveedorFactura.value;
  const producto = selectProductoFactura.value;
  const monto = document.getElementById('montoFactura').value.trim();
  const tipo = document.getElementById('tipoFactura').value;

  if (!numero || !proveedor || !producto || !monto)
    return alert('Complete todos los campos.');

  await addDoc(collection(db, 'facturas'), { numero, proveedor, producto, monto, tipo });
  e.target.reset();
  selectProveedorFactura.selectedIndex = 0;
  selectProductoFactura.selectedIndex = 0;
});

// ==================== MOSTRAR FACTURAS ==================== //
let facturasSnapshot = null;

onSnapshot(collection(db, 'facturas'), snapshot => {
  facturasSnapshot = snapshot;
  renderFacturas(snapshot);
});

function renderFacturas(snapshot) {
  tablaFacturas.innerHTML = '';
  snapshot.forEach(docSnap => {
    const f = docSnap.data();
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${f.numero}</td>
      <td class="link" onclick="verProveedor('${f.proveedor}')">${f.proveedor}</td>
      <td class="link" onclick="verProducto('${f.producto}')">${f.producto}</td>
      <td>${f.monto}</td>
      <td>${f.tipo}</td>
      <td><button class="btn btn-delete" onclick="eliminarFactura('${docSnap.id}')">Eliminar</button></td>`;
    tablaFacturas.appendChild(row);
  });
}

window.eliminarFactura = async id => await deleteDoc(doc(db, 'facturas', id));

// ==================== BUSCADOR DE FACTURAS ==================== //
buscador.addEventListener('keydown', async e => {
  if (e.key === 'Enter') {
    const texto = buscador.value.trim();
    if (!texto) {
      // Si está vacío, mostrar todas las facturas
      renderFacturas(facturasSnapshot);
      return;
    }

    const q = query(collection(db, 'facturas'), where('producto', '==', texto));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      tablaFacturas.innerHTML = '<tr><td colspan="6">❌ No se encontraron facturas para ese producto.</td></tr>';
    } else {
      renderFacturas(snapshot);
    }
  }
});

// ==================== VER DATOS DE PROVEEDOR ==================== //
window.verProveedor = async nombre => {
  const q = query(collection(db, 'proveedores'), where('nombre', '==', nombre));
  const snap = await getDocs(q);
  if (snap.empty) return alert('Proveedor no encontrado.');
  const data = snap.docs[0].data();

  alert(`📦 PROVEEDOR
RUC: ${data.ruc}
Nombre: ${data.nombre}
Dirección: ${data.direccion}`);
};

// ==================== VER DATOS DE PRODUCTO ==================== //
window.verProducto = async nombre => {
  const q = query(collection(db, 'productos'), where('nombre', '==', nombre));
  const snap = await getDocs(q);
  if (snap.empty) return alert('Producto no encontrado.');
  const data = snap.docs[0].data();

  alert(`🧾 PRODUCTO
Nombre: ${data.nombre}
Cantidad: ${data.cantidad}
Unidad: ${data.unidad}
Valor Unitario: ${data.valor}`);
};

// ==================== NAVEGACIÓN Y LOGOUT ==================== //
const secciones = document.querySelectorAll('.seccion');
document.querySelectorAll('.menu-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.menu-btn.activo')?.classList.remove('activo');
    btn.classList.add('activo');
    secciones.forEach(sec => sec.style.display = 'none');
    document.getElementById(btn.dataset.target)?.style.setProperty('display', 'block');
  });
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('usuarioActivo');
  window.location.href = 'index.html';
});

