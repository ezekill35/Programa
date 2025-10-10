import { auth, db } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  // ==================== ELEMENTOS ====================
  const secciones = document.querySelectorAll(".seccion");
  const menuBtns = document.querySelectorAll(".menu-btn");
  const logoutBtn = document.getElementById("logoutBtn");
  const buscador = document.getElementById("buscadorGlobal");

  const tablaProveedores = document.getElementById("tablaProveedores");
  const tablaProductos = document.getElementById("tablaProductos");
  const tablaFacturas = document.getElementById("tablaFacturas");

  const proveedorSelect = document.getElementById("proveedorFactura");
  const productoSelect = document.getElementById("productoFactura");

  // MODAL
  const detalleModal = document.getElementById("detalleModal");
  const tituloModal = document.getElementById("tituloModal");
  const contenidoModal = document.getElementById("contenidoModal");
  const cerrarModal = document.getElementById("cerrarModal");

  cerrarModal.addEventListener("click", () => detalleModal.style.display = "none");
  window.addEventListener("click", e => { if (e.target === detalleModal) detalleModal.style.display = "none"; });

  const abrirModal = (titulo, contenido) => {
    tituloModal.textContent = titulo;
    contenidoModal.innerHTML = contenido;
    detalleModal.style.display = "flex";
  };

  // ==================== NAVEGACIÓN ====================
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

  // ==================== CERRAR SESIÓN ====================
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "index.html");
  });

  // ==================== VALIDACIONES ====================
  const rucInput = document.getElementById("rucProveedor");
  const numeroFacturaInput = document.getElementById("numeroFactura");

  if (rucInput) rucInput.addEventListener("input", e => e.target.value = e.target.value.replace(/\D/g, ''));
  if (numeroFacturaInput) numeroFacturaInput.addEventListener("input", e => e.target.value = e.target.value.replace(/\D/g, ''));

  // ==================== FUNCIONES ====================
  const normalizarTexto = (texto) =>
    texto.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  // ==================== CRUD PROVEEDORES ====================
  const proveedorForm = document.getElementById("proveedorForm");
  if (proveedorForm) {
    proveedorForm.addEventListener("submit", async e => {
      e.preventDefault();
      const ruc = rucInput.value.trim();
      const nombre = document.getElementById("nombreProveedor").value.trim();
      const direccion = document.getElementById("direccionProveedor").value.trim();

      if (!ruc || !nombre || !direccion) return alert("Complete todos los campos");
      if (!/^\d+$/.test(ruc)) return alert("RUC solo puede contener números");

      await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion });
      proveedorForm.reset();
    });
  }

  onSnapshot(collection(db, "proveedores"), snapshot => {
    tablaProveedores.innerHTML = '';
    proveedorSelect.innerHTML = '<option value="" disabled selected>Seleccione proveedor</option>';

    snapshot.forEach(docSnap => {
      const prov = docSnap.data();
      const row = document.createElement("tr");

      row.innerHTML = `
        <td><input type="text" value="${prov.ruc}" class="edit-ruc"></td>
        <td><input type="text" value="${prov.nombre}" class="edit-nombre"></td>
        <td><input type="text" value="${prov.direccion}" class="edit-dir"></td>
        <td>
          <button class="btn-delete">Eliminar</button>
          <button class="btn-primary">Guardar</button>
        </td>`;

      tablaProveedores.appendChild(row);

      const opt = document.createElement("option");
      opt.value = prov.nombre;
      opt.textContent = prov.nombre;
      proveedorSelect.appendChild(opt);

      row.querySelector(".btn-delete").addEventListener("click", async () => await deleteDoc(doc(db, "proveedores", docSnap.id)));
      row.querySelector(".btn-primary").addEventListener("click", async () => {
        const r = row.querySelector(".edit-ruc").value.trim();
        const n = row.querySelector(".edit-nombre").value.trim();
        const d = row.querySelector(".edit-dir").value.trim();

        if (!r || !n || !d) return alert("Complete todos los campos");
        if (!/^\d+$/.test(r)) return alert("RUC solo puede contener números");

        await updateDoc(doc(db, "proveedores", docSnap.id), { ruc: r, nombre: n, direccion: d });
      });
    });
  });

  // ==================== CRUD PRODUCTOS ====================
  const productoForm = document.getElementById("productoForm");
  if (productoForm) {
    productoForm.addEventListener("submit", async e => {
      e.preventDefault();
      const nombre = document.getElementById("nombreProducto").value.trim();
      const cantidad = document.getElementById("cantidadProducto").value.trim();
      const unidad = document.getElementById("unidadProducto").value.trim();
      const valor = document.getElementById("valorUnitarioProducto").value.trim();

      if (!nombre) return alert("Ingrese nombre del producto");

      await addDoc(collection(db, "productos"), { nombre, cantidad, unidad, valor });
      productoForm.reset();
    });
  }

  onSnapshot(collection(db, "productos"), snapshot => {
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
        </td>`;

      tablaProductos.appendChild(row);

      const opt = document.createElement("option");
      opt.value = prod.nombre;
      opt.textContent = prod.nombre;
      productoSelect.appendChild(opt);

      row.querySelector(".btn-delete").addEventListener("click", async () => await deleteDoc(doc(db, "productos", docSnap.id)));
      row.querySelector(".btn-primary").addEventListener("click", async () => {
        const n = row.querySelector(".edit-nombre").value.trim();
        const c = row.querySelector(".edit-cant").value.trim();
        const u = row.querySelector(".edit-uni").value.trim();
        const v = row.querySelector(".edit-valor").value.trim();
        await updateDoc(doc(db, "productos", docSnap.id), { nombre: n, cantidad: c, unidad: u, valor: v });
      });
    });
  });

  // ==================== CRUD FACTURAS ====================
  const facturaForm = document.getElementById("facturaForm");
  if (facturaForm) {
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

      await addDoc(collection(db, "facturas"), { numero, proveedor, producto, monto, tipo, moneda });
      facturaForm.reset();
    });
  }

  onSnapshot(collection(db, "facturas"), snapshot => {
    tablaFacturas.innerHTML = '';
    snapshot.forEach(docSnap => {
      const fac = docSnap.data();
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${fac.numero}</td>
        <td class="click-prov" style="cursor:pointer;color:#ff7043;text-decoration:underline;">${fac.proveedor}</td>
        <td class="click-prod" style="cursor:pointer;color:#4caf50;text-decoration:underline;">${fac.producto}</td>
        <td>${fac.moneda || ''} ${fac.monto}</td>
        <td>${fac.tipo}</td>
        <td><button class="btn-delete">Eliminar</button></td>`;

      tablaFacturas.appendChild(row);

      // Eliminar
      row.querySelector(".btn-delete").addEventListener("click", async () => await deleteDoc(doc(db, "facturas", docSnap.id)));

      // Mostrar proveedor
      row.querySelector(".click-prov").addEventListener("click", async () => {
        const provSnap = await getDocs(query(collection(db, "proveedores"), where("nombre", "==", fac.proveedor)));
        if (provSnap.empty) return alert("Proveedor no encontrado");
        const p = provSnap.docs[0].data();
        abrirModal("Datos del Proveedor", `<b>RUC:</b> ${p.ruc}<br><b>Nombre:</b> ${p.nombre}<br><b>Dirección:</b> ${p.direccion}`);
      });

      // Mostrar producto
      row.querySelector(".click-prod").addEventListener("click", async () => {
        const prodSnap = await getDocs(query(collection(db, "productos"), where("nombre", "==", fac.producto)));
        if (prodSnap.empty) return alert("Producto no encontrado");
        const pr = prodSnap.docs[0].data();
        abrirModal("Datos del Producto", `<b>Nombre:</b> ${pr.nombre}<br><b>Cantidad:</b> ${pr.cantidad}<br><b>Unidad:</b> ${pr.unidad}<br><b>Valor:</b> ${pr.valor}`);
      });
    });
  });

  // ==================== BUSCADOR INTELIGENTE ====================
  buscador.addEventListener("keydown", async e => {
    if (e.key === "Enter") {
      e.preventDefault();
      const texto = normalizarTexto(buscador.value);
      if (!texto) return;

      const facturasSnap = await getDocs(collection(db, "facturas"));
      const resultados = [];

      facturasSnap.forEach(f => {
        const data = f.data();
        if (normalizarTexto(data.producto).includes(texto)) resultados.push(data);
      });

      if (resultados.length === 0) {
        abrirModal("Sin resultados", "No se encontraron facturas relacionadas con ese producto.");
      } else {
        let html = "<table style='width:100%;border-collapse:collapse;'><tr><th>N°</th><th>Proveedor</th><th>Producto</th><th>Monto</th><th>Tipo</th></tr>";
        resultados.forEach(f => {
          html += `<tr>
            <td>${f.numero}</td>
            <td class='link-prov' style='cursor:pointer;color:#ff7043;'>${f.proveedor}</td>
            <td class='link-prod' style='cursor:pointer;color:#4caf50;'>${f.producto}</td>
            <td>${f.moneda || ''} ${f.monto}</td>
            <td>${f.tipo}</td>
          </tr>`;
        });
        html += "</table>";
        abrirModal("Facturas relacionadas", html);

        // Clicks en modal
        setTimeout(() => {
          document.querySelectorAll(".link-prov").forEach(el => {
            el.addEventListener("click", async () => {
              const provSnap = await getDocs(query(collection(db, "proveedores"), where("nombre", "==", el.textContent)));
              if (provSnap.empty) return alert("Proveedor no encontrado");
              const p = provSnap.docs[0].data();
              abrirModal("Datos del Proveedor", `<b>RUC:</b> ${p.ruc}<br><b>Nombre:</b> ${p.nombre}<br><b>Dirección:</b> ${p.direccion}`);
            });
          });

          document.querySelectorAll(".link-prod").forEach(el => {
            el.addEventListener("click", async () => {
              const prodSnap = await getDocs(query(collection(db, "productos"), where("nombre", "==", el.textContent)));
              if (prodSnap.empty) return alert("Producto no encontrado");
              const pr = prodSnap.docs[0].data();
              abrirModal("Datos del Producto", `<b>Nombre:</b> ${pr.nombre}<br><b>Cantidad:</b> ${pr.cantidad}<br><b>Unidad:</b> ${pr.unidad}<br><b>Valor:</b> ${pr.valor}`);
            });
          });
        }, 300);
      }
    }
  });
});


});


