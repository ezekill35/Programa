import { 
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

document.addEventListener('DOMContentLoaded', () => {

  // --------------------
  // Secciones y menú
  // --------------------
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
  // PROVEEDOR
  // --------------------
  const tableProv = document.getElementById('tableProveedor').querySelector('tbody');

  async function loadProveedores() {
    tableProv.innerHTML = '';
    const snapshot = await getDocs(collection(db, "proveedores"));
    const selectProv = document.getElementById('factProveedor');
    selectProv.innerHTML = '<option value="">Seleccione proveedor</option>';
    
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

      const option = document.createElement('option');
      option.value = data.nombre;
      option.textContent = data.nombre;
      selectProv.appendChild(option);
    });
  }

  window.deleteProveedor = async (id) => {
    await deleteDoc(doc(db, "proveedores", id));
    loadProveedores();
  };

  document.getElementById('addProveedor').addEventListener('click', async () => {
    const ruc = document.getElementById('provRUC').value;
    const nombre = document.getElementById('provNombre').value;
    const direccion = document.getElementById('provDireccion').value;
    const correo = document.getElementById('provCorreo').value;
    const telefono = document.getElementById('provTelefono').value;
    if (!ruc || !nombre) return alert("RUC y Nombre son obligatorios");
    await addDoc(collection(db, "proveedores"), { ruc, nombre, direccion, correo, telefono });
    document.getElementById('formProveedor').reset();
    loadProveedores();
  });

  document.getElementById('btnSearchProveedor').addEventListener('click', async () => {
    const term = document.getElementById('searchProveedor').value.toLowerCase();
    tableProv.innerHTML = '';
    const snapshot = await getDocs(collection(db, "proveedores"));
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if(data.ruc.toLowerCase().includes(term) || data.nombre.toLowerCase().includes(term)) {
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

  // --------------------
  // FACTURA
  // --------------------
  const tableFact = document.getElementById('tableFactura').querySelector('tbody');
  async function loadFacturas() {
    tableFact.innerHTML = '';
    const snapshot = await getDocs(collection(db, "facturas"));
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${data.ruc}</td>
        <td>${data.proveedor}</td>
        <td>${data.tipo}</td>
        <td>${data.descripcion}</td>
        <td>${data.fecha}</td>
        <td><button onclick="deleteFactura('${docSnap.id}')">Eliminar</button></td>
      `;
      tableFact.appendChild(tr);
    });
  }

  window.deleteFactura = async (id) => {
    await deleteDoc(doc(db, "facturas", id));
    loadFacturas();
  };

  document.getElementById('addFactura').addEventListener('click', async () => {
    const ruc = document.getElementById('factRUC').value;
    const proveedor = document.getElementById('factProveedor').value;
    const tipo = document.getElementById('factTipo').value;
    const descripcion = document.getElementById('factDescripcion').value;
    const fecha = document.getElementById('factFecha').value;
    if(!ruc || !proveedor) return alert("RUC y Proveedor son obligatorios");
    await addDoc(collection(db, "facturas"), { ruc, proveedor, tipo, descripcion, fecha });
    document.getElementById('formFactura').reset();
    loadFacturas();
  });

  document.getElementById('btnSearchFactura').addEventListener('click', async () => {
    const term = document.getElementById('searchFactura').value.toLowerCase();
    tableFact.innerHTML = '';
    const snapshot = await getDocs(collection(db, "facturas"));
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if(data.ruc.toLowerCase().includes(term) || data.proveedor.toLowerCase().includes(term)) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${data.ruc}</td>
          <td>${data.proveedor}</td>
          <td>${data.tipo}</td>
          <td>${data.descripcion}</td>
          <td>${data.fecha}</td>
          <td><button onclick="deleteFactura('${docSnap.id}')">Eliminar</button></td>
        `;
        tableFact.appendChild(tr);
      }
    });
  });

  loadFacturas();

  // --------------------
  // GASTOS
  // --------------------
  const tableGastos = document.getElementById('tableGastos').querySelector('tbody');
  async function loadGastos() {
    tableGastos.innerHTML = '';
    const snapshot = await getDocs(collection(db, "gastos"));
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${data.concepto}</td>
        <td>${data.monto}</td>
        <td><button onclick="deleteGasto('${docSnap.id}')">Eliminar</button></td>
      `;
      tableGastos.appendChild(tr);
    });
  }

  window.deleteGasto = async (id) => {
    await deleteDoc(doc(db, "gastos", id));
    loadGastos();
  };

  document.getElementById('addGasto').addEventListener('click', async () => {
    const concepto = document.getElementById('gastoConcepto').value;
    const monto = document.getElementById('gastoMonto').value;
    if(!concepto || !monto) return alert("Concepto y Monto son obligatorios");
    await addDoc(collection(db, "gastos"), { concepto, monto });
    document.getElementById('formGasto').reset();
    loadGastos();
  });

  loadGastos();

  // --------------------
  // SERVICIO
  // --------------------
  const tableServ = document.getElementById('tableServicio').querySelector('tbody');
  async function loadServicios() {
    tableServ.innerHTML = '';
    const snapshot = await getDocs(collection(db, "servicios"));
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${data.descripcion}</td>
        <td>${data.costo}</td>
        <td><button onclick="deleteServicio('${docSnap.id}')">Eliminar</button></td>
      `;
      tableServ.appendChild(tr);
    });
  }

  window.deleteServicio = async (id) => {
    await deleteDoc(doc(db, "servicios", id));
    loadServicios();
  };

  document.getElementById('addServicio').addEventListener('click', async () => {
    const descripcion = document.getElementById('servDescripcion').value;
    const costo = document.getElementById('servCosto').value;
    if(!descripcion || !costo) return alert("Descripción y Costo son obligatorios");
    await addDoc(collection(db, "servicios"), { descripcion, costo });
    document.getElementById('formServicio').reset();
    loadServicios();
  });

  loadServicios();

});


