// dashboard.js
// Usa firebase.js que exporta `db` y `auth` (tu archivo existente)
// Import funciones Firestore/Auth desde CDN
import { db, auth } from './firebase.js';
import {
  collection, addDoc, doc, deleteDoc, updateDoc, onSnapshot, getDocs
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";


// ----------------------
// Session: redirect if not logged in
// ----------------------
onAuthStateChanged(auth, user => {
  if (!user) window.location.href = "index.html";
});

// Logout button (topbar & other)
document.querySelectorAll('#logoutBtn').forEach(btn=>{
  btn.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
});

// ----------------------
// Navigation (sidebar buttons)
// ----------------------
const navBtns = document.querySelectorAll('.nav-btn');
const sections = {
  proveedores: document.getElementById('proveedores'),
  productos: document.getElementById('productos'),
  facturas: document.getElementById('facturas'),
  gastos: document.getElementById('gastos'),
  servicios: document.getElementById('servicios'),
  reportes: document.getElementById('reportes')
};

navBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    navBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    Object.values(sections).forEach(s=>s.style.display='none');
    const sectionId = btn.dataset.section;
    if(sections[sectionId]) sections[sectionId].style.display = 'block';
  });
});

// ----------------------
// References
// ----------------------
const proveedoresRef = collection(db, 'proveedores');
const productosRef = collection(db, 'productos');
const facturasRef = collection(db, 'facturas');
const gastosRef = collection(db, 'gastos');
const serviciosRef = collection(db, 'servicios');

// ----------------------
// Cached data
// ----------------------
let cachedFacturas = []; // [{id, ...data}]
let cachedProveedores = [];
let cachedProductos = [];

// ----------------------
// Helper: safe get element
// ----------------------
const $ = id => document.getElementById(id);

// ----------------------
// PROVEEDORES CRUD + realtime
// ----------------------
const formProveedor = $('formProveedor') || $('formProveedor') ; // form element by id
// Because in HTML id is "formProveedor" as element, but earlier used element variable; safer to query by id from DOM
const fp = document.getElementById('formProveedor');
const tablaProveedores = $('tablaProveedores');

if(fp){
  fp.addEventListener('submit', async (e)=>{
    e.preventDefault();
    try{
      await addDoc(proveedoresRef, {
        ruc: $('#rucProv').value,
        nombre: $('#nombreProv').value,
        producto: $('#productoProv').value,
        direccion: $('#direccionProv').value
      });
      fp.reset();
    }catch(err){ console.error(err); alert('Error al agregar proveedor'); }
  });
}

onSnapshot(proveedoresRef, snapshot=>{
  tablaProveedores.innerHTML = '';
  cachedProveedores = [];
  snapshot.forEach(docu=>{
    const p = docu.data();
    p.id = docu.id;
    cachedProveedores.push(p);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.ruc}</td>
      <td>${p.nombre}</td>
      <td>${p.producto}</td>
      <td>${p.direccion}</td>
      <td>
        <button class="btn btn-sm btn-primary" data-id="${p.id}" data-type="editProv">Editar</button>
        <button class="btn btn-sm btn-danger" data-id="${p.id}" data-type="delProv">Eliminar</button>
      </td>`;
    tablaProveedores.appendChild(tr);
  });
  attachProveedorButtons();
  fillProveedorSelect();
});

function attachProveedorButtons(){
  document.querySelectorAll('[data-type="delProv"]').forEach(btn=>{
    btn.onclick = async ()=> {
      const id = btn.dataset.id;
      if(confirm('Eliminar proveedor?')) await deleteDoc(doc(db,'proveedores',id));
    };
  });
  document.querySelectorAll('[data-type="editProv"]').forEach(btn=>{
    btn.onclick = async ()=> {
      const id = btn.dataset.id;
      const p = cachedProveedores.find(x=>x.id===id);
      if(!p) return alert('Proveedor no encontrado');
      // Load into form for editing: reuse form fields and on submit update doc
      $('#rucProv').value = p.ruc || '';
      $('#nombreProv').value = p.nombre || '';
      $('#productoProv').value = p.producto || '';
      $('#direccionProv').value = p.direccion || '';
      // override submit temporarily
      fp.onsubmit = async (ev)=>{
        ev.preventDefault();
        await updateDoc(doc(db,'proveedores',id), {
          ruc: $('#rucProv').value,
          nombre: $('#nombreProv').value,
          producto: $('#productoProv').value,
          direccion: $('#direccionProv').value
        });
        fp.reset();
        fp.onsubmit = null; // remove override (next submissions will create new)
      };
    };
  });
}

function fillProveedorSelect(){
  const sel = $('proveedorFactura');
  const editSel = $('editProveedor');
  if(!sel || !editSel) return;
  sel.innerHTML = '<option value="">Selecciona proveedor</option>';
  editSel.innerHTML = '<option value="">Selecciona proveedor</option>';
  cachedProveedores.forEach(p=>{
    const o = document.createElement('option'); o.value = p.nombre; o.textContent = p.nombre;
    sel.appendChild(o);
    const oe = o.cloneNode(true);
    editSel.appendChild(oe);
  });
}

// ----------------------
// PRODUCTOS CRUD + realtime
// ----------------------
const fpd = document.getElementById('formProducto');
const tablaProductos = $('tablaProductos');

if(fpd){
  fpd.addEventListener('submit', async (e)=>{
    e.preventDefault();
    try{
      await addDoc(productosRef, {
        nombre: $('#nombreProd').value,
        descripcion: $('#descProd').value,
        cantidad: Number($('#cantidadProd').value||0),
        unidad: $('#unidadProd').value||'',
        valorUnitario: Number($('#valorUnitProd').value||0)
      });
      fpd.reset();
    }catch(err){ console.error(err); alert('Error al agregar producto'); }
  });
}

onSnapshot(productosRef, snapshot=>{
  tablaProductos.innerHTML = '';
  cachedProductos = [];
  snapshot.forEach(docu=>{
    const p = docu.data();
    p.id = docu.id;
    cachedProductos.push(p);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.descripcion||''}</td>
      <td>${p.cantidad??0}</td>
      <td>${p.unidad||''}</td>
      <td>${Number(p.valorUnitario||0).toFixed(2)}</td>
      <td>
        <button class="btn btn-sm btn-primary" data-id="${p.id}" data-type="editProd">Editar</button>
        <button class="btn btn-sm btn-danger" data-id="${p.id}" data-type="delProd">Eliminar</button>
      </td>`;
    tablaProductos.appendChild(tr);
  });
  attachProductoButtons();
  fillProductoSelect();
});

function attachProductoButtons(){
  document.querySelectorAll('[data-type="delProd"]').forEach(btn=>{
    btn.onclick = async ()=> {
      const id = btn.dataset.id;
      if(confirm('Eliminar producto?')) await deleteDoc(doc(db,'productos',id));
    };
  });
  document.querySelectorAll('[data-type="editProd"]').forEach(btn=>{
    btn.onclick = async ()=> {
      const id = btn.dataset.id;
      const p = cachedProductos.find(x=>x.id===id);
      if(!p) return alert('Producto no encontrado');
      $('#nombreProd').value = p.nombre||'';
      $('#descProd').value = p.descripcion||'';
      $('#cantidadProd').value = p.cantidad||0;
      $('#unidadProd').value = p.unidad||'';
      $('#valorUnitProd').value = p.valorUnitario||0;
      // override submit
      fpd.onsubmit = async (ev)=>{
        ev.preventDefault();
        await updateDoc(doc(db,'productos',id), {
          nombre: $('#nombreProd').value,
          descripcion: $('#descProd').value,
          cantidad: Number($('#cantidadProd').value||0),
          unidad: $('#unidadProd').value,
          valorUnitario: Number($('#valorUnitProd').value||0)
        });
        fpd.reset();
        fpd.onsubmit = null;
      };
    };
  });
}

function fillProductoSelect(){
  const sel = $('productoFactura');
  const editSel = $('editProducto');
  if(!sel || !editSel) return;
  sel.innerHTML = '<option value="">Selecciona producto</option>';
  editSel.innerHTML = '<option value="">Selecciona producto</option>';
  cachedProductos.forEach(p=>{
    const o = document.createElement('option'); o.value = p.nombre; o.textContent = p.nombre;
    sel.appendChild(o);
    const oe = o.cloneNode(true);
    editSel.appendChild(oe);
  });
}

// ----------------------
// FACTURAS CRUD + realtime
// ----------------------
const fform = document.getElementById('formFactura');
const tablaFacturas = $('tablaFacturas');

if(fform){
  fform.addEventListener('submit', async (e)=>{
    e.preventDefault();
    try{
      await addDoc(facturasRef, {
        proveedor: $('#proveedorFactura').value,
        producto: $('#productoFactura').value,
        tipo: $('#tipoFactura').value,
        monto: Number($('#montoFactura').value||0),
        moneda: $('#monedaFactura').value,
        fecha: $('#fechaFactura').value,
        desc: $('#descFactura').value || ''
      });
      fform.reset();
    }catch(err){ console.error(err); alert('Error al agregar factura'); }
  });
}

onSnapshot(facturasRef, snapshot=>{
  cachedFacturas = [];
  snapshot.forEach(docu=>{
    const f = docu.data();
    f.id = docu.id;
    cachedFacturas.push(f);
  });
  renderFacturasTable(cachedFacturas);
});

function renderFacturasTable(list){
  if(!tablaFacturas) return;
  tablaFacturas.innerHTML = '';
  list.forEach(f=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${f.proveedor}</td>
      <td>${f.producto}</td>
      <td>${f.tipo}</td>
      <td>${f.moneda} ${Number(f.monto||0).toFixed(2)}</td>
      <td>${f.fecha}</td>
      <td>${f.desc||''}</td>
      <td>
        <button class="btn btn-sm btn-info" data-id="${f.id}" data-action="view">Ver</button>
        <button class="btn btn-sm btn-danger" data-id="${f.id}" data-action="del">Eliminar</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  });
  // attach actions
  tablaFacturas.querySelectorAll('[data-action="del"]').forEach(b=>{
    b.onclick = async ()=> {
      const id = b.dataset.id;
      if(confirm('Eliminar factura?')) await deleteDoc(doc(db,'facturas',id));
    };
  });
  tablaFacturas.querySelectorAll('[data-action="view"]').forEach(b=>{
    b.onclick = ()=> openEditModal(b.dataset.id);
  });
}

// ----------------------
// GASTOS & SERVICIOS (basic CRUD)
// ----------------------
const fg = document.getElementById('formGasto');
const tablaGastos = $('tablaGastos');
if(fg){
  fg.addEventListener('submit', async (e)=>{
    e.preventDefault();
    await addDoc(gastosRef, {
      nombre: $('#nombreGasto').value,
      tipo: $('#tipoGasto').value,
      monto: Number($('#montoGasto').value||0),
      fecha: $('#fechaGasto').value
    });
    fg.reset();
  });
}
onSnapshot(gastosRef, snap=>{
  if(!tablaGastos) return;
  tablaGastos.innerHTML = '';
  snap.forEach(d=>{
    const g = d.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${g.nombre}</td><td>${g.tipo}</td><td>${Number(g.monto||0).toFixed(2)}</td><td>${g.fecha}</td><td><button class="btn btn-sm btn-danger" data-id="${d.id}">Eliminar</button></td>`;
    tablaGastos.appendChild(tr);
  });
  tablaGastos.querySelectorAll('button').forEach(b=>{
    b.onclick = async ()=> { if(confirm('Eliminar gasto?')) await deleteDoc(doc(db,'gastos', b.dataset.id)); };
  });
});

const fsrv = document.getElementById('formServicio');
const tablaServicios = $('tablaServicios');
if(fsrv){
  fsrv.addEventListener('submit', async (e)=>{
    e.preventDefault();
    await addDoc(serviciosRef, {
      nombre: $('#nombreServ').value,
      precio: Number($('#precioServ').value||0),
      fecha: $('#fechaServ').value,
      desc: $('#descServ').value||''
    });
    fsrv.reset();
  });
}
onSnapshot(serviciosRef, snap=>{
  if(!tablaServicios) return;
  tablaServicios.innerHTML = '';
  snap.forEach(d=>{
    const s = d.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.nombre}</td><td>${Number(s.precio||0).toFixed(2)}</td><td>${s.fecha}</td><td>${s.desc||''}</td><td><button class="btn btn-sm btn-danger" data-id="${d.id}">Eliminar</button></td>`;
    tablaServicios.appendChild(tr);
  });
  tablaServicios.querySelectorAll('button').forEach(b=>{
    b.onclick = async ()=> { if(confirm('Eliminar servicio?')) await deleteDoc(doc(db,'servicios', b.dataset.id)); };
  });
});

// ----------------------
// GLOBAL SEARCH (top-right) -> results modal
// ----------------------
const globalSearch = $('globalSearch');
const btnSearch = document.getElementById('btnSearch');
const modalResults = new bootstrap.Modal(document.getElementById('modalResults'));
const resultsBody = $('resultsBody');
const searchInfo = $('searchInfo');

async function performSearch(term){
  if(!term || !term.trim()) return;
  const q = term.trim().toLowerCase();
  // use cachedFacturas for speed, if empty fetch once
  if(!cachedFacturas || cachedFacturas.length===0){
    // initial fetch (should normally be populated by realtime onSnapshot)
    const snap = await getDocs(facturasRef);
    cachedFacturas = snap.docs.map(d=> ({ id:d.id, ...d.data() }) );
  }
  // filter by id (number or partial), proveedor, producto, tipo, desc
  const results = cachedFacturas.filter(f=>{
    const idMatch = (f.id||'').toLowerCase().includes(q);
    const prov = String(f.proveedor||'').toLowerCase();
    const prod = String(f.producto||'').toLowerCase();
    const tipo = String(f.tipo||'').toLowerCase();
    const desc = String(f.desc||'').toLowerCase();
    const monto = String(f.monto||'').toLowerCase();
    return idMatch || prov.includes(q) || prod.includes(q) || tipo.includes(q) || desc.includes(q) || monto.includes(q);
  });
  // render results in modal
  resultsBody.innerHTML = '';
  if(results.length===0){
    searchInfo.textContent = `No se encontraron facturas para "${term}"`;
  }else{
    searchInfo.textContent = `Mostrando ${results.length} resultado(s) para "${term}"`;
  }
  results.forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.id}</td>
      <td>${r.proveedor}</td>
      <td>${r.producto}</td>
      <td>${r.tipo}</td>
      <td>${r.moneda} ${Number(r.monto||0).toFixed(2)}</td>
      <td>${r.fecha}</td>
      <td>${r.desc||''}</td>
      <td>
        <button class="btn btn-sm btn-primary" data-id="${r.id}" data-action="open">Ver / Editar</button>
      </td>
    `;
    resultsBody.appendChild(tr);
  });

  // attach open handlers
  resultsBody.querySelectorAll('[data-action="open"]').forEach(b=>{
    b.onclick = ()=> {
      const id = b.dataset.id;
      modalResults.hide();
      openEditModal(id); // open second modal for edit
    };
  });

  modalResults.show();
}

// key / button handlers
btnSearch.addEventListener('click', ()=> performSearch(globalSearch.value));
globalSearch.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter') { e.preventDefault(); performSearch(globalSearch.value); }
});

// ----------------------
// Edit modal functions (open, save, delete)
// ----------------------
const modalEdit = new bootstrap.Modal(document.getElementById('modalEdit'));
const editId = $('editFacturaId');
const editProveedor = $('editProveedor');
const editProducto = $('editProducto');
const editTipo = $('editTipo');
const editMoneda = $('editMoneda');
const editMonto = $('editMonto');
const editFecha = $('editFecha');
const editDesc = $('editDesc');
const btnSaveFactura = $('btnSaveFactura');
const btnDeleteFactura = $('btnDeleteFactura');

async function openEditModal(id){
  // find factura in cachedFacturas
  const f = cachedFacturas.find(x=>x.id===id);
  if(!f) {
    alert('Factura no encontrada');
    return;
  }
  // make sure selects are filled
  fillProveedorSelect(); fillProductoSelect();

  editId.value = f.id;
  editProveedor.value = f.proveedor||'';
  editProducto.value = f.producto||'';
  editTipo.value = f.tipo||'Factura electrónica';
  editMoneda.value = f.moneda||'S/.';
  editMonto.value = Number(f.monto||0);
  editFecha.value = f.fecha||'';
  editDesc.value = f.desc||'';
  modalEdit.show();
}

btnSaveFactura.addEventListener('click', async ()=>{
  const id = editId.value;
  if(!id) return;
  try{
    await updateDoc(doc(db,'facturas',id), {
      proveedor: editProveedor.value,
      producto: editProducto.value,
      tipo: editTipo.value,
      moneda: editMoneda.value,
      monto: Number(editMonto.value||0),
      fecha: editFecha.value,
      desc: editDesc.value
    });
    modalEdit.hide();
  }catch(err){ console.error(err); alert('Error guardando factura'); }
});

btnDeleteFactura.addEventListener('click', async ()=>{
  const id = editId.value;
  if(!id) return;
  if(!confirm('Eliminar factura?')) return;
  try{
    await deleteDoc(doc(db,'facturas',id));
    modalEdit.hide();
  }catch(err){ console.error(err); alert('Error eliminando factura'); }
});

// ----------------------
// REPORT: simple counts
// ----------------------
$('generarReporte')?.addEventListener('click', async ()=>{
  const [pSnap, prodSnap, fSnap, gSnap, sSnap] = await Promise.all([
    getDocs(proveedoresRef),
    getDocs(productosRef),
    getDocs(facturasRef),
    getDocs(gastosRef),
    getDocs(serviciosRef)
  ]);
  $('reporteContenido').innerHTML = `
    <div class="p-3" style="background:#fff;border-radius:10px">
      <p><strong>Proveedores:</strong> ${pSnap.size}</p>
      <p><strong>Productos:</strong> ${prodSnap.size}</p>
      <p><strong>Facturas:</strong> ${fSnap.size}</p>
      <p><strong>Gastos:</strong> ${gSnap.size}</p>
      <p><strong>Servicios:</strong> ${sSnap.size}</p>
    </div>
  `;
});

