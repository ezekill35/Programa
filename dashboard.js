// dashboard.js
// Conexión a Firestore (usa firebase.js que exporta { auth, db } del SDK v10.12.0)
import { auth, db } from "./firebase.js";
import {
  collection, addDoc, doc, onSnapshot,
  updateDoc, deleteDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* ================== Helper: Toasts ================== */
function showToast(message, type = "success", ms = 2200) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast ${type === 'success' ? 'success' : 'error'}`;
  t.textContent = message;
  container.appendChild(t);
  setTimeout(() => {
    t.style.opacity = 0;
    t.style.transform = 'translateX(10px)';
    setTimeout(() => t.remove(), 300);
  }, ms);
}

/* ============ Auth check: redirige si no hay sesión ============ */
onAuthStateChanged(auth, user => {
  if (!user) {
    // No autenticado -> login
    try { window.location.href = 'index.html'; } catch (e) { console.warn('redir login', e); }
  }
});

/* ============ Navegación: resaltar sección ============ */
const navBtns = document.querySelectorAll('.nav .nav-btn');
const sections = document.querySelectorAll('.section');

function showSection(name) {
  sections.forEach(s => s.classList.remove('active'));
  const sec = document.getElementById(name);
  if (sec) sec.classList.add('active');

  navBtns.forEach(b => {
    b.classList.remove('active');
    if (b.dataset && b.dataset.section === name) {
      b.classList.add('active');
    }
  });
}

// attach events nav
navBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const s = btn.dataset.section;
    if (btn.id === 'logout' || btn.classList.contains('text-danger')) {
      signOut(auth).then(() => {
        showToast('Sesión cerrada', 'success');
        window.location.href = 'index.html';
      }).catch(err => showToast('Error logout: '+err.message,'error'));
      return;
    }
    showSection(s);
  });
});

/* ============ Referencias a DOM ============ */
// Proveedores
const formProveedores = document.getElementById('formProveedores');
const listaProveedores = document.getElementById('listaProveedores');
const countProveedores = document.getElementById('countProveedores');

// Facturas
const formFacturas = document.getElementById('formFacturas');
const listaFacturas = document.getElementById('listaFacturas');
const countFacturas = document.getElementById('countFacturas');

// Gastos
const formGastos = document.getElementById('formGastos');
const listaGastos = document.getElementById('listaGastos');
const countGastos = document.getElementById('countGastos');

// Servicios
const formServicios = document.getElementById('formServicios');
const listaServicios = document.getElementById('listaServicios');
const countServicios = document.getElementById('countServicios');

/* ============ Collections ============ */
const colProveedores = collection(db, 'proveedores');
const colFacturas   = collection(db, 'facturas');
const colGastos     = collection(db, 'gastos');
const colServicios  = collection(db, 'servicios');

/* ========================= PROVEEDORES ========================= */
if (formProveedores) {
  formProveedores.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = (document.getElementById('provNombre') || {}).value?.trim() || '';
    const producto = (document.getElementById('provProducto') || {}).value?.trim() || '';
    const ruc = (document.getElementById('provRuc') || {}).value?.trim() || '';
    const direccion = (document.getElementById('provDireccion') || {}).value?.trim() || '';

    if (!nombre || !ruc) { showToast('Nombre y RUC son obligatorios','error'); return; }

    try {
      await addDoc(colProveedores, { nombre, producto, ruc, direccion });
      showToast('Proveedor guardado', 'success');
      formProveedores.reset();
    } catch (err) {
      console.error(err);
      showToast('Error guardando proveedor','error');
    }
  });
}

// Render y onSnapshot proveedores
onSnapshot(colProveedores, snapshot => {
  listaProveedores.innerHTML = '';
  const arr = [];
  snapshot.forEach(docSnap => {
    const d = { id: docSnap.id, ...docSnap.data() };
    arr.push(d);
  });

  // tabla
  arr.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(p.nombre)}</td>
      <td>${escapeHtml(p.producto || '')}</td>
      <td>${escapeHtml(p.ruc || '')}</td>
      <td>${escapeHtml(p.direccion || '')}</td>
      <td>
        <button class="btn btn-sm btn-warning edit-prov" data-id="${p.id}">✏️</button>
        <button class="btn btn-sm btn-danger del-prov" data-id="${p.id}">🗑️</button>
      </td>
    `;
    listaProveedores.appendChild(tr);
  });

  // actualizar contador
  if (countProveedores) countProveedores.textContent = arr.length;

  // rellenar selector/datalist para facturas si existe
  const facProveedorEl = document.getElementById('facProveedor');
  if (facProveedorEl) {
    // si es <select>
    if (facProveedorEl.tagName.toLowerCase() === 'select') {
      facProveedorEl.innerHTML = '<option value="">-- Selecciona proveedor --</option>';
      arr.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.nombre} — ${p.ruc}`;
        facProveedorEl.appendChild(opt);
      });
    } else {
      // si es <input>, intenta encontrar un datalist con id facProveedorList
      const listId = facProveedorEl.getAttribute('list') || 'facProveedorList';
      let ds = document.getElementById(listId);
      if (!ds) {
        ds = document.createElement('datalist');
        ds.id = listId;
        document.body.appendChild(ds);
        facProveedorEl.setAttribute('list', listId);
      }
      ds.innerHTML = '';
      arr.forEach(p => {
        const option = document.createElement('option');
        option.value = `${p.nombre} — ${p.ruc}`;
        option.dataset.id = p.id;
        ds.appendChild(option);
      });
    }
  }

  // attach delegated events
  // editar proveedor
  listaProveedores.querySelectorAll('.edit-prov').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      const docRef = doc(db, 'proveedores', id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) { showToast('Proveedor no encontrado','error'); return; }
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
        await updateDoc(docRef, { nombre: nuevoNombre, producto: nuevoProducto, ruc: nuevoRuc, direccion: nuevaDir });
        showToast('Proveedor actualizado','success');
      } catch (err) { console.error(err); showToast('Error actualizando','error'); }
    };
  });

  // eliminar proveedor
  listaProveedores.querySelectorAll('.del-prov').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      if (!confirm('¿Eliminar proveedor?')) return;
      try {
        await deleteDoc(doc(db, 'proveedores', id));
        showToast('Proveedor eliminado','success');
      } catch (err) { console.error(err); showToast('Error eliminando','error'); }
    };
  });
});

/* ========================= FACTURAS ========================= */
if (formFacturas) {
  formFacturas.addEventListener('submit', async (e) => {
    e.preventDefault();
    // proveedor: if select -> docId otherwise, allow free text (store as text)
    const facProveedorEl = document.getElementById('facProveedor');
    let proveedorId = '';
    let proveedorText = '';
    if (facProveedorEl) {
      if (facProveedorEl.tagName.toLowerCase() === 'select') {
        proveedorId = facProveedorEl.value || '';
      } else {
        // input + datalist: try find matching option to get id
        const listId = facProveedorEl.getAttribute('list');
        proveedorText = facProveedorEl.value?.trim() || '';
        if (listId) {
          const ds = document.getElementById(listId);
          if (ds) {
            const opt = Array.from(ds.options).find(o => o.value === proveedorText);
            if (opt && opt.dataset && opt.dataset.id) proveedorId = opt.dataset.id;
          }
        }
      }
    }

    const tipo = (document.getElementById('facTipo') || {}).value?.trim() || '';
    const monto = parseFloat((document.getElementById('facMonto') || {}).value || 0);
    const moneda = (document.getElementById('facMoneda') || {}).value?.trim() || '';
    const fecha = (document.getElementById('facFecha') || {}).value || '';
    const descripcion = (document.getElementById('facDescripcion') || {}).value?.trim() || '';

    if ((!proveedorId && !proveedorText) || !tipo) { showToast('Proveedor y Tipo son obligatorios','error'); return; }
    if (isNaN(monto)) { showToast('Monto inválido','error'); return; }

    try {
      // if have proveedorId, denormalize name and ruc
      let provName = proveedorText, provRuc = '';
      if (proveedorId) {
        const provSnap = await getDoc(doc(db, 'proveedores', proveedorId));
        if (provSnap.exists()) {
          const pd = provSnap.data();
          provName = pd.nombre || provName;
          provRuc = pd.ruc || '';
        }
      }
      await addDoc(colFacturas, {
        proveedorId: proveedorId || null,
        proveedorName: provName,
        proveedorRuc: provRuc,
        tipo, monto, moneda, fecha, descripcion
      });
      showToast('Factura guardada','success');
      formFacturas.reset();
    } catch (err) {
      console.error(err);
      showToast('Error guardando factura','error');
    }
  });
}

// onSnapshot facturas
onSnapshot(colFacturas, snapshot => {
  listaFacturas.innerHTML = '';
  const arr = [];
  snapshot.forEach(snap => arr.push({ id: snap.id, ...snap.data() }));
  arr.forEach(f => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(f.proveedorName || f.proveedorId || '')}</td>
      <td>${escapeHtml(f.tipo || '')}</td>
      <td>${escapeHtml((f.moneda||'') + ' ' + (Number(f.monto||0).toFixed(2)))}</td>
      <td>${escapeHtml(f.fecha || '')}</td>
      <td>${escapeHtml(f.descripcion || '')}</td>
      <td>
        <button class="btn btn-sm btn-warning edit-fac" data-id="${f.id}">✏️</button>
        <button class="btn btn-sm btn-danger del-fac" data-id="${f.id}">🗑️</button>
      </td>`;
    listaFacturas.appendChild(tr);
  });
  if (countFacturas) countFacturas.textContent = arr.length;

  // attach edit/delete
  listaFacturas.querySelectorAll('.del-fac').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      if (!confirm('¿Eliminar factura?')) return;
      try { await deleteDoc(doc(db, 'facturas', id)); showToast('Factura eliminada','success'); } catch(e){ console.error(e); showToast('Error','error'); }
    };
  });
  listaFacturas.querySelectorAll('.edit-fac').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      const snap = await getDoc(doc(db, 'facturas', id));
      if (!snap.exists()) { showToast('Factura no encontrada','error'); return; }
      const f = snap.data();
      const newTipo = prompt('Tipo', f.tipo || '');
      if (newTipo === null) return;
      const newMonto = prompt('Monto', f.monto || 0);
      if (newMonto === null) return;
      const newFecha = prompt('Fecha (YYYY-MM-DD)', f.fecha || '');
      if (newFecha === null) return;
      const newDesc = prompt('Descripción', f.descripcion || '');
      if (newDesc === null) return;
      try {
        await updateDoc(doc(db,'facturas',id), { tipo: newTipo, monto: parseFloat(newMonto)||0, fecha: newFecha, descripcion: newDesc });
        showToast('Factura actualizada','success');
      } catch (e) { console.error(e); showToast('Error actualizando','error'); }
    };
  });
});

/* ========================= GASTOS ========================= */
if (formGastos) {
  formGastos.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = (document.getElementById('gasNombre') || {}).value?.trim() || '';
    const tipo = (document.getElementById('gasTipo') || {}).value?.trim() || '';
    const monto = parseFloat((document.getElementById('gasMonto') || {}).value || 0);
    const fecha = (document.getElementById('gasFecha') || {}).value || '';
    if (!nombre || !tipo) { showToast('Nombre y Tipo son obligatorios','error'); return; }
    if (isNaN(monto)) { showToast('Monto inválido','error'); return; }
    try {
      await addDoc(colGastos, { nombre, tipo, monto, fecha });
      showToast('Gasto guardado','success');
      formGastos.reset();
    } catch (err) { console.error(err); showToast('Error guardando gasto','error'); }
  });
}

onSnapshot(colGastos, snap => {
  listaGastos.innerHTML = '';
  const arr = [];
  snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
  arr.forEach(g => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(g.nombre)}</td>
      <td>${escapeHtml(g.tipo)}</td>
      <td>${escapeHtml(Number(g.monto||0).toFixed(2))}</td>
      <td>${escapeHtml(g.fecha||'')}</td>
      <td>
        <button class="btn btn-sm btn-warning edit-gasto" data-id="${g.id}">✏️</button>
        <button class="btn btn-sm btn-danger del-gasto" data-id="${g.id}">🗑️</button>
      </td>`;
    listaGastos.appendChild(tr);
  });
  if (countGastos) countGastos.textContent = arr.length;

  // attach events
  listaGastos.querySelectorAll('.del-gasto').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      if (!confirm('¿Eliminar gasto?')) return;
      try { await deleteDoc(doc(db,'gastos',id)); showToast('Gasto eliminado','success'); } catch(e){ console.error(e); showToast('Error','error'); }
    };
  });
  listaGastos.querySelectorAll('.edit-gasto').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      const snap = await getDoc(doc(db,'gastos',id));
      if (!snap.exists()) return showToast('No encontrado','error');
      const g = snap.data();
      const newNombre = prompt('Nombre', g.nombre||''); if (newNombre === null) return;
      const newTipo = prompt('Tipo', g.tipo||''); if (newTipo === null) return;
      const newMonto = prompt('Monto', g.monto||0); if (newMonto === null) return;
      const newFecha = prompt('Fecha', g.fecha||''); if (newFecha === null) return;
      try { await updateDoc(doc(db,'gastos',id), { nombre:newNombre, tipo:newTipo, monto: parseFloat(newMonto)||0, fecha:newFecha }); showToast('Gasto actualizado','success'); } catch(e){ console.error(e); showToast('Error','error'); }
    };
  });
});

/* ========================= SERVICIOS ========================= */
if (formServicios) {
  formServicios.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = (document.getElementById('serNombre') || {}).value?.trim() || '';
    const precio = parseFloat((document.getElementById('serPrecio') || {}).value || 0);
    const fecha = (document.getElementById('serFecha') || {}).value || '';
    const descripcion = (document.getElementById('serDescripcion') || {}).value?.trim() || '';
    if (!nombre) { showToast('Nombre es obligatorio','error'); return; }
    if (isNaN(precio)) { showToast('Precio inválido','error'); return; }
    try {
      await addDoc(colServicios, { nombre, precio, fecha, descripcion });
      showToast('Servicio guardado','success');
      formServicios.reset();
    } catch (err) { console.error(err); showToast('Error guardando servicio','error'); }
  });
}

onSnapshot(colServicios, snap => {
  listaServicios.innerHTML = '';
  const arr = [];
  snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
  arr.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(s.nombre)}</td>
      <td>${escapeHtml(Number(s.precio||0).toFixed(2))}</td>
      <td>${escapeHtml(s.fecha||'')}</td>
      <td>${escapeHtml(s.descripcion||'')}</td>
      <td>
        <button class="btn btn-sm btn-warning edit-serv" data-id="${s.id}">✏️</button>
        <button class="btn btn-sm btn-danger del-serv" data-id="${s.id}">🗑️</button>
      </td>`;
    listaServicios.appendChild(tr);
  });
  if (countServicios) countServicios.textContent = arr.length;

  // attach events
  listaServicios.querySelectorAll('.del-serv').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      if (!confirm('¿Eliminar servicio?')) return;
      try { await deleteDoc(doc(db,'servicios',id)); showToast('Servicio eliminado','success'); } catch(e){ console.error(e); showToast('Error','error'); }
    };
  });
  listaServicios.querySelectorAll('.edit-serv').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      const snap = await getDoc(doc(db,'servicios',id));
      if (!snap.exists()) return showToast('No encontrado','error');
      const s = snap.data();
      const newNombre = prompt('Nombre', s.nombre||''); if (newNombre === null) return;
      const newPrecio = prompt('Precio', s.precio||0); if (newPrecio === null) return;
      const newFecha = prompt('Fecha', s.fecha||''); if (newFecha === null) return;
      const newDesc = prompt('Descripción', s.descripcion||''); if (newDesc === null) return;
      try { await updateDoc(doc(db,'servicios',id), { nombre:newNombre, precio: parseFloat(newPrecio)||0, fecha:newFecha, descripcion:newDesc }); showToast('Servicio actualizado','success'); } catch(e){ console.error(e); showToast('Error','error'); }
    };
  });
});

/* ============ Utilities ============ */
function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}








