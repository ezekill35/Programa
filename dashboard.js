import { auth, db } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// ---------- LOGOUT ----------
document.getElementById("btnLogout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ---------- MENÚ ----------
const sections = {
  menuProveedor: "sectionProveedor",
  menuFactura: "sectionFactura",
  menuGastos: "sectionGastos",
  menuServicio: "sectionServicio"
};

Object.keys(sections).forEach(menuId => {
  const menuItem = document.getElementById(menuId);
  menuItem.addEventListener("click", () => {
    Object.keys(sections).forEach(mid => document.getElementById(mid).classList.add("hidden"));
    document.getElementById(sections[menuId]).classList.remove("hidden");

    // Marcar activo
    Object.values(sections).forEach(secId => {
      document.getElementById(secId.replace("section", "menu")).classList.remove("active");
    });
    menuItem.classList.add("active");
  });
});

// ---------------- PROVEEDOR ----------------
const provList = document.getElementById("proveedorList");
const provRUC = document.getElementById("provRUC");
const provNombre = document.getElementById("provNombre");
const provDireccion = document.getElementById("provDireccion");
const searchProv = document.getElementById("searchProveedor");

async function loadProveedores(filter="") {
  provList.innerHTML = "";
  const snapshot = await getDocs(collection(db, "proveedores"));
  snapshot.forEach(docu => {
    const data = docu.data();
    if (data.ruc.includes(filter) || data.nombre.toLowerCase().includes(filter.toLowerCase())) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.ruc}</td>
        <td>${data.nombre}</td>
        <td>${data.direccion}</td>
        <td><button onclick="deleteProveedor('${docu.id}')">Eliminar</button></td>
      `;
      provList.appendChild(row);
    }
  });
}

document.getElementById("addProveedor").addEventListener("click", async () => {
  if(provRUC.value && provNombre.value && provDireccion.value){
    await addDoc(collection(db, "proveedores"), {
      ruc: provRUC.value,
      nombre: provNombre.value,
      direccion: provDireccion.value
    });
    provRUC.value = provNombre.value = provDireccion.value = "";
    loadProveedores();
  } else alert("Completa todos los campos");
});

searchProv.addEventListener("input", () => loadProveedores(searchProv.value));

window.deleteProveedor = async (id) => {
  await deleteDoc(doc(db, "proveedores", id));
  loadProveedores();
};

// ---------------- FACTURA ----------------
const factList = document.getElementById("facturaList");
const factRUC = document.getElementById("factRUC");
const factTipo = document.getElementById("factTipo");
const factDescripcion = document.getElementById("factDescripcion");
const factFecha = document.getElementById("factFecha");
const searchFact = document.getElementById("searchFactura");

async function loadFacturas(filter="") {
  factList.innerHTML = "";
  const snapshot = await getDocs(collection(db, "facturas"));
  snapshot.forEach(docu => {
    const data = docu.data();
    if (data.ruc.includes(filter) || data.descripcion.toLowerCase().includes(filter.toLowerCase())) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.ruc}</td>
        <td>${data.tipo}</td>
        <td>${data.descripcion}</td>
        <td>${data.fecha}</td>
        <td><button onclick="deleteFactura('${docu.id}')">Eliminar</button></td>
      `;
      factList.appendChild(row);
    }
  });
}

document.getElementById("addFactura").addEventListener("click", async () => {
  if(factRUC.value && factTipo.value && factDescripcion.value && factFecha.value){
    await addDoc(collection(db, "facturas"), {
      ruc: factRUC.value,
      tipo: factTipo.value,
      descripcion: factDescripcion.value,
      fecha: factFecha.value
    });
    factRUC.value = factTipo.value = factDescripcion.value = factFecha.value = "";
    loadFacturas();
  } else alert("Completa todos los campos");
});

searchFact.addEventListener("input", () => loadFacturas(searchFact.value));
window.deleteFactura = async (id) => {
  await deleteDoc(doc(db, "facturas", id));
  loadFacturas();
};

// ---------------- GASTOS ----------------
const gastoList = document.getElementById("gastoList");
const gastoDesc = document.getElementById("gastoDescripcion");
const gastoMonto = document.getElementById("gastoMonto");
const searchGasto = document.getElementById("searchGasto");

async function loadGastos(filter="") {
  gastoList.innerHTML = "";
  const snapshot = await getDocs(collection(db, "gastos"));
  snapshot.forEach(docu => {
    const data = docu.data();
    if (data.descripcion.toLowerCase().includes(filter.toLowerCase())) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.descripcion}</td>
        <td>${data.monto}</td>
        <td><button onclick="deleteGasto('${docu.id}')">Eliminar</button></td>
      `;
      gastoList.appendChild(row);
    }
  });
}

document.getElementById("addGasto").addEventListener("click", async () => {
  if(gastoDesc.value && gastoMonto.value){
    await addDoc(collection(db, "gastos"), {
      descripcion: gastoDesc.value,
      monto: gastoMonto.value
    });
    gastoDesc.value = gastoMonto.value = "";
    loadGastos();
  } else alert("Completa todos los campos");
});

searchGasto.addEventListener("input", () => loadGastos(searchGasto.value));
window.deleteGasto = async (id) => {
  await deleteDoc(doc(db, "gastos", id));
  loadGastos();
};

// ---------------- SERVICIO ----------------
const servList = document.getElementById("servicioList");
const servDesc = document.getElementById("servDescripcion");
const servCosto = document.getElementById("servCosto");
const searchServ = document.getElementById("searchServicio");

async function loadServicios(filter="") {
  servList.innerHTML = "";
  const snapshot = await getDocs(collection(db, "servicios"));
  snapshot.forEach(docu => {
    const data = docu.data();
    if (data.descripcion.toLowerCase().includes(filter.toLowerCase())) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.descripcion}</td>
        <td>${data.costo}</td>
        <td><button onclick="deleteServicio('${docu.id}')">Eliminar</button></td>
      `;
      servList.appendChild(row);
    }
  });
}

document.getElementById("addServicio").addEventListener("click", async () => {
  if(servDesc.value && servCosto.value){
    await addDoc(collection(db, "servicios"), {
      descripcion: servDesc.value,
      costo: servCosto.value
    });
    servDesc.value = servCosto.value = "";
    loadServicios();
  } else alert("Completa todos los campos");
});

searchServ.addEventListener("input", () => loadServicios(searchServ.value));
window.deleteServicio = async (id) => {
  await deleteDoc(doc(db, "servicios", id));
  loadServicios();
};

// ---------- INICIALIZACIÓN ----------
loadProveedores();
loadFacturas();
loadGastos();
loadServicios();
