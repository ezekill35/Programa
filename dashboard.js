// dashboard.js (modular con Firebase + buscadores dinámicos)
import { 
  db, auth,
  collection, addDoc, getDocs, deleteDoc, updateDoc, doc, onSnapshot
} from "./firebase.js";

// ----------------------
// 🔹 CERRAR SESIÓN
// ----------------------
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "index.html";
});

// ----------------------
// 🔹 NAVEGACIÓN ENTRE SECCIONES
// ----------------------
const navBtns = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".content-section");

navBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    navBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const sectionId = btn.dataset.section;
    sections.forEach(sec => sec.classList.remove("active"));
    document.getElementById(sectionId).classList.add("active");
  });
});

// ----------------------
// 🔹 PROVEEDORES
// ----------------------
const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.getElementById("tablaProveedores");
const buscarProveedor = document.getElementById("buscarProveedor");

const refProveedores = collection(db, "proveedores");

formProveedor.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nuevoProv = {
    ruc: formProveedor.rucProv.value,
    nombre: formProveedor.nombreProv.value,
    producto: formProveedor.productoProv.value,
    direccion: formProveedor.direccionProv.value,
  };
  await addDoc(refProveedores, nuevoProv);
  formProveedor.reset();
});

onSnapshot(refProveedores, (snapshot) => {
  renderTabla(snapshot.docs, tablaProveedores, "proveedor");
});

buscarProveedor.addEventListener("input", () => {
  filtrarTabla(tablaProveedores, buscarProveedor.value);
});

// ----------------------
// 🔹 PRODUCTOS
// ----------------------
const formProducto = document.getElementById("formProducto");
const tablaProductos = document.getElementById("tablaProductos");
const buscarProducto = document.getElementById("buscarProducto");

const refProductos = collection(db, "productos");

formProducto.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nuevoProd = {
    nombre: formProducto.nombreProd.value,
    descripcion: formProducto.descProd.value,
    cantidad: formProducto.cantidadProd.value,
    unidad: formProducto.unidadProd.value,
    valorUnitario: formProducto.valorUnitProd.value,
  };
  await addDoc(refProductos, nuevoProd);
  formProducto.reset();
});

onSnapshot(refProductos, (snapshot) => {
  renderTabla(snapshot.docs, tablaProductos, "producto");
});

buscarProducto.addEventListener("input", () => {
  filtrarTabla(tablaProductos, buscarProducto.value);
});

// ----------------------
// 🔹 FACTURAS
// ----------------------
const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas");
const buscarFactura = document.getElementById("buscarFactura");

const refFacturas = collection(db, "facturas");

formFactura.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nuevaFactura = {
    proveedor: formFactura.proveedorFactura.value,
    producto: formFactura.productoFactura.value,
    tipo: formFactura.tipoFactura.value,
    monto: formFactura.montoFactura.value,
    moneda: formFactura.monedaFactura.value,
    fecha: formFactura.fechaFactura.value,
    descripcion: formFactura.descFactura.value,
  };
  await addDoc(refFacturas, nuevaFactura);
  formFactura.reset();
});

onSnapshot(refFacturas, (snapshot) => {
  renderTabla(snapshot.docs, tablaFacturas, "factura");
});

buscarFactura.addEventListener("input", () => {
  filtrarTabla(tablaFacturas, buscarFactura.value);
});

// ----------------------
// 🔹 FUNCIONES DE RENDER TABLAS
// ----------------------
function renderTabla(docs, tabla, tipo) {
  tabla.innerHTML = "";
  docs.forEach((d) => {
    const data = d.data();
    const tr = document.createElement("tr");

    if (tipo === "proveedor") {
      tr.innerHTML = `
        <td>${data.ruc}</td>
        <td>${data.nombre}</td>
        <td>${data.producto}</td>
        <td>${data.direccion}</td>
        <td><button class="btn btn-sm btn-danger eliminar" data-id="${d.id}">Eliminar</button></td>
      `;
    }

    if (tipo === "producto") {
      tr.innerHTML = `
        <td>${data.nombre}</td>
        <td>${data.descripcion}</td>
        <td>${data.cantidad}</td>
        <td>${data.unidad}</td>
        <td>${data.valorUnitario}</td>
        <td><button class="btn btn-sm btn-danger eliminar" data-id="${d.id}">Eliminar</button></td>
      `;
    }

    if (tipo === "factura") {
      tr.innerHTML = `
        <td>${data.proveedor}</td>
        <td>${data.producto}</td>
        <td>${data.tipo}</td>
        <td>${data.moneda} ${data.monto}</td>
        <td>${data.fecha}</td>
        <td>${data.descripcion}</td>
        <td><button class="btn btn-sm btn-danger eliminar" data-id="${d.id}">Eliminar</button></td>
      `;
    }

    tabla.appendChild(tr);
  });

  tabla.querySelectorAll(".eliminar").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (confirm("¿Eliminar este registro?")) {
        const ref = doc(db, tipo + "s", id);
        await deleteDoc(ref);
      }
    });
  });
}

// ----------------------
// 🔹 FUNCIONES DE BUSCADOR
// ----------------------
function filtrarTabla(tabla, texto) {
  const filtro = texto.toLowerCase();
  Array.from(tabla.getElementsByTagName("tr")).forEach((fila) => {
    const visible = Array.from(fila.getElementsByTagName("td")).some(td =>
      td.textContent.toLowerCase().includes(filtro)
    );
    fila.style.display = visible ? "" : "none";
  });
}

// ----------------------
// 🔹 LLENAR SELECTS DE FACTURA CON PROVEEDORES Y PRODUCTOS
// ----------------------
const proveedorSelect = document.getElementById("proveedorFactura");
const productoSelect = document.getElementById("productoFactura");

onSnapshot(refProveedores, (snapshot) => {
  proveedorSelect.innerHTML = "<option value=''>Seleccionar proveedor</option>";
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    proveedorSelect.innerHTML += `<option value="${data.nombre}">${data.nombre}</option>`;
  });
});

onSnapshot(refProductos, (snapshot) => {
  productoSelect.innerHTML = "<option value=''>Seleccionar producto</option>";
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    productoSelect.innerHTML += `<option value="${data.nombre}">${data.nombre}</option>`;
  });
});

// ----------------------
// 🔹 REPORTES (Placeholder simple)
// ----------------------
document.getElementById("generarReporte").addEventListener("click", async () => {
  const contenedor = document.getElementById("reporteContenido");
  const [provSnap, prodSnap, factSnap] = await Promise.all([
    getDocs(refProveedores),
    getDocs(refProductos),
    getDocs(refFacturas)
  ]);

  contenedor.innerHTML = `
    <h5 class="text-center text-primary">📊 Reporte General</h5>
    <p>Total de Proveedores: <b>${provSnap.size}</b></p>
    <p>Total de Productos: <b>${prodSnap.size}</b></p>
    <p>Total de Facturas: <b>${factSnap.size}</b></p>
  `;
});

