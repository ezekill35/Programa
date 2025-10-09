import { auth, db } from './firebase.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { 
    collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// --- LOGIN / REGISTER ---
const formLogin = document.getElementById("form-login");
const formRegister = document.getElementById("form-register");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

showRegister.addEventListener("click", ()=>{formLogin.style.display="none";formRegister.style.display="block";});
showLogin.addEventListener("click", ()=>{formRegister.style.display="none";formLogin.style.display="block";});

// Registro
formRegister.addEventListener("submit", async e=>{
    e.preventDefault();
    const email = document.getElementById("emailReg").value;
    const pass = document.getElementById("passReg").value;
    try{ await createUserWithEmailAndPassword(auth,email,pass);
        alert("Registro exitoso, inicia sesión"); formRegister.style.display="none"; formLogin.style.display="block";
    }catch(err){ alert(err.message); }
});

// Login
formLogin.addEventListener("submit", async e=>{
    e.preventDefault();
    const email = document.getElementById("emailLogin").value;
    const pass = document.getElementById("passLogin").value;
    try{ await signInWithEmailAndPassword(auth,email,pass);
        window.location.href="dashboard.html";
    }catch(err){ alert(err.message); }
});

// Redirigir si ya hay sesión
onAuthStateChanged(auth,user=>{
    if(user && window.location.pathname.endsWith("index.html")) window.location.href="dashboard.html";
});

// --- DASHBOARD ---
onAuthStateChanged(auth,user=>{
    if(window.location.pathname.endsWith("dashboard.html") && !user){
        window.location.href="index.html";
    }
});

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if(logoutBtn){
    logoutBtn.addEventListener("click", async ()=>{
        await signOut(auth);
        window.location.href="index.html";
    });
}

// Navegación secciones
const navBtns = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".content-section");
navBtns.forEach(btn=>{
    btn.addEventListener("click",()=>{
        navBtns.forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        const sec = btn.dataset.section;
        sections.forEach(s=>s.classList.remove("active"));
        document.getElementById(sec).classList.add("active");
    });
});

// --- CRUD Firestore ---
const proveedoresCol = collection(db,"proveedores");
const tablaProveedores = document.getElementById("tablaProveedores");

const formProveedor = document.getElementById("formProveedor");
formProveedor.addEventListener("submit", async e=>{
    e.preventDefault();
    const data = {
        ruc: document.getElementById("rucProv").value,
        nombre: document.getElementById("nombreProv").value,
        producto: document.getElementById("productoProv").value,
        direccion: document.getElementById("direccionProv").value
    };
    await addDoc(proveedoresCol,data);
    formProveedor.reset();
});

// Mostrar en tiempo real
onSnapshot(proveedoresCol, snapshot=>{
    tablaProveedores.innerHTML="";
    snapshot.forEach(docu=>{
        const d = docu.data();
        tablaProveedores.innerHTML += `
        <tr>
            <td>${d.ruc}</td>
            <td>${d.nombre}</td>
            <td>${d.producto}</td>
            <td>${d.direccion}</td>
            <td>
                <button class="edit-btn" onclick="editProv('${docu.id}','${d.ruc}','${d.nombre}','${d.producto}','${d.direccion}')">Editar</button>
                <button class="delete-btn" onclick="deleteProv('${docu.id}')">Eliminar</button>
            </td>
        </tr>
        `;
    });
});

// Funciones edit / delete
window.deleteProv = async id=>{ await deleteDoc(doc(db,"proveedores",id)); }
window.editProv = async (id,ruc,nombre,producto,direccion)=>{
    const newRuc = prompt("RUC",ruc);
    const newNom = prompt("Nombre",nombre);
    const newProd = prompt("Producto",producto);
    const newDir = prompt("Dirección",direccion);
    await updateDoc(doc(db,"proveedores",id),{
        ruc:newRuc,nombre:newNom,producto:newProd,direccion:newDir
    });
};











