import { auth, db } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const secciones = document.querySelectorAll(".seccion");
    const menuBtns = document.querySelectorAll(".menu-btn");
    const buscador = document.getElementById("buscadorGlobal");
    const logoutBtn = document.getElementById("logoutBtn");
    const proveedorSelect = document.getElementById("proveedorFactura");
    const tablaFacturas = document.getElementById("tablaFacturas");

    // Modal
    const detalleModal = document.getElementById("detalleModal");
    const tituloModal = document.getElementById("tituloModal");
    const contenidoModal = document.getElementById("contenidoModal");
    const cerrarModal = document.getElementById("cerrarModal");
    cerrarModal.addEventListener("click", () => detalleModal.style.display = "none");
    window.addEventListener("click", e => { if(e.target === detalleModal) detalleModal.style.display = "none"; });
    function abrirModal(titulo, contenido){ 
        tituloModal.textContent = titulo; 
        contenidoModal.textContent = contenido; 
        detalleModal.style.display="flex"; 
    }

    // Navegación entre secciones
    menuBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.dataset.target;
            secciones.forEach(sec => sec.style.display = "none");
            document.getElementById(target).style.display = "block";
            menuBtns.forEach(b => b.classList.remove("activo"));
            btn.classList.add("activo");
        });
    });
    document.getElementById("facturas").style.display = "block";

    // =========================
    // Cerrar sesión
    // =========================
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => window.location.href = "index.html");
    });

    // =========================
    // Datos en memoria
    // =========================
    const proveedoresList = [];
    const productosList = [];
    const facturasList = [];

    // -------------------------
    // CRUD Proveedores
    // -------------------------
    const proveedorForm=document.getElementById("proveedorForm");
    proveedorForm.addEventListener("submit", e=>{
        e.preventDefault();
        const ruc=document.getElementById("rucProveedor").value;
        const nombre=document.getElementById("nombreProveedor").value;
        const telefono=document.getElementById("telefonoProveedor").value;
        const proveedor={ruc,nombre,telefono};
        proveedoresList.push(proveedor);
        const opt=document.createElement("option"); 
        opt.value=nombre; 
        opt.textContent=nombre; 
        proveedorSelect.appendChild(opt);
        proveedorForm.reset();
    });

    // -------------------------
    // CRUD Productos
    // -------------------------
    const productoForm=document.getElementById("productoForm");
    productoForm.addEventListener("submit", e=>{
        e.preventDefault();
        const nombre=document.getElementById("nombreProducto").value;
        const descripcion=document.getElementById("descripcionProducto").value;
        const cantidad=document.getElementById("cantidadProducto").value;
        const unidad=document.getElementById("unidadProducto").value;
        const valorUnitario=document.getElementById("valorUnitarioProducto").value;
        const producto={nombre,descripcion,cantidad,unidad,valorUnitario};
        productosList.push(producto);
        productoForm.reset();
    });

    // -------------------------
    // CRUD Facturas
    // -------------------------
    const facturaForm=document.getElementById("facturaForm");
    facturaForm.addEventListener("submit", e=>{
        e.preventDefault();
        const numero=document.getElementById("numeroFactura").value;
        const proveedor=document.getElementById("proveedorFactura").value;
        const producto=document.getElementById("productoFactura").value;
        const monto=document.getElementById("montoFactura").value;
        const tipo=document.getElementById("tipoFactura").value;
        const moneda=document.getElementById("monedaFactura").value;

        const factura={numero,proveedor,producto,monto,tipo,moneda};
        facturasList.push(factura);

        const fila=document.createElement("tr");
        fila.innerHTML=`
            <td class="click-detalle" data-tipo="numero">${numero}</td>
            <td class="click-detalle" data-tipo="proveedor">${proveedor}</td>
            <td class="click-detalle" data-tipo="producto">${producto}</td>
            <td>${moneda} ${monto}</td>
            <td>${tipo}</td>
            <td><button class="btn btn-danger btn-sm eliminar">🗑️</button></td>
        `;
        tablaFacturas.appendChild(fila);

        // Modal detalles
        fila.querySelectorAll(".click-detalle").forEach(td=>{
            td.addEventListener("click", ()=>{
                const tipo=td.dataset.tipo;
                let titulo="",contenido="";
                if(tipo==="proveedor"){
                    const p=proveedoresList.find(p=>p.nombre===td.textContent);
                    titulo="Detalles del Proveedor";
                    contenido=p?`Nombre: ${p.nombre}\nRUC: ${p.ruc}\nTeléfono: ${p.telefono}`:"Proveedor no encontrado";
                }
                if(tipo==="producto"){
                    const p=productosList.find(p=>p.nombre===td.textContent);
                    titulo="Detalles del Producto";
                    contenido=p?`Nombre: ${p.nombre}\nDescripción: ${p.descripcion}\nCantidad: ${p.cantidad}\nUnidad: ${p.unidad}\nValor Unitario: ${p.valorUnitario}`:"Producto no encontrado";
                }
                if(tipo==="numero"){ 
                    titulo="Número de Factura"; 
                    contenido=td.textContent; 
                }
                abrirModal(titulo,contenido);
            });
        });

        // Eliminar factura
        fila.querySelector(".eliminar").addEventListener("click", ()=>{
            fila.remove();
            const idx=facturasList.findIndex(f=>f.numero===numero);
            if(idx>-1) facturasList.splice(idx,1);
        });

        facturaForm.reset();
    });

    // -------------------------
    // Buscador Global con Modal
    // -------------------------
    buscador.addEventListener("input", () => {
        const txt = buscador.value.toLowerCase().trim();
        if (txt === "") {
            detalleModal.style.display = "none"; // cerrar modal si no hay texto
            return;
        }

        const resultados = facturasList.filter(f => 
            f.numero.toLowerCase().includes(txt) || 
            f.producto.toLowerCase().includes(txt)
        );

        if (resultados.length > 0) {
            let contenido = resultados.map(f => 
                `Factura N°: ${f.numero}\nProveedor: ${f.proveedor}\nProducto: ${f.producto}\nMonto: ${f.moneda} ${f.monto}\nTipo: ${f.tipo}`
            ).join("\n\n----------------\n\n");

            abrirModal("Facturas relacionadas", contenido);
        } else {
            detalleModal.style.display = "none";
        }
    });
});




