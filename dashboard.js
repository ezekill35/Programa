// dashboard.js
import { auth, db } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Mostrar sección y resaltar opción activa
export function mostrarSeccion(id, elemento) {
  document.querySelectorAll('.seccion').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');

  document.querySelectorAll('.sidebar ul li').forEach(li => li.classList.remove('active'));
  elemento.classList.add('active');
}

// Cerrar sesión
export function cerrarSesion() {
  signOut(auth).then(() => {
    window.location.href = 'index.html';
  });
}

// ========================================
// FUNCIONES FIRESTORE PARA REGISTROS
// ========================================

// Llenar select de proveedores
async function cargarProveedores() {
  const select = document.getElementById('selectProveedor');
  select.innerHTML = `<option value="">Seleccionar proveedor</option>`;
  const snapshot = await getDocs(collection(db, "proveedores"));
  snapshot.forEach(doc => {
    const data = doc.data();
    select.innerHTML += `<option value="${doc.id}">${data.nombre}</option>`;
  });
  select.innerHTML += `<option value="nuevo">¿Desea registrar proveedor?</option>`;
}
cargarProveedores();

// Registrar proveedor
document.getElementById('btnRegistrarProveedor').addEventListener('click', async () => {
  const rut = document.getElementById('rutProveedor').value;
  const nombre = document.getElementById('nombreProveedor').value;
  const direccion = document.getElementById('direccionProveedor').value;
  if(rut && nombre && direccion){
    await addDoc(collection(db, "proveedores"), { rut, nombre, direccion });
    alert("Proveedor registrado!");
    cargarProveedores();
  } else alert("Complete todos los campos.");
});

// Registrar factura
document.getElementById('btnRegistrarFactura').addEventListener('click', async () => {
  const rut = document.getElementById('rutFactura').value;
  const proveedor = document.getElementById('selectProveedor').value;
  const tipo = document.getElementById('tipoFactura').value;
  const fecha = document.getElementById('fechaFactura').value;
  const descripcion = document.getElementById('descripcionFactura').value;

  if(rut && proveedor && tipo && fecha && descripcion){
    await addDoc(collection(db, "facturas"), { rut, proveedor, tipo, fecha, descripcion });
    alert("Factura registrada!");
  } else alert("Complete todos los campos.");
});

// Registrar gastos
document.getElementById('btnRegistrarGasto').addEventListener('click', async () => {
  const descripcion = document.getElementById('descripcionGasto').value;
  const monto = document.getElementById('montoGasto').value;
  const fecha = document.getElementById('fechaGasto').value;
  if(descripcion && monto && fecha){
    await addDoc(collection(db, "gastos"), { descripcion, monto, fecha });
    alert("Gasto registrado!");
  } else alert("Complete todos los campos.");
});

// Registrar servicios
document.getElementById('btnRegistrarServicio').addEventListener('click', async () => {
  const descripcion = document.getElementById('descripcionServicio').value;
  const monto = document.getElementById('montoServicio').value;
  const fecha = document.getElementById('fechaServicio').value;
  if(descripcion && monto && fecha){
    await addDoc(collection(db, "servicios"), { descripcion, monto, fecha });
    alert("Servicio registrado!");
  } else alert("Complete todos los campos.");
});




