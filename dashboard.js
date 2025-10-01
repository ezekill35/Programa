// dashboard.js
import { db, auth } from "./firebase.js";
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// ================== Mostrar secciones ==================
function mostrarSeccion(id){
  document.querySelectorAll(".seccion").forEach(sec => sec.classList.add("oculto"));
  document.getElementById(id).classList.remove("oculto");
}

// ================== CRUD genérico ==================
async function agregarDocumento(form, coleccion, camposExtra = {}) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {};
    Array.from(form.elements).forEach(el => {
      if(el.name) data[el.name] = el.value;
    });
    Object.assign(data, camposExtra);
    try {
      await addDoc(collection(db, coleccion), data);
      form.reset();
      cargarTodo();
    } catch (err) {
      console.error("Error:", err);
    }
  });
}

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

// ================== Eliminar ==================
window.eliminarRegistro = async (coleccion, id)=>{
  await deleteDoc(doc(db, coleccion, id));
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

// ================== Inicializar formularios ==================
function inicializar(){
  const forms = [
    {id:"formProveedor", coleccion:"proveedores", tabla:"tablaProveedores"},
    {id:"formFactura", coleccion:"facturas", tabla:"tablaFacturas"},
    {id:"formServicio", coleccion:"servicios", tabla:"tablaServicios"},
    {id:"formVenta", coleccion:"ventas", tabla:"tablaVentas"},
    {id:"formGasto", coleccion:"gastos", tabla:"tablaGastos"},
  ];

  forms.forEach(f=>{
    const formEl = document.getElementById(f.id);
    agregarDocumento(formEl, f.coleccion);
    activarBuscador("buscar"+f.coleccion.charAt(0).toUpperCase()+f.coleccion.slice(1), f.tabla);
  });
}

// ================== Cargar todo ==================
async function cargarTodo(){
  const colecciones = [
    {coleccion:"proveedores", tabla:"tablaProveedores"},
    {coleccion:"facturas", tabla:"tablaFacturas"},
    {coleccion:"servicios", tabla:"tablaServicios"},
    {coleccion:"ventas", tabla:"tablaVentas"},
    {coleccion:"gastos", tabla:"tablaGastos"}
  ];
  for(const c of colecciones){
    await cargarDatos(c.coleccion, c.tabla);
  }
}

// ================== Logout ==================
document.getElementById("btnLogout").addEventListener("click", async ()=>{
  await signOut(auth);
  window.location.href="index.html";
});

// Ejecutar al inicio
inicializar();
cargarTodo();

// ================== Mostrar secciones ==================
window.mostrarSeccion = mostrarSeccion;



