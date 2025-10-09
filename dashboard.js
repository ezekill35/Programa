import { db, auth } from './firebase.js';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// Mantener sesión activa
onAuthStateChanged(auth, user => {
    if (!user) window.location.href = "index.html";
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
});

// Navegación
const navBtns = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".content-section");
navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        navBtns.forEach(b => b.classList.remove("active"));
        sections.forEach(s => s.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.section).classList.add("active");
    });
});

// --- CRUD PROVEEDORES ---
const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.getElementById("tablaProveedores");
const proveedoresRef = collection(db, "proveedores");
const proveedorSelect = document.getElementById("proveedorFactura");

formProveedor.addEventListener("submit", async e => {
    e.preventDefault();
    await addDoc(proveedoresRef, {
        ruc: document.getElementById("rucProv").value,
        nombre: document.getElementById("nombreProv").value,
        producto: document.getElementById("productoProv").value,
        direccion: document.getElementById("direccionProv").value
    });
    formProveedor.reset();
});

onSnapshot(proveedoresRef, snapshot => {
    tablaProveedores.innerHTML = "";
    proveedorSelect.innerHTML = `<option value="">Selecciona proveedor</option>`;
    snapshot.forEach(docu => {
        const p = docu.data();
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.ruc}</td>
            <td>${p.nombre}</td>
            <td>${p.producto}</td>
            <td>${p.direccion}</td>
            <td>
                <button class="edit-btn" onclick="editarProveedor('${docu.id}','${p.ruc}','${p.nombre}','${p.producto}','${p.direccion}')">Editar</button>
                <button class="delete-btn" onclick="eliminarProveedor('${docu.id}')">Eliminar</button>
            </td>`;
        tablaProveedores.appendChild(tr);
        // Select facturas
        const opt = document.createElement("option");
        opt.value = p.nombre;
        opt.textContent = p.nombre;
        proveedorSelect.appendChild(opt);
    });
});

window.eliminarProveedor = async id => await deleteDoc(doc(db, "proveedores", id));
window.editarProveedor = (id,ruc,nombre,producto,direccion) => {
    document.getElementById("rucProv").value = ruc;
    document.getElementById("nombreProv").value = nombre;
    document.getElementById("productoProv").value = producto;
    document.getElementById("direccionProv").value = direccion;
    formProveedor.onsubmit = async e => {
        e.preventDefault();
        await updateDoc(doc(db, "proveedores", id), {
            ruc: document.getElementById("rucProv").value,
            nombre: document.getElementById("nombreProv").value,
            producto: document.getElementById("productoProv").value,
            direccion: document.getElementById("direccionProv").value
        });
        formProveedor.reset();
        formProveedor.onsubmit = submitProveedorOriginal;
    };
};
const submitProveedorOriginal = formProveedor.onsubmit;

// --- CRUD PRODUCTOS ---
const formProducto = document.getElementById("formProducto");
const tablaProductos = document.getElementById("tablaProductos");
const productosRef = collection(db, "productos");
const productoSelect = document.getElementById("productoFactura");

formProducto.addEventListener("submit", async e => {
    e.preventDefault();
    await addDoc(productosRef, {
        nombre: document.getElementById("nombreProd").value,
        descripcion: document.getElementById("descProd").value,
        cantidad: parseFloat(document.getElementById("cantidadProd").value),
        unidad: document.getElementById("unidadProd").value,
        valorUnitario: parseFloat(document.getElementById("valorUnitProd").value)
    });
    formProducto.reset();
});

onSnapshot(productosRef, snapshot => {
    tablaProductos.innerHTML = "";
    productoSelect.innerHTML = `<option value="">Selecciona producto</option>`;
    snapshot.forEach(docu => {
        const p = docu.data();
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.nombre}</td>
            <td>${p.descripcion}</td>
            <td>${p.cantidad}</td>
            <td>${p.unidad}</td>
            <td>${p.valorUnitario.toFixed(2)}</td>
            <td>
                <button class="edit-btn" onclick="editarProducto('${docu.id}','${p.nombre}','${p.descripcion}','${p.cantidad}','${p.unidad}','${p.valorUnitario}')">Editar</button>
                <button class="delete-btn" onclick="eliminarProducto('${docu.id}')">Eliminar</button>
            </td>`;
        tablaProductos.appendChild(tr);
        // Select facturas
        const opt = document.createElement("option");
        opt.value = p.nombre;
        opt.textContent = p.nombre;
        productoSelect.appendChild(opt);
    });
});

window.eliminarProducto = async id => await deleteDoc(doc(db, "productos", id));
window.editarProducto = (id,nombre,desc,cantidad,unidad,valorUnitario) => {
    document.getElementById("nombreProd").value = nombre;
    document.getElementById("descProd").value = desc;
    document.getElementById("cantidadProd").value = cantidad;
    document.getElementById("unidadProd").value = unidad;
    document.getElementById("valorUnitProd").value = valorUnitario;
    formProducto.onsubmit = async e => {
        e.preventDefault();
        await updateDoc(doc(db, "productos", id), {
            nombre: document.getElementById("nombreProd").value,
            descripcion: document.getElementById("descProd").value,
            cantidad: parseFloat(document.getElementById("cantidadProd").value),
            unidad: document.getElementById("unidadProd").value,
            valorUnitario: parseFloat(document.getElementById("valorUnitProd").value)
        });
        formProducto.reset();
        formProducto.onsubmit = submitProductoOriginal;
    };
};
const submitProductoOriginal = formProducto.onsubmit;

// --- CRUD FACTURAS ---
const formFactura = document.getElementById("formFactura");
const tablaFacturas = document.getElementById("tablaFacturas");
const facturasRef = collection(db, "facturas");
const buscarFactura = document.getElementById("buscarFactura");

formFactura.addEventListener("submit", async e => {
    e.preventDefault();
    await addDoc(facturasRef, {
        proveedor: proveedorSelect.value,
        producto: productoSelect.value,
        tipo: document.getElementById("tipoFactura").value,
        monto: parseFloat(document.getElementById("montoFactura").value),
        moneda: document.getElementById("monedaFactura").value,
        fecha: document.getElementById("fechaFactura").value,
        desc: document.getElementById("descFactura").value
    });
    formFactura.reset();
});

let facturasData = [];
onSnapshot(facturasRef, snapshot => {
    facturasData = [];
    tablaFacturas.innerHTML = "";
    snapshot.forEach(docu => {
        const f = docu.data();
        f.id = docu.id;
        facturasData.push(f);
    });
    mostrarFacturas(facturasData);
});

function mostrarFacturas(data) {
    tablaFacturas.innerHTML = "";
    data.forEach(f => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${f.proveedor}</td>
            <td>${f.producto}</td>
            <td>${f.tipo}</td>
            <td>${f.monto.toFixed(2)} ${f.moneda}</td>
            <td>${f.fecha}</td>
            <td>${f.desc}</td>
            <td>
                <button class="delete-btn" onclick="eliminarFactura('${f.id}')">Eliminar</button>
            </td>`;
        tablaFacturas.appendChild(tr);
    });
}

window.eliminarFactura = async id => await deleteDoc(doc(db, "facturas", id));

// Buscador de facturas
buscarFactura.addEventListener("input", e => {
    const term = e.target.value.toLowerCase();
    const filtered = facturasData.filter(f =>
        f.proveedor.toLowerCase().includes(term) ||
        f.producto.toLowerCase().includes(term) ||
        f.tipo.toLowerCase().includes(term) ||
        f.desc.toLowerCase().includes(term)
    );
    mostrarFacturas(filtered);
});

// --- CRUD GASTOS ---
const formGasto = document.getElementById("formGasto");
const tablaGastos = document.getElementById("tablaGastos");
const gastosRef = collection(db, "gastos");

formGasto.addEventListener("submit", async e => {
    e.preventDefault();
    await addDoc(gastosRef, {
        nombre: document.getElementById("nombreGasto").value,
        tipo: document.getElementById("tipoGasto").value,
        monto: parseFloat(document.getElementById("montoGasto").value),
        fecha: document.getElementById("fechaGasto").value
    });
    formGasto.reset();
});

onSnapshot(gastosRef, snapshot => {
    tablaGastos.innerHTML = "";
    snapshot.forEach(docu => {
        const g = docu.data();
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${g.nombre}</td>
            <td>${g.tipo}</td>
            <td>${g.monto.toFixed(2)}</td>
            <td>${g.fecha}</td>
            <td><button class="delete-btn" onclick="eliminarGasto('${docu.id}')">Eliminar</button></td>`;
        tablaGastos.appendChild(tr);
    });
});

window.eliminarGasto = async id => await deleteDoc(doc(db, "gastos", id));

// --- CRUD SERVICIOS ---
const formServicio = document.getElementById("formServicio");
const tablaServicios = document.getElementById("tablaServicios");
const serviciosRef = collection(db, "servicios");

formServicio.addEventListener("submit", async e => {
    e.preventDefault();
    await addDoc(serviciosRef, {
        nombre: document.getElementById("nombreServ").value,
        precio: parseFloat(document.getElementById("precioServ").value),
        fecha: document.getElementById("fechaServ").value,
        desc: document.getElementById("descServ").value
    });
    formServicio.reset();
});

onSnapshot(serviciosRef, snapshot => {
    tablaServicios.innerHTML = "";
    snapshot.forEach(docu => {
        const s = docu.data();
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${s.nombre}</td>
            <td>${s.precio.toFixed(2)}</td>
            <td>${s.fecha}</td>
            <td>${s.desc}</td>
            <td><button class="delete-btn" onclick="eliminarServicio('${docu.id}')">Eliminar</button></td>`;
        tablaServicios.appendChild(tr);
    });
});

window.eliminarServicio = async id => await deleteDoc(doc(db, "servicios", id));

// --- REPORTE ---
document.getElementById("generarReporte").addEventListener("click", async () => {
    const reporteDiv = document.getElementById("reporteContenido");
    let totalFacturas = 0, totalGastos = 0, totalServicios = 0;

    const factSnap = await getDocs(facturasRef);
    factSnap.forEach(f => totalFacturas += parseFloat(f.data().monto));

    const gastoSnap = await getDocs(gastosRef);
    gastoSnap.forEach(g => totalGastos += parseFloat(g.data().monto));

    const servSnap = await getDocs(serviciosRef);
    servSnap.forEach(s => totalServicios += parseFloat(s.data().precio));

    reporteDiv.innerHTML = `
    <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 8px 25px rgba(0,0,0,0.2);">
        <h3>Reporte General</h3>
        <p><strong>Total Facturas:</strong> S/. ${totalFacturas.toFixed(2)}</p>
        <p><strong>Total Gastos:</strong> S/. ${totalGastos.toFixed(2)}</p>
        <p><strong>Total Servicios:</strong> S/. ${totalServicios.toFixed(2)}</p>
    </div>`;
});
