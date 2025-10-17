// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, query, where, updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:abcd1234efgh5678"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ===================== COLECCIONES =====================
const colProveedores = collection(db, "proveedores");
const colProductos = collection(db, "productos");
const colFacturas = collection(db, "facturas");

// ===================== ELEMENTOS =====================
const tablaProveedores = document.getElementById("tablaProveedores");
const tablaProductos = document.getElementById("tablaProductos");
const tablaFacturas = document.getElementById("tablaFacturas");

const countFacturas = document.getElementById("countFacturas");
const countProveedores = document.getElementById("countProveedores");
const countProductos = document.getElementById("countProductos");

const buscador = document.getElementById("searchInput");
const panelFacturas = document.getElementById("searchResults");

// ===================== MODAL EDITAR =====================
const modalEditar = document.getElementById("modalEditar");
const camposEditar = document.getElementById("camposEditar");
const formEditar = document.getElementById("formEditar");
const cerrarModalEditar = document.getElementById("cerrarModalEditar");

// ===================== CERRAR SESIÓN =====================
document.getElementById("btnCerrarSesion").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ===================== NAVEGACIÓN =====================
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("activo"));
    document.querySelectorAll(".seccion").forEach(s => s.classList.remove("activa"));
    btn.classList.add("activo");
    document.getElementById(btn.dataset.target).classList.add("activa");

    if (btn.dataset.target === "facturas") {
      buscador.style.display = "block";
    } else {
      buscador.style.display = "none";
      buscador.value = "";
      panelFacturas.innerHTML = "";
    }
  });
});

// ===================== CARGAR SELECTS =====================
async function cargarProveedoresSelect() {
  const select = document.getElementById("proveedorFactura");
  select.innerHTML = '<option value="">Seleccionar proveedor</option>';
  const snap = await getDocs(colProveedores);
  snap.forEach(docu => {
    const d = docu.data();
    const opt = document.createElement("option");
    opt.value = d.nombre;
    opt.textContent = d.nombre;
    select.appendChild(opt);
  });
}

async function cargarProductosSelect() {
  const select = document.getElementById("productoFactura");
  select.innerHTML = '<option value="">Seleccionar producto</option>';
  const snap = await getDocs(colProductos);
  snap.forEach(docu => {
    const d = docu.data();
    const opt = document.createElement("option");
    opt.value = d.nombre;
    opt.textContent = d.nombre;
    select.appendChild(opt);
  });
}

// ===================== ON SNAPSHOT TABLAS =====================
onSnapshot(colProveedores, snapshot => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach(docu => {
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${d.ruc}</td><td>${d.nombre}</td><td>${d.direccion || ""}</td><td>${d.telefono || ""}</td>
      <td>
        <button class="btn-accion text-primary" onclick='abrirModalEditar("proveedores","${docu.id}",${JSON.stringify(d).replaceAll('"','&quot;')})'>✏️</button>
        <button class="btn-accion text-danger" onclick='eliminar("proveedores","${docu.id}")'>🗑️</button>
      </td>`;
    tablaProveedores.appendChild(tr);
  });
  countProveedores.textContent = snapshot.size;
  cargarProveedoresSelect();
});

onSnapshot(colProductos, snapshot => {
  tablaProductos.innerHTML = "";
  snapshot.forEach(docu => {
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${d.nombre}</td><td>${d.cantidad}</td><td>${d.precio}</td><td>${d.descripcion || ""}</td>
      <td>
        <button class="btn-accion text-primary" onclick='abrirModalEditar("productos","${docu.id}",${JSON.stringify(d).replaceAll('"','&quot;')})'>✏️</button>
        <button class="btn-accion text-danger" onclick='eliminar("productos","${docu.id}")'>🗑️</button>
      </td>`;
    tablaProductos.appendChild(tr);
  });
  countProductos.textContent = snapshot.size;
  cargarProductosSelect();
});

onSnapshot(colFacturas, snapshot => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(docu => {
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${d.idFactura}</td><td>${d.fecha}</td><td>${d.proveedor}</td><td>${d.producto}</td><td>${d.monto}</td><td>${d.tipo}</td>
      <td>
        <button class="btn-accion text-primary" onclick='abrirModalEditar("facturas","${docu.id}",${JSON.stringify(d).replaceAll('"','&quot;')})'>✏️</button>
        <button class="btn-accion text-danger" onclick='eliminar("facturas","${docu.id}")'>🗑️</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  });
  countFacturas.textContent = snapshot.size;
});

// ===================== ABRIR MODAL EDITAR =====================
window.abrirModalEditar = (tipo, id, datos) => {
  camposEditar.innerHTML = "";
  modalEditar.dataset.tipo = tipo;
  modalEditar.dataset.id = id;

  modalEditar.style.transform = "translateY(-50px) scale(0.95)";
  modalEditar.style.opacity = "0";

  for (const key in datos) {
    const value = datos[key];
    const div = document.createElement("div");
    div.className = "col-12 mb-2";
    div.innerHTML = `
      <label class="form-label">${key}</label>
      <input type="text" class="form-control" name="${key}" value="${value}">
    `;
    camposEditar.appendChild(div);
  }

  modalEditar.showModal();
  setTimeout(() => {
    modalEditar.style.transform = "translateY(0) scale(1)";
    modalEditar.style.opacity = "1";
  }, 10);
};

// ===================== GUARDAR CAMBIOS =====================
formEditar.addEventListener("submit", async e => {
  e.preventDefault();
  const tipo = modalEditar.dataset.tipo;
  const id = modalEditar.dataset.id;

  const data = {};
  new FormData(formEditar).forEach((value, key) => data[key] = value);

  await updateDoc(doc(db, tipo, id), data);

  modalEditar.style.transform = "translateY(-50px) scale(0.95)";
  modalEditar.style.opacity = 0;
  setTimeout(() => modalEditar.close(), 400);
});

// ===================== CERRAR MODAL =====================
cerrarModalEditar.addEventListener("click", () => {
  modalEditar.style.transform = "translateY(-50px) scale(0.95)";
  modalEditar.style.opacity = 0;
  setTimeout(() => modalEditar.close(), 400);
});

// ===================== ELIMINAR =====================
window.eliminar = async (col, id) => {
  if (confirm("¿Deseas eliminar este registro?")) {
    await deleteDoc(doc(db, col, id));
  }
};

// ===================== BUSCADOR FACTURAS =====================
buscador.addEventListener("input", async () => {
  const texto = buscador.value.toLowerCase();
  panelFacturas.innerHTML = "";
  if (!texto) return;

  const snap = await getDocs(colFacturas);
  snap.forEach(docu => {
    const f = docu.data();
    if (f.producto.toLowerCase().includes(texto)) {
      const div = document.createElement("div");
      div.className = "resultado-item";
      div.textContent = f.idFactura;
      div.onclick = () => abrirModalEditar("facturas", docu.id, f);
      panelFacturas.appendChild(div);
    }
  });
});
