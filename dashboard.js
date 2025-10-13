// ------------------- CONFIGURACIÓN FIREBASE -------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
    authDomain: "discovery-pets.firebaseapp.com",
    projectId: "discovery-pets",
    storageBucket: "discovery-pets.appspot.com",
    messagingSenderId: "481355972999",
    appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322",
    measurementId: "G-0WMLRY8FGM"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ------------------- ELEMENTOS DOM -------------------
const proveedorForm = document.getElementById("proveedorForm");
const tablaProveedores = document.getElementById("tablaProveedores");
const productoForm = document.getElementById("productoForm");
const tablaProductos = document.getElementById("tablaProductos");
const facturaForm = document.getElementById("facturaForm");
const tablaFacturas = document.getElementById("tablaFacturas");
const proveedorFactura = document.getElementById("proveedorFactura");
const productoFactura = document.getElementById("productoFactura");
const buscadorFactura = document.getElementById("buscadorFactura");
const resultsContainer = document.getElementById("resultsContainer");
const resultTitle = document.getElementById("resultTitle");
const resultSub = document.getElementById("resultSub");

// ------------------- HELPER MODALES -------------------
function closeFactura() { document.getElementById('modalFactura').classList.remove('show'); }
function openFactura() { document.getElementById('modalFactura').classList.add('show'); }
function closeResultados() { document.getElementById('modalResultados').classList.remove('show'); }

// ------------------- PROVEEDORES -------------------
proveedorForm.addEventListener("submit", e => {
  e.preventDefault();
  const ruc = document.getElementById("rucProveedor").value.trim();
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const direccion = document.getElementById("direccionProveedor").value.trim();
  if(!ruc || !nombre) return;

  const newRef = push(ref(db, "proveedores"));
  set(newRef, { ruc, nombre, direccion });

  proveedorForm.reset();
});

// Escuchar proveedores en tiempo real
onValue(ref(db, "proveedores"), snapshot => {
  tablaProveedores.innerHTML = "";
  proveedorFactura.innerHTML = `<option value="">Seleccione proveedor</option>`;
  snapshot.forEach(child => {
    const data = child.val();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.ruc}</td>
      <td>${data.nombre}</td>
      <td>${data.direccion || ""}</td>
      <td>
        <button class="btn secondary" onclick="eliminarProveedor('${child.key}')">Eliminar</button>
      </td>
    `;
    tablaProveedores.appendChild(tr);

    const option = document.createElement("option");
    option.value = data.nombre;
    option.textContent = data.nombre;
    proveedorFactura.appendChild(option);
  });
});

window.eliminarProveedor = function(key){
  if(confirm("¿Eliminar este proveedor?")){
    remove(ref(db, `proveedores/${key}`));
  }
}

// ------------------- PRODUCTOS -------------------
productoForm.addEventListener("submit", e => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const cantidad = document.getElementById("cantidadProducto").value.trim();
  const unidad = document.getElementById("unidadProducto").value.trim();
  const valor = document.getElementById("valorUnitarioProducto").value.trim();
  if(!nombre) return;

  const newRef = push(ref(db, "productos"));
  set(newRef, { nombre, cantidad, unidad, valor });

  productoForm.reset();
});

onValue(ref(db, "productos"), snapshot => {
  tablaProductos.innerHTML = "";
  productoFactura.innerHTML = `<option value="">Seleccione producto</option>`;
  snapshot.forEach(child => {
    const data = child.val();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.cantidad || ""}</td>
      <td>${data.unidad || ""}</td>
      <td>${data.valor || ""}</td>
      <td>
        <button class="btn secondary" onclick="eliminarProducto('${child.key}')">Eliminar</button>
      </td>
    `;
    tablaProductos.appendChild(tr);

    const option = document.createElement("option");
    option.value = data.nombre;
    option.textContent = data.nombre;
    productoFactura.appendChild(option);
  });
});

window.eliminarProducto = function(key){
  if(confirm("¿Eliminar este producto?")){
    remove(ref(db, `productos/${key}`));
  }
}

// ------------------- FACTURAS -------------------
facturaForm.addEventListener("submit", e => {
  e.preventDefault();
  const numero = document.getElementById("numeroFactura").value.trim();
  const fecha = document.getElementById("fechaEmisionFactura").value;
  const proveedor = proveedorFactura.value;
  const producto = productoFactura.value;
  const monto = document.getElementById("montoFactura").value.trim();
  const moneda = document.getElementById("monedaFactura").value;
  const tipo = document.getElementById("tipoFactura").value;

  if(!numero || !fecha || !proveedor || !producto || !monto) return;

  const newRef = push(ref(db, "facturas"));
  set(newRef, { numero, fecha, proveedor, producto, monto, moneda, tipo });

  facturaForm.reset();
});

onValue(ref(db, "facturas"), snapshot => {
  tablaFacturas.innerHTML = "";
  snapshot.forEach(child => {
    const data = child.val();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.numero}</td>
      <td>${data.proveedor}</td>
      <td>${data.producto}</td>
      <td>${data.monto}</td>
      <td>${data.tipo}</td>
      <td>${data.fecha}</td>
      <td>
        <button class="btn secondary" onclick="verFactura('${child.key}')">Detalle</button>
        <button class="btn secondary" onclick="eliminarFactura('${child.key}')">Eliminar</button>
      </td>
    `;
    tablaFacturas.appendChild(tr);
  });
});

window.eliminarFactura = function(key){
  if(confirm("¿Eliminar esta factura?")){
    remove(ref(db, `facturas/${key}`));
  }
}

window.verFactura = function(key){
  const facturaRef = ref(db, `facturas/${key}`);
  onValue(facturaRef, snapshot=>{
    const data = snapshot.val();
    document.getElementById("facturaNumero").textContent = data.numero;
    document.getElementById("facturaFecha").textContent = data.fecha;
    document.getElementById("facturaProveedor").textContent = data.proveedor;
    document.getElementById("facturaProducto").textContent = data.producto;
    document.getElementById("facturaMonto").textContent = data.monto;
    document.getElementById("facturaMoneda").textContent = data.moneda;
    document.getElementById("facturaTipo").textContent = data.tipo;
    openFactura();
  }, {once:true});
}

// ------------------- BUSCADOR -------------------
buscadorFactura.addEventListener("keypress", e=>{
  if(e.key === "Enter"){
    e.preventDefault();
    const termino = buscadorFactura.value.toLowerCase().trim();
    if(!termino) return;

    resultsContainer.innerHTML = "";
    onValue(ref(db, "facturas"), snapshot=>{
      let count = 0;
      snapshot.forEach(child=>{
        const data = child.val();
        if(data.producto.toLowerCase().includes(termino)){
          const div = document.createElement("div");
          div.className = "fact-card";
          div.innerHTML = `
            <h4>${data.producto}</h4>
            <div class="meta">${data.proveedor} · ${data.fecha}</div>
          `;
          div.onclick = ()=>verFactura(child.key);
          resultsContainer.appendChild(div);
          count++;
        }
      });
      resultTitle.textContent = `Resultados para "${termino}"`;
      resultSub.textContent = `${count} factura(s) encontrada(s)`;
      document.getElementById("modalResultados").classList.add("show");
    }, {onlyOnce:true});
  }
});

document.getElementById("btnRefresh").addEventListener("click", ()=>{
  buscadorFactura.value = "";
  closeResultados();
});

// ------------------- NAVIGATION TABS -------------------
document.querySelectorAll(".menu-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".menu-btn").forEach(b=>b.classList.remove("activo"));
    btn.classList.add("activo");
    const target = btn.dataset.target;
    document.querySelectorAll(".seccion").forEach(s=>{
      s.classList.remove("activa");
    });
    document.getElementById(target).classList.add("activa");
  });
});

// ------------------- CERRAR SESIÓN -------------------
document.getElementById("logoutBtn").addEventListener("click", ()=>{
  if(confirm("¿Cerrar sesión?")){
    location.href = "index.html";
  }
});



