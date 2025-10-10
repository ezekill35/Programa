import { db, auth } from "./firebase.js";
import {
  collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc, getDoc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ======== CAMBIO DE SECCIONES =========
const secciones = document.querySelectorAll(".seccion");
const menuBtns = document.querySelectorAll(".menu-btn");
menuBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    menuBtns.forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    const target = btn.dataset.target;
    secciones.forEach(sec => sec.style.display = "none");
    document.getElementById(target).style.display = "block";
  });
});

// ======== CERRAR SESIÓN =========
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ======== FUNCIONES AUXILIARES =========
const proveedorSelect = document.getElementById("proveedorFactura");
const productoSelect = document.getElementById("productoFactura");

// ======== PROVEEDORES =========
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");

proveedorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();

  if (!/^\d+$/.test(ruc)) return alert("El RUC debe contener solo números.");

  await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion });
  proveedorForm.reset();
});

onSnapshot(collection(db, "proveedores"), (snapshot) => {
  tablaProveedores.innerHTML = "";
  proveedorSelect.innerHTML = `<option value="">Seleccionar...</option>`;
  snapshot.forEach(docu => {
    const p = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.ruc}</td>
      <td>${p.nombre}</td>
      <td>${p.direccion}</td>
      <td>
        <button class="btn-edit" data-id="${docu.id}" data-tipo="proveedor">Editar</button>
        <button class="btn-delete" data-id="${docu.id}" data-tipo="proveedor">Eliminar</button>
      </td>`;
    tablaProveedores.appendChild(tr);
    proveedorSelect.innerHTML += `<option value="${docu.id}">${p.nombre}</option>`;
  });
});

// ======== PRODUCTOS =========
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");

productoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const cantidad = parseFloat(document.getElementById("cantidadProducto").value) || 0;
  const unidad = document.getElementById("unidadProducto").value.trim();
  const valorUnitario = parseFloat(document.getElementById("valorUnitarioProducto").value) || 0;

  await addDoc(collection(db, "productos"), { nombre, cantidad, unidad, valorUnitario });
  productoForm.reset();
});

onSnapshot(collection(db, "productos"), (snapshot) => {
  tablaProductos.innerHTML = "";
  productoSelect.innerHTML = `<option value="">Seleccionar...</option>`;
  snapshot.forEach(docu => {
    const p = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.cantidad}</td>
      <td>${p.unidad}</td>
      <td>${p.valorUnitario}</td>
      <td>
        <button class="btn-edit" data-id="${docu.id}" data-tipo="producto">Editar</button>
        <button class="btn-delete" data-id="${docu.id}" data-tipo="producto">Eliminar</button>
      </td>`;
    tablaProductos.appendChild(tr);
    productoSelect.innerHTML += `<option value="${docu.id}">${p.nombre}</option>`;
  });
});

// ======== FACTURAS =========
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");

facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const numero = document.getElementById("numeroFactura").value.trim();
  const proveedorId = proveedorSelect.value;
  const productoId = productoSelect.value;
  const monto = parseFloat(document.getElementById("montoFactura").value);
  const moneda = document.getElementById("monedaFactura").value;
  const tipo = document.getElementById("tipoFactura").value;

  if (!/^\d+$/.test(numero)) return alert("El número de factura debe contener solo números.");

  await addDoc(collection(db, "facturas"), {
    numero, proveedorId, productoId, monto, moneda, tipo
  });
  facturaForm.reset();
});

onSnapshot(collection(db, "facturas"), async (snapshot) => {
  tablaFacturas.innerHTML = "";
  for (const docu of snapshot.docs) {
    const f = docu.data();
    const proveedorDoc = await getDoc(doc(db, "proveedores", f.proveedorId));
    const productoDoc = await getDoc(doc(db, "productos", f.productoId));
    const proveedorNombre = proveedorDoc.exists() ? proveedorDoc.data().nombre : "—";
    const productoNombre = productoDoc.exists() ? productoDoc.data().nombre : "—";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.numero}</td>
      <td>${proveedorNombre}</td>
      <td>${productoNombre}</td>
      <td>${f.moneda}${f.monto}</td>
      <td>${f.tipo}</td>
      <td>
        <button class="btn-edit" data-id="${docu.id}" data-tipo="factura">Editar</button>
        <button class="btn-delete" data-id="${docu.id}" data-tipo="factura">Eliminar</button>
      </td>`;
    tablaFacturas.appendChild(tr);
  }
});

// ======== EDITAR / ELIMINAR =========
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-delete")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    await deleteDoc(doc(db, tipo + "s", id));
  }

  if (e.target.classList.contains("btn-edit")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    const ref = doc(db, tipo + "s", id);
    const snap = await getDoc(ref);
    const data = snap.data();
    let nuevosDatos = {};

    if (tipo === "proveedor") {
      const nombre = prompt("Nuevo nombre:", data.nombre);
      const direccion = prompt("Nueva dirección:", data.direccion);
      nuevosDatos = { nombre, direccion };
    } else if (tipo === "producto") {
      const cantidad = prompt("Nueva cantidad:", data.cantidad);
      const valorUnitario = prompt("Nuevo valor unitario:", data.valorUnitario);
      nuevosDatos = { cantidad: parseFloat(cantidad), valorUnitario: parseFloat(valorUnitario) };
    } else if (tipo === "factura") {
      const monto = prompt("Nuevo monto:", data.monto);
      nuevosDatos = { monto: parseFloat(monto) };
    }
    await updateDoc(ref, nuevosDatos);
  }
});


