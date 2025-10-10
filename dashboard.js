import { auth, db } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { 
  collection, addDoc, onSnapshot, deleteDoc, doc, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  // -------------------- ELEMENTOS --------------------
  const secciones = document.querySelectorAll(".seccion");
  const menuBtns = document.querySelectorAll(".menu-btn");
  const buscador = document.getElementById("buscadorGlobal");
  const logoutBtn = document.getElementById("logoutBtn");

  const proveedorSelect = document.getElementById("proveedorFactura");
  const productoSelect = document.getElementById("productoFactura");

  const tablaProveedores = document.getElementById("tablaProveedores");
  const tablaProductos = document.getElementById("tablaProductos");
  const tablaFacturas = document.getElementById("tablaFacturas");

  const proveedorForm = document.getElementById("proveedorForm");
  const productoForm = document.getElementById("productoForm");
  const facturaForm = document.getElementById("facturaForm");

  // -------------------- MODAL --------------------
  const detalleModal = document.getElementById("detalleModal");
  const tituloModal = document.getElementById("tituloModal");
  const contenidoModal = document.getElementById("contenidoModal");
  const cerrarModal = document.getElementById("cerrarModal");

  cerrarModal.addEventListener("click", () => detalleModal.style.display = "none");
  window.addEventListener("click", e => { if(e.target === detalleModal) detalleModal.style.display = "none"; });

  function abrirModal(titulo, contenido){
    tituloModal.textContent = titulo;
    contenidoModal.textContent = contenido;
    detalleModal.style.display = "flex";
  }

  // -------------------- NAVEGACION --------------------
  menuBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      secciones.forEach(sec => sec.style.display = "none");
      document.getElementById(target).style.display = "block";
      menuBtns.forEach(b => b.classList.remove("activo"));
      btn.classList.add("activo");
    });
  });

  document.getElementById("proveedores").style.display = "block";
  menuBtns[0].classList.add("activo");

  // -------------------- LOGOUT --------------------
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "index.html");
  });

  // -------------------- CRUD PROVEEDORES --------------------
  proveedorForm.addEventListener("submit", async e => {
    e.preventDefault();
    const ruc = document.getElementById("rucProveedor").value;
    const nombre = document.getElementById("nombreProveedor").value;
    const direccion = document.getElementById("direccionProveedor").value;
    if(!ruc || !nombre || !direccion) return alert("Complete todos los campos");

    await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion });
    proveedorForm.reset();
  });

  onSnapshot(collection(db, "proveedores"), snapshot => {
    tablaProveedores.innerHTML = '';
    proveedorSelect.innerHTML = '<option value="" disabled selected>Seleccione proveedor</option>';
    snapshot.forEach(docSnap => {
      const p = docSnap.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.ruc}</td>
        <td>${p.nombre}</td>
        <td>${p.direccion}</td>
        <td><button class="btn btn-delete" onclick="eliminarProveedor('${docSnap.id}')">Eliminar</button></td>
      `;
      tablaProveedores.appendChild(row);

      const opt = document.createElement("option");
      opt.value = p.nombre;
      opt.textContent = p.nombre;
      proveedorSelect.appendChild(opt);
    });
  });

  window.eliminarProveedor = async (id) => {
    await deleteDoc(doc(db,"proveedores",id));
  };

  // -------------------- CRUD PRODUCTOS --------------------
  productoForm.addEventListener("submit", async e => {
    e.preventDefault();
    const nombre = document.getElementById("nombreProducto").value;
    const descripcion = document.getElementById("descripcionProducto").value;
    const cantidad = document.getElementById("cantidadProducto").value;
    const unidad = document.getElementById("unidadProducto").value;
    const valor = document.getElementById("valorUnitarioProducto").value;
    if(!nombre) return alert("Ingrese nombre del producto");

    await addDoc(collection(db, "productos"), { nombre, descripcion, cantidad, unidad, valor });
    productoForm.reset();
  });

  onSnapshot(collection(db, "productos"), snapshot => {
    tablaProductos.innerHTML = '';
    productoSelect.innerHTML = '<option value="" disabled selected>Seleccione producto</option>';
    snapshot.forEach(docSnap => {
      const p = docSnap.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.nombre}</td>
        <td>${p.descripcion}</td>
        <td>${p.cantidad}</td>
        <td>${p.unidad}</td>
        <td>${p.valor}</td>
        <td><button class="btn btn-delete" onclick="eliminarProducto('${docSnap.id}')">Eliminar</button></td>
      `;
      tablaProductos.appendChild(row);

      const opt = document.createElement("option");
      opt.value = p.nombre;
      opt.textContent = p.nombre;
      productoSelect.appendChild(opt);
    });
  });

  window.eliminarProducto = async (id) => {
    await deleteDoc(doc(db,"productos",id));
  };

  // -------------------- CRUD FACTURAS --------------------
  facturaForm.addEventListener("submit", async e => {
    e.preventDefault();
    const numero = document.getElementById("numeroFactura").value;
    const proveedor = proveedorSelect.value;
    const producto = productoSelect.value;
    const monto = document.getElementById("montoFactura").value;
    const tipo = document.getElementById("tipoFactura").value;
    const moneda = document.getElementById("monedaFactura").value;

    if(!numero || !proveedor || !producto || !monto) return alert("Complete todos los campos");

    await addDoc(collection(db, "facturas"), { numero, proveedor, producto, monto, tipo, moneda });
    facturaForm.reset();
  });

  onSnapshot(collection(db, "facturas"), snapshot => {
    tablaFacturas.innerHTML = '';
    snapshot.forEach(docSnap => {
      const f = docSnap.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="click-detalle" data-tipo="numero">${f.numero}</td>
        <td class="click-detalle" data-tipo="proveedor">${f.proveedor}</td>
        <td class="click-detalle" data-tipo="producto">${f.producto}</td>
        <td>${f.moneda} ${f.monto}</td>
        <td>${f.tipo}</td>
        <td><button class="btn btn-delete" onclick="eliminarFactura('${docSnap.id}')">Eliminar</button></td>
      `;
      tablaFacturas.appendChild(row);

      row.querySelectorAll(".click-detalle").forEach(td => {
        td.addEventListener("click", async () => {
          let titulo="", contenido="";
          if(td.dataset.tipo==="proveedor"){
            const q = query(collection(db,"proveedores"), where("nombre","==",td.textContent));
            const snap = await getDocs(q);
            const p = snap.docs[0]?.data();
            titulo="Detalles del Proveedor";
            contenido=p?`Nombre: ${p.nombre}\nRUC: ${p.ruc}\nDirección: ${p.direccion}`:"Proveedor no encontrado";
          }
          if(td.dataset.tipo==="producto"){
            const q = query(collection(db,"productos"), where("nombre","==",td.textContent));
            const snap = await getDocs(q);
            const p = snap.docs[0]?.data();
            titulo="Detalles del Producto";
            contenido=p?`Nombre: ${p.nombre}\nDescripción: ${p.descripcion}\nCantidad: ${p.cantidad}\nUnidad: ${p.unidad}\nValor Unitario: ${p.valor}`:"Producto no encontrado";
          }
          if(td.dataset.tipo==="numero"){
            titulo="Número de Factura";
            contenido=td.textContent;
          }
          abrirModal(titulo, contenido);
        });
      });
    });
  });

  window.eliminarFactura = async (id) => {
    await deleteDoc(doc(db,"facturas",id));
  };

  // -------------------- BUSCADOR GLOBAL --------------------
  buscador.addEventListener("input", async () => {
    const txt = buscador.value.toLowerCase().trim();
    if(txt==="") return detalleModal.style.display="none";

    const snap = await getDocs(collection(db,"facturas"));
    const resultados = snap.docs.map(d=>d.data()).filter(f =>
      f.numero.toLowerCase().includes(txt) ||
      f.producto.toLowerCase().includes(txt)
    );

    if(resultados.length>0){
      const contenido = resultados.map(f =>
        `Factura N°: ${f.numero}\nProveedor: ${f.proveedor}\nProducto: ${f.producto}\nMonto: ${f.moneda} ${f.monto}\nTipo: ${f.tipo}`
      ).join("\n\n----------------\n\n");
      abrirModal("Facturas relacionadas", contenido);
    } else detalleModal.style.display="none";
  });

});




