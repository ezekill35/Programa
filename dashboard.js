import { db } from "./firebase.js";
import { collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Colecciones
const proveedoresCol = collection(db, 'proveedores');
const facturasCol = collection(db, 'facturas');

const proveedorSelect = document.getElementById('proveedorFactura');
const formFac = document.getElementById('formFactura');
const tablaFac = document.getElementById('tablaFacturas');

// ------------------ CARGAR PROVEEDORES EN SELECT ------------------
onSnapshot(proveedoresCol, (snapshot) => {
  proveedorSelect.innerHTML = '<option value="">Seleccione proveedor</option>';
  snapshot.forEach(doc => {
    const data = doc.data();
    const option = document.createElement('option');
    option.value = doc.id; // ID del proveedor
    option.textContent = `${data.nombre} (${data.ruc})`;
    proveedorSelect.appendChild(option);
  });
});

// ------------------ AGREGAR FACTURA ------------------
formFac.addEventListener('submit', async (e) => {
  e.preventDefault();
  const proveedorId = proveedorSelect.value;
  if(!proveedorId) { alert("Seleccione un proveedor"); return; }

  await addDoc(facturasCol, {
    proveedor: proveedorId,
    tipo: formFac.tipoFactura.value,
    monto: parseFloat(formFac.montoFactura.value),
    moneda: document.getElementById('monedaFactura').value,
    fecha: formFac.fechaFactura.value,
    descripcion: formFac.descFactura.value
  });

  formFac.reset();
});

// ------------------ MOSTRAR FACTURAS ------------------
onSnapshot(facturasCol, async (snapshot) => {
  tablaFac.innerHTML = '';
  for(const docSnap of snapshot.docs){
    const data = docSnap.data();
    // Obtener nombre del proveedor en tiempo real
    const provDoc = await proveedoresCol.doc(data.proveedor).get(); // Si usas modular: usa getDoc()
    const provNombre = provDoc.exists ? provDoc.data().nombre : "Desconocido";
    const provRuc = provDoc.exists ? provDoc.data().ruc : "--";

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${provNombre} (${provRuc})</td>
      <td>${data.tipo}</td>
      <td>${data.monto.toLocaleString('es-PE', {style:'currency', currency:data.moneda})}</td>
      <td>${data.fecha}</td>
      <td>${data.descripcion}</td>
      <td>
        <button class="btn btn-sm btn-warning editFac">Editar</button>
        <button class="btn btn-sm btn-danger delFac">Eliminar</button>
      </td>`;
    tablaFac.appendChild(tr);

    tr.querySelector('.delFac').addEventListener('click', ()=> deleteDoc(doc(db, 'facturas', docSnap.id)));
  }
});




