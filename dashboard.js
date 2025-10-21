// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, query, where, updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:abcd1234efgh5678"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ===================== VERIFICAR SESIÓN =====================
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
});

// ===================== COLECCIONES =====================
const colProveedores = collection(db, "proveedores");
const colProductos = collection(db, "productos");
const colFacturas = collection(db, "facturas");

// ===================== ELEMENTOS =====================
const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.getElementById("tablaProveedores");

const formProducto = document.getElementById("formProducto");
const tablaProductos = document.getElementById("tablaProductos");

const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas");

const countFacturas = document.getElementById("countFacturas");
const countProveedores = document.getElementById("countProveedores");
const countProductos = document.getElementById("countProductos");

const buscador = document.getElementById("searchInput");
const panelFacturas = document.getElementById("searchResults");

const modalFactura = document.getElementById("modalFactura");
const modalFacturaBody = document.getElementById("modalFacturaBody");
const cerrarModalFactura = document.getElementById("cerrarModalFactura");

const modalExtra = document.getElementById("modalExtra");
const modalExtraBody = document.getElementById("modalExtraBody");
const cerrarModalExtra = document.getElementById("cerrarModalExtra");

const modalEditar = document.getElementById("modalEditar");
const modalEditarBody = document.getElementById("modalEditarBody");
const cerrarModalEditar = document.getElementById("cerrarModalEditar");

// ===================== PANEL FLOTANTE =====================
const panelFlotante = document.createElement("div");
panelFlotante.className = "panel-flotante";
document.body.appendChild(panelFlotante);
const cerrarPanelBtn = document.createElement("button");
cerrarPanelBtn.className = "btn btn-sm btn-outline-secondary";
cerrarPanelBtn.textContent = "Cerrar";
cerrarPanelBtn.style.marginTop = "12px";
cerrarPanelBtn.addEventListener("click", ()=> panelFlotante.classList.remove("show"));

// append close button later when content inserted

// ===================== CERRAR SESIÓN =====================
document.getElementById("btnCerrarSesion").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ===================== NAVEGACIÓN =====================
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("activo"));
    document.querySelectorAll(".seccion").forEach(s => s.classList.remove("activa"));
    btn.classList.add("activo");
    document.getElementById(btn.dataset.target).classList.add("activa");

    // mostrar buscador solo en facturas
    if(btn.dataset.target === "facturas") buscador.style.display = "block";
    else { buscador.style.display = "none"; buscador.value=""; panelFacturas.innerHTML=""; }
  });
});

// ===================== AUXILIARES =====================
function calcularIGV(subtotal){ return (subtotal * 0.18); }
function formatMoney(value, moneda){
  const n = Number(value || 0).toFixed(2);
  return moneda === "USD" ? `$ ${n}` : `S/. ${n}`;
}

async function cargarProveedoresSelect(){
  const select = document.getElementById("proveedorFactura");
  select.innerHTML = '<option value="">Seleccionar proveedor</option>';
  const snap = await getDocs(colProveedores);
  snap.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.data().nombre;
    opt.textContent = d.data().nombre;
    select.appendChild(opt);
  });
}

async function cargarProductosSelect(){
  const select = document.getElementById("productoFactura");
  select.innerHTML = '<option value="">Seleccionar producto</option>';
  const snap = await getDocs(colProductos);
  snap.forEach(d => {
    const data = d.data();
    const opt = document.createElement("option");
    // store more info in option dataset for preview (value keeps product name)
    opt.value = data.nombre;
    opt.textContent = `${data.nombre} — ${data.presentacion || ""} (${data.cantidad || 0}) — ${data.moneda === "USD" ? "$" : "S/."}${parseFloat(data.precio || 0).toFixed(2)}`;
    opt.dataset.precio = data.precio || 0;
    opt.dataset.moneda = data.moneda || "PEN";
    opt.dataset.presentacion = data.presentacion || "";
    opt.dataset.cantidad = data.cantidad || 0;
    select.appendChild(opt);
  });
}

// ===================== MOSTRAR MODAL FACTURA =====================
function mostrarModalFactura(f){
  const igv = calcularIGV(f.monto);
  const total = Number(f.monto) + igv;
  modalFacturaBody.innerHTML = `
    <h3 style="margin-top:0;margin-bottom:.5rem;">Factura ${f.idFactura}</h3>
    <p><b>Fecha:</b> ${f.fecha}</p>
    <p><b>Proveedor:</b> <span class="link-info" id="verProveedor" data-nombre="${f.proveedor}">${f.proveedor}</span></p>
    <p><b>Producto:</b> <span class="link-info" id="verProducto" data-nombre="${f.producto}">${f.producto}</span></p>
    <p><b>Subtotal:</b> ${formatMoney(f.monto, f.moneda || 'PEN')}</p>
    <p><b>IGV:</b> ${formatMoney(igv, f.moneda || 'PEN')}</p>
    <p><b>Total:</b> ${formatMoney(total, f.moneda || 'PEN')}</p>
    <p><b>Tipo:</b> ${f.tipo}</p>
  `;
  modalFactura.showModal();

  // attach handlers to open floating panel with provider/product details
  const linkProv = document.getElementById("verProveedor");
  const linkProd = document.getElementById("verProducto");

  // ensure we remove previous listeners by cloning nodes (simple approach)
  const newLinkProv = linkProv.cloneNode(true);
  linkProv.parentNode.replaceChild(newLinkProv, linkProv);

  const newLinkProd = linkProd.cloneNode(true);
  linkProd.parentNode.replaceChild(newLinkProd, linkProd);

  newLinkProv.addEventListener("click", async () => {
    const nombre = newLinkProv.dataset.nombre;
    const snap = await getDocs(query(colProveedores, where("nombre","==",nombre)));
    if(!snap.empty){
      const d = snap.docs[0].data();
      panelFlotante.innerHTML = `
        <h5 style="margin-top:0">Proveedor: ${d.nombre}</h5>
        <p><b>Tipo Documento:</b> ${d.tipoDocumento || ''}</p>
        <p><b>RUC / Nº:</b> ${d.ruc || ''}</p>
        <p><b>Dirección:</b> ${d.direccion || ''}</p>
        <p><b>Teléfono:</b> ${d.telefono || ''}</p>
      `;
      panelFlotante.appendChild(cerrarPanelBtn);
      panelFlotante.classList.add("show");
    } else {
      alert("Proveedor no encontrado.");
    }
  });

  newLinkProd.addEventListener("click", async () => {
    const nombre = newLinkProd.dataset.nombre;
    const snap = await getDocs(query(colProductos, where("nombre","==",nombre)));
    if(!snap.empty){
      const d = snap.docs[0].data();
      panelFlotante.innerHTML = `
        <h5 style="margin-top:0">Producto: ${d.nombre}</h5>
        <p><b>Presentación:</b> ${d.presentacion || ''} (${d.cantidad || 0})</p>
        <p><b>Precio:</b> ${formatMoney(d.precio || 0, d.moneda || 'PEN')}</p>
        <p><b>Descripción:</b><br>${d.descripcion || ''}</p>
      `;
      panelFlotante.appendChild(cerrarPanelBtn);
      panelFlotante.classList.add("show");
    } else {
      alert("Producto no encontrado.");
    }
  });
}

// ===================== CERRAR MODALES =====================
cerrarModalFactura.addEventListener("click", ()=> modalFactura.close());
cerrarModalExtra.addEventListener("click", ()=> modalExtra.close());
cerrarModalEditar.addEventListener("click", ()=> modalEditar.close());

// ===================== PROVEEDORES =====================
formProveedor.addEventListener("submit", async e=>{
  e.preventDefault();
  const data = {
    tipoDocumento: document.getElementById("tipoDocumentoProveedor").value,
    ruc: document.getElementById("rucProveedor").value.trim(),
    nombre: document.getElementById("nombreProveedor").value.trim(),
    direccion: document.getElementById("direccionProveedor").value.trim(),
    telefono: document.getElementById("telefonoProveedor").value.trim()
  };
  await addDoc(colProveedores, data);
  formProveedor.reset();
});

// listen cambios en proveedores
onSnapshot(colProveedores, snapshot=>{
  tablaProveedores.innerHTML = "";
  snapshot.forEach(docu=>{
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.dataset.id = docu.id;
    tr.innerHTML = `
      <td>${d.tipoDocumento||''}</td>
      <td>${d.ruc||''}</td>
      <td>${d.nombre||''}</td>
      <td>${d.direccion||''}</td>
      <td>${d.telefono||''}</td>
      <td>
        <button class="btn-accion editar" data-tipo="proveedor" data-id="${docu.id}">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="proveedor" data-nombre="${d.nombre}">🔍</button>
        <button class="btn-accion eliminar" data-tipo="proveedor" data-id="${docu.id}">🗑️</button>
      </td>
    `;
    tablaProveedores.appendChild(tr);
  });
  countProveedores.textContent = snapshot.size;
  cargarProveedoresSelect();
});

// ===================== PRODUCTOS =====================
formProducto.addEventListener("submit", async e=>{
  e.preventDefault();
  const data = {
    nombre: document.getElementById("nombreProducto").value.trim(),
    presentacion: document.getElementById("presentacionProducto").value,
    cantidad: parseInt(document.getElementById("cantidadPresentacion").value || 0, 10),
    precio: parseFloat(document.getElementById("precioProducto").value || 0),
    moneda: document.getElementById("monedaProducto").value || "PEN",
    descripcion: document.getElementById("descripcionProducto").value.trim()
  };
  await addDoc(colProductos, data);
  formProducto.reset();
});

// listen cambios en productos
onSnapshot(colProductos, snapshot=>{
  tablaProductos.innerHTML = "";
  snapshot.forEach(docu=>{
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.dataset.id = docu.id;
    const precioStr = formatMoney(d.precio || 0, d.moneda || "PEN");
    tr.innerHTML = `
      <td>${d.nombre||''}</td>
      <td>${d.presentacion || ''} (${d.cantidad || 0})</td>
      <td>${precioStr}</td>
      <td style="white-space:pre-line;">${d.descripcion||''}</td>
      <td>
        <button class="btn-accion editar" data-tipo="producto" data-id="${docu.id}">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="producto" data-nombre="${d.nombre}">🔍</button>
        <button class="btn-accion eliminar" data-tipo="producto" data-id="${docu.id}">🗑️</button>
      </td>
    `;
    tablaProductos.appendChild(tr);
  });
  countProductos.textContent = snapshot.size;
  cargarProductosSelect();
});

// ===================== FACTURAS =====================
// auto-generate id when focusing the id field or on open factura section
document.querySelectorAll('.nav-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    if(btn.dataset.target === 'facturas'){
      document.getElementById('idFactura').value = "F" + Date.now();
    }
  });
});

// update IGV/Total when monto changes
document.getElementById("montoFactura").addEventListener("input", ()=>{
  const monto = parseFloat(document.getElementById("montoFactura").value || 0);
  const igv = calcularIGV(monto);
  const total = monto + igv;
  // try to determine selected product's currency
  const prodSelect = document.getElementById("productoFactura");
  const selected = prodSelect.selectedOptions[0];
  const moneda = (selected && selected.dataset && selected.dataset.moneda) ? selected.dataset.moneda : "PEN";
  document.getElementById("igvFactura").value = formatMoney(igv, moneda);
  document.getElementById("totalFactura").value = formatMoney(total, moneda);
});

// also when product selection changes, update currency labels (and recalc IGV/Total)
document.getElementById("productoFactura").addEventListener("change", ()=>{
  const monto = parseFloat(document.getElementById("montoFactura").value || 0);
  const selected = document.getElementById("productoFactura").selectedOptions[0];
  const moneda = (selected && selected.dataset && selected.dataset.moneda) ? selected.dataset.moneda : "PEN";
  const igv = calcularIGV(monto);
  document.getElementById("igvFactura").value = formatMoney(igv, moneda);
  document.getElementById("totalFactura").value = formatMoney(monto + igv, moneda);
});

formFactura.addEventListener("submit", async e=>{
  e.preventDefault();
  const selectedProd = document.getElementById("productoFactura").selectedOptions[0];
  const monedaProd = selectedProd && selectedProd.dataset && selectedProd.dataset.moneda ? selectedProd.dataset.moneda : "PEN";

  const data = {
    idFactura: document.getElementById("idFactura").value || ("F"+Date.now()),
    fecha: document.getElementById("fechaFactura").value,
    proveedor: document.getElementById("proveedorFactura").value,
    producto: document.getElementById("productoFactura").value,
    monto: parseFloat(document.getElementById("montoFactura").value || 0),
    tipo: document.getElementById("tipoFactura").value,
    moneda: monedaProd
  };
  await addDoc(colFacturas, data);
  formFactura.reset();
  document.getElementById('idFactura').value = "F"+Date.now();
});

// listen facturas
onSnapshot(colFacturas, snapshot=>{
  tablaFacturas.innerHTML = "";
  snapshot.forEach(docu=>{
    const f = docu.data();
    const igv = calcularIGV(f.monto || 0);
    const total = Number(f.monto || 0) + igv;
    const tr = document.createElement("tr");
    tr.dataset.id = docu.id;
    tr.innerHTML = `
      <td>${f.idFactura||''}</td>
      <td>${f.fecha||''}</td>
      <td><span class="link-info" data-tipo="proveedor" data-nombre="${f.proveedor}">${f.proveedor||''}</span></td>
      <td><span class="link-info" data-tipo="producto" data-nombre="${f.producto}">${f.producto||''}</span></td>
      <td>${formatMoney(f.monto || 0, f.moneda || 'PEN')}</td>
      <td>${formatMoney(igv, f.moneda || 'PEN')}</td>
      <td>${formatMoney(total, f.moneda || 'PEN')}</td>
      <td>${f.tipo||''}</td>
      <td>
        <button class="btn-accion editar" data-tipo="factura" data-id="${docu.id}">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="factura" data-id="${docu.id}">🔍</button>
        <button class="btn-accion eliminar" data-tipo="factura" data-id="${docu.id}">🗑️</button>
      </td>
    `;
    tablaFacturas.appendChild(tr);

    // clicking provider/product in table opens modal with details (reusing mostrarModalFactura when clicking the factura detail button)
    tr.querySelectorAll(".link-info").forEach(el=>{
      el.addEventListener("click", async (ev)=>{
        const tipo = el.dataset.tipo;
        const nombre = el.dataset.nombre;
        // if clicked on provider/product inside table row, open panel with that info
        if(tipo === "proveedor"){
          const snap = await getDocs(query(colProveedores, where("nombre","==",nombre)));
          if(!snap.empty){
            const d = snap.docs[0].data();
            panelFlotante.innerHTML = `
              <h5 style="margin-top:0">Proveedor: ${d.nombre}</h5>
              <p><b>Tipo Documento:</b> ${d.tipoDocumento||''}</p>
              <p><b>RUC / Nº:</b> ${d.ruc||''}</p>
              <p><b>Dirección:</b> ${d.direccion||''}</p>
              <p><b>Teléfono:</b> ${d.telefono||''}</p>
            `;
            panelFlotante.appendChild(cerrarPanelBtn);
            panelFlotante.classList.add("show");
          }
        } else if(tipo === "producto"){
          const snap = await getDocs(query(colProductos, where("nombre","==",nombre)));
          if(!snap.empty){
            const d = snap.docs[0].data();
            panelFlotante.innerHTML = `
              <h5 style="margin-top:0">Producto: ${d.nombre}</h5>
              <p><b>Presentación:</b> ${d.presentacion || ''} (${d.cantidad || 0})</p>
              <p><b>Precio:</b> ${formatMoney(d.precio || 0, d.moneda || 'PEN')}</p>
              <p><b>Descripción:</b><br>${d.descripcion || ''}</p>
            `;
            panelFlotante.appendChild(cerrarPanelBtn);
            panelFlotante.classList.add("show");
          }
        }
      });
    });

  });
  countFacturas.textContent = snapshot.size;
});

// ===================== BUSCADOR =====================
buscador.style.display = "none";
buscador.addEventListener("input", async ()=>{
  const texto = buscador.value.trim().toLowerCase();
  panelFacturas.innerHTML = "";
  if(!texto) return;
  const snap = await getDocs(colFacturas);
  snap.forEach(docu=>{
    const f = docu.data();
    if((f.producto||"").toLowerCase().includes(texto) || (f.proveedor||"").toLowerCase().includes(texto) || (f.idFactura||"").toLowerCase().includes(texto)){
      const div = document.createElement("div");
      div.className = "resultado-item";
      div.textContent = `${f.idFactura} — ${f.producto} — ${f.proveedor}`;
      div.addEventListener("click", ()=> mostrarModalFactura(f));
      panelFacturas.appendChild(div);
    }
  });
});

// ===================== CLICK GLOBAL =====================
document.addEventListener("click", async e=>{
  // EDITAR
  if(e.target.classList.contains("editar")){
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    const colNombre = tipo === "proveedor" ? "proveedores" : tipo === "producto" ? "productos" : "facturas";
    const snap = await getDocs(query(collection(db, colNombre), where("__name__","==",id)));
    if(!snap.empty){
      const d = snap.docs[0].data();
      modalEditarBody.innerHTML = `<h5>Editar ${tipo}</h5>`;
      if(tipo === "proveedor"){
        modalEditarBody.innerHTML += `
          <label>Tipo Documento</label><input id="editTipoDoc" class="form-control mb-1" value="${d.tipoDocumento||''}">
          <label>RUC / Nº</label><input id="editRuc" class="form-control mb-1" value="${d.ruc||''}">
          <label>Nombre</label><input id="editNombre" class="form-control mb-1" value="${d.nombre||''}">
          <label>Dirección</label><input id="editDir" class="form-control mb-1" value="${d.direccion||''}">
          <label>Teléfono</label><input id="editTel" class="form-control mb-1" value="${d.telefono||''}">
        `;
      } else if(tipo === "producto"){
        modalEditarBody.innerHTML += `
          <label>Nombre</label><input id="editNombre" class="form-control mb-1" value="${d.nombre||''}">
          <label>Cantidad</label><input id="editCantidad" type="number" class="form-control mb-1" value="${d.cantidad||0}">
          <label>Presentación</label><input id="editPresentacion" class="form-control mb-1" value="${d.presentacion||''}">
          <label>Precio</label>
          <div class="d-flex gap-2">
            <input id="editPrecio" type="number" step="0.01" class="form-control mb-1" value="${d.precio||0}">
            <select id="editMoneda" class="form-select mb-1" style="max-width:120px">
              <option value="PEN" ${d.moneda === "PEN" ? "selected":""}>PEN</option>
              <option value="USD" ${d.moneda === "USD" ? "selected":""}>USD</option>
            </select>
          </div>
          <label>Descripción</label><textarea id="editDesc" class="form-control mb-1">${d.descripcion||''}</textarea>
        `;
      } else if(tipo === "factura"){
        modalEditarBody.innerHTML += `
          <label>ID</label><input id="editId" class="form-control mb-1" value="${d.idFactura||''}">
          <label>Fecha</label><input id="editFecha" type="date" class="form-control mb-1" value="${d.fecha||''}">
          <label>Proveedor</label><input id="editProv" class="form-control mb-1" value="${d.proveedor||''}">
          <label>Producto</label><input id="editProd" class="form-control mb-1" value="${d.producto||''}">
          <label>Subtotal</label><input id="editMonto" type="number" step="0.01" class="form-control mb-1" value="${d.monto||0}">
          <label>Tipo</label><input id="editTipo" class="form-control mb-1" value="${d.tipo||''}">
        `;
      }
      modalEditarBody.innerHTML += `<button id="guardarEdit" class="btn btn-primary mt-2">Guardar</button>`;
      modalEditar.showModal();

      // attach save
      const btnGuardar = document.getElementById("guardarEdit");
      btnGuardar.replaceWith(btnGuardar.cloneNode(true));
      document.getElementById("guardarEdit").addEventListener("click", async ()=>{
        const upd = {};
        if(tipo === "proveedor"){
          upd.tipoDocumento = document.getElementById("editTipoDoc").value.trim();
          upd.ruc = document.getElementById("editRuc").value.trim();
          upd.nombre = document.getElementById("editNombre").value.trim();
          upd.direccion = document.getElementById("editDir").value.trim();
          upd.telefono = document.getElementById("editTel").value.trim();
        } else if(tipo === "producto"){
          upd.nombre = document.getElementById("editNombre").value.trim();
          upd.cantidad = parseInt(document.getElementById("editCantidad").value || 0, 10);
          upd.presentacion = document.getElementById("editPresentacion").value.trim();
          upd.precio = parseFloat(document.getElementById("editPrecio").value || 0);
          upd.moneda = document.getElementById("editMoneda").value || "PEN";
          upd.descripcion = document.getElementById("editDesc").value.trim();
        } else if(tipo === "factura"){
          upd.idFactura = document.getElementById("editId").value.trim();
          upd.fecha = document.getElementById("editFecha").value;
          upd.proveedor = document.getElementById("editProv").value.trim();
          upd.producto = document.getElementById("editProd").value.trim();
          upd.monto = parseFloat(document.getElementById("editMonto").value || 0);
          upd.tipo = document.getElementById("editTipo").value.trim();
        }
        await updateDoc(doc(db, colNombre, id), upd);
        modalEditar.close();
      });
    }
  }

  // VER DETALLES (modalExtra)
  if(e.target.classList.contains("link-info") && !e.target.classList.contains("ver")) {
    // link-info is used both on table facturas and within modal rows; handle by dataset.tipo if present
    const tipo = e.target.dataset.tipo;
    const nombre = e.target.dataset.nombre;
    if(tipo && nombre){
      let colRef = tipo === "proveedor" ? colProveedores : colProductos;
      const snap = await getDocs(query(colRef, where("nombre","==",nombre)));
      if(!snap.empty){
        const d = snap.docs[0].data();
        modalExtraBody.innerHTML = `<h5 style="margin-top:0">${tipo} ${nombre}</h5>`;
        if(tipo === "proveedor"){
          modalExtraBody.innerHTML += `<p>RUC: ${d.ruc || ''}<br>Dirección: ${d.direccion||''}<br>Tel: ${d.telefono||''}</p>`;
        } else {
          modalExtraBody.innerHTML += `<p>Cantidad: ${d.cantidad || 0}<br>Presentación: ${d.presentacion || ''}<br>Precio: ${formatMoney(d.precio || 0, d.moneda || 'PEN')}<br>Descripción: ${d.descripcion||''}</p>`;
        }
        modalExtra.showModal();
      } else {
        alert("Registro no encontrado.");
      }
    }
  }

  // ELIMINAR
  if(e.target.classList.contains("eliminar")){
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    let colNombre = tipo === "proveedor" ? "proveedores" : tipo === "producto" ? "productos" : "facturas";
    if(confirm("¿Deseas eliminar este registro?")){
      await deleteDoc(doc(db, colNombre, id));
    }
  }
});

// ===================== ENLACES 'NO ENCUENTRAS...' -> llevar a form =====================
document.getElementById("agregarProveedorFactura").addEventListener("click", (ev)=>{
  ev.preventDefault();
  // simulate clicking side nav Proveedores
  const btn = [...document.querySelectorAll('.nav-btn')].find(b => b.dataset.target === 'proveedores');
  if(btn) btn.click();
  // focus first input
  setTimeout(()=> document.getElementById("tipoDocumentoProveedor").focus(), 200);
});

document.getElementById("agregarProductoFactura").addEventListener("click", (ev)=>{
  ev.preventDefault();
  const btn = [...document.querySelectorAll('.nav-btn')].find(b => b.dataset.target === 'productos');
  if(btn) btn.click();
  setTimeout(()=> document.getElementById("nombreProducto").focus(), 200);
});

// ===================== Inicializaciones =====================
document.addEventListener("DOMContentLoaded", ()=>{
  // initial id for factura
  const idField = document.getElementById("idFactura");
  if(idField) idField.value = "F"+Date.now();

  // hide search input initially (only show when in facturas)
  buscador.style.display = "none";

  // ensure selects filled
  cargarProveedoresSelect();
  cargarProductosSelect();
});

