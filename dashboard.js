// ==========================
// DASHBOARD.JS COMPLETO
// ==========================

// Importar funciones de Firebase
import { 
  getDatabase, ref, set, push, onValue, remove, update, get 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

import { auth, app } from "./firebase.js";
import { 
  getAuth, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const db = getDatabase(app);

// ==========================
// AUTENTICACIÓN
// ==========================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});

document.getElementById("logout").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
});

// ==========================
// SECCIONES DINÁMICAS
// ==========================
const menuLinks = document.querySelectorAll(".menu a");
const secciones = document.querySelectorAll(".seccion");

menuLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = link.getAttribute("href").substring(1);

    secciones.forEach(sec => sec.style.display = "none");
    document.getElementById(target).style.display = "block";

    menuLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");
  });
});

document.getElementById("inicio").style.display = "block";

// ==========================
// FORMULARIO DE PROVEEDORES
// ==========================
const proveedorForm = document.getElementById("proveedorForm");
proveedorForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombreProveedor").value.trim();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const telefono = document.getElementById("telefonoProveedor").value.trim();

  if (!/^\d+$/.test(ruc) || !/^\d+$/.test(telefono)) {
    alert("RUC y Teléfono deben contener solo números.");
    return;
  }

  const nuevoProveedor = { nombre, ruc, telefono };
  const proveedorRef = push(ref(db, "proveedores"));
  set(proveedorRef, nuevoProveedor);

  proveedorForm.reset();
});

// Mostrar proveedores en tabla y selector
const tablaProveedores = document.getElementById("tablaProveedores");
const proveedorFactura = document.getElementById("proveedorFactura");

onValue(ref(db, "proveedores"), (snapshot) => {
  tablaProveedores.innerHTML = "";
  proveedorFactura.innerHTML = '<option value="">Seleccionar</option>';

  snapshot.forEach(child => {
    const proveedor = child.val();
    const key = child.key;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${proveedor.nombre}</td>
      <td>${proveedor.ruc}</td>
      <td>${proveedor.telefono}</td>
      <td>
        <button class="btn-eliminar" data-key="${key}" data-tipo="proveedor">🗑️</button>
      </td>
    `;
    tablaProveedores.appendChild(tr);

    const option = document.createElement("option");
    option.value = key;
    option.textContent = proveedor.nombre;
    proveedorFactura.appendChild(option);
  });
});

// ==========================
// FORMULARIO DE PRODUCTOS
// ==========================
const productoForm = document.getElementById("productoForm");

productoForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombreProducto").value.trim();
  const valorUnitario = parseFloat(document.getElementById("valorProducto").value);

  if (isNaN(valorUnitario)) {
    alert("Ingrese un valor numérico válido para el producto.");
    return;
  }

  const nuevoProducto = { nombre, valorUnitario };
  const productoRef = push(ref(db, "productos"));
  set(productoRef, nuevoProducto);

  productoForm.reset();
});

// Mostrar productos en tabla y selector
const tablaProductos = document.getElementById("tablaProductos");
const productoFactura = document.getElementById("productoFactura");

onValue(ref(db, "productos"), (snapshot) => {
  tablaProductos.innerHTML = "";
  productoFactura.innerHTML = '<option value="">Seleccionar</option>';

  snapshot.forEach(child => {
    const producto = child.val();
    const key = child.key;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${producto.nombre}</td>
      <td>${producto.valorUnitario.toFixed(4)}</td>
      <td>
        <button class="btn-eliminar" data-key="${key}" data-tipo="producto">🗑️</button>
      </td>
    `;
    tablaProductos.appendChild(tr);

    const option = document.createElement("option");
    option.value = key;
    option.textContent = producto.nombre;
    productoFactura.appendChild(option);
  });
});

// ==========================
// FORMULARIO DE FACTURAS
// ==========================
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");

facturaForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const numero = document.getElementById("numeroFactura").value.trim();
  const fecha = document.getElementById("fechaFactura").value;
  const proveedorKey = document.getElementById("proveedorFactura").value;
  const productoKey = document.getElementById("productoFactura").value;
  const monto = parseFloat(document.getElementById("montoFactura").value);
  const tipo = document.getElementById("tipoFactura").value;
  const moneda = document.getElementById("monedaFactura").value;

  if (!numero || !fecha || !proveedorKey || !productoKey || isNaN(monto)) {
    alert("Por favor, complete todos los campos correctamente.");
    return;
  }

  const nuevaFactura = { numero, fecha, proveedorKey, productoKey, monto, tipo, moneda };
  const facturaRef = push(ref(db, "facturas"));
  set(facturaRef, nuevaFactura);

  facturaForm.reset();
});

// Mostrar facturas
onValue(ref(db, "facturas"), async (snapshot) => {
  tablaFacturas.innerHTML = "";

  const proveedoresSnap = await get(ref(db, "proveedores"));
  const productosSnap = await get(ref(db, "productos"));

  snapshot.forEach(child => {
    const factura = child.val();
    const key = child.key;

    const proveedor = proveedoresSnap.child(factura.proveedorKey).val();
    const producto = productosSnap.child(factura.productoKey).val();

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${factura.numero}</td>
      <td>${factura.fecha}</td>
      <td class="clickable" data-tipo="proveedor" data-id="${factura.proveedorKey}">${proveedor ? proveedor.nombre : "—"}</td>
      <td class="clickable" data-tipo="producto" data-id="${factura.productoKey}">${producto ? producto.nombre : "—"}</td>
      <td>${factura.moneda}${factura.monto.toFixed(2)}</td>
      <td>${factura.tipo}</td>
      <td><button class="btn-eliminar" data-key="${key}" data-tipo="factura">🗑️</button></td>
    `;
    tablaFacturas.appendChild(tr);
  });
});

// ==========================
// ELIMINAR ELEMENTOS
// ==========================
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-eliminar")) {
    const key = e.target.getAttribute("data-key");
    const tipo = e.target.getAttribute("data-tipo");
    remove(ref(db, `${tipo}s/${key}`));
  }

  if (e.target.classList.contains("clickable")) {
    const tipo = e.target.dataset.tipo;
    const id = e.target.dataset.id;

    get(ref(db, `${tipo}s/${id}`)).then((snap) => {
      if (snap.exists()) {
        const datos = snap.val();
        alert(`📋 Datos de ${tipo.toUpperCase()}:\n` + 
              Object.entries(datos).map(([k,v]) => `${k}: ${v}`).join("\n"));
      }
    });
  }
});

// ==========================
// BUSCADOR DE FACTURAS POR PRODUCTO
// ==========================
const buscador = document.getElementById("buscador");
buscador.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const query = buscador.value.trim().toLowerCase();
    if (!query) return;

    const productosSnap = await get(ref(db, "productos"));
    let productoEncontrado = null;
    productosSnap.forEach(child => {
      if (child.val().nombre.toLowerCase().includes(query)) {
        productoEncontrado = child.key;
      }
    });

    tablaFacturas.innerHTML = "";
    if (!productoEncontrado) {
      tablaFacturas.innerHTML = `<tr><td colspan="7">❌ No se encontraron facturas relacionadas.</td></tr>`;
      return;
    }

    const facturasSnap = await get(ref(db, "facturas"));
    const proveedoresSnap = await get(ref(db, "proveedores"));
    facturasSnap.forEach(child => {
      const factura = child.val();
      if (factura.productoKey === productoEncontrado) {
        const proveedor = proveedoresSnap.child(factura.proveedorKey).val();
        const producto = productosSnap.child(factura.productoKey).val();

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${factura.numero}</td>
          <td>${factura.fecha}</td>
          <td class="clickable" data-tipo="proveedor" data-id="${factura.proveedorKey}">${proveedor ? proveedor.nombre : "—"}</td>
          <td class="clickable" data-tipo="producto" data-id="${factura.productoKey}">${producto ? producto.nombre : "—"}</td>
          <td>${factura.moneda}${factura.monto.toFixed(2)}</td>
          <td>${factura.tipo}</td>
          <td><button class="btn-eliminar" data-key="${child.key}" data-tipo="factura">🗑️</button></td>
        `;
        tablaFacturas.appendChild(tr);
      }
    });
  }
});




