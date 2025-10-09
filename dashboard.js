// ------------------ Firebase v9+ Modular ------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, onSnapshot, deleteDoc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

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

// ------------------ Login y Registro ------------------
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
      try{
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await addDoc(collection(db, "usuarios"), { uid: cred.user.uid, nombre, email });
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
      try{
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

// ------------------ Navegación de Secciones ------------------
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

// ------------------ CRUD Proveedores ------------------
const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.getElementById("tablaProveedores");
const proveedoresCol = collection(db, "proveedores");

const renderProveedores = () => {
  const q = query(proveedoresCol, orderBy("ruc"));
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
          <button onclick="editarProveedor('${docSnap.id}')">Editar</button>
          <button onclick="eliminarProveedor('${docSnap.id}')">Eliminar</button>
        </td>`;
      tablaProveedores.appendChild(tr);
    });
  });
};
renderProveedores();

if(formProveedor){
  formProveedor.addEventListener("submit", async e => {
    e.preventDefault();
    const ruc = document.getElementById("rucProv").value;
    const nombre = document.getElementById("nombreProv").value;
    const producto = document.getElementById("productoProv").value;
    const direccion = document.getElementById("direccionProv").value;
    await addDoc(proveedoresCol, { ruc, nombre, producto, direccion });
    formProveedor.reset();
  });
}

window.eliminarProveedor = async function(id){
  await deleteDoc(doc(db, "proveedores", id));
}

window.editarProveedor = async function(id){
  const docRef = doc(db, "proveedores", id);
  const docSnap = await docRef.get();
  const data = docSnap.data();
  document.getElementById("rucProv").value = data.ruc;
  document.getElementById("nombreProv").value = data.nombre;
  document.getElementById("productoProv").value = data.producto;
  document.getElementById("direccionProv").value = data.direccion;

  formProveedor.onsubmit = async e => {
    e.preventDefault();
    await updateDoc(docRef, {
      ruc: document.getElementById("rucProv").value,
      nombre: document.getElementById("nombreProv").value,
      producto: document.getElementById("productoProv").value,
      direccion: document.getElementById("direccionProv").value
    });
    formProveedor.reset();
    formProveedor.onsubmit = addProveedorDefaultHandler;
  };
};

const addProveedorDefaultHandler = async e => {
  e.preventDefault();
  const ruc = document.getElementById("rucProv").value;
  const nombre = document.getElementById("nombreProv").value;
  const producto = document.getElementById("productoProv").value;
  const direccion = document.getElementById("direccionProv").value;
  await addDoc(proveedoresCol, { ruc, nombre, producto, direccion });
  formProveedor.reset();
};
formProveedor.onsubmit = addProveedorDefaultHandler;

// ------------------ CRUD Facturas ------------------
const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas");
const proveedorSelect = document.getElementById("proveedorFactura");
const facturasCol = collection(db, "facturas");

const renderProveedoresSelect = () => {
  onSnapshot(proveedoresCol, snapshot => {
    proveedorSelect.innerHTML = "<option value=''>Seleccione proveedor</option>";
    snapshot.forEach(docSnap => {
      const p = docSnap.data();
      const option = document.createElement("option");
      option.value = p.nombre;
      option.textContent = `${p.ruc} - ${p.nombre}`;
      proveedorSelect.appendChild(option);
    });
  });
};
renderProveedoresSelect();

const renderFacturas = () => {
  onSnapshot(facturasCol, snapshot => {
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
          <button onclick="editarFactura('${docSnap.id}')">Editar</button>
          <button onclick="eliminarFactura('${docSnap.id}')">Eliminar</button>
        </td>`;
      tablaFacturas.appendChild(tr);
    });
  });
};
renderFacturas();

if(formFactura){
  formFactura.addEventListener("submit", async e => {
    e.preventDefault();
    const proveedor = document.getElementById("proveedorFactura").value;
    const tipo = document.getElementById("tipoFactura").value;
    const monto = document.getElementById("montoFactura").value;
    const moneda = document.getElementById("monedaFactura").value;
    const fecha = document.getElementById("fechaFactura").value;
    const descripcion = document.getElementById("descFactura").value;
    await addDoc(facturasCol, { proveedor, tipo, monto, moneda, fecha, descripcion });
    formFactura.reset();
  });
}

window.eliminarFactura = async function(id){
  await deleteDoc(doc(db, "facturas", id));
}

window.editarFactura = async function(id){
  const docRef = doc(db, "facturas", id);
  const docSnap = await docRef.get();
  const data = docSnap.data();
  document.getElementById("proveedorFactura").value = data.proveedor;
  document.getElementById

