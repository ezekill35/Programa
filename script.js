// ----------------------
// Login y Registro
// ----------------------
function showRegister(){
  document.getElementById("card-inner").classList.add("is-flipped");
}
function showLogin(){
  document.getElementById("card-inner").classList.remove("is-flipped");
}

function login(){
  const email = document.getElementById("login-email").value;
  const pass = document.getElementById("login-password").value;
  auth.signInWithEmailAndPassword(email, pass)
    .then(() => { window.location.href="dashboard.html"; })
    .catch(e => document.getElementById("login-error").innerText=e.message);
}

function register(){
  const email = document.getElementById("reg-email").value;
  const pass = document.getElementById("reg-password").value;
  auth.createUserWithEmailAndPassword(email, pass)
    .then(() => {
      document.getElementById("register-success").innerText="¡Registro exitoso!";
      document.getElementById("register-error").innerText="";
    })
    .catch(e => document.getElementById("register-error").innerText=e.message);
}

// ----------------------
// Dashboard
// ----------------------
function showSection(section){
  document.querySelectorAll(".content-section").forEach(s => s.classList.remove("active"));
  document.getElementById(section+"-section").classList.add("active");
}

function logout(){
  auth.signOut().then(()=> window.location.href="index.html");
}

// Productos
function agregarProducto(){
  const sku=document.getElementById("producto-sku").value;
  const nombre=document.getElementById("producto-nombre").value;
  const marca=document.getElementById("producto-marca").value;
  const precio=parseFloat(document.getElementById("producto-precio").value);
  const stock=parseInt(document.getElementById("producto-stock").value);
  const categoria=document.getElementById("producto-categoria").value;

  db.collection("productos").add({sku,nombre,marca,precio,stock,categoria})
    .then(()=>{ document.getElementById("producto-form").reset(); mostrarProductos(); });
}

function mostrarProductos(){
  const lista=document.getElementById("lista-productos");
  lista.innerHTML="";
  db.collection("productos").get().then(snapshot=>{
    snapshot.forEach(doc=>{
      const p=doc.data();
      lista.innerHTML+=`<div class="card-item"><b>${p.nombre}</b> - ${p.categoria} - S/ ${p.precio} - Stock: ${p.stock}</div>`;
    });
  });
}

// Proveedores
function agregarProveedor(){
  const nombre=document.getElementById("proveedor-nombre").value;
  const contacto=document.getElementById("proveedor-contacto").value;
  const telefono=document.getElementById("proveedor-telefono").value;
  const fax=document.getElementById("proveedor-fax").value;
  const direccion=document.getElementById("proveedor-direccion").value;
  const productos=document.getElementById("proveedor-productos").value;

  db.collection("proveedores").add({nombre,contacto,telefono,fax,direccion,productos})
    .then(()=>{ document.getElementById("proveedor-form").reset(); mostrarProveedores(); cargarSelectProveedores(); });
}

function mostrarProveedores(){
  const lista=document.getElementById("lista-proveedores");
  lista.innerHTML="";
  db.collection("proveedores").get().then(snapshot=>{
    snapshot.forEach(doc=>{
      const p=doc.data();
      lista.innerHTML+=`<div class="card-item"><b>${p.nombre}</b> - Contacto: ${p.contacto} - Tel: ${p.telefono}</div>`;
    });
  });
}

function cargarSelectProveedores(){
  const select=document.getElementById("factura-proveedor");
  select.innerHTML=`<option value="">Seleccione un proveedor</option>`;
  db.collection("proveedores").get().then(snapshot=>{
    snapshot.forEach(doc=>{
      const p=doc.data();
      select.innerHTML+=`<option value="${p.nombre}">${p.nombre}</option>`;
    });
  });
}

// Facturas / Compras
function agregarFactura(){
  const ruc=document.getElementById("factura-ruc").value;
  const numero=document.getElementById("factura-numero").value;
  const proveedor=document.getElementById("factura-proveedor").value;
  const producto=document.getElementById("factura-producto").value;
  const cantidad=parseInt(document.getElementById("factura-cantidad").value);
  const precio=parseFloat(document.getElementById("factura-precio").value);
  const fecha=document.getElementById("factura-fecha").value;

  db.collection("facturas").add({ruc,numero,proveedor,producto,cantidad,precio,fecha})
    .then(()=>{ document.getElementById("factura-form").reset(); mostrarFacturas(); });
}

function mostrarFacturas(){
  const lista=document.getElementById("lista-facturas");
  lista.innerHTML="";
  db.collection("facturas").get().then(snapshot=>{
    snapshot.forEach(doc=>{
      const f=doc.data();
      lista.innerHTML+=`<div class="card-item"><b>Proveedor:</b> ${f.proveedor} - <b>Producto:</b> ${f.producto} - S/ ${f.precio} x ${f.cantidad} - <b>Fecha:</b> ${f.fecha}</div>`;
    });
  });
}

// Ventas
function agregarVenta(){ /* Similar a facturas */ }
function mostrarVentas(){ /* Similar a facturas */ }

// Gastos
function agregarGasto(){ /* Similar a facturas*




















