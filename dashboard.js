// Evita redeclarar db si ya existe
if (typeof db === "undefined") {
    const db = firebase.firestore();

    // -------------------- Navegación Sidebar --------------------
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            sections.forEach(sec => sec.style.display = 'none');
            const target = document.getElementById(btn.dataset.section);
            if (target) target.style.display = 'block';
        });
    });

    // -------------------- PROVEEDORES --------------------
    const formProveedor = document.getElementById('formProveedor');
    const tablaProveedores = document.getElementById('tablaProveedores');
    const proveedorSelect = document.getElementById('proveedorFactura');

    function actualizarSelectProveedores() {
        proveedorSelect.innerHTML = `<option value="">Seleccione proveedor</option>`;
        db.collection('proveedores').orderBy('nombreProv').onSnapshot(snapshot => {
            snapshot.forEach(doc => {
                const p = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = `${p.nombreProv} (${p.rucProv})`;
                proveedorSelect.appendChild(option);
            });
        });
    }
    actualizarSelectProveedores();

    formProveedor.addEventListener('submit', e => {
        e.preventDefault();
        db.collection('proveedores').add({
            rucProv: document.getElementById('rucProv').value,
            nombreProv: document.getElementById('nombreProv').value,
            productoProv: document.getElementById('productoProv').value,
            direccionProv: document.getElementById('direccionProv').value
        });
        formProveedor.reset();
    });

    db.collection('proveedores').orderBy('rucProv').onSnapshot(snapshot => {
        tablaProveedores.innerHTML = '';
        snapshot.forEach(doc => {
            const p = doc.data();
            tablaProveedores.innerHTML += `
                <tr>
                    <td>${p.rucProv}</td>
                    <td>${p.nombreProv}</td>
                    <td>${p.productoProv}</td>
                    <td>${p.direccionProv}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="editarProveedor('${doc.id}')">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarProveedor('${doc.id}')">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        document.getElementById('countProveedores').textContent = snapshot.size;
    });

    window.eliminarProveedor = id => db.collection('proveedores').doc(id).delete();
    window.editarProveedor = id => {
        db.collection('proveedores').doc(id).get().then(doc => {
            const p = doc.data();
            document.getElementById('rucProv').value = p.rucProv;
            document.getElementById('nombreProv').value = p.nombreProv;
            document.getElementById('productoProv').value = p.productoProv;
            document.getElementById('direccionProv').value = p.direccionProv;
            eliminarProveedor(id);
        });
    };

    // -------------------- FACTURAS --------------------
    const formFactura = document.getElementById('formFactura');
    const tablaFacturas = document.getElementById('tablaFacturas');

    formFactura.addEventListener('submit', e => {
        e.preventDefault();
        const proveedorId = proveedorSelect.value;
        const proveedorText = proveedorSelect.options[proveedorSelect.selectedIndex].text;
        db.collection('facturas').add({
            proveedorId,
            proveedorNombre: proveedorText,
            tipoFactura: document.getElementById('tipoFactura').value,
            montoFactura: parseFloat(document.getElementById('montoFactura').value),
            monedaFactura: document.getElementById('monedaFactura').value,
            fechaFactura: document.getElementById('fechaFactura').value,
            descFactura: document.getElementById('descFactura').value
        });
        formFactura.reset();
    });

    db.collection('facturas').orderBy('fechaFactura').onSnapshot(snapshot => {
        tablaFacturas.innerHTML = '';
        snapshot.forEach(doc => {
            const f = doc.data();
            tablaFacturas.innerHTML += `
                <tr>
                    <td>${f.proveedorNombre}</td>
                    <td>${f.tipoFactura}</td>
                    <td>${f.montoFactura.toFixed(2)} ${f.monedaFactura}</td>
                    <td>${f.fechaFactura}</td>
                    <td>${f.descFactura}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="editarFactura('${doc.id}')">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarFactura('${doc.id}')">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        document.getElementById('countFacturas').textContent = snapshot.size;
    });

    window.eliminarFactura = id => db.collection('facturas').doc(id).delete();
    window.editarFactura = id => {
        db.collection('facturas').doc(id).get().then(doc => {
            const f = doc.data();
            proveedorSelect.value = f.proveedorId;
            document.getElementById('tipoFactura').value = f.tipoFactura;
            document.getElementById('montoFactura').value = f.montoFactura;
            document.getElementById('monedaFactura').value = f.monedaFactura;
            document.getElementById('fechaFactura').value = f.fechaFactura;
            document.getElementById('descFactura').value = f.descFactura;
            eliminarFactura(id);
        });
    };

    // -------------------- GASTOS --------------------
    const formGasto = document.getElementById('formGasto');
    const tablaGastos = document.getElementById('tablaGastos');

    formGasto.addEventListener('submit', e => {
        e.preventDefault();
        db.collection('gastos').add({
            nombreGasto: document.getElementById('nombreGasto').value,
            tipoGasto: document.getElementById('tipoGasto').value,
            montoGasto: parseFloat(document.getElementById('montoGasto').value),
            fechaGasto: document.getElementById('fechaGasto').value
        });
        formGasto.reset();
    });

    db.collection('gastos').orderBy('fechaGasto').onSnapshot(snapshot => {
        tablaGastos.innerHTML = '';
        snapshot.forEach(doc => {
            const g = doc.data();
            tablaGastos.innerHTML += `
                <tr>
                    <td>${g.nombreGasto}</td>
                    <td>${g.tipoGasto}</td>
                    <td>${g.montoGasto.toFixed(2)}</td>
                    <td>${g.fechaGasto}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="editarGasto('${doc.id}')">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarGasto('${doc.id}')">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        document.getElementById('countGastos').textContent = snapshot.size;
    });

    window.eliminarGasto = id => db.collection('gastos').doc(id).delete();
    window.editarGasto = id => {
        db.collection('gastos').doc(id).get().then(doc => {
            const g = doc.data();
            document.getElementById('nombreGasto').value = g.nombreGasto;
            document.getElementById('tipoGasto').value = g.tipoGasto;
            document.getElementById('montoGasto').value = g.montoGasto;
            document.getElementById('fechaGasto').value = g.fechaGasto;
            eliminarGasto(id);
        });
    };

    // -------------------- SERVICIOS --------------------
    const formServicio = document.getElementById('formServicio');
    const tablaServicios = document.getElementById('tablaServicios');

    formServicio.addEventListener('submit', e => {
        e.preventDefault();
        db.collection('servicios').add({
            nombreServ: document.getElementById('nombreServ').value,
            precioServ: parseFloat(document.getElementById('precioServ').value),
            fechaServ: document.getElementById('fechaServ').value,
            descServ: document.getElementById('descServ').value
        });
        formServicio.reset();
    });

    db.collection('servicios').orderBy('fechaServ').onSnapshot(snapshot => {
        tablaServicios.innerHTML = '';
        snapshot.forEach(doc => {
            const s = doc.data();
            tablaServicios.innerHTML += `
                <tr>
                    <td>${s.nombreServ}</td>
                    <td>${s.precioServ.toFixed(2)}</td>
                    <td>${s.fechaServ}</td>
                    <td>${s.descServ}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="editarServicio('${doc.id}')">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarServicio('${doc.id}')">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        document.getElementById('countServicios').textContent = snapshot.size;
    });

    window.eliminarServicio = id => db.collection('servicios').doc(id).delete();
    window.editarServicio = id => {
        db.collection('servicios').doc(id).get().then(doc => {
            const s = doc.data();
            document.getElementById('nombreServ').value = s.nombreServ;
            document.getElementById('precioServ').value = s.precioServ;
            document.getElementById('fechaServ').value = s.fechaServ;
            document.getElementById('descServ').value = s.descServ;
            eliminarServicio(id);
        });
    };
}

