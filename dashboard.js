import { app, db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ===================== Navegación entre secciones =====================
const botonesMenu = document.querySelectorAll(".menu-btn");
const secciones = document.querySelectorAll(".seccion");

botonesMenu.forEach((btn) => {
  btn.addEventListener("click", () => {
    botonesMenu.forEach((b) => b.classList.remove("activo"));
    btn.classList.add("activo");
    const destino = btn.dataset.target;
    secciones.forEach((sec) =>
      sec.id === destino ? sec.classList.add("activa") : sec.classList.remove("activa")
    );
  });
});

// ===================== Cerrar Sesión =====================
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    alert("Error al cerrar sesión: " + error.message);
  }
});

// ===================== Referencias Firestore =====================
const proveedoresRef = collection(db, "proveedores");
const productosRef = collection(db, "productos");
const facturasRef = collection(db, "facturas");

// ===================== CRUD PROVEEDORES =====================
const formProveedor = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");

formProveedor.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();

  if (!/^[0-9]+$/.test(ruc)) return alert("El RUC solo debe contener números.");

  await addDoc(proveedoresRef, { ruc, nombre, direccion });
  formProveedor.reset();
});

onSnapshot(proveedoresRef, (snapshot) => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const p = docSnap.data();
    tablaProveedores.innerHTML += `
      <tr>
        <td>${p.ruc}</td>
        <td><a href="#" class="detalle-proveedor" data-id="${docSnap.id}">${p.nombre}</a></td>
        <td>${p.direccion}</td>
        <td>
          <button class="btn-primary editar" data-id="${docSnap.id}" data-tipo="proveedor">✏️</button>
          <button class="btn-delete eliminar" data-id="${docSnap.id}" data-tipo="proveedor">🗑️</button>
        </td>
      </tr>
    `;
  });
  actualizarEventos();
  actualizarSelects();
});

// ===================== CRUD PRODUCTOS =====================
const formProducto = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");

formProducto.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const cantidad = document.getElementById("cantidadProducto").value;
  const unidad = document.getElementById("unidadProducto").value.trim();
  const valor = parseFloat(document.getElementById("valorUnitarioProducto").value);

  await addDoc(productosRef, { nombre, cantidad, unidad, valor });
  formProducto.reset();
});

onSnapshot(productosRef, (snapshot) => {
  tablaProductos.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const p = docSnap.data();
    tablaProductos.innerHTML += `
      <tr>
        <td><a href="#" class="detalle-producto" data-id="${docSnap.id}">${p.nombre}</a></td>
        <td>${p.cantidad}</td>
        <td>${p.unidad}</td>
        <td>${p.valor.toFixed(4)}</td>
        <td>
          <button class="btn-primary editar" data-id="${docSnap.id}" data-tipo="producto">✏️</button>
          <button class="btn-delete eliminar" data-id="${docSnap.id}" data-tipo="producto">🗑️</button>
        </td>
      </tr>
    `;
  });
  actualizarEventos();
  actualizarSelects();
});

// ===================== CRUD FACTURAS =====================
const formFactura = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");

formFactura.addEventListener("submit", async (e) => {
  e.preventDefault();
  const numero = document.getElementById("numeroFactura").value.trim();
  const fecha = document.getElementById("fechaEmisionFactura").value;
  const proveedor = document.getElementById("proveedorFactura").value;
  const producto = document.getElementById("productoFactura").value;
  const monto = parseFloat(document.getElementById("montoFactura").value);
  const tipo = document.getElementById("tipoFactura").value;
  const moneda = document.getElementById("monedaFactura").value;

  if (!/^[0-9]+$/.test(numero)) return alert("El número de factura solo debe contener números.");

  await addDoc(facturasRef, { numero, fecha, proveedor, producto, monto, tipo, moneda });
  formFactura.reset();
});

onSnapshot(facturasRef, (snapshot) => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const f = docSnap.data();
    tablaFacturas.innerHTML += `
      <tr>
        <td>${f.numero}</td>
        <td><a href="#" class="detalle-proveedor" data-nombre="${f.proveedor}">${f.proveedor}</a></td>
        <td><a href="#" class="detalle-producto" data-nombre="${f.producto}">${f.producto}</a></td>
        <td>${f.moneda}${f.monto.toFixed(2)}</td>
        <td>${f.tipo}</td>
        <td>${f.fecha}</td>
        <td>
          <button class="btn-delete eliminar" data-id="${docSnap.id}" data-tipo="factura">🗑️</button>
        </td>
      </tr>
    `;
  });
  actualizarEventos();
});

// ===================== Actualizar Selects =====================
async function actualizarSelects() {
  const selProv = document.getElementById("proveedorFactura");
  const selProd = document.getElementById("productoFactura");

  selProv.innerHTML = "";
  const provs = await getDocs(proveedoresRef);
  provs.forEach((p) => selProv.innerHTML += `<option>${p.data().nombre}</option>`);

  selProd.innerHTML = "";
  const prods = await getDocs(productosRef);
  prods.forEach((p) => selProd.innerHTML += `<option>${p.data().nombre}</option>`);
}

// ===================== Buscador =====================
const buscador = document.getElementById("buscadorGlobal");
buscador.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const texto = buscador.value.trim().toLowerCase();
    if (!texto) return;

    const q = query(facturasRef, where("producto", "==", texto.toUpperCase()));
    const snapshot = await getDocs(facturasRef);

    tablaFacturas.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const f = docSnap.data();
      if (f.producto.toLowerCase().includes(texto)) {
        tablaFacturas.innerHTML += `
          <tr>
            <td>${f.numero}</td>
            <td>${f.proveedor}</td>
            <td>${f.producto}</td>
            <td>${f.moneda}${f.monto.toFixed(2)}</td>
            <td>${f.tipo}</td>
            <td>${f.fecha}</td>
            <td>
              <button class="btn-delete eliminar" data-id="${docSnap.id}" data-tipo="factura">🗑️</button>
            </td>
          </tr>`;
      }
    });

    if (!tablaFacturas.innerHTML) {
      tablaFacturas.innerHTML = `<tr><td colspan="7">❌ No se encontraron facturas con ese producto</td></tr>`;
    }
  }
});

// ===================== Modal Detalle =====================
const modal = document.getElementById("detalleModal");
const tituloModal = document.getElementById("tituloModal");
const contenidoModal = document.getElementById("contenidoModal");
const cerrarModal = document.getElementById("cerrarModal");

function mostrarModal(titulo, contenido) {
  tituloModal.textContent = titulo;
  contenidoModal.innerHTML = contenido;
  modal.style.display = "flex";
}
cerrarModal.addEventListener("click", () => (modal.style.display = "none"));

// ===================== Acciones =====================
function actualizarEventos() {
  document.querySelectorAll(".eliminar").forEach((btn) => {
    btn.onclick = async () => {
      const tipo = btn.dataset.tipo;
      const id = btn.dataset.id;
      const ref =
        tipo === "proveedor"
          ? doc(db, "proveedores", id)
          : tipo === "producto"
          ? doc(db, "productos", id)
          : doc(db, "facturas", id);
      await deleteDoc(ref);
    };
  });

  document.querySelectorAll(".detalle-proveedor").forEach((a) => {
    a.onclick = async () => {
      const nombre = a.dataset.nombre || a.textContent;
      const q = query(proveedoresRef, where("nombre", "==", nombre));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const p = snap.docs[0].data();
        mostrarModal("📦 Detalle del Proveedor", `
          <p><b>RUC:</b> ${p.ruc}</p>
          <p><b>Nombre:</b> ${p.nombre}</p>
          <p><b>Dirección:</b> ${p.direccion}</p>
        `);
      }
    };
  });

  document.querySelectorAll(".detalle-producto").forEach((a) => {
    a.onclick = async () => {
      const nombre = a.dataset.nombre || a.textContent;
      const q = query(productosRef, where("nombre", "==", nombre));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const p = snap.docs[0].data();
        mostrarModal("🐾 Detalle del Producto", `
          <p><b>Nombre:</b> ${p.nombre}</p>
          <p><b>Cantidad:</b> ${p.cantidad}</p>
          <p><b>Unidad:</b> ${p.unidad}</p>
          <p><b>Valor Unitario:</b> ${p.valor.toFixed(4)}</p>
        `);
      }
    };
  });
}






