import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ======================= NAVEGACIÓN =======================
const botones = document.querySelectorAll(".menu-btn");
const secciones = document.querySelectorAll(".seccion");

botones.forEach((btn) => {
  btn.addEventListener("click", () => {
    botones.forEach((b) => b.classList.remove("activo"));
    btn.classList.add("activo");
    secciones.forEach((sec) => {
      sec.classList.remove("activa");
      if (sec.id === btn.dataset.target) sec.classList.add("activa");
    });
  });
});

// ======================= CERRAR SESIÓN =======================
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ======================= PROVEEDORES =======================
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");

proveedorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();
  const telefono = document.getElementById("telefonoProveedor").value.trim();

  await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion, telefono });
  proveedorForm.reset();
});

onSnapshot(collection(db, "proveedores"), (snapshot) => {
  tablaProveedores.innerHTML = "";
  const proveedorSelect = document.getElementById("proveedorFactura");
  proveedorSelect.innerHTML = '<option value="">Seleccione proveedor</option>';

  snapshot.forEach((docu) => {
    const p = docu.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td contenteditable="false">${p.ruc}</td>
      <td contenteditable="false">${p.nombre}</td>
      <td contenteditable="false">${p.direccion}</td>
      <td contenteditable="false">${p.telefono || '-'}</td>
      <td>
        <button class="btn-edit" data-id="${docu.id}" data-tipo="proveedores">✏️ Editar</button>
        <button class="btn-save" data-id="${docu.id}" data-tipo="proveedores" style="display:none">💾 Guardar</button>
        <button class="btn-delete" data-id="${docu.id}" data-tipo="proveedores">🗑️ Eliminar</button>
      </td>
    `;
    tablaProveedores.appendChild(fila);

    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = p.nombre;
    proveedorSelect.appendChild(option);
  });
});

// ======================= PRODUCTOS =======================
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");

productoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const unidad = document.getElementById("unidadProducto").value.trim();
  const material = document.getElementById("materialP").value.trim();
  const maquinaria = document.getElementById("maquinaria").value.trim();
  const productoOf = document.getElementById("productoOf").value.trim();
  const insumosExtra = document.getElementById("insumosExtra").value.trim();

  await addDoc(collection(db, "productos"), {
    nombre, unidad, material, maquinaria, productoOf, insumosExtra
  });
  productoForm.reset();
});

onSnapshot(collection(db, "productos"), (snapshot) => {
  tablaProductos.innerHTML = "";
  const productoSelect = document.getElementById("productoFactura");
  productoSelect.innerHTML = '<option value="">Seleccione producto</option>';

  snapshot.forEach((docu) => {
    const p = docu.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td contenteditable="false">${p.nombre}</td>
      <td contenteditable="false">${p.unidad || '-'}</td>
      <td contenteditable="false">${p.material || '-'}</td>
      <td contenteditable="false">${p.maquinaria || '-'}</td>
      <td contenteditable="false">${p.productoOf || '-'}</td>
      <td contenteditable="false">${p.insumosExtra || '-'}</td>
      <td>
        <button class="btn-edit" data-id="${docu.id}" data-tipo="productos">✏️ Editar</button>
        <button class="btn-save" data-id="${docu.id}" data-tipo="productos" style="display:none">💾 Guardar</button>
        <button class="btn-delete" data-id="${docu.id}" data-tipo="productos">🗑️ Eliminar</button>
      </td>
    `;
    tablaProductos.appendChild(fila);

    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = p.nombre;
    productoSelect.appendChild(option);
  });
});

// ======================= FACTURAS =======================
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");

let facturasGuardadas = [];

facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const idFactura = document.getElementById("numeroFactura").value.trim();
  const fecha = document.getElementById("fechaEmisionFactura").value;
  const proveedor = document.getElementById("proveedorFactura").value;
  const producto = document.getElementById("productoFactura").value;
  const monto = document.getElementById("montoFactura").value;
  const moneda = document.getElementById("monedaFactura").value;
  const tipo = document.getElementById("tipoFactura").value;

  if (!proveedor || !producto) return alert("Debe seleccionar proveedor y producto");

  await addDoc(collection(db, "facturas"), {
    idFactura, fecha, proveedor, producto, monto, moneda, tipo
  });

  facturaForm.reset();
});

// ======================= MOSTRAR FACTURAS =======================
onSnapshot(collection(db, "facturas"), (snapshot) => {
  facturasGuardadas = [];
  snapshot.forEach((docu) => {
    facturasGuardadas.push({ id: docu.id, ...docu.data() });
  });
  mostrarFacturas(facturasGuardadas);
});

function mostrarFacturas(facturas) {
  tablaFacturas.innerHTML = "";
  facturas.forEach((f) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td contenteditable="false">${f.idFactura}</td>
      <td contenteditable="false" class="ver-proveedor" data-nombre="${f.proveedor}" style="cursor:pointer;color:#007bff">${f.proveedor}</td>
      <td contenteditable="false" class="ver-producto" data-nombre="${f.producto}" style="cursor:pointer;color:#007bff">${f.producto}</td>
      <td contenteditable="false">${f.moneda}${f.monto}</td>
      <td contenteditable="false">${f.tipo}</td>
      <td contenteditable="false">${f.fecha}</td>
      <td>
        <button class="btn-edit" data-id="${f.id}" data-tipo="facturas">✏️ Editar</button>
        <button class="btn-save" data-id="${f.id}" data-tipo="facturas" style="display:none">💾 Guardar</button>
        <button class="btn-delete" data-id="${f.id}" data-tipo="facturas">🗑️ Eliminar</button>
      </td>
    `;
    tablaFacturas.appendChild(fila);
  });
}

// ======================= BUSCADOR =======================
const buscador = document.getElementById("buscadorFactura");

buscador.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const valor = buscador.value.trim().toLowerCase();
    const filtradas = facturasGuardadas.filter((f) =>
      f.producto.toLowerCase().includes(valor)
    );
    mostrarFacturas(filtradas);
  }
});

document.getElementById("btnRefresh").addEventListener("click", () => {
  buscador.value = "";
  mostrarFacturas(facturasGuardadas);
});

// ======================= ELIMINAR Y EDITAR =======================
document.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  const tipo = e.target.dataset.tipo;

  // ELIMINAR
  if (e.target.classList.contains("btn-delete")) {
    if (confirm("¿Desea eliminar este registro?")) await deleteDoc(doc(db, tipo, id));
  }

  // EDITAR
  if (e.target.classList.contains("btn-edit")) {
    const fila = e.target.closest("tr");
    fila.querySelectorAll("td[contenteditable]").forEach(td => td.setAttribute("contenteditable","true"));
    fila.querySelector(".btn-save").style.display = "inline-block";
  }

  // GUARDAR
  if (e.target.classList.contains("btn-save")) {
    const fila = e.target.closest("tr");
    const campos = fila.querySelectorAll("td[contenteditable]");
    let data = {};
    if (tipo === "proveedores") {
      data = {
        ruc: campos[0].textContent.trim(),
        nombre: campos[1].textContent.trim(),
        direccion: campos[2].textContent.trim(),
        telefono: campos[3].textContent.trim(),
      };
    } else if (tipo === "productos") {
      data = {
        nombre: campos[0].textContent.trim(),
        unidad: campos[1].textContent.trim(),
        material: campos[2].textContent.trim(),
        maquinaria: campos[3].textContent.trim(),
        productoOf: campos[4].textContent.trim(),
        insumosExtra: campos[5].textContent.trim(),
      };
    } else if (tipo === "facturas") {
      data = {
        idFactura: campos[0].textContent.trim(),
        proveedor: campos[1].textContent.trim(),
        producto: campos[2].textContent.trim(),
        monto: campos[3].textContent.trim().replace(/[S/$]/g,""),
        tipo: campos[4].textContent.trim(),
        fecha: campos[5].textContent.trim()
      };
    }
    await updateDoc(doc(db, tipo, id), data);
    fila.querySelectorAll("td[contenteditable]").forEach(td => td.setAttribute("contenteditable","false"));
    e.target.style.display = "none";
  }

  // MODAL PROVEEDOR/PRODUCTO
  if (e.target.classList.contains("ver-proveedor") || e.target.classList.contains("ver-producto")) {
    const coleccion = e.target.classList.contains("ver-proveedor") ? "proveedores" : "productos";
    const campo = "nombre";
    const valor = e.target.dataset.nombre;
    mostrarModalDatos(coleccion, campo, valor);
  }
});

// ======================= MODAL =======================
async function mostrarModalDatos(coleccion, campo, valor) {
  const modal = document.getElementById("modalDetalle");
  const modalContenido = document.getElementById("modalContenido");
  modalContenido.innerHTML = "<p>Cargando...</p>";
  modal.style.display = "flex";

  onSnapshot(collection(db, coleccion), (snap) => {
    snap.forEach((docu) => {
      const data = docu.data();
      if (data[campo] === valor) {
        modalContenido.innerHTML = `<h3>${coleccion === "proveedores" ? "Proveedor" : "Producto"}: ${data.nombre}</h3>
          ${data.ruc ? `<p><strong>RUC:</strong> ${data.ruc}</p>` : ""}
          ${data.direccion ? `<p><strong>Dirección:</strong> ${data.direccion}</p>` : ""}
          ${data.telefono ? `<p><strong>Teléfono:</strong> ${data.telefono}</p>` : ""}
          ${data.unidad ? `<p><strong>Unidad:</strong> ${data.unidad}</p>` : ""}
          ${data.material ? `<p><strong>Material:</strong> ${data.material}</p>` : ""}
          ${data.maquinaria ? `<p><strong>Maquinaria:</strong> ${data.maquinaria}</p>` : ""}
          ${data.productoOf ? `<p><strong>Producto final:</strong> ${data.productoOf}</p>` : ""}
          ${data.insumosExtra ? `<p><strong>Insumos extra:</strong> ${data.insumosExtra}</p>` : ""}
        `;
      }
    });
  });
}

document.getElementById("cerrarModal").addEventListener("click", () => {
  document.getElementById("modalDetalle").style.display = "none";
});





