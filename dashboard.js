// dashboard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.firebasestorage.app",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:a073cc5af230b32f4c5322",
  measurementId: "G-W5RGYVTW3V"
};

// Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ----------- Menú navegación ------------
const menuItems = document.querySelectorAll(".sidebar ul li[data-section]");
const sections = document.querySelectorAll(".section");

menuItems.forEach(item => {
  item.addEventListener("click", () => {
    menuItems.forEach(i => i.classList.remove("active"));
    sections.forEach(s => s.classList.remove("active"));

    item.classList.add("active");
    document.getElementById(item.getAttribute("data-section")).classList.add("active");
  });
});

// Cerrar sesión
document.getElementById("logout").addEventListener("click", () => {
  window.location.href = "index.html";
});

// ----------- Guardar Proveedor ------------
const proveedorForm = document.querySelector("#proveedores form");
proveedorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ruc = document.getElementById("ruc").value.trim();
  const nombre = document.getElementById("nombre").value.trim();

  if (ruc && nombre) {
    try {
      await addDoc(collection(db, "proveedores"), {
        ruc,
        nombre,
        fechaRegistro: new Date()
      });
      alert("Proveedor registrado correctamente ✅");
      proveedorForm.reset();
    } catch (error) {
      console.error("Error al registrar proveedor:", error);
      alert("❌ Hubo un error al registrar el proveedor.");
    }
  } else {
    alert("Por favor complete todos los campos.");
  }
});

// ----------- Guardar Factura ------------
const facturaForm = document.querySelector("#facturas form");
facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ruc = document.getElementById("factura-ruc").value.trim();
  const proveedor = document.getElementById("proveedor").value;
  const numero = document.getElementById("numero").value.trim();

  if (ruc && proveedor && numero) {
    try {
      await addDoc(collection(db, "facturas"), {
        ruc,
        proveedor,
        numero,
        fechaRegistro: new Date()
      });
      alert("Factura registrada correctamente ✅");
      facturaForm.reset();
    } catch (error) {
      console.error("Error al registrar factura:", error);
      alert("❌ Hubo un error al registrar la factura.");
    }
  } else {
    alert("Por favor complete todos los campos.");
  }
});

