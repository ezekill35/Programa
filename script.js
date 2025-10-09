
var db = firebase.firestore();
var auth = firebase.auth();

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const logoutBtn = document.getElementById("logoutBtn");

    
    auth.onAuthStateChanged(user => {
        if(user) {
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
        registerForm.addEventListener("submit", e => {
            e.preventDefault();
            const nombre = document.getElementById("regNombre").value;
            const email = document.getElementById("regEmail").value;
            const password = document.getElementById("regPassword").value;

            auth.createUserWithEmailAndPassword(email, password)
            .then(cred => {
                db.collection("usuarios").doc(cred.user.uid).set({
                    nombre: nombre,
                    email: email
                });
                registerForm.reset();
                alert("Usuario registrado correctamente");
            })
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
        logoutBtn.addEventListener("click", () => {
            auth.signOut();
        });
    }
});


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


const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.getElementById("tablaProveedores");

function renderProveedores(){
    tablaProveedores.innerHTML = "";
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
    formProveedor.addEventListener("submit", e => {
        e.preventDefault();
        const ruc = document.getElementById("rucProv").value;
        const nombre = document.getElementById("nombreProv").value;
        const producto = document.getElementById("productoProv").value;
        const direccion = document.getElementById("direccionProv").value;

        db.collection("proveedores").add({ruc, nombre, producto, direccion});
        formProveedor.reset();
    });
}

window.eliminarProveedor = function(id){
    db.collection("proveedores").doc(id).delete();
}

window.editarProveedor = function(id){
    db.collection("proveedores").doc(id).get().then(doc => {
        const p = doc.data();
        document.getElementById("rucProv").value = p.ruc;
        document.getElementById("nombreProv").value = p.nombre;
        document.getElementById("productoProv").value = p.producto;
        document.getElementById("direccionProv").value = p.direccion;

        formProveedor.removeEventListener("submit", addProveedorHandler);
        formProveedor.addEventListener("submit", function updateHandler(e){
            e.preventDefault();
            db.collection("proveedores").doc(id).update({
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

function addProveedorHandler(e){
    e.preventDefault();
    const ruc = document.getElementById("rucProv").value;
    const nombre = document.getElementById("nombreProv").value;
    const producto = document.getElementById("productoProv").value;
    const direccion = document.getElementById("direccionProv").value;
    db.collection("proveedores").add({ruc,nombre,producto,direccion});
    formProveedor.reset();
}
formProveedor.addEventListener("submit", addProveedorHandler);


const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas");
const proveedorSelect = document.getElementById("proveedorFactura");

function renderProveedoresSelect(){
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
    tablaFacturas.innerHTML = "";
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
    formFactura.addEventListener("submit", e => {
        e.preventDefault();
        const proveedor = document.getElementById("proveedorFactura").value;
        const tipo = document.getElementById("tipoFactura").value;
        const monto = document.getElementById("montoFactura").value;
        const moneda = document.getElementById("monedaFactura").value;
        const fecha = document.getElementById("fechaFactura").value;
        const descripcion = document.getElementById("descFactura").value;

        db.collection("facturas").add({proveedor,tipo,monto,moneda,fecha,descripcion});
        formFactura.reset();
    });
}

window.eliminarFactura = function(id){
    db.collection("facturas").doc(id).delete();
}

window.editarFactura = function(id){
    db.collection("facturas").doc(id).get().then(doc => {
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
            db.collection("facturas").doc(id).update({
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

function addFacturaHandler(e){
    e.preventDefault();
    const proveedor = document.getElementById("proveedorFactura").value;
    const tipo = document.getElementById("tipoFactura").value;
    const monto = document.getElementById("montoFactura").value;
    const moneda = document.getElementById("monedaFactura").value;
    const fecha = document.getElementById("fechaFactura").value;
    const descripcion = document.getElementById("descFactura").value;

    db.collection("facturas").add({proveedor,tipo,monto,moneda,fecha,descripcion});
    formFactura.reset();
}
formFactura.addEventListener("submit", addFacturaHandler);

const formGasto = document.getElementById("formGasto");
const tablaGastos = document.getElementById("tablaGastos");

function renderGastos(){
    tablaGastos.innerHTML = "";
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

window.eliminarGasto = function(id){
    db.collection("gastos").doc(id).delete();
}


const formServicio = document.getElementById("formServicio");
const tablaServicios = document.getElementById("tablaServicios");

function renderServicios(){
    tablaServicios.innerHTML = "";
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

window.eliminarServicio = function(id){
    db.collection("servicios").doc(id).delete();
}










