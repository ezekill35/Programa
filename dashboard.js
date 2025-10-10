import { db } from './firebase.js';
import { 
  collection, addDoc, onSnapshot, deleteDoc, doc, getDocs, query, where 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// -------------------- REFERENCIAS --------------------
const tablaProveedores = document.getElementById('tablaProveedores');
const tablaProductos = document.getElementById('tablaProductos');
const tablaFacturas = document.getElementById('tablaFacturas');
const selectProveedorFactura = document.getElementById('proveedorFactura');
const selectProductoFactura = document.getElementById('productoFactura');
const buscador = document.getElementById('buscadorFactura');

// -------------------- VALIDACIONES --------------------
document.getElementById('rucProveedor').addEventListener('input', e => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
});
document.getElementById('numeroFactura').addEventListener('input', e => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

// -------------------- CRUD PROVEEDORES --------------------
document.getElementById('guardarProveedor').addEventListener('click', async () => {
  const ruc = document.getElementById('rucProveedor').value;
  const nombre = document.getElementById('nombreProveedor').value;
  const direccion = document.getElementById('direccionProveedor').value;

  if (!ruc || !nombre || !direccion) return alert("Complete todos los campos del proveedor");

  await addDoc(collection(db, 'proveedores'), { ruc, nombre, direccion });

  document.getElementById('rucProveedor').value = '';
  document.getElementById('nombreProveedor').value = '';
  document.getElementById('direccionProveedor').value = '';
});

onSnapshot(collection(db, 'proveedores'), snapshot => {
  tablaProveedores.innerHTML = '';
  selectProveedorFactura.innerHTML = '<option value="" disabled selected>Seleccione proveedor</option>';

  snapshot.forEach(docSnap => {
    const prov = docSnap.data();
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${prov.ruc}</td>
      <td>${prov.nombre}</td>
      <td>${prov.direccion}</td>
      <td>
        <button class="btn btn-edit" onclick="editarProveedor('${docSnap.id}', '${prov.ruc}', '${prov.nombre}', '${prov.direccion}')">Editar</button>
        <button class="btn btn-delete" onclick="eliminarProveedor('${docSnap.id}')">Eliminar</button>
      </td>`;
    tablaProveedores.appendChild(row);

    const option = document.createElement('option');
    option.value = prov.nombre;
    option.textContent = prov.nombre;
    selectProveedorFactura.appendChild(option);
  });
});

window.eliminarProveedor = async id => await deleteDoc(doc(db, 'proveedores', id));

window.editarProveedor = async (id, ruc, nombre, direccion) => {
  const nuevoRuc = prompt("Nuevo RUC:", ruc);
  const nuevoNombre = prompt("Nuevo nombre:", nombre);
  const nuevaDireccion = prompt("Nueva dirección:", direccion);

  if (nuevoRuc && nuevoNombre && nuevaDireccion) {
    await deleteDoc(doc(db, 'proveedores', id));
    await addDoc(collection(db, 'proveedores'), {
      ruc: nuevoRuc, nombre: nuevoNombre, direccion: nuevaDireccion
    });
  }
};

// -------------------- CRUD PRODUCTOS --------------------
document.getElementById('guardarProducto').addEventListener('click', async () => {
  const nombre = document.getElementById('nombreProducto').value;
  const cantidad = document.getElementById('cantidadProducto').value;
  const unidad = document.getElementById('unidadProducto').value;
  const valor = document.getElementById('valorUnitarioProducto').value;

  if (!nombre || !cantidad || !unidad || !valor) return alert("Complete todos los campos del producto");

  await addDoc(collection(db, 'productos'), {
    nombre,
    cantidad,
    unidad,
    valor: parseFloat(valor)
  });

  document.getElementById('nombreProducto').value = '';
  document.getElementById('cantidadProducto').value = '';
  document.getElementById('unidadProducto').value = '';
  document.getElementById('valorUnitarioProducto').value = '';
});

onSnapshot(collection(db, 'productos'), snapshot => {
  tablaProductos.innerHTML = '';
  selectProductoFactura.innerHTML = '<option value="" disabled selected>Seleccione producto</option>';

  snapshot.forEach(docSnap => {
    const prod = docSnap.data();
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${prod.nombre}</td>
      <td>${prod.cantidad}</td>
      <td>${prod.unidad}</td>
      <td>${prod.valor}</td>
      <td>
        <button class="btn btn-edit" onclick="editarProducto('${docSnap.id}', '${prod.nombre}', '${prod.cantidad}', '${prod.unidad}', '${prod.valor}')">Editar</button>
        <button class="btn btn-delete" onclick="eliminarProducto('${docSnap.id}')">Eliminar</button>
      </td>`;
    tablaProductos.appendChild(row);

    const option = document.createElement('option');
    option.value = prod.nombre;
    option.textContent = prod.nombre;
    selectProductoFactura.appendChild(option);
  });
});

window.eliminarProducto = async id => await deleteDoc(doc(db, 'productos', id));

window.editarProducto = async (id, nombre, cantidad, unidad, valor) => {
  const nuevoNombre = prompt("Nuevo nombre:", nombre);
  const nuevaCantidad = prompt("Nueva cantidad:", cantidad);
  const nuevaUnidad = prompt("Nueva unidad:", unidad);
  const nuevoValor = prompt("Nuevo valor:", valor);

  if (nuevoNombre && nuevaCantidad && nuevaUnidad && nuevoValor) {
    await deleteDoc(doc(db, 'productos', id));
    await addDoc(collection(db, 'productos'), {
      nombre: nuevoNombre,
      cantidad: nuevaCantidad,
      unidad: nuevaUnidad,
      valor: parseFloat(nuevoValor)
    });
  }
};

// -------------------- CRUD FACTURAS --------------------
document.getElementById('guardarFactura').addEventListener('click', async () => {
  const numero = document.getElementById('numeroFactura').value;
  const proveedor = selectProveedorFactura.value;
  const producto = selectProductoFactura.value;
  const monto = document.getElementById('montoFactura').value;
  const tipo = document.getElementById('tipoFactura').value;

  if (!numero || !proveedor || !producto || !monto) return alert("Complete todos los campos de la factura");

  await addDoc(collection(db, 'facturas'), {
    numero,
    proveedor,
    producto,
    monto,
    tipo
  });

  document.getElementById('numeroFactura').value = '';
  document.getElementById('montoFactura').value = '';
  selectProveedorFactura.selectedIndex = 0;
  selectProductoFactura.selectedIndex = 0;
});

// Función para renderizar facturas
function renderFacturas(snapshot) {
  tablaFacturas.innerHTML = '';
  snapshot.forEach(docSnap => {
    const fac = docSnap.data();
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${fac.numero}</td>
      <td class="link" onclick="verProveedor('${fac.proveedor}')">${fac.proveedor}</td>
      <td class="link" onclick="verProducto('${fac.producto}')">${fac.producto}</td>
      <td>${fac.monto}</td>
      <td>${fac.tipo}</td>
      <td>
        <button class="btn btn-delete" onclick="eliminarFactura('${docSnap.id}')">Eliminar</button>
      </td>`;
    tablaFacturas.appendChild(row);
  });
}

// Escucha en tiempo real las facturas
onSnapshot(collection(db, 'facturas'), renderFacturas);

window.eliminarFactura = async id => await deleteDoc(doc(db, 'facturas', id));

// -------------------- BUSCADOR DE FACTURAS POR PRODUCTO --------------------
buscador.addEventListener('keydown', async e => {
  if (e.key === 'Enter') {
    const texto = buscador.value.trim();
    if (!texto) return;

    const q = query(collection(db, 'facturas'), where('producto', '==', texto));
    const snapshot = await getDocs(q);
    renderFacturas(snapshot);
  }
});

// -------------------- MOSTRAR INFO DE PROVEEDOR / PRODUCTO --------------------
window.verProveedor = async nombre => {
  const q = query(collection(db, 'proveedores'), where('nombre', '==', nombre));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return alert("Proveedor no encontrado");
  const data = snapshot.docs[0].data();
  alert(`📦 DATOS DEL PROVEEDOR\n\nRUC: ${data.ruc}\nNombre: ${data.nombre}\nDirección: ${data.direccion}`);
};

window.verProducto = async nombre => {
  const q = query(collection(db, 'productos'), where('nombre', '==', nombre));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return alert("Producto no encontrado");
  const data = snapshot.docs[0].data();
  alert(`🧾 DATOS DEL PRODUCTO\n\nNombre: ${data.nombre}\nCantidad: ${data.cantidad}\nUnidad: ${data.unidad}\nValor Unitario: ${data.valor}`);
};


