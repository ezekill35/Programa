// dashboard.js
import { auth, db } from "./firebase.js";
import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* ---------------------- Helpers UI ---------------------- */
const toastSuccess = (t) => {
  if (window.Swal) Swal.fire({ toast:true, position:'top-end', icon:'success', title:t, showConfirmButton:false, timer:2000 });
  else alert(t);
};
const toastError = (t) => {
  if (window.Swal) Swal.fire({ toast:true, position:'top-end', icon:'error', title:t, showConfirmButton:false, timer:2500 });
  else alert(t);
};

/* ---------------------- Navigation ---------------------- */
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    const id = link.id.replace('menu-','');
    sections.forEach(s => s.style.display = 'none');
    if (id === 'logout') {
      signOut(auth).then(()=> window.location.href = 'index.html');
      return;
    }
    const target = document.getElementById(id);
    if (target) target.style.display = 'block';
  });
});

/* ---------------------- Collections ---------------------- */
const colProveedores = collection(db, 'proveedores');
const colFacturas   = collection(db, 'facturas');
const colGastos     = collection(db, 'gastos');
const colServicios  = collection(db, 'servicios');

/* ---------------------- PROVEEDORES ---------------------- */
const listaProveedores = document.getElementById('listaProveedores');
document.getElementById('btnAgregarProveedor').addEventListener('click', async () => {
  const ruc = document.getElementById('provRuc').value.trim();
  const nombre = document.getElementById('provNombre').value.trim();
  const direccion = document.getElementById('provDireccion').value.trim();
  const telefono = document.getElementById('provTelefono').value.trim();
  const producto = document.getElementById('provProducto').value.trim();

  if (!ruc || !nombre) return toastError('RUC y Nombre son obligatorios');
  if (telefono && isNaN(telefono)) return toastError('Teléfono inválido');

  try {
    await addDoc(colProveedores, { ruc, nombre, direccion, telefono, producto });
    toastSuccess('Proveedor guardado');
    document.getElementById('formProveedor').reset();
  } catch (err) {
    console.error(err);
    toastError('Error al guardar proveedor');
  }
});

onSnapshot(colProveedores, snapshot => {
  const arr = [];
  snapshot.forEach(d => arr.push({ id: d.id, ...d.data() }));
  renderTable(listaProveedores, arr, ['ruc','nombre','direccion','telefono','producto'], 'proveedores');
  document.getElementById('total-proveedores').textContent = arr.length;

  // llenar select proveedores (valor = docId, text = "Nombre — RUC")
  const sel = document.getElementById('facProveedor');
  if (sel) {
    sel.innerHTML = '<option value="">-- Selecciona proveedor --</option>';
    arr.forEach(p => sel.innerHTML += `<option value="${p.id}">${p.nombre} — ${p.ruc}</option>`);
  }
});

/* ---------------------- FACTURAS ---------------------- */
const listaFacturas = document.getElementById('listaFacturas');
document.getElementById('btnAgregarFactura').addEventListener('click', async () => {
  const proveedorId = document.getElementById('facProveedor').value;
  const tipo = document.getElementById('facTipo').value.trim();
  const descripcion = document.getElementById('facDescripcion').value.trim();
  const fecha = document.getElementById('facFecha').value;
  const monto = parseFloat(document.getElementById('facMonto').value || 0);
  const moneda = document.getElementById('facMoneda').value || 'S/.';

  if (!proveedorId || !tipo) return toastError('Proveedor y Tipo son obligatorios');
  if (isNaN(monto)) return toastError('Monto inválido');

  // obtain provider name & ruc to store for quick display (denormalización)
  let proveedorDoc = null;
  try {
    // we don't import getDoc here to avoid extra calls; assume firestore snapshot keeps list in UI
    // But to be safe, we will store proveedorId and later display by lookup from latest snapshot array (renderTable callback handles it)
    await addDoc(colFacturas, { proveedorId, tipo, descripcion, fecha, monto, moneda });
    toastSuccess('Factura guardada');
    document.getElementById('formFactura').reset();
  } catch (err) {
    console.error(err);
    toastError('Error al guardar factura');
  }
});

onSnapshot(colFacturas, snapshot => {
  const arr = [];
  snapshot.forEach(d => arr.push({ id: d.id, ...d.data() }));
  // We want to display proveedor name — ruc in table. We'll read current providers snapshot via a closure variable populated above.
  renderTable(listaFacturas, arr, ['proveedorDisplay','tipo','descripcion','fecha','monto'], 'facturas', (tr, item) => {
    // monto formatting
    const montoTd = tr.querySelector('[data-field="monto"]');
    if (montoTd) montoTd.textContent = `${item.moneda || ''}${Number(item.monto || 0).toFixed(2)}`;
    // proveedorDisplay: resolve name — ruc from providers table (we keep providers rendered and can query DOM or use global map)
    const provTd = tr.querySelector('[data-field="proveedorDisplay"]');
    if (provTd) {
      // try to find option text in facProveedor select (it was filled with "name — ruc")
      const sel = document.getElementById('facProveedor');
      let text = '';
      if (sel) {
        const opt = sel.querySelector(`option[value="${item.proveedorId}"]`);
        if (opt) text = opt.textContent;
      }
      provTd.textContent = text || (item.proveedorName ? `${item.proveedorName} — ${item.proveedorRuc || ''}` : item.proveedorId);
    }
  });
  document.getElementById('total-facturas').textContent = arr.length;
});

/* ---------------------- GASTOS ---------------------- */
const listaGastos = document.getElementById('listaGastos');
document.getElementById('btnAgregarGasto').addEventListener('click', async () => {
  const nombre = document.getElementById('gastoNombre').value.trim();
  const tipo = document.getElementById('gastoTipo').value.trim();
  const monto = parseFloat(document.getElementById('gastoMonto').value || 0);
  const fecha = document.getElementById('gastoFecha').value;

  if (!nombre || !tipo) return toastError('Nombre y Tipo obligatorios');
  if (isNaN(monto)) return toastError('Monto inválido');

  try {
    await addDoc(colGastos, { nombre, tipo, monto, fecha });
    toastSuccess('Gasto guardado');
    document.getElementById('formGasto').reset();
  } catch (err) {
    console.error(err);
    toastError('Error al guardar gasto');
  }
});

onSnapshot(colGastos, snapshot => {
  const arr = [];
  snapshot.forEach(d => arr.push({ id: d.id, ...d.data() }));
  renderTable(listaGastos, arr, ['nombre','tipo','monto','fecha'], 'gastos', (tr, item) => {
    const montoTd = tr.querySelector('[data-field="monto"]');
    if (montoTd) montoTd.textContent = Number(item.monto || 0).toFixed(2);
  });
  document.getElementById('total-gastos').textContent = arr.length;
});

/* ---------------------- SERVICIOS ---------------------- */
const listaServicios = document.getElementById('listaServicios');
document.getElementById('btnAgregarServicio').addEventListener('click', async () => {
  const nombre = document.getElementById('servNombre').value.trim();
  const descripcion = document.getElementById('servDescripcion').value.trim();
  const precio = parseFloat(document.getElementById('servPrecio').value || 0);
  const fecha = document.getElementById('servFecha').value;

  if (!nombre) return toastError('Nombre obligatorio');
  if (isNaN(precio)) return toastError('Precio inválido');

  try {
    await addDoc(colServicios, { nombre, descripcion, precio, fecha });
    toastSuccess('Servicio guardado');
    document.getElementById('formServicio').reset();
  } catch (err) {
    console.error(err);
    toastError('Error al guardar servicio');
  }
});

onSnapshot(colServicios, snapshot => {
  const arr = [];
  snapshot.forEach(d => arr.push({ id: d.id, ...d.data() }));
  renderTable(listaServicios, arr, ['nombre','descripcion','precio','fecha'], 'servicios', (tr, item) => {
    const precioTd = tr.querySelector('[data-field="precio"]');
    if (precioTd) precioTd.textContent = Number(item.precio || 0).toFixed(2);
  });
  document.getElementById('total-servicios').textContent = arr.length;
});

/* ---------------------- Generic renderTable ---------------------- */
/**
 * tbodyEl: DOM tbody
 * data: array of objects
 * fields: array of field names to render (use 'proveedorDisplay' or similar for custom display)
 * collectionName: string used for delete/edit doc path
 * rowCallback: optional (tr, item) custom formatting
 */
function renderTable(tbodyEl, data, fields, collectionName, rowCallback) {
  tbodyEl.innerHTML = '';
  data.forEach(item => {
    const tr = document.createElement('tr');

    fields.forEach(f => {
      const td = document.createElement('td');
      td.setAttribute('data-field', f);
      // default value: item[f] or empty
      td.textContent = item[f] !== undefined ? item[f] : '';
      tr.appendChild(td);
    });

    // actions
    const tdActions = document.createElement('td');
    tdActions.innerHTML = `
      <button class="btn btn-sm btn-warning me-1" data-id="${item.id}" data-type="${collectionName}" data-action="edit">✏️</button>
      <button class="btn btn-sm btn-danger" data-id="${item.id}" data-type="${collectionName}" data-action="delete">🗑️</button>
    `;
    tr.appendChild(tdActions);
    tbodyEl.appendChild(tr);

    // optional formatting
    if (typeof rowCallback === 'function') rowCallback(tr, item);
  });

  // delegate actions (edit/delete)
  tbodyEl.querySelectorAll('button[data-action]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const type = btn.dataset.type;
      const action = btn.dataset.action;

      if (action === 'delete') {
        const r = await Swal.fire({
          title: '¿Eliminar?',
          text: 'Esta acción no se puede deshacer',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar'
        });
        if (r.isConfirmed) {
          try {
            await deleteDoc(doc(db, type, id));
            toastSuccess('Eliminado');
          } catch (err) {
            console.error(err);
            toastError('Error al eliminar');
          }
        }
      }

      if (action === 'edit') {
        // show edit forms according to collection type
        try {
          if (type === 'proveedores') {
            const existing = (await getCurrentSnapshot(type)).find(x=>x.id===id);
            const { value } = await Swal.fire({
              title: 'Editar proveedor',
              html:
                `<input id="sw_ruc" class="swal2-input" placeholder="RUC" value="${existing.ruc||''}">` +
                `<input id="sw_nombre" class="swal2-input" placeholder="Nombre" value="${existing.nombre||''}">` +
                `<input id="sw_direccion" class="swal2-input" placeholder="Dirección" value="${existing.direccion||''}">` +
                `<input id="sw_telefono" class="swal2-input" placeholder="Teléfono" value="${existing.telefono||''}">` +
                `<input id="sw_producto" class="swal2-input" placeholder="Producto" value="${existing.producto||''}">`,
              focusConfirm: false,
              preConfirm: () => ({
                ruc: document.getElementById('sw_ruc').value,
                nombre: document.getElementById('sw_nombre').value,
                direccion: document.getElementById('sw_direccion').value,
                telefono: document.getElementById('sw_telefono').value,
                producto: document.getElementById('sw_producto').value
              })
            });
            if (value) {
              await updateDoc(doc(db, 'proveedores', id), value);
              toastSuccess('Proveedor actualizado');
            }
          } else if (type === 'facturas') {
            const existing = (await getCurrentSnapshot(type)).find(x=>x.id===id);
            const { value } = await Swal.fire({
              title: 'Editar factura',
              html:
                `<select id="sw_prov" class="swal2-input">${buildProvOptionsForSwal()}</select>` +
                `<input id="sw_tipo" class="swal2-input" placeholder="Tipo" value="${existing.tipo||''}">` +
                `<input id="sw_desc" class="swal2-input" placeholder="Descripción" value="${existing.descripcion||''}">` +
                `<input id="sw_fecha" type="date" class="swal2-input" value="${existing.fecha||''}">` +
                `<input id="sw_monto" type="number" step="0.01" class="swal2-input" placeholder="Monto" value="${existing.monto||0}">` +
                `<input id="sw_mon" class="swal2-input" placeholder="Moneda" value="${existing.moneda||'S/.'}">`,
              focusConfirm: false,
              preConfirm: () => ({
                proveedorId: document.getElementById('sw_prov').value,
                tipo: document.getElementById('sw_tipo').value,
                descripcion: document.getElementById('sw_desc').value,
                fecha: document.getElementById('sw_fecha').value,
                monto: parseFloat(document.getElementById('sw_monto').value||0),
                moneda: document.getElementById('sw_mon').value
              })
            });
            if (value) {
              await updateDoc(doc(db, 'facturas', id), value);
              toastSuccess('Factura actualizada');
            }
          } else if (type === 'gastos') {
            const existing = (await getCurrentSnapshot(type)).find(x=>x.id===id);
            const { value } = await Swal.fire({
              title: 'Editar gasto',
              html:
                `<input id="sw_nombre" class="swal2-input" placeholder="Nombre" value="${existing.nombre||''}">` +
                `<input id="sw_tipo" class="swal2-input" placeholder="Tipo" value="${existing.tipo||''}">` +
                `<input id="sw_monto" type="number" class="swal2-input" placeholder="Monto" value="${existing.monto||0}">` +
                `<input id="sw_fecha" type="date" class="swal2-input" value="${existing.fecha||''}">`,
              focusConfirm: false,
              preConfirm: () => ({
                nombre: document.getElementById('sw_nombre').value,
                tipo: document.getElementById('sw_tipo').value,
                monto: parseFloat(document.getElementById('sw_monto').value||0),
                fecha: document.getElementById('sw_fecha').value
              })
            });
            if (value) {
              await updateDoc(doc(db, 'gastos', id), value);
              toastSuccess('Gasto actualizado');
            }
          } else if (type === 'servicios') {
            const existing = (await getCurrentSnapshot(type)).find(x=>x.id===id);
            const { value } = await Swal.fire({
              title: 'Editar servicio',
              html:
                `<input id="sw_nombre" class="swal2-input" placeholder="Nombre" value="${existing.nombre||''}">` +
                `<input id="sw_desc" class="swal2-input" placeholder="Descripción" value="${existing.descripcion||''}">` +
                `<input id="sw_precio" type="number" class="swal2-input" placeholder="Precio" value="${existing.precio||0}">` +
                `<input id="sw_fecha" type="date" class="swal2-input" value="${existing.fecha||''}">`,
              focusConfirm: false,
              preConfirm: () => ({
                nombre: document.getElementById('sw_nombre').value,
                descripcion: document.getElementById('sw_desc').value,
                precio: parseFloat(document.getElementById('sw_precio').value||0),
                fecha: document.getElementById('sw_fecha').value
              })
            });
            if (value) {
              await updateDoc(doc(db, 'servicios', id), value);
              toastSuccess('Servicio actualizado');
            }
          }
        } catch (err) {
          console.error(err);
          toastError('Error al editar');
        }
      }
    };
  });
}

/* ---------------------- Utilities to build provider options for Swal ---------------------- */
function buildProvOptionsForSwal() {
  const sel = document.getElementById('facProveedor');
  if (!sel) return '<option value="">--no prov--</option>';
  let html = '';
  sel.querySelectorAll('option').forEach(opt => {
    html += `<option value="${opt.value}">${opt.textContent}</option>`;
  });
  return html;
}

/* ---------------------- Helper: snapshots cache ---------------------- */
/**
 * We read current rendered DOM for providers/facturas/gastos/servicios
 * to get existing items for editing prompts. Simpler than extra getDoc calls.
 */
async function getCurrentSnapshot(type) {
  const mapping = {
    proveedores: 'listaProveedores',
    facturas: 'listaFacturas',
    gastos: 'listaGastos',
    servicios: 'listaServicios'
  };
  const tbodyId = mapping[type];
  if (!tbodyId) return [];
  const tbody = document.getElementById(tbodyId);
  // Build array by reading DOM rows dataset (we store doc ids in action buttons)
  const rows = Array.from(tbody.querySelectorAll('tr'));
  // we'll map to objects by reading cell text — adequate for prefill in edit modal
  return rows.map(r => {
    const idBtn = r.querySelector('button[data-id]');
    const id = idBtn ? idBtn.dataset.id : null;
    const cells = Array.from(r.children).slice(0, -1).map(td => td.textContent);
    // return generic object — specific fields will be retrieved in edit flow using Firestore if necessary
    return { id, cells };
  }).filter(x=>x.id);
}

/* ---------------------- Initialize initial view ---------------------- */
document.getElementById('menu-reportes').click();







