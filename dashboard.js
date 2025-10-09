// Importar Firebase v9+ modular
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
    authDomain: "discovery-pets.firebaseapp.com",
    projectId: "discovery-pets",
    storageBucket: "discovery-pets.appspot.com",
    messagingSenderId: "481355972999",
    appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322",
    measurementId: "G-0WMLRY8FGM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ---------------------- Login y Registro ----------------------
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const logoutBtn = document.getElementById("logoutBtn");

    onAuthStateChanged(auth, user => {
        if(user){
            document.body.classList.remove("login-body");
            document.body.classList.add("dashboard-body");
            document.querySelector(".main-content").style.display = "block";
        } else {
            document.body.classList.remove("dashboard-body");
            document.body.classList.add("login-body");
            document.querySelector(".main-content").style.display = "none";
        }
    });

    if(registerForm){
        registerForm.addEventListener("submit", async e => {
            e.preventDefault();
            const nombre = document.getElementById("regNombre").value;
            const email = document.getElementById("regEmail").value;
            const password = document.getElementById("regPassword").value;

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await addDoc(collection(db, "usuarios"), {
                    uid: userCredential.user.uid,
                    nombre,
                    email
                });
                registerForm.reset();
                alert("Usuario registrado correctamente");
            } catch(err){
                alert(err.message);
            }
        });
    }

    if(loginForm){
        loginForm.addEventListener("submit", async e => {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            try {
                await signInWithEmailAndPassword(auth, email, password);
                loginForm.reset();
            } catch(err){
                alert(err.message);
            }
        });
    }

    if(logoutBtn){
        logoutBtn.addEventListener("click", async () => {
            await signOut(auth);
        });
    }
});

// ---------------------- Navegación ----------------------
const navBtns = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".content-section");

navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        navBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        sections.forEach(sec => sec.classList.remove("active"));
        document.getElementById(btn.dataset.section).classList.add("active");
    });
});

// ---------------------- CRUD Proveedores ----------------------
const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.getElementById("tablaProveedores");

function renderProveedores(){
    const q = query(collection(db, "proveedores"), orderBy("ruc"));
    onSnapshot(q, snapshot => {
        tablaProveedores.innerHTML = "";
        snapshot.forEach(docSnap => {
            const p = docSnap.data();
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${p.ruc}</td>
                <td>${p.nombre}</td>
                <td>${p.producto}</td>
                <td>${p.direccion}</td>
                <td>
                    <button class="edit-btn" onclick="editarProveedor('${docSnap.id}')">Editar</button>
                    <button class="delete-btn" onclick="eliminarProveedor('${docSnap.id}')">Eliminar</button>
                </td>
            `;
            tablaProveedores.appendChild(tr);
        });
    });
}
renderProveedores();

window.eliminarProveedor = async function(id){
    await deleteDoc(doc(db, "proveedores", id));
}

window.editarProveedor = async function(id){
    const docRef = doc(db, "proveedores", id);
    const docSnap = await getDocs(docRef);
    if(docSnap.exists()){
        const p = docSnap.data();
        document.getElementById("rucProv").value = p.ruc;
        document.getElementById("nombreProv").value = p.nombre;
        document.getElementById("productoProv").value = p.producto;
        document.getElementById("direccionProv").value = p.direccion;

        formProveedor.removeEventListener("submit", addProveedorHandler);
        formProveedor.addEventListener("submit", async function updateHandler(e){
            e.preventDefault();
            await updateDoc(docRef, {
                ruc: document.getElementById("rucProv").value,
                nombre: document.getElementById("nombreProv").value,
                producto: document.getElementById("productoProv").value,
                direccion: document.getElementById("direccionProv").value
            });
            formProveedor.reset();
            formProveedor.removeEventListener("submit", updateHandler);
            formProveedor.addEventListener("submit", addProveedorHandler);
        });
    }
}

async function addProveedorHandler(e){
    e.preventDefault();
    const ruc = document.getElementById("rucProv").value;
    const nombre = document.getElementById("nombreProv").value;
    const producto = document.getElementById("productoProv").value;
    const direccion = document.getElementById("direccionProv").value;
    await addDoc(collection(db, "proveedores"), {ruc,nombre,producto,direccion});
    formProveedor.reset();
}
formProveedor.addEventListener("submit", addProveedorHandler);

// ---------------------- CRUD Facturas ----------------------
const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas");
const proveedorSelect = document.getElementById("proveedorFactura");

function renderProveedoresSelect(){
    onSnapshot(collection(db, "proveedores"), snapshot => {
        proveedorSelect.innerHTML = "<option value=''>Seleccione proveedor</option>";
        snapshot.forEach(docSnap => {
            const p = docSnap.data();
            const option = document.createElement("option");
            option.value = p.nombre;
            option.textContent = `${p.ruc} - ${p.nombre}`;
            proveedorSelect.appendChild(option);
        });
    });
}
renderProveedoresSelect();

function renderFacturas(){
    onSnapshot(collection(db, "facturas"), snapshot => {
        tablaFacturas.innerHTML = "";
        snapshot.forEach(docSnap => {
            const f = docSnap.data();
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${f.proveedor}</td>
                <td>${f.tipo}</td>
                <td>${f.monto} ${f.moneda}</td>
                <td>${f.fecha}</td>
                <td>${f.descripcion}</td>
                <td>
                    <button class="edit-btn" onclick="editarFactura('${docSnap.id}')">Editar</button>
                    <button class="delete-btn" onclick="eliminarFactura('${docSnap.id}')">Eliminar</button>
                </td>
            `;
            tablaFacturas.appendChild(tr);
        });
    });
}
renderFacturas();

window.eliminarFactura = async function(id){
    await deleteDoc(doc(db, "facturas", id));
}

window.editarFactura = async function(id){
    const docRef = doc(db, "facturas", id);
    const docSnap = await getDocs(docRef);
    if(docSnap.exists()){
        const f = docSnap.data();
        document.getElementById("proveedorFactura").value = f.proveedor;
        document.getElementById("tipoFactura").value = f.tipo;
        document.getElementById("montoFactura").value = f.monto;
        document.getElementById("monedaFactura").value = f.moneda;
        document.getElementById("fechaFactura").value = f.fecha;
        document.getElementById("descFactura").value = f.descripcion;

        formFactura.removeEventListener("submit", addFacturaHandler);
        formFactura.addEventListener("submit", async function updateFacturaHandler(e){
            e.preventDefault();
            await updateDoc(docRef, {
                proveedor: document.getElementById("proveedorFactura").value,
                tipo: document.getElementById("tipoFactura").value,
                monto: document.getElementById("montoFactura").value,
                moneda: document.getElementById("monedaFactura").value,
                fecha: document.getElementById("fechaFactura").value,
                descripcion: document.getElementById("descFactura").value
            });
            formFactura.reset();
            formFactura.removeEventListener("submit", updateFacturaHandler);
            formFactura.addEventListener("submit", addFacturaHandler);
        });
    }
}

async function addFacturaHandler(e){
    e.preventDefault();
    const proveedor = document.getElementById("proveedorFactura").value;
    const tipo = document.getElementById("tipoFactura").value;
    const monto = document.getElementById("montoFactura").value;
    const moneda = document.getElementById("monedaFactura").value;
    const fecha = document.getElementById("fechaFactura").value;
    const descripcion = document.getElementById("descFactura").value;

    await addDoc(collection(db, "facturas"), {proveedor,tipo,monto,moneda,fecha,descripcion});
    formFactura.reset();
}
formFactura.addEventListener("submit", addFacturaHandler);

// ---------------------- CRUD Gastos ----------------------
const formGasto = document.getElementById("formGasto");
const tablaGastos = document.getElementById("tablaGastos");

function renderGastos(){
    onSnapshot(collection(db, "gastos"), snapshot => {
        tablaGastos.innerHTML = "";
        snapshot.forEach(docSnap => {
            const g = docSnap.data();
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${g.nombre}</td>
                <td>${g.tipo}</td>
                <td>${g.monto}</td>
                <td>${g.fecha}</td>
                <td>
                    <button class="edit-btn" onclick="editarGasto('${docSnap.id}')">Editar</button>
                    <button class="delete-btn" onclick="eliminarGasto('${docSnap.id}')">Eliminar</button>
                </td>
            `;
            tablaGastos.appendChild(tr);
        });
    });
}
renderGastos();

window.eliminarGasto = async function(id){
    await deleteDoc(doc(db, "gastos", id));
}

// ---------------------- CRUD Servicios ----------------------
const formServicio = document.getElementById("formServicio");
const tablaServicios = document.getElementById("tablaServicios");

function renderServicios(){
    onSnapshot(collection(db, "servicios"), snapshot => {
        tablaServicios.innerHTML = "";
        snapshot.forEach(docSnap => {
            const s = docSnap.data();
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${s.nombre}</td>
                <td>${s.precio}</td>
                <td>${s.fecha}</td>
                <td>${s.descripcion}</td>
                <td>
                    <button class="edit-btn" onclick="editarServicio('${docSnap.id}')">Editar</button>
                    <button class="delete-btn" onclick="eliminarServicio('${docSnap.id}')">Eliminar</button>
                </td>
            `;
            tablaServicios.appendChild(tr);
        });
    });
}
renderServicios();

window.eliminarServicio = async function(id){
    await deleteDoc(doc(db, "servicios", id));
}

