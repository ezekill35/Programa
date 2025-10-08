import { db } from './firebase.js';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";

// Función genérica para cargar datos en tiempo real
function cargarColeccion(nombreColeccion, tablaID, contadorID, campos) {
  const tabla = document.getElementById(tablaID);
  const contador = document.getElementById(contadorID);
  const colRef = collection(db, nombreColeccion);

  onSnapshot(colRef, (snapshot) => {
    tabla.innerHTML = '';
    snapshot.forEach(docu => {
      const data = docu.data();
      let fila = '<tr>';
      campos.forEach(campo => { fila += `<td>${data[campo] || ''}</td>`; });
      fila += `<td><button class="btn btn-danger btn-sm" onclick="eliminarDoc('${nombreColeccion}','${docu.id}')">Eliminar</button></td></tr>`;
      tabla.innerHTML += fila;
    });
    contador.textContent = snapshot.size;
  });
}

window.eliminarDoc = async (coleccion, id) => {
  await deleteDoc(doc(db, coleccion, id));
};

// Inicializar colecciones
cargarColeccion('servicios','tablaServicios','countServicios',['nombre','precio','fecha','descripcion']);
cargarColeccion('proveedores','tablaProveedores','countProveedores',['nombre','producto','ruc','direccion']);
cargarColeccion('facturas','tablaFacturas','countFacturas',['proveedor','tipo','monto','fecha','descripcion']);
cargarColeccion('gastos','tablaGastos','countGastos',['nombre','tipo','monto','fecha']);

// Formularios
function manejarFormulario(idForm, coleccion, campos) {
  const form = document.getElementById(idForm);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const docData = {};
    campos.forEach(campo => {
      let valor = document.getElementById(campo).value;
      if(campo.includes('monto') || campo.includes('precio')) valor = parseFloat(valor) || 0;
      docData[campo.replace(idForm.replace('form','').toLowerCase(),'')] = valor;
    });
    await addDoc(collection(db, coleccion), docData);
    form.reset();
  });
}

manejarFormulario('formServicio','servicios',['nombreServ','precioServ','fechaServ','descServ']);
manejarFormulario('formProveedor','proveedores',['nombreProv','productoProv','rucProv','direccionProv']);
manejarFormulario('formFactura','facturas',['proveedorFactura','tipoFactura','montoFactura','fechaFactura','descFactura']);
manejarFormulario('formGasto','gastos',['nombreGasto','tipoGasto','montoGasto','fechaGasto']);












