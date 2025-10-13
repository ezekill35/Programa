import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
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

  if (!ruc || !nombre) {
    alert("RUC y Nombre son obligatorios.");
    return;
  }

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
      <td>${p.ruc}</td>
      <td class="nombre">${p.nombre}</td>
      <td class="direccion">${p.direccion || "-"}</td>
      <td class="telefono">${p.telefono || "-"}</td>
      <td>
        <button class="btn-edit" data-id="${docu.id}" data-tipo="proveedores">✏️ Editar</button>
        <button class="btn-delete" data-id="${docu.id}" data-tipo="proveedores">🗑️</button>
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

  if (!nombre) {
    alert("El nombre del producto es obligatorio.");
    return;
  }

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
      <td class="nombre">${p.nombre}</td>
      <td class="unidad">${p.unidad || "-"}</td>
      <td class="material">${p.material || "-"}</td>
      <td class="maquinaria">${p.maquinaria || "-"}</td>
      <td class="productoOf">${p.productoOf || "-"}</td>
      <td class="insumosExtra">${p.insumosExtra || "-"}</td>
      <td>
        <button class="btn-edit" data-id="${docu.id}" data-tipo="productos">✏️ Editar</button>
        <button class="btn-delete" data-id="${docu.id}" data-tipo="productos">🗑️</button>
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
  const numero = document.getElementById("numeroFactura").value.trim();
  const fecha = document.getElementById("fechaEmisionFactura").value;
  const proveedor = document.getElementById("proveedorFactura").value;
  const producto = document.getElementById("productoFactura").value;
  const monto = document.getElementById("montoFactura").value;
  const moneda = document.getElementById("monedaFactura").value;
  const tipo = document.getElementById("tipoFactura").value;

  if (!numero || !proveedor || !producto || !monto || !fecha) {
    alert("Completa todos los campos obligatorios.");
    return;
  }

  await addDoc(collection(db, "facturas"), { numero, fecha, proveedor, producto, monto, moneda, tipo });
  facturaForm.reset();
});

// Mostrar todas las facturas en tiempo real
onSnapshot(collection(db, "facturas"), (snapshot) => {
  facturasGuardadas = [];
  snapshot.forEach((docu) => {
    facturasGuardadas.push({ id: docu.id, ...docu.data() });
  });
  mostrarFacturas(facturasGuardadas);
});

function mostrarFacturas(facturas) {
  tablaFacturas.innerHTML = "";
  facturas.forEach(f => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${f.id}</td>
      <td class="numero">${f.numero}</td>
      <td class="proveedor ver-proveedor" data-nombre="${f.proveedor}" style="cursor:pointer;color:#007bff">${f.proveedor}</td>
      <td class="producto ver-producto" data-nombre="${f.producto}" style="cursor:pointer;color:#007bff">${f.producto}</td>
      <td class="monto">${f.monto}</td>
      <td class="moneda">${f.moneda}</td>
      <td class="tipo">${f.tipo}</td>
      <td class="fecha">${f.fecha}</td>
      <td>
        <button class="btn-edit" data-id="${f.id}" data-tipo="facturas">✏️ Editar</button>
        <button class="btn-delete" data-id="${f.id}" data-tipo="facturas">🗑️</button>
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

buscador.addEventListener("input", () => {
  if (buscador.value.trim() === "") mostrarFacturas(facturasGuardadas);
});

// ======================= ELIMINAR Y EDITAR =======================
document.addEventListener("click", async e => {
  const fila = e.target.closest("tr");

  // Eliminar
  if (e.target.classList.contains("btn-delete")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    if (confirm("¿Desea eliminar este registro?")) {
      await deleteDoc(doc(db, tipo, id));
    }
  }

  // Editar
  if (e.target.classList.contains("btn-edit")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;

    if (tipo === "proveedores") {
      fila.querySelector(".nombre").contentEditable = true;
      fila.querySelector(".direccion").contentEditable = true;
      fila.querySelector(".telefono").contentEditable = true;
    } else if (tipo === "productos") {
      fila.querySelector(".nombre").contentEditable = true;
      fila.querySelector(".unidad").contentEditable = true;
      fila.querySelector(".material").contentEditable = true;
      fila.querySelector(".maquinaria").contentEditable = true;
      fila.querySelector(".productoOf").contentEditable = true;
      fila.querySelector(".insumosExtra").contentEditable = true;
    } else if (tipo === "facturas") {
      fila.querySelector(".numero").contentEditable = true;
      fila.querySelector(".monto").contentEditable = true;
      fila.querySelector(".moneda").contentEditable = true;
      fila.querySelector(".tipo").contentEditable = true;
      const fecha = fila.querySelector(".fecha").textContent;
      fila.querySelector(".fecha").innerHTML = `<input type="date" value="${fecha}">`;
    }

    e.target.textContent = "💾 Guardar";
    e.target.classList.remove("btn-edit");
    e.target.classList.add("btn-save");
  }

  // Guardar cambios
  if (e.target.classList.contains("btn-save")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;

    let dataUpdate = {};
    if (tipo === "proveedores") {
      dataUpdate = {
        nombre: fila.querySelector(".nombre").textContent.trim(),
        direccion: fila.querySelector(".direccion").textContent.trim(),
        telefono: fila.querySelector(".telefono").textContent.trim(),
      };
    } else if (tipo === "productos") {
      dataUpdate = {
        nombre: fila.querySelector(".nombre").textContent.trim(),
        unidad: fila.querySelector(".unidad").textContent.trim(),
        material: fila.querySelector(".material").textContent.trim(),
        maquinaria: fila.querySelector(".maquinaria").textContent.trim(),
        productoOf: fila.querySelector(".productoOf").textContent.trim(),
        insumosExtra: fila.querySelector(".insumosExtra").textContent.trim(),
      };
    } else if (tipo === "facturas") {
      dataUpdate = {
        numero: fila.querySelector(".numero").textContent.trim(),
        monto: fila.querySelector(".monto").textContent.trim(),
        moneda: fila.querySelector(".moneda").textContent.trim(),
        tipo: fila.querySelector(".tipo").textContent.trim(),
        fecha: fila.querySelector(".fecha input").value,
      };
    }

    await updateDoc(doc(db, tipo, id), dataUpdate);

    // Restaurar fila a solo lectura
    fila.querySelectorAll("[contenteditable]").forEach(el => el.contentEditable = false);
    if (tipo === "facturas") {
      fila.querySelector(".fecha").textContent = dataUpdate.fecha;
    }

    e.target.textContent = "✏️ Editar";
    e.target.classList.remove("btn-save");
    e.target.classList.add("btn-edit");
  }

  // Ver proveedor/producto
  if (e.target.classList.contains("ver-proveedor") || e.target.classList.contains("ver-producto")) {
    const coleccion = e.target.classList.contains("ver-proveedor") ? "proveedores" : "productos";
    const nombre = e.target.dataset.nombre;
    mostrarModalDatos(coleccion, "nombre", nombre);
  }
});

// ======================= MODAL DETALLE =======================
async function mostrarModalDatos(coleccion, campo, valor) {
  const modal = document.getElementById("modalDetalle");
  const modalContenido = document.getElementById("modalContenido");
  modalContenido.innerHTML = "<p>Cargando datos...</p>";

  onSnapshot(collection(db, coleccion), (snap) => {
    snap.forEach((docu) => {
      const data = docu.data();
      if (data[campo] === valor) {
        modalContenido.innerHTML = Object.entries(data).map(([key, val]) => `<p><strong>${key}:</strong> ${val || "-"}</p>`).join("");
      }
    });
  });

  modal.style.display = "flex";
}

document.getElementById("cerrarModal").addEventListener("click", () => {
  document.getElementById("modalDetalle").style.display = "none";
});





