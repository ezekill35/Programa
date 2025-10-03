// =======================================
// 🐾 Dashboard JS - Discovery Pets
// =======================================

// ------------------ Variables globales ------------------
let proveedores = [];
let facturas = [];
let gastos = [];
let servicios = [];

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

  proveedores.push({ruc, nombre, direccion, correo, telefono, producto});
  actualizarProveedores();
  document.getElementById('formProveedor').reset();
});

function actualizarProveedores() {
  listaProveedores.innerHTML = '';
  proveedores.forEach((prov, index) => {
    listaProveedores.innerHTML += `
      <tr>
        <td>${prov.ruc}</td>
        <td>${prov.nombre}</td>
        <td>${prov.direccion}</td>
        <td>${prov.correo}</td>
        <td>${prov.telefono}</td>
        <td>${prov.producto}</td>
        <td><button onclick="eliminarProveedor(${index})">❌</button></td>
      </tr>
    `;
  });

  totalProveedores.textContent = proveedores.length;
  actualizarSelectProveedores();
}

function eliminarProveedor(index) {
  if(confirm('¿Eliminar proveedor?')) {
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
  const busqueda = document.getElementById('buscarProveedor').value.toLowerCase();
  const filtrados = proveedores.filter(p => 
    p.ruc.toLowerCase().includes(busqueda) ||
    p.nombre.toLowerCase().includes(busqueda)
  );
  listaProveedores.innerHTML = '';
  filtrados.forEach((prov, index) => {
    listaProveedores.innerHTML += `
      <tr>
        <td>${prov.ruc}</td>
        <td>${prov.nombre}</td>
        <td>${prov.direccion}</td>
        <td>${prov.correo}</td>
        <td>${prov.telefono}</td>
        <td>${prov.producto}</td>
        <td><button onclick="eliminarProveedor(${index})">❌</button></td>
      </tr>
    `;
  });
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

  facturas.push({proveedor, tipo, descripcion, fecha, monto});
  actualizarFacturas();
  document.getElementById('facRucProveedor').value = '';
  document.getElementById('facTipo').value = '';
  document.getElementById('facDescripcion').value = '';
  document.getElementById('facFecha').value = '';
  document.getElementById('facMonto').value = '';
});

function actualizarFacturas() {
  listaFacturas.innerHTML = '';
  facturas.forEach((fac, index) => {
    listaFacturas.innerHTML += `
      <tr>
        <td>${fac.proveedor}</td>
        <td>${fac.tipo}</td>
        <td>${fac.descripcion}</td>
        <td>${fac.fecha}</td>
        <td>${fac.monto}</td>
        <td><button onclick="eliminarFactura(${index})">❌</button></td>
      </tr>
    `;
  });
  totalFacturas.textContent = facturas.length;
}

function eliminarFactura(index) {
  if(confirm('¿Eliminar factura?')) {
    facturas.splice(index,1);
    actualizarFacturas();
  }
}

// Buscador Facturas
document.getElementById('btnBuscarFactura').addEventListener('click', () => {
  const busqueda = document.getElementById('buscarFactura').value.toLowerCase();
  const filtrados = facturas.filter(f => 
    f.tipo.toLowerCase().includes(busqueda) || f.proveedor.toLowerCase().includes(busqueda)
  );
  listaFacturas.innerHTML = '';
  filtrados.forEach((fac,index) => {
    listaFacturas.innerHTML += `
      <tr>
        <td>${fac.proveedor}</td>
        <td>${fac.tipo}</td>
        <td>${fac.descripcion}</td>
        <td>${fac.fecha}</td>
        <td>${fac.monto}</td>
        <td><button onclick="eliminarFactura(${index})">❌</button></td>
      </tr>
    `;
  });
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

  gastos.push({nombre,tipo,monto,fecha});
  actualizarGastos();
  document.getElementById('formGasto').reset();
});

function actualizarGastos() {
  listaGastos.innerHTML = '';
  gastos.forEach((g,index) => {
    listaGastos.innerHTML += `
      <tr>
        <td>${g.nombre}</td>
        <td>${g.tipo}</td>
        <td>${g.monto}</td>
        <td>${g.fecha}</td>
        <td><button onclick="eliminarGasto(${index})">❌</button></td>
      </tr>
    `;
  });
  totalGastos.textContent = gastos.length;
}

function eliminarGasto(index) {
  if(confirm('¿Eliminar gasto?')) {
    gastos.splice(index,1);
    actualizarGastos();
  }
}

// Buscador Gastos
document.getElementById('btnBuscarGasto').addEventListener('click', () => {
  const busqueda = document.getElementById('buscarGasto').value.toLowerCase();
  const filtrados = gastos.filter(g => 
    g.nombre.toLowerCase().includes(busqueda) || g.tipo.toLowerCase().includes(busqueda)
  );
  listaGastos.innerHTML = '';
  filtrados.forEach((g,index) => {
    listaGastos.innerHTML += `
      <tr>
        <td>${g.nombre}</td>
        <td>${g.tipo}</td>
        <td>${g.monto}</td>
        <td>${g.fecha}</td>
        <td><button onclick="eliminarGasto(${index})">❌</button></td>
      </tr>
    `;
  });
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

  servicios.push({nombre,descripcion,fecha,precio});
  actualizarServicios();
  document.getElementById('servNombre').value = '';
  document.getElementById('servDescripcion').value = '';
  document.getElementById('servFecha').value = '';
  document.getElementById('servPrecio').value = '';
});

function actualizarServicios() {
  listaServicios.innerHTML = '';
  servicios.forEach((s,index) => {
    listaServicios.innerHTML += `
      <tr>
        <td>${s.nombre}</td>
        <td>${s.descripcion}</td>
        <td>${s.fecha}</td>
        <td>${s.precio}</td>
        <td><button onclick="eliminarServicio(${index})">❌</button></td>
      </tr>
    `;
  });
  totalServicios.textContent = servicios.length;
}

function eliminarServicio(index) {
  if(confirm('¿Eliminar servicio?')) {
    servicios.splice(index,1);
    actualizarServicios();
  }
}

// Buscador Servicios
document.getElementById('btnBuscarServicio').addEventListener('click', () => {
  const busqueda = document.getElementById('buscarServicio').value.toLowerCase();
  const filtrados = servicios.filter(s => 
    s.nombre.toLowerCase().includes(busqueda) || s.descripcion.toLowerCase().includes(busqueda)
  );
  listaServicios.innerHTML = '';
  filtrados.forEach((s,index) => {
    listaServicios.innerHTML += `
      <tr>
        <td>${s.nombre}</td>
        <td>${s.descripcion}</td>
        <td>${s.fecha}</td>
        <td>${s.precio}</td>
        <td><button onclick="eliminarServicio(${index})">❌</button></td>
      </tr>
    `;
  });
});






