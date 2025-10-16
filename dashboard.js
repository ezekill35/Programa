// dashboard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

// CONFIGURACIÓN FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
    authDomain: "discovery-pets.firebaseapp.com",
    databaseURL: "https://discovery-pets-default-rtdb.firebaseio.com",
    projectId: "discovery-pets",
    storageBucket: "discovery-pets.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ELEMENTOS DOM
const proveedorForm = document.getElementById("proveedorForm");
const productoForm = document.getElementById("productoForm");
const facturaForm = document.getElementById("facturaForm");

const tablaProveedores = document.getElementById("tablaProveedores");
const tablaProductos = document.getElementById("tablaProductos");
const tablaFacturas = document.getElementById("tablaFacturas");

const factProveedor = document.getElementById("factProveedor");
const factProducto = document.getElementById("factProducto");

const modalDetalle = document.getElementById("modalDetalle");
const contenidoModal = document.getElementById("contenidoModal");
const closeModal = document.getElementById("closeModal");

// --- FUNCIONES GENERALES ---
function limpiarForm(form){
    form.reset();
}

function abrirModal(html){
    contenidoModal.innerHTML = html;
    modalDetalle.classList.add("show");
}
function cerrarModal(){
    modalDetalle.classList.remove("show");
}
closeModal.addEventListener("click", cerrarModal);
modalDetalle.addEventListener("click", e => { if(e.target === modalDetalle) cerrarModal(); });

// --- CRUD PROVEEDORES ---
proveedorForm.addEventListener("submit", e=>{
    e.preventDefault();
    const proveedor = {
        nombre: document.getElementById("nombreProveedor").value,
        ruc: document.getElementById("rucProveedor").value,
        telefono: document.getElementById("telefonoProveedor").value,
        numero: document.getElementById("numeroProveedor").value,
        direccion: document.getElementById("direccionProveedor").value
    };
    const newRef = push(ref(db, "proveedores"));
    set(newRef, proveedor);
    limpiarForm(proveedorForm);
});

onValue(ref(db, "proveedores"), snapshot=>{
    tablaProveedores.innerHTML = "";
    factProveedor.innerHTML = "<option value=''>Selecciona proveedor</option>";
    snapshot.forEach(child=>{
        const p = child.val();
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.nombre}</td>
            <td>${p.ruc}</td>
            <td>${p.telefono}</td>
            <td>${p.numero}</td>
            <td>${p.direccion}</td>
            <td>
                <button class="btn secondary" onclick='editarProveedor("${child.key}")'>Editar</button>
                <button class="btn secondary" onclick='eliminarProveedor("${child.key}")'>Eliminar</button>
            </td>
        `;
        tablaProveedores.appendChild(tr);

        // Select facturas
        const option = document.createElement("option");
        option.value = child.key;
        option.textContent = p.nombre;
        factProveedor.appendChild(option);
    });
});

window.editarProveedor = function(key){
    const pRef = ref(db, `proveedores/${key}`);
    onValue(pRef, snap=>{
        const p = snap.val();
        abrirModal(`
            <h3>Editar proveedor</h3>
            <form id="editarProveedorForm">
                <div class="row">
                    <input id="editNombre" value="${p.nombre}" required />
                    <input id="editRuc" value="${p.ruc}" required />
                </div>
                <div class="row">
                    <input id="editTelefono" value="${p.telefono}" />
                    <input id="editNumero" value="${p.numero}" />
                </div>
                <div class="row">
                    <input id="editDireccion" value="${p.direccion}" />
                    <button class="btn" type="submit">Guardar cambios</button>
                </div>
            </form>
        `);

        const editarForm = document.getElementById("editarProveedorForm");
        editarForm.addEventListener("submit", ev=>{
            ev.preventDefault();
            const data = {
                nombre: document.getElementById("editNombre").value,
                ruc: document.getElementById("editRuc").value,
                telefono: document.getElementById("editTelefono").value,
                numero: document.getElementById("editNumero").value,
                direccion: document.getElementById("editDireccion").value
            };
            update(pRef, data);
            cerrarModal();
        });
    }, {once:true});
};

window.eliminarProveedor = function(key){
    if(confirm("¿Eliminar proveedor?")) remove(ref(db, `proveedores/${key}`));
};

// --- CRUD PRODUCTOS ---
productoForm.addEventListener("submit", e=>{
    e.preventDefault();
    const producto = {
        nombre: document.getElementById("nombreProducto").value,
        precio: parseFloat(document.getElementById("precioProducto").value),
        cantidad: parseInt(document.getElementById("cantidadProducto").value),
        descripcion: document.getElementById("descripcionProducto").value
    };
    const newRef = push(ref(db, "productos"));
    set(newRef, producto);
    limpiarForm(productoForm);
});

onValue(ref(db,"productos"), snapshot=>{
    tablaProductos.innerHTML = "";
    factProducto.innerHTML = "<option value=''>Selecciona producto</option>";
    snapshot.forEach(child=>{
        const p = child.val();
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.nombre}</td>
            <td>${p.precio}</td>
            <td>${p.cantidad}</td>
            <td>${p.descripcion}</td>
            <td>
                <button class="btn secondary" onclick='editarProducto("${child.key}")'>Editar</button>
                <button class="btn secondary" onclick='eliminarProducto("${child.key}")'>Eliminar</button>
            </td>
        `;
        tablaProductos.appendChild(tr);

        // Select facturas
        const option = document.createElement("option");
        option.value = child.key;
        option.textContent = p.nombre;
        factProducto.appendChild(option);
    });
});

window.editarProducto = function(key){
    const pRef = ref(db, `productos/${key}`);
    onValue(pRef, snap=>{
        const p = snap.val();
        abrirModal(`
            <h3>Editar producto</h3>
            <form id="editarProductoForm">
                <div class="row">
                    <input id="editProdNombre" value="${p.nombre}" required />
                    <input id="editProdPrecio" value="${p.precio}" required />
                </div>
                <div class="row">
                    <input id="editProdCantidad" value="${p.cantidad}" required />
                    <input id="editProdDescripcion" value="${p.descripcion}" />
                </div>
                <button class="btn" type="submit">Guardar cambios</button>
            </form>
        `);
        const editarForm = document.getElementById("editarProductoForm");
        editarForm.addEventListener("submit", ev=>{
            ev.preventDefault();
            const data = {
                nombre: document.getElementById("editProdNombre").value,
                precio: parseFloat(document.getElementById("editProdPrecio").value),
                cantidad: parseInt(document.getElementById("editProdCantidad").value),
                descripcion: document.getElementById("editProdDescripcion").value
            };
            update(pRef, data);
            cerrarModal();
        });
    }, {once:true});
};

window.eliminarProducto = function(key){
    if(confirm("¿Eliminar producto?")) remove(ref(db, `productos/${key}`));
};

// --- CRUD FACTURAS ---
facturaForm.addEventListener("submit", e=>{
    e.preventDefault();
    const factura = {
        proveedor: factProveedor.value,
        producto: factProducto.value,
        cantidad: parseInt(document.getElementById("factCantidad").value),
        tipo: document.getElementById("factTipo").value,
        fecha: document.getElementById("factFecha").value
    };
    const newRef = push(ref(db, "facturas"));
    set(newRef, factura);
    limpiarForm(facturaForm);
});

onValue(ref(db,"facturas"), snapshot=>{
    tablaFacturas.innerHTML = "";
    snapshot.forEach(child=>{
        const f = child.val();
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${child.key}</td>
            <td>${f.proveedor}</td>
            <td>${f.producto}</td>
            <td>${f.cantidad}</td>
            <td>${f.cantidad}</td>
            <td>${f.tipo}</td>
            <td>${f.fecha}</td>
            <td>
                <button class="btn secondary" onclick='editarFactura("${child.key}")'>Editar</button>
                <button class="btn secondary" onclick='eliminarFactura("${child.key}")'>Eliminar</button>
            </td>
        `;
        tablaFacturas.appendChild(tr);
    });
});

window.editarFactura = function(key){
    const fRef = ref(db, `facturas/${key}`);
    onValue(fRef, snap=>{
        const f = snap.val();
        abrirModal(`
            <h3>Editar factura</h3>
            <form id="editarFacturaForm">
                <div class="row">
                    <input id="editFactCantidad" value="${f.cantidad}" required />
                    <input id="editFactTipo" value="${f.tipo}" required />
                </div>
                <div class="row">
                    <input id="editFactFecha" type="date" value="${f.fecha}" required />
                    <button class="btn" type="submit">Guardar cambios</button>
                </div>
            </form>
        `);
        const editarForm = document.getElementById("editarFacturaForm");
        editarForm.addEventListener("submit", ev=>{
            ev.preventDefault();
            const data = {
                cantidad: parseInt(document.getElementById("editFactCantidad").value),
                tipo: document.getElementById("editFactTipo").value,
                fecha: document.getElementById("editFactFecha").value
            };
            update(fRef, data);
            cerrarModal();
        });
    }, {once:true});
};

window.eliminarFactura = function(key){
    if(confirm("¿Eliminar factura?")) remove(ref(db, `facturas/${key}`));
};

// --- NAV SECCIONES ---
const menuBtns = document.querySelectorAll(".menu-btn");
const secciones = document.querySelectorAll(".seccion");
menuBtns.forEach(btn=>{
    btn.addEventListener("click", ()=>{
        menuBtns.forEach(b=>b.classList.remove("activo"));
        btn.classList.add("activo");
        const target = btn.dataset.target;
        secciones.forEach(sec=>sec.classList.remove("activa"));
        document.getElementById(target).classList.add("activa");
    });
});

// --- LOGOUT ---
document.getElementById("logoutBtn").addEventListener("click", ()=>{
    alert("Cerrar sesión (implementar auth)"); // reemplazar con auth real
});

// --- BUSCADOR GLOBAL ---
document.getElementById("buscadorGlobal").addEventListener("keypress", e=>{
    if(e.key === "Enter") {
        alert("Implementar búsqueda global"); // luego filtrar tablas y resultados
    }
});
document.getElementById("btnRefresh").addEventListener("click", ()=>location.reload());


