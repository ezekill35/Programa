// script.js
import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  // -------------------- LOGIN / REGISTRO --------------------
  if(window.location.pathname.includes("index.html")) {
    const loginForm = document.getElementById("form-login");
    const registerForm = document.getElementById("form-register");
    const btnLogin = document.getElementById("btnLogin");
    const btnRegister = document.getElementById("btnRegister");
    const showRegister = document.getElementById("showRegister");
    const showLogin = document.getElementById("showLogin");

    if(showRegister) showRegister.addEventListener("click", () => {
      if(loginForm) loginForm.style.display = "none";
      if(registerForm) registerForm.style.display = "block";
    });

    if(showLogin) showLogin.addEventListener("click", () => {
      if(loginForm) loginForm.style.display = "block";
      if(registerForm) registerForm.style.display = "none";
    });

    if(btnRegister){
      btnRegister.addEventListener("click", async () => {
        const email = document.getElementById("emailReg")?.value;
        const password = document.getElementById("passReg")?.value;
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          alert("Registro exitoso, ahora inicia sesión");
          if(registerForm) registerForm.style.display = "none";
          if(loginForm) loginForm.style.display = "block";
        } catch(e) {
          alert("Error al registrar: " + e.message);
        }
      });
    }

    if(btnLogin){
      btnLogin.addEventListener("click", async () => {
        const email = document.getElementById("emailLogin")?.value;
        const password = document.getElementById("passLogin")?.value;
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch(e) {
          alert("Error al iniciar sesión: " + e.message);
        }
      });
    }

    // Redirección automática si ya está logueado
    onAuthStateChanged(auth, user => {
      if(user) {
        window.location.href = "dashboard.html";
      }
    });
  }

  // -------------------- DASHBOARD --------------------
  if(window.location.pathname.includes("dashboard.html")) {
    const logoutBtn = document.getElementById("logoutBtn");
    if(logoutBtn){
      logoutBtn.addEventListener("click", async () => {
        await signOut(auth);
        window.location.href = "index.html";
      });
    }

    // --- Referencias a formularios y tablas ---
    const formProveedor = document.getElementById("formProveedor");
    const tablaProveedores = document.getElementById("tablaProveedores");

    const formFactura = document.getElementById("formFactura");
    const tablaFacturas = document.getElementById("tablaFacturas");

    const formGasto = document.getElementById("formGasto");
    const tablaGastos = document.getElementById("tablaGastos");

    const formServicio = document.getElementById("formServicio");
    const tablaServicios = document.getElementById("tablaServicios");

    // -------------------- FUNCIONES GENERALES --------------------
    function safeValue(id){ return document.getElementById(id)?.value || ""; }

    async function setupCRUD(form, collectionName, tableId){
      if(!form || !tableId) return;

      // Agregar documento
      form.addEventListener("submit", async e => {
        e.preventDefault();
        const inputs = form.querySelectorAll("input, select");
        const data = {};
        inputs.forEach(inp => { if(inp.id) data[inp.id.replace(/(Prov|Factura|Gasto|Serv)/, "")] = inp.value; });
        try {
          await addDoc(collection(db, collectionName), data);
          form.reset();
        } catch(e) { alert(e.message); }
      });

      // Escuchar cambios en tiempo real
      onSnapshot(collection(db, collectionName), snapshot => {
        tableId.innerHTML = "";
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          const tr = document.createElement("tr");
          const fields = Object.values(data).map(v => `<td>${v}</td>`).join("");
          tr.innerHTML = `
            ${fields}
            <td>
              <button class="edit-btn" onclick="editItem('${collectionName}', '${docSnap.id}')">Editar</button>
              <button class="delete-btn" onclick="deleteItem('${collectionName}', '${docSnap.id}')">Eliminar</button>
            </td>
          `;
          tableId.appendChild(tr);
        });
      });
    }

    window.deleteItem = async (collectionName, id) => {
      await deleteDoc(doc(db, collectionName, id));
    }

    window.editItem = (collectionName, id) => {
      // Aquí puedes abrir un modal o rellenar formulario para editar
      alert("Implementa edición para: " + collectionName + " ID: " + id);
    }

    // -------------------- Configurar CRUD para cada colección --------------------
    setupCRUD(formProveedor, "proveedores", tablaProveedores);
    setupCRUD(formFactura, "facturas", tablaFacturas);
    setupCRUD(formGasto, "gastos", tablaGastos);
    setupCRUD(formServicio, "servicios", tablaServicios);
  }

});






