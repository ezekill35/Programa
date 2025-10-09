// dashboard.js
import { db } from "./firebase.js";
import { collection, addDoc, getDocs, onSnapshot, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { logoutUser } from "./auth.js";

// -------------------- Navegación --------------------
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

// Logout
document.getElementById("logoutBtn").addEventListener("click", logoutUser);

// -------------------- CRUD Proveedores --------------------
const formProv = document.getElementById("formProveedor");
const tablaProveedores = document.getElementById("tablaProveedores");
const proveedoresCol = collection(db, "proveedores");

// Agregar proveedor
formProv.addEventListener("submit", async e => {
    e.preventDefault();
    await addDoc(proveedoresCol, {
        ruc: document.getElementById("rucProv").value,
        nombre: document.getElementById("nombreProv").value,
        producto: document.getElementById("productoProv").value,
        direccion: document.getElementById("direccionProv").value
    });
    formProv.reset();
});

// Mostrar proveedores en tiempo real
onSnapshot(proveedoresCol, snapshot => {
    tablaProveedores.innerHTML = "";
    snapshot.forEach(docu => {
        const data = docu.data();
        tablaProveedores.innerHTML += `
            <tr>
                <td>${data.ruc}</td>
                <td>${data.nombre}</td>
                <td>${data.producto}</td>
                <td>${data.direccion}</td>
                <td>
                    <button class="edit-btn" onclick="editProv('${docu.id}')">Editar</button>
                    <button class="delete-btn" onclick="deleteProv('${docu.id}')">Eliminar</button>
                </td>
            </tr>
        `;
    });
});

// Editar y Eliminar
window.deleteProv = async id => { await deleteDoc(doc(db, "proveedores", id)); };
window.editProv = async id => {
    const docRef = doc(db, "proveedores", id);
    const docSnap = await getDocs(docRef);
    const ruc = prompt("Nuevo RUC:");
    const nombre = prompt("Nuevo nombre:");
    const producto = prompt("Nuevo producto:");
    const direccion = prompt("Nueva dirección:");
    await updateDoc(docRef, { ruc, nombre, producto, direccion });
};

// -------------------- CRUD Facturas --------------------
const formFac = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas");
const facturasCol = collection(db, "facturas");

// Agregar factura
formFac.addEventListener("submit", async e => {
    e.preventDefault();
    await addDoc(facturasCol, {
        proveedor: document.getElementById("proveedorFactura").value,
        tipo: document.getElementById("tipoFactura").value,
        monto: parseFloat(document.getElementById("montoFactura").value),
        moneda: document.getElementById("monedaFactura").value,
        fecha: document.getElementById("fechaFactura").value,
        desc: document.getElementById("descFactura").value
    });
    formFac.reset();
});

// Mostrar facturas
onSnapshot(facturasCol, snapshot => {
    tablaFacturas.innerHTML = "";
    snapshot.forEach(docu => {
        const data = docu.data();
        tablaFacturas.innerHTML += `
            <tr>
                <td>${data.proveedor}</td>
                <td>${data.tipo}</td>
                <td>${data.monto}</td>
                <td>${data.fecha}</td>
                <td>${data.desc}</td>
                <td>
                    <button class="edit-btn" onclick="editFac('${docu.id}')">Editar</button>
                    <button class="delete-btn" onclick="deleteFac('${docu.id}')">Eliminar</button>
                </td>
            </tr>
        `;
    });
});

// Editar y Eliminar factura
window.deleteFac = async id => { await deleteDoc(doc(db, "facturas", id)); };
window.editFac = async id => {
    const docRef = doc(db, "facturas", id);
    const rprov = prompt("Nuevo proveedor:");
    const tipo = prompt("Nuevo tipo:");
    const monto = parseFloat(prompt("Nuevo monto:"));
    const moneda = prompt("Nueva moneda:");
    const fecha = prompt("Nueva fecha:");
    const desc = prompt("Nueva descripción:");
    await updateDoc(docRef, { proveedor: rprov, tipo, monto, moneda, fecha, desc });
};

// -------------------- CRUD Gastos --------------------
const formGasto = document.getElementById("formGasto");
const tablaGastos = document.getElementById("tablaGastos");
const gastosCol = collection(db, "gastos");

// Agregar gasto
formGasto.addEventListener("submit", async e => {
    e.preventDefault();
    await addDoc(gastosCol, {
        nombre: document.getElementById("nombreGasto").value,
        tipo: document.getElementById("tipoGasto").value,
        monto: parseFloat(document.getElementById("montoGasto").value),
        fecha: document.getElementById("fechaGasto").value
    });
    formGasto.reset();
});

// Mostrar gastos
onSnapshot(gastosCol, snapshot => {
    tablaGastos.innerHTML = "";
    snapshot.forEach(docu => {
        const data = docu.data();
        tablaGastos.innerHTML += `
            <tr>
                <td>${data.nombre}</td>
                <td>${data.tipo}</td>
                <td>${data.monto}</td>
                <td>${data.fecha}</td>
                <td>
                    <button class="edit-btn" onclick="editGasto('${docu.id}')">Editar</button>
                    <button class="delete-btn" onclick="deleteGasto('${docu.id}')">Eliminar</button>
                </td>
            </tr>
        `;
    });
});

// Editar y Eliminar gasto
window.deleteGasto = async id => { await deleteDoc(doc(db, "gastos", id)); };
window.editGasto = async id => {
    const docRef = doc(db, "gastos", id);
    const nombre = prompt("Nuevo nombre:");
    const tipo = prompt("Nuevo tipo:");
    const monto = parseFloat(prompt("Nuevo monto:"));
    const fecha = prompt("Nueva fecha:");
    await updateDoc(docRef, { nombre, tipo, monto, fecha });
};


