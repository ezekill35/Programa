// ====================== IMPORTS ======================
import { db, auth } from './firebase.js';
import {
  collection, addDoc, getDocs, doc, deleteDoc, updateDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import {
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ====================== SESIÓN ======================
window.addEventListener("load", () => {
  // Espera breve para evitar redirecciones falsas
  setTimeout(() => {
    onAuthStateChanged(auth, user => {
      if (!user) {
        console.warn("⚠️ No hay usuario activo. Redirigiendo...");
        window.location.replace("index.html");
      } else {
        console.log("✅ Sesión activa:", user.email);
        iniciarDashboard();
      }
    });
  }, 800);
});

// ====================== DASHBOARD PRINCIPAL ======================
function iniciarDashboard() {

  // --- BOTÓN CERRAR SESIÓN ---
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.replace("index.html");
  });

  // --- NAVEGACIÓN ENTRE SECCIONES ---
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

  // ====================== CRUD PROVEEDORES ======================
  const formProveedor = document.getElementById("formProveedor");
  const tablaProveedores = document.getElementById("tablaProveedores");
  const proveedoresRef = collection(db, "proveedores");

  formProveedor.addEventListener("submit", async e => {
    e.preventDefault();
    const data = {
      ruc: document.getElementById("rucProv").value,
      nombre: document.getElementById("nombreProv").value,
      producto: document.getElementById("productoProv").value,
      direccion: document.getElementById("direccionProv").value
    };
    await addDoc(proveedoresRef, data);
    formProveedor.reset();
  });

  onSnapshot(proveedoresRef, snapshot => {
    tablaProveedores.innerHTML = "";
    const proveedorSelect = document.getElementById("proveedorFactura");
    proveedorSelect.innerHTML = `<option value="">Selecciona proveedor</option>`;
    snapshot.forEach(docu => {
      const p = docu.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.ruc}</td>
        <td>${p.nombre}</td>
        <td>${p.producto}</td>
        <td>${p.direccion}</td>
        <td>
          <button class="delete-btn" onclick="eliminarProveedor('${docu.id}')">Eliminar</button>
        </td>`;
      tablaProveedores.appendChild(tr);
      const opt = document.createElement("option");
      opt.value = p.nombre;
      opt.textContent = p.nombre;
      proveedorSelect.appendChild(opt);
    });
  });

  window.eliminarProveedor = async id => await deleteDoc(doc(db, "proveedores", id));

  // ====================== CRUD PRODUCTOS ======================
  const formProducto = document.getElementById("formProducto");
  const tablaProductos = document.getElementById("tablaProductos");
  const productosRef = collection(db, "productos");

  formProducto.addEventListener("submit", async e => {
    e.preventDefault();
    await addDoc(productosRef, {
      nombre: document.getElementById("nombreProd").value,
      descripcion: document.getElementById("descProd").value,
      cantidad: parseFloat(document.getElementById("cantidadProd").value),
      unidad: document.getElementById("unidadProd").value,
      valor: parseFloat(document.getElementById("valorProd").value)
    });
    formProducto.reset();
  });

  onSnapshot(productosRef, snapshot => {
    tablaProductos.innerHTML = "";
    snapshot.forEach(docu => {
      const p = docu.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.descripcion}</td>
      <td>${p.cantidad}</td>
      <td>${p.unidad}</td>
      <td>${p.valor.toFixed(2)}</td>
      <td><button class="delete-btn" onclick="eliminarProducto('${docu.id}')">Eliminar</button></td>`;
      tablaProductos.appendChild(tr);
    });
  });

  window.eliminarProducto = async id => await deleteDoc(doc(db, "productos", id));

  // ====================== CRUD FACTURAS ======================
  const formFactura = document.getElementById("formFactura");
  const tablaFacturas = document.getElementById("tablaFacturas");
  const facturasRef = collection(db, "facturas");

  formFactura.addEventListener("submit", async e => {
    e.preventDefault();
    await addDoc(facturasRef, {
      proveedor: document.getElementById("proveedorFactura").value,
      producto: document.getElementById("productoFactura").value,
      tipo: document.getElementById("tipoFactura").value,
      monto: parseFloat(document.getElementById("montoFactura").value),
      moneda: document.getElementById("monedaFactura").value,
      fecha: document.getElementById("fechaFactura").value,
      desc: document.getElementById("descFactura").value
    });
    formFactura.reset();
  });

  onSnapshot(facturasRef, snapshot => {
    tablaFacturas.innerHTML = "";
    snapshot.forEach(docu => {
      const f = docu.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${f.proveedor}</td>
        <td>${f.producto}</td>
        <td>${f.tipo}</td>
        <td>${f.monto.toFixed(2)} ${f.moneda}</td>
        <td>${f.fecha}</td>
        <td>${f.desc}</td>
        <td>
          <button class="delete-btn" onclick="eliminarFactura('${docu.id}')">Eliminar</button>
        </td>`;
      tablaFacturas.appendChild(tr);
    });
  });

  window.eliminarFactura = async id => await deleteDoc(doc(db, "facturas", id));

  // ====================== CRUD GASTOS ======================
  const formGasto = document.getElementById("formGasto");
  const tablaGastos = document.getElementById("tablaGastos");
  const gastosRef = collection(db, "gastos");

  formGasto.addEventListener("submit", async e => {
    e.preventDefault();
    await addDoc(gastosRef, {
      nombre: document.getElementById("nombreGasto").value,
      tipo: document.getElementById("tipoGasto").value,
      monto: parseFloat(document.getElementById("montoGasto").value),
      fecha: document.getElementById("fechaGasto").value
    });
    formGasto.reset();
  });

  onSnapshot(gastosRef, snapshot => {
    tablaGastos.innerHTML = "";
    snapshot.forEach(docu => {
      const g = docu.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${g.nombre}</td>
        <td>${g.tipo}</td>
        <td>${g.monto.toFixed(2)}</td>
        <td>${g.fecha}</td>
        <td><button class="delete-btn" onclick="eliminarGasto('${docu.id}')">Eliminar</button></td>`;
      tablaGastos.appendChild(tr);
    });
  });

  window.eliminarGasto = async id => await deleteDoc(doc(db, "gastos", id));

  // ====================== CRUD SERVICIOS ======================
  const formServicio = document.getElementById("formServicio");
  const tablaServicios = document.getElementById("tablaServicios");
  const serviciosRef = collection(db, "servicios");

  formServicio.addEventListener("submit", async e => {
    e.preventDefault();
    await addDoc(serviciosRef, {
      nombre: document.getElementById("nombreServ").value,
      precio: parseFloat(document.getElementById("precioServ").value),
      fecha: document.getElementById("fechaServ").value,
      desc: document.getElementById("descServ").value
    });
    formServicio.reset();
  });

  onSnapshot(serviciosRef, snapshot => {
    tablaServicios.innerHTML = "";
    snapshot.forEach(docu => {
      const s = docu.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.nombre}</td>
        <td>${s.precio.toFixed(2)}</td>
        <td>${s.fecha}</td>
        <td>${s.desc}</td>
        <td><button class="delete-btn" onclick="eliminarServicio('${docu.id}')">Eliminar</button></td>`;
      tablaServicios.appendChild(tr);
    });
  });

  window.eliminarServicio = async id => await deleteDoc(doc(db, "servicios", id));

  // ====================== BUSCADOR GLOBAL ======================
  const buscador = document.getElementById("buscadorGlobal");
  const resultados = document.getElementById("resultadosBusqueda");

  buscador.addEventListener("input", async () => {
    const texto = buscador.value.toLowerCase().trim();
    if (!texto) { resultados.innerHTML = ""; return; }

    resultados.innerHTML = "<p>Buscando...</p>";

    const snapFact = await getDocs(facturasRef);
    let coincidencias = [];

    snapFact.forEach(d => {
      const f = d.data();
      if (
        f.proveedor.toLowerCase().includes(texto) ||
        f.producto?.toLowerCase().includes(texto) ||
        f.desc.toLowerCase().includes(texto)
      ) {
        coincidencias.push(f);
      }
    });

    resultados.innerHTML = coincidencias.length
      ? coincidencias.map(f => `
        <div class="card">
          <p><strong>Proveedor:</strong> ${f.proveedor}</p>
          <p><strong>Producto:</strong> ${f.producto || "-"}</p>
          <p><strong>Monto:</strong> ${f.monto} ${f.moneda}</p>
          <p><strong>Fecha:</strong> ${f.fecha}</p>
          <p><strong>Descripción:</strong> ${f.desc}</p>
        </div>
      `).join("")
      : "<p>Sin resultados</p>";
  });

  // ====================== REPORTE ======================
  document.getElementById("generarReporte").addEventListener("click", async () => {
    const reporteDiv = document.getElementById("reporteContenido");
    let totalFacturas = 0, totalGastos = 0, totalServicios = 0;

    const factSnap = await getDocs(facturasRef);
    factSnap.forEach(f => totalFacturas += parseFloat(f.data().monto));

    const gastoSnap = await getDocs(gastosRef);
    gastoSnap.forEach(g => totalGastos += parseFloat(g.data().monto));

    const servSnap = await getDocs(serviciosRef);
    servSnap.forEach(s => totalServicios += parseFloat(s.data().precio));

    reporteDiv.innerHTML = `
      <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 8px 25px rgba(0,0,0,0.2);">
        <h3>📊 Reporte General</h3>
        <p><strong>Total Facturas:</strong> S/. ${totalFacturas.toFixed(2)}</p>
        <p><strong>Total Gastos:</strong> S/. ${totalGastos.toFixed(2)}</p>
        <p><strong>Total Servicios:</strong> S/. ${totalServicios.toFixed(2)}</p>
      </div>`;
  });
}
