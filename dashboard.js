import { auth, db } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const secciones = document.querySelectorAll(".seccion");
  const menuBtns = document.querySelectorAll(".menu-btn");
  const buscador = document.getElementById("buscadorGlobal");
  const logoutBtn = document.getElementById("logoutBtn");

  const tablaProveedores = document.getElementById("tablaProveedores");
  const tablaProductos = document.getElementById("tablaProductos");
  const tablaFacturas = document.getElementById("tablaFacturas");

  const proveedorSelect = document.getElementById("proveedorFactura");
  const productoSelect = document.getElementById("productoFactura");

  // Modal
  const detalleModal = document.getElementById("detalleModal");
  const tituloModal = document.getElementById("tituloModal");
  const contenidoModal = document.getElementById("contenidoModal");
  const cerrarModal = document.getElementById("cerrarModal");

  cerrarModal.addEventListener("click", () => detalleModal.style.display = "none");
  window.addEventListener("click", e => { if (e.target === detalleModal) detalleModal.style.display = "none"; });

  function abrirModal(titulo, contenido) {
    tituloModal.textContent = titulo;
    contenidoModal.textContent = contenido;
    detalleModal.style.display = "flex";
  }

  // ---------------- NAV ----------------
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

  // ---------------- LOGOUT ----------------
  logoutBtn.addEventListener("click", () =>
    signOut(auth).then(() => window.location.href = "index.html")
  );

  // ==================== PROVEEDORES ====================
  const proveedorForm = document.getElementById("proveedorForm");
  proveedorForm.addEventListener("submit", async e => {
    e.preventDefault();
    const ruc = document.getElementById("rucProveedor").value.trim();
    const nombre = document.getElementById("nombreProveedor").value.trim();
    const direccion = document.getElementById("direccionProveedor").value.trim();

    if (!ruc || !nombre || !direccion) return alert("Complete todos los campos");
    if (!/^\d+$/.test(ruc)) return alert("El RUC debe contener solo números");

    await addDoc(collection(db, 'proveedores'), { ruc, nombre, direccion });
    proveedorForm.reset();
  });

  onSnapshot(collection(db, 'proveedores'), snapshot => {
    tablaProveedores.innerHTML = '';
    proveedorSelect.innerHTML = '<option value="" disabled selected>Seleccione proveedor</option>';
    snapshot.forEach(docSnap => {
      const prov = docSnap.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><input type="text" value="${prov.ruc}" class="edit-ruc" style="width:100px;"></td>
        <td><input type="text" value="${prov.nombre}" class="edit-nombre"></td>
        <td><input type="text" value="${prov.direccion}" class="edit-dir"></td>
        <td>
          <button class="btn-primary guardar">💾</button>
          <button class="btn-delete eliminar">🗑️</button>
        </td>
      `;
      tablaProveedores.appendChild(row);

      const opt = document.createElement("option");
      opt.value = prov.nombre;
      opt.textContent = prov.nombre;
      proveedorSelect.appendChild(opt);

      row.querySelector(".eliminar").addEventListener("click", async () => {
        await deleteDoc(doc(db, 'proveedores', docSnap.id));
      });

      row.querySelector(".guardar").addEventListener("click", async () => {
        const ruc = row.querySelector(".edit-ruc").value.trim();
        const nombre = row.querySelector(".edit-nombre").value.trim();
        const direccion = row.querySelector(".edit-dir").value.trim();
        if (!/^\d+$/.test(ruc)) return alert("El RUC debe contener solo números");
        await updateDoc(doc(db, 'proveedores', docSnap.id), { ruc, nombre, direccion });
      });
    });
  });

  // ==================== PRODUCTOS ====================
  const productoForm = document.getElementById("productoForm");
  productoForm.addEventListener("submit", async e => {
    e.preventDefault();
    const nombre = document.getElementById("nombreProducto").value.trim();
    const cantidad = document.getElementById("cantidadProducto").value.trim();
    const unidad = document.getElementById("unidadProducto").value.trim();
    const valor = document.getElementById("valorUnitarioProducto").value.trim();
    if (!nombre) return alert("Ingrese nombre del producto");
    if (isNaN(valor)) return alert("El valor unitario debe ser un número válido");

    await addDoc(collection(db, 'productos'), {
      nombre,
      cantidad,
      unidad,
      valor: parseFloat(valor)
    });
    productoForm.reset();
  });

  onSnapshot(collection(db, 'productos'), snapshot => {
    tablaProductos.innerHTML = '';
    productoSelect.innerHTML = '<option value="" disabled selected>Seleccione producto</option>';
    snapshot.forEach(docSnap => {
      const prod = docSnap.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><input type="text" value="${prod.nombre}" class="edit-nombre"></td>
        <td><input type="number" value="${prod.cantidad}" class="edit-cant"></td>
        <td><input type="text" value="${prod.unidad}" class="edit-uni"></td>
        <td><input type="number" step="any" value="${prod.valor}" class="edit-valor"></td>
        <td>
          <button class="btn-primary guardar">💾</button>
          <button class="btn-delete eliminar">🗑️</button>
        </td>
      `;
      tablaProductos.appendChild(row);

      const opt = document.createElement("option");
      opt.value = prod.nombre;
      opt.textContent = prod.nombre;
      productoSelect.appendChild(opt);

      row.querySelector(".eliminar").addEventListener("click", async () => {
        await deleteDoc(doc(db, 'productos', docSnap.id));
      });

      row.querySelector(".guardar").addEventListener("click", async () => {
        const nombre = row.querySelector(".edit-nombre").value.trim();
        const cantidad = row.querySelector(".edit-cant").value.trim();
        const unidad = row.querySelector(".edit-uni").value.trim();
        const valor = row.querySelector(".edit-valor").value.trim();
        if (isNaN(valor)) return alert("El valor unitario debe ser un número válido");
        await updateDoc(doc(db, 'productos', docSnap.id), {
          nombre, cantidad, unidad, valor: parseFloat(valor)
        });
      });
    });
  });

  // ==================== FACTURAS ====================
  const facturaForm = document.getElementById("facturaForm");
  facturaForm.addEventListener("submit", async e => {
    e.preventDefault();
    const numero = document.getElementById("numeroFactura").value.trim();
    const proveedor = proveedorSelect.value;
    const producto = productoSelect.value;
    const monto = document.getElementById("montoFactura").value.trim();
    const tipo = document.getElementById("tipoFactura").value;
    const moneda = document.getElementById("monedaFactura").value;

    if (!numero || !proveedor || !producto || !monto)
      return alert("Complete todos los campos");
    if (!/^\d+$/.test(numero))
      return alert("El número de factura debe contener solo números");

    await addDoc(collection(db, 'facturas'), {
      numero, proveedor, producto, monto, tipo, moneda
    });
    facturaForm.reset();
  });

  onSnapshot(collection(db, 'facturas'), snapshot => {
    tablaFacturas.innerHTML = '';
    snapshot.forEach(docSnap => {
      const fac = docSnap.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><input type="text" value="${fac.numero}" class="edit-num"></td>
        <td><input type="text" value="${fac.proveedor}" class="edit-prov"></td>
        <td><input type="text" value="${fac.producto}" class="edit-prod"></td>
        <td><input type="number" step="any" value="${fac.monto}" class="edit-monto"></td>
        <td>
          <select class="edit-tipo">
            <option ${fac.tipo==="Factura Electrónica"?"selected":""}>Factura Electrónica</option>
            <option ${fac.tipo==="Boleta"?"selected":""}>Boleta</option>
          </select>
        </td>
        <td>
          <button class="btn-primary guardar">💾</button>
          <button class="btn-delete eliminar">🗑️</button>
        </td>
      `;
      tablaFacturas.appendChild(row);

      row.querySelector(".eliminar").addEventListener("click", async () => {
        await deleteDoc(doc(db, 'facturas', docSnap.id));
      });

      row.querySelector(".guardar").addEventListener("click", async () => {
        const numero = row.querySelector(".edit-num").value.trim();
        const proveedor = row.querySelector(".edit-prov").value.trim();
        const producto = row.querySelector(".edit-prod").value.trim();
        const monto = row.querySelector(".edit-monto").value.trim();
        const tipo = row.querySelector(".edit-tipo").value;
        if (!/^\d+$/.test(numero)) return alert("El número de factura debe contener solo números");
        if (isNaN(monto)) return alert("El monto debe ser un número válido");
        await updateDoc(doc(db, 'facturas', docSnap.id), {
          numero, proveedor, producto, monto, tipo
        });
      });
    });
  });

  // ==================== BUSCADOR GLOBAL ====================
  buscador.addEventListener("keypress", async e => {
    if (e.key === "Enter") {
      const txt = buscador.value.toLowerCase();
      if (!txt) return;
      const snapshot = await getDocs(collection(db, 'productos'));
      const resultados = [];
      snapshot.forEach(docSnap => {
        const prod = docSnap.data();
        if (prod.nombre.toLowerCase().includes(txt)) resultados.push(prod);
      });
      if (resultados.length > 0) {
        let contenido = resultados.map(p => `
Nombre: ${p.nombre}
Cantidad: ${p.cantidad}
Unidad: ${p.unidad}
Valor: ${p.valor}
`).join("\n----------------\n");
        abrirModal("Productos relacionados", contenido);
      } else detalleModal.style.display = "none";
    }
  });
});


});


