// script.js
import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { collection, addDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  // ---------------- LOGIN / REGISTER ----------------
  if(window.location.pathname.includes("index.html")){
    const loginForm = document.getElementById("form-login");
    const registerForm = document.getElementById("form-register");
    const btnLogin = document.getElementById("btnLogin");
    const btnRegister = document.getElementById("btnRegister");
    const showRegister = document.getElementById("showRegister");
    const showLogin = document.getElementById("showLogin");

    if(showRegister) showRegister.addEventListener("click", () => {
      if(loginForm) loginForm.style.display="none";
      if(registerForm) registerForm.style.display="block";
    });

    if(showLogin) showLogin.addEventListener("click", () => {
      if(loginForm) loginForm.style.display="block";
      if(registerForm) registerForm.style.display="none";
    });

    if(btnRegister){
      btnRegister.addEventListener("click", async e=>{
        e.preventDefault();
        const email=document.getElementById("emailReg")?.value;
        const password=document.getElementById("passReg")?.value;
        if(!email||!password)return alert("Completa todos los campos");
        try{
          await createUserWithEmailAndPassword(auth,email,password);
          alert("Registro exitoso, ahora inicia sesión");
          if(registerForm) registerForm.style.display="none";
          if(loginForm) loginForm.style.display="block";
        }catch(e){ alert(e.message); }
      });
    }

    if(btnLogin){
      btnLogin.addEventListener("click", async e=>{
        e.preventDefault();
        const email=document.getElementById("emailLogin")?.value;
        const password=document.getElementById("passLogin")?.value;
        if(!email||!password)return alert("Completa todos los campos");
        try{
          await signInWithEmailAndPassword(auth,email,password);
        }catch(e){ alert(e.message); }
      });
    }

    onAuthStateChanged(auth,user=>{
      if(user) window.location.href="dashboard.html";
    });
  }

  // ---------------- DASHBOARD ----------------
  if(window.location.pathname.includes("dashboard.html")){
    const logoutBtn = document.getElementById("logoutBtn");
    if(logoutBtn) logoutBtn.addEventListener("click", async()=>{
      await signOut(auth);
      window.location.href="index.html";
    });

    const sections=["proveedores","facturas","gastos","servicios"];
    const navBtns=document.querySelectorAll(".nav-btn");
    navBtns.forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const sec=btn.dataset.section;
        sections.forEach(s=>{
          const el=document.getElementById(s);
          if(el) el.style.display=(s===sec)?"block":"none";
        });
        navBtns.forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    // ---------- Función general CRUD ----------
    function setupCRUD(formId, collectionName, tableId){
      const form=document.getElementById(formId);
      const table=document.getElementById(tableId);
      if(!form||!table) return;

      form.addEventListener("submit", async e=>{
        e.preventDefault();
        const inputs=form.querySelectorAll("input, select");
        const data={};
        inputs.forEach(i=>{ if(i.id) data[i.id.replace(/(Prov|Factura|Gasto|Serv)/,"")]=i.value; });
        try{
          await addDoc(collection(db,collectionName),data);
          form.reset();
        }catch(err){ alert(err.message); }
      });

      onSnapshot(collection(db,collectionName), snapshot=>{
        table.innerHTML="";
        snapshot.forEach(docSnap=>{
          const data=docSnap.data();
          const tr=document.createElement("tr");
          const fields=Object.values(data).map(v=>`<td>${v}</td>`).join("");
          tr.innerHTML=`${fields}
            <td>
              <button class="btn btn-sm btn-primary" onclick="alert('Editar implementado para ${collectionName} ID: ${docSnap.id}')">Editar</button>
              <button class="btn btn-sm btn-danger" onclick="deleteDoc(doc(db,'${collectionName}','${docSnap.id}'))">Eliminar</button>
            </td>`;
          table.appendChild(tr);
        });
      });
    }

    setupCRUD("formProveedor","proveedores","tablaProveedores");
    setupCRUD("formFactura","facturas","tablaFacturas");
    setupCRUD("formGasto","gastos","tablaGastos");
    setupCRUD("formServicio","servicios","tablaServicios");
  }

});






