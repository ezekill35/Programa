// dashboard.js
import { auth, db } from "./firebase.js";
import {
  collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* ---------- Toast helper ---------- */
function toast(msg, type = 'success', time = 2000) {
  let container = document.querySelector('.toast-area');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-area';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.classList.add('visible'), 50);
  setTimeout(() => { el.classList.remove('visible'); setTimeout(()=>el.remove(),300); }, time);
}

/* ---------- Auth gate: redirect if not logged ---------- */
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = 'index.html';
  }
});

/* ---------- Navigation ---------- */
const menuBtns = document.querySelectorAll('.menu-btn');
const sections = document.querySelectorAll('.section');
menuBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.id === 'btnLogout' || btn.classList.contains('logout')) {
      signOut(auth).then(()=> {
        toast('Sesión cerrada', 'success');
        setTimeout(()=> window.location.href = 'index.html', 600);
      }).catch(err => toast(err.message, 'error'));
      return;
    }
    menuBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const sec = btn.dataset.section;
    sections.forEach(s => s.classList.remove('active'));
    document.getElementById(sec).classList.add('active');
  });
});

/* ---------- Refs DOM ---------- */
// counts
const countProveedores = document.getElementById('countProveedores');
const countFacturas = document.getElementById('countFacturas');
const countGastos = document.getElementById('countGastos');
const countServicios = document.getElementById('countServicios');

// providers
const formProveedores = document.getElementById('formProveedores');
const listaProveedores = document.getElementById('listaProveedores');

// invoices
const formFacturas = document.getElementById('formFacturas');
const facProveedor = document.getElementById('facProveedor');
const listaFacturas = document.getElementById('listaFacturas');

// gastos
const formGastos = document.getElementById('formGastos');
const listaGastos = document.getElementById('listaGastos');

// servicios
const formServicios = document.getElementById('formServicios');
const listaServicios = document.getElementById('listaServicios');

/* ---------- Collections ---------- */
const colProveedores = collection(db, 'proveedores');
const colFacturas   = collection(db, 'facturas');
const colGastos     = collection(db, 'gastos');
const colServicios  = collection(db, 'servicios');

/* ========== PROVEEDORES ========== */
if (formProveedores) {
  formProveedores.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('provNombre').value.trim();
    const producto = document.getElementById('provProducto').value.trim();
    const ruc = document.getElementById('provRuc').value.trim();
    const direccion = document.getElementById('provDireccion').value.trim();
    if (!nombre || !ruc) { toast('RUC y Nombre son obligatorios','error'); return; }
    try {
      await addDoc(colProveedores, { nombre, producto, ruc, direccion });
      toast('Proveedor guardado','success');
      formProveedores.reset();
    } catch (err) { console.error(err); toast('Error al guardar','error'); }
  });
}

onSnapshot(colProveedores, snapshot => {
  listaProveedores.innerHTML = '';
  const arr = [];
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
      </td>
    `;
    listaProveedores.appendChild(tr);
  });
  if (countProveedores) countProveedores.textContent = arr.length;

  // fill select facProveedor
  if (facProveedor) {
    facProveedor.innerHTML = '<option value="">-- Selecciona proveedor --</option>';
    arr.forEach(p => {
      const o = document.createElement('option'); o.value = p.id; o.textContent = `${p.nombre} — ${p.ruc}`; facProveedor.appendChild(o);
    });
  }

  // attach events edit/delete
  listaProveedores.querySelectorAll('.del-prov').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      if (!confirm('¿Eliminar proveedor?')) return;
      try { await deleteDoc(doc(db, 'proveedores', id)); toast('Proveedor eliminado','success'); } catch(e){ console.error(e); toast('Error','error'); }
    };
  });
  listaProveedores.querySelectorAll('.edit-prov').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      const ref = doc(db, 'proveedores', id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return toast('No encontrado','error');
      const data = snap.data();
      const nuevoNombre = prompt('Nombre', data.nombre || '');
      if (nuevoNombre === null) return;
      const nuevoProducto = prompt('Producto', data.producto || '');
      if (nuevoProducto === null) return;
      const nuevoRuc = prompt('RUC', data.ruc || '');
      if (nuevoRuc === null) return;
      const nuevaDir = prompt('Dirección', data.direccion || '');
      if (nuevaDir === null) return;
      try { await updateDoc(ref, { nombre: nuevoNombre, producto: nuevoProducto, ruc: nuevoRuc, direccion: nuevaDir }); toast('Proveedor actualizado','success'); } catch(e){ console.error(e); toast('Error','error'); }
    };
  });
});

/* ========== FACTURAS ========== */
if (formFacturas) {
  formFacturas.addEventListener('submit', async (e) => {
    e.preventDefault();
    const proveedorId = facProveedor.value;
    const tipo = document.getElementById('facTipo').value.trim();
    const monto = parseFloat(document.getElementById('facMonto').value || 0);
    const moneda = document.getElementById('facMoneda').value;
    const fecha = document.getElementById('facFecha').value;
    const descripcion = document.getElementById('facDescripcion').value.trim();

    if (!proveedorId || !tipo) { toast('Proveedor y Tipo obligatorios','error'); return; }
    if (isNaN(monto)) { toast('Monto inválido','error'); return; }

    try {
      // denormalize provider name & ruc
      let provName = '', provRuc = '';
      const provSnap = await getDoc(doc(db,'proveedores',proveedorId));
      if (provSnap.exists()) {
        const pd = provSnap.data(); provName = pd.nombre||''; provRuc = pd.ruc||'';
      }
      await addDoc(colFacturas, { proveedorId, proveedorName: provName, proveedorRuc: provRuc, tipo, monto, moneda, fecha, descripcion });
      toast('Factura guardada','success');
      formFacturas.reset();
    } catch (err) { console.error(err); toast('Error al guardar','error'); }
  });
}

onSnapshot(colFacturas, snap => {
  listaFacturas.innerHTML = '';
  const arr = [];
  snap.forEach(s => arr.push({ id: s.id, ...s.data() }));
  arr.forEach(f => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(f.proveedorName||'')}</td>
      <td>${escapeHtml(f.tipo||'')}</td>
      <td>${escapeHtml((f.moneda||'') + ' ' + Number(f.monto||0).toFixed(2))}</td>
      <td>${escapeHtml(f.fecha||'')}</td>
      <td>${escapeHtml(f.descripcion||'')}</td>
      <td>
        <button class="btn small edit-fac" data-id="${f.id}">✏️</button>
        <button class="btn small del-fac" data-id="${f.id}">🗑️</button>
      </td>
    `;
    listaFacturas.appendChild(tr);
  });
  if (countFacturas) countFacturas.textContent = arr.length;

  listaFacturas.querySelectorAll('.del-fac').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      if (!confirm('¿Eliminar factura?')) return;
      try { await deleteDoc(doc(db,'facturas',id)); toast('Factura eliminada','success'); } catch(e){ console.error(e); toast('Error','error'); }
    };
  });

  listaFacturas.querySelectorAll('.edit-fac').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      const snap = await getDoc(doc(db,'facturas',id));
      if (!snap.exists()) return toast('No encontrado','error');
      const f = snap.data();
      const newTipo = prompt('Tipo', f.tipo || '');
      if (newTipo === null) return;
      const newMonto = prompt('Monto', f.monto || 0);
      if (newMonto === null) return;
      try { await updateDoc(doc(db,'facturas',id), { tipo: newTipo, monto: parseFloat(newMonto) || 0 }); toast('Factura actualizada','success'); } catch(e){ console.error(e); toast('Error','error'); }
    };
  });
});

/* ========== GASTOS ========== */
if (formGastos) {
  formGastos.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('gasNombre').value.trim();
    const tipo = document.getElementById('gasTipo').value.trim();
    const monto = parseFloat(document.getElementById('gasMonto').value || 0);
    const fecha = document.getElementById('gasFecha').value;
    if (!nombre || !tipo) { toast('Nombre y Tipo obligatorios','error'); return; }
    if (isNaN(monto)) { toast('Monto inválido','error'); return; }
    try { await addDoc(colGastos, { nombre, tipo, monto, fecha }); toast('Gasto guardado','success'); formGastos.reset(); } catch(e){ console.error(e); toast('Error','error'); }
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
      </td>
    `;
    listaGastos.appendChild(tr);
  });
  if (countGastos) countGastos.textContent = arr.length;

  listaGastos.querySelectorAll('.del-g').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      if (!confirm('¿Eliminar gasto?')) return;
      try { await deleteDoc(doc(db,'gastos',id)); toast('Gasto eliminado','success'); } catch(e){ console.error(e); toast('Error','error'); }
    };
  });
  listaGastos.querySelectorAll('.edit-g').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      const snap = await getDoc(doc(db,'gastos',id));
      if (!snap.exists()) return toast('No encontrado','error');
      const g = snap.data();
      const newNombre = prompt('Nombre', g.nombre||''); if (newNombre === null) return;
      const newMonto = prompt('Monto', g.monto||0); if (newMonto === null) return;
      try { await updateDoc(doc(db,'gastos',id), { nombre: newNombre, monto: parseFloat(newMonto)||0 }); toast('Gasto actualizado','success'); } catch(e){ console.error(e); toast('Error','error'); }
    };
  });
});

/* ========== SERVICIOS ========== */
if (formServicios) {
  formServicios.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('serNombre').value.trim();
    const precio = parseFloat(document.getElementById('serPrecio').value || 0);
    const fecha = document.getElementById('serFecha').value;
    const descripcion = document.getElementById('serDescripcion').value.trim();
    if (!nombre) { toast('Nombre obligatorio','error'); return; }
    if (isNaN(precio)) { toast('Precio inválido','error'); return; }
    try { await addDoc(colServicios, { nombre, precio, fecha, descripcion }); toast('Servicio guardado','success'); formServicios.reset(); } catch(e){ console.error(e); toast('Error','error'); }
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
      </td>
    `;
    listaServicios.appendChild(tr);
  });
  if (countServicios) countServicios.textContent = arr.length;

  listaServicios.querySelectorAll('.del-s').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id; if (!confirm('¿Eliminar servicio?')) return;
      try { await deleteDoc(doc(db,'servicios',id)); toast('Servicio eliminado','success'); } catch(e){ console.error(e); toast('Error','error'); }
    };
  });
  listaServicios.querySelectorAll('.edit-s').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      const snap = await getDoc(doc(db,'servicios',id));
      if (!snap.exists()) return toast('No encontrado','error');
      const s = snap.data();
      const nm = prompt('Nombre', s.nombre||''); if (nm === null) return;
      const pr = prompt('Precio', s.precio||0); if (pr === null) return;
      try { await updateDoc(doc(db,'servicios',id), { nombre: nm, precio: parseFloat(pr)||0 }); toast('Servicio actualizado','success'); } catch(e){ console.error(e); toast('Error','error'); }
    };
  });
});

/* ---------- utils ---------- */
function escapeHtml(s){ if (s===null||s===undefined) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }








