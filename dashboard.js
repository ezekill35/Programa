import { db, auth } from './firebase.js';
import {
  collection, addDoc, getDocs, doc, deleteDoc, updateDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

/* =============================
   🔒 Control de Sesión
============================= */
onAuthStateChanged(auth, user => {
  if (!user) window.location.href = "index.html";
});

/* =============================
   🚪 Cerrar Sesión
============================= */
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

/* =============================
   🧭 Navegación entre secciones
============================= */
const navBtns = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".content-section");

navBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    navBtns.forEach(b => b.classList.remove("active"));
    sections.forEach(s => s.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.section).classList.add("active");
  });
});

/* =============================
   👷 CRUD PROVEEDORES
============================= */
const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.getElementById("tablaProveedores");
const proveedoresRef = collection(db, "proveedores");

formProveedor.addEventListener("submit", async e => {
  e.preventDefault();
  const ruc = document.getElementById("rucProv").value.trim();
  if (!/^\d+$/.test(ruc)) return alert("El RUC debe contener solo números.");
  await addDoc(proveedoresRef, {
    ruc,
    nombre: document.getElementById("nombreProv").value,
    producto: document.getElementById("productoProv").value,
    direccion: document.getElementById("direccionProv").value
  });
  formProveedor.reset();
});

onSnapshot(proveedoresRef, snapshot => {
  tablaProveedores.querySelector("tbody").innerHTML = "";
  snapshot.forEach(docu => {
    const p = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.ruc}</td>
      <td>${p.nombre}</td>
      <td>${p.producto}</td>
      <td>${p.direccion}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editarProveedor('${docu.id}','${p.ruc}','${p.nombre}','${p.producto}','${p.direccion}')"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-danger" onclick="eliminarProveedor('${docu.id}')"><i class="bi bi-trash"></i></button>
      </td>`;
    tablaProveedores.querySelector("tbody").appendChild(tr);
  });
});

window.eliminarProveedor = async id => await deleteDoc(doc(db, "proveedores", id));
window.editarProveedor = (id, ruc, nombre, producto, direccion) => {
  document.getElementById("rucProv").value = ruc;
  document.getElementById("nombreProv").value = nombre;
  document.getElementById("productoProv").value = producto;
  document.getElementById("direccionProv").value = direccion;
  formProveedor.onsubmit = async e => {
    e.preventDefault();
    await updateDoc(doc(db, "proveedores", id), {
      ruc: document.getElementById("rucProv").value,
      nombre: document.getElementById("nombreProv").value,
      producto: document.getElementById("productoProv").value,
      direccion: document.getElementById("direccionProv").value
    });
    formProveedor.reset();
    formProveedor.onsubmit = submitProveedorOriginal;
  };
};
const submitProveedorOriginal = formProveedor.onsubmit;

/* =============================
   📦 CRUD PRODUCTOS
============================= */
const formProducto = document.getElementById("formProducto");
const tablaProductos = document.getElementById("tablaProductos");
const productosRef = collection(db, "productos");

formProducto.addEventListener("submit", async e => {
  e.preventDefault();
  await addDoc(productosRef, {
    nombre: document.getElementById("nombreProd").value,
    desc: document.getElementById("descProd").value,
    cantidad: parseInt(document.getElementById("cantProd").value),
    unidad: document.getElementById("unidadProd").value,
    valor: parseFloat(document.getElementById("valorUnitProd").value)
  });
  formProducto.reset();
});

onSnapshot(productosRef, snapshot => {
  tablaProductos.querySelector("tbody").innerHTML = "";
  snapshot.forEach(docu => {
    const p = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.desc}</td>
      <td>${p.cantidad}</td>
      <td>${p.unidad}</td>
      <td>${p.valor.toFixed(2)}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="eliminarProducto('${docu.id}')"><i class="bi bi-trash"></i></button>
      </td>`;
    tablaProductos.querySelector("tbody").appendChild(tr);
  });
});

window.eliminarProducto = async id => await deleteDoc(doc(db, "productos", id));

/* =============================
   🔍 BUSCADOR GLOBAL 3D
============================= */
const buscador = document.getElementById("buscadorGlobal");
const modal = document.createElement("div");
modal.style.cssText = `
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0);
  background: #fff; padding: 25px; border-radius: 15px; width: 80%; max-width: 600px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.3);
  transition: transform 0.3s ease-in-out; z-index: 1000;
`;
document.body.appendChild(modal);

const showModal = (content) => {
  modal.innerHTML = `<div class="text-end"><button id="closeModal" class="btn btn-sm btn-danger">X</button></div>${content}`;
  modal.style.transform = "translate(-50%, -50%) scale(1)";
  document.getElementById("closeModal").onclick = () => {
    modal.style.transform = "translate(-50%, -50%) scale(0)";
  };
};

buscador.addEventListener("input", async () => {
  const query = buscador.value.toLowerCase().trim();
  if (!query) return;

  let resultados = [];

  const [factSnap, prodSnap, provSnap] = await Promise.all([
    getDocs(collection(db, "facturas")),
    getDocs(productosRef),
    getDocs(proveedoresRef)
  ]);

  factSnap.forEach(f => {
    const d = f.data();
    if (
      d.proveedor?.toLowerCase().includes(query) ||
      d.numFactura?.toLowerCase().includes(query) ||
      d.producto?.toLowerCase().includes(query)
    ) {
      resultados.push({ tipo: "Factura", id: f.id, ...d });
    }
  });

  prodSnap.forEach(p => {
    const d = p.data();
    if (d.nombre?.toLowerCase().includes(query) || d.desc?.toLowerCase().includes(query)) {
      resultados.push({ tipo: "Producto", id: p.id, ...d });
    }
  });

  provSnap.forEach(p => {
    const d = p.data();
    if (d.nombre?.toLowerCase().includes(query) || d.producto?.toLowerCase().includes(query)) {
      resultados.push({ tipo: "Proveedor", id: p.id, ...d });
    }
  });

  if (resultados.length === 0) {
    showModal(`<h5>No se encontraron resultados</h5>`);
  } else {
    let content = `<h4>Resultados</h4><ul class="list-group">`;
    resultados.forEach(r => {
      content += `<li class="list-group-item d-flex justify-content-between align-items-center">
        <span><strong>${r.tipo}:</strong> ${r.nombre || r.proveedor || r.numFactura}</span>
        <button class="btn btn-sm btn-primary" onclick="abrirDetalle('${r.tipo}','${r.id}')">Ver</button>
      </li>`;
    });
    content += "</ul>";
    showModal(content);
  }
});

/* =============================
   🪟 Abrir Detalle y Editar Factura
============================= */
window.abrirDetalle = async (tipo, id) => {
  if (tipo === "Factura") {
    const docRef = await getDocs(collection(db, "facturas"));
    let factura;
    docRef.forEach(d => { if (d.id === id) factura = d.data(); });

    if (factura) {
      showModal(`
        <h5>Editar Factura</h5>
        <input id="editMonto" class="form-control mb-2" value="${factura.monto}">
        <input id="editDesc" class="form-control mb-2" value="${factura.desc}">
        <button class="btn btn-success" id="saveFactura">Guardar</button>
      `);
      document.getElementById("saveFactura").onclick = async () => {
        await updateDoc(doc(db, "facturas", id), {
          monto: parseFloat(document.getElementById("editMonto").value),
          desc: document.getElementById("editDesc").value
        });
        modal.style.transform = "translate(-50%, -50%) scale(0)";
      };
    }
  }
};

/* =============================
   📊 Reporte General
============================= */
document.getElementById("generarReporte").addEventListener("click", async () => {
  const reporteDiv = document.getElementById("reporteContenido");
  let totalFacturas = 0, totalProductos = 0, totalProveedores = 0;

  const factSnap = await getDocs(collection(db, "facturas"));
  factSnap.forEach(f => totalFacturas += parseFloat(f.data().monto || 0));

  const prodSnap = await getDocs(productosRef);
  totalProductos = prodSnap.size;

  const provSnap = await getDocs(proveedoresRef);
  totalProveedores = provSnap.size;

  reporteDiv.innerHTML = `
    <div class="p-4 bg-light rounded shadow-lg">
      <h5>Resumen General</h5>
      <p><strong>Total Facturas:</strong> S/. ${totalFacturas.toFixed(2)}</p>
      <p><strong>Total Productos:</strong> ${totalProductos}</p>
      <p><strong>Total Proveedores:</strong> ${totalProveedores}</p>
    </div>`;
});

