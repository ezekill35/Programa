import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ======================= NAVEGACIÓN =======================
const botones = document.querySelectorAll(".menu-btn");
const secciones = document.querySelectorAll(".seccion");

botones.forEach((btn) => {
  btn.addEventListener("click", () => {
    botones.forEach((b) => b.classList.remove("activo"));
    btn.classList.add("activo");

    secciones.forEach((sec) => {
      sec.classList.remove("activa");
      if (sec.id === btn.dataset.target) sec.classList.add("activa");
    });
  });
});

// ======================= CERRAR SESIÓN =======================
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ======================= PROVEEDORES =======================
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");
let proveedores = [];

proveedorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();

  await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion });
  proveedorForm.reset();
});

onSnapshot(collection(db, "proveedores"), (snapshot) => {
  proveedores = [];
  tablaProveedores.innerHTML = "";
  const proveedorSelect = document.getElementById("proveedorFactura");
  proveedorSelect.innerHTML = '<option value="">Seleccione proveedor</option>';

  snapshot.forEach((docu) => {
    const p = { id: docu.id, ...docu.data() };
    proveedores.push(p);

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.ruc}</td>
      <td><span class="clic-detalle" data-tipo="proveedor" data-id="${p.id}">${p.nombre}</span></td>
      <td>${p.direccion}</td>
      <td><button class="btn-delete" data-id="${p.id}" data-tipo="proveedores">🗑️</button></td>
    `;
    tablaProveedores.appendChild(fila);

    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = p.nombre;
    proveedorSelect.appendChild(option);
  });
});

// ======================= PRODUCTOS =======================
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");
let productos = [];

productoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const cantidad = document.getElementById("cantidadProducto").value.trim();
  const unidad = document.getElementById("unidadProducto").value.trim();
  const valor = document.getElementById("valorUnitarioProducto").value.trim();

  await addDoc(collection(db, "productos"), { nombre, cantidad, unidad, valor });
  productoForm.reset();
});

onSnapshot(collection(db, "productos"), (snapshot) => {
  productos = [];
  tablaProductos.innerHTML = "";
  const productoSelect = document.getElementById("productoFactura");
  productoSelect.innerHTML = '<option value="">Seleccione producto</option>';

  snapshot.forEach((docu) => {
    const p = { id: docu.id, ...docu.data() };
    productos.push(p);

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td><span class="clic-detalle" data-tipo="producto" data-id="${p.id}">${p.nombre}</span></td>
      <td>${p.cantidad}</td>
      <td>${p.unidad}</td>
      <td>${p.valor}</td>
      <td><button class="btn-delete" data-id="${p.id}" data-tipo="productos">🗑️</button></td>
    `;
    tablaProductos.appendChild(fila);

    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = p.nombre;
    productoSelect.appendChild(option);
  });
});

// ======================= FACTURAS =======================
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");
let facturas = [];

facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const numero = document.getElementById("numeroFactura").value.trim();
  const fecha = document.getElementById("fechaEmisionFactura").value;
  const proveedor = document.getElementById("proveedorFactura").value;
  const producto = document.getElementById("productoFactura").value;
  const monto = document.getElementById("montoFactura").value;
  const moneda = document.getElementById("monedaFactura").value;
  const tipo = document.getElementById("tipoFactura").value;

  if (!proveedor || !producto) {
    alert("Debe seleccionar un proveedor y un producto.");
    return;
  }

  await addDoc(collection(db, "facturas"), {
    numero,
    fecha,
    proveedor,
    producto,
    monto,
    moneda,
    tipo,
  });
  facturaForm.reset();
});

onSnapshot(collection(db, "facturas"), (snapshot) => {
  facturas = [];
  tablaFacturas.innerHTML = "";
  snapshot.forEach((docu) => {
    const f = { id: docu.id, ...docu.data() };
    facturas.push(f);
  });
  mostrarFacturas(facturas);
});

function mostrarFacturas(lista) {
  tablaFacturas.innerHTML = "";
  lista.forEach((f) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${f.numero}</td>
      <td><span class="clic-detalle" data-tipo="proveedor-nombre" data-nombre="${f.proveedor}">${f.proveedor}</span></td>
      <td><span class="clic-detalle" data-tipo="producto-nombre" data-nombre="${f.producto}">${f.producto}</span></td>
      <td>${f.moneda}${f.monto}</td>
      <td>${f.tipo}</td>
      <td>${f.fecha}</td>
      <td><button class="btn-delete" data-id="${f.id}" data-tipo="facturas">🗑️</button></td>
    `;
    tablaFacturas.appendChild(fila);
  });
}

// ======================= BUSCADOR DE FACTURAS POR PRODUCTO =======================
const buscadorProducto = document.getElementById("buscadorProducto");
const tablaFacturas = document.getElementById("tablaFacturas");

if (buscadorProducto) {
  // Buscar al presionar Enter
  buscadorProducto.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const texto = buscadorProducto.value.trim().toLowerCase();

      if (texto === "") {
        alert("Por favor, escriba el nombre de un producto.");
        return;
      }

      // Escucha las facturas y filtra las relacionadas con el producto buscado
      onSnapshot(collection(db, "facturas"), (snapshot) => {
        tablaFacturas.innerHTML = "";
        let encontrado = false;

        snapshot.forEach((docu) => {
          const f = docu.data();
          if (f.producto.toLowerCase().includes(texto)) {
            encontrado = true;
            const fila = document.createElement("tr");
            fila.innerHTML = `
              <td>${f.numero}</td>
              <td>${f.proveedor}</td>
              <td>${f.producto}</td>
              <td>${f.moneda}${f.monto}</td>
              <td>${f.tipo}</td>
              <td>${f.fecha}</td>
              <td>
                <button class="btn-delete" data-id="${docu.id}" data-tipo="facturas">🗑️</button>
              </td>
            `;
            tablaFacturas.appendChild(fila);
          }
        });

        if (!encontrado) {
          tablaFacturas.innerHTML = `<tr><td colspan="7">No se encontraron facturas para el producto "${texto}"</td></tr>`;
        }
      });
    }
  });
}


// ======================= ELIMINAR REGISTRO =======================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-delete")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    if (confirm("¿Desea eliminar este registro?")) {
      await deleteDoc(doc(db, tipo, id));
    }
  }
});

// ======================= MODAL DETALLES =======================
const modal = document.getElementById("detalleModal");
const tituloModal = document.getElementById("tituloModal");
const contenidoModal = document.getElementById("contenidoModal");
document.getElementById("cerrarModal").addEventListener("click", () => {
  modal.style.display = "none";
});

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("clic-detalle")) {
    const tipo = e.target.dataset.tipo;

    // Si es producto o proveedor dentro de las listas
    if (tipo === "producto" || tipo === "proveedor") {
      const id = e.target.dataset.id;
      const coleccion = tipo === "producto" ? "productos" : "proveedores";
      const docu = await getDoc(doc(db, coleccion, id));
      if (docu.exists()) {
        const datos = docu.data();
        tituloModal.textContent =
          tipo === "producto" ? "Datos del Producto 🐕" : "Datos del Proveedor 🚚";
        contenidoModal.innerHTML = Object.entries(datos)
          .map(([k, v]) => `<p><strong>${k}:</strong> ${v}</p>`)
          .join("");
        modal.style.display = "flex";
      }
    }

    // Si se hace clic en nombre dentro de la tabla de facturas
    if (tipo === "producto-nombre" || tipo === "proveedor-nombre") {
      const nombre = e.target.dataset.nombre;
      const confirmacion = confirm(
        `¿Deseas ver los datos del ${tipo === "producto-nombre" ? "producto" : "proveedor"} "${nombre}"?`
      );
      if (!confirmacion) return;

      const coleccion = tipo === "producto-nombre" ? "productos" : "proveedores";
      const lista = coleccion === "productos" ? productos : proveedores;
      const encontrado = lista.find(
        (x) => x.nombre.toLowerCase() === nombre.toLowerCase()
      );

      if (encontrado) {
        tituloModal.textContent =
          coleccion === "productos"
            ? "Datos del Producto 🐕"
            : "Datos del Proveedor 🚚";
        contenidoModal.innerHTML = Object.entries(encontrado)
          .filter(([k]) => k !== "id")
          .map(([k, v]) => `<p><strong>${k}:</strong> ${v}</p>`)
          .join("");
        modal.style.display = "flex";
      } else {
        alert("No se encontraron datos en Firebase.");
      }
    }
  }
});







