import { auth, db } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

    const secciones = document.querySelectorAll(".seccion");
    const menuBtns = document.querySelectorAll(".menu-btn");
    const buscador = document.getElementById("buscadorGlobal");
    const logoutBtn = document.getElementById("logoutBtn");

    const tablaProveedores = document.getElementById("tablaProveedores");
    const tablaProductos = document.getElementById("tablaProductos");
    const tablaFacturas = document.getElementById("tablaFacturas");

    const proveedorSelect = document.getElementById("proveedorFactura");
    const productoSelect = document.getElementById("productoFactura");

    // Modal
    const detalleModal = document.getElementById("detalleModal");
    const tituloModal = document.getElementById("tituloModal");
    const contenidoModal = document.getElementById("contenidoModal");
    const cerrarModal = document.getElementById("cerrarModal");

    cerrarModal.addEventListener("click", ()=>detalleModal.style.display="none");
    window.addEventListener("click", e=>{ if(e.target===detalleModal) detalleModal.style.display="none"; });

    function abrirModal(titulo,contenido){
        tituloModal.textContent=titulo;
        contenidoModal.textContent=contenido;
        detalleModal.style.display="flex";
    }

    // ---------------- NAV ----------------
    menuBtns.forEach(btn=>{
        btn.addEventListener("click", ()=>{
            const target = btn.dataset.target;
            secciones.forEach(sec=>sec.style.display="none");
            document.getElementById(target).style.display="block";
            menuBtns.forEach(b=>b.classList.remove("activo"));
            btn.classList.add("activo");
        });
    });
    document.getElementById("proveedores").style.display="block";

    // ---------------- LOGOUT ----------------
    logoutBtn.addEventListener("click", ()=>signOut(auth).then(()=>window.location.href="index.html"));

    // ==================== PROVEEDORES ====================
    const proveedorForm=document.getElementById("proveedorForm");
    proveedorForm.addEventListener("submit", async e=>{
        e.preventDefault();
        const ruc=document.getElementById("rucProveedor").value;
        const nombre=document.getElementById("nombreProveedor").value;
        const direccion=document.getElementById("direccionProveedor").value;
        if(!ruc||!nombre||!direccion) return alert("Complete todos los campos");
        await addDoc(collection(db,'proveedores'), {ruc,nombre,direccion});
        proveedorForm.reset();
    });

    onSnapshot(collection(db,'proveedores'), snapshot=>{
        tablaProveedores.innerHTML='';
        proveedorSelect.innerHTML='<option value="" disabled selected>Seleccione proveedor</option>';
        snapshot.forEach(docSnap=>{
            const prov=docSnap.data();
            const row=document.createElement("tr");
            row.innerHTML=`
                <td>${prov.ruc}</td>
                <td>${prov.nombre}</td>
                <td>${prov.direccion}</td>
                <td><button class="btn-delete" onclick="eliminarProveedor('${docSnap.id}')">Eliminar</button></td>
            `;
            tablaProveedores.appendChild(row);

            const opt=document.createElement("option");
            opt.value=prov.nombre;
            opt.textContent=prov.nombre;
            proveedorSelect.appendChild(opt);
        });
    });

    window.eliminarProveedor = async (id)=>{ await deleteDoc(doc(db,'proveedores',id)); };

    // ==================== PRODUCTOS ====================
    const productoForm=document.getElementById("productoForm");
    productoForm.addEventListener("submit", async e=>{
        e.preventDefault();
        const nombre=document.getElementById("nombreProducto").value;
        const descripcion=document.getElementById("descripcionProducto").value;
        const cantidad=document.getElementById("cantidadProducto").value;
        const unidad=document.getElementById("unidadProducto").value;
        const valor=document.getElementById("valorUnitarioProducto").value;
        if(!nombre) return alert("Ingrese nombre del producto");
        await addDoc(collection(db,'productos'), {nombre,descripcion,cantidad,unidad,valor});
        productoForm.reset();
    });

    onSnapshot(collection(db,'productos'), snapshot=>{
        tablaProductos.innerHTML='';
        productoSelect.innerHTML='<option value="" disabled selected>Seleccione producto</option>';
        snapshot.forEach(docSnap=>{
            const prod=docSnap.data();
            const row=document.createElement("tr");
            row.innerHTML=`
                <td>${prod.nombre}</td>
                <td>${prod.descripcion}</td>
                <td>${prod.cantidad}</td>
                <td>${prod.unidad}</td>
                <td>${prod.valor}</td>
                <td><button class="btn-delete" onclick="eliminarProducto('${docSnap.id}')">Eliminar</button></td>
            `;
            tablaProductos.appendChild(row);

            const opt=document.createElement("option");
            opt.value=prod.nombre;
            opt.textContent=prod.nombre;
            productoSelect.appendChild(opt);
        });
    });

    window.eliminarProducto = async id=>{ await deleteDoc(doc(db,'productos',id)); };

    // ==================== FACTURAS ====================
    const facturaForm=document.getElementById("facturaForm");
    facturaForm.addEventListener("submit", async e=>{
        e.preventDefault();
        const numero=document.getElementById("numeroFactura").value;
        const proveedor=proveedorSelect.value;
        const producto=productoSelect.value;
        const monto=document.getElementById("montoFactura").value;
        const tipo=document.getElementById("tipoFactura").value;
        const moneda=document.getElementById("monedaFactura").value;
        if(!numero||!proveedor||!producto||!monto) return alert("Complete todos los campos");
        await addDoc(collection(db,'facturas'), {numero,proveedor,producto,monto,tipo,moneda});
        facturaForm.reset();
    });

    onSnapshot(collection(db,'facturas'), snapshot=>{
        tablaFacturas.innerHTML='';
        snapshot.forEach(docSnap=>{
            const fac=docSnap.data();
            const row=document.createElement("tr");
            row.innerHTML=`
                <td class="click-detalle" data-tipo="numero">${fac.numero}</td>
                <td class="click-detalle" data-tipo="proveedor">${fac.proveedor}</td>
                <td class="click-detalle" data-tipo="producto">${fac.producto}</td>
                <td>${fac.moneda} ${fac.monto}</td>
                <td>${fac.tipo}</td>
                <td><button class="btn-delete" onclick="eliminarFactura('${docSnap.id}')">Eliminar</button></td>
            `;
            tablaFacturas.appendChild(row);

            // Modal detalle
            row.querySelectorAll(".click-detalle").forEach(td=>{
                td.addEventListener("click", ()=>{
                    let titulo="",contenido="";
                    const tipo=td.dataset.tipo;
                    if(tipo==="proveedor") titulo="Proveedor: "+td.textContent;
                    else if(tipo==="producto") titulo="Producto: "+td.textContent;
                    else if(tipo==="numero") titulo="Factura N°: "+td.textContent;
                    contenido=JSON.stringify(fac,null,2);
                    abrirModal(titulo,contenido);
                });
            });
        });
    });

    window.eliminarFactura = async id=>{ await deleteDoc(doc(db,'facturas',id)); };

    // ==================== BUSCADOR GLOBAL ====================
    buscador.addEventListener("keypress", async e=>{
        if(e.key==="Enter"){
            const txt=buscador.value.toLowerCase();
            if(!txt) return;
            const snapshot=await getDocs(collection(db,'productos'));
            const resultados=[];
            snapshot.forEach(docSnap=>{
                const prod=docSnap.data();
                if(prod.nombre.toLowerCase().includes(txt)) resultados.push(prod);
            });
            if(resultados.length>0){
                let contenido=resultados.map(p=>`Nombre: ${p.nombre}\nDescripción: ${p.descripcion}\nCantidad: ${p.cantidad}\nUnidad: ${p.unidad}\nValor: ${p.valor}`).join("\n\n----------------\n\n");
                abrirModal("Productos relacionados",contenido);
            } else detalleModal.style.display="none";
        }
    });

});




