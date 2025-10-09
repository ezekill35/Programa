// dashboard.js
import { db, auth } from "./firebase.js";
import { collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// Cambiar sección activa
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

// Cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// --- PROVEEDORES ---
const formProv = document.getElementById("formProveedor");
const tablaProv = document.getElementById("tablaProveedores");
const proveedorFacturaSelect = document.getElementById("proveedorFactura");

const proveedoresCol = collection(db, "proveedores");

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

// Listar proveedores en tiempo real
onSnapshot(proveedoresCol, snapshot => {
  tablaProv.innerHTML = "";
  proveedorFacturaSelect.innerHTML = '<option value="">Seleccione proveedor</option>';
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    tablaProv.innerHTML += `<tr>
      <td>${data.ruc}</td>
      <td>${data.nombre}</td>
      <td>${data.producto}</td>
      <td>${data.direccion}</td>
      <td><button onclick="deleteDoc(doc(db,'proveedores','${docSnap.id}'))">Eliminar</button></td>
    </tr>`;
    proveedorFacturaSelect.innerHTML += `<option value="${data.nombre}">${data.nombre}</option>`;
  });
});

