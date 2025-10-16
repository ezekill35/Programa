// -------------------- CONTROL DE MENÚ --------------------
const menuBtns = document.querySelectorAll('.menu-btn');
const secciones = document.querySelectorAll('main section');

menuBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    menuBtns.forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');
    const target = btn.dataset.target;
    secciones.forEach(sec => {
      sec.classList.remove('seccion-activa');
      if (sec.id === target) sec.classList.add('seccion-activa');
    });
  });
});

// -------------------- FUNCIONES GENERALES --------------------
function crearFila(datos, tabla) {
  const fila = document.createElement('tr');
  Object.values(datos).forEach(v => {
    const td = document.createElement('td');
    td.textContent = v;
    fila.appendChild(td);
  });
  const tdAcciones = document.createElement('td');
  const btnEdit = document.createElement('button');
  btnEdit.textContent = "Editar";
  btnEdit.className = "btn-editar";
  const btnDel = document.createElement('button');
  btnDel.textContent = "Eliminar";
  btnDel.className = "btn-eliminar";
  btnDel.onclick = () => fila.remove();
  tdAcciones.append(btnEdit, btnDel);
  fila.appendChild(tdAcciones);
  tabla.querySelector('tbody').appendChild(fila);
}

// -------------------- PROVEEDORES --------------------
document.getElementById('formProveedor').addEventListener('submit', e => {
  e.preventDefault();
  const datos = {
    nombre: provNombre.value,
    ruc: provRuc.value,
    direccion: provDireccion.value,
    telefono: provTelefono.value,
    numero: provNumero.value
  };
  crearFila(datos, tablaProveedores);
  e.target.reset();
});

// -------------------- PRODUCTOS --------------------
document.getElementById('formProducto').addEventListener('submit', e => {
  e.preventDefault();
  const datos = {
    nombre: prodNombre.value,
    precio: `S/ ${parseFloat(prodPrecio.value).toFixed(2)}`,
    cantidad: prodCantidad.value,
    descripcion: prodDescripcion.value
  };
  crearFila(datos, tablaProductos);
  e.target.reset();
});

// -------------------- FACTURAS --------------------
document.getElementById('formFactura').addEventListener('submit', e => {
  e.preventDefault();
  const datos = {
    proveedor: factProveedor.value,
    producto: factProducto.value,
    cantidad: factCantidad.value,
    total: `S/ ${parseFloat(factTotal.value).toFixed(2)}`
  };
  crearFila(datos, tablaFacturas);
  e.target.reset();
});

// -------------------- BUSCADOR --------------------
const buscador = document.getElementById("buscadorFactura");
const btnRefresh = document.getElementById("btnRefresh");
const tablaFacturas = document.getElementById("tablaFacturas").querySelector("tbody");

buscador.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    const filtro = buscador.value.toLowerCase();
    const filas = tablaFacturas.querySelectorAll("tr");
    filas.forEach(fila => {
      const textoFila = fila.textContent.toLowerCase();
      fila.style.display = textoFila.includes(filtro) ? "" : "none";
    });
  }
});

btnRefresh.addEventListener("click", () => {
  buscador.value = "";
  const filas = tablaFacturas.querySelectorAll("tr");
  filas.forEach(f => f.style.display = "");
});

// -------------------- LOGOUT --------------------
document.getElementById('logoutBtn').addEventListener('click', () => {
  alert('Sesión cerrada correctamente.');
  window.location.href = "index.html";
});
