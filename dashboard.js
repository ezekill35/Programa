import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

// --------------------
// Menú y secciones
// --------------------
document.addEventListener('DOMContentLoaded', () => {
  const sections = {
    reportes: document.getElementById('sectionReportes'),
    proveedor: document.getElementById('sectionProveedor'),
    factura: document.getElementById('sectionFactura'),
    gastos: document.getElementById('sectionGastos'),
    servicio: document.getElementById('sectionServicio')
  };

  const btns = {
    reportes: document.getElementById('btnReportes'),
    proveedor: document.getElementById('btnProveedor'),
    factura: document.getElementById('btnFactura'),
    gastos: document.getElementById('btnGastos'),
    servicio: document.getElementById('btnServicio'),
    logout: document.getElementById('btnLogout')
  };

  function hideAll() {
    Object.values(sections).forEach(sec => sec.classList.remove('active'));
  }

  function setActive(btn) {
    Object.values(btns).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  btns.reportes.addEventListener('click', () => { hideAll(); sections.reportes.classList.add('active'); setActive(btns.reportes); });
  btns.proveedor.addEventListener('click', () => { hideAll(); sections.proveedor.classList.add('active'); setActive(btns.proveedor); });
  btns.factura.addEventListener('click', () => { hideAll(); sections.factura.classList.add('active'); setActive(btns.factura); });
  btns.gastos.addEventListener('click', () => { hideAll(); sections.gastos.classList.add('active'); setActive(btns.gastos); });
  btns.servicio.addEventListener('click', () => { hideAll(); sections.servicio.classList.add('active'); setActive(btns.servicio); });
  btns.logout.addEventListener('click', () => { signOut(auth).then(()=>{ window.location.href='index.html'; }); });

  // --------------------
  // Proveedor Firestore
  // --------------------
  const provForm = document.getElementById('formProveedor');
  const tableProv = document.getElementById('tableProveedor').querySelector('tbody');
  const searchProv = document.getElementById('searchProveedor');

  document.getElementById('addProveedor').addEventListener('click', async () => {
    const ruc = document.getElementById('provRUC').value;
    const nombre = document.getElementById('provNombre').value;
    const direccion = document.getElementById('provDireccion').value;
    const correo = document.getElementById('provCorreo').value;
    const telefono = document.getElementById('provTelefono').value;
    if (!ruc || !nombre) return alert("RUC y Nombre son obligatorios");
    await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion, correo, telefono });
    loadProveedores();
    provForm.reset();
  });

  async function loadProveedores() {
    tableProv.innerHTML = '';
    const snapshot = await getDocs(collection(db, "proveedores"));
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${data.ruc}</td>
        <td>${data.nombre}</td>
        <td>${data.direccion}</td>
        <td>${data.correo}</td>
        <td>${data.telefono}</td>
        <td><button onclick="deleteProveedor('${docSnap.id}')">Eliminar</button></td>
      `;
      tableProv.appendChild(tr);
    });

    // Actualizar select de proveedores en factura
    const select = document.getElementById('factProveedor');
    select.innerHTML = '<option value="">Seleccione proveedor</option>';
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const option = document.createElement('option');
      option.value = data.nombre;
      option.textContent = data.nombre;
      select.appendChild(option);
    });
  }

  window.deleteProveedor = async (id) => {
    await deleteDoc(doc(db, "proveedores", id));
    loadProveedores();
  };

  document.getElementById('btnSearchProveedor').addEventListener('click', async () => {
    const term = searchProv.value.toLowerCase();
    const snapshot = await getDocs(collection(db, "proveedores"));
    tableProv.innerHTML = '';
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.ruc.toLowerCase().includes(term) || data.nombre.toLowerCase().includes(term)) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${data.ruc}</td>
          <td>${data.nombre}</td>
          <td>${data.direccion}</td>
          <td>${data.correo}</td>
          <td>${data.telefono}</td>
          <td><button onclick="deleteProveedor('${docSnap.id}')">Eliminar</button></td>
        `;
        tableProv.appendChild(tr);
      }
    });
  });

  loadProveedores();

  // Similar puedes agregar funciones para Factura, Gastos y Servicio
});


