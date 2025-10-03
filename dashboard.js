import { db, auth, cerrarSesion } from './firebase.js';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Collections
const proveedoresCol = collection(db, "proveedores");

// Variables
let proveedores = [];

// Contadores
const totalProveedores = document.getElementById('total-proveedores');

// Listado
const listaProveedores = document.getElementById('listaProveedores');
const btnAgregarProveedor = document.getElementById('btnAgregarProveedor');

btnAgregarProveedor.addEventListener('click', async () => {
  const ruc = document.getElementById('provRuc').value.trim();
  const nombre = document.getElementById('provNombre').value.trim();
  const direccion = document.getElementById('provDireccion').value.trim();
  const telefono = document.getElementById('provTelefono').value.trim();
  const producto = document.getElementById('provProducto').value.trim();

  if(!ruc || !nombre) return alert("RUC y Nombre son obligatorios");
  if(isNaN(ruc) || isNaN(telefono)) return alert("RUC y Teléfono deben ser números");

  await addDoc(proveedoresCol, { ruc, nombre, direccion, telefono, producto });
  document.getElementById('formProveedor').reset();
});

// Tiempo real
onSnapshot(proveedoresCol, snapshot => {
  proveedores = [];
  snapshot.forEach(doc => proveedores.push({ id: doc.id, ...doc.data() }));
  actualizarProveedores();
});

function actualizarProveedores() {
  listaProveedores.innerHTML = '';
  proveedores.forEach(p => {
    listaProveedores.innerHTML += `
      <tr>
        <td>${p.ruc}</td>
        <td>${p.nombre}</td>
        <td>${p.direccion}</td>
        <td>${p.telefono}</td>
        <td>${p.producto}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editarProveedor('${p.id}')">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarProveedorFirebase('${p.id}')">❌</button>
        </td>
      </tr>
    `;
  });
  totalProveedores.textContent = proveedores.length;
}

window.editarProveedor = async (id) => {
  const p = proveedores.find(x => x.id === id);
  const nombre = prompt("Nombre:", p.nombre) || p.nombre;
  await updateDoc(doc(db,"proveedores",id), { nombre });
}

window.eliminarProveedorFirebase = async (id) => {
  if(confirm("Eliminar proveedor?")) await deleteDoc(doc(db,"proveedores",id));
}

// Menu lateral
const menuItems = document.querySelectorAll('.sidebar ul li a');
const sections = document.querySelectorAll('.section');

menuItems.forEach(item=>{
  item.addEventListener('click',()=>{
    menuItems.forEach(i=>i.classList.remove('active'));
    sections.forEach(s=>s.classList.remove('active'));
    item.classList.add('active');
    const id = item.id.replace('menu-','');
    if(id==='logout'){
      cerrarSesion();
      return;
    }
    document.getElementById(id).classList.add('active');
  });
});






