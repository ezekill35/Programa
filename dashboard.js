import { auth, db } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { 
  collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, getDocs 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  console.log("✅ dashboard.js cargado correctamente");

  // ===================== REFERENCIAS =====================
  const secciones = document.querySelectorAll(".seccion");
  const menuBtns = document.querySelectorAll(".menu-btn");
  const buscador = document.getElementById("buscadorGlobal");
  const logoutBtn = document.getElementById("logoutBtn");

  const tablaProveedores = document.getElementById("tablaProveedores");
  const tablaProductos = document.getElementById("tablaProductos");
  const tablaFacturas = document.getElementById("tablaFacturas");

  const proveedorSelect = document.getElementById("proveedorFactura");
  const productoSelect = document.getElementById("productoFactura");

  const detalleModal = document.getElementById("detalleModal");
  const tituloModal = document.getElementById("tituloModal");
  const contenidoModal = document.getElementById("contenidoModal");
  const cerrarModal = document.getElementById("cerrarModal");

  // ===================== MODAL =====================
  cerrarModal.addEventListener("click", () => detalleModal.style.display = "none");
  window.addEventListener("click", e => { 
    if (e.target === detalleModal) detalleModal.style.display = "none";
  });

  function abrirModal(titulo, contenido) {
    tituloModal.textContent = titulo;
    contenidoModal.textContent = contenido;
    detalleModal.style.display = "flex";
  }

  // ===================== NAVEGACIÓN =====================
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

  // ===================== LOGOUT =====================
  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        console.log("👋 Sesión cerrada correctamente");
        window.location.href = "index.html";
      })
      .catch(err => alert("Error al cerrar sesión: " + err.message));
  });

  // ===================== VALIDACIONES =====================
  const rucInput = document.getElementById("rucProveedor");
  const numeroFacturaInput = document.getElementById("numeroFactura");

  rucInput.addEventListener("input", e => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });
  numeroFacturaInput.addEventListener("input", e => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  // ===================== CRUD PROVEEDORES =====================
  const proveedorForm = document.getElementById("proveedorForm");
  proveedorForm.addEventListener("submit", async e => {
    e.preventDefault();
    const ruc = rucInput.value.trim();
    const nombre = document.getElementById("nombreProveedor").value.trim();
    const direccion = document.getElementById("direccionProveedor").value.trim();
    if (!ruc || !nombre || !direccion) return alert("Complete todos los campos");
    if (!/^\d+$/.test(ruc)) return alert("RUC solo puede contener números");

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
        <td><input type="text" value="${prov.ruc}" class="edit-ruc"></td>
        <td><input type="text" value="${prov.nombre}" class="edit-nombre"></td>
        <td><input type="text" value="${prov.direccion}" class="edit-direccion"></td>
        <td>
          <button class="btn-delete">Eliminar</button>
          <button class="btn-primary">Guardar</button>
        </td>
      `;
      tablaProveedores.appendChild(row);

      // Actualiza select de proveedores
      const opt = document.createElement("option");
      opt.value = prov.nombre;
      opt.textContent = prov.nombre;
      proveedorSelect.appendChild(opt);

      // Eventos de botones
      row.querySelector(".btn-delete").addEventListener("click", async () => {
        await deleteDoc(doc(db, 'proveedores', docSnap.id));
      });

      row.querySelector(".btn-primary").addEventListener("click", async () => {
        const nuevoRUC = row.querySelector(".edit-ruc").value.trim();
        const nuevoNombre = row.querySelector(".edit-nombre").value.trim();
        const nuevaDir = row.querySelector(".edit-direccion").value.trim();
        if (!nuevoRUC || !nuevoNombre || !nuevaDir) return alert("Complete todos los campos");
        if (!/^\d+$/.test(nuevoRUC)) return alert("RUC solo puede contener números");
        await updateDoc(doc(db, 'proveedores', docSnap.id), {
          ruc: nuevoRUC,
          nombre: nuevoNombre,
          direccion: nuevaDir
        });
      });
    });
  });

  // ===================== CRUD PRODUCTOS =====================
  const productoForm = document.getElementById("productoForm");
  productoForm.addEventListener("submit", async e => {
    e.preventDefault();
    const nombre = document.getElementById("nombreProducto").value.trim();
    const cantidad = document.getElementById("cantidadProducto").value.trim();
    const unidad = document.getElementById("unidadProducto").value.trim();
    const valor = document.getElementById("valorUnitarioProducto").value.trim();
    if (!nombre) return alert("Ingrese nombre del producto");

    await addDoc(collection(db, 'productos'), {
      nombre,
      cantidad,
      unidad,
      valor: parseFloat(valor) || 0
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
        <td><input type="number" step="0.0001" value="${prod.valor}" class="edit-valor"></td>
        <td>
          <button class="btn-delete">Eliminar</button>
          <button class="btn-primary">Guardar</button>
        </td>
      `;
      tablaProductos.appendChild(row);

      const opt = document.createElement("option");
      opt.value = prod.nombre;
      opt.textContent = prod.nombre;
      productoSelect.appendChild(opt);

      row.querySelector(".btn-delete").addEventListener("click", async () => {
        await deleteDoc(doc(db, 'productos', docSnap.id));
      });

      row.querySelector(".btn-primary").addEventListener("click", async () => {
        const n = row.querySelector(".edit-nombre").value.trim();
        const c = row.querySelector(".edit-cant").value.trim();
        const u = row.querySelector(".edit-uni").value.trim();
        const v = parseFloat(row.querySelector(".edit-valor").value.trim());
        if (!n) return alert("Ingrese nombre del producto");
        await updateDoc(doc(db, 'productos', docSnap.id), { nombre: n, cantidad: c, unidad: u, valor: v });
      });
    });
  });

  // ===================== CRUD FACTURAS =====================
  const facturaForm = document.getElementById("facturaForm");
  facturaForm.addEventListener("submit", async e => {
    e.preventDefault();
    const numero = numeroFacturaInput.value.trim();
    const proveedor = proveedorSelect.value;
    const producto = productoSelect.value;
    const monto = document.getElementById("montoFactura").value.trim();
    const tipo = document.getElementById("tipoFactura").value;
    const moneda = document.getElementById("monedaFactura").value;

    if (!numero || !proveedor || !producto || !monto) return alert("Complete todos los campos");
    if (!/^\d+$/.test(numero)) return alert("Número de factura solo puede contener números");

    await addDoc(collection(db, 'facturas'), { numero, proveedor, producto, monto, tipo, moneda });
    facturaForm.reset();
  });

  onSnapshot(collection(db, 'facturas'), snapshot => {
    tablaFacturas.innerHTML = '';

    snapshot.forEach(docSnap => {
      const fac = docSnap.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><input type="text" value="${fac.numero}" class="edit-numero"></td>
        <td><select class="edit-prov"></select></td>
        <td><select class="edit-prod"></select></td>
        <td><input type="number" value="${fac.monto}" class="edit-monto"></td>
        <td>
          <select class="edit-tipo">
            <option ${fac.tipo === "Factura Electrónica" ? "selected" : ""}>Factura Electrónica</option>
            <option ${fac.tipo === "Boleta" ? "selected" : ""}>Boleta</option>
          </select>
        </td>
        <td>
          <button class="btn-delete">Eliminar</button>
          <button class="btn-primary">Guardar</button>
        </td>
      `;
      tablaFacturas.appendChild(row);

      // Llenar selects actualizados
      proveedorSelect.querySelectorAll("option").forEach(opt => {
        const sel = document.createElement("option");
        sel.value = opt.value;
        sel.textContent = opt.textContent;
        if (opt.value === fac.proveedor) sel.selected = true;
        row.querySelector(".edit-prov").appendChild(sel);
      });

      productoSelect.querySelectorAll("option").forEach(opt => {
        const sel = document.createElement("option");
        sel.value = opt.value;
        sel.textContent = opt.textContent;
        if (opt.value === fac.producto) sel.selected = true;
        row.querySelector(".edit-prod").appendChild(sel);
      });

      // Eventos
      row.querySelector(".btn-delete").addEventListener("click", async () => {
        await deleteDoc(doc(db, 'facturas', docSnap.id));
      });

      row.querySelector(".btn-primary").addEventListener("click", async () => {
        const n = row.querySelector(".edit-numero").value.trim();
        const p = row.querySelector(".edit-prov").value;
        const prod = row.querySelector(".edit-prod").value;
        const m = row.querySelector(".edit-monto").value.trim();
        const t = row.querySelector(".edit-tipo").value;

        if (!n || !p || !prod || !m) return alert("Complete todos los campos");
        if (!/^\d+$/.test(n)) return alert("Número de factura solo puede contener números");

        await updateDoc(doc(db, 'facturas', docSnap.id), {
          numero: n, proveedor: p, producto: prod, monto: m, tipo: t, moneda: fac.moneda
        });
      });
    });
  });

  // ===================== BUSCADOR =====================
  buscador.addEventListener("input", async () => {
    const txt = buscador.value.toLowerCase().trim();
    if (!txt) { detalleModal.style.display = "none"; return; }

    const snapshot = await getDocs(collection(db, 'productos'));
    const resultados = [];
    snapshot.forEach(docSnap => {
      const prod = docSnap.data();
      if (prod.nombre.toLowerCase().includes(txt)) resultados.push(prod);
    });

    if (resultados.length) {
      const contenido = resultados.map(p => 
        `Nombre: ${p.nombre}\nCantidad: ${p.cantidad}\nUnidad: ${p.unidad}\nValor: ${p.valor}`
      ).join("\n\n----------------\n\n");
      abrirModal("Productos relacionados", contenido);
    } else detalleModal.style.display = "none";
  });

});



