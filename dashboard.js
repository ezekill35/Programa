// dashboard.js
import { auth, db } from "./firebase.js";
import {
  collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* ---------- toasts ---------- */
function showToast(text, type = 'success', ms = 2000) {
  const area = document.getElementById('toastArea');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = text;
  area.appendChild(el);
  setTimeout(() => el.classList.add('visible'), 50);
  setTimeout(() => { el.classList.remove('visible'); setTimeout(()=>el.remove(), 300); }, ms);
}

/* ---------- auth gate (redirect to login if no user) ---------- */
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = 'index.html';
  }
});

/* ---------- navigation ---------- */
const menuBtns = document.querySelectorAll('.menu-btn');
const sections = document.querySelectorAll('.section');
menuBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.id === 'btnLogout') return;
    menuBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const sec = btn.dataset.section;
    sections.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(sec);
    if (target) target.classList.add('active');
  });
});
document.getElementById('btnLogout').addEventListener('click', async () => {
  try {
    await signOut(auth);
    showToast('Sesión cerrada', 'success');
    setTimeout(() => window.location.href = 'index.html', 600);
  } catch (err) {
    showToast('Error al cerrar sesión', 'error');
  }
});

/* ---------- DOM refs ---------- */
const countProveedores = document.getElementById('countProveedores');
const countFacturas = document.getElementById('countFacturas');
const countGastos = document.getElementById('countGastos');
const countServicios = document.getElementById('countServicios');

const formProveedores = document.getElementById('formProveedores');
const listaProveedores = document.getElementById('listaProveedores');

const formFacturas = document.getElementById('formFacturas');
const facProveedor = document.getElementById('facProveedor');
const listaFacturas = document.getElementById('listaFacturas');

const formGastos = document.getElementById('formGastos');
const listaGastos = document.getElementById('listaGastos');

const formServicios = document.getElementById('formServicios');
const listaServicios = document.getElementById('listaServicios');

/* ---------- collections ---------- */
const colProveedores = collection(db, 'proveedores');
const colFacturas = collection(db, 'facturas');
const colGastos = collection(db, 'gastos');
const colServicios = collection(db, 'servicios');

/* ================= PROVEEDORES ================= */
if (formProveedores) {
  formProveedores.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('provNombre').value.trim();
    const producto = document.getElementById('provProducto').value.trim();
    const ruc = document.getElementById('provRuc').value.trim();
    const direccion = document.getElementById('provDireccion').value.trim();
    if (!nombre || !ruc) { showToast('RUC y Nombre son obligatorios', 'error'); return; }
    try {
      await addDoc(colProveedores, { nombre, producto, ruc, direccion });
      showToast('Proveedor guardado', 'success');
      formProveedores.reset();
    } catch (err) {
      console.error(err);
      showToast('Error al guardar proveedor', 'error');
    }
  });
}

onSnapshot(colProveedores, snapshot => {
  const arr = [];
  listaProveedores.innerHTML = '';
  snapshot.forEach(s => arr.push({ id: s.id, ...s.data() }));
  arr.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(p.nombre)}</td>
      <td>${escapeHtml(p.producto||'')}</td>
      <td>${escapeHtml(p.ruc||'')}</td>
      <td>${escapeHtml(p.direccion||'')}</td>
      <td>
        <button class="btn small edit-prov" data-id="${p.id}">✏️</button>
        <button class="btn small del-prov" data-id="${p.id}">🗑️</button>
      </td>`;
    listaProveedores.appendChild(tr);
  });
  if (countProveedores) countProveedores.textContent = arr.length;

  // Fill proveedor select for invoices
  if (facProveedor) {
    facProveedor.innerHTML = '<option value="">-- Selecciona proveedor --</option>';
    arr.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.nombre} — ${p.ruc}`;
      facProveedor.appendChild(opt);
    });
  }

  // attach edit/delete
  listaProveedores.querySelectorAll('.del-prov').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      if (!confirm('¿Eliminar proveedor?')) return;
      try {
        await deleteDoc(doc(db, 'proveedores', id));
        showToast('Proveedor eliminado', 'success');
      } catch (err) {
        console.error(err);
        showToast('Error al eliminar', 'error');
      }
    };
  });

  listaProveedores.querySelectorAll('.edit-prov').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      const ref = doc(db, 'proveedores', id);
      const snap = await getDoc(ref);
      if (!snap.exists()) { showToast('Proveedor no encontrado', 'error'); return; }
      const data = snap.data();
      const nuevoNombre = prompt('Nombre', data.nombre || '');
      if (nuevoNombre === null) return;
      const nuevoProducto = prompt('Producto', data.producto || '');
      if (nuevoProducto === null) return;
      const nuevoRuc = prompt('RUC', data.ruc || '');
      if (nuevoRuc === null) return;
      const nuevaDir = prompt('Dirección', data.direccion || '');
      if (nuevaDir === null) return;
      try {
        await updateDoc(ref, { nombre: nuevoNombre, producto: nuevoProducto, ruc: nuevoRuc, direccion: nuevaDir });
        showToast('Proveedor actualizado', 'success');
      } catch (err) {
        console.error(err);
        showToast('Error al actualizar', 'error');
      }
    };
  });
});

/* ================= FACTURAS ================= */
if (formFacturas) {
  formFacturas.addEventListener('submit', async (e) => {
    e.preventDefault();
    const proveedorId = facProveedor.value;
    const tipo = document.getElementById('facTipo').value.trim();
    const monto = parseFloat(document.getElementById('facMonto').value || 0);
    const moneda = document.getElementById('facMoneda').value || 'S/.';
    const fecha = document.getElementById('facFecha').value;
    const descripcion = document.getElementById('facDescripcion').value.trim();
    if (!proveedorId || !tipo) { showToast('Proveedor y Tipo son obligatorios', 'error'); return; }
    if (isNaN(monto)) { showToast('Monto inválido', 'error'); return; }
    try {
      // denormalize
      let provName = '', provRuc = '';
      const provSnap = await getDoc(doc(db, 'proveedores', proveedorId));
      if (provSnap.exists()) {
        const pd = provSnap.data();
        provName = pd.nombre || '';
        provRuc = pd.ruc || '';
      }
      await addDoc(colFacturas, { proveedorId, proveedorName: provName, proveedorRuc: provRuc, tipo, monto, moneda, fecha, descripcion });
      showToast('Factura guardada', 'success');
      formFacturas.reset();
    } catch (err) {
      console.error(err);
      showToast('Error al guardar factura', 'error');
    }
  });
}

onSnapshot(colFacturas, snap => {
  listaFacturas.innerHTML = '';
  const arr = [];
  snap.forEach(s => arr.push({ id: s.id, ...s.data() }));
  arr.forEach(f => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(f.proveedorName || '')}</td>
      <td>${escapeHtml(f.tipo || '')}</td>
      <td>${escapeHtml((f.moneda||'') + ' ' + Number(f.monto||0).toFixed(2))}</td>
      <td>${escapeHtml(f.fecha || '')}</td>
      <td>${escapeHtml(f.descripcion || '')}</td>
      <td>
        <button class="btn small edit-fac" data-id="${f.id}">✏️</button>
        <button class="btn small del-fac" data-id="${f.id}">🗑️</button>
      </td>`;
    listaFacturas.appendChild(tr);
  });
  if (countFacturas) countFacturas.textContent = arr.length;

  listaFacturas.querySelectorAll('.del-fac').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      if (!confirm('¿Eliminar factura?')) return;
      try {
        await deleteDoc(doc(db, 'facturas', id));
        showToast('Factura eliminada', 'success');
      } catch (err) {
        console.error(err);
        showToast('Error al eliminar', 'error');
      }
    };
  });

  listaFacturas.querySelectorAll('.edit-fac').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      const ref = doc(db, 'facturas', id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return showToast('Factura no encontrada', 'error');
      const f = snap.data();
      const newTipo = prompt('Tipo', f.tipo || '');
      if (newTipo === null) return;
      const newMonto = prompt('Monto', f.monto || 0);
      if (newMonto === null) return;
      try {
        await updateDoc(ref, { tipo: newTipo, monto: parseFloat(newMonto) || 0 });
        showToast('Factura actualizada', 'success');
      } catch (err) {
        console.error(err);
        showToast('Error al actualizar', 'error');
      }
    };
  });
});

/* ================= GASTOS ================= */
if (formGastos) {
  formGastos.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('gasNombre').value.trim();
    const tipo = document.getElementById('gasTipo').value.trim();
    const monto = parseFloat(document.getElementById('gasMonto').value || 0);
    const fecha = document.getElementById('gasFecha').value;
    if (!nombre || !tipo) { showToast('Nombre y Tipo obligatorios', 'error'); return; }
    if (isNaN(monto)) { showToast('Monto inválido', 'error'); return; }
    try {
      await addDoc(colGastos, { nombre, tipo, monto, fecha });
      showToast('Gasto guardado', 'success');
      formGastos.reset();
    } catch (err) {
      console.error(err);
      showToast('Error al guardar gasto', 'error');
    }
  });
}

onSnapshot(colGastos, snap => {
  listaGastos.innerHTML = '';
  const arr = [];
  snap.forEach(s => arr.push({ id: s.id, ...s.data() }));
  arr.forEach(g => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(g.nombre)}</td>
      <td>${escapeHtml(g.tipo)}</td>
      <td>${escapeHtml(Number(g.monto||0).toFixed(2))}</td>
      <td>${escapeHtml(g.fecha||'')}</td>
      <td>
        <button class="btn small edit-g" data-id="${g.id}">✏️</button>
        <button class="btn small del-g" data-id="${g.id}">🗑️</button>
      </td>`;
    listaGastos.appendChild(tr);
  });
  if (countGastos) countGastos.textContent = arr.length;

  listaGastos.querySelectorAll('.del-g').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      if (!confirm('¿Eliminar gasto?')) return;
      try {
        await deleteDoc(doc(db, 'gastos', id));
        showToast('Gasto eliminado', 'success');
      } catch (err) {
        console.error(err);
        showToast('Error al eliminar', 'error');
      }
    };
  });

  listaGastos.querySelectorAll('.edit-g').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      const ref = doc(db, 'gastos', id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return showToast('Gasto no encontrado', 'error');
      const g = snap.data();
      const newNombre = prompt('Nombre', g.nombre || '');
      if (newNombre === null) return;
      const newMonto = prompt('Monto', g.monto || 0);
      if (newMonto === null) return;
      try {
        await updateDoc(ref, { nombre: newNombre, monto: parseFloat(newMonto) || 0 });
        showToast('Gasto actualizado', 'success');
      } catch (err) {
        console.error(err);
        showToast('Error al actualizar', 'error');
      }
    };
  });
});

/* ================= SERVICIOS ================= */
if (formServicios) {
  formServicios.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('serNombre').value.trim();
    const precio = parseFloat(document.getElementById('serPrecio').value || 0);
    const fecha = document.getElementById('serFecha').value;
    const descripcion = document.getElementById('serDescripcion').value.trim();
    if (!nombre) { showToast('Nombre obligatorio', 'error'); return; }
    if (isNaN(precio)) { showToast('Precio inválido', 'error'); return; }
    try {
      await addDoc(colServicios, { nombre, precio, fecha, descripcion });
      showToast('Servicio guardado', 'success');
      formServicios.reset();
    } catch (err) {
      console.error(err);
      showToast('Error al guardar servicio', 'error');
    }
  });
}

onSnapshot(colServicios, snap => {
  listaServicios.innerHTML = '';
  const arr = [];
  snap.forEach(s => arr.push({ id: s.id, ...s.data() }));
  arr.forEach(svc => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(svc.nombre)}</td>
      <td>${escapeHtml(Number(svc.precio||0).toFixed(2))}</td>
      <td>${escapeHtml(svc.fecha||'')}</td>
      <td>${escapeHtml(svc.descripcion||'')}</td>
      <td>
        <button class="btn small edit-s" data-id="${svc.id}">✏️</button>
        <button class="btn small del-s" data-id="${svc.id}">🗑️</button>
      </td>`;
    listaServicios.appendChild(tr);
  });
  if (countServicios) countServicios.textContent = arr.length;

  listaServicios.querySelectorAll('.del-s').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      if (!confirm('¿Eliminar servicio?')) return;
      try {
        await deleteDoc(doc(db, 'servicios', id));
        showToast('Servicio eliminado', 'success');
      } catch (err) {
        console.error(err);
        showToast('Error al eliminar', 'error');
      }
    };
  });

  listaServicios.querySelectorAll('.edit-s').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      const ref = doc(db, 'servicios', id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return showToast('Servicio no encontrado', 'error');
      const s = snap.data();
      const newNombre = prompt('Nombre', s.nombre || '');
      if (newNombre === null) return;
      const newPrecio = prompt('Precio', s.precio || 0);
      if (newPrecio === null) return;
      try {
        await updateDoc(ref, { nombre: newNombre, precio: parseFloat(newPrecio) || 0 });
        showToast('Servicio actualizado', 'success');
      } catch (err) {
        console.error(err);
        showToast('Error al actualizar', 'error');
      }
    };
  });
});

/* ---------- utility ---------- */
function escapeHtml(s){
  if (s === null || s === undefined) return '';
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;');
}








