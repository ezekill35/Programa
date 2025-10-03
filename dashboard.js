// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Configuración Firebase (Discovery Pets)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ---------------------- MENU LATERAL ----------------------
const menuItems = document.querySelectorAll('.sidebar ul li');
const sections = document.querySelectorAll('.section');

menuItems.forEach(item => {
  item.addEventListener('click', () => {
    menuItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    const idMap = {
      'menu-reportes': 'reportes',
      'menu-proveedores': 'proveedores',
      'menu-facturas': 'facturas',
      'menu-gastos': 'gastos',
      'menu-servicios': 'servicios'
    };

    const targetSectionId = idMap[item.id];

    sections.forEach(sec => {
      sec.classList.toggle('active', sec.id === targetSectionId);
    });

    if(item.id === "menu-logout") {
      signOut(auth).then(() => window.location = "index.html");
    }
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
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.ruc}</td>
      <td>${p.nombre}</td>
      <td>${p.direccion}</td>
      <td>${p.correo}</td>
      <td>${p.telefono}</td>
      <td>${p.producto || ""}</td>
      <td><button onclick="eliminarProveedor('${docSnap.id}')">❌</button></td>
    `;
    listaProveedores.appendChild(tr);

    selectProveedores.innerHTML += `<option value="${p.ruc}">${p.nombre}</option>`;
  });
  actualizarReportes();
}

window.eliminarProveedor = async (id) => {
  await deleteDoc(doc(db, "proveedores", id));
  listarProveedores();
};

document.getElementById("btnAgregarProveedor").addEventListener("click", async () => {
  const ruc = document.getElementById("provRuc").value;
  const nombre = document.getElementById("provNombre").value;
  const direccion = document.getElementById("provDireccion").value;
  const correo = document.getElementById("provCorreo").value;
  const telefono = document.getElementById("provTelefono").value;
  const producto = document.getElementById("provProducto").value;

  if(!ruc || !nombre) return alert("RUC y Nombre son obligatorios");

  await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion, correo, telefono, producto });
  listarProveedores();
});

// ---------------------- FACTURAS ----------------------
const listaFacturas = document.getElementById("listaFacturas");

async function listarFacturas() {
  listaFacturas.innerHTML = "";
  const snapshot = await getDocs(collection(db, "facturas"));
  snapshot.forEach(docSnap => {
    const f = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.rucProveedor}</td>
      <td>${f.nombreProveedor || ""}</td>
      <td>${f.tipo}</td>
      <td>${f.descripcion || ""}</td>
      <td>${f.fecha}</td>
      <td>${f.monto}</td>
      <td><button onclick="eliminarFactura('${docSnap.id}')">❌</button></td>
    `;
    listaFacturas.appendChild(tr);
  });
  actualizarReportes();
}

window.eliminarFactura = async (id) => {
  await deleteDoc(doc(db, "facturas", id));
  listarFacturas();
};

document.getElementById("btnAgregarFactura").addEventListener("click", async () => {
  const rucProveedor = document.getElementById("facRucProveedor").value;
  const tipo = document.getElementById("facTipo").value;
  const descripcion = document.getElementById("facDescripcion").value;
  const fecha = document.getElementById("facFecha").value;
  const monto = document.getElementById("facMonto").value;

  if(!rucProveedor) return alert("Debe seleccionar un proveedor");

  // Obtener nombre del proveedor
  let nombreProveedor = "";
  const q = query(collection(db, "proveedores"), where("ruc", "==", rucProveedor));
  const snapshot = await getDocs(q);
  snapshot.forEach(docSnap => { nombreProveedor = docSnap.data().nombre; });

  await addDoc(collection(db, "facturas"), { rucProveedor, nombreProveedor, tipo, descripcion, fecha, monto });
  listarFacturas();
});

// ---------------------- GASTOS ----------------------
const listaGastos = document.getElementById("listaGastos");

async function listarGastos() {
  listaGastos.innerHTML = "";
  const snapshot = await getDocs(collection(db, "gastos"));
  snapshot.forEach(docSnap => {
    const g = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${g.nombre}</td>
      <td>${g.tipo}</td>
      <td>${g.monto}</td>
      <td>${g.fecha}</td>
      <td><button onclick="eliminarGasto('${docSnap.id}')">❌</button></td>
    `;
    listaGastos.appendChild(tr);
  });
  actualizarReportes();
}

window.eliminarGasto = async (id) => {
  await deleteDoc(doc(db, "gastos", id));
  listarGastos();
};

document.getElementById("btnAgregarGasto").addEventListener("click", async () => {
  const nombre = document.getElementById("gastoNombre").value;
  const tipo = document.getElementById("gastoTipo").value;
  const monto = document.getElementById("gastoMonto").value;
  const fecha = document.getElementById("gastoFecha").value;

  if(!tipo) return alert("Tipo es obligatorio");

  await addDoc(collection(db, "gastos"), { nombre, tipo, monto, fecha });
  listarGastos();
});

// ---------------------- SERVICIOS ----------------------
const listaServicios = document.getElementById("listaServicios");

async function listarServicios() {
  listaServicios.innerHTML = "";
  const snapshot = await getDocs(collection(db, "servicios"));
  snapshot.forEach(docSnap => {
    const s = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.nombre}</td>
      <td>${s.descripcion}</td>
      <td>${s.fecha}</td>
      <td>${s.precio}</td>
      <td><button onclick="eliminarServicio('${docSnap.id}')">❌</button></td>
    `;
    listaServicios.appendChild(tr);
  });
  actualizarReportes();
}

window.eliminarServicio = async (id) => {
  await deleteDoc(doc(db, "servicios", id));
  listarServicios();
};

document.getElementById("btnAgregarServicio").addEventListener("click", async () => {
  const nombre = document.getElementById("servNombre").value;
  const descripcion = document.getElementById("servDescripcion").value;
  const fecha = document.getElementById("servFecha").value;
  const precio = document.getElementById("servPrecio").value;

  if(!nombre || !precio) return alert("Nombre y Precio son obligatorios");

  await addDoc(collection(db, "servicios"), { nombre, descripcion, fecha, precio });
  listarServicios();
});

// ---------------------- INICIALIZAR LISTADOS ----------------------
listarProveedores();
listarFacturas();
listarGastos();
listarServicios();





