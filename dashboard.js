// dashboard.js (fragmento de proveedores)
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Inicialización de Firebase
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

// Referencia a colección
const proveedorCol = collection(db, "proveedores");

// Elementos del DOM
const inputRUC = document.getElementById("provRUC");
const inputNombre = document.getElementById("provNombre");
const inputDireccion = document.getElementById("provDireccion");
const inputCorreo = document.getElementById("provCorreo");
const inputTelefono = document.getElementById("provTelefono");
const btnAgregar = document.getElementById("btnAgregarProveedor");
const btnBuscar = document.getElementById("btnBuscarProveedor");
const tablaProveedor = document.getElementById("tablaProveedor");
const mensajeProveedor = document.getElementById("mensajeProveedor");

// Función agregar proveedor
btnAgregar.addEventListener("click", async () => {
  const data = {
    ruc: inputRUC.value.trim(),
    nombre: inputNombre.value.trim(),
    direccion: inputDireccion.value.trim(),
    correo: inputCorreo.value.trim(),
    telefono: inputTelefono.value.trim()
  };

  if (!data.ruc || !data.nombre) {
    mensajeProveedor.textContent = "RUC y Nombre son obligatorios.";
    return;
  }

  await addDoc(proveedorCol, data);
  mensajeProveedor.textContent = "Proveedor agregado correctamente.";
  inputRUC.value = inputNombre.value = inputDireccion.value = inputCorreo.value = inputTelefono.value = "";
  mostrarProveedores();
});

// Función mostrar proveedores
async function mostrarProveedores() {
  tablaProveedor.innerHTML = "";
  const snapshot = await getDocs(proveedorCol);
  snapshot.forEach(docu => {
    const prov = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${prov.ruc}</td>
      <td>${prov.nombre}</td>
      <td>${prov.direccion}</td>
      <td>${prov.correo}</td>
      <td>${prov.telefono}</td>
      <td><button onclick="eliminarProveedor('${docu.id}')">Eliminar</button></td>
    `;
    tablaProveedor.appendChild(tr);
  });
}

// Función eliminar proveedor
window.eliminarProveedor = async (id) => {
  await deleteDoc(doc(db, "proveedores", id));
  mostrarProveedores();
};

// Función buscar proveedor por RUC o Nombre
btnBuscar.addEventListener("click", async () => {
  const busqueda = inputRUC.value.trim() || inputNombre.value.trim();
  if (!busqueda) return;
  
  const q = query(proveedorCol, where("ruc", "==", busqueda));
  let snapshot = await getDocs(q);

  if (snapshot.empty) {
    const q2 = query(proveedorCol, where("nombre", "==", busqueda));
    snapshot = await getDocs(q2);
  }

  tablaProveedor.innerHTML = "";
  if (snapshot.empty) {
    mensajeProveedor.innerHTML = `No se encontró proveedor. <button id="registrarNuevo">Desea registrar proveedor</button>`;
    document.getElementById("registrarNuevo").addEventListener("click", () => {
      mensajeProveedor.textContent = "";
    });
  } else {
    snapshot.forEach(docu => {
      const prov = docu.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${prov.ruc}</td>
        <td>${prov.nombre}</td>
        <td>${prov.direccion}</td>
        <td>${prov.correo}</td>
        <td>${prov.telefono}</td>
        <td><button onclick="eliminarProveedor('${docu.id}')">Eliminar</button></td>
      `;
      tablaProveedor.appendChild(tr);
    });
    mensajeProveedor.textContent = "";
  }
});

// Inicializar tabla
mostrarProveedores();



