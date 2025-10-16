// ================= FIREBASE CONFIGURACIÓN =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, onSnapshot,
  doc, deleteDoc, query, where, updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  getAuth, signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
  authDomain: "discovery-pets.firebaseapp.com",
  projectId: "discovery-pets",
  storageBucket: "discovery-pets.appspot.com",
  messagingSenderId: "481355972999",
  appId: "1:481355972999:web:abcd1234efgh5678" // solo referencia local
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const colProveedores = collection(db, "proveedores");
const colProductos = collection(db, "productos");
const colFacturas = collection(db, "facturas");

// ================= CERRAR SESIÓN =================
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ================= CAMBIO DE SECCIONES =================
document.querySelectorAll(".menu-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".menu-btn").forEach(b => b.classList.remove("activo"));
    document.querySelectorAll(".seccion").forEach(s => s.classList.remove("activa"));
    btn.classList.add("activo");
    document.getElementById(btn.dataset.target).classList.add("activa");
  });
});

// ================= PROVEEDORES =================
const formProveedor = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");

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

onSnapshot(colProveedores, snapshot => {
  tablaProveedores.innerHTML = "";
  snapshot.forEach(docu => {
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.ruc}</td>
      <td>${d.nombre}</td>
      <td>${d.direccion || "-"}</td>
      <td>${d.telefono || "-"}</td>
      <td>
        <button class="btn btn-sm ver-info" data-tipo="proveedor" data-nombre="${d.nombre}">🔍 Ver</button>
        <button class="btn btn-sm editar" data-id="${docu.id}">✏️ Editar</button>
      </td>
    `;
    tablaProveedores.appendChild(tr);

    // --- EDITAR ---
    tr.querySelector(".editar").addEventListener("click", () => {
      tr.children[0].innerHTML = `<input value="${d.ruc}">`;
      tr.children[1].innerHTML = `<input value="${d.nombre}">`;
      tr.children[2].innerHTML = `<input value="${d.direccion || ""}">`;
      tr.children[3].innerHTML = `<input value="${d.telefono || ""}">`;
      tr.children[4].innerHTML = `
        <button class="btn btn-sm guardar">💾 Guardar</button>
        <button class="btn btn-sm cancelar">❌ Cancelar</button>
      `;

      tr.querySelector(".guardar").addEventListener("click", async () => {
        const nuevosDatos = {
          ruc: tr.children[0].querySelector("input").value.trim(),
          nombre: tr.children[1].querySelector("input").value.trim(),
          direccion: tr.children[2].querySelector("input").value.trim(),
          telefono: tr.children[3].querySelector("input").value.trim()
        };
        await updateDoc(doc(db, "proveedores", docu.id), nuevosDatos);
      });

      tr.querySelector(".cancelar").addEventListener("click", () => {
        tr.children[0].textContent = d.ruc;
        tr.children[1].textContent = d.nombre;
        tr.children[2].textContent = d.direccion || "-";
        tr.children[3].textContent = d.telefono || "-";
        tr.children[4].innerHTML = `
          <button class="btn btn-sm ver-info" data-tipo="proveedor" data-nombre="${d.nombre}">🔍 Ver</button>
          <button class="btn btn-sm editar" data-id="${docu.id}">✏️ Editar</button>
        `;
      });
    });
  });
  cargarProveedoresSelect();
});

// ================= PRODUCTOS =================
const formProducto = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");

formProducto.addEventListener("submit", async e => {
  e.preventDefault();
  const precio = parseFloat(document.getElementById("precioProducto").value);
  const data = {
    nombre: document.getElementById("nombreProducto").value.trim(),
    cantidad: parseInt(document.getElementById("cantidadProducto").value),
    precio: precio,
    descripcion: document.getElementById("descripcionProducto").value.trim()
  };
  await addDoc(colProductos, data);
  formProducto.reset();
});

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

onSnapshot(colProductos, snapshot => {
  tablaProductos.innerHTML = "";
  snapshot.forEach(docu => {
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.nombre}</td>
      <td>${d.cantidad}</td>
      <td>S/. ${d.precio.toFixed(2)}</td>
      <td>${d.descripcion || "-"}</td>
      <td>
        <button class="btn btn-sm ver-info" data-tipo="producto" data-nombre="${d.nombre}">🔍 Ver</button>
        <button class="btn btn-sm editar" data-id="${docu.id}">✏️ Editar</button>
      </td>
    `;
    tablaProductos.appendChild(tr);

    // --- EDITAR ---
    tr.querySelector(".editar").addEventListener("click", () => {
      tr.children[0].innerHTML = `<input value="${d.nombre}">`;
      tr.children[1].innerHTML = `<input type="number" value="${d.cantidad}">`;
      tr.children[2].innerHTML = `<input type="number" step="0.01" value="${d.precio}">`;
      tr.children[3].innerHTML = `<input value="${d.descripcion || ""}">`;
      tr.children[4].innerHTML = `
        <button class="btn btn-sm guardar">💾 Guardar</button>
        <button class="btn btn-sm cancelar">❌ Cancelar</button>
      `;

      tr.querySelector(".guardar").addEventListener("click", async () => {
        const nuevosDatos = {
          nombre: tr.children[0].querySelector("input").value.trim(),
          cantidad: parseInt(tr.children[1].querySelector("input").value),
          precio: parseFloat(tr.children[2].querySelector("input").value),
          descripcion: tr.children[3].querySelector("input").value.trim()
        };
        await updateDoc(doc(db, "productos", docu.id), nuevosDatos);
      });

      tr.querySelector(".cancelar").addEventListener("click", () => {
        tr.children[0].textContent = d.nombre;
        tr.children[1].textContent = d.cantidad;
        tr.children[2].textContent = `S/. ${d.precio.toFixed(2)}`;
        tr.children[3].textContent = d.descripcion || "-";
        tr.children[4].innerHTML = `
          <button class="btn btn-sm ver-info" data-tipo="producto" data-nombre="${d.nombre}">🔍 Ver</button>
          <button class="btn btn-sm editar" data-id="${docu.id}">✏️ Editar</button>
        `;
      });
    });
  });
  cargarProductosSelect();
});

// ================= FACTURAS =================
const formFactura = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");

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
    const d = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.idFactura}</td>
      <td>${d.fecha}</td>
      <td>${d.proveedor}</td>
      <td>${d.producto}</td>
      <td>S/. ${d.monto.toFixed(2)}</td>
      <td>${d.tipo}</td>
      <td>
        <button class="btn btn-sm ver-factura" data-id="${d.idFactura}">📄 Detalle</button>
        <button class="btn btn-sm editar" data-id="${docu.id}">✏️ Editar</button>
      </td>
    `;
    tablaFacturas.appendChild(tr);

    // --- EDITAR ---
    tr.querySelector(".editar").addEventListener("click", () => {
      tr.children[0].innerHTML = `<input value="${d.idFactura}">`;
      tr.children[1].innerHTML = `<input type="date" value="${d.fecha}">`;
      tr.children[2].innerHTML = `<input value="${d.proveedor}">`;
      tr.children[3].innerHTML = `<input value="${d.producto}">`;
      tr.children[4].innerHTML = `<input type="number" step="0.01" value="${d.monto}">`;
      tr.children[5].innerHTML = `
        <select>
          <option value="Factura" ${d.tipo==="Factura"?"selected":""}>Factura</option>
          <option value="Boleta" ${d.tipo==="Boleta"?"selected":""}>Boleta</option>
        </select>
      `;
      tr.children[6].innerHTML = `
        <button class="btn btn-sm guardar">💾 Guardar</button>
        <button class="btn btn-sm cancelar">❌ Cancelar</button>
      `;

      tr.querySelector(".guardar").addEventListener("click", async () => {
        const nuevosDatos = {
          idFactura: tr.children[0].querySelector("input").value.trim(),
          fecha: tr.children[1].querySelector("input").value,
          proveedor: tr.children[2].querySelector("input").value,
          producto: tr.children[3].querySelector("input").value,
          monto: parseFloat(tr.children[4].querySelector("input").value),
          tipo: tr.children[5].querySelector("select").value
        };
        await updateDoc(doc(db, "facturas", docu.id), nuevosDatos);
      });

      tr.querySelector(".cancelar").addEventListener("click", () => {
        tr.children[0].textContent = d.idFactura;
        tr.children[1].textContent = d.fecha;
        tr.children[2].textContent = d.proveedor;
        tr.children[3].textContent = d.producto;
        tr.children[4].textContent = `S/. ${d.monto.toFixed(2)}`;
        tr.children[5].textContent = d.tipo;
        tr.children[6].innerHTML = `
          <button class="btn btn-sm ver-factura" data-id="${d.idFactura}">📄 Detalle</button>
          <button class="btn btn-sm editar" data-id="${docu.id}">✏️ Editar</button>
        `;
      });
    });
  });
});

// ================= BUSCADOR FACTURAS =================
const buscador = document.getElementById("buscadorFactura");
const panelFacturas = document.getElementById("panelFacturas");

buscador.addEventListener("input", async () => {
  const texto = buscador.value.trim().toLowerCase();
  panelFacturas.innerHTML = "";
  if (!texto) return;

  const snap = await getDocs(colFacturas);
  snap.forEach(docu => {
    const f = docu.data();
    if (f.producto.toLowerCase().includes(texto)) {
      const div = document.createElement("div");
      div.style.padding = "8px";
      div.style.cursor = "pointer";
      div.style.borderBottom = "1px solid rgba(0,0,0,0.05)";
      div.innerHTML = `<strong>${f.idFactura}</strong> - ${f.producto} (${f.proveedor}) - S/. ${f.monto.toFixed(2)}`;
      div.addEventListener("click", () => mostrarModalFactura(f));
      panelFacturas.appendChild(div);
    }
  });
});

// ================= MODALES =================
const modalFactura = document.getElementById("modalFactura");
const contenidoModalFactura = document.getElementById("contenidoModalFactura");
const cerrarModalFactura = document.getElementById("cerrarModalFactura");
cerrarModalFactura.addEventListener("click", () => modalFactura.style.display = "none");

function mostrarModalFactura(f) {
  contenidoModalFactura.innerHTML = `
    <h3>Factura ${f.idFactura}</h3>
    <p><b>Fecha:</b> ${f.fecha}</p>
    <p><b>Proveedor:</b> <span class="link-info" data-tipo="proveedor" data-nombre="${f.proveedor}">${f.proveedor}</span></p>
    <p><b>Producto:</b> <span class="link-info" data-tipo="producto" data-nombre="${f.producto}">${f.producto}</span></p>
    <p><b>Monto:</b> S/. ${f.monto.toFixed(2)}</p>
    <p><b>Tipo:</b> ${f.tipo}</p>`;
  modalFactura.style.display = "block";
}

// ================= MODAL DETALLE EXTRA =================
const modalExtra = document.getElementById("modalDetalleExtra");
const contenidoDetalleExtra = document.getElementById("contenidoDetalleExtra");
const cerrarModalExtra = document.getElementById("cerrarModalDetalle");
cerrarModalExtra.addEventListener("click", () => modalExtra.style.display = "none");

document.addEventListener("click", async e => {
  if (e.target.classList.contains("link-info")) {
    const nombre = e.target.dataset.nombre;
    const tipo = e.target.dataset.tipo;
    if (!confirm(`¿Deseas ver información del ${tipo} "${nombre}"?`)) return;

    let col = tipo === "proveedor" ? colProveedores : colProductos;
    const q = query(col, where("nombre", "==", nombre));
    const snap = await getDocs(q);
    if (snap.empty) {
      contenidoDetalleExtra.innerHTML = "<p>No se encontró información.</p>";
    } else {
      const d = snap.docs[0].data();
      let html = "";
      if (tipo === "proveedor") {
        html = `<h4>Proveedor</h4>
          <p><b>Nombre:</b> ${d.nombre}</p>
          <p><b>RUC:</b> ${d.ruc}</p>
          <p><b>Dirección:</b> ${d.direccion || "-"}</p>
          <p><b>Teléfono:</b> ${d.telefono || "-"}</p>`;
      } else {
        html = `<h4>Producto</h4>
          <p><b>Nombre:</b> ${d.nombre}</p>
          <p><b>Cantidad:</b> ${d.cantidad}</p>
          <p><b>Precio:</b> S/. ${d.precio.toFixed(2)}</p>
          <p><b>Descripción:</b> ${d.descripcion || "-"}</p>`;
      }
      contenidoDetalleExtra.innerHTML = html;
    }
    modalExtra.style.display = "block";
  }
});

// ================= RESTABLECER BUSCADOR =================
document.getElementById("btnRefresh").addEventListener("click", () => {
  buscador.value = "";
  panelFacturas.innerHTML = "";
});
