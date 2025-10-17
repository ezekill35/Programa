// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, doc, deleteDoc, query, where, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:abcd1234efgh5678"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ===================== COLECCIONES =====================
const colProveedores = collection(db, "proveedores");
const colProductos = collection(db, "productos");
const colFacturas = collection(db, "facturas");

// ===================== ELEMENTOS =====================
const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.getElementById("tablaProveedores");
const formProducto = document.getElementById("formProducto");
const tablaProductos = document.getElementById("tablaProductos");
const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas");

const countFacturas = document.getElementById("countFacturas");
const countProveedores = document.getElementById("countProveedores");
const countProductos = document.getElementById("countProductos");

const buscador = document.getElementById("searchInput");
const panelFacturas = document.getElementById("searchResults");

const modalExtra = document.getElementById("modalExtra");
const modalExtraBody = document.getElementById("modalExtraBody");
const cerrarModalExtra = document.getElementById("cerrarModalExtra");

const modalEditar = document.getElementById("modalEditar");
const formEditar = document.getElementById("formEditar");
const camposEditar = document.getElementById("camposEditar");
const cerrarModalEditar = document.getElementById("cerrarModalEditar");

// ===================== CERRAR SESIÓN =====================
document.getElementById("btnCerrarSesion").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ===================== NAVEGACIÓN =====================
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("activo"));
    document.querySelectorAll(".seccion").forEach(s => s.classList.remove("activa"));
    btn.classList.add("activo");
    document.getElementById(btn.dataset.target).classList.add("activa");

    // Mostrar buscador solo en facturas
    if(btn.dataset.target === "facturas") buscador.style.display = "block";
    else { buscador.style.display = "none"; buscador.value = ""; panelFacturas.innerHTML = ""; }
  });
});

// ===================== AUXILIARES =====================
async function cargarProveedoresSelect() {
  const select = document.getElementById("proveedorFactura");
  select.innerHTML = '<option value="">Seleccionar proveedor</option>';
  const snap = await getDocs(colProveedores);
  snap.forEach(docu => {
    const d = docu.data();
    const opt = document.createElement("option");
    opt.value = d.nombre;
    opt.textContent = d.nombre;
    select.appendChild(opt);
  });
}

async function cargarProductosSelect() {
  const select = document.getElementById("productoFactura");
  select.innerHTML = '<option value="">Seleccionar producto</option>';
  const snap = await getDocs(colProductos);
  snap.forEach(docu => {
    const d = docu.data();
    const opt = document.createElement("option");
    opt.value = d.nombre;
    opt.textContent = d.nombre;
    select.appendChild(opt);
  });
}

function mostrarModalFactura(f) {
  modalExtraBody.innerHTML = `
    <h3 class="text-sky-600 font-bold text-lg mb-2">Factura ${f.idFactura}</h3>
    <p><b>Fecha:</b> ${f.fecha}</p>
    <p><b>Proveedor:</b> ${f.proveedor}</p>
    <p><b>Producto:</b> ${f.producto}</p>
    <p><b>Monto:</b> S/. ${f.monto}</p>
    <p><b>Tipo:</b> ${f.tipo}</p>`;
  modalExtra.showModal();
}

// ===================== CERRAR MODALES =====================
cerrarModalExtra.addEventListener("click", () => modalExtra.close());
cerrarModalEditar.addEventListener("click", () => modalEditar.close());

// ===================== PROVEEDORES =====================
formProveedor.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    ruc: document.getElementById("rucProveedor").value.trim(),
    nombre: document.getElementById("nombreProveedor").value.trim(),
    direccion: document.getElementById("direccionProveedor").value.trim(),
    telefono: document.getElementById("telefonoProveedor").value.trim()
  };
  await addDoc(colProveedores, data);
  formProveedor.reset();
});

onSnapshot(colProveedores, snapshot => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach(docu => {
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.dataset.id = docu.id;
    tr.dataset.tipo = "proveedores";
    tr.innerHTML = `
      <td>${d.ruc}</td>
      <td>${d.nombre}</td>
      <td>${d.direccion || ""}</td>
      <td>${d.telefono || ""}</td>
      <td>
        <button class="btn-accion editar" onclick="editar('proveedores','${docu.id}')">✏️</button>
        <button class="btn-accion eliminar" onclick="eliminar('proveedores','${docu.id}')">🗑️</button>
      </td>`;
    tablaProveedores.appendChild(tr);
  });
  countProveedores.textContent = snapshot.size;
  cargarProveedoresSelect();
});

// ===================== PRODUCTOS =====================
formProducto.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    nombre: document.getElementById("nombreProducto").value.trim(),
    cantidad: parseInt(document.getElementById("cantidadProducto").value),
    precio: parseFloat(document.getElementById("precioProducto").value),
    descripcion: document.getElementById("descripcionProducto").value.trim().split("\n")
  };
  await addDoc(colProductos, data);
  formProducto.reset();
});

onSnapshot(colProductos, snapshot => {
  tablaProductos.innerHTML = "";
  snapshot.forEach(docu => {
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.dataset.id = docu.id;
    tr.dataset.tipo = "productos";
    tr.innerHTML = `
      <td>${d.nombre}</td>
      <td>${d.cantidad}</td>
      <td>${d.precio}</td>
      <td>${(d.descripcion || []).join("<br>")}</td>
      <td>
        <button class="btn-accion editar" onclick="editar('productos','${docu.id}')">✏️</button>
        <button class="btn-accion eliminar" onclick="eliminar('productos','${docu.id}')">🗑️</button>
      </td>`;
    tablaProductos.appendChild(tr);
  });
  countProductos.textContent = snapshot.size;
  cargarProductosSelect();
});

// ===================== FACTURAS =====================
formFactura.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    idFactura: document.getElementById("idFactura").value.trim(),
    fecha: document.getElementById("fechaFactura").value,
    proveedor: document.getElementById("proveedorFactura").value,
    producto: document.getElementById("productoFactura").value,
    monto: parseFloat(document.getElementById("montoFactura").value),
    tipo: document.getElementById("tipoFactura").value
  };
  await addDoc(colFacturas, data);
  formFactura.reset();
});

onSnapshot(colFacturas, snapshot => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(docu => {
    const f = docu.data();
    const tr = document.createElement("tr");
    tr.dataset.id = docu.id;
    tr.dataset.tipo = "facturas";
    tr.innerHTML = `
      <td>${f.idFactura}</td>
      <td>${f.fecha}</td>
      <td>${f.proveedor}</td>
      <td>${f.producto}</td>
      <td>${f.monto}</td>
      <td>${f.tipo}</td>
      <td>
        <button class="btn-accion editar" onclick="editar('facturas','${docu.id}')">✏️</button>
        <button class="btn-accion eliminar" onclick="eliminar('facturas','${docu.id}')">🗑️</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  });
  countFacturas.textContent = snapshot.size;
});

// ===================== BUSCADOR =====================
buscador.style.display = "none";

buscador.addEventListener("input", async () => {
  const texto = buscador.value.trim().toLowerCase();
  panelFacturas.innerHTML = "";
  if (!texto) return;

  // Facturas
  const snapFacturas = await getDocs(colFacturas);
  snapFacturas.forEach(docu => {
    const f = docu.data();
    if (
      f.idFactura.toLowerCase().includes(texto) ||
      f.proveedor.toLowerCase().includes(texto) ||
      f.producto.toLowerCase().includes(texto)
    ) {
      const div = document.createElement("div");
      div.className = "resultado-item";
      div.innerHTML = `<strong class="link-info">${f.idFactura}</strong> - ${f.proveedor} - ${f.producto}`;
      div.addEventListener("click", () => mostrarModalFactura(f));
      panelFacturas.appendChild(div);
    }
  });

  // Productos
  const snapProductos = await getDocs(colProductos);
  snapProductos.forEach(docu => {
    const p = docu.data();
    if (p.nombre.toLowerCase().includes(texto)) {
      const div = document.createElement("div");
      div.className = "resultado-item";
      div.innerHTML = `<strong class="link-info">${p.nombre}</strong>`;
      div.addEventListener("click", () => {
        modalExtraBody.innerHTML = `<h4>Producto</h4>
          <p><b>Nombre:</b> ${p.nombre}</p>
          <p><b>Cantidad:</b> ${p.cantidad}</p>
          <p><b>Precio:</b> S/. ${p.precio}</p>
          <p><b>Descripción:</b><br>${(p.descripcion||[]).join("<br>")}</p>`;
        modalExtra.showModal();
      });
      panelFacturas.appendChild(div);
    }
  });
});

// ===================== MODAL DE EDICIÓN =====================
window.editar = async (tipo, id) => {
  camposEditar.innerHTML = "";
  const docRef = doc(db, tipo, id);
  const snap = await getDocs(query(collection(db, tipo), where("__name__", "==", id)));
  const data = (await getDocs(docRef)).data?.() || snap.docs[0].data();
  
  if(tipo === "proveedores") {
    camposEditar.innerHTML = `
      <div class="col-6"><input class="form-control" name="ruc" value="${data.ruc}" required></div>
      <div class="col-6"><input class="form-control" name="nombre" value="${data.nombre}" required></div>
      <div class="col-6"><input class="form-control" name="direccion" value="${data.direccion || ''}"></div>
      <div class="col-6"><input class="form-control" name="telefono" value="${data.telefono || ''}"></div>`;
  } else if(tipo === "productos") {
    camposEditar.innerHTML = `
      <div class="col-6"><input class="form-control" name="nombre" value="${data.nombre}" required></div>
      <div class="col-3"><input class="form-control" type="number" name="cantidad" value="${data.cantidad}" required></div>
      <div class="col-3"><input class="form-control" type="number" step="0.01" name="precio" value="${data.precio}" required></div>
      <div class="col-12"><textarea class="form-control" name="descripcion" rows="3">${(data.descripcion||[]).join("\n")}</textarea></div>`;
  } else if(tipo === "facturas") {
    camposEditar.innerHTML = `
      <div class="col-4"><input class="form-control" name="idFactura" value="${data.idFactura}" required></div>
      <div class="col-4"><input class="form-control" type="date" name="fecha" value="${data.fecha}" required></div>
      <div class="col-4"><input class="form-control" type="number" step="0.01" name="monto" value="${data.monto}" required></div>
      <div class="col-6"><input class="form-control" name="proveedor" value="${data.proveedor}" required></div>
      <div class="col-6"><input class="form-control" name="producto" value="${data.producto}" required></div>
      <div class="col-12"><input class="form-control" name="tipo" value="${data.tipo}" required></div>`;
  }

  formEditar.onsubmit = async e => {
    e.preventDefault();
    const formData = new FormData(formEditar);
    const updated = {};
    formData.forEach((v,k)=>updated[k]=k==="descripcion"?v.split("\n"):k==="cantidad"?parseInt(v):k==="precio"||k==="monto"?parseFloat(v):v);
    await updateDoc(docRef, updated);
    modalEditar.close();
  };

  modalEditar.showModal();
}

// ===================== ELIMINAR =====================
window.eliminar = async (tipo, id) => {
  if(!confirm("¿Deseas eliminar este registro?")) return;
  await deleteDoc(doc(db, tipo, id));
}


