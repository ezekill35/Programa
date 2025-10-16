// ------------------ CONFIGURACIÓN FIREBASE ------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase, ref, push, onValue, remove, update
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Tu configuración Firebase (usa la tuya)
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  databaseURL: "https://discovery-pets-default-rtdb.firebaseio.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:a7c7e7d6f21f0a29c7e3a1"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ------------------ NAVEGACIÓN ENTRE SECCIONES ------------------
const menuBtns = document.querySelectorAll('.menu-btn');
const secciones = document.querySelectorAll('.seccion');

menuBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    menuBtns.forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');
    const target = btn.dataset.target;
    secciones.forEach(sec => sec.classList.remove('activa'));
    document.getElementById(target).classList.add('activa');
  });
});

// ------------------ REFERENCIAS DOM ------------------
const proveedorSelectFactura = document.getElementById("proveedorFactura");
const productoSelectFactura = document.getElementById("productoFactura");

// Listas dinámicas de selects
function cargarProveedoresEnSelect() {
  const provRef = ref(db, "proveedores");
  onValue(provRef, snapshot => {
    proveedorSelectFactura.innerHTML = '<option value="">Seleccione proveedor</option>';
    snapshot.forEach(child => {
      const data = child.val();
      const opt = document.createElement("option");
      opt.value = data.nombre;
      opt.textContent = data.nombre;
      proveedorSelectFactura.appendChild(opt);
    });
  });
}

function cargarProductosEnSelect() {
  const prodRef = ref(db, "productos");
  onValue(prodRef, snapshot => {
    productoSelectFactura.innerHTML = '<option value="">Seleccione producto</option>';
    snapshot.forEach(child => {
      const data = child.val();
      const opt = document.createElement("option");
      opt.value = data.nombre;
      opt.textContent = data.nombre;
      productoSelectFactura.appendChild(opt);
    });
  });
}

// Ejecutar carga inicial de selects
cargarProveedoresEnSelect();
cargarProductosEnSelect();


console.log("dashboard.js (particionado) cargado — listeners en tiempo real activos.");
// ------------------ CRUD PROVEEDORES ------------------
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");

let proveedorEditId = null;

// Añadir o actualizar proveedor
proveedorForm.addEventListener("submit", e => {
  e.preventDefault();

  const ruc = document.getElementById("rucProveedor").value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();
  const telefono = document.getElementById("telefonoProveedor").value.trim();

  if (!ruc || !nombre) {
    alert("RUC y Nombre son obligatorios");
    return;
  }

  const proveedorData = { ruc, nombre, direccion, telefono };

  if (proveedorEditId) {
    // Actualizar proveedor existente
    update(ref(db, "proveedores/" + proveedorEditId), proveedorData);
    proveedorEditId = null;
  } else {
    // Nuevo proveedor
    push(ref(db, "proveedores"), proveedorData);
  }

  proveedorForm.reset();
});

// Cargar proveedores en tiempo real
onValue(ref(db, "proveedores"), snapshot => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach(child => {
    const data = child.val();
    const id = child.key;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.ruc}</td>
      <td>${data.nombre}</td>
      <td>${data.direccion || "-"}</td>
      <td>${data.telefono || "-"}</td>
      <td>
        <button class="btn btn-edit" data-id="${id}">Editar</button>
        <button class="btn btn-delete" data-id="${id}">Eliminar</button>
      </td>
    `;
    tablaProveedores.appendChild(tr);
  });

  // Recargar los selects dinámicos
  cargarProveedoresEnSelect();
});

// Detectar clic en botones de acción
tablaProveedores.addEventListener("click", e => {
  const id = e.target.dataset.id;

  if (e.target.classList.contains("btn-delete")) {
    if (confirm("¿Eliminar este proveedor?")) {
      remove(ref(db, "proveedores/" + id));
    }
  }

  if (e.target.classList.contains("btn-edit")) {
    const provRef = ref(db, "proveedores/" + id);
    onValue(provRef, snap => {
      const data = snap.val();
      if (data) {
        document.getElementById("rucProveedor").value = data.ruc;
        document.getElementById("nombreProveedor").value = data.nombre;
        document.getElementById("direccionProveedor").value = data.direccion;
        document.getElementById("telefonoProveedor").value = data.telefono;
        proveedorEditId = id;
      }
    }, { onlyOnce: true });
  }
});
// ------------------ CRUD PRODUCTOS ------------------
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");

const productosRef = ref(db, "productos");

productoForm.addEventListener("submit", e => {
  e.preventDefault();

  const nombre = document.getElementById("nombreProducto").value.trim();
  const precio = document.getElementById("precioProducto").value.trim();
  const cantidad = document.getElementById("cantidadProducto").value.trim();
  const descripcion = document.getElementById("descripcionProducto").value.trim();

  if (!nombre) {
    alert("El nombre del producto es obligatorio");
    return;
  }

  push(productosRef, { nombre, precio, cantidad, descripcion })
    .then(() => productoForm.reset())
    .catch(err => console.error("Error al guardar producto:", err));
});

// Mostrar productos en tiempo real
onValue(productosRef, snapshot => {
  tablaProductos.innerHTML = "";
  snapshot.forEach(child => {
    const id = child.key;
    const data = child.val();

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.precio || '-'}</td>
      <td>${data.cantidad || '-'}</td>
      <td>${data.descripcion || '-'}</td>
      <td>
        <button class="btn btn-edit" data-id="${id}">Editar</button>
        <button class="btn btn-delete" data-id="${id}">Eliminar</button>
      </td>
    `;
    tablaProductos.appendChild(tr);
  });
});

// Editar producto
tablaProductos.addEventListener("click", e => {
  if (e.target.classList.contains("btn-edit")) {
    const id = e.target.dataset.id;
    const row = e.target.closest("tr");
    const celdas = row.querySelectorAll("td");

    const nombre = prompt("Nuevo nombre:", celdas[0].textContent);
    const precio = prompt("Nuevo precio:", celdas[1].textContent);
    const cantidad = prompt("Nueva cantidad:", celdas[2].textContent);
    const descripcion = prompt("Nueva descripción:", celdas[3].textContent);

    if (nombre) {
      update(ref(db, "productos/" + id), { nombre, precio, cantidad, descripcion });
    }
  }

  if (e.target.classList.contains("btn-delete")) {
    const id = e.target.dataset.id;
    if (confirm("¿Eliminar este producto?")) {
      remove(ref(db, "productos/" + id));
    }
  }
});
// ------------------ CRUD FACTURAS ------------------
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");
const facturasRef = ref(db, "facturas");

// MODAL
const modal = document.getElementById("modalDetalle");
const modalContenido = document.getElementById("modalContenido");
const cerrarModal = document.getElementById("cerrarModal");
cerrarModal.addEventListener("click", () => modal.classList.remove("show"));

// Registrar factura
facturaForm.addEventListener("submit", e => {
  e.preventDefault();

  const idFactura = document.getElementById("idFactura").value.trim();
  const numeroFactura = document.getElementById("numeroFactura").value.trim();
  const fecha = document.getElementById("fechaEmisionFactura").value;
  const proveedor = document.getElementById("proveedorFactura").value;
  const producto = document.getElementById("productoFactura").value;
  const monto = document.getElementById("montoFactura").value.trim();
  const moneda = document.getElementById("monedaFactura").value;
  const tipo = document.getElementById("tipoFactura").value;

  if (!idFactura || !numeroFactura || !proveedor || !producto) {
    alert("Por favor completa los campos obligatorios");
    return;
  }

  push(facturasRef, { idFactura, numeroFactura, proveedor, producto, monto, moneda, tipo, fecha })
    .then(() => facturaForm.reset())
    .catch(err => console.error("Error al guardar factura:", err));
});

// Mostrar facturas en tiempo real
onValue(facturasRef, snapshot => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(child => {
    const id = child.key;
    const data = child.val();

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.idFactura}</td>
      <td>${data.numeroFactura}</td>
      <td>${data.proveedor}</td>
      <td>${data.producto}</td>
      <td>${data.moneda || ''} ${data.monto || ''}</td>
      <td>${data.tipo}</td>
      <td>${data.fecha}</td>
      <td>
        <button class="btn btn-edit" data-id="${id}">Editar</button>
        <button class="btn btn-delete" data-id="${id}">Eliminar</button>
        <button class="btn secondary btn-detalle" data-id="${id}">Ver</button>
      </td>
    `;
    tablaFacturas.appendChild(tr);
  });
});

// Editar factura
tablaFacturas.addEventListener("click", e => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains("btn-edit")) {
    const row = e.target.closest("tr");
    const celdas = row.querySelectorAll("td");

    const idFactura = prompt("Nuevo ID:", celdas[0].textContent);
    const numeroFactura = prompt("Nuevo número:", celdas[1].textContent);
    const proveedor = prompt("Nuevo proveedor:", celdas[2].textContent);
    const producto = prompt("Nuevo producto:", celdas[3].textContent);
    const monto = prompt("Nuevo monto:", celdas[4].textContent.replace(/[^\d.]/g, ""));
    const tipo = prompt("Nuevo tipo (FACTURA / BOLETA):", celdas[5].textContent);
    const fecha = prompt("Nueva fecha (YYYY-MM-DD):", celdas[6].textContent);

    if (idFactura && numeroFactura) {
      update(ref(db, "facturas/" + id), {
        idFactura, numeroFactura, proveedor, producto, monto, tipo, fecha
      });
    }
  }

  if (e.target.classList.contains("btn-delete")) {
    if (confirm("¿Eliminar esta factura?")) {
      remove(ref(db, "facturas/" + id));
    }
  }

  if (e.target.classList.contains("btn-detalle")) {
    mostrarDetalleFactura(id);
  }
});

// Función para mostrar detalle en el modal
function mostrarDetalleFactura(id) {
  const facturaRef = ref(db, "facturas/" + id);
  onValue(facturaRef, snapshot => {
    const f = snapshot.val();
    modalContenido.innerHTML = `
      <h3>📜 Detalle de Factura</h3>
      <p><b>ID:</b> ${f.idFactura}</p>
      <p><b>Número:</b> ${f.numeroFactura}</p>
      <p><b>Proveedor:</b> ${f.proveedor}</p>
      <p><b>Producto:</b> ${f.producto}</p>
      <p><b>Monto:</b> ${f.moneda} ${f.monto}</p>
      <p><b>Tipo:</b> ${f.tipo}</p>
      <p><b>Fecha:</b> ${f.fecha}</p>
    `;
    modal.classList.add("show");
  }, { onlyOnce: true });
}
// ------------------ BUSCADOR INTERACTIVO ------------------
const buscadorFactura = document.getElementById("buscadorFactura");
const btnRefresh = document.getElementById("btnRefresh");

buscadorFactura.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    const query = buscadorFactura.value.toLowerCase();
    if (!query) return;

    const facturaQuery = ref(db, "facturas");
    onValue(facturaQuery, snapshot => {
      const resultados = [];
      snapshot.forEach(child => {
        const f = child.val();
        if (f.producto && f.producto.toLowerCase().includes(query)) {
          resultados.push(f);
        }
      });

      if (resultados.length > 0) {
        mostrarResultadosBusqueda(resultados);
      } else {
        modalContenido.innerHTML = `<h3>❌ No se encontraron facturas para "${query}"</h3>`;
        modal.classList.add("show");
      }
    }, { onlyOnce: true });
  }
});

// Mostrar resultados del buscador en el modal
function mostrarResultadosBusqueda(resultados) {
  modalContenido.innerHTML = `
    <h3>🔎 Resultados de búsqueda</h3>
    <div style="max-height:400px;overflow:auto;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr><th>ID</th><th>Número</th><th>Proveedor</th><th>Producto</th><th>Monto</th><th>Fecha</th></tr>
        </thead>
        <tbody>
          ${resultados.map(f => `
            <tr>
              <td>${f.idFactura}</td>
              <td>${f.numeroFactura}</td>
              <td>${f.proveedor}</td>
              <td>${f.producto}</td>
              <td>${f.moneda} ${f.monto}</td>
              <td>${f.fecha}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
  modal.classList.add("show");
}

// Botón para limpiar el buscador
btnRefresh.addEventListener("click", () => {
  buscadorFactura.value = "";
  modal.classList.remove("show");
});


