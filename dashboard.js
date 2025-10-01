import { auth, db } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// ---- Menú ----
const menuItems = document.querySelectorAll(".menu-item");
const sections = document.querySelectorAll(".section");

menuItems.forEach(item => {
  item.addEventListener("click", () => {
    // Marcar activo
    menuItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    
    // Mostrar sección correspondiente
    const target = item.dataset.target;
    sections.forEach(sec => sec.classList.add("hidden"));
    document.getElementById(target).classList.remove("hidden");
  });
});

// ---- Cerrar sesión ----
document.getElementById("btnLogout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ---- Firestore Collections ----
const proveedoresCol = collection(db, "proveedores");
const facturasCol = collection(db, "facturas");
const gastosCol = collection(db, "gastos");
const serviciosCol = collection(db, "servicios");

// ---- Funciones de Gestión ----
async function agregarDocumento(colRef, data, formInputs) {
  try {
    await addDoc(colRef, data);
    alert("✅ Agregado correctamente");
    formInputs.forEach(i => i.value = "");
    listarDocumentos(colRef, colRef.id); // refrescar tabla
  } catch (error) {
    alert("❌ Error: " + error.message);
  }
}

async function listarDocumentos(colRef, tableId, filtro = null) {
  const tableBody = document.querySelector(`#${tableId} tbody`);
  tableBody.innerHTML = "";
  let q = colRef;
  if (filtro) {
    q = query(colRef, where(filtro.campo, "==", filtro.valor));
  }
  const snapshot = await getDocs(q);
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      ${Object.values(data).map(v => `<td>${v}</td>`).join("")}
      <td><button class="delete-btn" data-id="${docSnap.id}">Eliminar</button></td>
    `;
    tableBody.appendChild(row);
  });

  // Agregar eventos a botones eliminar
  tableBody.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      await deleteDoc(doc(colRef.firestore, colRef.id, btn.dataset.id));
      alert("🗑 Eliminado correctamente");
      listarDocumentos(colRef, tableId);
    });
  });
}

// ---- Proveedores ----
const provNombre = document.getElementById("provNombre");
const provRUC = document.getElementById("provRUC");
const provDireccion = document.getElementById("provDireccion");
document.getElementById("btnAgregarProveedor").addEventListener("click", () => {
  const data = {
    RUC: provRUC.value,
    Nombre: provNombre.value,
    Direccion: provDireccion.value
  };
  agregarDocumento(proveedoresCol, data, [provRUC, provNombre, provDireccion]);
});
document.getElementById("btnBuscarProveedor").addEventListener("click", () => {
  const valor = document.getElementById("buscarProveedor").value;
  if (!valor) {
    listarDocumentos(proveedoresCol, "tablaProveedores");
  } else {
    listarDocumentos(proveedoresCol, "tablaProveedores", { campo: "RUC", valor }) 
      .then(() => listarDocumentos(proveedoresCol, "tablaProveedores", { campo: "Nombre", valor }));
  }
});
listarDocumentos(proveedoresCol, "tablaProveedores");

// ---- Facturas ----
const facRUC = document.getElementById("facRUC");
const facProveedor = document.getElementById("facProveedor");
const facTipo = document.getElementById("facTipo");
const facDescripcion = document.getElementById("facDescripcion");
const facFecha = document.getElementById("facFecha");
document.getElementById("btnAgregarFactura").addEventListener("click", () => {
  const data = {
    RUC: facRUC.value,
    Proveedor: facProveedor.value,
    Tipo: facTipo.value,
    Descripcion: facDescripcion.value,
    Fecha: facFecha.value
  };
  agregarDocumento(facturasCol, data, [facRUC, facProveedor, facTipo, facDescripcion, facFecha]);
});
listarDocumentos(facturasCol, "tablaFacturas");

// ---- Gastos ----
const gastoDesc = document.getElementById("gastoDescripcion");
const gastoMonto = document.getElementById("gastoMonto");
document.getElementById("btnAgregarGasto").addEventListener("click", () => {
  const data = {
    Descripcion: gastoDesc.value,
    Monto: gastoMonto.value
  };
  agregarDocumento(gastosCol, data, [gastoDesc, gastoMonto]);
});
listarDocumentos(gastosCol, "tablaGastos");

// ---- Servicios ----
const servDesc = document.getElementById("servDescripcion");
const servFecha = document.getElementById("servFecha");
document.getElementById("btnAgregarServicio").addEventListener("click", () => {
  const data = {
    Descripcion: servDesc.value,
    Fecha: servFecha.value
  };
  agregarDocumento(serviciosCol, data, [servDesc, servFecha]);
});
listarDocumentos(serviciosCol, "tablaServicios");
