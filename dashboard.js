// ===================== CONFIGURACIÓN FIREBASE =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, query, updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  getAuth, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.firebasestorage.app",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322",
  measurementId: "G-0WMLRY8FGM"
};

// Inicialización
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Referencias a colecciones
const colProveedores = collection(db, "proveedores");
const colProductos = collection(db, "productos");
const colFacturas = collection(db, "facturas");

// ===================== VALIDAR SESIÓN =====================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});

// ===================== CERRAR SESIÓN =====================
document.getElementById("btnCerrarSesion").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

// ===================== NAVEGACIÓN =====================
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");

    document.querySelectorAll(".seccion").forEach(sec => sec.classList.remove("activa"));
    document.getElementById(btn.dataset.target).classList.add("activa");
  });
});

// ===================== REGISTRAR PROVEEDOR =====================
const formProveedor = document.getElementById("formProveedor");
formProveedor.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const data = {
      tipoDocumento: document.getElementById("tipoDocumentoProveedor").value.trim(),
      nombre: document.getElementById("nombreProveedor").value.trim(),
      direccion: document.getElementById("direccionProveedor").value.trim(),
      telefono: document.getElementById("telefonoProveedor").value.trim()
    };

    await addDoc(colProveedores, data);
    formProveedor.reset();
    alert("✅ Proveedor registrado correctamente");
  } catch (error) {
    console.error("Error al registrar proveedor:", error);
    alert("❌ Error al registrar proveedor. Revisa la consola.");
  }
});

// ===================== LISTAR PROVEEDORES =====================
const tablaProveedores = document.getElementById("tablaProveedores");
onSnapshot(colProveedores, (snapshot) => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach(docu => {
    const d = docu.data();
    const fila = `
      <tr>
        <td>${d.tipoDocumento}</td>
        <td>${d.nombre}</td>
        <td>${d.direccion || ""}</td>
        <td>${d.telefono || ""}</td>
        <td>
          <button class="btn-accion text-primary editar-proveedor" data-id="${docu.id}">✏️</button>
          <button class="btn-accion text-danger eliminar-proveedor" data-id="${docu.id}">🗑️</button>
        </td>
      </tr>
    `;
    tablaProveedores.innerHTML += fila;
  });

  document.getElementById("countProveedores").textContent = snapshot.size;
  actualizarSelectProveedores();
});

// ===================== REGISTRAR PRODUCTO =====================
const formProducto = document.getElementById("formProducto");
formProducto.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const presentacion = document.getElementById("presentacionProducto").value;
    const cantidad = parseInt(document.getElementById("cantidadPresentacion").value);

    const data = {
      nombre: document.getElementById("nombreProducto").value.trim(),
      cantidad,
      presentacion,
      precio: parseFloat(document.getElementById("precioProducto").value),
      moneda: document.getElementById("tipoMoneda").value,
      descripcion: document.getElementById("descripcionProducto").value.trim()
    };

    await addDoc(colProductos, data);
    formProducto.reset();
    alert("✅ Producto registrado correctamente");
  } catch (error) {
    console.error("Error al registrar producto:", error);
    alert("❌ Error al registrar producto.");
  }
});

// ===================== LISTAR PRODUCTOS =====================
const tablaProductos = document.getElementById("tablaProductos");
onSnapshot(colProductos, (snapshot) => {
  tablaProductos.innerHTML = "";
  snapshot.forEach(docu => {
    const d = docu.data();
    const fila = `
      <tr>
        <td>${d.nombre}</td>
        <td>${d.cantidad || 0} ${d.presentacion || ""}</td>
        <td>${d.precio.toFixed(2)} ${d.moneda}</td>
        <td>${d.descripcion || ""}</td>
        <td>
          <button class="btn-accion text-primary editar-producto" data-id="${docu.id}">✏️</button>
          <button class="btn-accion text-danger eliminar-producto" data-id="${docu.id}">🗑️</button>
        </td>
      </tr>
    `;
    tablaProductos.innerHTML += fila;
  });

  document.getElementById("countProductos").textContent = snapshot.size;
  actualizarSelectProductos();
});

// ===================== REGISTRAR FACTURA =====================
const formFactura = document.getElementById("formFactura");
formFactura.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const subtotal = parseFloat(document.getElementById("montoFactura").value);
    const igv = subtotal * 0.18;
    const total = subtotal + igv;

    const data = {
      fecha: document.getElementById("fechaFactura").value,
      tipo: document.getElementById("tipoFactura").value,
      proveedor: document.getElementById("proveedorFactura").value,
      producto: document.getElementById("productoFactura").value,
      subtotal,
      igv,
      total,
      detalle: document.getElementById("detalleAdicional").value.trim()
    };

    await addDoc(colFacturas, data);
    formFactura.reset();
    alert("✅ Factura registrada correctamente");
  } catch (error) {
    console.error("Error al registrar factura:", error);
    alert("❌ Error al registrar factura.");
  }
});

// ===================== LISTAR FACTURAS =====================
const tablaFacturas = document.getElementById("tablaFacturas");
onSnapshot(colFacturas, (snapshot) => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(docu => {
    const d = docu.data();
    const fila = `
      <tr>
        <td>${docu.id}</td>
        <td>${d.fecha}</td>
        <td>${d.proveedor}</td>
        <td>${d.producto}</td>
        <td>${d.subtotal.toFixed(2)}</td>
        <td>${d.igv.toFixed(2)}</td>
        <td>${d.total.toFixed(2)}</td>
        <td>${d.tipo}</td>
        <td>
          <button class="btn-accion text-danger eliminar-factura" data-id="${docu.id}">🗑️</button>
        </td>
      </tr>
    `;
    tablaFacturas.innerHTML += fila;
  });

  document.getElementById("countFacturas").textContent = snapshot.size;
});

// ===================== FUNCIONES DE APOYO =====================
function actualizarSelectProveedores() {
  const select = document.getElementById("proveedorFactura");
  getDocs(colProveedores).then(snapshot => {
    select.innerHTML = "<option value=''>Seleccione proveedor</option>";
    snapshot.forEach(docu => {
      const d = docu.data();
      const opt = document.createElement("option");
      opt.value = d.nombre;
      opt.textContent = d.nombre;
      select.appendChild(opt);
    });
  });
}

function actualizarSelectProductos() {
  const select = document.getElementById("productoFactura");
  getDocs(colProductos).then(snapshot => {
    select.innerHTML = "<option value=''>Seleccione producto</option>";
    snapshot.forEach(docu => {
      const d = docu.data();
      const opt = document.createElement("option");
      opt.value = d.nombre;
      opt.textContent = `${d.nombre} (${d.cantidad} ${d.presentacion})`;
      select.appendChild(opt);
    });
  });
}

// ===================== BUSCADOR GLOBAL =====================
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

searchInput.addEventListener("input", async () => {
  const text = searchInput.value.toLowerCase();
  if (!text) {
    searchResults.innerHTML = "";
    return;
  }

  const [prodSnap, factSnap] = await Promise.all([
    getDocs(colProductos),
    getDocs(colFacturas)
  ]);

  let results = [];

  prodSnap.forEach(docu => {
    const d = docu.data();
    if (d.nombre.toLowerCase().includes(text)) {
      results.push(`<div class="resultado-item">📦 ${d.nombre} (${d.cantidad} ${d.presentacion})</div>`);
    }
  });

  factSnap.forEach(docu => {
    const d = docu.data();
    if (d.proveedor.toLowerCase().includes(text) || d.producto.toLowerCase().includes(text)) {
      results.push(`<div class="resultado-item">🧾 Factura: ${d.proveedor} - ${d.producto}</div>`);
    }
  });

  searchResults.innerHTML = results.join("") || "<div class='text-muted'>Sin resultados...</div>";
});

