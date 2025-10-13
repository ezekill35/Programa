import { auth, db } from "./firebase.js";
import { 
  collection, addDoc, onSnapshot, deleteDoc, doc, query, where 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ---------------- AUTENTICACIÓN ----------------
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ---------------- REFERENCIAS ----------------
const proveedoresCol = collection(db, "proveedores");
const productosCol = collection(db, "productos");
const facturasCol = collection(db, "facturas");

// ---------------- NAVEGACIÓN SECCIONES ----------------
const secciones = document.querySelectorAll(".seccion");
const menuBtns = document.querySelectorAll(".menu-btn");

menuBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    menuBtns.forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    secciones.forEach(sec => sec.classList.remove("activa"));
    const target = document.getElementById(btn.dataset.target);
    if(target) target.classList.add("activa");
  });
});

// ---------------- VALIDACIONES ----------------
function validarNumero(input) {
  input.value = input.value.replace(/\D/g, '');
}

function validarDecimal(input) {
  input.value = input.value.replace(/[^0-9.]/g, '');
}

// ---------------- PROVEEDORES ----------------
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");
const proveedorFactura = document.getElementById("proveedorFactura");
const rucInput = document.getElementById("rucProveedor");

rucInput.addEventListener("input", () => validarNumero(rucInput));

proveedorForm.addEventListener("submit", async e => {
  e.preventDefault();
  const ruc = rucInput.value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();
  if(!ruc || !nombre) return alert("RUC y Nombre son obligatorios");
  await addDoc(proveedoresCol, { ruc, nombre, direccion });
  proveedorForm.reset();
});

onSnapshot(proveedoresCol, snapshot => {
  tablaProveedores.innerHTML = "";
  proveedorFactura.innerHTML = `<option value="">Seleccione proveedor</option>`;
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.ruc}</td>
      <td>${data.nombre}</td>
      <td>${data.direccion || ""}</td>
      <td><button class="btn secondary" onclick="eliminarProveedor('${docSnap.id}')">Eliminar</button></td>
    `;
    tablaProveedores.appendChild(tr);

    const option = document.createElement("option");
    option.value = data.nombre;
    option.textContent = data.nombre;
    proveedorFactura.appendChild(option);
  });
});

window.eliminarProveedor = async function(id){
  if(confirm("¿Eliminar este proveedor?")){
    await deleteDoc(doc(db, "proveedores", id));
  }
}

// ---------------- PRODUCTOS ----------------
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");
const productoFactura = document.getElementById("productoFactura");
const cantidadInput = document.getElementById("cantidadProducto");
const valorInput = document.getElementById("valorUnitarioProducto");

cantidadInput.addEventListener("input", () => validarDecimal(cantidadInput));
valorInput.addEventListener("input", () => validarDecimal(valorInput));

productoForm.addEventListener("submit", async e => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const cantidad = cantidadInput.value.trim();
  const unidad = document.getElementById("unidadProducto").value.trim();
  const valor = valorInput.value.trim();
  if(!nombre || !cantidad || !valor) return alert("Nombre, cantidad y valor son obligatorios");
  await addDoc(productosCol, { nombre, cantidad, unidad, valor });
  productoForm.reset();
});

onSnapshot(productosCol, snapshot => {
  tablaProductos.innerHTML = "";
  productoFactura.innerHTML = `<option value="">Seleccione producto</option>`;
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.cantidad || ""}</td>
      <td>${data.unidad || ""}</td>
      <td>${data.valor || ""}</td>
      <td><button class="btn secondary" onclick="eliminarProducto('${docSnap.id}')">Eliminar</button></td>
    `;
    tablaProductos.appendChild(tr);

    const option = document.createElement("option");
    option.value = data.nombre;
    option.textContent = data.nombre;
    productoFactura.appendChild(option);
  });
});

window.eliminarProducto = async function(id){
  if(confirm("¿Eliminar este producto?")){
    await deleteDoc(doc(db, "productos", id));
  }
}

// ---------------- FACTURAS ----------------
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");
const montoInput = document.getElementById("montoFactura");

montoInput.addEventListener("input", () => validarDecimal(montoInput));

facturaForm.addEventListener("submit", async e => {
  e.preventDefault();
  const numero = document.getElementById("numeroFactura").value.trim();
  const fecha = document.getElementById("fechaEmisionFactura").value;
  const proveedor = proveedorFactura.value;
  const producto = productoFactura.value;
  const monto = montoInput.value.trim();
  const moneda = document.getElementById("monedaFactura").value;
  const tipo = document.getElementById("tipoFactura").value;

  if(!numero || !fecha || !proveedor || !producto || !monto) 
    return alert("Complete todos los campos obligatorios");
  await addDoc(facturasCol, { numero, fecha, proveedor, producto, monto, moneda, tipo });
  facturaForm.reset();
});

onSnapshot(facturasCol, snapshot => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.numero}</td>
      <td>${data.proveedor}</td>
      <td>${data.producto}</td>
      <td>${data.monto}</td>
      <td>${data.tipo}</td>
      <td>${data.fecha}</td>
      <td>
        <button class="btn secondary" onclick="verFactura('${docSnap.id}')">Detalle</button>
        <button class="btn secondary" onclick="eliminarFactura('${docSnap.id}')">Eliminar</button>
      </td>
    `;
    tablaFacturas.appendChild(tr);
  });
});

window.eliminarFactura = async function(id){
  if(confirm("¿Eliminar esta factura?")){
    await deleteDoc(doc(db, "facturas", id));
  }
}

window.verFactura = function(id){
  const docRef = doc(db, "facturas", id);
  onSnapshot(docRef, snapshot => {
    const data = snapshot.data();
    document.getElementById("facturaNumero").textContent = data.numero;
    document.getElementById("facturaFecha").textContent = data.fecha;
    document.getElementById("facturaProveedor").textContent = data.proveedor;
    document.getElementById("facturaProducto").textContent = data.producto;
    document.getElementById("facturaMonto").textContent = data.monto;
    document.getElementById("facturaMoneda").textContent = data.moneda;
    document.getElementById("facturaTipo").textContent = data.tipo;
    document.getElementById('modalFactura').classList.add('show');
  }, { once: true });
}

function closeFactura() { document.getElementById('modalFactura').classList.remove('show'); }

// ---------------- BUSCADOR ----------------
const buscador = document.getElementById("buscadorFactura");
const resultsContainer = document.getElementById("resultsContainer");
const resultTitle = document.getElementById("resultTitle");
const resultSub = document.getElementById("resultSub");
const modalResultados = document.getElementById("modalResultados");

buscador.addEventListener("keypress", async e => {
  if(e.key === "Enter") {
    e.preventDefault();
    const q = query(facturasCol, where("producto", "==", buscador.value.trim()));
    onSnapshot(q, snapshot => {
      resultsContainer.innerHTML = "";
      if(snapshot.empty){
        resultTitle.textContent = "Sin resultados";
        resultSub.textContent = "";
      } else {
        resultTitle.textContent = `Resultados para: ${buscador.value}`;
        resultSub.textContent = `Se encontraron ${snapshot.size} factura(s).`;
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          const div = document.createElement("div");
          div.className = "fact-card";
          div.innerHTML = `
            <h4>${data.producto}</h4>
            <div class="meta">Proveedor: ${data.proveedor} | Monto: ${data.monto}${data.moneda}</div>
          `;
          div.onclick = () => { verFactura(docSnap.id); closeResultados(); }
          resultsContainer.appendChild(div);
        });
      }
      modalResultados.classList.add("show");
    }, { once: true });
  }
});

document.getElementById("btnRefresh").addEventListener("click", () => {
  buscador.value = "";
  closeResultados();
});

function closeResultados() { modalResultados.classList.remove("show"); }




