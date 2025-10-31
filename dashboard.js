// ===================== FIREBASE CONFIG ===================== 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, query, where, updateDoc, orderBy
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  databaseURL: "https://discovery-pets-default-rtdb.firebaseio.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ===================== VERIFICAR SESIÓN =====================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Limpiar sesión y redirigir
    localStorage.removeItem('userLoggedIn');
    sessionStorage.removeItem('sessionActive');
    window.location.href = "index.html";
  }
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
const proveedorFactura = document.getElementById("proveedorFactura");
const productoFactura = document.getElementById("productoFactura");
const proveedorProducto = document.getElementById("proveedorProducto");
const montoFactura = document.getElementById("montoFactura");
const igvFactura = document.getElementById("igvFactura");
const totalFactura = document.getElementById("totalFactura");
const cantidadFactura = document.getElementById("cantidadFactura");
const idFactura = document.getElementById("idFactura");
const btnAgregarProveedor = document.getElementById("btnAgregarProveedor");
const btnAgregarProveedorFactura = document.getElementById("btnAgregarProveedorFactura");
const btnCalcularTotal = document.getElementById("btnCalcularTotal");

// ===================== MEJORAS PARA TABLAS RESPONSIVAS =====================

// Función para hacer las tablas responsivas
function hacerTablasResponsivas() {
  if (window.innerWidth <= 768) {
    document.querySelectorAll('#tablaProveedores tr, #tablaProductos tr, #tablaFacturas tr').forEach(tr => {
      const celdas = tr.querySelectorAll('td');
      if (celdas.length > 0) {
        const encabezados = tr.closest('table').querySelectorAll('th');
        celdas.forEach((td, index) => {
          if (encabezados[index]) {
            td.setAttribute('data-label', encabezados[index].textContent);
          }
        });
      }
    });
  }
}

// Ejecutar al cargar y al cambiar el tamaño de la ventana
window.addEventListener('load', hacerTablasResponsivas);
window.addEventListener('resize', hacerTablasResponsivas);

// ===================== CERRAR SESIÓN =====================
document.getElementById("btnCerrarSesion").addEventListener("click", async () => {
  await signOut(auth);
  // Limpiar todas las variables de sesión
  localStorage.removeItem('userLoggedIn');
  sessionStorage.removeItem('sessionActive');
  localStorage.removeItem('keepLogged');
  window.location.href = "index.html?logout=true";
});

// ===================== NAVEGACIÓN =====================
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("activo"));
    document.querySelectorAll(".seccion").forEach(s => s.classList.remove("activa"));
    btn.classList.add("activo");
    document.getElementById(btn.dataset.target).classList.add("activa");

    if(btn.dataset.target === "facturas") {
      buscador.style.display = "block";
      limpiarFormularioFactura();
    } else { 
      buscador.style.display = "none"; 
      buscador.value=""; 
      panelFacturas.innerHTML=""; 
    }
  });
});

// ===================== FUNCIÓN PARA REDIRIGIR A PROVEEDORES =====================
function irAProveedores() {
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("activo"));
  document.querySelectorAll(".seccion").forEach(s => s.classList.remove("activa"));
  
  document.querySelector('[data-target="proveedores"]').classList.add("activo");
  document.getElementById("proveedores").classList.add("activa");
  
  // Hacer scroll al formulario de proveedores
  document.getElementById('formProveedor').scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  });
}

// ===================== EVENT LISTENERS PARA BOTONES DE AGREGAR PROVEEDOR =====================
btnAgregarProveedor.addEventListener("click", irAProveedores);
btnAgregarProveedorFactura.addEventListener("click", irAProveedores);

// ===================== LIMPIAR FORMULARIO FACTURA =====================
function limpiarFormularioFactura() {
  formFactura.reset();
  document.getElementById("fechaFactura").valueAsDate = new Date();
  idFactura.value = "";
  igvFactura.value = "0";
  totalFactura.value = "";
  productoFactura.innerHTML = '<option value="">Primero selecciona un proveedor</option>';
}

// ===================== CALCULAR TOTAL MANUAL =====================
function calcularTotalManual() {
  const subtotal = parseFloat(montoFactura.value) || 0;
  const igv = parseFloat(igvFactura.value) || 0;
  const total = subtotal + igv;
  
  totalFactura.value = total.toFixed(2);
}

// ===================== CARGAR PRODUCTOS POR PROVEEDOR =====================
async function cargarProductosPorProveedor(proveedorNombre) {
  productoFactura.innerHTML = '<option value="">Seleccionar producto</option>';
  
  if (!proveedorNombre) return;
  
  const snap = await getDocs(query(colProductos, where("proveedor", "==", proveedorNombre)));
  snap.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.data().nombre;
    opt.textContent = `${d.data().nombre} - ${d.data().moneda === 'soles' ? 'S/. ' : '$ '}${d.data().precio}`;
    opt.dataset.precio = d.data().precio;
    productoFactura.appendChild(opt);
  });
}

// ===================== ACTUALIZAR PRECIO AL SELECCIONAR PRODUCTO =====================
productoFactura.addEventListener("change", function() {
  const selectedOption = this.options[this.selectedIndex];
  if (selectedOption.dataset.precio) {
    const cantidad = parseInt(cantidadFactura.value) || 1;
    const precio = parseFloat(selectedOption.dataset.precio);
    montoFactura.value = (cantidad * precio).toFixed(2);
    // No calcular automáticamente el IGV, dejar que el usuario lo ingrese manualmente
    calcularTotalManual();
  }
});

// ===================== ACTUALIZAR PRECIO AL CAMBIAR CANTIDAD =====================
cantidadFactura.addEventListener("input", function() {
  const selectedOption = productoFactura.options[productoFactura.selectedIndex];
  if (selectedOption.dataset.precio) {
    const cantidad = parseInt(this.value) || 1;
    const precio = parseFloat(selectedOption.dataset.precio);
    montoFactura.value = (cantidad * precio).toFixed(2);
    // No calcular automáticamente el IGV, dejar que el usuario lo ingrese manualmente
    calcularTotalManual();
  }
});

// ===================== AUXILIARES =====================
async function cargarProveedoresSelect(){
  const selects = [proveedorFactura, proveedorProducto];
  
  selects.forEach(select => {
    select.innerHTML = '<option value="">Seleccionar proveedor</option>';
  });
  
  const snap = await getDocs(colProveedores);
  snap.forEach(d => {
    selects.forEach(select => {
      const opt = document.createElement("option");
      opt.value = d.data().nombre;
      opt.textContent = d.data().nombre;
      select.appendChild(opt);
    });
  });
}

// ===================== MOSTRAR DETALLES DE PROVEEDOR CON SUS PRODUCTOS =====================
async function mostrarDetalleProveedor(nombreProveedor) {
  const snap = await getDocs(query(colProveedores, where("nombre", "==", nombreProveedor)));
  if (!snap.empty) {
    const proveedor = snap.docs[0].data();
    
    // Obtener productos de este proveedor
    const productosSnap = await getDocs(query(colProductos, where("proveedor", "==", nombreProveedor)));
    let productosHTML = '';
    
    if (productosSnap.size > 0) {
      productosHTML = '<div class="supplier-products"><h6>📦 Productos de este proveedor:</h6><div class="mt-2">';
      productosSnap.forEach(doc => {
        const producto = doc.data();
        productosHTML += `<div class="product-badge">${producto.nombre} - ${producto.moneda === 'soles' ? 'S/. ' : '$ '}${producto.precio}</div>`;
      });
      productosHTML += '</div></div>';
    } else {
      productosHTML = '<div class="text-muted mt-3">Este proveedor no tiene productos relacionados.</div>';
    }
    
    modalExtraBody.innerHTML = `
      <h4 class="text-primary mb-3">🏢 Detalles del Proveedor</h4>
      <div class="mb-2"><strong>Nombre:</strong> ${proveedor.nombre}</div>
      <div class="mb-2"><strong>Documento:</strong> ${proveedor.tipoDocumento} - ${proveedor.numeroDocumento}</div>
      <div class="mb-2"><strong>Dirección:</strong> ${proveedor.direccion || 'No especificada'}</div>
      <div class="mb-2"><strong>Teléfono:</strong> ${proveedor.telefono || 'No especificado'}</div>
      ${productosHTML}
    `;
    modalExtra.showModal();
  }
}

async function mostrarDetalleProducto(nombreProducto) {
  const snap = await getDocs(query(colProductos, where("nombre", "==", nombreProducto)));
  if (!snap.empty) {
    const producto = snap.docs[0].data();
    modalExtraBody.innerHTML = `
      <h4 class="text-success mb-3">📦 Detalles del Producto</h4>
      <div class="mb-2"><strong>Nombre:</strong> ${producto.nombre}</div>
      <div class="mb-2"><strong>Proveedor:</strong> ${producto.proveedor || 'No asignado'}</div>
      <div class="mb-2"><strong>Presentación:</strong> ${producto.cantidad} ${producto.presentacion}</div>
      <div class="mb-2"><strong>Precio:</strong> ${producto.moneda === 'soles' ? 'S/. ' : '$ '}${producto.precio}</div>
      <div class="mb-2"><strong>Descripción:</strong> ${producto.descripcion || 'No especificada'}</div>
    `;
    modalExtra.showModal();
  }
}

// Variable global para almacenar la factura actual
let facturaActual = null;

function mostrarModalFactura(f){
  facturaActual = f;
  
  modalFacturaBody.innerHTML = `
    <h3 class="text-primary font-bold text-lg mb-3">🧾 Factura ${f.idFactura}</h3>
    <div class="mb-2"><b>Fecha:</b> ${f.fecha}</div>
    <div class="mb-2"><b>Proveedor:</b> <span class="link-info proveedor-link" data-nombre="${f.proveedor}" style="color:#f97316; cursor:pointer; text-decoration:underline;">${f.proveedor}</span></div>
    <div class="mb-2"><b>Producto:</b> <span class="link-info producto-link" data-nombre="${f.producto}" style="color:#14b8a6; cursor:pointer; text-decoration:underline;">${f.producto}</span></div>
    <div class="mb-2"><b>Cantidad:</b> ${f.cantidad || 1}</div>
    <div class="mb-2"><b>Subtotal:</b> ${f.moneda==='soles' ? 'S/. ' : '$ '}${f.subtotal.toFixed(2)}</div>
    <div class="mb-2"><b>IGV:</b> ${f.moneda==='soles' ? 'S/. ' : '$ '}${f.igv.toFixed(2)}</div>
    <div class="mb-2"><b>Total:</b> ${f.moneda==='soles' ? 'S/. ' : '$ '}${f.total.toFixed(2)}</div>
    <div class="mb-2"><b>Tipo:</b> ${f.tipo}</div>
    <div class="mt-4">
      <button id="imprimirFactura" class="btn btn-primary">🖨️ Imprimir Factura</button>
    </div>
  `;
  
  // Agregar event listeners para los links de proveedor y producto
  modalFacturaBody.querySelector('.proveedor-link').addEventListener('click', () => {
    mostrarDetalleProveedor(f.proveedor);
  });
  
  modalFacturaBody.querySelector('.producto-link').addEventListener('click', () => {
    mostrarDetalleProducto(f.producto);
  });

  // Agregar event listener para el botón de imprimir
  document.getElementById('imprimirFactura').addEventListener('click', () => {
    imprimirFacturaFuncion(f);
  });
  
  modalFactura.showModal();
}

// ===================== IMPRIMIR FACTURA MEJORADA =====================
function imprimirFacturaFuncion(factura) {
  const printableInvoice = document.getElementById('printable-invoice');
  
  // Calcular precio unitario
  const precioUnitario = factura.subtotal / (factura.cantidad || 1);
  
  const invoiceHTML = `
    <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; color: #333;">
      <!-- Encabezado -->
      <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #FF6B95; padding-bottom: 15px;">
        <h1 style="color: #FF6B95; margin: 0; font-size: 32px; font-weight: bold;">DISCOVERY PETS</h1>
        <p style="margin: 5px 0; color: #666; font-size: 16px;">Tienda de Mascotas</p>
        <p style="margin: 5px 0; color: #666; font-size: 14px;">
          https://creatit3S.github.io/Programadeshboard.html
        </p>
        <p style="margin: 5px 0; color: #666; font-size: 14px;">
          ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
        <p style="margin: 5px 0; color: #666; font-size: 14px;">
          Tel: +51 123 456 789 | Email: info@discoverypets.com
        </p>
      </div>
      
      <!-- Título del dashboard -->
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #333; margin: 0; font-size: 20px;">Discovery Pets - Dashboard</h2>
        <p style="margin: 5px 0; color: #666; font-size: 14px;">
          Tel: +51 123 456 789 | Email: info@discoverypets.com
        </p>
      </div>
      
      <!-- Línea divisoria -->
      <div style="border-top: 1px solid #ddd; margin: 15px 0;"></div>
      
      <!-- Información de la factura -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #333; margin-bottom: 15px; font-size: 18px; font-weight: bold;">INFORMACIÓN DE LA FACTURA</h3>
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
          <div style="margin-bottom: 10px;">
            <strong>Número:</strong> ${factura.idFactura}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Fecha:</strong> ${factura.fecha}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Tipo:</strong> ${factura.tipo}
          </div>
        </div>
      </div>
      
      <!-- Tabla de productos -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd; font-weight: bold;">Descripción</th>
            <th style="padding: 12px; text-align: center; border: 1px solid #ddd; font-weight: bold;">Cantidad</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #ddd; font-weight: bold;">Precio Unitario</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #ddd; font-weight: bold;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd;"><strong>${factura.producto}</strong></td>
            <td style="padding: 12px; text-align: center; border: 1px solid #ddd;"><strong>${factura.cantidad || 1}</strong></td>
            <td style="padding: 12px; text-align: right; border: 1px solid #ddd;"><strong>${factura.moneda==='soles' ? 'S/. ' : '$ '}${precioUnitario.toFixed(2)}</strong></td>
            <td style="padding: 12px; text-align: right; border: 1px solid #ddd;"><strong>${factura.moneda==='soles' ? 'S/. ' : '$ '}${factura.subtotal.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
      
      <!-- Totales -->
      <div style="display: flex; justify-content: flex-end;">
        <div style="width: 300px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Subtotal:</strong></td>
              <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">${factura.moneda==='soles' ? 'S/. ' : '$ '}${factura.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>IGV:</strong></td>
              <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">${factura.moneda==='soles' ? 'S/. ' : '$ '}${factura.igv.toFixed(2)}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 12px;"><strong>TOTAL:</strong></td>
              <td style="padding: 12px; text-align: right;"><strong>${factura.moneda==='soles' ? 'S/. ' : '$ '}${factura.total.toFixed(2)}</strong></td>
            </tr>
          </table>
        </div>
      </div>
      
      <!-- Línea divisoria -->
      <div style="border-top: 1px solid #ddd; margin: 25px 0 15px;"></div>
      
      <!-- Pie de página -->
      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #666; font-size: 16px; margin-bottom: 10px;">[Gracias por su compra!]</p>
        <p style="color: #666; font-size: 14px; margin-bottom: 5px;">Discovery Pets - Cuidando a tus mejores amigos</p>
        <p style="color: #666; font-size: 12px;">Documento generado el ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
      </div>
    </div>
  `;
  
  // Limpiar contenido anterior completamente
  printableInvoice.innerHTML = '';
  
  // Agregar solo UNA factura
  printableInvoice.innerHTML = invoiceHTML;
  
  // Mostrar el elemento
  printableInvoice.style.display = 'block';
  
  // Crear una ventana de impresión limpia
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Factura ${factura.idFactura}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 15px;
          background: white;
          color: #333;
        }
        @media print {
          body { 
            margin: 0; 
            padding: 0;
          }
          @page { 
            margin: 15mm; 
            size: A4 portrait;
          }
        }
        * {
          box-sizing: border-box;
        }
      </style>
    </head>
    <body>
      ${invoiceHTML}
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() {
            window.close();
          }, 500);
        };
      <\/script>
    </body>
    </html>
  `);
  printWindow.document.close();
  
  // Ocultar el elemento después de un tiempo
  setTimeout(() => {
    printableInvoice.style.display = 'none';
  }, 1000);
}

// ===================== CERRAR MODALES =====================
cerrarModalFactura.addEventListener("click", ()=>modalFactura.close());
cerrarModalExtra.addEventListener("click", ()=>modalExtra.close());
cerrarModalEditar.addEventListener("click", ()=>modalEditar.close());

// ===================== EVENT LISTENERS =====================
montoFactura.addEventListener("input", calcularTotalManual);
igvFactura.addEventListener("input", calcularTotalManual);
btnCalcularTotal.addEventListener("click", calcularTotalManual);

proveedorFactura.addEventListener("change", function() {
  cargarProductosPorProveedor(this.value);
});

// ===================== PROVEEDORES =====================
formProveedor.addEventListener("submit", async e=>{
  e.preventDefault();
  const data = {
    tipoDocumento: document.getElementById("tipoDocumentoProveedor").value,
    numeroDocumento: document.getElementById("numeroDocumentoProveedor").value,
    nombre: document.getElementById("nombreProveedor").value.trim(),
    direccion: document.getElementById("direccionProveedor").value.trim(),
    telefono: document.getElementById("telefonoProveedor").value.trim(),
    fechaRegistro: new Date().toISOString().split('T')[0]
  };
  await addDoc(colProveedores, data);
  formProveedor.reset();
  
  // Mostrar mensaje de éxito
  alert('Proveedor registrado exitosamente');
});

// Tiempo real proveedores
onSnapshot(colProveedores, snapshot=>{
  tablaProveedores.innerHTML="";
  cargarProveedoresSelect();
  
  snapshot.forEach(docu=>{
    const d=docu.data();
    const tr=document.createElement("tr");
    tr.dataset.id=docu.id;
    
    // Obtener productos de este proveedor
    getDocs(query(colProductos, where("proveedor", "==", d.nombre))).then(productosSnap => {
      const productosCount = productosSnap.size;
      const productosHTML = productosCount > 0 ? 
        `<span class="badge bg-success">${productosCount} producto${productosCount > 1 ? 's' : ''}</span>` : 
        '<span class="badge bg-secondary">Sin productos</span>';
      
      tr.innerHTML=`
        <td>${d.tipoDocumento} - ${d.numeroDocumento}</td>
        <td>${d.nombre}</td>
        <td>${d.direccion||""}</td>
        <td>${d.telefono||""}</td>
        <td>${productosHTML}</td>
        <td>
          <button class="btn-accion editar" data-tipo="proveedor" data-id="${docu.id}">✏️</button>
          <button class="btn-accion ver link-info" data-tipo="proveedor" data-nombre="${d.nombre}">🔍</button>
          <button class="btn-accion eliminar" data-tipo="proveedor" data-id="${docu.id}">🗑️</button>
        </td>`;
      tablaProveedores.appendChild(tr);
    });
  });
  countProveedores.textContent=snapshot.size;
  
  // Hacer tablas responsivas después de cargar datos
  setTimeout(hacerTablasResponsivas, 100);
});

// ===================== PRODUCTOS =====================
formProducto.addEventListener("submit", async e=>{
  e.preventDefault();
  const data = {
    nombre: document.getElementById("nombreProducto").value.trim(),
    proveedor: document.getElementById("proveedorProducto").value,
    presentacion: document.getElementById("presentacionProducto").value,
    cantidad: parseInt(document.getElementById("cantidadPresentacion").value),
    precio: parseFloat(document.getElementById("precioProducto").value),
    moneda: document.getElementById("tipoMoneda").value,
    descripcion: document.getElementById("descripcionProducto").value.trim(),
    fechaRegistro: new Date().toISOString().split('T')[0]
  };
  await addDoc(colProductos, data);
  formProducto.reset();
});

// Tiempo real productos
onSnapshot(colProductos, snapshot=>{
  tablaProductos.innerHTML="";
  snapshot.forEach(docu=>{
    const d=docu.data();
    const tr=document.createElement("tr");
    tr.dataset.id=docu.id;
    tr.innerHTML=`
      <td>${d.nombre}</td>
      <td>${d.proveedor || 'No asignado'}</td>
      <td>${d.cantidad} ${d.presentacion}</td>
      <td>${d.moneda === 'soles' ? 'S/. ' : '$ '}${d.precio}</td>
      <td>
        <button class="btn-accion editar" data-tipo="producto" data-id="${docu.id}">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="producto" data-nombre="${d.nombre}">🔍</button>
        <button class="btn-accion eliminar" data-tipo="producto" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaProductos.appendChild(tr);
  });
  countProductos.textContent=snapshot.size;
  
  // Hacer tablas responsivas después de cargar datos
  setTimeout(hacerTablasResponsivas, 100);
});

// ===================== FACTURAS =====================
formFactura.addEventListener("submit", async e=>{
  e.preventDefault();
  
  // Verificar si ya existe una factura con el mismo ID
  const idFacturaValue = document.getElementById("idFactura").value.trim();
  if (!idFacturaValue) {
    alert("Por favor ingresa un ID de factura");
    return;
  }
  
  const facturaExistente = await getDocs(query(colFacturas, where("idFactura", "==", idFacturaValue)));
  if (!facturaExistente.empty) {
    alert("Ya existe una factura con este ID. Por favor usa un ID diferente.");
    return;
  }
  
  const subtotal = parseFloat(document.getElementById("montoFactura").value) || 0;
  const igv = parseFloat(document.getElementById("igvFactura").value) || 0;
  const total = parseFloat(document.getElementById("totalFactura").value) || 0;

  const data = {
    idFactura: idFacturaValue,
    fecha: document.getElementById("fechaFactura").value,
    proveedor: proveedorFactura.value,
    producto: productoFactura.value,
    cantidad: parseInt(document.getElementById("cantidadFactura").value) || 1,
    subtotal: subtotal,
    igv: igv,
    total: total,
    tipo: document.getElementById("tipoFactura").value,
    moneda: document.getElementById("tipoMonedaFactura").value
  };
  await addDoc(colFacturas, data);
  limpiarFormularioFactura();
});

// Tiempo real facturas
onSnapshot(colFacturas, snapshot=>{
  tablaFacturas.innerHTML="";
  snapshot.forEach(docu=>{
    const f=docu.data();
    const tr=document.createElement("tr");
    tr.dataset.id=docu.id;
    tr.innerHTML=`
      <td>${f.idFactura}</td>
      <td>${f.fecha}</td>
      <td>${f.proveedor}</td>
      <td>${f.producto}</td>
      <td>${f.cantidad || 1}</td>
      <td>${f.moneda==='soles' ? 'S/. ' : '$ '}${f.subtotal.toFixed(2)}</td>
      <td>${f.moneda==='soles' ? 'S/. ' : '$ '}${f.igv.toFixed(2)}</td>
      <td>${f.moneda==='soles' ? 'S/. ' : '$ '}${f.total.toFixed(2)}</td>
      <td>${f.tipo}</td>
      <td>
        <button class="btn-accion editar" data-tipo="factura" data-id="${docu.id}">✏️</button>
        <button class="btn-accion ver link-info" data-tipo="factura" data-id="${docu.id}">🔍</button>
        <button class="btn-accion imprimir" data-tipo="factura" data-id="${docu.id}">🖨️</button>
        <button class="btn-accion eliminar" data-tipo="factura" data-id="${docu.id}">🗑️</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  });
  countFacturas.textContent=snapshot.size;
  
  // Hacer tablas responsivas después de cargar datos
  setTimeout(hacerTablasResponsivas, 100);
});

// ===================== BUSCADOR MEJORADO =====================
buscador.style.display="none";
buscador.addEventListener("input", async ()=>{
  const texto = buscador.value.trim().toLowerCase();
  panelFacturas.innerHTML = "";
  
  if(!texto) return;
  
  // Buscar en facturas
  const facturasSnap = await getDocs(colFacturas);
  let resultadosEncontrados = false;
  
  facturasSnap.forEach(docu=>{
    const f=docu.data();
    if(f.producto.toLowerCase().includes(texto) || f.idFactura.toLowerCase().includes(texto) || f.proveedor.toLowerCase().includes(texto)){
      resultadosEncontrados = true;
      const div = document.createElement("div");
      div.className="resultado-item p-3 mb-2";
      div.innerHTML = `
        <div class="fw-bold">Factura: ${f.idFactura}</div>
        <div class="small">Producto: ${f.producto}</div>
        <div class="small">Proveedor: ${f.proveedor}</div>
        <div class="small text-muted">Fecha: ${f.fecha} | Total: ${f.moneda==='soles' ? 'S/. ' : '$ '}${f.total.toFixed(2)}</div>
      `;
      div.addEventListener("click", ()=>mostrarModalFactura(f));
      panelFacturas.appendChild(div);
    }
  });
  
  // Buscar en productos
  const productosSnap = await getDocs(colProductos);
  productosSnap.forEach(docu=>{
    const p=docu.data();
    if(p.nombre.toLowerCase().includes(texto) || p.proveedor.toLowerCase().includes(texto)){
      resultadosEncontrados = true;
      const div = document.createElement("div");
      div.className="resultado-item p-3 mb-2";
      div.style.borderLeftColor = '#4FD1C5';
      div.innerHTML = `
        <div class="fw-bold">Producto: ${p.nombre}</div>
        <div class="small">Proveedor: ${p.proveedor || 'No asignado'}</div>
        <div class="small">Presentación: ${p.cantidad} ${p.presentacion}</div>
        <div class="small text-muted">Precio: ${p.moneda==='soles' ? 'S/. ' : '$ '}${p.precio}</div>
      `;
      div.addEventListener("click", ()=>mostrarDetalleProducto(p.nombre));
      panelFacturas.appendChild(div);
    }
  });
  
  // Buscar en proveedores
  const proveedoresSnap = await getDocs(colProveedores);
  proveedoresSnap.forEach(docu=>{
    const p=docu.data();
    if(p.nombre.toLowerCase().includes(texto) || p.numeroDocumento.toLowerCase().includes(texto)){
      resultadosEncontrados = true;
      const div = document.createElement("div");
      div.className="resultado-item p-3 mb-2";
      div.style.borderLeftColor = '#FF6B95';
      div.innerHTML = `
        <div class="fw-bold">Proveedor: ${p.nombre}</div>
        <div class="small">Documento: ${p.tipoDocumento} - ${p.numeroDocumento}</div>
        <div class="small">Teléfono: ${p.telefono || 'No especificado'}</div>
        <div class="small text-muted">Dirección: ${p.direccion || 'No especificada'}</div>
      `;
      div.addEventListener("click", ()=>mostrarDetalleProveedor(p.nombre));
      panelFacturas.appendChild(div);
    }
  });
  
  if (!resultadosEncontrados) {
    panelFacturas.innerHTML = `
      <div class="alert alert-info text-center">
        No se encontraron resultados para "${texto}"
      </div>
    `;
  }
});

// ===================== CLICK GLOBAL MEJORADO =====================
document.addEventListener("click", async e=>{
  // --------- EDITAR ---------
  if(e.target.classList.contains("editar")){
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    let colNombre = tipo==="proveedor"?"proveedores":tipo==="producto"?"productos":"facturas";
    const snap = await getDocs(query(collection(db, colNombre), where("__name__","==",id)));
    if(!snap.empty){
      const d = snap.docs[0].data();
      modalEditarBody.innerHTML = `
        <h5 class="mb-3">Editar ${tipo}</h5>
        ${tipo==="proveedor"?`
          <div class="mb-2">
            <label class="form-label">Tipo Documento</label>
            <input id="editTipoDoc" class="form-control" value="${d.tipoDocumento||''}">
          </div>
          <div class="mb-2">
            <label class="form-label">Número Documento</label>
            <input id="editNumDoc" class="form-control" value="${d.numeroDocumento||''}">
          </div>
          <div class="mb-2">
            <label class="form-label">Nombre</label>
            <input id="editNombre" class="form-control" value="${d.nombre||''}">
          </div>
          <div class="mb-2">
            <label class="form-label">Dirección</label>
            <input id="editDir" class="form-control" value="${d.direccion||''}">
          </div>
          <div class="mb-2">
            <label class="form-label">Teléfono</label>
            <input id="editTel" class="form-control" value="${d.telefono||''}">
          </div>`:
        tipo==="producto"?`
          <div class="mb-2">
            <label class="form-label">Nombre</label>
            <input id="editNombre" class="form-control" value="${d.nombre||''}">
          </div>
          <div class="mb-2">
            <label class="form-label">Proveedor</label>
            <select id="editProveedor" class="form-select">
              ${await cargarOpcionesProveedores(d.proveedor)}
            </select>
          </div>
          <div class="mb-2">
            <label class="form-label">Presentación</label>
            <select id="editPresent" class="form-select">
              <option value="Unidad" ${d.presentacion==='Unidad'?'selected':''}>Unidad</option>
              <option value="Docena" ${d.presentacion==='Docena'?'selected':''}>Docena</option>
              <option value="Ciento" ${d.presentacion==='Ciento'?'selected':''}>Ciento</option>
              <option value="Millar" ${d.presentacion==='Millar'?'selected':''}>Millar</option>
              <option value="Metro" ${d.presentacion==='Metro'?'selected':''}>Metro</option>
            </select>
          </div>
          <div class="mb-2">
            <label class="form-label">Cantidad</label>
            <input id="editCantidad" type="number" class="form-control" value="${d.cantidad||0}">
          </div>
          <div class="mb-2">
            <label class="form-label">Precio</label>
            <input id="editPrecio" type="number" step="0.01" class="form-control" value="${d.precio||0}">
          </div>
          <div class="mb-2">
            <label class="form-label">Moneda</label>
            <select id="editMoneda" class="form-select">
              <option value="soles" ${d.moneda==='soles'?'selected':''}>Soles</option>
              <option value="dolares" ${d.moneda==='dolares'?'selected':''}>Dólares</option>
            </select>
          </div>
          <div class="mb-2">
            <label class="form-label">Descripción</label>
            <textarea id="editDesc" class="form-control">${d.descripcion||''}</textarea>
          </div>`:
        tipo==="factura"?`
          <div class="mb-2">
            <label class="form-label">ID</label>
            <input id="editId" class="form-control" value="${d.idFactura||''}">
          </div>
          <div class="mb-2">
            <label class="form-label">Fecha</label>
            <input id="editFecha" type="date" class="form-control" value="${d.fecha||''}">
          </div>
          <div class="mb-2">
            <label class="form-label">Proveedor</label>
            <select id="editProv" class="form-select">
              ${await cargarOpcionesProveedores(d.proveedor)}
            </select>
          </div>
          <div class="mb-2">
            <label class="form-label">Producto</label>
            <select id="editProd" class="form-select">
              ${await cargarOpcionesProductos(d.producto, d.proveedor)}
            </select>
          </div>
          <div class="mb-2">
            <label class="form-label">Cantidad</label>
            <input id="editCantidad" type="number" class="form-control" value="${d.cantidad||1}">
          </div>
          <div class="mb-2">
            <label class="form-label">Subtotal</label>
            <input id="editSub" type="number" step="0.01" class="form-control" value="${d.subtotal||0}">
          </div>
          <div class="mb-2">
            <label class="form-label">IGV</label>
            <input id="editIGV" type="number" step="0.01" class="form-control" value="${d.igv||0}">
          </div>
          <div class="mb-2">
            <label class="form-label">Total</label>
            <input id="editTotal" type="number" step="0.01" class="form-control" value="${d.total||0}">
          </div>
          <div class="mb-2">
            <label class="form-label">Tipo</label>
            <select id="editTipo" class="form-select">
              <option value="Factura" ${d.tipo==='Factura'?'selected':''}>Factura</option>
              <option value="Boleta" ${d.tipo==='Boleta'?'selected':''}>Boleta</option>
              <option value="Ticket" ${d.tipo==='Ticket'?'selected':''}>Ticket</option>
              <option value="Nota de Crédito" ${d.tipo==='Nota de Crédito'?'selected':''}>Nota de Crédito</option>
              <option value="Nota de Débito" ${d.tipo==='Nota de Débito'?'selected':''}>Nota de Débito</option>
            </select>
          </div>
          <div class="mb-2">
            <label class="form-label">Moneda</label>
            <select id="editMoneda" class="form-select">
              <option value="soles" ${d.moneda==='soles'?'selected':''}>Soles</option>
              <option value="dolares" ${d.moneda==='dolares'?'selected':''}>Dólares</option>
            </select>
          </div>
          <div class="mb-2">
            <button type="button" id="btnCalcularEdicion" class="btn btn-outline-secondary btn-sm">Calcular Total</button>
          </div>
        ` : ''}
        <div class="d-flex gap-2 mt-3">
          <button id="guardarEdicion" class="btn btn-primary flex-fill">Guardar cambios</button>
          <button class="btn btn-secondary" onclick="document.getElementById('modalEditar').close()">Cancelar</button>
        </div>
      `;
      modalEditar.showModal();

      // Agregar evento para calcular total en edición
      if (tipo === "factura") {
        document.getElementById("btnCalcularEdicion").addEventListener("click", () => {
          const subtotal = parseFloat(document.getElementById("editSub").value) || 0;
          const igv = parseFloat(document.getElementById("editIGV").value) || 0;
          const total = subtotal + igv;
          document.getElementById("editTotal").value = total.toFixed(2);
        });
      }

      // Guardar cambios
      document.getElementById("guardarEdicion").addEventListener("click", async () => {
        const dataActualizada = {};
        if(tipo==="proveedor"){
          dataActualizada.tipoDocumento = document.getElementById("editTipoDoc").value;
          dataActualizada.numeroDocumento = document.getElementById("editNumDoc").value;
          dataActualizada.nombre = document.getElementById("editNombre").value;
          dataActualizada.direccion = document.getElementById("editDir").value;
          dataActualizada.telefono = document.getElementById("editTel").value;
        } else if(tipo==="producto"){
          dataActualizada.nombre = document.getElementById("editNombre").value;
          dataActualizada.proveedor = document.getElementById("editProveedor").value;
          dataActualizada.presentacion = document.getElementById("editPresent").value;
          dataActualizada.cantidad = parseInt(document.getElementById("editCantidad").value);
          dataActualizada.precio = parseFloat(document.getElementById("editPrecio").value);
          dataActualizada.moneda = document.getElementById("editMoneda").value;
          dataActualizada.descripcion = document.getElementById("editDesc").value;
        } else if(tipo==="factura"){
          dataActualizada.idFactura = document.getElementById("editId").value;
          dataActualizada.fecha = document.getElementById("editFecha").value;
          dataActualizada.proveedor = document.getElementById("editProv").value;
          dataActualizada.producto = document.getElementById("editProd").value;
          dataActualizada.cantidad = parseInt(document.getElementById("editCantidad").value);
          dataActualizada.subtotal = parseFloat(document.getElementById("editSub").value);
          dataActualizada.igv = parseFloat(document.getElementById("editIGV").value);
          dataActualizada.total = parseFloat(document.getElementById("editTotal").value);
          dataActualizada.tipo = document.getElementById("editTipo").value;
          dataActualizada.moneda = document.getElementById("editMoneda").value;
        }
        const docRef = doc(db, colNombre, id);
        await updateDoc(docRef, dataActualizada);
        modalEditar.close();
      });
    }
  }

  // --------- ELIMINAR ---------
  if(e.target.classList.contains("eliminar")){
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;
    const colNombre = tipo==="proveedor"?"proveedores":tipo==="producto"?"productos":"facturas";
    if(confirm(`¿Desea eliminar este ${tipo}?`)){
      await deleteDoc(doc(db, colNombre, id));
    }
  }

  // --------- VER DETALLE ---------
  if(e.target.classList.contains("ver")){
    const tipo = e.target.dataset.tipo;
    if(tipo==="factura"){
      const id = e.target.dataset.id;
      const snap = await getDocs(query(colFacturas, where("__name__","==",id)));
      if(!snap.empty){
        mostrarModalFactura(snap.docs[0].data());
      }
    } else if (tipo === "proveedor") {
      const nombre = e.target.dataset.nombre;
      mostrarDetalleProveedor(nombre);
    } else if (tipo === "producto") {
      const nombre = e.target.dataset.nombre;
      mostrarDetalleProducto(nombre);
    }
  }

  // --------- IMPRIMIR FACTURA ---------
  if(e.target.classList.contains("imprimir")){
    const id = e.target.dataset.id;
    const snap = await getDocs(query(colFacturas, where("__name__","==",id)));
    if(!snap.empty){
      const factura = snap.docs[0].data();
      imprimirFacturaFuncion(factura);
    }
  }
});

// ===================== FUNCIONES AUXILIARES =====================
async function cargarOpcionesProveedores(seleccionado) {
  let opciones = '<option value="">Seleccionar proveedor</option>';
  const snap = await getDocs(colProveedores);
  snap.forEach(d => {
    const selected = d.data().nombre === seleccionado ? 'selected' : '';
    opciones += `<option value="${d.data().nombre}" ${selected}>${d.data().nombre}</option>`;
  });
  return opciones;
}

async function cargarOpcionesProductos(seleccionado, proveedor) {
  let opciones = '<option value="">Seleccionar producto</option>';
  const snap = await getDocs(query(colProductos, where("proveedor", "==", proveedor)));
  snap.forEach(d => {
    const selected = d.data().nombre === seleccionado ? 'selected' : '';
    opciones += `<option value="${d.data().nombre}" ${selected}>${d.data().nombre}</option>`;
  });
  return opciones;
}

// ===================== INICIALIZACIÓN =====================
// Establecer fecha actual por defecto
document.getElementById("fechaFactura").valueAsDate = new Date();

// Cargar selects
cargarProveedoresSelect();
