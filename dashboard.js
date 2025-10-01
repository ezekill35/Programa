// 🔹 Importar Firebase
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { app } from "./firebase.js";

// Inicializar Auth y Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// 🌟 ELEMENTOS DEL MENÚ
const sections = {
  Proveedor: document.getElementById("sectionProveedor"),
  Factura: document.getElementById("sectionFactura"),
  Gastos: document.getElementById("sectionGastos"),
  Servicio: document.getElementById("sectionServicio")
};

const menuBtns = document.querySelectorAll(".menu-btn");

// Función para mostrar la sección activa
menuBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.id === "btnLogout") return logout();

    // Activar solo la sección correspondiente
    Object.values(sections).forEach(sec => sec.classList.remove("active"));
    sections[btn.textContent].classList.add("active");

    // Resaltar botón activo
    menuBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // Listar los datos de la sección
    switch(btn.textContent){
      case "Proveedor": listProveedor(); break;
      case "Factura": listFactura(); break;
      case "Gastos": listGasto(); break;
      case "Servicio": listServicio(); break;
    }
  });
});

// 🔹 CERRAR SESIÓN
function logout() {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
}

// ---------------------- SECCIÓN PROVEEDOR ----------------------
const addProveedorBtn = document.getElementById("addProveedor");
const tbodyProveedor = document.getElementById("tbodyProveedor");

addProveedorBtn.addEventListener("click", async () => {
  const ruc = document.getElementById("provRuc").value;
  const nombre = document.getElementById("provNombre").value;
  const direccion = document.getElementById("provDireccion").value;
  if(!ruc || !nombre) return alert("RUC y Nombre son obligatorios");
  await addDoc(collection(db,"proveedor"), { ruc, nombre, direccion });
  listProveedor();
});

// LISTAR PROVEEDORES
async function listProveedor() {
  tbodyProveedor.innerHTML = "";
  const querySnapshot = await getDocs(collection(db,"proveedor"));
  querySnapshot.forEach(docu => {
    const data = docu.data();
    tbodyProveedor.innerHTML += `
      <tr>
        <td>${data.ruc}</td>
        <td>${data.nombre}</td>
        <td>${data.direccion}</td>
        <td><button onclick="deleteDocById('proveedor','${docu.id}')">Eliminar</button></td>
      </tr>`;
  });
}

// BUSCAR PROVEEDOR
document.getElementById("searchBtnProveedor").addEventListener("click", async () => {
  const search = document.getElementById("searchProveedor").value;
  tbodyProveedor.innerHTML = "";
  const q = query(collection(db,"proveedor"), where("ruc", "==", search));
  const q2 = query(collection(db,"proveedor"), where("nombre", "==", search));
  const snaps = await getDocs(q);
  const snaps2 = await getDocs(q2);
  snaps.forEach(docu => { const d=docu.data(); tbodyProveedor.innerHTML += `<tr><td>${d.ruc}</td><td>${d.nombre}</td><td>${d.direccion}</td><td><button onclick="deleteDocById('proveedor','${docu.id}')">Eliminar</button></td></tr>`; });
  snaps2.forEach(docu => { const d=docu.data(); tbodyProveedor.innerHTML += `<tr><td>${d.ruc}</td><td>${d.nombre}</td><td>${d.direccion}</td><td><button onclick="deleteDocById('proveedor','${docu.id}')">Eliminar</button></td></tr>`; });
});

// ---------------------- SECCIÓN FACTURA ----------------------
const addFacturaBtn = document.getElementById("addFactura");
const tbodyFactura = document.getElementById("tbodyFactura");

addFacturaBtn.addEventListener("click", async () => {
  const ruc = document.getElementById("factRucProveedor").value;
  const tipo = document.getElementById("factTipo").value;
  const descripcion = document.getElementById("factDescripcion").value;
  const fecha = document.getElementById("factFecha").value;
  if(!ruc || !tipo) return alert("RUC y Tipo son obligatorios");
  await addDoc(collection(db,"factura"), { ruc, tipo, descripcion, fecha });
  listFactura();
});

async function listFactura() {
  tbodyFactura.innerHTML = "";
  const querySnapshot = await getDocs(collection(db,"factura"));
  querySnapshot.forEach(docu => {
    const data = docu.data();
    tbodyFactura.innerHTML += `
      <tr>
        <td>${data.ruc}</td>
        <td>${data.tipo}</td>
        <td>${data.descripcion}</td>
        <td>${data.fecha}</td>
        <td><button onclick="deleteDocById('factura','${docu.id}')">Eliminar</button></td>
      </tr>`;
  });
}

document.getElementById("searchBtnFactura").addEventListener("click", async () => {
  const search = document.getElementById("searchFactura").value;
  tbodyFactura.innerHTML = "";
  const q = query(collection(db,"factura"), where("ruc","==",search));
  const snaps = await getDocs(q);
  snaps.forEach(docu => { const d = docu.data(); tbodyFactura.innerHTML += `<tr><td>${d.ruc}</td><td>${d.tipo}</td><td>${d.descripcion}</td><td>${d.fecha}</td><td><button onclick="deleteDocById('factura','${docu.id}')">Eliminar</button></td></tr>`; });
});

// ---------------------- SECCIÓN GASTOS ----------------------
const addGastoBtn = document.getElementById("addGasto");
const tbodyGasto = document.getElementById("tbodyGasto");

addGastoBtn.addEventListener("click", async () => {
  const descripcion = document.getElementById("gastoDescripcion").value;
  const monto = document.getElementById("gastoMonto").value;
  const fecha = document.getElementById("gastoFecha").value;
  if(!descripcion) return alert("Descripción obligatoria");
  await addDoc(collection(db,"gasto"), { descripcion, monto, fecha });
  listGasto();
});

async function listGasto() {
  tbodyGasto.innerHTML = "";
  const querySnapshot = await getDocs(collection(db,"gasto"));
  querySnapshot.forEach(docu => {
    const data = docu.data();
    tbodyGasto.innerHTML += `
      <tr>
        <td>${data.descripcion}</td>
        <td>${data.monto}</td>
        <td>${data.fecha}</td>
        <td><button onclick="deleteDocById('gasto','${docu.id}')">Eliminar</button></td>
      </tr>`;
  });
}

document.getElementById("searchBtnGasto").addEventListener("click", async () => {
  const search = document.getElementById("searchGasto").value;
  tbodyGasto.innerHTML = "";
  const q = query(collection(db,"gasto"), where("descripcion","==",search));
  const snaps = await getDocs(q);
  snaps.forEach(docu => { const d = docu.data(); tbodyGasto.innerHTML += `<tr><td>${d.descripcion}</td><td>${d.monto}</td><td>${d.fecha}</td><td><button onclick="deleteDocById('gasto','${docu.id}')">Eliminar</button></td></tr>`; });
});

// ---------------------- SECCIÓN SERVICIO ----------------------
const addServicioBtn = document.getElementById("addServicio");
const tbodyServicio = document.getElementById("tbodyServicio");

addServicioBtn.addEventListener("click", async () => {
  const descripcion = document.getElementById("servDescripcion").value;
  const cliente = document.getElementById("servCliente").value;
  const fecha = document.getElementById("servFecha").value;
  if(!descripcion || !cliente) return alert("Descripción y Cliente obligatorios");
  await addDoc(collection(db,"servicio"), { descripcion, cliente, fecha });
  listServicio();
});

async function listServicio() {
  tbodyServicio.innerHTML = "";
  const querySnapshot = await getDocs(collection(db,"servicio"));
  querySnapshot.forEach(docu => {
    const data = docu.data();
    tbodyServicio.innerHTML += `
      <tr>
        <td>${data.descripcion}</td>
        <td>${data.cliente}</td>
        <td>${data.fecha}</td>
        <td><button onclick="deleteDocById('servicio','${docu.id}')">Eliminar</button></td>
      </tr>`;
  });
}

document.getElementById("searchBtnServicio").addEventListener("click", async () => {
  const search = document.getElementById("searchServicio").value;
  tbodyServicio.innerHTML = "";
  const q = query(collection(db,"servicio"), where("cliente","==",search));
  const snaps = await getDocs(q);
  snaps.forEach(docu => { const d = docu.data(); tbodyServicio.innerHTML += `<tr><td>${d.descripcion}</td><td>${d.cliente}</td><td>${d.fecha}</td><td><button onclick="deleteDocById('servicio','${docu.id}')">Eliminar</button></td></tr>`; });
});

// ---------------------- FUNCION ELIMINAR ----------------------
window.deleteDocById = async (col, id) => {
  await deleteDoc(doc(db,col,id));
  switch(col){
    case "proveedor": listProveedor(); break;
    case "factura": listFactura(); break;
    case "gasto": listGasto(); break;
    case "servicio": listServicio(); break;
  }
};

// Inicializar sección activa
listProveedor();
