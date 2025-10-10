import { auth, db } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
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
    cerrarModal.addEventListener("click", () => detalleModal.style.display="none");
    window.addEventListener("click", e=>{ if(e.target===detalleModal) detalleModal.style.display="none"; });
    function abrirModal(titulo, contenido){ tituloModal.textContent=titulo; contenidoModal.textContent=contenido; detalleModal.style.display="flex"; }

    // Sidebar
    menuBtns.forEach(btn=>{
        btn.addEventListener("click", ()=>{
            const target=btn.dataset.target;
            secciones.forEach(sec=>sec.style.display="none");
            document.getElementById(target).style.display="block";
            menuBtns.forEach(b=>b.classList.remove("activo"));
            btn.classList.add("activo");
        });
    });
    document.getElementById("facturas").style.display="block";

    logoutBtn.addEventListener("click", ()=>signOut(auth).then(()=>window.location.href="index.html"));

    // =========================
    // Firestore Collections
    // =========================
    const proveedoresCol = collection(db,"proveedores");
    const facturasCol = collection(db,"facturas");

    // Cargar proveedores en tiempo real
    onSnapshot(proveedoresCol, snapshot=>{
        proveedorSelect.innerHTML="";
        snapshot.forEach(docSnap=>{
            const data = docSnap.data();
            const opt = document.createElement("option");
            opt.value = data.nombre;
            opt.textContent = data.nombre;
            proveedorSelect.appendChild(opt);
        });
    });

    // Registrar proveedor
    document.getElementById("proveedorForm").addEventListener("submit", async e=>{
        e.preventDefault();
        const ruc=document.getElementById("rucProveedor").value;
        const nombre=document.getElementById("nombreProveedor").value;
        const telefono=document.getElementById("telefonoProveedor").value;
        await addDoc(proveedoresCol,{ruc,nombre,telefono});
        e.target.reset();
    });

    // Registrar factura
    document.getElementById("facturaForm").addEventListener("submit", async e=>{
        e.preventDefault();
        const numero=document.getElementById("numeroFactura").value;
        const proveedor=document.getElementById("proveedorFactura").value;
        const producto=document.getElementById("productoFactura").value;
        const monto=document.getElementById("montoFactura").value;
        const tipo=document.getElementById("tipoFactura").value;
        const moneda=document.getElementById("monedaFactura").value;
        await addDoc(facturasCol,{numero,proveedor,producto,monto,tipo,moneda});
        e.target.reset();
    });

    // Mostrar facturas en tiempo real
    onSnapshot(facturasCol, snapshot=>{
        tablaFacturas.innerHTML="";
        snapshot.forEach(docSnap=>{
            const f=docSnap.data();
            const fila=document.createElement("tr");
            fila.innerHTML=`
                <td class="click-detalle" data-tipo="numero">${f.numero}</td>
                <td class="click-detalle" data-tipo="proveedor">${f.proveedor}</td>
                <td class="click-detalle" data-tipo="producto">${f.producto}</td>
                <td>${f.moneda} ${f.monto}</td>
                <td>${f.tipo}</td>
                <td><button class="btn btn-danger btn-sm eliminar">🗑️</button></td>
            `;
            tablaFacturas.appendChild(fila);

            // Modal detalles
            fila.querySelectorAll(".click-detalle").forEach(td=>{
                td.addEventListener("click", ()=> abrirModal(td.dataset.tipo, td.textContent));
            });

            // Eliminar
            fila.querySelector(".eliminar").addEventListener("click", async ()=>{
                const docs = await getDocs(facturasCol);
                const docToDelete = docs.docs.find(d=>d.data().numero===f.numero);
                if(docToDelete) await deleteDoc(doc(db,"facturas",docToDelete.id));
            });
        });
    });

    // Buscador
    buscador.addEventListener("input", ()=>{
        const txt = buscador.value.toLowerCase();
        tablaFacturas.querySelectorAll("tr").forEach(row=>{
            row.style.display = row.innerText.toLowerCase().includes(txt) ? "" : "none";
        });
    });

});




