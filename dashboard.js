// -------------------- FIREBASE --------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// Configura tu Firebase
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
const auth = getAuth(app);

// -------------------- ELEMENTOS --------------------
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");
const proveedorSelect = document.getElementById("proveedorFactura");

const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");
const productoSelect = document.getElementById("productoFactura");

const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");
const buscadorFactura = document.getElementById("buscadorFactura");
const btnRefresh = document.getElementById("btnRefresh");

const logoutBtn = document.getElementById("logoutBtn");

// -------------------- FUNCIONES GENERALES --------------------
async function borrar(collectionName, id) {
    await deleteDoc(doc(db, collectionName, id));
}

async function editar(collectionName, id, data) {
    await updateDoc(doc(db, collectionName, id), data);
}

// -------------------- CRUD PROVEEDORES --------------------
proveedorForm.addEventListener("submit", async e => {
    e.preventDefault();
    await addDoc(collection(db, "proveedores"), {
        nombre: document.getElementById("nombreProveedor").value,
        ruc: document.getElementById("rucProveedor").value,
        telefono: document.getElementById("telefonoProveedor").value,
        opc: document.getElementById("numeroOpcionalProveedor").value,
        direccion: document.getElementById("direccionProveedor").value
    });
    proveedorForm.reset();
});

onSnapshot(collection(db, "proveedores"), snapshot => {
    tablaProveedores.innerHTML = "";
    proveedorSelect.innerHTML = '<option value="">Seleccione proveedor</option>';
    snapshot.forEach(docu => {
        const d = docu.data();
        tablaProveedores.innerHTML += `<tr>
            <td contenteditable="true" onblur="editar('proveedores','${docu.id}',{nombre:this.innerText})">${d.nombre}</td>
            <td contenteditable="true" onblur="editar('proveedores','${docu.id}',{ruc:this.innerText})">${d.ruc}</td>
            <td contenteditable="true" onblur="editar('proveedores','${docu.id}',{telefono:this.innerText})">${d.telefono}</td>
            <td contenteditable="true" onblur="editar('proveedores','${docu.id}',{opc:this.innerText})">${d.opc}</td>
            <td contenteditable="true" onblur="editar('proveedores','${docu.id}',{direccion:this.innerText})">${d.direccion}</td>
            <td><button onclick="borrar('proveedores','${docu.id}')">❌</button></td>
        </tr>`;
        proveedorSelect.innerHTML += `<option value="${d.nombre}">${d.nombre}</option>`;
    });
});

// -------------------- CRUD PRODUCTOS --------------------
productoForm.addEventListener("submit", async e => {
    e.preventDefault();
    await addDoc(collection(db, "productos"), {
        nombre: document.getElementById("nombreProducto").value,
        precio: document.getElementById("precioProducto").value,
        cantidad: document.getElementById("cantidadProducto").value,
        descripcion: document.getElementById("descripcionProducto").value
    });
    productoForm.reset();
});

onSnapshot(collection(db, "productos"), snapshot => {
    tablaProductos.innerHTML = "";
    productoSelect.innerHTML = '<option value="">Seleccione producto</option>';
    snapshot.forEach(docu => {
        const d = docu.data();
        tablaProductos.innerHTML += `<tr>
            <td contenteditable="true" onblur="editar('productos','${docu.id}',{nombre:this.innerText})">${d.nombre}</td>
            <td contenteditable="true" onblur="editar('productos','${docu.id}',{precio:this.innerText})">${d.precio}</td>
            <td contenteditable="true" onblur="editar('productos','${docu.id}',{cantidad:this.innerText})">${d.cantidad}</td>
            <td contenteditable="true" onblur="editar('productos','${docu.id}',{descripcion:this.innerText})">${d.descripcion}</td>
            <td><button onclick="borrar('productos','${docu.id}')">❌</button></td>
        </tr>`;
        productoSelect.innerHTML += `<option value="${d.nombre}">${d.nombre}</option>`;
    });
});

// -------------------- CRUD FACTURAS --------------------
facturaForm.addEventListener("submit", async e => {
    e.preventDefault();
    await addDoc(collection(db, "facturas"), {
        id: document.getElementById("idFactura").value,
        fecha: document.getElementById("fechaFactura").value,
        proveedor: document.getElementById("proveedorFactura").value,
        producto: document.getElementById("productoFactura").value,
        monto: document.getElementById("montoFactura").value,
        moneda: document.getElementById("monedaFactura").value,
        tipo: document.getElementById("tipoFactura").value
    });
    facturaForm.reset();
});

function mostrarFacturas(snapshot) {
    tablaFacturas.innerHTML = "";
    snapshot.forEach(docu => {
        const d = docu.data();
        tablaFacturas.innerHTML += `<tr>
            <td contenteditable="true" onblur="editar('facturas','${docu.id}',{id:this.innerText})">${d.id}</td>
            <td contenteditable="true" onblur="editar('facturas','${docu.id}',{fecha:this.innerText})">${d.fecha}</td>
            <td contenteditable="true" onblur="editar('facturas','${docu.id}',{proveedor:this.innerText})">${d.proveedor}</td>
            <td contenteditable="true" onblur="editar('facturas','${docu.id}',{producto:this.innerText})">${d.producto}</td>
            <td contenteditable="true" onblur="editar('facturas','${docu.id}',{moneda:this.innerText})">${d.moneda}</td>
            <td contenteditable="true" onblur="editar('facturas','${docu.id}',{monto:this.innerText})">${d.monto}</td>
            <td contenteditable="true" onblur="editar('facturas','${docu.id}',{tipo:this.innerText})">${d.tipo}</td>
            <td><button onclick="borrar('facturas','${docu.id}')">❌</button></td>
        </tr>`;
    });
}

// Mostrar todas las facturas en tiempo real
onSnapshot(collection(db, "facturas"), snapshot => {
    mostrarFacturas(snapshot);
});

// -------------------- BUSCADOR FACTURAS --------------------
buscadorFactura.addEventListener("input", async () => {
    const q = query(collection(db, "facturas"), where("producto", "==", buscadorFactura.value));
    const snapshot = await getDocs(q);
    mostrarFacturas(snapshot);
});

btnRefresh.addEventListener("click", () => {
    buscadorFactura.value = "";
    onSnapshot(collection(db, "facturas"), snapshot => {
        mostrarFacturas(snapshot);
    });
});

// -------------------- LOGOUT --------------------
logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    alert("Sesión cerrada");
    window.location.href = "index.html";
});

// -------------------- Hacer funciones globales --------------------
window.borrar = borrar;
window.editar = editar;

