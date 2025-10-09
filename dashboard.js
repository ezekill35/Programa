
const db = firebase.firestore();


const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.content-section');
const logoutBtn = document.getElementById('logoutBtn');


navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        sections.forEach(sec => sec.style.display = 'none');
        document.getElementById(btn.dataset.section).style.display = 'block';
    });
});


logoutBtn.addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
        window.location.href = "index.html";
    });
});


const formProveedor = document.getElementById('formProveedor');
const tablaProveedores = document.getElementById('tablaProveedores');
const countProveedores = document.getElementById('countProveedores');

function renderProveedores() {
    db.collection('proveedores').onSnapshot(snapshot => {
        tablaProveedores.innerHTML = '';
        countProveedores.textContent = snapshot.size;
        snapshot.forEach(doc => {
            const data = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${data.ruc}</td>
                <td>${data.nombre}</td>
                <td>${data.producto}</td>
                <td>${data.direccion}</td>
                <td>
                    <button class="btn btn-warning btn-sm editProv">Editar</button>
                    <button class="btn btn-danger btn-sm delProv">Eliminar</button>
                </td>
            `;
            // Editar
            tr.querySelector('.editProv').addEventListener('click', () => {
                const ruc = prompt('Ingrese RUC', data.ruc) || data.ruc;
                const nombre = prompt('Ingrese Nombre', data.nombre) || data.nombre;
                const producto = prompt('Ingrese Producto', data.producto) || data.producto;
                const direccion = prompt('Ingrese Dirección', data.direccion) || data.direccion;
                db.collection('proveedores').doc(doc.id).update({ ruc, nombre, producto, direccion });
            });
            // Eliminar
            tr.querySelector('.delProv').addEventListener('click', () => {
                if (confirm('¿Desea eliminar este proveedor?')) {
                    db.collection('proveedores').doc(doc.id).delete();
                }
            });
            tablaProveedores.appendChild(tr);
        });
    });
}


formProveedor.addEventListener('submit', e => {
    e.preventDefault();
    const ruc = document.getElementById('rucProv').value;
    const nombre = document.getElementById('nombreProv').value;
    const producto = document.getElementById('productoProv').value;
    const direccion = document.getElementById('direccionProv').value;
    db.collection('proveedores').add({ ruc, nombre, producto, direccion });
    formProveedor.reset();
});


const formFactura = document.getElementById('formFactura');
const tablaFacturas = document.getElementById('tablaFacturas');
const countFacturas = document.getElementById('countFacturas');
const proveedorSelect = document.getElementById('proveedorFactura');


db.collection('proveedores').onSnapshot(snapshot => {
    proveedorSelect.innerHTML = '<option value="">Seleccione proveedor</option>';
    snapshot.forEach(doc => {
        const data = doc.data();
        const option = document.createElement('option');
        option.value = data.nombre;
        option.textContent = `${data.nombre} - ${data.ruc}`;
        proveedorSelect.appendChild(option);
    });
});


function renderFacturas() {
    db.collection('facturas').onSnapshot(snapshot => {
        tablaFacturas.innerHTML = '';
        countFacturas.textContent = snapshot.size;
        snapshot.forEach(doc => {
            const data = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${data.proveedor}</td>
                <td>${data.tipo}</td>
                <td>${data.monto} ${data.moneda}</td>
                <td>${data.fecha}</td>
                <td>${data.descripcion}</td>
                <td>
                    <button class="btn btn-warning btn-sm editFac">Editar</button>
                    <button class="btn btn-danger btn-sm delFac">Eliminar</button>
                </td>
            `;
            tr.querySelector('.editFac').addEventListener('click', () => {
                const proveedor = prompt('Proveedor', data.proveedor) || data.proveedor;
                const tipo = prompt('Tipo de factura', data.tipo) || data.tipo;
                const monto = prompt('Monto', data.monto) || data.monto;
                const moneda = prompt('Moneda', data.moneda) || data.moneda;
                const fecha = prompt('Fecha', data.fecha) || data.fecha;
                const descripcion = prompt('Descripción', data.descripcion) || data.descripcion;
                db.collection('facturas').doc(doc.id).update({ proveedor, tipo, monto, moneda, fecha, descripcion });
            });
            tr.querySelector('.delFac').addEventListener('click', () => {
                if (confirm('¿Desea eliminar esta factura?')) {
                    db.collection('facturas').doc(doc.id).delete();
                }
            });
            tablaFacturas.appendChild(tr);
        });
    });
}


formFactura.addEventListener('submit', e => {
    e.preventDefault();
    const proveedor = proveedorSelect.value;
    const tipo = document.getElementById('tipoFactura').value;
    const monto = document.getElementById('montoFactura').value;
    const moneda = document.getElementById('monedaFactura').value;
    const fecha = document.getElementById('fechaFactura').value;
    const descripcion = document.getElementById('descFactura').value;
    db.collection('facturas').add({ proveedor, tipo, monto, moneda, fecha, descripcion });
    formFactura.reset();
});


const formGasto = document.getElementById('formGasto');
const tablaGastos = document.getElementById('tablaGastos');
const countGastos = document.getElementById('countGastos');

function renderGastos() {
    db.collection('gastos').onSnapshot(snapshot => {
        tablaGastos.innerHTML = '';
        countGastos.textContent = snapshot.size;
        snapshot.forEach(doc => {
            const data = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${data.nombre}</td>
                <td>${data.tipo}</td>
                <td>${data.monto}</td>
                <td>${data.fecha}</td>
                <td>
                    <button class="btn btn-warning btn-sm editGasto">Editar</button>
                    <button class="btn btn-danger btn-sm delGasto">Eliminar</button>
                </td>
            `;
            tr.querySelector('.editGasto').addEventListener('click', () => {
                const nombre = prompt('Nombre', data.nombre) || data.nombre;
                const tipo = prompt('Tipo', data.tipo) || data.tipo;
                const monto = prompt('Monto', data.monto) || data.monto;
                const fecha = prompt('Fecha', data.fecha) || data.fecha;
                db.collection('gastos').doc(doc.id).update({ nombre, tipo, monto, fecha });
            });
            tr.querySelector('.delGasto').addEventListener('click', () => {
                if (confirm('¿Desea eliminar este gasto?')) {
                    db.collection('gastos').doc(doc.id).delete();
                }
            });
            tablaGastos.appendChild(tr);
        });
    });
}


formGasto.addEventListener('submit', e => {
    e.preventDefault();
    const nombre = document.getElementById('nombreGasto').value;
    const tipo = document.getElementById('tipoGasto').value;
    const monto = document.getElementById('montoGasto').value;
    const fecha = document.getElementById('fechaGasto').value;
    db.collection('gastos').add({ nombre, tipo, monto, fecha });
    formGasto.reset();
});


const formServicio = document.getElementById('formServicio');
const tablaServicios = document.getElementById('tablaServicios');
const countServicios = document.getElementById('countServicios');

function renderServicios() {
    db.collection('servicios').onSnapshot(snapshot => {
        tablaServicios.innerHTML = '';
        countServicios.textContent = snapshot.size;
        snapshot.forEach(doc => {
            const data = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${data.nombre}</td>
                <td>${data.precio}</td>
                <td>${data.fecha}</td>
                <td>${data.descripcion}</td>
                <td>
                    <button class="btn btn-warning btn-sm editServ">Editar</button>
                    <button class="btn btn-danger btn-sm delServ">Eliminar</button>
                </td>
            `;
            tr.querySelector('.editServ').addEventListener('click', () => {
                const nombre = prompt('Nombre', data.nombre) || data.nombre;
                const precio = prompt('Precio', data.precio) || data.precio;
                const fecha = prompt('Fecha', data.fecha) || data.fecha;
                const descripcion = prompt('Descripción', data.descripcion) || data.descripcion;
                db.collection('servicios').doc(doc.id).update({ nombre, precio, fecha, descripcion });
            });
            tr.querySelector('.delServ').addEventListener('click', () => {
                if (confirm('¿Desea eliminar este servicio?')) {
                    db.collection('servicios').doc(doc.id).delete();
                }
            });
            tablaServicios.appendChild(tr);
        });
    });
}


formServicio.addEventListener('submit', e => {
    e.preventDefault();
    const nombre = document.getElementById('nombreServ').value;
    const precio = document.getElementById('precioServ').value;
    const fecha = document.getElementById('fechaServ').value;
    const descripcion = document.getElementById('descServ').value;
    db.collection('servicios').add({ nombre, precio, fecha, descripcion });
    formServicio.reset();
});


renderProveedores();
renderFacturas();
renderGastos();
renderServicios();



