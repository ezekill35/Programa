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
      <td contenteditable data-field="ruc" data-id="${docu.id}">${p.ruc}</td>
      <td contenteditable data-field="nombre" data-id="${docu.id}">${p.nombre}</td>
      <td contenteditable data-field="direccion" data-id="${docu.id}">${p.direccion}</td>
      <td contenteditable data-field="telefono" data-id="${docu.id}">${p.telefono}</td>
      <td><button class="btn-delete" data-id="${docu.id}" data-tipo="proveedores">🗑️</button></td>
    `;
    tablaProveedores.appendChild(fila);

    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = p.nombre;
    proveedorSelect.appendChild(option);
  });

  // Editar proveedor en tiempo real
  tablaProveedores.querySelectorAll("[contenteditable]").forEach(td => {
    td.addEventListener("blur", async () => {
      const field = td.dataset.field;
      const id = td.dataset.id;
      const value = td.textContent.trim();
      await updateDoc(doc(db, "proveedores", id), { [field]: value });
    });
  });
});

// ======================= PRODUCTOS =======================
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");

productoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const unidad = document.getElementById("unidadProducto").value.trim();
  const materialP = document.getElementById("materialP").value.trim();
  const maquinaria = document.getElementById("maquinaria").value.trim();
  const productoOf = document.getElementById("productoOf").value.trim();
  const insumosExtra = document.getElementById("insumosExtra").value.trim();

  await addDoc(collection(db, "productos"), { nombre, unidad, materialP, maquinaria, productoOf, insumosExtra });
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
      <td contenteditable data-field="nombre" data-id="${docu.id}">${p.nombre}</td>
      <td contenteditable data-field="unidad" data-id="${docu.id}">${p.unidad}</td>
      <td contenteditable data-field="materialP" data-id="${docu.id}">${p.materialP}</td>
      <td contenteditable data-field="maquinaria" data-id="${docu.id}">${p.maquinaria}</td>
      <td contenteditable data-field="productoOf" data-id="${docu.id}">${p.productoOf}</td>
      <td contenteditable data-field="insumosExtra" data-id="${docu.id}">${p.insumosExtra}</td>
      <td><button class="btn-delete" data-id="${docu.id}" data-tipo="productos">🗑️</button></td>
    `;
    tablaProductos.appendChild(fila);

    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = p.nombre;
    productoSelect.appendChild(option);
  });

  tablaProductos.querySelectorAll("[contenteditable]").forEach(td => {
    td.addEventListener("blur", async () => {
      const field = td.dataset.field;
      const id = td.dataset.id;
      const value = td.textContent.trim();
      await updateDoc(doc(db, "productos", id), { [field]: value });
    });
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
  const monto = document.getElementById("montoFactura").value.trim();
  const moneda = document.getElementById("monedaFactura").value;
  const tipo = document.getElementById("tipoFactura").value;

  if (!proveedor || !producto) return alert("Debe seleccionar proveedor y producto.");

  await addDoc(collection(db, "facturas"), { numero, fecha, proveedor, producto, monto, moneda, tipo });
  facturaForm.reset();
});

onSnapshot(collection(db, "facturas"), (snapshot) => {
  facturasGuardadas = [];
  snapshot.forEach((docu) => facturasGuardadas.push({ id: docu.id, ...docu.data() }));
  mostrarFacturas(facturasGuardadas);
});

function mostrarFacturas(facturas) {
  tablaFacturas.innerHTML = "";
  facturas.forEach((f) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td contenteditable data-field="numero" data-id="${f.id}">${f.numero}</td>
      <td contenteditable data-field="proveedor" data-id="${f.id}">${f.proveedor}</td>
      <td contenteditable data-field="producto" data-id="${f.id}">${f.producto}</td>
      <td contenteditable data-field="monto" data-id="${f.id}">${f.monto}</td>
      <td contenteditable data-field="tipo" data-id="${f.id}">${f.tipo}</td>
      <td contenteditable data-field="fecha" data-id="${f.id}">${f.fecha}</td>
      <td contenteditable data-field="idFactura" data-id="${f.id}">${f.id}</td>
      <td><button class="btn-delete" data-id="${f.id}" data-tipo="facturas">🗑️</button></td>
    `;
    tablaFacturas.appendChild(fila);
  });

  tablaFacturas.querySelectorAll("[contenteditable]").forEach(td => {
    td.addEventListener("blur", async () => {
      const field = td.dataset.field;
      const id = td.dataset.id;
      const value = td.textContent.trim();
      if (field === "idFactura") {
        await updateDoc(doc(db, "facturas", id), { numero: value });
      } else {
        await updateDoc(doc(db, "facturas", id), { [field]: value });
      }
    });
  });
}

// ======================= BUSCADOR =======================
const buscador = document.getElementById("buscadorFactura");
const btnRefresh = document.getElementById("btnRefresh");

buscador.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const valor = buscador.value.trim().toLowerCase();
    const filtradas = facturasGuardadas.filter((f) =>
      [f.numero, f.proveedor, f.producto, f.monto, f.tipo, f.fecha]
        .some(v => v?.toLowerCase().includes(valor))
    );
    mostrarFacturas(filtradas);
  }
});

buscador.addEventListener("input", () => {
  if (buscador.value.trim() === "") mostrarFacturas(facturasGuardadas);
});

btnRefresh.addEventListener("click", () => {
  buscador.value = "";
  mostrarFacturas(facturasGuardadas);
});

// ======================= ELIMINAR =======================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-delete")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    if (confirm("¿Desea eliminar este registro?")) {
      await deleteDoc(doc(db, tipo, id));
    }
  }
});


