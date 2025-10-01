import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { app } from "./firebase.js"; // tu firebase.js exporta "app"

const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  // --- MENU ---
  const menuBtns = document.querySelectorAll(".menu-btn");
  menuBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if(btn.id === "btnLogout") {
        signOut(auth).then(() => location.href = "index.html");
        return;
      }
      // Mostrar sección
      const sectionId = btn.dataset.section;
      document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
      document.getElementById(sectionId).classList.add("active");

      // Activar botón
      menuBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // --- FUNCIONES CRUD ---

  // PROVEEDOR
  const tablaProveedor = document.getElementById("tablaProveedor");

  async function listarProveedor() {
    tablaProveedor.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "proveedores"));
    querySnapshot.forEach(docu => {
      const data = docu.data();
      tablaProveedor.innerHTML += `
        <tr>
          <td>${data.ruc}</td>
          <td>${data.nombre}</td>
          <td>${data.direccion}</td>
          <td><button onclick="eliminarProveedor('${docu.id}')">Eliminar</button></td>
        </tr>
      `;
    });
  }

  window.eliminarProveedor = async (id) => {
    await deleteDoc(doc(db, "proveedores", id));
    listarProveedor();
  };

  document.getElementById("btnAddProveedor").addEventListener("click", async () => {
    const ruc = document.getElementById("provRUC").value;
    const nombre = document.getElementById("provNombre").value;
    const direccion = document.getElementById("provDireccion").value;
    if(!ruc || !nombre) return alert("RUC y Nombre obligatorios");
    await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion });
    listarProveedor();
  });

  document.getElementById("btnSearchProveedor").addEventListener("click", async () => {
    const search = document.getElementById("searchProveedor").value.toLowerCase();
    tablaProveedor.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "proveedores"));
    querySnapshot.forEach(docu => {
      const data = docu.data();
      if(data.ruc.toLowerCase().includes(search) || data.nombre.toLowerCase().includes(search)){
        tablaProveedor.innerHTML += `
          <tr>
            <td>${data.ruc}</td>
            <td>${data.nombre}</td>
            <td>${data.direccion}</td>
            <td><button onclick="eliminarProveedor('${docu.id}')">Eliminar</button></td>
          </tr>
        `;
      }
    });
  });

  listarProveedor();

  // --- FACTURA, GASTOS, SERVICIO ---
  // Mismo patrón que proveedor, solo cambia colección y campos
  // FACTURA
  const tablaFactura = document.getElementById("tablaFactura");
  async function listarFactura() {
    tablaFactura.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "facturas"));
    querySnapshot.forEach(docu => {
      const data = docu.data();
      tablaFactura.innerHTML += `
        <tr>
          <td>${data.ruc}</td>
          <td>${data.descripcion}</td>
          <td>${data.fecha}</td>
          <td><button onclick="eliminarFactura('${docu.id}')">Eliminar</button></td>
        </tr>
      `;
    });
  }
  window.eliminarFactura = async (id) => { await deleteDoc(doc(db, "facturas", id)); listarFactura(); };
  document.getElementById("btnAddFactura").addEventListener("click", async () => {
    const ruc = document.getElementById("factRUC").value;
    const descripcion = document.getElementById("factDescripcion").value;
    const fecha = document.getElementById("factFecha").value;
    if(!ruc || !descripcion) return alert("RUC y Descripción obligatorios");
    await addDoc(collection(db, "facturas"), { ruc, descripcion, fecha });
    listarFactura();
  });
  document.getElementById("btnSearchFactura").addEventListener("click", async () => {
    const search = document.getElementById("searchFactura").value.toLowerCase();
    tablaFactura.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "facturas"));
    querySnapshot.forEach(docu => {
      const data = docu.data();
      if(data.ruc.toLowerCase().includes(search)) {
        tablaFactura.innerHTML += `
          <tr>
            <td>${data.ruc}</td>
            <td>${data.descripcion}</td>
            <td>${data.fecha}</td>
            <td><button onclick="eliminarFactura('${docu.id}')">Eliminar</button></td>
          </tr>
        `;
      }
    });
  });
  listarFactura();

  // GASTOS
  const tablaGasto = document.getElementById("tablaGasto");
  async function listarGasto() {
    tablaGasto.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "gastos"));
    querySnapshot.forEach(docu => {
      const data = docu.data();
      tablaGasto.innerHTML += `
        <tr>
          <td>${data.descripcion}</td>
          <td>${data.monto}</td>
          <td><button onclick="eliminarGasto('${docu.id}')">Eliminar</button></td>
        </tr>
      `;
    });
  }
  window.eliminarGasto = async (id) => { await deleteDoc(doc(db, "gastos", id)); listarGasto(); };
  document.getElementById("btnAddGasto").addEventListener("click", async () => {
    const descripcion = document.getElementById("gastoDescripcion").value;
    const monto = document.getElementById("gastoMonto").value;
    if(!descripcion || !monto) return alert("Campos obligatorios");
    await addDoc(collection(db, "gastos"), { descripcion, monto });
    listarGasto();
  });
  document.getElementById("btnSearchGasto").addEventListener("click", async () => {
    const search = document.getElementById("searchGasto").value.toLowerCase();
    tablaGasto.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "gastos"));
    querySnapshot.forEach(docu => {
      const data = docu.data();
      if(data.descripcion.toLowerCase().includes(search)) {
        tablaGasto.innerHTML += `
          <tr>
            <td>${data.descripcion}</td>
            <td>${data.monto}</td>
            <td><button onclick="eliminarGasto('${docu.id}')">Eliminar</button></td>
          </tr>
        `;
      }
    });
  });
  listarGasto();

  // SERVICIO
  const tablaServicio = document.getElementById("tablaServicio");
  async function listarServicio() {
    tablaServicio.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "servicios"));
    querySnapshot.forEach(docu => {
      const data = docu.data();
      tablaServicio.innerHTML += `
        <tr>
          <td>${data.descripcion}</td>
          <td>${data.monto}</td>
          <td><button onclick="eliminarServicio('${docu.id}')">Eliminar</button></td>
        </tr>
      `;
    });
  }
  window.eliminarServicio = async (id) => { await deleteDoc(doc(db, "servicios", id)); listarServicio(); };
  document.getElementById("btnAddServicio").addEventListener("click", async () => {
    const descripcion = document.getElementById("servDescripcion").value;
    const monto = document.getElementById("servMonto").value;
    if(!descripcion || !monto) return alert("Campos obligatorios");
    await addDoc(collection(db, "servicios"), { descripcion, monto });
    listarServicio();
  });
  document.getElementById("btnSearchServicio").addEventListener("click", async () => {
    const search = document.getElementById("searchServicio").value.toLowerCase();
    tablaServicio.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "servicios"));
    querySnapshot.forEach(docu => {
      const data = docu.data();
      if(data.descripcion.toLowerCase().includes(search)) {
        tablaServicio.innerHTML += `
          <tr>
            <td>${data.descripcion}</td>
            <td>${data.monto}</td>
            <td><button onclick="eliminarServicio('${docu.id}')">Eliminar</button></td>
          </tr>
        `;
      }
    });
  });
  listarServicio();
});
