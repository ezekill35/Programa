// Configuración de Firestore y Auth
const db = firebase.firestore();
const auth = firebase.auth();

// Navegación entre secciones
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

// Cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", () => {
  auth.signOut().then(() => window.location.href = "index.html");
});

// --- PROVEEDORES ---
const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.getElementById("tablaProveedores");

function renderProveedores() {
  tablaProveedores.innerHTML = "";
  db.collection("proveedores").orderBy("rucProv").onSnapshot(snapshot => {
    tablaProveedores.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${data.rucProv}</td>
        <td>${data.nombreProv}</td>
        <td>${data.productoProv}</td>
        <td>${data.direccionProv}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-prov">Editar</button>
          <button class="btn btn-sm btn-danger del-prov">Eliminar</button>
        </td>
      `;
      tr.querySelector(".del-prov").onclick = () => db.collection("proveedores").doc(doc.id).delete();
      tr.querySelector(".edit-prov").onclick = () => {
        document.getElementById("rucProv").value = data.rucProv;
        document.getElementById("nombreProv").value = data.nombreProv;
        document.getElementById("productoProv").value = data.productoProv;
        document.getElementById("direccionProv").value = data.direccionProv;
        db.collection("proveedores").doc(doc.id).delete();
      };
      tablaProveedores.appendChild(tr);
    });
  });
}
renderProveedores();

formProveedor.addEventListener("submit", e => {
  e.preventDefault();
  db.collection("proveedores").add({
    rucProv: document.getElementById("rucProv").value,
    nombreProv: document.getElementById("nombreProv").value,
    productoProv: document.getElementById("productoProv").value,
    direccionProv: document.getElementById("direccionProv").value
  });
  formProveedor.reset();
});

// --- FACTURAS ---
const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas");
const proveedorSelect = document.getElementById("proveedorFactura");

function renderFacturaProveedores() {
  proveedorSelect.innerHTML = "<option value=''>Seleccione proveedor</option>";
  db.collection("proveedores").orderBy("rucProv").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const option = document.createElement("option");
      option.value = data.nombreProv;
      option.textContent = data.nombreProv;
      proveedorSelect.appendChild(option);
    });
  });
}
renderFacturaProveedores();

function renderFacturas() {
  tablaFacturas.innerHTML = "";
  db.collection("facturas").onSnapshot(snapshot => {
    tablaFacturas.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${data.proveedorFactura}</td>
        <td>${data.tipoFactura}</td>
        <td>${data.montoFactura} ${data.monedaFactura}</td>
        <td>${data.fechaFactura}</td>
        <td>${data.descFactura}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-fac">Editar</button>
          <button class="btn btn-sm btn-danger del-fac">Eliminar</button>
        </td>
      `;
      tr.querySelector(".del-fac").onclick = () => db.collection("facturas").doc(doc.id).delete();
      tr.querySelector(".edit-fac").onclick = () => {
        document.getElementById("proveedorFactura").value = data.proveedorFactura;
        document.getElementById("tipoFactura").value = data.tipoFactura;
        document.getElementById("montoFactura").value = data.montoFactura;
        document.getElementById("monedaFactura").value = data.monedaFactura;
        document.getElementById("fechaFactura").value = data.fechaFactura;
        document.getElementById("descFactura").value = data.descFactura;
        db.collection("facturas").doc(doc.id).delete();
      };
      tablaFacturas.appendChild(tr);
    });
  });
}
renderFacturas();

formFactura.addEventListener("submit", e => {
  e.preventDefault();
  db.collection("facturas").add({
    proveedorFactura: proveedorSelect.value,
    tipoFactura: document.getElementById("tipoFactura").value,
    montoFactura: document.getElementById("montoFactura").value,
    monedaFactura: document.getElementById("monedaFactura").value,
    fechaFactura: document.getElementById("fechaFactura").value,
    descFactura: document.getElementById("descFactura").value
  });
  formFactura.reset();
});

// --- GASTOS ---
const formGasto = document.getElementById("formGasto");
const tablaGastos = document.getElementById("tablaGastos");

function renderGastos() {
  tablaGastos.innerHTML = "";
  db.collection("gastos").onSnapshot(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${data.nombreGasto}</td>
        <td>${data.tipoGasto}</td>
        <td>${data.montoGasto}</td>
        <td>${data.fechaGasto}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-gasto">Editar</button>
          <button class="btn btn-sm btn-danger del-gasto">Eliminar</button>
        </td>
      `;
      tr.querySelector(".del-gasto").onclick = () => db.collection("gastos").doc(doc.id).delete();
      tr.querySelector(".edit-gasto").onclick = () => {
        document.getElementById("nombreGasto").value = data.nombreGasto;
        document.getElementById("tipoGasto").value = data.tipoGasto;
        document.getElementById("montoGasto").value = data.montoGasto;
        document.getElementById("fechaGasto").value = data.fechaGasto;
        db.collection("gastos").doc(doc.id).delete();
      };
      tablaGastos.appendChild(tr);
    });
  });
}
renderGastos();

formGasto.addEventListener("submit", e => {
  e.preventDefault();
  db.collection("gastos").add({
    nombreGasto: document.getElementById("nombreGasto").value,
    tipoGasto: document.getElementById("tipoGasto").value,
    montoGasto: document.getElementById("montoGasto").value,
    fechaGasto: document.getElementById("fechaGasto").value
  });
  formGasto.reset();
});

// --- SERVICIOS ---
const formServicio = document.getElementById("formServicio");
const tablaServicios = document.getElementById("tablaServicios");

function renderServicios() {
  tablaServicios.innerHTML = "";
  db.collection("servicios").onSnapshot(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${data.nombreServ}</td>
        <td>${data.precioServ}</td>
        <td>${data.fechaServ}</td>
        <td>${data.descServ}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-serv">Editar</button>
          <button class="btn btn-sm btn-danger del-serv">Eliminar</button>
        </td>
      `;
      tr.querySelector(".del-serv").onclick = () => db.collection("servicios").doc(doc.id).delete();
      tr.querySelector(".edit-serv").onclick = () => {
        document.getElementById("nombreServ").value = data.nombreServ;
        document.getElementById("precioServ").value = data.precioServ;
        document.getElementById("fechaServ").value = data.fechaServ;
        document.getElementById("descServ").value = data.descServ;
        db.collection("servicios").doc(doc.id).delete();
      };
      tablaServicios.appendChild(tr);
    });
  });
}
renderServicios();

formServicio.addEventListener("submit", e => {
  e.preventDefault();
  db.collection("servicios").add({
    nombreServ: document.getElementById("nombreServ").value,
    precioServ: document.getElementById("precioServ").value,
    fechaServ: document.getElementById("fechaServ").value,
    descServ: document.getElementById("descServ").value
  });
  formServicio.reset();
});


