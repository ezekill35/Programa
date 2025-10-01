// dashboard.js
import { auth, db } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// MENU
const menu = ["Proveedor","Factura","Gastos","Servicio"];
menu.forEach(item => {
  const el = document.getElementById("menu"+item);
  el.addEventListener("click", () => {
    menu.forEach(i => {
      document.getElementById("menu"+i).classList.remove("active");
      document.getElementById("seccion"+i).classList.add("hidden");
    });
    el.classList.add("active");
    document.getElementById("seccion"+item).classList.remove("hidden");
  });
});

// CERRAR SESION
document.getElementById("btnLogout").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
});

// PROVEEDOR
const tablaProveedor = document.getElementById("tablaProveedor").querySelector("tbody");
const cargarProveedores = async () => {
  tablaProveedor.innerHTML = "";
  const snapshot = await getDocs(collection(db,"proveedores"));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.ruc}</td>
      <td>${data.nombre}</td>
      <td>${data.direccion}</td>
      <td><button data-id="${docSnap.id}" class="btnEliminar">Eliminar</button></td>
    `;
    tablaProveedor.appendChild(row);
  });
  document.querySelectorAll(".btnEliminar").forEach(btn => {
    btn.addEventListener("click", async e => {
      await deleteDoc(doc(db,"proveedores",e.target.dataset.id));
      cargarProveedores();
    });
  });
};
document.getElementById("btnAgregarProveedor").addEventListener("click", async () => {
  const ruc = document.getElementById("provRuc").value;
  const nombre = document.getElementById("provNombre").value;
  const direccion = document.getElementById("provDireccion").value;
  if(!ruc||!nombre||!direccion) return alert("Completa todos los campos");
  await addDoc(collection(db,"proveedores"),{ruc,nombre,direccion});
  cargarProveedores();
});
document.getElementById("buscarProveedor").addEventListener("input", async e => {
  const val = e.target.value.toLowerCase();
  tablaProveedor.innerHTML = "";
  const snapshot = await getDocs(collection(db,"proveedores"));
  snapshot.forEach(docSnap=>{
    const data = docSnap.data();
    if(data.ruc.toLowerCase().includes(val)||data.nombre.toLowerCase().includes(val)){
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.ruc}</td>
        <td>${data.nombre}</td>
        <td>${data.direccion}</td>
        <td><button data-id="${docSnap.id}" class="btnEliminar">Eliminar</button></td>
      `;
      tablaProveedor.appendChild(row);
    }
  });
  document.querySelectorAll(".btnEliminar").forEach(btn => {
    btn.addEventListener("click", async e => {
      await deleteDoc(doc(db,"proveedores",e.target.dataset.id));
      cargarProveedores();
    });
  });
});
cargarProveedores();

// Las demás secciones (Factura, Gastos, Servicio) se implementan igual que Proveedor
// Por simplicidad en este ejemplo, puedes duplicar la lógica cambiando IDs y colecciones:
// factura -> collection(db,"facturas")
// gastos -> collection(db,"gastos")
// servicio -> collection(db,"servicios")



