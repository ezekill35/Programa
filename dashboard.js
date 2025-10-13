import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy
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
  const telefono = document.getElementById("telefonoProveedor")?.value.trim() || '';

  await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion, telefono });
  proveedorForm.reset();
});

// Render proveedores
function renderProveedores() {
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
        <td>${p.telefono || '-'}</td>
        <td>${p.direccion || '-'}</td>
        <td>
          <button class="btn secondary" onclick="editarProveedor('${docu.id}','${p.ruc}','${p.nombre}','${p.telefono || ''}','${p.direccion || ''}')">Editar</button>
          <button class="btn secondary" onclick="eliminarProveedor('${docu.id}')">Eliminar</button>
        </td>
      `;
      tablaProveedores.appendChild(fila);

      const option = document.createElement("option");
      option.value = p.nombre;
      option.textContent = p.nombre;
      proveedorSelect.appendChild(option);
    });
  });
}
renderProveedores();

// ======================= PRODUCTOS =======================
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");

productoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const cantidad = document.getElementById("cantidadProducto").value.trim();
  const unidad = document.getElementById("unidadProducto").value.trim();
  const categoria = document.getElementById("categoriaProducto")?.value.trim() || '';
  const valor = document.getElementById("valorUnitarioProducto").value.trim();

  await addDoc(collection(db, "productos"), { nombre, cantidad, unidad, categoria, valor });
  productoForm.reset();
});

// Render productos
function renderProductos() {
  onSnapshot(collection(db, "productos"), (snapshot) => {
    tablaProductos.innerHTML = "";
    const productoSelect = document.getElementById("productoFactura");
    productoSelect.innerHTML = '<option value="">Seleccione producto</option>';

    snapshot.forEach((docu) => {
      const p = docu.data();
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${p.nombre}</td>
        <td>${p.cantidad}</td>
        <td>${p.unidad}</td>
        <td>${p.categoria || '-'}</td>
        <td>${p.valor}</td>
        <td>
          <button class="btn secondary" onclick="editarProducto('${docu.id}','${p.nombre}','${p.cantidad}','${p.unidad}','${p.categoria || ''}','${p.valor}')">Editar</button>
          <button class="btn secondary" onclick="eliminarProducto('${docu.id}')">Eliminar</button>
        </td>
      `;
      tablaProductos.appendChild(fila);

      const option = document.createElement("option");
      option.value = p.nombre;
      option.textContent = p.nombre;
      productoSelect.appendChild(option);
    });
  });
}
renderProductos();

// ======================= FACTURAS =======================
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");

facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const numero = document.getElementById("numeroFactura").value.trim();
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

  const idFactura = `F${Date.now()}`; // ID única
  await addDoc(collection(db, "facturas"), {
    id: idFactura,
    numero,
    fecha,
    proveedor,
    producto,
    monto,
    moneda,
    tipo
  });
  facturaForm.reset();
});

// Render facturas
let facturasGuardadas = [];
function renderFacturas() {
  onSnapshot(collection(db, "facturas", query(collection(db,"facturas"),orderBy("fecha"))), (snapshot) => {
    facturasGuardadas = [];
    tablaFacturas.innerHTML = "";
    snapshot.forEach((docu) => {
      const f = docu.data();
      facturasGuardadas.push({ id: docu.id, ...f });
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${f.numero}</td>
        <td class="ver-proveedor" data-nombre="${f.proveedor}" style="cursor:pointer;color:#007bff">${f.proveedor}</td>
        <td class="ver-producto" data-nombre="${f.producto}" style="cursor:pointer;color:#007bff">${f.producto}</td>
        <td>${f.moneda}${f.monto}</td>
        <td>${f.tipo}</td>
        <td>${f.fecha}</td>
        <td>
          <button class="btn secondary" onclick="editarFactura('${docu.id}','${f.proveedor}','${f.producto}','${f.monto}','${f.moneda}','${f.tipo}','${f.fecha}')">Editar</button>
          <button class="btn secondary" onclick="eliminarFactura('${docu.id}')">Eliminar</button>
        </td>
      `;
      tablaFacturas.appendChild(fila);
    });
  });
}
renderFacturas();

// ======================= ELIMINAR =======================
window.eliminarProveedor = async (id) => {
  if(confirm("¿Desea eliminar este proveedor?")) await deleteDoc(doc(db,'proveedores',id));
};
window.eliminarProducto = async (id) => {
  if(confirm("¿Desea eliminar este producto?")) await deleteDoc(doc(db,'productos',id));
};
window.eliminarFactura = async (id) => {
  if(confirm("¿Desea eliminar esta factura?")) await deleteDoc(doc(db,'facturas',id));
};

// ======================= EDITAR =======================
window.editarProveedor = async (id, ruc, nombre, telefono, direccion) => {
  const nuevoNombre = prompt("Nombre proveedor:", nombre);
  if(nuevoNombre === null) return;
  const nuevoRUC = prompt("RUC:", ruc);
  if(nuevoRUC === null) return;
  const nuevoTel = prompt("Teléfono (opcional):", telefono);
  const nuevaDir = prompt("Dirección:", direccion);
  await updateDoc(doc(db,'proveedores',id), {
    ruc: nuevoRUC,
    nombre: nuevoNombre,
    telefono: nuevoTel,
    direccion: nuevaDir
  });
};

window.editarProducto = async (id, nombre, cantidad, unidad, categoria, valor) => {
  const nuevoNombre = prompt("Nombre producto:", nombre);
  if(nuevoNombre === null) return;
  const nuevaCant = prompt("Cantidad:", cantidad);
  const nuevaUnidad = prompt("Unidad:", unidad);
  const nuevaCat = prompt("Categoría:", categoria);
  const nuevoValor = prompt("Valor unitario:", valor);
  await updateDoc(doc(db,'productos',id), {
    nombre: nuevoNombre,
    cantidad: nuevaCant,
    unidad: nuevaUnidad,
    categoria: nuevaCat,
    valor: nuevoValor
  });
};

window.editarFactura = async (id, proveedor, producto, monto, moneda, tipo, fecha) => {
  const nuevoProveedor = prompt("Proveedor:", proveedor);
  const nuevoProducto = prompt("Producto:", producto);
  const nuevoMonto = prompt("Monto:", monto);
  const nuevaMoneda = prompt("Moneda (S/ $):", moneda);
  const nuevoTipo = prompt("Tipo (Compra/Gasto/Servicio):", tipo);
  const nuevaFecha = prompt("Fecha (YYYY-MM-DD):", fecha);
  await updateDoc(doc(db,'facturas',id), {
    proveedor: nuevoProveedor,
    producto: nuevoProducto,
    monto: nuevoMonto,
    moneda: nuevaMoneda,
    tipo: nuevoTipo,
    fecha: nuevaFecha
  });
};

// ======================= BUSCADOR =======================
const buscador = document.getElementById("buscadorFactura");
buscador.addEventListener("keypress", (e) => {
  if(e.key === 'Enter'){
    const valor = buscador.value.trim().toLowerCase();
    const filtradas = facturasGuardadas.filter((f) =>
      f.producto.toLowerCase().includes(valor)
    );
    mostrarResultadosBuscador(filtradas, valor);
  }
});
buscador.addEventListener("input", () => {
  if(busqueda.value.trim()==="") actualizarResultadosBuscador();
});

function mostrarResultadosBuscador(facturas, busqueda){
  const modal = document.getElementById("modalResultados");
  const container = document.getElementById("resultsContainer");
  container.innerHTML = '';
  facturas.forEach(f=>{
    const card = document.createElement("div");
    card.className="fact-card";
    card.innerHTML = `<h4>Factura ${f.numero}</h4>
      <div style="font-size:14px;color:#034c57"><strong>${f.producto}</strong></div>
      <div style="margin-top:8px"><div class="muted">Proveedor</div>
        <div><span class="ver-proveedor" data-nombre="${f.proveedor}" style="cursor:pointer;color:var(--accent)">${f.proveedor}</span></div>
      </div>
      <div class="meta"><div>${f.fecha}</div><div>${f.monto}</div></div>`;
    card.addEventListener("click",()=>{abrirModalFacturaFromCard(f)});
    container.appendChild(card);
  });
  modal.classList.add("show");
  modal.style.display='flex';
  document.getElementById("resultTitle").textContent=`🔍 Resultados relacionados con "${busqueda}"`;
  document.getElementById("resultSub").textContent=`${facturas.length} factura(s) mostradas.`;
}

window.abrirModalFacturaFromCard = (fData) => {
  const modal = document.getElementById('modalFactura');
  const cont = document.getElementById('modalFacturaContenido');
  document.getElementById('facturaTitle').textContent = `Factura Nº ${fData.numero || '-'}`;
  cont.innerHTML = `
    <div class="factura-detail">
      <div>
        <div class="detail-block"><div class="label">Proveedor</div>
        <div><span class="ver-proveedor" data-nombre="${fData.proveedor}" style="cursor:pointer;color:var(--accent)">${fData.proveedor}</span></div></div>
        <div style="height:12px"></div>
        <div class="detail-block"><div class="label">Producto</div>
        <div><span class="ver-producto" data-nombre="${fData.producto}" style="cursor:pointer;color:var(--accent)">${fData.producto}</span></div></div>
        <div style="height:12px"></div>
        <div class="detail-block"><div class="label">Tipo</div>
        <div>${fData.tipo || '-'}</div></div>
      </div>
      <aside>
        <div class="detail-block"><div class="label">Monto</div>
        <div>${fData.moneda || ''}${fData.monto || '-'}</div></div>
        <div style="height:12px"></div>
        <div class="detail-block"><div class="label">Número</div>
        <div>${fData.numero || '-'}</div></div>
        <div style="height:12px"></div>
        <div class="detail-block"><div class="label">Fecha</div>
        <div>${fData.fecha || '-'}</div></div>
      </aside>
    </div>`;
  modal.classList.add('show'); modal.style.display='flex';
};

function actualizarResultadosBuscador(){
  document.getElementById('modalResultados').classList.remove('show');
  document.getElementById('resultsContainer').innerHTML='';
}




