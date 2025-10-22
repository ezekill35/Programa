// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, query, where, updateDoc, orderBy
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// ===================== CONFIGURACIÓN FIREBASE =====================
const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const facturaRef = collection(db, "facturas");

// ===================== GENERAR ID AUTOMÁTICO =====================
function generarIdFactura() {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const aleatorio = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `FAC-${año}${mes}${dia}-${aleatorio}`;
}

// ===================== CARGAR ID AL FORMULARIO =====================
const idAutoInput = document.getElementById("idFacturaAuto");
if (idAutoInput) idAutoInput.value = generarIdFactura();

// ===================== GUARDAR NUEVA FACTURA =====================
document.getElementById("formFactura").addEventListener("submit", async (e) => {
  e.preventDefault();

  const idFactura = idAutoInput.value.trim();
  const proveedor = document.getElementById("proveedor").value.trim();
  const tipoDocumento = document.getElementById("tipoDocumento").value.trim();
  const numeroDocumento = document.getElementById("numeroDocumento").value.trim();
  const total = document.getElementById("total").value.trim();

  if (!proveedor || !tipoDocumento || !numeroDocumento || !total) {
    alert("Por favor, completa todos los campos requeridos.");
    return;
  }

  await addDoc(facturaRef, {
    idFactura,
    proveedor,
    tipoDocumento,
    numeroDocumento,
    total,
    fechaRegistro: new Date()
  });

  alert("✅ Factura registrada correctamente.");
  e.target.reset();
  idAutoInput.value = generarIdFactura(); // generar nuevo ID
});

// ===================== LISTAR FACTURAS =====================
const tablaFacturas = document.getElementById("tablaFacturas");
function renderFacturas(facturas) {
  tablaFacturas.innerHTML = "";
  facturas.forEach((f) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.idFactura}</td>
      <td>${f.proveedor}</td>
      <td>${f.tipoDocumento}</td>
      <td>${f.numeroDocumento}</td>
      <td>${f.total}</td>
      <td>
        <button class="btn-editar" data-id="${f.id}">✏️</button>
        <button class="btn-eliminar" data-id="${f.id}">🗑️</button>
      </td>
    `;
    tablaFacturas.appendChild(tr);
  });
}

// ===================== ESCUCHAR CAMBIOS EN TIEMPO REAL =====================
onSnapshot(facturaRef, (snapshot) => {
  const facturas = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  renderFacturas(facturas);
});

// ===================== BUSCADOR EN TIEMPO REAL =====================
const buscador = document.getElementById("buscarFactura");
buscador.addEventListener("input", async (e) => {
  const texto = e.target.value.toLowerCase().trim();
  const q = query(facturaRef, orderBy("fechaRegistro", "desc"));
  const snap = await getDocs(q);
  const resultados = snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((f) =>
      f.proveedor.toLowerCase().includes(texto) ||
      f.idFactura.toLowerCase().includes(texto) ||
      f.numeroDocumento.toLowerCase().includes(texto) ||
      f.tipoDocumento.toLowerCase().includes(texto)
    );
  renderFacturas(resultados);
});

// ===================== ELIMINAR FACTURA =====================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-eliminar")) {
    const id = e.target.dataset.id;
    if (confirm("¿Eliminar esta factura?")) {
      await deleteDoc(doc(db, "facturas", id));
    }
  }
});
