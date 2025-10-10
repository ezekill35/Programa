// ==========================
// DASHBOARD.JS COMPLETO (Firebase 12.4.0 compatible)
// ==========================

import { app, db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ==========================
// AUTENTICACIÓN
// ==========================
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
});

document.getElementById("logout").addEventListener("click", () => {
  signOut(auth).then(() => (window.location.href = "index.html"));
});

// ==========================
// SECCIONES DEL DASHBOARD
// ==========================
const menuLinks = document.querySelectorAll(".menu a");
const secciones = document.querySelectorAll(".seccion");

menuLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.getAttribute("href").substring(1);

    secciones.forEach((sec) => (sec.style.display = "none"));
    document.getElementById(target).style.display = "block";

    menuLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
  });
});

document.getElementById("inicio").style.display = "block";

// ==========================
// PROVEEDORES
// ==========================
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");
const proveedorFactura = document.getElementById("proveedorFactura");

proveedorForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const ruc = document.getElementById("rucProveedor").value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();

  if (!/^\d+$/.test(ruc)) return alert("⚠️ El RUC debe contener solo números.");

  await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion });
  proveedorForm.reset();
});

onSnapshot(collection(db, "proveedores"), (snapshot) => {
  tablaProveedores.innerHTML = "";
  proveedorFactura.innerHTML = '<option value="">Seleccionar</option>';

  snapshot.forEach((docu) => {
    const data = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.ruc}</td>
      <td>${data.nombre}</td>
      <td>${data.direccion}</td>
      <td>
        <button class="btn-eliminar" data-id="${docu.id}" data-tipo="proveedores">🗑️</button>
      </td>
    `;
    tablaProveedores.appendChild(tr);

    const opt = document.createElement("option");
    opt.value = docu.id;
    opt.textContent = data.nombre;
    proveedorFactura.appendChild(opt);
  });
});

// ==========================
// PRODUCTOS
// ==========================
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");
const productoFactura = document.getElementById("productoFactura");

productoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombreProducto").value.trim();
  const valorUnitario = parseFloat(
    document.getElementById("valorProducto").value
  );

  if (isNaN(valorUnitario))
    return alert("⚠️ El valor unitario debe ser numérico.");

  await addDoc(collection(db, "productos"), { nombre, valorUnitario });
  productoForm.reset();
});

onSnapshot(collection(db, "productos"), (snapshot) => {
  tablaProductos.innerHTML = "";
  productoFactura.innerHTML = '<option value="">Seleccionar</option>';

  snapshot.forEach((docu) => {
    const data = docu.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.valorUnitario.toFixed(4)}</td>
      <td>
        <button class="btn-eliminar" data-id="${docu.id}" data-tipo="productos">🗑️</button>
      </td>
    `;
    tablaProductos.appendChild(tr);

    const opt = document.createElement("option");
    opt.value = docu.id;
    opt.textContent = data.nombre;
    productoFactura.appendChild(opt);
  });
});

// ==========================
// FACTURAS
// ==========================
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");

facturaForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const numero = document.getElementById("numeroFactura").value.trim();
  const fecha = document.getElementById("fechaFactura").value;
  const proveedorKey = proveedorFactura.value;
  const productoKey = productoFactura.value;
  const monto = parseFloat(document.getElementById("montoFactura").value);
  const tipo = document.getElementById("tipoFactura").value;
  const moneda = document.getElementById("monedaFactura").value;

  if (!numero || !fecha || !proveedorKey || !productoKey || isNaN(monto))
    return alert("⚠️ Complete todos los campos correctamente.");

  await addDoc(collection(db, "facturas"), {
    numero,
    fecha,
    proveedorKey,
    productoKey,
    monto,
    tipo,
    moneda,
  });

  facturaForm.reset();
});

onSnapshot(collection(db, "facturas"), async (snapshot) => {
  tablaFacturas.innerHTML = "";

  const proveedores = await getDocs(collection(db, "proveedores"));
  const productos = await getDocs(collection(db, "productos"));

  const proveedoresMap = {};
  proveedores.forEach((p) => (proveedoresMap[p.id] = p.data()));
  const productosMap = {};
  productos.forEach((p) => (productosMap[p.id] = p.data()));

  snapshot.forEach((docu) => {
    const factura = docu.data();
    const prov = proveedoresMap[factura.proveedorKey];
    const prod = productosMap[factura.productoKey];

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${factura.numero}</td>
      <td>${factura.fecha}</td>
      <td class="clickable" data-tipo="proveedores" data-id="${factura.proveedorKey}">
        ${prov ? prov.nombre : "—"}
      </td>
      <td class="clickable" data-tipo="productos" data-id="${factura.productoKey}">
        ${prod ? prod.nombre : "—"}
      </td>
      <td>${factura.moneda}${factura.monto.toFixed(2)}</td>
      <td>${factura.tipo}</td>
      <td>
        <button class="btn-eliminar" data-id="${docu.id}" data-tipo="facturas">🗑️</button>
      </td>
    `;
    tablaFacturas.appendChild(tr);
  });
});

// ==========================
// ELIMINAR O VER DETALLES
// ==========================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-eliminar")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    await deleteDoc(doc(db, tipo, id));
  }

  if (e.target.classList.contains("clickable")) {
    const id = e.target.dataset.id;
    const tipo = e.target.dataset.tipo;
    const snap = await getDoc(doc(db, tipo, id));
    if (snap.exists()) {
      const datos = snap.data();
      alert(
        `📋 Datos de ${tipo.toUpperCase()}:\n` +
          Object.entries(datos)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n")
      );
    }
  }
});

// ==========================
// BUSCADOR DE FACTURAS POR PRODUCTO
// ==========================
const buscador = document.getElementById("buscador");
buscador.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const query = buscador.value.trim().toLowerCase();
    if (!query) return;

    const productosSnap = await getDocs(collection(db, "productos"));
    let productoId = null;
    productosSnap.forEach((d) => {
      if (d.data().nombre.toLowerCase().includes(query)) productoId = d.id;
    });

    tablaFacturas.innerHTML = "";
    if (!productoId) {
      tablaFacturas.innerHTML = `<tr><td colspan="7">❌ No se encontraron facturas relacionadas.</td></tr>`;
      return;
    }

    const facturasSnap = await getDocs(collection(db, "facturas"));
    const proveedoresSnap = await getDocs(collection(db, "proveedores"));
    const proveedoresMap = {};
    proveedoresSnap.forEach((p) => (proveedoresMap[p.id] = p.data()));
    const productosMap = {};
    productosSnap.forEach((p) => (productosMap[p.id] = p.data()));

    facturasSnap.forEach((f) => {
      const factura = f.data();
      if (factura.productoKey === productoId) {
        const tr = document.createElement("tr");
        const prov = proveedoresMap[factura.proveedorKey];
        const prod = productosMap[factura.productoKey];
        tr.innerHTML = `
          <td>${factura.numero}</td>
          <td>${factura.fecha}</td>
          <td class="clickable" data-tipo="proveedores" data-id="${factura.proveedorKey}">
            ${prov ? prov.nombre : "—"}
          </td>
          <td class="clickable" data-tipo="productos" data-id="${factura.productoKey}">
            ${prod ? prod.nombre : "—"}
          </td>
          <td>${factura.moneda}${factura.monto.toFixed(2)}</td>
          <td>${factura.tipo}</td>
          <td><button class="btn-eliminar" data-id="${f.id}" data-tipo="facturas">🗑️</button></td>
        `;
        tablaFacturas.appendChild(tr);
      }
    });
  }
});




