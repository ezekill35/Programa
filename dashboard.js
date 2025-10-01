import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const userInfo = document.getElementById("userInfo");
const btnLogout = document.getElementById("btnLogout");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    userInfo.textContent = `Bienvenido, ${user.email}`;
    cargarDatos();
  } else {
    window.location.href = "index.html";
  }
});

btnLogout.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// =================== FUNCIONES CRUD ===================

// 🔹 Guardar Producto
document.getElementById("formProducto").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("prodId").value;
  const data = {
    nombre: document.getElementById("prodNombre").value,
    precio: parseFloat(document.getElementById("prodPrecio").value),
    stock: parseInt(document.getElementById("prodStock").value),
    categoria: document.getElementById("prodCategoria").value
  };

  if (id) {
    await updateDoc(doc(db, "productos", id), data);
  } else {
    await addDoc(collection(db, "productos"), data);
  }
  e.target.reset();
  cargarDatos();
});

// 🔹 Guardar Proveedor
document.getElementById("formProveedor").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("provId").value;
  const data = {
    nombre: document.getElementById("provNombre").value,
    ruc: document.getElementById("provRuc").value,
    telefono: document.getElementById("provTelefono").value
  };

  if (id) {
    await updateDoc(doc(db, "proveedores", id), data);
  } else {
    await addDoc(collection(db, "proveedores"), data);
  }
  e.target.reset();
  cargarDatos();
});

// 🔹 Guardar Factura
document.getElementById("formFactura").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("facId").value;
  const data = {
    numero: document.getElementById("facNumero").value,
    proveedor: document.getElementById("facProveedor").value,
    fecha: document.getElementById("facFecha").value,
    total: parseFloat(document.getElementById("facTotal").value)
  };

  if (id) {
    await updateDoc(doc(db, "facturas", id), data);
  } else {
    await addDoc(collection(db, "facturas"), data);
  }
  e.target.reset();
  cargarDatos();
});

// 🔹 Guardar Servicio
document.getElementById("formServicio").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("servId").value;
  const data = {
    nombre: document.getElementById("servNombre").value,
    precio: parseFloat(document.getElementById("servPrecio").value),
    duracion: document.getElementById("servDuracion").value
  };

  if (id) {
    await updateDoc(doc(db, "servicios", id), data);
  } else {
    await addDoc(collection(db, "servicios"), data);
  }
  e.target.reset();
  cargarDatos();
});

// =================== CARGAR DATOS ===================
async function cargarDatos() {
  cargarColeccion("productos", "tablaProductos", "prodId", ["nombre", "precio", "stock", "categoria"]);
  cargarColeccion("proveedores", "tablaProveedores", "provId", ["nombre", "ruc", "telefono"], "facProveedor");
  cargarColeccion("facturas", "tablaFacturas", "facId", ["numero", "proveedor", "fecha", "total"]);
  cargarColeccion("servicios", "tablaServicios", "servId", ["nombre", "precio", "duracion"]);
}

// =================== FUNCIONES GENERALES ===================
async function cargarColeccion(nombreColeccion, tablaId, inputId, campos, selectId=null) {
  const snap = await getDocs(collection(db, nombreColeccion));
  const tabla = document.getElementById(tablaId);
  tabla.innerHTML = "";
  let opciones = "";

  snap.forEach(docSnap => {
    const d = docSnap.data();
    let fila = "<tr>";
    fila += `<td>${docSnap.id}</td>`;
    campos.forEach(c => {
      fila += `<td>${d[c]}</td>`;
    });
    fila += `
      <td>
        <button onclick="editar('${nombreColeccion}','${docSnap.id}', ${JSON.stringify(d).replace(/"/g, '&quot;')})">✏️</button>
        <button onclick="eliminar('${nombreColeccion}','${docSnap.id}')">🗑️</button>
      </td>
    `;
    fila += "</tr>";
    tabla.innerHTML += fila;

    if (selectId) opciones += `<option value="${d.nombre}">${d.nombre}</option>`;
  });

  if (selectId) {
    document.getElementById(selectId).innerHTML = `<option value="">Seleccione proveedor</option>` + opciones;
  }
}

// =================== EDITAR ===================
window.editar = function (coleccion, id, data) {
  const prefix = coleccion.slice(0,4);
  document.getElementById(prefix+"Id").value = id;
  for (let campo in data) {
    let input = document.getElementById(prefix + campo.charAt(0).toUpperCase() + campo.slice(1));
    if (input) input.value = data[campo];
  }
};

// =================== ELIMINAR ===================
window.eliminar = async function (coleccion, id) {
  if (confirm("¿Seguro que deseas eliminar este registro?")) {
    await deleteDoc(doc(db, coleccion, id));
    cargarDatos();
  }
};

// =================== BUSCAR ===================
["buscarProductos","buscarProveedores","buscarFacturas","buscarServicios"].forEach(id => {
  document.getElementById(id).addEventListener("keyup", (e) => {
    const filtro = e.target.value.toLowerCase();
    const tabla = e.target.nextElementSibling.nextElementSibling.querySelector("tbody");
    Array.from(tabla.rows).forEach(fila => {
      fila.style.display = fila.innerText.toLowerCase().includes(filtro) ? "" : "none";
    });
  });
});


