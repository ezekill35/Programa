import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ======================= NAVEGACIÓN =======================
const botones = document.querySelectorAll(".menu-btn");
const secciones = document.querySelectorAll(".seccion");

botones.forEach((btn) => {
  btn.addEventListener("click", () => {
    botones.forEach((b) => b.classList.remove("activo"));
    btn.classList.add("activo");

    secciones.forEach((sec) => {
      sec.classList.remove("activa");
      if (sec.id === btn.dataset.target) sec.classList.add("activa");
    });
  });
});

// ======================= CERRAR SESIÓN =======================
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ======================= PROVEEDORES =======================
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");

proveedorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();
  const telefono = document.getElementById("telefonoProveedor")?.value.trim() || "";

  await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion, telefono });
  proveedorForm.reset();
});

onSnapshot(collection(db, "proveedores"), (snapshot) => {
  tablaProveedores.innerHTML = "";
  const proveedorSelect = document.getElementById("proveedorFactura");
  proveedorSelect.innerHTML = '<option value="">Seleccione proveedor</option>';

  snapshot.forEach((docu) => {
    const p = docu.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td contenteditable="true" data-campo="ruc" data-id="${docu.id}">${p.ruc}</td>
      <td contenteditable="true" data-campo="nombre" data-id="${docu.id}">${p.nombre}</td>
      <td contenteditable="true" data-campo="direccion" data-id="${docu.id}">${p.direccion}</td>
      <td contenteditable="true" data-campo="telefono" data-id="${docu.id}">${p.telefono || ''}</td>
      <td><button class="btn-delete" data-id="${docu.id}" data-tipo="proveedores">🗑️</button></td>
    `;
    tablaProveedores.appendChild(fila);

    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = p.nombre;
    proveedorSelect.appendChild(option);
  });
});

// ======================= PRODUCTOS =======================
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");

productoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const unidad = document.getElementById("unidadProducto").value.trim();
  const materialP = document.getElementById("materialP").value.trim();
  const maquinaria = document.getElementById("maquinaria").value.trim();
  const productoOf = document.getElementById("productoOf").value.trim();
  const insumosExtra = document.getElementById("insumosExtra").value.trim();

  await addDoc(collection(db, "productos"), {
    nombre,
    unidad,
    materialP,
    maquinaria,
    productoOf,
    insumosExtra,
  });
  productoForm.reset();
});

onSnapshot(collection(db, "productos"), (snapshot) => {
  tablaProductos.innerHTML = "";
  const productoSelect = document.getElementById("productoFactura");
  productoSelect.innerHTML = '<option value="">Seleccione producto</option>';

  snapshot.forEach((docu) => {
    const p = docu.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td contenteditable="true" data-campo="nombre" data-id="${docu.id}">${p.nombre}</td>
      <td contenteditable="true" data-campo="unidad" data-id="${docu.id}">${p.unidad}</td>
      <td contenteditable="true" data-campo="materialP" data-id="${docu.id}">${p.materialP}</td>
      <td contenteditable="true" data-campo="maquinaria" data-id="${docu.id}">${p.maquinaria}</td>
      <td contenteditable="true" data-campo="productoOf" data-id="${docu.id}">${p.productoOf}</td>
      <td contenteditable="true" data-campo="insumosExtra" data-id="${docu.id}">${p.insumosExtra}</td>
      <td><button class="btn-delete" data-id="${docu.id}" data-tipo="productos">🗑️</button></td>
    `;
    tablaProductos.appendChild(fila);

    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = p.nombre;
    productoSelect.appendChild(option);
  });
});

// ======================= FACTURAS =======================
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");

facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const numero = document.getElementById("numeroFactura").value.trim();
  const idFactura = document.getElementById("idFactura").value.trim();
  const fecha = document.getElementById("fechaEmisionFactura").value;
  const proveedor = document.getElementById("proveedorFactura").value;
  const producto = document.getElementById("productoFactura").value;
  const monto = document.getElementById("montoFactura").value;
  const moneda = document.getElementById("monedaFactura").value;
  const tipo = document.getElementById("tipoFactura").value;

  if (!proveedor || !producto) {
    alert("Debe seleccionar un proveedor y un producto.");
    return;
  }

  await addDoc(collection(db, "facturas"), {
    numero,
    idFactura,
    fecha,
    proveedor,
    producto,
    monto,
    moneda,
    tipo,
  });

  facturaForm.reset();
});

// Mostrar todas las facturas
let facturasGuardadas = [];
onSnapshot(collection(db, "facturas"), (snapshot) => {
  facturasGuardadas = [];
  snapshot.forEach((docu) => {
    facturasGuardadas.push({ id: docu.id, ...docu.data() });
  });
  mostrarFacturas(facturasGuardadas);
});

function mostrarFacturas(facturas){
  tablaFacturas.innerHTML = "";
  facturas.forEach(f => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td contenteditable="true" data-campo="numero" data-id="${f.id}">${f.numero}</td>
      <td class="ver-proveedor" data-nombre="${f.proveedor}" style="cursor:pointer;color:#007bff">${f.proveedor}</td>
      <td class="ver-producto" data-nombre="${f.producto}" style="cursor:pointer;color:#007bff">${f.producto}</td>
      <td contenteditable="true" data-campo="monto" data-id="${f.id}">${f.monto}</td>
      <td contenteditable="true" data-campo="tipo" data-id="${f.id}">${f.tipo}</td>
      <td>${f.fecha}</td>
      <td>${f.idFactura || ''}</td>
      <td><button class="btn-delete" data-id="${f.id}" data-tipo="facturas">🗑️</button></td>
    `;
    tablaFacturas.appendChild(fila);
  });
}

// ======================= BUSCADOR =======================
const buscador = document.getElementById("buscadorFactura");
const modalResultados = document.getElementById("modalResultados");
const resultsContainer = document.getElementById("resultsContainer");
const resultTitle = document.getElementById("resultTitle");
const resultSub = document.getElementById("resultSub");

window.closeResultados = () => {
  modalResultados.classList.remove("show");
  modalResultados.style.display = 'none';
  resultsContainer.innerHTML = '';
};

function construirResultadosDesdeTabla(busqueda){
  resultsContainer.innerHTML = '';
  const rows = Array.from(tablaFacturas.querySelectorAll('tr'));
  if(rows.length === 0){
    resultsContainer.innerHTML = `<div class="muted">No hay facturas que coincidan.</div>`;
    return;
  }

  rows.forEach(r => {
    const cells = r.querySelectorAll('td');
    if(cells.length < 7) return;
    const f = {
      numero: cells[0].textContent.trim(),
      proveedor: cells[1].textContent.trim(),
      producto: cells[2].textContent.trim(),
      monto: cells[3].textContent.trim(),
      tipo: cells[4].textContent.trim(),
      fecha: cells[5].textContent.trim(),
      idFactura: cells[6].textContent.trim()
    };

    const card = document.createElement('div');
    card.className = 'fact-card';
    card.tabIndex = 0;
    card.innerHTML = `
      <h4>Factura ${f.numero || '-'}</h4>
      <div style="font-size:14px;color:#034c57"><strong>${f.producto}</strong></div>
      <div style="margin-top:8px">
        <div class="muted">Proveedor</div>
        <div><span class="ver-proveedor" data-nombre="${f.proveedor}" style="cursor:pointer;color:var(--accent)">${f.proveedor}</span></div>
      </div>
      <div class="meta">
        <div>${f.fecha}</div>
        <div>${f.monto}</div>
      </div>
    `;

    card.addEventListener('click', ev => {
      const path = ev.composedPath ? ev.composedPath() : (ev.path || []);
      for(const el of path){
        if(!el || el===window || el===document) break;
        if(el.classList && (el.classList.contains('ver-proveedor') || el.classList.contains('ver-producto'))) return;
      }
      abrirModalFacturaFromCard(f);
    });

    // Click proveedor
    const provSpan = card.querySelector('.ver-proveedor');
    provSpan.addEventListener('click', ev => {
      ev.stopPropagation();
      mostrarModalDatos(f.proveedor, 'proveedor');
    });

    // Click producto
    const prodSpan = card.querySelector('.ver-producto');
    if(prodSpan){
      prodSpan.addEventListener('click', ev => {
        ev.stopPropagation();
        mostrarModalDatos(f.producto, 'producto');
      });
    }

    resultsContainer.appendChild(card);
  });

  resultTitle.textContent = `🔍 Resultados relacionados con "${busqueda}"`;
  resultSub.textContent = `${rows.length} factura(s) mostradas según el filtro actual. Haz clic en una tarjeta para ver detalle.`;
}

buscador.addEventListener('keypress', e => {
  if(e.key === 'Enter'){
    setTimeout(() => {
      construirResultadosDesdeTabla(buscador.value.trim());
      modalResultados.classList.add('show');
      modalResultados.style.display='flex';
    }, 100);
  }
});

document.getElementById('btnRefresh').addEventListener('click', () => {
  buscador.value = '';
  buscador.dispatchEvent(new Event('input', { bubbles: true }));
});

// ======================= EDITAR Y ELIMINAR =======================
document.addEventListener('input', async e => {
  if(e.target.dataset.id && e.target.dataset.campo){
    const id = e.target.dataset.id;
    const campo = e.target.dataset.campo;
    const valor = e.target.textContent.trim();
    await updateDoc(doc(db, e.target.closest('tr').querySelector('.btn-delete').dataset.tipo, id), { [campo]: valor });
  }
});

document.addEventListener('click', async e => {
  if(e.target.classList.contains('btn-delete')){
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    if(confirm('¿Seguro deseas eliminar este registro?')){
      await deleteDoc(doc(db, tipo, id));
    }
  }
});

// ======================= MODAL FACTURA =======================
function abrirModalFacturaFromCard(fData){
  const modal = document.getElementById('modalFactura');
  const cont = document.getElementById('modalFacturaContenido');
  document.getElementById('facturaTitle').textContent = `Factura Nº ${fData.numero || '-'}`;
  cont.innerHTML = `
    <div class="factura-detail">
      <div>
        <div class="detail-block">
          <div class="label">Proveedor</div>
          <div class="value"><span class="ver-proveedor" data-nombre="${fData.proveedor}" style="cursor:pointer;color:var(--accent)">${fData.proveedor}</span></div>
        </div>
        <div style="height:12px"></div>
        <div class="detail-block">
          <div class="label">Producto</div>
          <div class="value"><span class="ver-producto" data-nombre="${fData.producto}" style="cursor:pointer;color:var(--accent)">${fData.producto}</span></div>
        </div>
        <div style="height:12px"></div>
        <div class="detail-block">
          <div class="label">Tipo</div>
          <div class="value">${fData.tipo || '-'}</div>
        </div>
      </div>
      <aside>
        <div class="detail-block">
          <div class="label">Monto</div>
          <div class="value">${fData.moneda || ''}${fData.monto || '-'}</div>
        </div>
        <div style="height:12px"></div>
        <div class="detail-block">
          <div class="label">Número</div>
          <div class="value">${fData.numero || '-'}</div>
        </div>
        <div style="height:12px"></div>
        <div class="detail-block">
          <div class="label">ID Factura</div>
          <div class="value">${fData.idFactura || '-'}</div>
        </div>
        <div style="height:12px"></div>
        <div class="detail-block">
          <div class="label">Fecha</div>
          <div class="value">${fData.fecha || '-'}</div>
        </div>
      </aside>
    </div>
  `;
  modal.classList.add('show'); modal.style.display='flex';

  // Agregar listeners internos para proveedor/producto
  const provSpan = cont.querySelector('.ver-proveedor');
  provSpan.addEventListener('click', () => mostrarModalDatos(fData.proveedor, 'proveedor'));
  const prodSpan = cont.querySelector('.ver-producto');
  if(prodSpan) prodSpan.addEventListener('click', () => mostrarModalDatos(fData.producto, 'producto'));
}

window.closeFactura = () => {
  const modal = document.getElementById('modalFactura');
  modal.classList.remove('show');
  modal.style.display='none';
  document.getElementById('modalFacturaContenido').innerHTML='';
};





