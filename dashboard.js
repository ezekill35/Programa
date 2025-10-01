import { db, auth } from "./firebase.js";
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ================== Secciones ==================
function mostrarSeccion(id){
  document.querySelectorAll(".seccion").forEach(sec => sec.classList.add("oculto"));
  document.getElementById(id).classList.remove("oculto");
}

// ================== Cargar tablas ==================
async function cargarDatos(coleccion, tablaId){
  const tabla = document.getElementById(tablaId);
  tabla.innerHTML = "";
  const snapshot = await getDocs(collection(db, coleccion));
  snapshot.forEach(docu => {
    const data = docu.data();
    let fila = "<tr>";
    Object.values(data).forEach(valor => fila += `<td>${valor}</td>`);
    fila += `<td><button onclick="eliminarRegistro('${coleccion}','${docu.id}')">❌ Eliminar</button></td>`;
    fila += "</tr>";
    tabla.innerHTML += fila;
  });
}

// ================== CRUD ==================
async function agregarProveedor(e){
  e.preventDefault();
  const form = e.target;
  const rut = form.rut.value;
  const nombre = form.nombre.value;
  const direccion = form.direccion.value;
  const telefono = form.telefono.value;
  try{
    await addDoc(collection(db,"proveedores"), {rut,nombre,direccion,telefono});
    document.getElementById("mensajeProveedor").textContent = "✅ Proveedor agregado";
    document.getElementById("mensajeProveedor").style.color="#27ae60";
    form.reset();
    cargarTodo();
  } catch(e){
    document.getElementById("mensajeProveedor").textContent = "❌ Error al agregar proveedor";
    document.getElementById("mensajeProveedor").style.color="#e74c3c";
  }
}

async function agregarFactura(e){
  e.preventDefault();
  const form = e.target;
  const numero = form.numero.value;
  const rutProveedor = form.rutProveedor.value;
  const fecha = form.fecha.value;
  const monto = form.monto.value;

  // Buscar nombre del proveedor
  const q = query(collection(db,"proveedores"), where("rut","==",rutProveedor));
  const snap = await getDocs(q);
  let nombreProveedor = "";
  snap.forEach(d => { nombreProveedor = d.data().nombre; });
  form.nombreProveedor.value = nombreProveedor || "No encontrado";

  try{
    await addDoc(collection(db,"facturas"), {numero,rutProveedor,nombreProveedor,fecha,monto});
    document.getElementById("mensajeFactura").textContent = "✅ Factura agregada";
    document.getElementById("mensajeFactura").style.color="#27ae60";
    form.reset();
    cargarTodo();
  } catch(e){
    document.getElementById("mensajeFactura").textContent = "❌ Error al agregar factura";
    document.getElementById("mensajeFactura").style.color="#e74c3c";
  }
}

// ================== Eliminar ==================
window.eliminarRegistro = async (coleccion,id)=>{
  await deleteDoc(doc(db,coleccion,id));
  cargarTodo();
}

// ================== Buscadores ==================
function activarBuscador(inputId, tablaId){
  const input = document.getElementById(inputId);
  input.addEventListener("keyup", ()=>{
    const filtro = input.value.toLowerCase();
    document.querySelectorAll(`#${tablaId} tr`).forEach(fila=>{
      fila.style.display = fila.innerText.toLowerCase().includes(filtro) ? "" : "none";
    });
  });
}

// ================== Cargar todo ==================
async function cargarTodo(){
  await cargarDatos("proveedores","tablaProveedores");
  await cargarDatos("facturas","tablaFacturas");
}

document.getElementById("formProveedor").addEventListener("submit", agregarProveedor);
document.getElementById("formFactura").addEventListener("submit", agregarFactura);

activarBuscador("buscarProveedores","tablaProveedores");
activarBuscador("buscarFacturas","tablaFacturas");

// ================== Logout ==================
document.getElementById("btnLogout").addEventListener("click", async ()=>{
  await signOut(auth);
  window.location.href="index.html";
});

// Ejecutar al inicio
cargarTodo();



