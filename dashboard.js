import { auth, db } from "./firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { collection, addDoc, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// ========================
// 🔒 Verificar sesión
// ========================
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html";
  }
});

// ========================
// 🚪 Cerrar sesión
// ========================
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
if (btnCerrarSesion) {
  btnCerrarSesion.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}

// ========================
// 🌐 Navegación dinámica
// ========================
const secciones = {
  btnProveedor: "tplProveedor",
  btnFactura: "tplFactura",
  btnProducto: "tplProducto",
  btnGastos: "tplGastos",
  btnReporte: "tplReporte",
};

const contenido = document.getElementById("contenido");

// función para cargar plantilla sin recargar la página
function cargarSeccion(idBoton) {
  const templateId = secciones[idBoton];
  const template = document.getElementById(templateId);
  if (template && contenido) {
    contenido.innerHTML = "";
    contenido.appendChild(template.content.cloneNode(true));
    inicializarEventos(templateId); // inicializa eventos según la sección
  }
}

// asignar eventos a los botones de la barra lateral
Object.keys(secciones).forEach(idBoton => {
  const boton = document.getElementById(idBoton);
  if (boton) {
    boton.addEventListener("click", () => cargarSeccion(idBoton));
  }
});

// ========================
// 📋 Inicialización de formularios
// ========================
function inicializarEventos(templateId) {
  switch (templateId) {
    case "tplProveedor":
      inicializarProveedor();
      break;
    case "tplFactura":
      inicializarFactura();
      break;
    case "tplProducto":
      inicializarProducto();
      break;
    case "tplGastos":
      inicializarGasto();
      break;
    case "tplReporte":
      inicializarReporte();
      break;
  }
}

// ========================
// 👥 PROVEEDORES
// ========================
function inicializarProveedor() {
  const form = document.getElementById("formProveedor");
  const proveedoresRef = collection(db, "proveedores");

  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const data = {
        nombre: form["provNombre"].value,
        ruc: form["provRuc"].value,
        telefono: form["provTelefono"].value
      };
      await addDoc(proveedoresRef, data);
      alert("Proveedor guardado correctamente ✅");
      form.reset();
    });
  }
}

// ========================
// 🧾 FACTURAS
// ========================
function inicializarFactura() {
  const form = document.getElementById("formFactura");
  const facturasRef = collection(db, "facturas");
  const proveedorSelect = document.getElementById("facturaProveedor");

  // Cargar proveedores en el select
  onSnapshot(collection(db, "proveedores"), snapshot => {
    if (proveedorSelect) {
      proveedorSelect.innerHTML = "<option value=''>Selecciona proveedor</option>";
      snapshot.forEach(doc => {
        const data = doc.data();
        const option = document.createElement("option");
        option.value = data.nombre;
        option.textContent = data.nombre;
        proveedorSelect.appendChild(option);
      });
    }
  });

  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const data = {
        numero: form["facturaNumero"].value,
        proveedor: form["facturaProveedor"].value,
        monto: parseFloat(form["facturaMonto"].value),
        tipoMoneda: form["tipoMoneda"].value,
        tipoFactura: form["tipoFactura"].value,
        fecha: new Date().toISOString(),
      };
      await addDoc(facturasRef, data);
      alert("Factura registrada correctamente ✅");
      form.reset();
    });
  }
}

// ========================
// 📦 PRODUCTOS
// ========================
function inicializarProducto() {
  const form = document.getElementById("formProducto");
  const productosRef = collection(db, "productos");

  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const data = {
        nombre: form["prodNombre"].value,
        descripcion: form["prodDescripcion"].value,
        cantidad: parseFloat(form["prodCantidad"].value),
        unidad: form["prodUnidad"].value,
        valorUnitario: parseFloat(form["prodValor"].value)
      };
      await addDoc(productosRef, data);
      alert("Producto registrado correctamente ✅");
      form.reset();
    });
  }
}

// ========================
// 💸 GASTOS
// ========================
function inicializarGasto() {
  const form = document.getElementById("formGasto");
  const gastosRef = collection(db, "gastos");

  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const data = {
        descripcion: form["gastoDescripcion"].value,
        monto: parseFloat(form["gastoMonto"].value),
        fecha: form["gastoFecha"].value
      };
      await addDoc(gastosRef, data);
      alert("Gasto registrado correctamente ✅");
      form.reset();
    });
  }
}

// ========================
// 📊 REPORTE
// ========================
async function inicializarReporte() {
  const card = document.querySelector("#contenido .card");
  if (!card) return;

  const facturasSnap = await getDocs(collection(db, "facturas"));
  const productosSnap = await getDocs(collection(db, "productos"));
  const gastosSnap = await getDocs(collection(db, "gastos"));

  let totalFacturas = 0, totalGastos = 0, totalProductos = 0;
  facturasSnap.forEach(d => totalFacturas += parseFloat(d.data().monto || 0));
  gastosSnap.forEach(d => totalGastos += parseFloat(d.data().monto || 0));
  productosSnap.forEach(d => totalProductos += parseFloat(d.data().valorUnitario || 0) * (d.data().cantidad || 1));

  const resumen = document.createElement("div");
  resumen.classList.add("mt-3");
  resumen.innerHTML = `
    <h5>Resumen Financiero</h5>
    <ul>
      <li>Total Facturas: S/ ${totalFacturas.toFixed(2)}</li>
      <li>Total Productos: S/ ${totalProductos.toFixed(2)}</li>
      <li>Total Gastos: S/ ${totalGastos.toFixed(2)}</li>
    </ul>
  `;
  card.appendChild(resumen);
}

// ========================
// 🔍 BUSCADOR GLOBAL
// ========================
const buscador = document.getElementById("globalSearch");
if (buscador) {
  buscador.addEventListener("input", async e => {
    const valor = e.target.value.toLowerCase().trim();
    if (!valor) return;

    const facturasSnap = await getDocs(collection(db, "facturas"));
    const resultados = [];
    facturasSnap.forEach(doc => {
      const data = doc.data();
      if (
        data.numero?.toLowerCase().includes(valor) ||
        data.proveedor?.toLowerCase().includes(valor)
      ) resultados.push(data);
    });

    if (resultados.length > 0) {
      contenido.innerHTML = `<div class="card"><h5>Resultados de búsqueda</h5><ul class="list-group mt-3">${
        resultados.map(r => `<li class="list-group-item">Factura ${r.numero} - ${r.proveedor} - ${r.tipoMoneda} ${r.monto}</li>`).join("")
      }</ul></div>`;
    } else {
      contenido.innerHTML = `<div class="card"><p>No se encontraron resultados.</p></div>`;
    }
  });
}

