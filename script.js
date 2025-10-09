// script.js
import { db, auth } from './firebase.js';
import { collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// --------------------- LOGIN CHECK ---------------------
onAuthStateChanged(auth, user=>{
    if(!user) window.location.href = "index.html";
});

// --------------------- LOGOUT ---------------------
document.getElementById("logoutBtn").addEventListener("click", async ()=>{
    await signOut(auth);
    window.location.href = "index.html";
});

// --------------------- UI NAVIGATION ---------------------
const navBtns = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".content-section");

navBtns.forEach(btn=>{
    btn.addEventListener("click", ()=>{
        navBtns.forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        sections.forEach(s=>s.classList.remove("active"));
        document.getElementById(btn.dataset.section).classList.add("active");
    });
});

// --------------------- RUC VALIDATION ---------------------
document.getElementById("rucProv").addEventListener("input", e=>{
    e.target.value = e.target.value.replace(/\D/g,'');
});

// --------------------- CRUD FIRESTORE ---------------------
const proveedoresCol = collection(db,"proveedores");
const facturasCol = collection(db,"facturas");
const gastosCol = collection(db,"gastos");
const serviciosCol = collection(db,"servicios");

const tablaProveedores = document.getElementById("tablaProveedores");
const tablaFacturas = document.getElementById("tablaFacturas");
const tablaGastos = document.getElementById("tablaGastos");
const tablaServicios = document.getElementById("tablaServicios");

const formProveedor = document.getElementById("formProveedor");
const formFactura = document.getElementById("formFactura");
const formGasto = document.getElementById("formGasto");
const formServicio = document.getElementById("formServicio");

const selectProveedor = document.getElementById("proveedorFactura");

// --------------------- Cargar Proveedores en Select ---------------------
onSnapshot(proveedoresCol, snapshot=>{
    selectProveedor.innerHTML = `<option value="">Seleccione un proveedor</option>`;
    tablaProveedores.innerHTML = "";
    snapshot.forEach(docSnap=>{
        const data = docSnap.data();
        selectProveedor.innerHTML += `<option value="${data.nombre}">${data.nombre} (${data.ruc})</option>`;
        tablaProveedores.innerHTML += `
            <tr>
                <td>${data.ruc}</td>
                <td>${data.nombre}</td>
                <td>${data.producto}</td>
                <td>${data.direccion}</td>
                <td>
                    <button class="edit-btn" onclick="editarProveedor('${docSnap.id}')">Editar</button>
                    <button class="delete-btn" onclick="eliminarProveedor('${docSnap.id}')">Eliminar</button>
                </td>
            </tr>`;
    });
});

// --------------------- Form Proveedores ---------------------
formProveedor.addEventListener("submit", async e=>{
    e.preventDefault();
    await addDoc(proveedoresCol,{
        ruc: formProveedor.rucProv.value,
        nombre: formProveedor.nombreProv.value,
        producto: formProveedor.productoProv.value,
        direccion: formProveedor.direccionProv.value
    });
    formProveedor.reset();
});

// --------------------- Form Facturas ---------------------
formFactura.addEventListener("submit", async e=>{
    e.preventDefault();
    await addDoc(facturasCol,{
        proveedor: formFactura.proveedorFactura.value,
        tipo: formFactura.tipoFactura.value,
        monto: Number(formFactura.montoFactura.value).toFixed(2),
        moneda: formFactura.monedaFactura.value,
        fecha: formFactura.fechaFactura.value,
        descripcion: formFactura.descFactura.value
    });
    formFactura.reset();
});

onSnapshot(facturasCol, snapshot=>{
    tablaFacturas.innerHTML = "";
    snapshot.forEach(docSnap=>{
        const data = docSnap.data();
        tablaFacturas.innerHTML += `
            <tr>
                <td>${data.proveedor}</td>
                <td>${data.tipo}</td>
                <td>${data.monto}</td>
                <td>${data.moneda}</td>
                <td>${data.fecha}</td>
                <td>${data.descripcion}</td>
                <td>
                    <button class="edit-btn" onclick="editarFactura('${docSnap.id}')">Editar</button>
                    <button class="delete-btn" onclick="eliminarFactura('${docSnap.id}')">Eliminar</button>
                </td>
            </tr>`;
    });
});

// --------------------- Gastos ---------------------
formGasto.addEventListener("submit", async e=>{
    e.preventDefault();
    await addDoc(gastosCol,{
        nombre: formGasto.nombreGasto.value,
        tipo: formGasto.tipoGasto.value,
        monto: Number(formGasto.montoGasto.value).toFixed(2),
        fecha: formGasto.fechaGasto.value
    });
    formGasto.reset();
});

onSnapshot(gastosCol, snapshot=>{
    tablaGastos.innerHTML = "";
    snapshot.forEach(docSnap=>{
        const data = docSnap.data();
        tablaGastos.innerHTML += `
            <tr>
                <td>${data.nombre}</td>
                <td>${data.tipo}</td>
                <td>${data.monto}</td>
                <td>${data.fecha}</td>
                <td>
                    <button class="edit-btn" onclick="editarGasto('${docSnap.id}')">Editar</button>
                    <button class="delete-btn" onclick="eliminarGasto('${docSnap.id}')">Eliminar</button>
                </td>
            </tr>`;
    });
});

// --------------------- Servicios ---------------------
formServicio.addEventListener("submit", async e=>{
    e.preventDefault();
    await addDoc(serviciosCol,{
        nombre: formServicio.nombreServ.value,
        precio: Number(formServicio.precioServ.value).toFixed(2),
        fecha: formServicio.fechaServ.value,
        descripcion: formServicio.descServ.value
    });
    formServicio.reset();
});

onSnapshot(serviciosCol, snapshot=>{
    tablaServicios.innerHTML = "";
    snapshot.forEach(docSnap=>{
        const data = docSnap.data();
        tablaServicios.innerHTML += `
            <tr>
                <td>${data.nombre}</td>
                <td>${data.precio}</td>
                <td>${data.fecha}</td>
                <td>${data.descripcion}</td>
                <td>
                    <button class="edit-btn" onclick="editarServicio('${docSnap.id}')">Editar</button>
                    <button class="delete-btn" onclick="eliminarServicio('${docSnap.id}')">Eliminar</button>
                </td>
            </tr>`;
    });
});

// --------------------- Generar Reporte ---------------------
document.getElementById("btnGenerarReporte").addEventListener("click", async ()=>{
    const facturas = await getDocs(facturasCol);
    const gastos = await getDocs(gastosCol);
    const servicios = await getDocs(serviciosCol);

    let html = "<h4>Facturas</h4><ul>";
    facturas.forEach(f=>html+=`<li>${f.data().proveedor} - ${f.data().monto} ${f.data().moneda} - ${f.data().tipo}</li>`);
    html += "</ul><h4>Gastos</h4><ul>";
    gastos.forEach(g=>html+=`<li>${g.data().nombre} - ${g.data().monto} - ${g.data().tipo}</li>`);
    html += "</ul><h4>Servicios</h4><ul>";
    servicios.forEach(s=>html+=`<li>${s.data().nombre} - ${s.data().precio}</li>`);
    html += "</ul>";
    document.getElementById("reporteContenido").innerHTML = html;
});








