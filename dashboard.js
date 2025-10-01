// dashboard.js
import { db, auth } from "./firebase.js";
import { 
  collection, getDocs, addDoc, deleteDoc, doc, query, where 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// ================== Secciones ==================
function mostrarSeccion(id){
  document.querySelectorAll(".seccion").forEach(sec => sec.classList.add("oculto"));
  document.getElementById(id).classList.remove("oculto");
}

// ================== Cargar datos ==================
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

// ================== CRUD Proveedor ==================
async function agregarProveedor(e){
  e.preventDefault();
  const form = e.target;
  const ruc = form.ruc.value;
  const nombre = form.nombre.value;
  const direccion = form.direccion.value;
  const telefono = form.telefono.value;
  try {
    await addDoc(collection(db,"proveedores"), {ruc,nombre,direccion,telefono});
    form.reset();
    cargarTodo();
    alert("✅ Proveedor agregado correctamente.");
  } catch(e){
    alert("❌ Error al agregar proveedor: " + e.message);
  }
}

// ================== CRUD Factura ==================
async function agregarFactura(e){
  e.preventDefault();
  const form = e.target;
  const ruc = form.inputRUC.value;
  const tipo = form.tipo.value;
  const serie = form.serie.value;
  const fecha = form.fecha.value;
  const subtotal = parseFloat(form.subtotal.value);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;
  const observaciones = form.observaciones.value;

  // Buscar proveedor por RUC
  const q = query(collection(db,"proveedores"), where("ruc","==",ruc));
  const snap = await getDocs(q);
  let nombreProveedor = "";
  let direccionProveedor = "";
  snap.forEach(d => { 
    nombreProveedor = d.data().nombre; 
    direccionProveedor = d.data().direccion;
  });

  if(!nombreProveedor){
    alert("⚠️ Proveedor no encontrado. Por favor regístrelo primero.");
    return;
  }

  try {
    await addDoc(collection(db,"facturas"), {
      ruc, nombreProveedor, direccionProveedor, tipo, serie, fecha, subtotal, igv, total, observaciones
    });
    form.reset();
    document.getElementById("nombreProveedor").textContent = "";
    document.getElementById("direccionProveedor").value = "";
    cargarTodo();
    alert("✅ Factura agregada correctamente.");
  } catch(e){
    alert("❌ Error al agregar factura: " + e.message);
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

// ================== Actualizar datos dinámicos factura ==================
document.getElementById("inputRUC").addEventListener("input", async ()=>{
  const ruc = document.getElementById("inputRUC").value;
  const q = query(collection(db,"proveedores"), where("ruc","==",ruc));
  const snap = await getDocs(q);
  let nombreProveedor = "";
  let direccionProveedor = "";
  snap.forEach(d => { 
    nombreProveedor = d.data().nombre; 
    direccionProveedor = d.data().direccion;
  });
  document.getElementById("nombreProveedor").textContent = nombreProveedor ? `Proveedor: ${nombreProveedor}` : "Proveedor no encontrado";
  document.getElementById("direccionProveedor").value = direccionProveedor;
});

// Calcular IGV y total automáticamente
document.getElementById("subtotal").addEventListener("input", ()=>{
  const subtotal = parseFloat(document.getElementById("subtotal").value) || 0;
  const igv = subtotal * 0.18;
  const total = subtotal + igv;
  document.getElementById("igv").value = igv.toFixed(2);
  document.getElementById("total").value = total.toFixed(2);
});

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



