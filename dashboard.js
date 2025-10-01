// Configuración Firebase (igual que en script.js)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_ID",
  appId: "TU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Verificar sesión
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "index.html";
  }
});

// Cerrar sesión
document.getElementById("logout-btn").addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
});

// Cambiar secciones
document.querySelectorAll(".menu-item").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".menu-item").forEach(i => i.classList.remove("active"));
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));

    item.classList.add("active");
    document.getElementById(item.dataset.section).classList.add("active");
  });
});

// Registrar proveedor
const proveedorForm = document.getElementById("proveedor-form");
proveedorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ruc = document.getElementById("proveedor-ruc").value;
  const nombre = document.getElementById("proveedor-nombre").value;
  const email = document.getElementById("proveedor-email").value;
  const telefono = document.getElementById("proveedor-telefono").value;

  await db.collection("proveedores").add({ ruc, nombre, email, telefono });
  alert("Proveedor registrado ✅");
  proveedorForm.reset();
});

// Registrar factura
const facturaForm = document.getElementById("factura-form");
facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ruc = document.getElementById("factura-ruc").value;
  const proveedor = document.getElementById("factura-proveedor").value;
  const nombre = document.getElementById("factura-nombre").value;
  const numero = document.getElementById("factura-numero").value;
  const fecha = document.getElementById("factura-fecha").value;
  const monto = document.getElementById("factura-monto").value;

  await db.collection("facturas").add({ ruc, proveedor, nombre, numero, fecha, monto });
  alert("Factura registrada ✅");
  facturaForm.reset();
});
