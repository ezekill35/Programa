// =======================
// 🔥 Importar Firebase
// =======================
import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, getDocs, query, where 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
  getAuth, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// =======================
// ⚙️ Configuración Firebase
// =======================
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// =======================
// 🔒 Verificar sesión
// =======================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});

// =======================
// 🚪 Cerrar sesión
// =======================
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// =======================
// 🧭 Navegación secciones
// =======================
const menuBtns = document.querySelectorAll(".menu-btn");
menuBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    menuBtns.forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    const target = btn.getAttribute("data-target");
    document.querySelectorAll(".seccion").forEach(sec => sec.classList.remove("activa"));
    document.getElementById(target).classList.add("activa");
  });
});

// =======================
// 🏢 CRUD: Proveedores
// =======================
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");

proveedorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    ruc: proveedorForm.rucProveedor.value.trim(),
    nombre: proveedorForm.nombreProveedor.value.trim(),
    direccion: proveedorForm.direccionProveedor.value.trim(),
    telefono: proveedorForm.telefonoProveedor.value.trim()
  };
  await addDoc(collection(db, "proveedores"), data);
  proveedorForm.reset();
});

onSnapshot(collection(db, "proveedores"), (snapshot) => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach((docu) => {
    const p = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.ruc}</td>
      <td>${p.nombre}</td>
      <td>${p.direccion || "-"}</td>
      <td>${p.telefono || "-"}</td>
      <td><button class="btn secondary" data-id="${docu.id}" data-col="proveedores">🗑</button></td>
    `;
    tablaProveedores.appendChild(tr);
  });
});

// =======================
// 📦 CRUD: Productos
// =======================
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");

productoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    nombre: productoForm.nombreProducto.value.trim(),
    cantidad: Number(productoForm.cantidadProducto.value),
    precio: Number(productoForm.precioProducto.value),
    descripcion: productoForm.descripcionProducto.value.trim()
  };
  await addDoc(collection(db, "productos"), data);
  productoForm.reset();
});

onSnapshot(collection(db, "productos"), (snapshot) => {
  tablaProductos.innerHTML = "";
  const selectProd = document.getElementById("productoFactura");
  selectProd.innerHTML = '<option value="">Seleccione producto</option>';
  snapshot.forEach((docu) => {
    const p = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.cantidad}</td>
      <td>S/. ${p.precio}</td>
      <td>${p.descripcion || "-"}</td>
      <td><button class="btn secondary" data-id="${docu.id}" data-col="productos">🗑</button></td>
    `;
    tablaProductos.appendChild(tr);
    const opt = document.createElement("option");
    opt.value = p.nombre;
    opt.textContent = p.nombre;
    selectProd.appendChild(opt);
  });
});

// =======================
// 🧾 CRUD: Facturas
// =======================
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");

facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const idFactura = "F-" + Date.now();
  const data = {
    idFactura,
    fecha: facturaForm.fechaFactura.value,
    proveedor: facturaForm.proveedorFactura.value,
    producto: facturaForm.productoFactura.value,
    monto: Number(facturaForm.montoFactura.value),
    tipo: facturaForm.tipoFactura.value
  };
  await addDoc(collection(db, "facturas"), data);
  facturaForm.reset();
});

onSnapshot(collection(db, "facturas"), (snapshot) => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach((docu) => {
    const f = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.idFactura}</td>
      <td>${f.fecha}</td>
      <td>${f.proveedor}</td>
      <td>${f.producto}</td>
      <td>S/. ${f.monto}</td>
      <td>${f.tipo}</td>
      <td><button class="btn secondary" data-id="${docu.id}" data-col="facturas">🗑</button></td>
    `;
    tablaFacturas.appendChild(tr);
  });
});

// =======================
// 🗑 Eliminar documentos
// =======================
document.addEventListener("click", async (e) => {
  if (e.target.matches(".btn.secondary[data-id]")) {
    const id = e.target.getAttribute("data-id");
    const col = e.target.getAttribute("data-col");
    await deleteDoc(doc(db, col, id));
  }
});

// =======================
// 🔍 Buscador por producto
// =======================
const buscadorFactura = document.getElementById("buscadorFactura");
const modal = document.getElementById("modalDetalle");
const modalContenido = document.getElementById("modalContenido");
const btnRefresh = document.getElementById("btnRefresh");

buscadorFactura.addEventListener("keypress", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const term = buscadorFactura.value.trim().toLowerCase();
    if (!term) return;

    const q = query(collection(db, "facturas"), where("producto", "==", term));
    const docsSnap = await getDocs(q);

    if (docsSnap.empty) {
      modalContenido.innerHTML = `<p>No se encontraron facturas relacionadas al producto <b>${term}</b>.</p>`;
    } else {
      let html = `<h3>Facturas de producto: ${term}</h3>
        <table><thead><tr><th>ID</th><th>Fecha</th><th>Proveedor</th><th>Monto</th><th>Tipo</th></tr></thead><tbody>`;
      docsSnap.forEach((docu) => {
        const f = docu.data();
        html += `<tr><td>${f.idFactura}</td><td>${f.fecha}</td><td>${f.proveedor}</td><td>S/. ${f.monto}</td><td>${f.tipo}</td></tr>`;
      });
      html += "</tbody></table>";
      modalContenido.innerHTML = html;
    }

    modal.classList.add("show");
  }
});

// Restablecer modal
btnRefresh.addEventListener("click", () => {
  buscadorFactura.value = "";
  modal.classList.remove("show");
});

// =======================
// 📋 Cargar proveedores a facturas
// =======================
onSnapshot(collection(db, "proveedores"), (snapshot) => {
  const selectProv = document.getElementById("proveedorFactura");
  selectProv.innerHTML = '<option value="">Seleccione proveedor</option>';
  snapshot.forEach((docu) => {
    const p = docu.data();
    const opt = document.createElement("option");
    opt.value = p.nombre;
    opt.textContent = p.nombre;
    selectProv.appendChild(opt);
  });
});

