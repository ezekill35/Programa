// ------------------ Inicialización Firebase ------------------
var firebaseConfig = {
    apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
    authDomain: "discovery-pets.firebaseapp.com",
    projectId: "discovery-pets",
    storageBucket: "discovery-pets.appspot.com",
    messagingSenderId: "481355972999",
    appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322",
    measurementId: "G-0WMLRY8FGM"
};
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();
var auth = firebase.auth();

// ------------------ Login y Registro ------------------
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const logoutBtn = document.getElementById("logoutBtn");
    const mainContent = document.querySelector(".main-content");

    auth.onAuthStateChanged(user => {
        if (mainContent) mainContent.style.display = user ? "block" : "none";
        document.body.classList.toggle("dashboard-body", !!user);
        document.body.classList.toggle("login-body", !user);
    });

    if(registerForm){
        registerForm.addEventListener("submit", e => {
            e.preventDefault();
            const nombre = document.getElementById("regNombre").value;
            const email = document.getElementById("regEmail").value;
            const password = document.getElementById("regPassword").value;

            auth.createUserWithEmailAndPassword(email, password)
                .then(cred => db.collection("usuarios").doc(cred.user.uid).set({nombre,email}))
                .then(() => { registerForm.reset(); alert("Usuario registrado"); })
                .catch(err => alert(err.message));
        });
    }

    if(loginForm){
        loginForm.addEventListener("submit", e => {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            auth.signInWithEmailAndPassword(email, password)
                .then(() => loginForm.reset())
                .catch(err => alert(err.message));
        });
    }

    if(logoutBtn){
        logoutBtn.addEventListener("click", () => auth.signOut());
    }
});

// ------------------ Navegación secciones ------------------
const navBtns = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".content-section");

navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        navBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        sections.forEach(sec => sec.classList.remove("active"));
        const section = document.getElementById(btn.dataset.section);
        if(section) section.classList.add("active");
    });
});

// ------------------ CRUD Proveedores ------------------
const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.getElementById("tablaProveedores");

function renderProveedores(){
    if(!tablaProveedores) return;
    db.collection("proveedores").orderBy("ruc").onSnapshot(snapshot => {
        tablaProveedores.innerHTML = "";
        snapshot.forEach(doc => {
            const p = doc.data();
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${p.ruc}</td>
                <td>${p.nombre}</td>
                <td>${p.producto}</td>
                <td>${p.direccion}</td>
                <td>
                    <button onclick="editarProveedor('${doc.id}')">Editar</button>
                    <button onclick="eliminarProveedor('${doc.id}')">Eliminar</button>
                </td>`;
            tablaProveedores.appendChild(tr);
        });
    });
}
renderProveedores();

if(formProveedor){
    formProveedor.addEventListener("submit", addProveedorHandler);
}

function addProveedorHandler(e){
    e.preventDefault();
    if(!formProveedor) return;
    const ruc = document.getElementById("rucProv").value;
    const nombre = document.getElementById("nombreProv").value;
    const producto = document.getElementById("productoProv").value;
    const direccion = document.getElementById("direccionProv").value;
    db.collection("proveedores").add({ruc,nombre,producto,direccion});
    formProveedor.reset();
}

window.eliminarProveedor = function(id){ db.collection("proveedores").doc(id).delete(); }

window.editarProveedor = function(id){
    const docRef = db.collection("proveedores").doc(id);
    docRef.get().then(doc => {
        const p = doc.data();
        document.getElementById("rucProv").value = p.ruc;
        document.getElementById("nombreProv").value = p.nombre;
        document.getElementById("productoProv").value = p.producto;
        document.getElementById("direccionProv").value = p.direccion;

        formProveedor.removeEventListener("submit", addProveedorHandler);
        formProveedor.addEventListener("submit", function updateHandler(e){
            e.preventDefault();
            docRef.update({
                ruc: document.getElementById("rucProv").value,
                nombre: document.getElementById("nombreProv").value,
                producto: document.getElementById("productoProv").value,
                direccion: document.getElementById("direccionProv").value
            });
            formProveedor.reset();
            formProveedor.removeEventListener("submit", updateHandler);
            formProveedor.addEventListener("submit", addProveedorHandler);
        });
    });
}

// ------------------ CRUD Facturas ------------------
const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas");
const proveedorSelect = document.getElementById("proveedorFactura");

function renderProveedoresSelect(){
    if(!proveedorSelect) return;
    db.collection("proveedores").onSnapshot(snapshot => {
        proveedorSelect.innerHTML = "<option value=''>Seleccione proveedor</option>";
        snapshot.forEach(doc => {
            const p = doc.data();
            const option = document.createElement("option");
            option.value = p.nombre;
            option.textContent = `${p.ruc} - ${p.nombre}`;
            proveedorSelect.appendChild(option);
        });
    });
}
renderProveedoresSelect();

function renderFacturas(){
    if(!tablaFacturas) return;
    db.collection("facturas").onSnapshot(snapshot => {
        tablaFacturas.innerHTML = "";
        snapshot.forEach(doc => {
            const f = doc.data();
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${f.proveedor}</td>
                <td>${f.tipo}</td>
                <td>${f.monto} ${f.moneda}</td>
                <td>${f.fecha}</td>
                <td>${f.descripcion}</td>
                <td>
                    <button onclick="editarFactura('${doc.id}')">Editar</button>
                    <button onclick="eliminarFactura('${doc.id}')">Eliminar</button>
                </td>`;
            tablaFacturas.appendChild(tr);
        });
    });
}
renderFacturas();

if(formFactura){
    formFactura.addEventListener("submit", addFacturaHandler);
}

function addFacturaHandler(e){
    e.preventDefault();
    if(!formFactura) return;
    const proveedor = document.getElementById("proveedorFactura").value;
    const tipo = document.getElementById("tipoFactura").value;
    const monto = document.getElementById("montoFactura").value;
    const moneda = document.getElementById("monedaFactura").value;
    const fecha = document.getElementById("fechaFactura").value;
    const descripcion = document.getElementById("descFactura").value;

    db.collection("facturas").add({proveedor,tipo,monto,moneda,fecha,descripcion});
    formFactura.reset();
}

window.eliminarFactura = function(id){ db.collection("facturas").doc(id).delete(); }

window.editarFactura = function(id){
    const docRef = db.collection("facturas").doc(id);
    docRef.get().then(doc => {
        const f = doc.data();
        document.getElementById("proveedorFactura").value = f.proveedor;
        document.getElementById("tipoFactura").value = f.tipo;
        document.getElementById("montoFactura").value = f.monto;
        document.getElementById("monedaFactura").value = f.moneda;
        document.getElementById("fechaFactura").value = f.fecha;
        document.getElementById("descFactura").value = f.descripcion;

        formFactura.removeEventListener("submit", addFacturaHandler);
        formFactura.addEventListener("submit", function updateFacturaHandler(e){
            e.preventDefault();
            docRef.update({
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
    });
}

// ------------------ CRUD Gastos ------------------
const formGasto = document.getElementById("formGasto");
const tablaGastos = document.getElementById("tablaGastos");

function renderGastos(){
    if(!tablaGastos) return;
    db.collection("gastos").onSnapshot(snapshot => {
        tablaGastos.innerHTML = "";
        snapshot.forEach(doc => {
            const g = doc.data();
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${g.nombre}</td>
                <td>${g.tipo}</td>
                <td>${g.monto}</td>
                <td>${g.fecha}</td>
                <td>
                    <button onclick="editarGasto('${doc.id}')">Editar</button>
                    <button onclick="eliminarGasto('${doc.id}')">Eliminar</button>
                </td>`;
            tablaGastos.appendChild(tr);
        });
    });
}
renderGastos();

if(formGasto){
    formGasto.addEventListener("submit", e => {
        e.preventDefault();
        const nombre = document.getElementById("nombreGasto").value;
        const tipo = document.getElementById("tipoGasto").value;
        const monto = document.getElementById("montoGasto").value;
        const fecha = document.getElementById("fechaGasto").value;

        db.collection("gastos").add({nombre,tipo,monto,fecha});
        formGasto.reset();
    });
}

window.eliminarGasto = function(id){ db.collection("gastos").doc(id).delete(); }

// ------------------ CRUD Servicios ------------------
const formServicio = document.getElementById("formServicio");
const tablaServicios = document.getElementById("tablaServicios");

function renderServicios(){
    if(!tablaServicios) return;
    db.collection("servicios").onSnapshot(snapshot => {
        tablaServicios.innerHTML = "";
        snapshot.forEach(doc => {
            const s = doc.data();
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${s.nombre}</td>
                <td>${s.precio}</td>
                <td>${s.fecha}</td>
                <td>${s.descripcion}</td>
                <td>
                    <button onclick="editarServicio('${doc.id}')">Editar</button>
                    <button onclick="eliminarServicio('${doc.id}')">Eliminar</button>
                </td>`;
            tablaServicios.appendChild(tr);
        });
    });
}
renderServicios();

if(formServicio){
    formServicio.addEventListener("submit", e => {
        e.preventDefault();
        const nombre = document.getElementById("nombreServ").value;
        const precio = document.getElementById("precioServ").value;
        const fecha = document.getElementById("fechaServ").value;
        const descripcion = document.getElementById("descServ").value;

        db.collection("servicios").add({nombre,precio,fecha,descripcion});
        formServicio.reset();
    });
}

window.eliminarServicio = function(id){ db.collection("servicios").doc(id).delete(); }




