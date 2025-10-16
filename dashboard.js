// --------------------- FIREBASE ---------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, where
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Configura tu proyecto de Firebase
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

const buscadorFactura = document.getElementById("buscadorFactura");
const btnRefresh = document.getElementById("btnRefresh");

// --------------------- FUNCIONES GENERALES ---------------------
async function borrar(col, id) {
    if(confirm("¿Desea eliminar este registro?")){
        await deleteDoc(doc(db, col, id));
    }
}

async function editar(col, id, data){
    const campos = Object.keys(data);
    const nuevos = {};
    campos.forEach(c => {
        const val = prompt(`Nuevo valor para ${c}:`, data[c]);
        if(val !== null) nuevos[c] = val;
    });
    if(Object.keys(nuevos).length) await updateDoc(doc(db,col,id), nuevos);
}

// --------------------- PROVEEDORES ---------------------
proveedorForm.addEventListener("submit", async (e)=>{
    e.preventDefault();
    await addDoc(collection(db,"proveedores"),{
        nombre: document.getElementById("nombreProveedor").value,
        ruc: document.getElementById("rucProveedor").value,
        telefono: document.getElementById("telefonoProveedor").value,
        opc: document.getElementById("numeroOpcionalProveedor").value,
        direccion: document.getElementById("direccionProveedor").value
    });
    proveedorForm.reset();
});

onSnapshot(collection(db,"proveedores"), snapshot=>{
    tablaProveedores.innerHTML="";
    proveedorSelect.innerHTML='<option value="">Seleccione proveedor</option>';
    snapshot.forEach(docu=>{
        const d = docu.data();
        tablaProveedores.innerHTML += `<tr>
            <td>${d.nombre}</td>
            <td>${d.ruc}</td>
            <td>${d.telefono}</td>
            <td>${d.opc}</td>
            <td>${d.direccion}</td>
            <td>
                <button onclick="editar('proveedores','${docu.id}',${JSON.stringify(d)})">✏️</button>
                <button onclick="borrar('proveedores','${docu.id}')">❌</button>
            </td>
        </tr>`;
        proveedorSelect.innerHTML += `<option value="${d.nombre}">${d.nombre}</option>`;
    });
});

// --------------------- PRODUCTOS ---------------------
productoForm.addEventListener("submit", async (e)=>{
    e.preventDefault();
    await addDoc(collection(db,"productos"),{
        nombre: document.getElementById("nombreProducto").value,
        precio: document.getElementById("precioProducto").value,
        cantidad: document.getElementById("cantidadProducto").value,
        descripcion: document.getElementById("descripcionProducto").value
    });
    productoForm.reset();
});

onSnapshot(collection(db,"productos"), snapshot=>{
    tablaProductos.innerHTML="";
    productoSelect.innerHTML='<option value="">Seleccione producto</option>';
    snapshot.forEach(docu=>{
        const d = docu.data();
        tablaProductos.innerHTML += `<tr>
            <td>${d.nombre}</td>
            <td>${d.precio}</td>
            <td>${d.cantidad}</td>
            <td>${d.descripcion}</td>
            <td>
                <button onclick="editar('productos','${docu.id}',${JSON.stringify(d)})">✏️</button>
                <button onclick="borrar('productos','${docu.id}')">❌</button>
            </td>
        </tr>`;
        productoSelect.innerHTML += `<option value="${d.nombre}">${d.nombre}</option>`;
    });
});

// --------------------- FACTURAS ---------------------
facturaForm.addEventListener("submit", async (e)=>{
    e.preventDefault();
    await addDoc(collection(db,"facturas"),{
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

function mostrarFacturas(snapshot){
    tablaFacturas.innerHTML="";
    snapshot.forEach(docu=>{
        const d = docu.data();
        tablaFacturas.innerHTML += `<tr>
            <td>${d.id}</td>
            <td>${d.fecha}</td>
            <td>${d.proveedor}</td>
            <td>${d.producto}</td>
            <td>${d.moneda}</td>
            <td>${d.monto}</td>
            <td>${d.tipo}</td>
            <td>
                <button onclick="editar('facturas','${docu.id}',${JSON.stringify(d)})">✏️</button>
                <button onclick="borrar('facturas','${docu.id}')">❌</button>
            </td>
        </tr>`;
    });
}

onSnapshot(collection(db,"facturas"), mostrarFacturas);

// --------------------- BUSCADOR ---------------------
buscadorFactura.addEventListener("input", async ()=>{
    const texto = buscadorFactura.value.toLowerCase();
    const q = collection(db,"facturas");
    onSnapshot(q, snapshot=>{
        tablaFacturas.innerHTML="";
        snapshot.forEach(docu=>{
            const d = docu.data();
            if(d.producto.toLowerCase().includes(texto)){
                tablaFacturas.innerHTML += `<tr>
                    <td>${d.id}</td>
                    <td>${d.fecha}</td>
                    <td>${d.proveedor}</td>
                    <td>${d.producto}</td>
                    <td>${d.moneda}</td>
                    <td>${d.monto}</td>
                    <td>${d.tipo}</td>
                    <td>
                        <button onclick="editar('facturas','${docu.id}',${JSON.stringify(d)})">✏️</button>
                        <button onclick="borrar('facturas','${docu.id}')">❌</button>
                    </td>
                </tr>`;
            }
        });
    });
});

btnRefresh.addEventListener("click", ()=>{
    buscadorFactura.value="";
    onSnapshot(collection(db,"facturas"), mostrarFacturas);
});

// --------------------- LOGOUT ---------------------
document.getElementById("logoutBtn").addEventListener("click", ()=>{
    alert("Cerrar sesión"); 
    // Redirigir a login.html si lo tienes:
    // window.location.href = "login.html";
});
