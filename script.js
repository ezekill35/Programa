// script.js
import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { collection, addDoc, getDocs, onSnapshot, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// ----------------- Login y Registro -----------------
document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById("form-login");
    const formRegister = document.getElementById("form-register");

    // Mostrar registro
    document.getElementById("showRegister").addEventListener("click", () => {
        formLogin.style.display = "none";
        formRegister.style.display = "block";
    });

    // Mostrar login
    document.getElementById("showLogin").addEventListener("click", () => {
        formRegister.style.display = "none";
        formLogin.style.display = "block";
    });

    // Login
    document.getElementById("btnLogin")?.addEventListener("click", async () => {
        const email = document.getElementById("emailLogin").value;
        const pass = document.getElementById("passLogin").value;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            window.location.href = "dashboard.html";
        } catch(e) {
            alert("Error login: "+e.message);
        }
    });

    // Registro
    document.getElementById("btnRegister")?.addEventListener("click", async () => {
        const email = document.getElementById("emailReg").value;
        const pass = document.getElementById("passReg").value;
        try {
            await createUserWithEmailAndPassword(auth, email, pass);
            alert("Registro correcto! Ahora inicia sesión.");
            formRegister.style.display = "none";
            formLogin.style.display = "block";
        } catch(e) {
            alert("Error registro: "+e.message);
        }
    });
});

// ----------------- Dashboard -----------------
onAuthStateChanged(auth, user => {
    if(user && window.location.href.includes("dashboard.html")){
        initDashboard();
    } else if(!user && window.location.href.includes("dashboard.html")){
        window.location.href = "index.html";
    }
});

async function initDashboard() {
    // Logout
    document.getElementById("logoutBtn").addEventListener("click", async () => {
        await signOut(auth);
        window.location.href = "index.html";
    });

    // Colecciones Firestore
    const proveedoresCol = collection(db,"proveedores");
    const facturasCol = collection(db,"facturas");
    const gastosCol = collection(db,"gastos");

    // ----------------- CRUD Proveedores -----------------
    const tablaProveedores = document.getElementById("tablaProveedores");
    const formProveedor = document.getElementById("formProveedor");

    formProveedor?.addEventListener("submit", async e=>{
        e.preventDefault();
        await addDoc(proveedoresCol,{
            ruc: document.getElementById("rucProv").value,
            nombre: document.getElementById("nombreProv").value,
            producto: document.getElementById("productoProv").value,
            direccion: document.getElementById("direccionProv").value
        });
        formProveedor.reset();
    });

    onSnapshot(proveedoresCol, snap => {
        tablaProveedores.innerHTML = "";
        snap.forEach(docu=>{
            const d = docu.data();
            tablaProveedores.innerHTML += `<tr>
                <td>${d.ruc}</td><td>${d.nombre}</td><td>${d.producto}</td><td>${d.direccion}</td>
                <td>
                    <button onclick="editProv('${docu.id}')">✏️</button>
                    <button onclick="delProv('${docu.id}')">🗑️</button>
                </td>
            </tr>`;
        });
    });

    window.delProv = async id => { await deleteDoc(doc(db,"proveedores",id)); };
    window.editProv = async id => {
        const docRef = doc(db,"proveedores",id);
        const docSnap = await getDocs(docRef);
        const data = (await docRef.get()).data();
        document.getElementById("nombreProv").value = data.nombre;
        document.getElementById("productoProv").value = data.producto;
        document.getElementById("rucProv").value = data.ruc;
        document.getElementById("direccionProv").value = data.direccion;
        await updateDoc(docRef,{
            nombre: data.nombre,
            producto: data.producto,
            ruc: data.ruc,
            direccion: data.direccion
        });
    };

    // ----------------- CRUD Facturas -----------------
    const tablaFacturas = document.getElementById("tablaFacturas");
    const formFactura = document.getElementById("formFactura");

    formFactura?.addEventListener("submit", async e=>{
        e.preventDefault();
        await addDoc(facturasCol,{
            proveedor: document.getElementById("proveedorFactura").value,
            tipo: document.getElementById("tipoFactura").value,
            monto: document.getElementById("montoFactura").value,
            fecha: document.getElementById("fechaFactura").value,
            descripcion: document.getElementById("descFactura").value
        });
        formFactura.reset();
    });

    onSnapshot(facturasCol, snap=>{
        tablaFacturas.innerHTML="";
        snap.forEach(docu=>{
            const d = docu.data();
            tablaFacturas.innerHTML += `<tr>
                <td>${d.proveedor}</td><td>${d.tipo}</td><td>${d.monto}</td><td>${d.fecha}</td><td>${d.descripcion}</td>
                <td>
                    <button onclick="delFact('${docu.id}')">🗑️</button>
                </td>
            </tr>`;
        });
    });

    window.delFact = async id => { await deleteDoc(doc(db,"facturas",id)); };

    // ----------------- CRUD Gastos -----------------
    const tablaGastos = document.getElementById("tablaGastos");
    const formGasto = document.getElementById("formGasto");

    formGasto?.addEventListener("submit", async e=>{
        e.preventDefault();
        await addDoc(gastosCol,{
            nombre: document.getElementById("nombreGasto").value,
            tipo: document.getElementById("tipoGasto").value,
            monto: document.getElementById("montoGasto").value,
            fecha: document.getElementById("fechaGasto").value
        });
        formGasto.reset();
    });

    onSnapshot(gastosCol, snap=>{
        tablaGastos.innerHTML="";
        snap.forEach(docu=>{
            const d = docu.data();
            tablaGastos.innerHTML += `<tr>
                <td>${d.nombre}</td><td>${d.tipo}</td><td>${d.monto}</td><td>${d.fecha}</td>
                <td>
                    <button onclick="delGasto('${docu.id}')">🗑️</button>
                </td>
            </tr>`;
        });
    });

    window.delGasto = async id => { await deleteDoc(doc(db,"gastos",id)); };
}








