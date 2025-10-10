// ===============================
// DASHBOARD.JS - DISCOVERY PETS
// ===============================
import { auth } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // ELEMENTOS GLOBALES
  // ===============================
  const secciones = document.querySelectorAll(".seccion");
  const menuBtns = document.querySelectorAll(".menu-btn");
  const buscador = document.getElementById("buscadorGlobal");
  const logoutBtn = document.getElementById("logoutBtn");

  const facturaForm = document.getElementById("facturaForm");
  const facturaTabla = document.getElementById("tablaFacturas");

  const proveedorForm = document.getElementById("proveedorForm");
  const proveedoresList = [];

  const productoForm = document.getElementById("productoForm");
  const productosList = [];

  // ===============================
  // SESIÓN SEGURA
  // ===============================
  auth.onAuthStateChanged(user => {
    if (!user) {
      // Usuario no autenticado → login
      window.location.replace("index.html");
    }
  });

  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      // No se necesita redirect manual, onAuthStateChanged se encarga
    } catch (e) {
      alert("Error cerrando sesión: " + e.message);
    }
  });

  // ===============================
  // EVITAR RECARGA DE FORMULARIOS
  // ===============================
  document.querySelectorAll("form").forEach(form => {
    form.addEventListener("submit", e => e.preventDefault());
  });

  // ===============================
  // NAVEGACIÓN ENTRE SECCIONES
  // ===============================
  menuBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      secciones.forEach(sec => sec.style.display = "none");
      document.getElementById(target).style.display = "block";

      menuBtns.forEach(b => b.classList.remove("activo"));
      btn.classList.add("activo");
    });
  });
  document.getElementById("facturas").style.display = "block";

  // ===============================
  // CRUD PROVEEDORES
  // ===============================
  proveedorForm.addEventListener("submit", () => {
    const ruc = document.getElementById("rucProveedor").value;
    const nombre = document.getElementById("nombreProveedor").value;
    const telefono = document.getElementById("telefonoProveedor").value;

    const proveedor = { ruc, nombre, telefono };
    proveedoresList.push(proveedor);

    proveedorForm.reset();
    alert("Proveedor registrado correctamente");
  });

  // ===============================
  // CRUD PRODUCTOS
  // ===============================
  productoForm.addEventListener("submit", () => {
    const nombre = document.getElementById("nombreProducto").value;
    const descripcion = document.getElementById("descripcionProducto").value;
    const cantidad = document.getElementById("cantidadProducto").value;
    const unidad = document.getElementById("unidadProducto").value;
    const valorUnitario = document.getElementById("valorUnitarioProducto").value;

    const producto = { nombre, descripcion, cantidad, unidad, valorUnitario };
    productosList.push(producto);

    productoForm.reset();
    alert("Producto registrado correctamente");
  });

  // ===============================
  // CRUD FACTURAS
  // ===============================
  facturaForm.addEventListener("submit", () => {
    const numero = document.getElementById("numeroFactura").value;
    const proveedor = document.getElementById("proveedorFactura").value;
    const producto = document.getElementById("productoFactura").value;
    const monto = document.getElementById("montoFactura").value;
    const tipo = document.getElementById("tipoFactura").value;
    const moneda = document.getElementById("monedaFactura").value;

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td class="click-detalle" data-tipo="numero">${numero}</td>
      <td class="click-detalle" data-tipo="proveedor">${proveedor}</td>
      <td class="click-detalle" data-tipo="producto">${producto}</td>
      <td>${moneda} ${monto}</td>
      <td>${tipo}</td>
      <td>
        <button class="editar">✏️</button>
        <button class="eliminar">🗑️</button>
      </td>
    `;

    facturaTabla.appendChild(fila);
    facturaForm.reset();

    // ===============================
    // ELIMINAR FACTURA
    // ===============================
    fila.querySelector(".eliminar").addEventListener("click", () => fila.remove());

    // ===============================
    // EDITAR FACTURA
    // ===============================
    fila.querySelector(".editar").addEventListener("click", () => {
      document.getElementById("numeroFactura").value = numero;
      document.getElementById("proveedorFactura").value = proveedor;
      document.getElementById("productoFactura").value = producto;
      document.getElementById("montoFactura").value = monto;
      document.getElementById("tipoFactura").value = tipo;
      document.getElementById("monedaFactura").value = moneda;
      fila.remove();
    });

    // ===============================
    // MODAL DETALLE
    // ===============================
    fila.querySelectorAll(".click-detalle").forEach(td => {
      td.addEventListener("click", () => {
        const tipo = td.dataset.tipo;
        let contenido = "";
        if (tipo === "proveedor") {
          const prov = proveedoresList.find(p => p.nombre === td.textContent);
          if (prov) contenido = `Nombre: ${prov.nombre}\nRUC: ${prov.ruc}\nTel: ${prov.telefono}`;
          else contenido = "Proveedor no encontrado";
        }
        if (tipo === "producto") {
          const prod = productosList.find(p => p.nombre === td.textContent);
          if (prod) contenido = `Nombre: ${prod.nombre}\nDescripción: ${prod.descripcion}\nCantidad: ${prod.cantidad}\nUnidad: ${prod.unidad}\nValor unitario: ${prod.valorUnitario}`;
          else contenido = "Producto no encontrado";
        }
        if (tipo === "numero") contenido = `Número de factura: ${td.textContent}`;
        alert(contenido);
      });
    });
  });

  // ===============================
  // BUSCADOR GLOBAL
  // ===============================
  buscador.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase();
    facturaTabla.querySelectorAll("tr").forEach(row => {
      const filaTexto = row.innerText.toLowerCase();
      row.style.display = filaTexto.includes(texto) ? "" : "none";
    });
  });

});





