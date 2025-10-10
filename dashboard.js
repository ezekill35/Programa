import { db } from './firebase.js';
import { collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const secciones = document.querySelectorAll(".seccion");
  const menuBtns = document.querySelectorAll(".menu-btn");
  const buscador = document.getElementById("buscadorGlobal");
  const logoutBtn = document.getElementById("logoutBtn");

  // Modal
  const modalBG = document.getElementById("modalBG");
  const modalTitle = document.getElementById("modalTitle");
  const modalContent = document.getElementById("modalContent");
  const closeModal = document.getElementById("closeModal");
  closeModal.addEventListener("click", () => modalBG.style.display = "none");

  // Navegación
  menuBtns.forEach(btn => btn.addEventListener("click", () => {
    secciones.forEach(sec => sec.style.display = "none");
    document.getElementById(btn.dataset.target).style.display = "block";
    menuBtns.forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
  }));
  document.getElementById("facturas").style.display = "block";

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("usuarioActivo");
    window.location.href = "index.html";
  });

  // Colecciones Firestore
  const proveedoresCol = collection(db, "proveedores");
  const productosCol = collection(db, "productos");
  const facturasCol = collection(db, "facturas");

  const proveedorForm = document.getElementById("proveedorForm");
  const productoForm = document.getElementById("productoForm");
  const facturaForm = document.getElementById("facturaForm");

  const tablaProveedores = document.getElementById("tablaProveedores");
  const tablaProductos = document.getElementById("tablaProductos");
  const tablaFacturas = document.getElementById("tablaFacturas");
  const proveedorFacturaSelect = document.getElementById("proveedorFactura");

  // ================== CRUD PROVEEDORES ==================
  proveedorForm.addEventListener("submit", async e => {
    e.preventDefault();
    const ruc = document.getElementById("rucProveedor").value;
    const nombre = document.getElementById("nombreProveedor").value;
    const telefono = document.getElementById("telefonoProveedor").value;
    await addDoc(proveedoresCol,{ruc,nombre,telefono});
    proveedorForm.reset();
  });

  onSnapshot(proveedoresCol, snapshot => {
    tablaProveedores.innerHTML = "";
    proveedorFacturaSelect.innerHTML = `<option value="">Seleccione proveedor</option>`;
    snapshot.forEach(doc=>{
      const data = doc.data();
      // Tabla Proveedores
      const fila = document.createElement("tr");
      fila.innerHTML = `<td>${data.ruc}</td><td>${data.nombre}</td><td>${data.telefono}</td>`;
      fila.addEventListener("click", ()=>{
        modalTitle.textContent = "Proveedor: " + data.nombre;
        modalContent.innerHTML = `<p>RUC: ${data.ruc}</p><p>Teléfono: ${data.telefono}</p><p>Nombre: ${data.nombre}</p>`;
        modalBG.style.display = "flex";
      });
      tablaProveedores.appendChild(fila);
      // Select Proveedor
      const option = document.createElement("option");
      option.value = data.nombre;
      option.textContent = data.nombre;
      proveedorFacturaSelect.appendChild(option);
    });
  });

  // ================== CRUD PRODUCTOS ==================
  productoForm.addEventListener("submit", async e=>{
    e.preventDefault();
    const nombre = document.getElementById("nombreProducto").value;
    const descripcion = document.getElementById("descripcionProducto").value;
    const cantidad = document.getElementById("cantidadProducto").value;
    const unidad = document.getElementById("unidadProducto").value;
    const valorUnitario = document.getElementById("valorUnitarioProducto").value;
    await addDoc(productosCol,{nombre,descripcion,cantidad,unidad,valorUnitario});
    productoForm.reset();
  });

  onSnapshot(productosCol, snapshot=>{
    tablaProductos.innerHTML="";
    snapshot.forEach(doc=>{
      const data = doc.data();
      const fila = document.createElement("tr");
      fila.innerHTML = `<td>${data.nombre}</td><td>${data.descripcion}</td><td>${data.cantidad}</td><td>${data.unidad}</td><td>${data.valorUnitario}</td>`;
      fila.addEventListener("click", ()=>{
        modalTitle.textContent = "Producto: " + data.nombre;
        modalContent.innerHTML = `<p>Nombre: ${data.nombre}</p><p>Descripción: ${data.descripcion}</p><p>Cantidad: ${data.cantidad}</p><p>Unidad: ${data.unidad}</p><p>Valor Unitario: ${data.valorUnitario}</p>`;
        modalBG.style.display = "flex";
      });
      tablaProductos.appendChild(fila);
    });
  });

  // ================== CRUD FACTURAS ==================
  facturaForm.addEventListener("submit", async e=>{
    e.preventDefault();
    const numero = document.getElementById("numeroFactura").value;
    const proveedor = document.getElementById("proveedorFactura").value;
    const producto = document.getElementById("productoFactura").value;
    const monto = document.getElementById("montoFactura").value;
    const tipo = document.getElementById("tipoFactura").value;
    const moneda = document.getElementById("monedaFactura").value;
    await addDoc(facturasCol,{numero,proveedor,producto,monto,moneda,tipo});
    facturaForm.reset();
  });

  onSnapshot(facturasCol, snapshot=>{
    tablaFacturas.innerHTML="";
    snapshot.forEach(doc=>{
      const data = doc.data();
      const fila = document.createElement("tr");
      fila.innerHTML = `<td>${data.numero}</td><td>${data.proveedor}</td><td>${data.producto}</td><td>${data.moneda} ${data.monto}</td><td>${data.tipo}</td>`;
      fila.addEventListener("click", ()=>{
        modalTitle.textContent = "Factura N° " + data.numero;
        modalContent.innerHTML = `<p>Proveedor: ${data.proveedor}</p><p>Producto: ${data.producto}</p><p>Monto: ${data.moneda} ${data.monto}</p><p>Tipo: ${data.tipo}</p>`;
        modalBG.style.display = "flex";
      });
      tablaFacturas.appendChild(fila);
    });
  });

  // ================== BUSCADOR PRODUCTO ==================
  buscador.addEventListener("input", ()=>{
    const texto = buscador.value.toLowerCase();
    document.querySelectorAll("#tablaFacturas tr").forEach(row=>{
      const producto = row.cells[2].innerText.toLowerCase();
      row.style.display = producto.includes(texto) ? "" : "none";
    });
  });

});




