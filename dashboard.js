// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// ===================== CONFIGURACIÓN FIREBASE =====================
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

// ===================== FUNCIÓN PARA TOAST =====================
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast-message ${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===================== VALIDAR SESIÓN =====================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});

// ===================== CERRAR SESIÓN =====================
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ===================== CRUD PROVEEDORES =====================
const provForm = document.getElementById("provForm");
const provTable = document.getElementById("provTableBody");

async function loadProveedores() {
  onSnapshot(collection(db, "proveedores"), (snapshot) => {
    provTable.innerHTML = "";
    snapshot.forEach((docu) => {
      const data = docu.data();
      const row = `
        <tr>
          <td>${data.tipoDoc}</td>
          <td>${data.nombre}</td>
          <td>${data.direccion}</td>
          <td>${data.telefono || "-"}</td>
          <td>
            <button class="btn-edit" data-id="${docu.id}" data-tipo="proveedor">✏️</button>
            <button class="btn-delete" data-id="${docu.id}" data-tipo="proveedor">🗑️</button>
          </td>
        </tr>`;
      provTable.innerHTML += row;
    });
  });
}

provForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const tipoDoc = provForm.tipoDoc.value;
  const nombre = provForm.nombre.value.trim();
  const direccion = provForm.direccion.value.trim();
  const telefono = provForm.telefono.value.trim();

  if (!nombre || !direccion) return showToast("Complete todos los campos", "error");

  await addDoc(collection(db, "proveedores"), { tipoDoc, nombre, direccion, telefono });
  provForm.reset();
  showToast("Proveedor registrado con éxito");
});

// ===================== CRUD PRODUCTOS =====================
const prodForm = document.getElementById("prodForm");
const prodTable = document.getElementById("prodTableBody");

async function loadProductos() {
  onSnapshot(collection(db, "productos"), (snapshot) => {
    prodTable.innerHTML = "";
    snapshot.forEach((docu) => {
      const data = docu.data();
      const row = `
        <tr>
          <td>${data.nombre}</td>
          <td>${data.presentacion} (${data.cantidad})</td>
          <td>${data.moneda === "PEN" ? "S/." : "$"} ${data.precio}</td>
          <td>${data.descripcion || "-"}</td>
          <td>
            <button class="btn-edit" data-id="${docu.id}" data-tipo="producto">✏️</button>
            <button class="btn-delete" data-id="${docu.id}" data-tipo="producto">🗑️</button>
          </td>
        </tr>`;
      prodTable.innerHTML += row;
    });
  });
}

prodForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = prodForm.nombre.value.trim();
  const presentacion = prodForm.presentacion.value;
  const cantidad = prodForm.cantidad.value;
  const precio = prodForm.precio.value;
  const descripcion = prodForm.descripcion.value.trim();
  const moneda = prodForm.moneda.value;

  if (!nombre || !presentacion || !precio) return showToast("Complete todos los campos", "error");

  await addDoc(collection(db, "productos"), {
    nombre, presentacion, cantidad, precio, descripcion, moneda
  });
  prodForm.reset();
  showToast("Producto registrado con éxito");
});

// ===================== CRUD FACTURAS =====================
const factForm = document.getElementById("factForm");
const factTable = document.getElementById("factTableBody");

async function loadFacturas() {
  onSnapshot(collection(db, "facturas"), (snapshot) => {
    factTable.innerHTML = "";
    snapshot.forEach((docu) => {
      const data = docu.data();
      const row = `
        <tr>
          <td>${data.idFactura}</td>
          <td>${data.fecha}</td>
          <td><a href="#" class="link-proveedor" data-prov="${data.proveedorId}">${data.proveedorNombre}</a></td>
          <td><a href="#" class="link-producto" data-prod="${data.productoId}">${data.productoNombre}</a></td>
          <td>${data.subtotal}</td>
          <td>${data.igv}</td>
          <td>${data.total}</td>
          <td>${data.tipo}</td>
          <td>
            <button class="btn-delete" data-id="${docu.id}" data-tipo="factura">🗑️</button>
          </td>
        </tr>`;
      factTable.innerHTML += row;
    });
  });
}

factForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const idFactura = factForm.idFactura.value.trim() || `F${Date.now()}`;
  const fecha = factForm.fecha.value;
  const tipo = factForm.tipo.value;
  const proveedorId = factForm.proveedor.value;
  const productoId = factForm.producto.value;
  const subtotal = parseFloat(factForm.subtotal.value);
  const igv = parseFloat(factForm.igv.value);
  const total = parseFloat(factForm.total.value);

  const proveedorNombre = factForm.proveedor.options[factForm.proveedor.selectedIndex].text;
  const productoNombre = factForm.producto.options[factForm.producto.selectedIndex].text;

  if (!fecha || !proveedorId || !productoId) return showToast("Complete todos los campos", "error");

  await addDoc(collection(db, "facturas"), {
    idFactura, fecha, tipo, proveedorId, proveedorNombre, productoId, productoNombre, subtotal, igv, total
  });
  factForm.reset();
  showToast("Factura registrada con éxito");
});

// ===================== ELIMINAR REGISTRO =====================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-delete")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    await deleteDoc(doc(db, tipo + "s", id));
    showToast(`${tipo} eliminado`, "error");
  }
});

// ===================== PANEL FLOTANTE DETALLE =====================
const infoPanel = document.getElementById("infoPanel");
const infoContent = document.getElementById("infoContent");
const closePanel = document.getElementById("closePanel");

closePanel?.addEventListener("click", () => {
  infoPanel.classList.remove("active");
});

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("link-proveedor")) {
    const provId = e.target.dataset.prov;
    const ref = doc(db, "proveedores", provId);
    const snap = await getDocs(collection(db, "proveedores"));
    snap.forEach(d => {
      if (d.id === provId) {
        const p = d.data();
        infoContent.innerHTML = `
          <h3>Proveedor</h3>
          <p><b>Tipo:</b> ${p.tipoDoc}</p>
          <p><b>Nombre:</b> ${p.nombre}</p>
          <p><b>Dirección:</b> ${p.direccion}</p>
          <p><b>Teléfono:</b> ${p.telefono || "-"}</p>`;
        infoPanel.classList.add("active");
      }
    });
  }
  if (e.target.classList.contains("link-producto")) {
    const prodId = e.target.dataset.prod;
    const snap = await getDocs(collection(db, "productos"));
    snap.forEach(d => {
      if (d.id === prodId) {
        const p = d.data();
        infoContent.innerHTML = `
          <h3>Producto</h3>
          <p><b>Nombre:</b> ${p.nombre}</p>
          <p><b>Presentación:</b> ${p.presentacion} (${p.cantidad})</p>
          <p><b>Precio:</b> ${p.moneda === "PEN" ? "S/." : "$"} ${p.precio}</p>
          <p><b>Descripción:</b> ${p.descripcion || "-"}</p>`;
        infoPanel.classList.add("active");
      }
    });
  }
});

// ===================== CARGAR TODO =====================
loadProveedores();
loadProductos();
loadFacturas();

