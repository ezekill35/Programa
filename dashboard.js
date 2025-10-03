// =======================================
// 🐾 Dashboard JS - Discovery Pets
// =======================================

// ------------------ Variables globales ------------------
let proveedores = [];
let facturas = [];
let gastos = [];
let servicios = [];
let editIndex = { tipo: null, index: null };

// ------------------ Contadores ------------------
const totalProveedores = document.getElementById('total-proveedores');
const totalFacturas = document.getElementById('total-facturas');
const totalGastos = document.getElementById('total-gastos');
const totalServicios = document.getElementById('total-servicios');

// ------------------ Menú lateral ------------------
const menuItems = document.querySelectorAll('.sidebar ul li');
const sections = document.querySelectorAll('.section');

menuItems.forEach(item => {
  item.addEventListener('click', () => {
    menuItems.forEach(i => i.classList.remove('active'));
    sections.forEach(sec => sec.classList.remove('active'));
    item.classList.add('active');

    const sectionId = item.id.replace('menu-', '');
    document.getElementById(sectionId).classList.add('active');
  });
});

// =======================================
// 🏪 PROVEEDORES
// =======================================
const listaProveedores = document.getElementById('listaProveedores');
const btnAgregarProveedor = document.getElementById('btnAgregarProveedor');

btnAgregarProveedor.addEventListener('click', () => {
  const ruc = document.getElementById('provRuc').value.trim();
  const nombre = document.getElementById('provNombre').value.trim();
  const direccion = document.getElementById('provDireccion').value.trim();
  const correo = document.getElementById('provCorreo').value.trim();
  const telefono = document.getElementById('provTelefono').value.trim();
  const producto = document.getElementById('provProducto').value.trim();

  if(!ruc || !nombre) return alert('RUC y Nombre son obligatorios');

  const prov = { ruc, nombre, direccion, correo, telefono, producto };

  if(editIndex.tipo === 'proveedor'){
    proveedores[editIndex.index] = prov;
    editIndex = { tipo:null, index:null };
  } else {
    proveedores.push(prov);
  }

  document.getElementById('formProveedor').reset();
  actualizarProveedores();
});

function actualizarProveedores(filter=''){
  listaProveedores.innerHTML = '';
  proveedores.forEach((prov, index) => {
    if(prov.nombre.toLowerCase().includes(filter.toLowerCase()) || prov.ruc.includes(filter)){
      listaProveedores.innerHTML += `
        <tr>
          <td>${prov.ruc}</td>
          <td>${prov.nombre}</td>
          <td>${prov.direccion}</td>
          <td>${prov.correo}</td>
          <td>${prov.telefono}</td>
          <td>${prov.producto}</td>
          <td>
            <button onclick="editarProveedor(${index})">✏️</button>
            <button onclick="eliminarProveedor(${index})">❌</button>
          </td>
        </tr>
      `;
    }
  });
  totalProveedores.textContent = proveedores.length;
  actualizarSelectProveedores();
}

function editarProveedor(index){
  const p = proveedores[index];
  document.getElementById('provRuc').value = p.ruc;
  document.getElementById('provNombre').value = p.nombre;
  document.getElementById('provDireccion').value = p.direccion;
  document.getElementById('provCorreo').value = p.correo;
  document.getElementById('provTelefono').value = p.telefono;
  document.getElementById('provProducto').value = p.producto;
  editIndex = { tipo:'proveedor', index:index };
}

function eliminarProveedor(index){
  if(confirm('¿Eliminar proveedor?')){
    proveedores.splice(index,1);
    actualizarProveedores();
  }
}

// Actualizar select en Facturas
function actualizarSelectProveedores() {
  const select = document.getElementById('facRucProveedor');
  select.innerHTML = `<option value="">-- Selecciona un Proveedor --</option>`;
  proveedores.forEach(p => {
    select.innerHTML += `<option value="${p.nombre}">${p.nombre}</option>`;
  });
}

// Buscador Proveedores
document.getElementById('btnBuscarProveedor').addEventListener('click', () => {
  actualizarProveedores(document.getElementById('buscarProveedor').value);
});

// =======================================
// 📑 FACTURAS
// =======================================
const listaFacturas = document.getElementById('listaFacturas');
const btnAgregarFactura = document.getElementById('btnAgregarFactura');

btnAgregarFactura.addEventListener('click', () => {
  const proveedor = document.getElementById('facRucProveedor').value;
  const tipo = document.getElementById('facTipo').value.trim();
  const descripcion = document.getElementById('facDescripcion').value.trim();
  const fecha = document.getElementById('facFecha').value;
  const monto = document.getElementById('facMonto').value.trim();

  if(!proveedor || !tipo) return alert('Proveedor y Tipo son obligatorios');

  const fac = { proveedor, tipo, descripcion, fecha, monto };

  if(editIndex.tipo === 'factura'){
    facturas[editIndex.index] = fac;
    editIndex = { tipo:null, index:null };
  } else {
    facturas.push(fac);
  }

  document.getElementById('facRucProveedor').value = '';
  document.getElementById('facTipo').value = '';
  document.getElementById('facDescripcion').value = '';
  document.getElementById('facFecha').value = '';
  document.getElementById('facMonto').value = '';
  actualizarFacturas();
});

function actualizarFacturas(filter=''){
  listaFacturas.innerHTML = '';
  facturas.forEach((fac, index) => {
    if(fac.tipo.toLowerCase().includes(filter.toLowerCase()) || fac.proveedor.toLowerCase().includes(filter.toLowerCase())){
      listaFacturas.innerHTML += `
        <tr>
          <td>${fac.proveedor}</td>
          <td>${fac.tipo}</td>
          <td>${fac.descripcion}</td>
          <td>${fac.fecha}</td>
          <td>${fac.monto}</td>
          <td>
            <button onclick="editarFactura(${index})">✏️</button>
            <button onclick="eliminarFactura(${index})">❌</button>
          </td>
        </tr>
      `;
    }
  });
  totalFacturas.textContent = facturas.length;
}

function editarFactura(index){
  const f = facturas[index];
  document.getElementById('facRucProveedor').value = f.proveedor;
  document.getElementById('facTipo').value = f.tipo;
  document.getElementById('facDescripcion').value = f.descripcion;
  document.getElementById('facFecha').value = f.fecha;
  document.getElementById('facMonto').value = f.monto;
  editIndex = { tipo:'factura', index:index };
}

function eliminarFactura(index){
  if(confirm('¿Eliminar factura?')){
    facturas.splice(index,1);
    actualizarFacturas();
  }
}

// Buscador Facturas
document.getElementById('btnBuscarFactura').addEventListener('click', () => {
  actualizarFacturas(document.getElementById('buscarFactura').value);
});

// =======================================
// 💰 GASTOS
// =======================================
const listaGastos = document.getElementById('listaGastos');
const btnAgregarGasto = document.getElementById('btnAgregarGasto');

btnAgregarGasto.addEventListener('click', () => {
  const nombre = document.getElementById('gastoNombre').value.trim();
  const tipo = document.getElementById('gastoTipo').value;
  const monto = document.getElementById('gastoMonto').value.trim();
  const fecha = document.getElementById('gastoFecha').value;

  if(!nombre || !tipo) return alert('Nombre y Tipo son obligatorios');

  const g = { nombre,tipo,monto,fecha };

  if(editIndex.tipo === 'gasto'){
    gastos[editIndex.index] = g;
    editIndex = { tipo:null, index:null };
  } else {
    gastos.push(g);
  }

  document.getElementById('formGasto').reset();
  actualizarGastos();
});

function actualizarGastos(filter=''){
  listaGastos.innerHTML = '';
  gastos.forEach((g,index) => {
    if(g.nombre.toLowerCase().includes(filter.toLowerCase()) || g.tipo.toLowerCase().includes(filter.toLowerCase())){
      listaGastos.innerHTML += `
        <tr>
          <td>${g.nombre}</td>
          <td>${g.tipo}</td>
          <td>${g.monto}</td>
          <td>${g.fecha}</td>
          <td>
            <button onclick="editarGasto(${index})">✏️</button>
            <button onclick="eliminarGasto(${index})">❌</button>
          </td>
        </tr>
      `;
    }
  });
  totalGastos.textContent = gastos.length;
}

function editarGasto(index){
  const g = gastos[index];
  document.getElementById('gastoNombre').value = g.nombre;
  document.getElementById('gastoTipo').value = g.tipo;
  document.getElementById('gastoMonto').value = g.monto;
  document.getElementById('gastoFecha').value = g.fecha;
  editIndex = { tipo:'gasto', index:index };
}

function eliminarGasto(index){
  if(confirm('¿Eliminar gasto?')){
    gastos.splice(index,1);
    actualizarGastos();
  }
}

// Buscador Gastos
document.getElementById('btnBuscarGasto').addEventListener('click', () => {
  actualizarGastos(document.getElementById('buscarGasto').value);
});

// =======================================
// 🛠 SERVICIOS
// =======================================
const listaServicios = document.getElementById('listaServicios');
const btnAgregarServicio = document.getElementById('btnAgregarServicio');

btnAgregarServicio.addEventListener('click', () => {
  const nombre = document.getElementById('servNombre').value.trim();
  const descripcion = document.getElementById('servDescripcion').value.trim();
  const fecha = document.getElementById('servFecha').value;
  const precio = document.getElementById('servPrecio').value.trim();

  if(!nombre) return alert('Nombre es obligatorio');

  const s = { nombre, descripcion, fecha, precio };

  if(editIndex.tipo === 'servicio'){
    servicios[editIndex.index] = s;
    editIndex = { tipo:null, index:null };
  } else {
    servicios.push(s);
  }

  document.getElementById('servNombre').value = '';
  document.getElementById('servDescripcion').value = '';
  document.getElementById('servFecha').value = '';
  document.getElementById('servPrecio').value = '';
  actualizarServicios();
});

function actualizarServicios(filter=''){
  listaServicios.innerHTML = '';
  servicios.forEach((s,index) => {
    if(s.nombre.toLowerCase().includes(filter.toLowerCase()) || s.descripcion.toLowerCase().includes(filter.toLowerCase())){
      listaServicios.innerHTML += `
        <tr>
          <td>${s.nombre}</td>
          <td>${s.descripcion}</td>
          <td>${s.fecha}</td>
          <td>${s.precio}</td>
          <td>
            <button onclick="editarServicio(${index})">✏️</button>
            <button onclick="eliminarServicio(${index})">❌</button>
          </td>
        </tr>
      `;
    }
  });
  totalServicios.textContent = servicios.length;
}

function editarServicio(index){
  const s = servicios[index];
  document.getElementById('servNombre').value = s.nombre;
  document.getElementById('servDescripcion').value = s.descripcion;
  document.getElementById('servFecha').value = s.fecha;
  document.getElementById('servPrecio').value = s.precio;
  editIndex = { tipo:'servicio', index:index };
}

function eliminarServicio(index){
  if(confirm('¿Eliminar servicio?')){
    servicios.splice(index,1);
    actualizarServicios();
  }
}

// Buscador Servicios
document.getElementById('btnBuscarServicio').addEventListener('click', () => {
  actualizarServicios(document.getElementById('buscarServicio').value);
});







