// dashboard.js
import { auth, db } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// ---------------- MENU ----------------
const menu = ["Proveedor", "Factura", "Gastos", "Servicio"];
menu.forEach(item => {
  const el = document.getElementById("menu" + item);
  el.addEventListener("click", () => {
    menu.forEach(i => {
      document.getElementById("menu" + i).classList.remove("active");
      document.getElementById("seccion" + i).classList.add("hidden");
    });
    el.classList.add("active");
    document.getElementById("seccion" + item).classList.remove("hidden");
  });
});

// ---------------- CERRAR SESIÓN ----------------
document.getElementById("btnLogout").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
});

// ---------------- FUNCIONES GENERALES ----------------
async function listarColeccion(coleccionNombre, tablaId, campos) {
  const tabla = document.getElementById(tablaId).querySelector("tbody");
  tabla.innerHTML = "";
  const snapshot = await getDocs(collection(db, coleccionNombre));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = document.createElement("tr");
    row.innerHTML = campos.map(c => `<td>${data[c]}</td>`).join('') +
      `<td><button data-id="${docSnap.id}" class="btnEliminar">Eliminar</button></td>`;
    tabla.appendChild(row);
  });
  // ELIMINAR
  tabla.querySelectorAll(".btnEliminar").forEach(btn => {
    btn.addEventListener("click", async e => {
      await deleteDoc(doc(db, coleccionNombre, e.target.dataset.id));
      listarColeccion(coleccionNombre, tablaId, campos);
    });
  });
}

function agregarDocumento(coleccionNombre, camposObj, tablaId, campos) {
  const valores = {};
  for (let key in camposObj) {
    const val = document.getElementById(camposObj[key]).value.trim();
    if (!val) return alert("Completa todos los campos");
    valores[key] = val;
  }
  addDoc(collection(db, coleccionNombre), valores)
    .then(() => {
      for (let key in camposObj) document.getElementById(camposObj[key]).value = "";
      listarColeccion(coleccionNombre, tablaId, campos);
    });
}

// ---------------- PROVEEDOR ----------------
document.getElementById("btnAgregarProveedor").addEventListener("click", () => {
  agregarDocumento(
    "proveedores",
    { ruc: "provRuc", nombre: "provNombre", direccion: "provDireccion" },
    "tablaProveedor",
    ["ruc", "nombre", "direccion"]
  );
});
document.getElementById("buscarProveedor").addEventListener("input", async e => {
  const val = e.target.value.toLowerCase();
  const tabla = document.getElementById("tablaProveedor").querySelector("tbody");
  tabla.innerHTML = "";
  const snapshot = await getDocs(collection(db, "proveedores"));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.ruc.toLowerCase().includes(val) || data.nombre.toLowerCase().includes(val)) {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${data.ruc}</td><td>${data.nombre}</td><td>${data.direccion}</td>
        <td><button data-id="${docSnap.id}" class="btnEliminar">Eliminar</button></td>`;
      tabla.appendChild(row);
    }
  });
  tabla.querySelectorAll(".btnEliminar").forEach(btn => {
    btn.addEventListener("click", async e => {
      await deleteDoc(doc(db, "proveedores", e.target.dataset.id));
      listarColeccion("proveedores", "tablaProveedor", ["ruc", "nombre", "direccion"]);
    });
  });
});
listarColeccion("proveedores", "tablaProveedor", ["ruc", "nombre", "direccion"]);

// ---------------- FACTURA ----------------
document.getElementById("btnAgregarFactura").addEventListener("click", () => {
  agregarDocumento(
    "facturas",
    { ruc: "facRuc", proveedor: "facRuc", descripcion: "facDescripcion", fecha: "facFecha" },
    "tablaFactura",
    ["ruc", "proveedor", "descripcion", "fecha"]
  );
});
document.getElementById("buscarFactura").addEventListener("input", async e => {
  const val = e.target.value.toLowerCase();
  const tabla = document.getElementById("tablaFactura").querySelector("tbody");
  tabla.innerHTML = "";
  const snapshot = await getDocs(collection(db, "facturas"));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.ruc.toLowerCase().includes(val) || data.descripcion.toLowerCase().includes(val)) {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${data.ruc}</td><td>${data.proveedor}</td><td>${data.descripcion}</td><td>${data.fecha}</td>
        <td><button data-id="${docSnap.id}" class="btnEliminar">Eliminar</button></td>`;
      tabla.appendChild(row);
    }
  });
  tabla.querySelectorAll(".btnEliminar").forEach(btn => {
    btn.addEventListener("click", async e => {
      await deleteDoc(doc(db, "facturas", e.target.dataset.id));
      listarColeccion("facturas", "tablaFactura", ["ruc","proveedor","descripcion","fecha"]);
    });
  });
});
listarColeccion("facturas", "tablaFactura", ["ruc","proveedor","descripcion","fecha"]);

// ---------------- GASTOS ----------------
document.getElementById("btnAgregarGasto").addEventListener("click", () => {
  agregarDocumento(
    "gastos",
    { descripcion: "gastoDescripcion", monto: "gastoMonto", fecha: "gastoFecha" },
    "tablaGasto",
    ["descripcion","monto","fecha"]
  );
});
document.getElementById("buscarGasto").addEventListener("input", async e => {
  const val = e.target.value.toLowerCase();
  const tabla = document.getElementById("tablaGasto").querySelector("tbody");
  tabla.innerHTML = "";
  const snapshot = await getDocs(collection(db, "gastos"));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.descripcion.toLowerCase().includes(val)) {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${data.descripcion}</td><td>${data.monto}</td><td>${data.fecha}</td>
        <td><button data-id="${docSnap.id}" class="btnEliminar">Eliminar</button></td>`;
      tabla.appendChild(row);
    }
  });
  tabla.querySelectorAll(".btnEliminar").forEach(btn => {
    btn.addEventListener("click", async e => {
      await deleteDoc(doc(db, "gastos", e.target.dataset.id));
      listarColeccion("gastos", "tablaGasto", ["descripcion","monto","fecha"]);
    });
  });
});
listarColeccion("gastos", "tablaGasto", ["descripcion","monto","fecha"]);

// ---------------- SERVICIO ----------------
document.getElementById("btnAgregarServicio").addEventListener("click", () => {
  agregarDocumento(
    "servicios",
    { descripcion: "servDescripcion", precio: "servPrecio", fecha: "servFecha" },
    "tablaServicio",
    ["descripcion","precio","fecha"]
  );
});
document.getElementById("buscarServicio").addEventListener("input", async e => {
  const val = e.target.value.toLowerCase();
  const tabla = document.getElementById("tablaServicio").querySelector("tbody");
  tabla.innerHTML = "";
  const snapshot = await getDocs(collection(db, "servicios"));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.descripcion.toLowerCase().includes(val)) {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${data.descripcion}</td><td>${data.precio}</td><td>${data.fecha}</td>
        <td><button data-id="${docSnap.id}" class="btnEliminar">Eliminar</button></td>`;
      tabla.appendChild(row);
    }
  });
  tabla.querySelectorAll(".btnEliminar").forEach(btn => {
    btn.addEventListener("click", async e => {
      await deleteDoc(doc(db, "servicios", e.target.dataset.id));
      listarColeccion("servicios", "tablaServicio", ["descripcion","precio","fecha"]);
    });
  });
});
listarColeccion("servicios", "tablaServicio", ["descripcion","precio","fecha"]);




