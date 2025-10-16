// --- Importar Firebase ---
import { app, auth } from "./firebase.js";
import { 
  getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { 
  signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// --- Inicializar Firestore ---
const db = getFirestore(app);

// --- Elementos del DOM ---
const btnLogout = document.getElementById("btnLogout");
const btnRegistrarProv = document.getElementById("btnRegistrarProv");
const btnRegistrarProd = document.getElementById("btnRegistrarProd");
const tbodyDatos = document.getElementById("tbodyDatos");
const buscador = document.getElementById("buscador");

// --- Verificación de sesión ---
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html"; // redirigir si no hay sesión
  }
});

// --- Cerrar sesión ---
btnLogout.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// --- Registrar Proveedor ---
btnRegistrarProv.addEventListener("click", async () => {
  const nombre = document.getElementById("nombreProv").value.trim();
  const telefono = document.getElementById("telefonoProv").value.trim();
  const email = document.getElementById("emailProv").value.trim();

  if (!nombre || !telefono || !email) {
    alert("⚠️ Todos los campos de proveedor son obligatorios.");
    return;
  }

  try {
    await addDoc(collection(db, "proveedores"), {
      tipo: "Proveedor",
      nombre,
      telefono,
      email,
      timestamp: new Date(),
      userId: auth.currentUser.uid
    });

    alert("✅ Proveedor registrado con éxito.");
    document.getElementById("nombreProv").value = "";
    document.getElementById("telefonoProv").value = "";
    document.getElementById("emailProv").value = "";
  } catch (error) {
    console.error("Error al registrar proveedor:", error);
    alert("❌ Error al registrar proveedor.");
  }
});

// --- Registrar Producto ---
btnRegistrarProd.addEventListener("click", async () => {
  const nombre = document.getElementById("nombreProd").value.trim();
  const precio = document.getElementById("precioProd").value.trim();
  const cantidad = document.getElementById("cantidadProd").value.trim();
  const descripcion = document.getElementById("descProd").value.trim();

  if (!nombre || !precio || !cantidad) {
    alert("⚠️ Nombre, precio y cantidad son obligatorios.");
    return;
  }

  try {
    await addDoc(collection(db, "productos"), {
      tipo: "Producto",
      nombre,
      precio: parseFloat(precio),
      cantidad: parseInt(cantidad),
      descripcion: descripcion || "",
      timestamp: new Date(),
      userId: auth.currentUser.uid
    });

    alert("✅ Producto registrado con éxito.");
    document.getElementById("nombreProd").value = "";
    document.getElementById("precioProd").value = "";
    document.getElementById("cantidadProd").value = "";
    document.getElementById("descProd").value = "";
  } catch (error) {
    console.error("Error al registrar producto:", error);
    alert("❌ Error al registrar producto.");
  }
});

// --- Mostrar datos en tiempo real ---
function mostrarDatos() {
  tbodyDatos.innerHTML = "";

  // Escucha de productos
  onSnapshot(collection(db, "productos"), (snapshot) => {
    snapshot.docChanges().forEach(change => {
      const data = change.doc.data();
      const id = change.doc.id;
      if (change.type === "added") agregarFila(id, data);
      if (change.type === "removed") document.getElementById(id)?.remove();
      if (change.type === "modified") actualizarFila(id, data);
    });
  });

  // Escucha de proveedores
  onSnapshot(collection(db, "proveedores"), (snapshot) => {
    snapshot.docChanges().forEach(change => {
      const data = change.doc.data();
      const id = change.doc.id;
      if (change.type === "added") agregarFila(id, data);
      if (change.type === "removed") document.getElementById(id)?.remove();
      if (change.type === "modified") actualizarFila(id, data);
    });
  });
}

// --- Agregar fila a la tabla ---
function agregarFila(id, data) {
  const fila = document.createElement("tr");
  fila.id = id;
  fila.innerHTML = `
    <td>${data.tipo}</td>
    <td>${data.nombre}</td>
    <td>
      ${data.tipo === "Producto" 
        ? `💲${data.precio} · ${data.cantidad} uds<br>${data.descripcion || ""}`
        : `${data.telefono} · ${data.email}`
      }
    </td>
    <td class="acciones">
      <button class="editar">✏️</button>
      <button class="eliminar">🗑️</button>
    </td>
  `;

  // Botón eliminar
  fila.querySelector(".eliminar").addEventListener("click", async () => {
    if (confirm("¿Deseas eliminar este registro?")) {
      const col = data.tipo === "Producto" ? "productos" : "proveedores";
      await deleteDoc(doc(db, col, id));
    }
  });

  // Botón editar
  fila.querySelector(".editar").addEventListener("click", async () => {
    const nuevoNombre = prompt("Nuevo nombre:", data.nombre);
    if (!nuevoNombre) return;
    const col = data.tipo === "Producto" ? "productos" : "proveedores";
    await updateDoc(doc(db, col, id), { nombre: nuevoNombre });
  });

  tbodyDatos.appendChild(fila);
}

// --- Actualizar fila modificada ---
function actualizarFila(id, data) {
  const fila = document.getElementById(id);
  if (fila) {
    fila.children[1].textContent = data.nombre;
    fila.children[2].innerHTML =
      data.tipo === "Producto"
        ? `💲${data.precio} · ${data.cantidad} uds<br>${data.descripcion || ""}`
        : `${data.telefono} · ${data.email}`;
  }
}

// --- Buscador dinámico ---
buscador.addEventListener("input", () => {
  const filtro = buscador.value.toLowerCase();
  const filas = tbodyDatos.getElementsByTagName("tr");
  for (let fila of filas) {
    const texto = fila.textContent.toLowerCase();
    fila.style.display = texto.includes(filtro) ? "" : "none";
  }
});

// --- Iniciar ---
mostrarDatos();
