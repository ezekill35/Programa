import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  getDocs,
  query,
  orderBy,
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

// Mostrar proveedores en tiempo real
onSnapshot(collection(db, "proveedores"), (snapshot) => {
  tablaProveedores.innerHTML = "";
  const proveedorSelect = document.getElementById("proveedorFactura");
  proveedorSelect.innerHTML = '<option value="">Seleccione proveedor</option>';

  snapshot.forEach((docu) => {
    const p = docu.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.ruc}</td>
      <td>${p.nombre}</td>
      <td>${p.direccion}</td>
      <td>${p.telefono || "-"}</td>
      <td>
        <button class="btn-edit" data-id="${docu.id}" data-tipo="proveedores">✏️</button>
        <button class="btn-delete" data-id="${docu.id}" data-tipo="proveedores">🗑️</button>
      </td>
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

  await addDoc(collection(db, "productos"), { nombre, unidad });
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
      <td>${p.nombre}</td>
      <td>${p.unidad}</td>
      <td>
        <button class="btn-edit" data-id="${docu.id}" data-tipo="productos">✏️</button>
        <button class="btn-delete" data-id="${docu.id}" data-tipo="productos">🗑️</button>
      </td>
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
let facturasGuardadas = [];

async function generarIdFactura() {
  const q = query(collection(db, "facturas"), orderBy("numero","desc"));
  const docsSnap = await getDocs(q);
  let ultimo = "F003-000000";
  docsSnap.forEach(docu => {
    ultimo = docu.data().numero || ultimo;
  });
  const numero = parseInt(ultimo.split("-")[1], 10) + 1;
  return `F003-${numero.toString().padStart(6, "0")}`;
}

facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const numero = await generarIdFactura();
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
    fecha,
    proveedor,
    producto,
    monto,
    moneda,
    tipo,
  });
  facturaForm.reset();
});

// Mostrar facturas en tiempo real
onSnapshot(collection(db, "facturas"), (snapshot) => {
  facturasGuardadas = [];
  snapshot.forEach((docu) => {
    facturasGuardadas.push({ id: docu.id, ...docu.data() });
  });
  mostrarFacturas(facturasGuardadas);
});

function mostrarFacturas(facturas) {
  tablaFacturas.innerHTML = "";
  facturas.forEach((f) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${f.numero}</td>
      <td class="ver-proveedor" data-nombre="${f.proveedor}" style="cursor:pointer;color:#007bff">${f.proveedor}</td>
      <td class="ver-producto" data-nombre="${f.producto}" style="cursor:pointer;color:#007bff">${f.producto}</td>
      <td>${f.moneda}${f.monto}</td>
      <td>${f.tipo}</td>
      <td>${f.fecha}</td>
      <td>
        <button class="btn-edit" data-id="${f.id}" data-tipo="facturas">✏️</button>
        <button class="btn-delete" data-id="${f.id}" data-tipo="facturas">🗑️</button>
      </td>
    `;
    tablaFacturas.appendChild(fila);
  });
}

// ======================= ELIMINAR / EDITAR =======================
document.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  const tipo = e.target.dataset.tipo;

  if (e.target.classList.contains("btn-delete")) {
    if (confirm("¿Desea eliminar este registro?")) {
      await deleteDoc(doc(db, tipo, id));
    }
  }

  if (e.target.classList.contains("btn-edit")) {
    const docRef = doc(db, tipo, id);
    const dataSnap = await getDocs(collection(db, tipo));
    let dataEdit = null;
    dataSnap.forEach(d => { if(d.id===id) dataEdit = d.data(); });

    if(!dataEdit) return;

    const nuevoValor = prompt("Editar valor (JSON válido)", JSON.stringify(dataEdit));
    try {
      const obj = JSON.parse(nuevoValor);
      await updateDoc(docRef, obj);
      alert("Actualizado correctamente");
    } catch(err){
      alert("JSON inválido");
    }
  }

  if (e.target.classList.contains("ver-proveedor")) {
    const nombre = e.target.dataset.nombre;
    if (confirm(`¿Deseas ver los datos de ${nombre}?`)) {
      mostrarModalDatos("proveedores", "nombre", nombre);
    }
  }

  if (e.target.classList.contains("ver-producto")) {
    const nombre = e.target.dataset.nombre;
    if (confirm(`¿Deseas ver los datos de ${nombre}?`)) {
      mostrarModalDatos("productos", "nombre", nombre);
    }
  }
});

// ======================= MODAL DETALLE =======================
async function mostrarModalDatos(coleccion, campo, valor) {
  const modal = document.getElementById("modalDetalle");
  const modalContenido = document.getElementById("modalContenido");
  modalContenido.innerHTML = "<p>Cargando datos...</p>";

  const snapshot = await getDocs(collection(db, coleccion));
  snapshot.forEach((docu) => {
    const data = docu.data();
    if (data[campo] === valor) {
      modalContenido.innerHTML = `
        <h3>${coleccion === "proveedores" ? "Proveedor" : "Producto"}: ${data.nombre}</h3>
        <p><strong>RUC:</strong> ${data.ruc || "-"}</p>
        <p><strong>Dirección:</strong> ${data.direccion || "-"}</p>
        <p><strong>Teléfono:</strong> ${data.telefono || "-"}</p>
        <p><strong>Unidad:</strong> ${data.unidad || "-"}</p>
      `;
    }
  });

  modal.style.display = "flex";
}

document.getElementById("cerrarModal").addEventListener("click", () => {
  document.getElementById("modalDetalle").style.display = "none";
});

// ======================= BUSCADOR =======================
const buscador = document.getElementById("buscadorFactura");
const modalResultados = document.getElementById("modalResultados");
const resultsContainer = document.getElementById("resultsContainer");
const resultTitle = document.getElementById("resultTitle");
const resultSub = document.getElementById("resultSub");

function construirResultadosDesdeTabla(busqueda){
  resultsContainer.innerHTML = '';
  const rows = Array.from(tablaFacturas.querySelectorAll('tr'));
  if(rows.length === 0){
    resultsContainer.innerHTML = `<div class="muted">No hay facturas que coincidan.</div>`;
    return;
  }

  rows.forEach(r => {
    const cells = r.querySelectorAll('td');
    if(cells.length < 6) return;
    const f = {
      numero: cells[0].textContent.trim(),
      proveedor: cells[1].textContent.trim(),
      producto: cells[2].textContent.trim(),
      monto: cells[3].textContent.replace(/\n/g,'').trim(),
      tipo: cells[4].textContent.trim(),
      fecha: cells[5].textContent.trim(),
      id: (r.querySelector('.btn-delete') ? r.querySelector('.btn-delete').dataset.id : '')
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

    card.addEventListener('click', (ev) => {
      const path = ev.composedPath ? ev.composedPath() : (ev.path || []);
      for(const el of path){
        if(!el || el === window || el === document) break;
        if(el.classList && (el.classList.contains('ver-proveedor') || el.classList.contains('ver-producto'))) {
          return;
        }
      }
      abrirModalFacturaFromCard(f);
    });

    resultsContainer.appendChild(card);
  });

  resultTitle.textContent = `🔍 Resultados relacionados con "${busqueda}"`;
  resultSub.textContent = `${rows.length} factura(s) mostradas según el filtro actual. Haz clic en una tarjeta para ver detalle.`;
}

buscador.addEventListener('keypress', (e) => {
  if(e.key === 'Enter'){
    setTimeout(() => {
      const term = buscador.value.trim();
      construirResultadosDesdeTabla(term);
      modalResultados.classList.add('show');
      modalResultados.style.display='flex';
    }, 100);
  }
});

document.getElementById('btnRefresh').addEventListener('click', () => {
  buscador.value = '';
  buscador.dispatchEvent(new Event('input', { bubbles: true }));
});

// ======================= MODAL FACTURA =======================
const modalFactura = document.getElementById('modalFactura');
const modalFacturaContenido = document.getElementById('modalFacturaContenido');
function abrirModalFacturaFromCard(fData){
  document.getElementById('facturaTitle').textContent = `Factura Nº ${fData.numero || '-'}`;
  modalFacturaContenido.innerHTML = `
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
          <div class="label">Fecha</div>
          <div class="value">${fData.fecha || '-'}</div>
        </div>
      </aside>
    </div>
  `;
  modalFactura.classList.add('show');
  modalFactura.style.display='flex';
}

window.closeResultados = () => { modalResultados.classList.remove('show'); modalResultados.style.display='none'; resultsContainer.innerHTML=''; };
window.closeFactura = () => { modalFactura.classList.remove('show'); modalFactura.style.display='none'; modalFacturaContenido.innerHTML=''; };




