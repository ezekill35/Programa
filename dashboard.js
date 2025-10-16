/* ================================
   DASHBOARD.JS · DISCOVERY PETS
   PARTE 1: Configuración base Firebase
================================= */

// Importa las funciones necesarias de Firebase v9+
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  remove,
  onValue,
  get
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// ⚙️ Tu configuración de Firebase (puedes reemplazarla con la tuya)
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  databaseURL: "https://discovery-pets-default-rtdb.firebaseio.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:example123"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 🧩 Referencias a tablas
const refProveedores = ref(db, "proveedores");
const refProductos = ref(db, "productos");
const refFacturas = ref(db, "facturas");

// 🧠 Utilidades básicas
const $ = (id) => document.getElementById(id);
const secciones = document.querySelectorAll("section");
const botonesMenu = document.querySelectorAll(".menu-btn");

// Control de cambio de secciones (Proveedores, Productos, Facturas)
botonesMenu.forEach(btn => {
  btn.addEventListener("click", () => {
    botonesMenu.forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    const target = btn.getAttribute("data-target");
    secciones.forEach(s => s.style.display = "none");
    $(target).style.display = "block";
  });
});
/* =====================================
   PARTE 2: CRUD DE PROVEEDORES (Realtime)
===================================== */

// --- Registrar proveedor ---
$("formProveedor").addEventListener("submit", async (e) => {
  e.preventDefault();

  const proveedor = {
    nombre: $("provNombre").value.trim(),
    ruc: $("provRuc").value.trim(),
    direccion: $("provDireccion").value.trim(),
    telefono: $("provTelefono").value.trim() || "—",
    numeroOpcional: $("provNumero").value.trim() || "—"
  };

  if (!proveedor.nombre || !proveedor.ruc) {
    alert("Por favor completa los campos obligatorios (nombre y RUC).");
    return;
  }

  const nuevoRef = push(refProveedores);
  await set(nuevoRef, proveedor);

  e.target.reset();
  alert("✅ Proveedor registrado correctamente.");
});

// --- Mostrar proveedores en tiempo real ---
onValue(refProveedores, (snapshot) => {
  const tbody = $("tablaProveedores").querySelector("tbody");
  tbody.innerHTML = "";
  snapshot.forEach((child) => {
    const prov = child.val();
    const id = child.key;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${prov.nombre}</td>
      <td>${prov.ruc}</td>
      <td>${prov.direccion}</td>
      <td>${prov.telefono}</td>
      <td>${prov.numeroOpcional}</td>
      <td>
        <button class="btn-editar" data-id="${id}">Editar</button>
        <button class="btn-eliminar" data-id="${id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
});

// --- Eliminar proveedor ---
$("tablaProveedores").addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-eliminar")) {
    const id = e.target.dataset.id;
    if (confirm("¿Eliminar este proveedor?")) {
      await remove(ref(db, "proveedores/" + id));
      alert("🗑️ Proveedor eliminado correctamente.");
    }
  }
});

// --- Editar proveedor ---
$("tablaProveedores").addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-editar")) {
    const fila = e.target.closest("tr");
    const id = e.target.dataset.id;
    const celdas = fila.querySelectorAll("td");

    // Convertir a inputs editables
    const campos = ["nombre", "ruc", "direccion", "telefono", "numeroOpcional"];
    campos.forEach((campo, i) => {
      const valor = celdas[i].innerText;
      celdas[i].innerHTML = `<input value="${valor}" data-campo="${campo}" style="width:100%">`;
    });

    e.target.textContent = "Guardar";
    e.target.classList.remove("btn-editar");
    e.target.classList.add("btn-guardar");

    // Desactivar el botón eliminar temporalmente
    fila.querySelector(".btn-eliminar").disabled = true;

    // Guardar cambios
    e.target.addEventListener("click", async () => {
      const inputs = fila.querySelectorAll("input[data-campo]");
      const actualizacion = {};
      inputs.forEach(input => actualizacion[input.dataset.campo] = input.value.trim());

      await update(ref(db, "proveedores/" + id), actualizacion);
      alert("✅ Cambios guardados.");
      fila.querySelector(".btn-eliminar").disabled = false;
    }, { once: true });
  }
});
/* =====================================
   PARTE 3: CRUD DE PRODUCTOS (Realtime)
===================================== */

// --- Registrar producto ---
$("formProducto").addEventListener("submit", async (e) => {
  e.preventDefault();

  const producto = {
    nombre: $("prodNombre").value.trim(),
    precio: parseFloat($("prodPrecio").value.trim()) || 0,
    cantidad: parseInt($("prodCantidad").value.trim()) || 0,
    descripcion: $("prodDescripcion").value.trim() || "—"
  };

  if (!producto.nombre || producto.precio <= 0) {
    alert("Por favor completa los campos obligatorios (nombre y precio).");
    return;
  }

  const nuevoRef = push(refProductos);
  await set(nuevoRef, producto);

  e.target.reset();
  alert("✅ Producto registrado correctamente.");
});

// --- Mostrar productos en tiempo real ---
onValue(refProductos, (snapshot) => {
  const tbody = $("tablaProductos").querySelector("tbody");
  tbody.innerHTML = "";
  snapshot.forEach((child) => {
    const prod = child.val();
    const id = child.key;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${prod.nombre}</td>
      <td>${prod.precio.toFixed(2)}</td>
      <td>${prod.cantidad}</td>
      <td>${prod.descripcion}</td>
      <td>
        <button class="btn-editar" data-id="${id}">Editar</button>
        <button class="btn-eliminar" data-id="${id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
});

// --- Eliminar producto ---
$("tablaProductos").addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-eliminar")) {
    const id = e.target.dataset.id;
    if (confirm("¿Eliminar este producto?")) {
      await remove(ref(db, "productos/" + id));
      alert("🗑️ Producto eliminado correctamente.");
    }
  }
});

// --- Editar producto ---
$("tablaProductos").addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-editar")) {
    const fila = e.target.closest("tr");
    const id = e.target.dataset.id;
    const celdas = fila.querySelectorAll("td");

    // Convertir a inputs editables
    const campos = ["nombre", "precio", "cantidad", "descripcion"];
    campos.forEach((campo, i) => {
      const valor = celdas[i].innerText;
      celdas[i].innerHTML = `<input value="${valor}" data-campo="${campo}" style="width:100%">`;
    });

    e.target.textContent = "Guardar";
    e.target.classList.remove("btn-editar");
    e.target.classList.add("btn-guardar");

    // Desactivar el botón eliminar temporalmente
    fila.querySelector(".btn-eliminar").disabled = true;

    // Guardar cambios
    e.target.addEventListener("click", async () => {
      const inputs = fila.querySelectorAll("input[data-campo]");
      const actualizacion = {};
      inputs.forEach(input => {
        const campo = input.dataset.campo;
        const valor = input.value.trim();
        actualizacion[campo] =
          campo === "precio" ? parseFloat(valor) || 0 :
          campo === "cantidad" ? parseInt(valor) || 0 : valor;
      });

      await update(ref(db, "productos/" + id), actualizacion);
      alert("✅ Cambios guardados correctamente.");
      fila.querySelector(".btn-eliminar").disabled = false;
    }, { once: true });
  }
});
/* =====================================
   PARTE 4: CRUD DE FACTURAS
===================================== */

// --- Cargar proveedores y productos en los selects ---
function cargarSelects() {
  // Proveedores
  onValue(refProveedores, (snapshot) => {
    const select = $("facturaProveedor");
    select.innerHTML = '<option value="">Seleccione proveedor</option>';
    snapshot.forEach((child) => {
      const prov = child.val();
      const id = child.key;
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = prov.nombre + (prov.numero ? ` (${prov.numero})` : "");
      select.appendChild(opt);
    });
  });

  // Productos
  onValue(refProductos, (snapshot) => {
    const select = $("facturaProducto");
    select.innerHTML = '<option value="">Seleccione producto</option>';
    snapshot.forEach((child) => {
      const prod = child.val();
      const id = child.key;
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = `${prod.nombre} - S/${prod.precio}`;
      select.appendChild(opt);
    });
  });
}

cargarSelects();

// --- Registrar factura ---
$("formFactura").addEventListener("submit", async (e) => {
  e.preventDefault();

  const proveedorId = $("facturaProveedor").value;
  const productoId = $("facturaProducto").value;

  if (!proveedorId || !productoId) {
    alert("Seleccione un proveedor y un producto.");
    return;
  }

  const factura = {
    codigo: $("facturaCodigo").value.trim(),
    proveedorId,
    productoId,
    fecha: $("facturaFecha").value || new Date().toISOString().split("T")[0],
    cantidad: parseInt($("facturaCantidad").value) || 1,
    total: parseFloat($("facturaTotal").value) || 0
  };

  const nuevoRef = push(refFacturas);
  await set(nuevoRef, factura);

  e.target.reset();
  alert("✅ Factura registrada correctamente.");
});

// --- Mostrar facturas en tiempo real ---
onValue(refFacturas, async (snapshot) => {
  const tbody = $("tablaFacturas").querySelector("tbody");
  tbody.innerHTML = "";

  const proveedoresSnap = await get(refProveedores);
  const productosSnap = await get(refProductos);

  snapshot.forEach((child) => {
    const fact = child.val();
    const id = child.key;

    const prov = proveedoresSnap.child(fact.proveedorId).val() || { nombre: "—" };
    const prod = productosSnap.child(fact.productoId).val() || { nombre: "—", precio: 0 };

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${fact.codigo}</td>
      <td>${prov.nombre}</td>
      <td>${prod.nombre}</td>
      <td>${fact.fecha}</td>
      <td>${fact.cantidad}</td>
      <td>S/${fact.total.toFixed(2)}</td>
      <td>
        <button class="btn-editar" data-id="${id}">Editar</button>
        <button class="btn-eliminar" data-id="${id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
});

// --- Eliminar factura ---
$("tablaFacturas").addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-eliminar")) {
    const id = e.target.dataset.id;
    if (confirm("¿Eliminar esta factura?")) {
      await remove(ref(db, "facturas/" + id));
      alert("🗑️ Factura eliminada correctamente.");
    }
  }
});

// --- Editar factura ---
$("tablaFacturas").addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-editar")) {
    const fila = e.target.closest("tr");
    const id = e.target.dataset.id;
    const celdas = fila.querySelectorAll("td");

    // Convertir a inputs editables
    const campos = ["codigo", "proveedor", "producto", "fecha", "cantidad", "total"];
    campos.forEach((campo, i) => {
      if (campo === "proveedor" || campo === "producto") return; // no editar selects aquí
      const valor = celdas[i].innerText.replace("S/", "").trim();
      celdas[i].innerHTML = `<input value="${valor}" data-campo="${campo}" style="width:100%">`;
    });

    e.target.textContent = "Guardar";
    e.target.classList.remove("btn-editar");
    e.target.classList.add("btn-guardar");

    fila.querySelector(".btn-eliminar").disabled = true;

    e.target.addEventListener("click", async () => {
      const inputs = fila.querySelectorAll("input[data-campo]");
      const actualizacion = {};
      inputs.forEach((input) => {
        const campo = input.dataset.campo;
        const valor = input.value.trim();
        actualizacion[campo] =
          campo === "cantidad" ? parseInt(valor) || 0 :
          campo === "total" ? parseFloat(valor) || 0 : valor;
      });

      await update(ref(db, "facturas/" + id), actualizacion);
      alert("✅ Cambios guardados correctamente.");
      fila.querySelector(".btn-eliminar").disabled = false;
    }, { once: true });
  }
});
/* =====================================
   PARTE 5: BUSCADOR Y MODAL DE DETALLE
===================================== */

// --- Buscar facturas por nombre de producto ---
$("buscadorFactura").addEventListener("keypress", async (e) => {
  if (e.key === "Enter") {
    const texto = e.target.value.trim().toLowerCase();
    if (!texto) return;

    const snapshotFacturas = await get(refFacturas);
    const snapshotProductos = await get(refProductos);
    const snapshotProveedores = await get(refProveedores);

    const tbody = $("tablaFacturas").querySelector("tbody");
    tbody.innerHTML = "";

    snapshotFacturas.forEach((child) => {
      const factura = child.val();
      const id = child.key;
      const producto = snapshotProductos.child(factura.productoId).val();
      const proveedor = snapshotProveedores.child(factura.proveedorId).val();

      if (producto && producto.nombre.toLowerCase().includes(texto)) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${factura.codigo}</td>
          <td>${proveedor ? proveedor.nombre : "—"}</td>
          <td>${producto.nombre}</td>
          <td>${factura.fecha}</td>
          <td>${factura.cantidad}</td>
          <td>S/${factura.total.toFixed(2)}</td>
          <td>
            <button class="btn-detalle" data-id="${id}">🔍 Ver</button>
          </td>
        `;
        tbody.appendChild(tr);
      }
    });

    if (tbody.innerHTML === "") {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#888">No se encontraron facturas para "${texto}"</td></tr>`;
    }
  }
});

// --- Botón restablecer ---
$("btnRefresh").addEventListener("click", () => {
  location.reload();
});

// --- Modal de detalle dinámico ---
const modal = document.createElement("div");
modal.id = "detalleModal";
modal.style.cssText = `
  position:fixed;top:0;left:0;width:100%;height:100%;
  background:rgba(0,0,0,0.4);display:none;
  align-items:center;justify-content:center;z-index:1000;
`;
modal.innerHTML = `
  <div style="
    background:white;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,0.25);
    max-width:480px;width:90%;padding:20px;text-align:left;
    animation:fadeIn .3s ease;
  ">
    <h3 style="margin-top:0;color:#00bcd4">Detalles de Factura</h3>
    <div id="detalleContenido"></div>
    <button id="cerrarModal" class="btn" style="margin-top:14px;width:100%">Cerrar</button>
  </div>
`;
document.body.appendChild(modal);

// --- Mostrar detalles al hacer clic en 🔍 ---
$("tablaFacturas").addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-detalle")) {
    const id = e.target.dataset.id;
    const facturaSnap = await get(ref(db, "facturas/" + id));
    const factura = facturaSnap.val();

    const proveedorSnap = await get(ref(db, "proveedores/" + factura.proveedorId));
    const productoSnap = await get(ref(db, "productos/" + factura.productoId));

    const prov = proveedorSnap.val() || {};
    const prod = productoSnap.val() || {};

    $("detalleContenido").innerHTML = `
      <p><strong>Código:</strong> ${factura.codigo}</p>
      <p><strong>Proveedor:</strong> ${prov.nombre || "—"}</p>
      <p><strong>Producto:</strong> ${prod.nombre || "—"}</p>
      <p><strong>Fecha:</strong> ${factura.fecha}</p>
      <p><strong>Cantidad:</strong> ${factura.cantidad}</p>
      <p><strong>Total:</strong> S/${factura.total.toFixed(2)}</p>
      <hr>
      <p style="font-size:13px;color:#64748b">
        <em>Datos en tiempo real - Discovery Pets</em>
      </p>
    `;

    modal.style.display = "flex";
  }
});

// --- Cerrar modal ---
modal.querySelector("#cerrarModal").addEventListener("click", () => {
  modal.style.display = "none";
});

// --- Animación del modal ---
const estiloModal = document.createElement("style");
estiloModal.textContent = `
@keyframes fadeIn {
  from {opacity:0;transform:translateY(-10px);}
  to {opacity:1;transform:translateY(0);}
}
`;
document.head.appendChild(estiloModal);

