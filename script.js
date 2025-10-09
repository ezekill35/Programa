// script.js
import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  // -------------------- Login / Registro --------------------
  const loginForm = document.getElementById("form-login");
  const registerForm = document.getElementById("form-register");
  const btnLogin = document.getElementById("btnLogin");
  const btnRegister = document.getElementById("btnRegister");
  const showRegister = document.getElementById("showRegister");
  const showLogin = document.getElementById("showLogin");

  if(showRegister) showRegister.addEventListener("click", () => {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
  });

  if(showLogin) showLogin.addEventListener("click", () => {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
  });

  if(btnRegister){
    btnRegister.addEventListener("click", async () => {
      const email = document.getElementById("emailReg").value;
      const password = document.getElementById("passReg").value;
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Registro exitoso, ahora inicia sesión");
        registerForm.style.display = "none";
        loginForm.style.display = "block";
      } catch(e) {
        alert("Error al registrar: " + e.message);
      }
    });
  }

  if(btnLogin){
    btnLogin.addEventListener("click", async () => {
      const email = document.getElementById("emailLogin").value;
      const password = document.getElementById("passLogin").value;
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch(e) {
        alert("Error al iniciar sesión: " + e.message);
      }
    });
  }

  // -------------------- Redirección al Dashboard --------------------
  onAuthStateChanged(auth, user => {
    if(user && window.location.pathname.includes("index.html")) {
      window.location.href = "dashboard.html";
    }
  });

  // -------------------- Logout --------------------
  const logoutBtn = document.getElementById("logoutBtn");
  if(logoutBtn){
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "index.html";
    });
  }

  // -------------------- CRUD en Tiempo Real --------------------
  if(window.location.pathname.includes("dashboard.html")){

    // Referencias a tablas y formularios
    const formProveedor = document.getElementById("formProveedor");
    const tablaProveedores = document.getElementById("tablaProveedores");

    const formFactura = document.getElementById("formFactura");
    const tablaFacturas = document.getElementById("tablaFacturas");

    const formGasto = document.getElementById("formGasto");
    const tablaGastos = document.getElementById("tablaGastos");

    const formServicio = document.getElementById("formServicio");
    const tablaServicios = document.getElementById("tablaServicios");

    // -------------------- Proveedores --------------------
    if(formProveedor){
      formProveedor.addEventListener("submit", async e => {
        e.preventDefault();
        try {
          await addDoc(collection(db, "proveedores"), {
            ruc: document.getElementById("rucProv").value,
            nombre: document.getElementById("nombreProv").value,
            producto: document.getElementById("productoProv").value,
            direccion: document.getElementById("direccionProv").value
          });
          formProveedor.reset();
        } catch(e) {
          alert("Error al agregar proveedor: " + e.message);
        }
      });

      onSnapshot(collection(db, "proveedores"), snapshot => {
        tablaProveedores.innerHTML = "";
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${data.ruc}</td>
            <td>${data.nombre}</td>
            <td>${data.producto}</td>
            <td>${data.direccion}</td>
            <td>
              <button class="edit-btn" onclick="editProveedor('${docSnap.id}', '${data.ruc}', '${data.nombre}', '${data.producto}', '${data.direccion}')">Editar</button>
              <button class="delete-btn" onclick="deleteProveedor('${docSnap.id}')">Eliminar</button>
            </td>
          `;
          tablaProveedores.appendChild(tr);
        });
      });
    }

    window.deleteProveedor = async (id) => {
      await deleteDoc(doc(db, "proveedores", id));
    }

    window.editProveedor = async (id, ruc, nombre, producto, direccion) => {
      document.getElementById("rucProv").value = ruc;
      document.getElementById("nombreProv").value = nombre;
      document.getElementById("productoProv").value = producto;
      document.getElementById("direccionProv").value = direccion;

      formProveedor.onsubmit = async e => {
        e.preventDefault();
        await updateDoc(doc(db, "proveedores", id), {
          ruc: document.getElementById("rucProv").value,
          nombre: document.getElementById("nombreProv").value,
          producto: document.getElementById("productoProv").value,
          direccion: document.getElementById("direccionProv").value
        });
        formProveedor.reset();
        formProveedor.onsubmit = null; // Restablecer el submit normal
      }
    }

    // -------------------- Facturas --------------------
    if(formFactura){
      formFactura.addEventListener("submit", async e => {
        e.preventDefault();
        try {
          await addDoc(collection(db, "facturas"), {
            proveedor: document.getElementById("proveedorFactura").value,
            tipo: document.getElementById("tipoFactura").value,
            monto: parseFloat(document.getElementById("montoFactura").value),
            moneda: document.getElementById("monedaFactura").value,
            fecha: document.getElementById("fechaFactura").value,
            descripcion: document.getElementById("descFactura").value
          });
          formFactura.reset();
        } catch(e) { alert(e.message); }
      });

      onSnapshot(collection(db, "facturas"), snapshot => {
        tablaFacturas.innerHTML = "";
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${data.proveedor}</td>
            <td>${data.tipo}</td>
            <td>${data.monto}</td>
            <td>${data.fecha}</td>
            <td>${data.descripcion || ""}</td>
            <td>
              <button class="edit-btn">Editar</button>
              <button class="delete-btn" onclick="deleteFactura('${docSnap.id}')">Eliminar</button>
            </td>
          `;
          tablaFacturas.appendChild(tr);
        });
      });
    }

    window.deleteFactura = async (id) => {
      await deleteDoc(doc(db, "facturas", id));
    }

    // -------------------- Gastos --------------------
    if(formGasto){
      formGasto.addEventListener("submit", async e => {
        e.preventDefault();
        try {
          await addDoc(collection(db, "gastos"), {
            nombre: document.getElementById("nombreGasto").value,
            tipo: document.getElementById("tipoGasto").value,
            monto: parseFloat(document.getElementById("montoGasto").value),
            fecha: document.getElementById("fechaGasto").value
          });
          formGasto.reset();
        } catch(e) { alert(e.message); }
      });

      onSnapshot(collection(db, "gastos"), snapshot => {
        tablaGastos.innerHTML = "";
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${data.nombre}</td>
            <td>${data.tipo}</td>
            <td>${data.monto}</td>
            <td>${data.fecha}</td>
            <td>
              <button class="edit-btn">Editar</button>
              <button class="delete-btn" onclick="deleteGasto('${docSnap.id}')">Eliminar</button>
            </td>
          `;
          tablaGastos.appendChild(tr);
        });
      });
    }

    window.deleteGasto = async (id) => {
      await deleteDoc(doc(db, "gastos", id));
    }

    // -------------------- Servicios --------------------
    if(formServicio){
      formServicio.addEventListener("submit", async e => {
        e.preventDefault();
        try {
          await addDoc(collection(db, "servicios"), {
            nombre: document.getElementById("nombreServ").value,
            precio: parseFloat(document.getElementById("precioServ").value),
            fecha: document.getElementById("fechaServ").value,
            descripcion: document.getElementById("descServ").value
          });
          formServicio.reset();
        } catch(e) { alert(e.message); }
      });

      onSnapshot(collection(db, "servicios"), snapshot => {
        tablaServicios.innerHTML = "";
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${data.nombre}</td>
            <td>${data.precio}</td>
            <td>${data.fecha}</td>
            <td>${data.descripcion || ""}</td>
            <td>
              <button class="edit-btn">Editar</button>
              <button class="delete-btn" onclick="deleteServicio('${docSnap.id}')">Eliminar</button>
            </td>
          `;
          tablaServicios.appendChild(tr);
        });
      });
    }

    window.deleteServicio = async (id) => {
      await deleteDoc(doc(db, "servicios", id));
    }

  } // end dashboard check

}); // end DOMContentLoaded






