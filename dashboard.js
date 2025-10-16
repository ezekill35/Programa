// dashboard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// --------------------- CONFIGURACIÓN FIREBASE ---------------------
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  databaseURL: "https://discovery-pets-default-rtdb.firebaseio.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.firebasestorage.app",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322",
  measurementId: "G-0WMLRY8FGM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --------------------- ELEMENTOS ---------------------
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");
const proveedorSelect = document.getElementById("proveedorFactura");

const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");
const productoSelect = document.getElementById("productoFactura");

const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");

const buscador = document.getElementById("buscadorFactura");
const btnRefresh = document.getElementById("btnRefresh");

// --------------------- FUNCIONES AUXILIARES ---------------------
async function borrar(col, id) {
  if (confirm("¿Seguro que quieres eliminar este registro?")) {
    await deleteDoc(doc(db, col, id));
  }
}

async function editar(col, id, data) {
  await updateDoc(doc(db, col, id), data);
}

// --------------------- CRUD PROVEEDORES ---------------------
proveedorForm.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    nombre: document.getElementById("nombreProveedor").value,
    ruc: document.getElementById("rucProveedor").value,
    telefono: document.getElementById("telefonoProveedor").value,
    opc: document.getElementById("numeroOpcionalProveedor").value,
    direccion: document.getElementById("direccionProveedor").value
  };
  await addDoc(collection(db, "proveedores"), data);
  proveedorForm.reset();
});

onSnapshot(collection(db, "proveedores"), snapshot => {
  tablaProveedores.innerHTML = "";
  proveedorSelect.innerHTML = '<option value="">Seleccione proveedor</option>';
  snapshot.forEach(docu => {
    const d = docu.data();
    tablaProveedores.innerHTML += `<tr>
      <td contenteditable="true" onblur="editar('proveedores','${docu.id}',{nombre:this.textContent})">${d.nombre}</td>
      <td contenteditable="true" onblur="editar('proveedores','${docu.id}',{ruc:this.textContent})">${d.ruc}</td>
      <td contenteditable="true" onblur="editar('proveedores','${docu.id}',{telefono:this.textContent})">${d.telefono}</td>
      <td contenteditable="true" onblur="editar('proveedores','${docu.id}',{opc:this.textContent})">${d.opc}</td>
      <td contenteditable="true" onblur="editar('proveedores','${docu.id}',{direccion:this.textContent})">${d.direccion}</td>
      <td><button onclick="borrar('proveedores','${docu.id}')">❌</button></td>
    </tr>`;
    proveedorSelect.innerHTML += `<option value="${d.nombre}">${d.nombre}</option>`;
  });
});

// --------------------- CRUD PRODUCTOS ---------------------
productoForm.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    nombre: document.getElementById("nombreProducto").value,
    precio: document.getElementById("precioProducto").value,
    cantidad: document.getElementById("cantidadProducto").value,
    descripcion: document.getElementById("descripcionProducto").value
  };
  await addDoc(collection(db, "productos"), data);
  productoForm.reset();
});

onSnapshot(collection(db, "productos"), snapshot => {
  tablaProductos.innerHTML = "";
  productoSelect.innerHTML = '<option value="">Seleccione producto</option>';
  snapshot.forEach(docu => {
    const d = docu.data();
    tablaProductos.innerHTML += `<tr>
      <td contenteditable="true" onblur="editar('productos','${docu.id}',{nombre:this.textContent})">${d.nombre}</td>
      <td contenteditable="true" onblur="editar('productos','${docu.id}',{precio:this.textContent})">${d.precio}</td>
      <td contenteditable="true" onblur="editar('productos','${docu.id}',{cantidad:this.textContent})">${d.cantidad}</td>
      <td contenteditable="true" onblur="editar('productos','${docu.id}',{descripcion:this.textContent})">${d.descripcion}</td>
      <td><button onclick="borrar('productos','${docu.id}')">❌</button></td>
    </tr>`;
    productoSelect.innerHTML += `<option value="${d.nombre}">${d.nombre}</option>`;
  });
});

// --------------------- CRUD FACTURAS ---------------------
facturaForm.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    id: document.getElementById("idFactura").value,
    fecha: document.getElementById("fechaFactura").value,
    proveedor: document.getElementById("proveedorFactura").value,
    producto: document.getElementById("productoFactura").value,
    monto: document.getElementById("montoFactura").value,
    moneda: document.getElementById("monedaFactura").value,
    tipo: document.getElementById("tipoFactura").value
  };
  await addDoc(collection(db, "facturas"), data);
  facturaForm.reset();
});

function mostrarFacturas(snapshot) {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(docu => {
    const d = docu.data();
    tablaFacturas.innerHTML += `<tr>
      <td contenteditable="true" onblur="editar('facturas','${docu.id}',{id:this.textContent})">${d.id}</td>
      <td contenteditable="true" onblur="editar('facturas','${docu.id}',{fecha:this.textContent})">${d.fecha}</td>
      <td contenteditable="true" onblur="editar('facturas','${docu.id}',{proveedor:this.textContent})">${d.proveedor}</td>
      <td contenteditable="true" onblur="editar('facturas','${docu.id}',{producto:this.textContent})">${d.producto}</td>
      <td contenteditable="true" onblur="editar('facturas','${docu.id}',{moneda:this.textContent})">${d.moneda}</td>
      <td contenteditable="true" onblur="editar('facturas','${docu.id}',{monto:this.textContent})">${d.monto}</td>
      <td contenteditable="true" onblur="editar('facturas','${docu.id}',{tipo:this.textContent})">${d.tipo}</td>
      <td><button onclick="borrar('facturas','${docu.id}')">❌</button></td>
    </tr>`;
  });
}

// Mostrar facturas en tiempo real
onSnapshot(collection(db, "facturas"), mostrarFacturas);

// --------------------- BUSCADOR ---------------------
buscador.addEventListener("input", async () => {
  const val = buscador.value.toLowerCase();
  const q = query(collection(db, "facturas"));
  onSnapshot(q, snapshot => {
    const filtradas = snapshot.docs.filter(docu => docu.data().producto.toLowerCase().includes(val));
    mostrarFacturas({ forEach: (fn) => filtradas.forEach(fn) });
  });
});

btnRefresh.addEventListener("click", () => {
  buscador.value = "";
  onSnapshot(collection(db, "facturas"), mostrarFacturas);
});

// --------------------- SIDEBAR ---------------------
const menuBtns = document.querySelectorAll(".menu-btn");
const secciones = document.querySelectorAll(".seccion");

menuBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    menuBtns.forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    const target = btn.getAttribute("data-target");
    secciones.forEach(s => s.id === target ? s.classList.add("activa") : s.classList.remove("activa"));
  });
});

// --------------------- LOGOUT ---------------------
document.getElementById("logoutBtn").addEventListener("click", () => {
  alert("Cierre de sesión simulado"); // reemplazar con auth.signOut() si usas Firebase Auth
});


