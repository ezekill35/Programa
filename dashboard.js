// ==============================
// 🔥 Importar módulos de Firebase
// ==============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ==============================
// 🔧 Configuración Firebase
// ==============================
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.firebasestorage.app",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322",
  measurementId: "G-0WMLRY8FGM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==============================
// 🚪 Cerrar sesión
// ==============================
document.getElementById("logout").addEventListener("click", () => {
  window.location.href = "index.html";
});

// ==============================
// 📊 Menú lateral dinámico
// ==============================
const buttons = document.querySelectorAll(".menu button");
const secciones = document.querySelectorAll(".seccion");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const target = btn.getAttribute("data-section");
    secciones.forEach((sec) => {
      sec.classList.remove("visible");
      if (sec.id === target) sec.classList.add("visible");
    });
  });
});

// ==============================
// 🏪 PROVEEDORES
// ==============================
const formProv = document.getElementById("formProveedores");
const tablaProv = document.getElementById("tablaProveedores");

formProv.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("provNombre").value.trim();
  const producto = document.getElementById("provProducto").value.trim();
  const ruc = document.getElementById("provRUC").value.trim();
  const direccion = document.getElementById("provDireccion").value.trim();

  if (!/^\d+$/.test(ruc)) return alert("⚠️ El RUC solo puede contener números");

  try {
    await addDoc(collection(db, "proveedores"), { nombre, producto, ruc, direccion });
    formProv.reset();
    alert("✅ Proveedor agregado correctamente a la base de datos");
  } catch (err) {
    alert("❌ Error al agregar proveedor: " + err.message);
  }
});

onSnapshot(collection(db, "proveedores"), (snapshot) => {
  tablaProv.innerHTML = "";
  snapshot.forEach((docu) => {
    const d = docu.data();
    const fila = `
      <tr>
        <td>${d.nombre}</td>
        <td>${d.producto}</td>
        <td>${d.ruc}</td>
        <td>${d.direccion}</td>
        <td><button class="btn-del" data-id="${docu.id}">🗑️</button></td>
      </tr>`;
    tablaProv.innerHTML += fila;
  });
  actualizarReportes();
  actualizarSelectProveedores();
});

tablaProv.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-del")) {
    const id = e.target.getAttribute("data-id");
    await deleteDoc(doc(db, "proveedores", id));
    alert("🗑️ Proveedor eliminado correctamente");
  }
});

// ==============================
// 📑 FACTURAS
// ==============================
const formFact = document.getElementById("formFacturas");
const tablaFact = document.getElementById("tablaFacturas");
const selectProv = document.getElementById("factProveedor");

async function actualizarSelectProveedores() {
  const snapshot = await getDocs(collection(db, "proveedores"));
  selectProv.innerHTML = `<option value="">-- Selecciona proveedor --</option>`;
  snapshot.forEach((docu) => {
    selectProv.innerHTML += `<option value="${docu.data().nombre}">${docu.data().nombre}</option>`;
  });
}

formFact.addEventListener("submit", async (e) => {
  e.preventDefault();
  const proveedor = selectProv.value;
  const tipo = document.getElementById("factTipo").value.trim();
  const monto = parseFloat(document.getElementById("factMonto").value);
  const fecha = document.getElementById("factFecha").value;
  const descripcion = document.getElementById("factDescripcion").value.trim();

  try {
    await addDoc(collection(db, "facturas"), { proveedor, tipo, monto, fecha, descripcion, moneda: "S/." });
    formFact.reset();
    alert("✅ Factura agregada correctamente a la base de datos");
  } catch (err) {
    alert("❌ Error al agregar factura: " + err.message);
  }
});

onSnapshot(collection(db, "facturas"), (snapshot) => {
  tablaFact.innerHTML = "";
  snapshot.forEach((docu) => {
    const f = docu.data();
    const fila = `
      <tr>
        <td>${f.proveedor}</td>
        <td>${f.tipo}</td>
        <td>S/. ${f.monto.toFixed(2)}</td>
        <td>${f.fecha}</td>
        <td>${f.descripcion}</td>
        <td><button class="btn-del" data-col="facturas" data-id="${docu.id}">🗑️</button></td>
      </tr>`;
    tablaFact.innerHTML += fila;
  });
  actualizarReportes();
});

tablaFact.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-del")) {
    const id = e.target.getAttribute("data-id");
    await deleteDoc(doc(db, "facturas", id));
    alert("🗑️ Factura eliminada correctamente");
  }
});

// ==============================
// 💰 GASTOS
// ==============================
const formGasto = document.getElementById("formGastos");
const tablaGasto = document.getElementById("tablaGastos");

formGasto.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("gastoNombre").value.trim();
  const tipo = document.getElementById("gastoTipo").value.trim();
  const monto = parseFloat(document.getElementById("gastoMonto").value);
  const fecha = document.getElementById("gastoFecha").value;

  try {
    await addDoc(collection(db, "gastos"), { nombre, tipo, monto, fecha });
    formGasto.reset();
    alert("✅ Gasto agregado correctamente a la base de datos");
  } catch (err) {
    alert("❌ Error al agregar gasto: " + err.message);
  }
});

onSnapshot(collection(db, "gastos"), (snapshot) => {
  tablaGasto.innerHTML = "";
  snapshot.forEach((docu) => {
    const g = docu.data();
    const fila = `
      <tr>
        <td>${g.nombre}</td>
        <td>${g.tipo}</td>
        <td>S/. ${g.monto.toFixed(2)}</td>
        <td>${g.fecha}</td>
        <td><button class="btn-del" data-id="${docu.id}" data-col="gastos">🗑️</button></td>
      </tr>`;
    tablaGasto.innerHTML += fila;
  });
  actualizarReportes();
});

tablaGasto.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-del")) {
    const id = e.target.getAttribute("data-id");
    await deleteDoc(doc(db, "gastos", id));
    alert("🗑️ Gasto eliminado correctamente");
  }
});

// ==============================
// 🛠 SERVICIOS
// ==============================
const formServ = document.getElementById("formServicios");
const tablaServ = document.getElementById("tablaServicios");

formServ.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("servNombre").value.trim();
  const precio = parseFloat(document.getElementById("servPrecio").value);
  const fecha = document.getElementById("servFecha").value;
  const descripcion = document.getElementById("servDescripcion").value.trim();

  try {
    await addDoc(collection(db, "servicios"), { nombre, precio, fecha, descripcion });
    formServ.reset();
    alert("✅ Servicio agregado correctamente a la base de datos");
  } catch (err) {
    alert("❌ Error al agregar servicio: " + err.message);
  }
});

onSnapshot(collection(db, "servicios"), (snapshot) => {
  tablaServ.innerHTML = "";
  snapshot.forEach((docu) => {
    const s = docu.data();
    const fila = `
      <tr>
        <td>${s.nombre}</td>
        <td>S/. ${s.precio.toFixed(2)}</td>
        <td>${s.fecha}</td>
        <td>${s.descripcion}</td>
        <td><button class="btn-del" data-id="${docu.id}" data-col="servicios">🗑️</button></td>
      </tr>`;
    tablaServ.innerHTML += fila;
  });
  actualizarReportes();
});

// ==============================
// 📈 REPORTES
// ==============================
async function actualizarReportes() {
  const prov = (await getDocs(collection(db, "proveedores"))).size;
  const fact = (await getDocs(collection(db, "facturas"))).size;
  const gast = (await getDocs(collection(db, "gastos"))).size;
  const serv = (await getDocs(collection(db, "servicios"))).size;
  document.getElementById("repProveedores").textContent = prov;
  document.getElementById("repFacturas").textContent = fact;
  document.getElementById("repGastos").textContent = gast;
  document.getElementById("repServicios").textContent = serv;
}









