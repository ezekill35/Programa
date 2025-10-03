import { db, auth, cerrarSesion } from './firebase.js';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// Variables
let proveedores = [], facturas = [], gastos = [], servicios = [];

// Contadores
const totalProveedores = document.getElementById('total-proveedores');
const totalFacturas = document.getElementById('total-facturas');
const totalGastos = document.getElementById('total-gastos');
const totalServicios = document.getElementById('total-servicios');

// Menú lateral
const menuItems = document.querySelectorAll('.sidebar ul li');
const sections = document.querySelectorAll('.section');
menuItems.forEach(item=>{
  item.addEventListener('click',()=>{
    menuItems.forEach(i=>i.classList.remove('active'));
    sections.forEach(s=>s.classList.remove('active'));
    item.classList.add('active');
    const sectionId = item.id.replace('menu-','');
    if(sectionId==='logout'){ cerrarSesion(); return; }
    document.getElementById(sectionId).classList.add('active');
  });
});

// ================= PROVEEDORES =================
const listaProveedores = document.getElementById('listaProveedores');
const provRuc = document.getElementById('provRuc');
const provNombre = document.getElementById('provNombre');
const provDireccion = document.getElementById('provDireccion');
const provTelefono = document.getElementById('provTelefono');
const provProducto = document.getElementById('provProducto');
const btnAgregarProveedor = document.getElementById('btnAgregarProveedor');
const facRucProveedor = document.getElementById('facRucProveedor');

const proveedoresCol = collection(db,'proveedores');

btnAgregarProveedor.addEventListener('click', async ()=>{
  if(!provRuc.value || !provNombre.value) return alert("RUC y Nombre son obligatorios");
  await addDoc(proveedoresCol,{
    ruc: provRuc.value,
    nombre: provNombre.value,
    direccion: provDireccion.value,
    telefono: provTelefono.value,
    producto: provProducto.value
  });
  provRuc.value=''; provNombre.value=''; provDireccion.value=''; provTelefono.value=''; provProducto.value='';
});

// Actualizar lista en tiempo real
onSnapshot(proveedoresCol,(snap)=>{
  listaProveedores.innerHTML='';
  facRucProveedor.innerHTML='<option value="">-- Selecciona un Proveedor --</option>';
  snap.forEach(docSnap=>{
    const p = docSnap.data();
    const id = docSnap.id;
    listaProveedores.innerHTML+=`
      <tr>
        <td>${p.ruc}</td>
        <td>${p.nombre}</td>
        <td>${p.direccion}</td>
        <td>${p.telefono}</td>
        <td>${p.producto}</td>
        <td><button onclick="eliminarProveedor('${id}')">❌</button></td>
      </tr>
    `;
    facRucProveedor.innerHTML+=`<option value="${p.ruc}">${p.nombre}</option>`;
  });
  totalProveedores.innerText = snap.size;
});

window.eliminarProveedor = async (id)=>{
  if(confirm("Eliminar proveedor?")) await deleteDoc(doc(db,'proveedores',id));
};

// ================= FACTURAS =================
const listaFacturas = document.getElementById('listaFacturas');
const facTipo = document.getElementById('facTipo');
const facDescripcion = document.getElementById('facDescripcion');
const facFecha = document.getElementById('facFecha');
const facMonto = document.getElementById('facMonto');
const facMoneda = document.getElementById('facMoneda');
const btnAgregarFactura = document.getElementById('btnAgregarFactura');
const facturasCol = collection(db,'facturas');

btnAgregarFactura.addEventListener('click', async ()=>{
  if(!facRucProveedor.value || !facMonto.value) return alert("Proveedor y monto son obligatorios");
  await addDoc(facturasCol,{
    proveedor: facRucProveedor.value,
    tipo: facTipo.value,
    descripcion: facDescripcion.value,
    fecha: facFecha.value,
    monto: parseFloat(facMonto.value),
    moneda: facMoneda.value
  });
  facTipo.value=''; facDescripcion.value=''; facFecha.value=''; facMonto.value='';
});

// Actualizar lista en tiempo real
onSnapshot(facturasCol,(snap)=>{
  listaFacturas.innerHTML='';
  snap.forEach(docSnap=>{
    const f = docSnap.data();
    const id = docSnap.id;
    listaFacturas.innerHTML+=`
      <tr>
        <td>${f.proveedor}</td>
        <td>${f.tipo}</td>
        <td>${f.descripcion}</td>
        <td>${f.fecha}</td>
        <td>${f.moneda} ${f.monto.toFixed(2)}</td>
        <td><button onclick="eliminarFactura('${id}')">❌</button></td>
      </tr>
    `;
  });
  totalFacturas.innerText = snap.size;
});

window.eliminarFactura = async (id)=>{
  if(confirm("Eliminar factura?")) await deleteDoc(doc(db,'facturas',id));
};

// ================= GASTOS =================
const listaGastos = document.getElementById('listaGastos');
const gastoNombre = document.getElementById('gastoNombre');
const gastoTipo = document.getElementById('gastoTipo');
const gastoMonto = document.getElementById('gastoMonto');
const gastoFecha = document.getElementById('gastoFecha');
const btnAgregarGasto = document.getElementById('btnAgregarGasto');
const gastosCol = collection(db,'gastos');

btnAgregarGasto.addEventListener('click', async ()=>{
  if(!gastoNombre.value || !gastoMonto.value) return alert("Nombre y monto son obligatorios");
  await addDoc(gastosCol,{
    nombre: gastoNombre.value,
    tipo: gastoTipo.value,
    monto: parseFloat(gastoMonto.value),
    fecha: gastoFecha.value
  });
  gastoNombre.value=''; gastoTipo.value=''; gastoMonto.value=''; gastoFecha.value='';
});

onSnapshot(gastosCol,(snap)=>{
  listaGastos.innerHTML='';
  snap.forEach(docSnap=>{
    const g = docSnap.data();
    const id = docSnap.id;
    listaGastos.innerHTML+=`
      <tr>
        <td>${g.nombre}</td>
        <td>${g.tipo}</td>
        <td>${g.monto.toFixed(2)}</td>
        <td>${g.fecha}</td>
        <td><button onclick="eliminarGasto('${id}')">❌</button></td>
      </tr>
    `;
  });
  totalGastos.innerText = snap.size;
});

window.eliminarGasto = async (id)=>{
  if(confirm("Eliminar gasto?")) await deleteDoc(doc(db,'gastos',id));
};

// ================= SERVICIOS =================
const listaServicios = document.getElementById('listaServicios');
const servNombre = document.getElementById('servNombre');
const servDescripcion = document.getElementById('servDescripcion');
const servFecha = document.getElementById('servFecha');
const servPrecio = document.getElementById('servPrecio');
const btnAgregarServicio = document.getElementById('btnAgregarServicio');
const serviciosCol = collection(db,'servicios');

btnAgregarServicio.addEventListener('click', async ()=>{
  if(!servNombre.value || !servPrecio.value) return alert("Nombre y precio son obligatorios");
  await addDoc(serviciosCol,{
    nombre: servNombre.value,
    descripcion: servDescripcion.value,
    fecha: servFecha.value,
    precio: parseFloat(servPrecio.value)
  });
  servNombre.value=''; servDescripcion.value=''; servFecha.value=''; servPrecio.value='';
});

onSnapshot(serviciosCol,(snap)=>{
  listaServicios.innerHTML='';
  snap.forEach(docSnap=>{
    const s = docSnap.data();
    const id = docSnap.id;
    listaServicios.innerHTML+=`
      <tr>
        <td>${s.nombre}</td>
        <td>${s.descripcion}</td>
        <td>${s.fecha}</td>
        <td>${s.precio.toFixed(2)}</td>
        <td><button onclick="eliminarServicio('${id}')">❌</button></td>
      </tr>
    `;
  });
  totalServicios.innerText = snap.size;
});

window.eliminarServicio = async (id)=>{
  if(confirm("Eliminar servicio?")) await deleteDoc(doc(db,'servicios',id));
};


