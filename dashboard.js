// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Configuración Firebase
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

// ---------------------- MENU ----------------------
const menuItems = document.querySelectorAll(".sidebar ul li");
const sections = document.querySelectorAll(".section");

menuItems.forEach(item => {
  item.addEventListener("click", () => {
    menuItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    sections.forEach(sec => sec.classList.remove("active"));
    if(item.id === "menu-reportes") document.getElementById("reportes").classList.add("active");
    if(item.id === "menu-proveedores") document.getElementById("proveedores").classList.add("active");
    if(item.id === "menu-facturas") document.getElementById("facturas").classList.add("active");
    if(item.id === "menu-gastos") document.getElementById("gastos").classList.add("active");
    if(item.id === "menu-servicios") document.getElementById("servicios").classList.add("active");
    if(item.id === "menu-logout") signOut(auth).then(()=> window.location = "index.html");
  });
});

// ---------------------- REPORTES ----------------------
async function actualizarReportes() {
  const proveedores = await getDocs(collection(db, "proveedores"));
  const facturas = await getDocs(collection(db, "facturas"));
  const gastos = await getDocs(collection(db, "gastos"));
  const servicios = await getDocs(collection(db, "servicios"));

  document.getElementById("total-proveedores").innerText = proveedores.size;
  document.getElementById("total-facturas").innerText = facturas.size;
  document.getElementById("total-gastos").innerText = gastos.size;
  document.getElementById("total-servicios").innerText = servicios.size;
}
actualizarReportes();

// ---------------------- PROVEEDORES ----------------------
const listaProveedores = document.getElementById("listaProveedores");
const selectProveedores = document.getElementById("facRucProveedor");

async function listarProveedores() {
  listaProveedores.innerHTML = "";
  selectProveedores.innerHTML = `<option value="">-- Selecciona un Proveedor --</option>`;
  
  const snapshot = await getDocs(collection(db, "proveedores"));
  snapshot.forEach(docSnap => {
    const p = docSnap.data();
    listaProveedores.innerHTML += `
      <tr>
        <td>${p.ruc}</td>
        <td>${p.nombre}</td>
        <td>${p.direccion}</td>
        <td>${p.correo}</td>
        <td>${p.telefono}</td>
        <td>${p.producto}</td>
        <td><button onclick="eliminarProveedor('${docSnap.id}')">🗑</button></td>
      </tr>
    `;
    selectProveedores.innerHTML += `<option value="${p.ruc}">${p.nombre}</option>`;
  });
}
listarProveedores();

window.eliminarProveedor = async (id) => {
  await deleteDoc(doc(db, "proveedores", id));
  listarProveedores();
  actualizarReportes();
};

document.getElementById("btnAgregarProveedor").addEventListener("click", async () => {
  const ruc = document.getElementById("provRuc").value;
  const nombre = document.getElementById("provNombre").value;
  const direccion = document.getElementById("provDireccion").value;
  const correo = document.getElementById("provCorreo").value;
  const telefono = document.getElementById("provTelefono").value;
  const producto = document.getElementById("provProducto").value;

  if(ruc && nombre){
    await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion, correo, telefono, producto });
    listarProveedores();
    actualizarReportes();
  }
});

// ---------------------- FACTURAS ----------------------
const listaFacturas = document.getElementById("listaFacturas");

async function listarFacturas() {
  listaFacturas.innerHTML = "";
  const snapshot = await getDocs(collection(db, "facturas"));
  snapshot.forEach(docSnap => {
    const f = docSnap.data();
    listaFacturas.innerHTML += `
      <tr>
        <td>${f.proveedor}</td>
        <td>${f.tipo}</td>
        <td>${f.descripcion}</td>
        <td>${f.fecha}</td>
        <td>${f.monto}</td>
        <td><button onclick="eliminarFactura('${docSnap.id}')">🗑</button></td>
      </tr>
    `;
  });
}
listarFacturas();

window.eliminarFactura = async (id) => {
  await deleteDoc(doc(db, "facturas", id));
  listarFacturas();
  actualizarReportes();
};

document.getElementById("btnAgregarFactura").addEventListener("click", async () => {
  const proveedor = document.getElementById("facRucProveedor").value;
  const tipo = document.getElementById("facTipo").value;
  const descripcion = document.getElementById("facDescripcion").value;
  const fecha = document.getElementById("facFecha").value;
  const monto = document.getElementById("facMonto").value;

  if(proveedor && tipo){
    await addDoc(collection(db, "facturas"), { proveedor, tipo, descripcion, fecha, monto });
    listarFacturas();
    actualizarReportes();
  }
});

// ---------------------- GASTOS ----------------------
const listaGastos = document.getElementById("listaGastos");

async function listarGastos() {
  listaGastos.innerHTML = "";
  const snapshot = await getDocs(collection(db, "gastos"));
  snapshot.forEach(docSnap => {
    const g = docSnap.data();
    listaGastos.innerHTML += `
      <tr>
        <td>${g.nombre}</td>
        <td>${g.tipo}</td>
        <td>${g.monto}</td>
        <td>${g.fecha}</td>
        <td><button onclick="eliminarGasto('${docSnap.id}')">🗑</button></td>
      </tr>
    `;
  });
}
listarGastos();

window.eliminarGasto = async (id) => {
  await deleteDoc(doc(db, "gastos", id));
  listarGastos();
  actualizarReportes();
};

document.getElementById("btnAgregarGasto").addEventListener("click", async () => {
  const nombre = document.getElementById("gastoNombre").value;
  const tipo = document.getElementById("gastoTipo").value;
  const monto = document.getElementById("gastoMonto").value;
  const fecha = document.getElementById("gastoFecha").value;

  if(nombre && tipo){
    await addDoc(collection(db, "gastos"), { nombre, tipo, monto, fecha });
    listarGastos();
    actualizarReportes();
  }
});

// ---------------------- SERVICIOS ----------------------
const listaServicios = document.getElementById("listaServicios");

async function listarServicios() {
  listaServicios.innerHTML = "";
  const snapshot = await getDocs(collection(db, "servicios"));
  snapshot.forEach(docSnap => {
    const s = docSnap.data();
    listaServicios.innerHTML += `
      <tr>
        <td>${s.nombre}</td>
        <td>${s.descripcion}</td>
        <td>${s.fecha}</td>
        <td>${s.precio}</td>
        <td><button onclick="eliminarServicio('${docSnap.id}')">🗑</button></td>
      </tr>
    `;
  });
}
listarServicios();

window.eliminarServicio = async (id) => {
  await deleteDoc(doc(db, "servicios", id));
  listarServicios();
  actualizarReportes();
};

document.getElementById("btnAgregarServicio").addEventListener("click", async () => {
  const nombre = document.getElementById("servNombre").value;
  const descripcion = document.getElementById("servDescripcion").value;
  const fecha = document.getElementById("servFecha").value;
  const precio = document.getElementById("servPrecio").value;

  if(nombre && fecha){
    await addDoc(collection(db, "servicios"), { nombre, descripcion, fecha, precio });
    listarServicios();
    actualizarReportes();
  }
});

// ---------------------- BUSCADOR GLOBAL ----------------------
const buscadorGlobal = document.getElementById("buscadorGlobal");

buscadorGlobal.addEventListener("input", () => {
  const filtro = buscadorGlobal.value.toLowerCase();

  ["#listaProveedores", "#listaFacturas", "#listaGastos", "#listaServicios"].forEach(id => {
    document.querySelectorAll(`${id} tr`).forEach(tr => {
      tr.style.display = tr.innerText.toLowerCase().includes(filtro) ? "" : "none";
    });
  });
});





