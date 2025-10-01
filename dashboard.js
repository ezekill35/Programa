// dashboard.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// SECCIONES Y MENÚ
const sections = {
  menuReportes: document.getElementById("sectionReportes"),
  menuProveedor: document.getElementById("sectionProveedor"),
  menuFactura: document.getElementById("sectionFactura"),
  menuGastos: document.getElementById("sectionGastos"),
  menuServicio: document.getElementById("sectionServicio")
};

const menuItems = document.querySelectorAll(".sidebar ul li");

// Función para cambiar sección visible
menuItems.forEach(item => {
  item.addEventListener("click", () => {
    // Resaltar opción seleccionada
    menuItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    // Mostrar solo la sección seleccionada
    Object.keys(sections).forEach(key => {
      sections[key].classList.add("hidden");
    });

    const sectionId = "section" + item.id.replace("menu", "");
    if (document.getElementById(sectionId)) {
      document.getElementById(sectionId).classList.remove("hidden");
    }

    // Cerrar sesión
    if (item.id === "btnCerrarSesion") {
      alert("Sesión cerrada");
      // Aquí podrías redirigir al login: location.href = "index.html";
    }
  });
});

// -------------------------
// FUNCIONES PROVEEDOR
// -------------------------
const listaProveedor = document.getElementById("listaProveedor");
const btnAgregarProveedor = document.getElementById("btnAgregarProveedor");
const buscarProveedor = document.getElementById("buscarProveedor");

async function listarProveedores(filter = "") {
  listaProveedor.innerHTML = "";
  const colRef = collection(db, "proveedores");
  const docsSnap = await getDocs(colRef);

  docsSnap.forEach(docu => {
    const data = docu.data();
    if (filter === "" || data.ruc.includes(filter) || data.nombre.toLowerCase().includes(filter.toLowerCase())) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.ruc}</td>
        <td>${data.nombre}</td>
        <td>${data.correo}</td>
        <td>${data.telefono}</td>
        <td>${data.direccion}</td>
        <td><button data-id="${docu.id}" class="eliminarProveedor">Eliminar</button></td>
      `;
      listaProveedor.appendChild(row);
    }
  });

  document.querySelectorAll(".eliminarProveedor").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");
      await deleteDoc(doc(db, "proveedores", id));
      listarProveedores();
    });
  });
}

btnAgregarProveedor.addEventListener("click", async () => {
  const ruc = document.getElementById("provRuc").value;
  const nombre = document.getElementById("provNombre").value;
  const correo = document.getElementById("provCorreo").value;
  const telefono = document.getElementById("provTelefono").value;
  const direccion = document.getElementById("provDireccion").value;

  if (ruc && nombre) {
    await addDoc(collection(db, "proveedores"), { ruc, nombre, correo, telefono, direccion });
    listarProveedores();
  } else {
    alert("RUC y Nombre son obligatorios");
  }
});

buscarProveedor.addEventListener("input", () => {
  listarProveedores(buscarProveedor.value);
});

listarProveedores();

// -------------------------
// FUNCIONES FACTURA
// -------------------------
const listaFactura = document.getElementById("listaFactura");
const btnAgregarFactura = document.getElementById("btnAgregarFactura");
const buscarFactura = document.getElementById("buscarFactura");

async function listarFacturas(filter = "") {
  listaFactura.innerHTML = "";
  const colRef = collection(db, "facturas");
  const docsSnap = await getDocs(colRef);

  docsSnap.forEach(docu => {
    const data = docu.data();
    if (filter === "" || data.ruc.includes(filter)) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.ruc}</td>
        <td>${data.tipo}</td>
        <td>${data.descripcion}</td>
        <td>${data.fecha}</td>
        <td><button data-id="${docu.id}" class="eliminarFactura">Eliminar</button></td>
      `;
      listaFactura.appendChild(row);
    }
  });

  document.querySelectorAll(".eliminarFactura").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");
      await deleteDoc(doc(db, "facturas", id));
      listarFacturas();
    });
  });
}

btnAgregarFactura.addEventListener("click", async () => {
  const ruc = document.getElementById("factRuc").value;
  const tipo = document.getElementById("factTipo").value;
  const descripcion = document.getElementById("factDescripcion").value;
  const fecha = document.getElementById("factFecha").value;

  if (ruc && tipo) {
    await addDoc(collection(db, "facturas"), { ruc, tipo, descripcion, fecha });
    listarFacturas();
  } else {
    alert("RUC y Tipo de factura son obligatorios");
  }
});

buscarFactura.addEventListener("input", () => {
  listarFacturas(buscarFactura.value);
});

listarFacturas();

