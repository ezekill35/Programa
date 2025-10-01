import { auth, db, signOut, collection, addDoc, getDocs, deleteDoc, doc, query, where } from "./firebase.js";

// Menú y secciones
const menuItems = {
  menuProveedor: "sectionProveedor",
  menuFactura: "sectionFactura",
  menuGastos: "sectionGastos",
  menuServicio: "sectionServicio",
};

Object.keys(menuItems).forEach(menuId => {
  document.getElementById(menuId).addEventListener("click", () => {
    // Resaltar opción seleccionada
    Object.keys(menuItems).forEach(m => document.getElementById(m).classList.remove("active"));
    document.getElementById(menuId).classList.add("active");

    // Mostrar la sección correspondiente
    Object.values(menuItems).forEach(sec => document.getElementById(sec).classList.add("hidden"));
    document.getElementById(menuItems[menuId]).classList.remove("hidden");
  });
});

// Cerrar sesión
document.getElementById("btnLogout").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
});

// Funciones para CRUD simplificado de Firestore (Proveedor como ejemplo)
const tablaProveedor = document.getElementById("tablaProveedor");
const btnAddProveedor = document.getElementById("btnAddProveedor");
const searchProveedor = document.getElementById("searchProveedor");

async function cargarProveedores() {
  tablaProveedor.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "proveedores"));
  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.ruc}</td>
      <td>${data.nombre}</td>
      <td>${data.direccion}</td>
      <td><button onclick="eliminarProveedor('${docSnap.id}')">Eliminar</button></td>
    `;
    tablaProveedor.appendChild(tr);
  });
}

window.eliminarProveedor = async (id) => {
  await deleteDoc(doc(db, "proveedores", id));
  cargarProveedores();
}

btnAddProveedor.addEventListener("click", async () => {
  const ruc = document.getElementById("provRUC").value;
  const nombre = document.getElementById("provNombre").value;
  const direccion = document.getElementById("provDireccion").value;

  if(ruc && nombre && direccion) {
    await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion });
    cargarProveedores();
    document.getElementById("provRUC").value = "";
    document.getElementById("provNombre").value = "";
    document.getElementById("provDireccion").value = "";
  }
});

searchProveedor.addEventListener("input", async () => {
  const valor = searchProveedor.value.toLowerCase();
  const querySnapshot = await getDocs(collection(db, "proveedores"));
  tablaProveedor.innerHTML = "";
  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    if(data.ruc.toLowerCase().includes(valor) || data.nombre.toLowerCase().includes(valor)){
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${data.ruc}</td>
        <td>${data.nombre}</td>
        <td>${data.direccion}</td>
        <td><button onclick="eliminarProveedor('${docSnap.id}')">Eliminar</button></td>
      `;
      tablaProveedor.appendChild(tr);
    }
  });
});

// Inicializar
cargarProveedores();


