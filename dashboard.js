// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===================== DOM ELEMENTS =====================
const navBtns = document.querySelectorAll('.nav-btn');
const secciones = document.querySelectorAll('.seccion');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// Proveedores
const formProveedor = document.getElementById('formProveedor');
const tipoDocumentoProveedor = document.getElementById('tipoDocumentoProveedor');
const numeroDocumentoProveedor = document.getElementById('numeroDocumentoProveedor');
const nombreProveedor = document.getElementById('nombreProveedor');
const direccionProveedor = document.getElementById('direccionProveedor');
const telefonoProveedor = document.getElementById('telefonoProveedor');
const tablaProveedores = document.getElementById('tablaProveedores');

// Productos
const formProducto = document.getElementById('formProducto');
const nombreProducto = document.getElementById('nombreProducto');
const presentacionProducto = document.getElementById('presentacionProducto');
const cantidadPresentacion = document.getElementById('cantidadPresentacion');
const precioProducto = document.getElementById('precioProducto');
const tipoMoneda = document.getElementById('tipoMoneda');
const descripcionProducto = document.getElementById('descripcionProducto');
const tablaProductos = document.getElementById('tablaProductos');

// Facturas
const formFactura = document.getElementById('formFactura');
const idFactura = document.getElementById('idFactura');
const fechaFactura = document.getElementById('fechaFactura');
const tipoFactura = document.getElementById('tipoFactura');
const proveedorFactura = document.getElementById('proveedorFactura');
const productoFactura = document.getElementById('productoFactura');
const montoFactura = document.getElementById('montoFactura');
const igvFactura = document.getElementById('igvFactura');
const totalFactura = document.getElementById('totalFactura');
const tablaFacturas = document.getElementById('tablaFacturas');
const campoAdicional = document.getElementById('campoAdicional');
const detalleAdicional = document.getElementById('detalleAdicional');

// Modales
const modalFactura = document.getElementById('modalFactura');
const modalFacturaBody = document.getElementById('modalFacturaBody');
const cerrarModalFactura = document.getElementById('cerrarModalFactura');

// ===================== NAVIGATION =====================
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');
    const target = btn.dataset.target;
    secciones.forEach(sec => sec.classList.remove('activa'));
    document.getElementById(target).classList.add('activa');
  });
});

// ===================== PROVEEDORES =====================
async function renderProveedores() {
  tablaProveedores.innerHTML = '';
  proveedorFactura.innerHTML = '<option value="">Seleccione proveedor</option>';
  const querySnapshot = await getDocs(collection(db, 'proveedores'));
  querySnapshot.forEach(docSnap => {
    const p = docSnap.data();
    tablaProveedores.innerHTML += `
      <tr>
        <td>${p.tipoDocumento} - ${p.numeroDocumento}</td>
        <td>${p.nombre}</td>
        <td>${p.direccion}</td>
        <td>${p.telefono}</td>
        <td>
          <button class="btn-accion text-primary" onclick="editarProveedor('${docSnap.id}')">✏️</button>
          <button class="btn-accion text-danger" onclick="eliminarProveedor('${docSnap.id}')">🗑️</button>
        </td>
      </tr>`;
    proveedorFactura.innerHTML += `<option value="${docSnap.id}">${p.nombre}</option>`;
  });
}

formProveedor.addEventListener('submit', async e => {
  e.preventDefault();
  await addDoc(collection(db, 'proveedores'), {
    tipoDocumento: tipoDocumentoProveedor.value,
    numeroDocumento: numeroDocumentoProveedor.value,
    nombre: nombreProveedor.value,
    direccion: direccionProveedor.value,
    telefono: telefonoProveedor.value
  });
  formProveedor.reset();
  renderProveedores();
});

// Eliminar Proveedor
window.eliminarProveedor = async id => {
  if (confirm('¿Eliminar proveedor?')) {
    await deleteDoc(doc(db, 'proveedores', id));
    renderProveedores();
  }
};

// Editar Proveedor
window.editarProveedor = async id => {
  const docSnap = await getDocs(collection(db, 'proveedores'));
  let p = null;
  docSnap.forEach(d => { if(d.id===id) p=d; });
  if (!p) return alert('Proveedor no encontrado');
  tipoDocumentoProveedor.value = p.data().tipoDocumento;
  numeroDocumentoProveedor.value = p.data().numeroDocumento;
  nombreProveedor.value = p.data().nombre;
  direccionProveedor.value = p.data().direccion;
  telefonoProveedor.value = p.data().telefono;

  formProveedor.onsubmit = async e => {
    e.preventDefault();
    await updateDoc(doc(db, 'proveedores', id), {
      tipoDocumento: tipoDocumentoProveedor.value,
      numeroDocumento: numeroDocumentoProveedor.value,
      nombre: nombreProveedor.value,
      direccion: direccionProveedor.value,
      telefono: telefonoProveedor.value
    });
    formProveedor.reset();
    formProveedor.onsubmit = defaultSubmitProveedor;
    renderProveedores();
  };
};

const defaultSubmitProveedor = formProveedor.onsubmit;

// ===================== PRODUCTOS =====================
async function renderProductos() {
  tablaProductos.innerHTML = '';
  productoFactura.innerHTML = '<option value="">Seleccione producto</option>';
  const querySnapshot = await getDocs(collection(db, 'productos'));
  querySnapshot.forEach(docSnap => {
    const p = docSnap.data();
    tablaProductos.innerHTML += `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.presentacion} (${p.cantidad})</td>
        <td>${p.precio} ${p.moneda}</td>
        <td>${p.descripcion}</td>
        <td>
          <button class="btn-accion text-primary" onclick="editarProducto('${docSnap.id}')">✏️</button>
          <button class="btn-accion text-danger" onclick="eliminarProducto('${docSnap.id}')">🗑️</button>
        </td>
      </tr>`;
    productoFactura.innerHTML += `<option value="${docSnap.id}">${p.nombre}</option>`;
  });
}

formProducto.addEventListener('submit', async e => {
  e.preventDefault();
  await addDoc(collection(db, 'productos'), {
    nombre: nombreProducto.value,
    presentacion: presentacionProducto.value,
    cantidad: cantidadPresentacion.value,
    precio: precioProducto.value,
    moneda: tipoMoneda.value,
    descripcion: descripcionProducto.value
  });
  formProducto.reset();
  renderProductos();
});

// Eliminar Producto
window.eliminarProducto = async id => {
  if (confirm('¿Eliminar producto?')) {
    await deleteDoc(doc(db, 'productos', id));
    renderProductos();
  }
};

// Editar Producto
window.editarProducto = async id => {
  const docSnap = await getDocs(collection(db, 'productos'));
  let p = null;
  docSnap.forEach(d => { if(d.id===id) p=d; });
  if (!p) return alert('Producto no encontrado');
  nombreProducto.value = p.data().nombre;
  presentacionProducto.value = p.data().presentacion;
  cantidadPresentacion.value = p.data().cantidad;
  precioProducto.value = p.data().precio;
  tipoMoneda.value = p.data().moneda;
  descripcionProducto.value = p.data().descripcion;

  formProducto.onsubmit = async e => {
    e.preventDefault();
    await updateDoc(doc(db, 'productos', id), {
      nombre: nombreProducto.value,
      presentacion: presentacionProducto.value,
      cantidad: cantidadPresentacion.value,
      precio: precioProducto.value,
      moneda: tipoMoneda.value,
      descripcion: descripcionProducto.value
    });
    formProducto.reset();
    formProducto.onsubmit = defaultSubmitProducto;
    renderProductos();
  };
};

const defaultSubmitProducto = formProducto.onsubmit;

// ===================== FACTURAS =====================
tipoFactura.addEventListener('change', () => {
  campoAdicional.style.display = tipoFactura.value.includes('Nota') ? 'block' : 'none';
});

montoFactura.addEventListener('input', () => {
  const igv = parseFloat(montoFactura.value) * 0.18;
  igvFactura.value = igv.toFixed(2);
  totalFactura.value = (parseFloat(montoFactura.value)+igv).toFixed(2);
});

// Guardar o editar factura
let facturaEditId = null;

formFactura.addEventListener('submit', async e => {
  e.preventDefault();
  const data = {
    fecha: fechaFactura.value,
    proveedor: proveedorFactura.value,
    producto: productoFactura.value,
    subtotal: parseFloat(montoFactura.value),
    igv: parseFloat(igvFactura.value),
    total: parseFloat(totalFactura.value),
    tipo: tipoFactura.value,
    detalle: detalleAdicional.value
  };

  if(facturaEditId){
    await updateDoc(doc(db,'facturas',facturaEditId), data);
    facturaEditId = null;
  } else {
    await addDoc(collection(db,'facturas'), data);
  }

  formFactura.reset();
  campoAdicional.style.display = 'none';
  renderFacturas();
});

// Render facturas
async function renderFacturas() {
  tablaFacturas.innerHTML = '';
  const proveedoresSnap = await getDocs(collection(db,'proveedores'));
  const proveedoresMap = {};
  proveedoresSnap.forEach(d => { proveedoresMap[d.id] = d.data().nombre; });
  const productosSnap = await getDocs(collection(db,'productos'));
  const productosMap = {};
  productosSnap.forEach(d => { productosMap[d.id] = d.data().nombre; });

  const querySnap = await getDocs(collection(db,'facturas'));
  querySnap.forEach(docSnap => {
    const f = docSnap.data();
    tablaFacturas.innerHTML += `
      <tr>
        <td>${docSnap.id}</td>
        <td>${f.fecha}</td>
        <td>${proveedoresMap[f.proveedor] || 'N/A'}</td>
        <td>${productosMap[f.producto] || 'N/A'}</td>
        <td>${f.subtotal.toFixed(2)}</td>
        <td>${f.igv.toFixed(2)}</td>
        <td>${f.total.toFixed(2)}</td>
        <td>${f.tipo}</td>
        <td>
          <button class="btn-accion text-info" onclick="verFactura('${docSnap.id}')">👁️</button>
          <button class="btn-accion text-warning" onclick="editarFactura('${docSnap.id}')">✏️</button>
          <button class="btn-accion text-danger" onclick="eliminarFactura('${docSnap.id}')">🗑️</button>
        </td>
      </tr>`;
  });
}

// Ver Factura
window.verFactura = async id => {
  const docSnap = await getDocs(collection(db,'facturas'));
  let f = null;
  docSnap.forEach(d => { if(d.id===id) f=d; });
  if(!f) return alert('Factura no encontrada');
  modalFacturaBody.innerHTML = `<pre>${JSON.stringify(f.data(), null,2)}</pre>`;
  modalFactura.showModal();
};

// Editar Factura
window.editarFactura = async id => {
  const docSnap = await getDocs(collection(db,'facturas'));
  let f = null;
  docSnap.forEach(d => { if(d.id===id) f=d; });
  if(!f) return alert('Factura no encontrada');

  fechaFactura.value = f.data().fecha;
  proveedorFactura.value = f.data().proveedor;
  productoFactura.value = f.data().producto;
  montoFactura.value = f.data().subtotal;
  igvFactura.value = f.data().igv;
  totalFactura.value = f.data().total;
  tipoFactura.value = f.data().tipo;
  detalleAdicional.value = f.data().detalle;
  campoAdicional.style.display = f.data().tipo.includes('Nota') ? 'block' : 'none';

  facturaEditId = id;
};

// Eliminar Factura
window.eliminarFactura = async id => {
  if(confirm('¿Eliminar factura?')){
    await deleteDoc(doc(db,'facturas',id));
    renderFacturas();
  }
};

// ===================== BÚSQUEDA =====================
searchInput.addEventListener('input', async ()=>{
  const term = searchInput.value.toLowerCase();
  searchResults.innerHTML='';
  if(!term) return;

  const productosSnap = await getDocs(collection(db,'productos'));
  productosSnap.forEach(d=>{
    if(d.data().nombre.toLowerCase().includes(term)){
      const div = document.createElement('div');
      div.classList.add('resultado-item');
      div.textContent = `Producto: ${d.data().nombre}`;
      searchResults.appendChild(div);
    }
  });

  const facturasSnap = await getDocs(collection(db,'facturas'));
  facturasSnap.forEach(d=>{
    if(d.id.toLowerCase().includes(term)){
      const div = document.createElement('div');
      div.classList.add('resultado-item');
      div.textContent = `Factura ID: ${d.id}`;
      searchResults.appendChild(div);
    }
  });
});

// ===================== MODAL =====================
cerrarModalFactura.addEventListener('click', ()=> modalFactura.close());

// ===================== INITIAL RENDER =====================
renderProveedores();
renderProductos();
renderFacturas();


