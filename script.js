// script.js
import { db, auth } from './firebase.js';
import {
    collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, getDocs, query
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// --------------------- LOGOUT ---------------------
document.getElementById("logoutBtn").addEventListener("click", async ()=>{
    await signOut(auth);
    window.location.href = "index.html";
});

// --------------------- PROVEEDORES ---------------------
const proveedoresCol = collection(db,"proveedores");
const tablaProveedores = document.getElementById("tablaProveedores");
const formProveedor = document.getElementById("formProveedor");

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

// Listener en tiempo real
onSnapshot(proveedoresCol, snapshot=>{
    tablaProveedores.innerHTML = "";
    snapshot.forEach(docSnap=>{
        const data = docSnap.data();
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${data.ruc}</td>
            <td>${data.nombre}</td>
            <td>${data.producto}</td>
            <td>${data.direccion}</td>
            <td>
                <button class="edit-btn" onclick="editarProveedor('${docSnap.id}')">Editar</button>
                <button class="delete-btn" onclick="eliminarProveedor('${docSnap.id}')">Eliminar</button>
            </td>
        `;
        tablaProveedores.appendChild(tr);
    });
});

// Funciones editar/eliminar
window.eliminarProveedor = async (id)=>{ await deleteDoc(doc(db,"proveedores",id)); }

window.editarProveedor = async (id)=>{
    const docRef = doc(db,"proveedores",id);
    const docSnap = await getDocs(query(proveedoresCol));
    const newNombre = prompt("Nuevo nombre:");
    if(newNombre) await updateDoc(docRef,{ nombre: newNombre });
}

// --------------------- FACTURAS ---------------------
const facturasCol = collection(db,"facturas");
const tablaFacturas = document.getElementById("tablaFacturas");
const formFactura = document.getElementById("formFactura");

formFactura.addEventListener("submit", async e=>{
    e.preventDefault();
    await addDoc(facturasCol,{
        proveedor: formFactura.proveedorFactura.value,
        tipo: formFactura.tipoFactura.value,
        monto: Number(formFactura.montoFactura.value),
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
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${data.proveedor}</td>
            <td>${data.tipo}</td>
            <td>${data.monto}</td>
            <td>${data.fecha}</td>
            <td>${data.descripcion}</td>
            <td>
                <button class="edit-btn" onclick="editarFactura('${docSnap.id}')">Editar</button>
                <button class="delete-btn" onclick="eliminarFactura('${docSnap.id}')">Eliminar</button>
            </td>
        `;
        tablaFacturas.appendChild(tr);
    });
});

window.eliminarFactura = async (id)=>{ await deleteDoc(doc(db,"facturas",id)); }
window.editarFactura = async (id)=>{
    const docRef = doc(db,"facturas",id);
    const newMonto = prompt("Nuevo monto:");
    if(newMonto) await updateDoc(docRef,{ monto: Number(newMonto) });
}

// --------------------- GASTOS ---------------------
const gastosCol = collection(db,"gastos");
const tablaGastos = document.getElementById("tablaGastos");
const formGasto = document.getElementById("formGasto");

formGasto.addEventListener("submit", async e=>{
    e.preventDefault();
    await addDoc(gastosCol,{
        nombre: formGasto.nombreGasto.value,
        tipo: formGasto.tipoGasto.value,
        monto: Number(formGasto.montoGasto.value),
        fecha: formGasto.fechaGasto.value
    });
    formGasto.reset();
});

onSnapshot(gastosCol, snapshot=>{
    tablaGastos.innerHTML = "";
    snapshot.forEach(docSnap=>{
        const data = docSnap.data();
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${data.nombre}</td>
            <td>${data.tipo}</td>
            <td>${data.monto}</td>
            <td>${data.fecha}</td>
            <td>
                <button class="edit-btn" onclick="editarGasto('${docSnap.id}')">Editar</button>
                <button class="delete-btn" onclick="eliminarGasto('${docSnap.id}')">Eliminar</button>
            </td>
        `;
        tablaGastos.appendChild(tr);
    });
});

window.eliminarGasto = async (id)=>{ await deleteDoc(doc(db,"gastos",id)); }
window.editarGasto = async (id)=>{
    const docRef = doc(db,"gastos",id);
    const newMonto = prompt("Nuevo monto:");
    if(newMonto) await updateDoc(docRef,{ monto: Number(newMonto) });
}

// --------------------- SERVICIOS ---------------------
const serviciosCol = collection(db,"servicios");
const tablaServicios = document.getElementById("tablaServicios");
const formServicio = document.getElementById("formServicio");

formServicio.addEventListener("submit", async e=>{
    e.preventDefault();
    await addDoc(serviciosCol,{
        nombre: formServicio.nombreServ.value,
        precio: Number(formServicio.precioServ.value),
        fecha: formServicio.fechaServ.value,
        descripcion: formServicio.descServ.value
    });
    formServicio.reset();
});

onSnapshot(serviciosCol, snapshot=>{
    tablaServicios.innerHTML = "";
    snapshot.forEach(docSnap=>{
        const data = docSnap.data();
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${data.nombre}</td>
            <td>${data.precio}</td>
            <td>${data.fecha}</td>
            <td>${data.descripcion}</td>
            <td>
                <button class="edit-btn" onclick="editarServicio('${docSnap.id}')">Editar</button>
                <button class="delete-btn" onclick="eliminarServicio('${docSnap.id}')">Eliminar</button>
            </td>
        `;
        tablaServicios.appendChild(tr);
    });
});

window.eliminarServicio = async (id)=>{ await deleteDoc(doc(db,"servicios",id)); }
window.editarServicio = async (id)=>{
    const docRef = doc(db,"servicios",id);
    const newPrecio = prompt("Nuevo precio:");
    if(newPrecio) await updateDoc(docRef,{ precio: Number(newPrecio) });
}

// --------------------- REPORTES ---------------------
document.getElementById("btnGenerarReporte").addEventListener("click", async ()=>{
    const reporteDiv = document.getElementById("reporteContenido");
    reporteDiv.innerHTML = "<h4>Generando resumen...</h4>";

    const [provSnap, factSnap, gastoSnap, servSnap] = await Promise.all([
        getDocs(proveedoresCol), getDocs(facturasCol), getDocs(gastosCol), getDocs(serviciosCol)
    ]);

    let totalProveedores = provSnap.size;
    let totalFacturas = factSnap.docs.reduce((acc,d)=>acc + d.data().monto,0);
    let totalGastos = gastoSnap.docs.reduce((acc,d)=>acc + d.data().monto,0);
    let totalServicios = servSnap.docs.reduce((acc,d)=>acc + d.data().precio,0);

    reporteDiv.innerHTML = `
        <ul>
            <li>Total Proveedores: ${totalProveedores}</li>
            <li>Total Facturas: S/. ${totalFacturas}</li>
            <li>Total Gastos: S/. ${totalGastos}</li>
            <li>Total Servicios: S/. ${totalServicios}</li>
        </ul>
    `;
});












