import { auth, db } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

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
        if(!/^\d+$/.test(ruc)) return alert("RUC solo puede contener números");

        await addDoc(collection(db,'proveedores'), {ruc,nombre,direccion});
        proveedorForm.reset();
    });

    document.getElementById("rucProveedor").addEventListener("input", e=>{
        e.target.value = e.target.value.replace(/\D/g,'');
    });

    window.eliminarProveedor = async (id)=>{ await deleteDoc(doc(db,'proveedores',id)); };

    onSnapshot(collection(db,'proveedores'), snapshot=>{
        tablaProveedores.innerHTML='';
        proveedorSelect.innerHTML='<option value="" disabled selected>Seleccione proveedor</option>';
        snapshot.forEach(docSnap=>{
            const prov=docSnap.data();
            const row=document.createElement("tr");
            row.innerHTML=`
                <td><input type="text" value="${prov.ruc}" class="edit-ruc"></td>
                <td><input type="text" value="${prov.nombre}" class="edit-nombre"></td>
                <td><input type="text" value="${prov.direccion}" class="edit-direccion"></td>
                <td>
                    <button class="btn-delete">Eliminar</button>
                    <button class="btn-primary btn-sm guardar">Guardar</button>
                </td>
            `;
            tablaProveedores.appendChild(row);

            // Opciones proveedor factura
            const opt=document.createElement("option");
            opt.value=prov.nombre; opt.textContent=prov.nombre;
            proveedorSelect.appendChild(opt);

            // Editar y guardar en tiempo real
            const btnGuardar=row.querySelector(".guardar");
            const btnEliminar=row.querySelector(".btn-delete");
            const rucInput=row.querySelector(".edit-ruc");
            const nombreInput=row.querySelector(".edit-nombre");
            const direccionInput=row.querySelector(".edit-direccion");

            rucInput.addEventListener("input", e=>{ e.target.value=e.target.value.replace(/\D/g,''); });

            btnGuardar.addEventListener("click", async ()=>{
                const rucVal=rucInput.value.trim();
                const nombreVal=nombreInput.value.trim();
                const dirVal=direccionInput.value.trim();
                if(!rucVal||!nombreVal||!dirVal) return alert("Complete todos los campos");
                await updateDoc(doc(db,'proveedores',docSnap.id), {ruc:rucVal,nombre:nombreVal,direccion:dirVal});
            });

            btnEliminar.addEventListener("click", ()=>eliminarProveedor(docSnap.id));
        });
    });

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

    window.eliminarProducto = async id=>{ await deleteDoc(doc(db,'productos',id)); };

    onSnapshot(collection(db,'productos'), snapshot=>{
        tablaProductos.innerHTML='';
        productoSelect.innerHTML='<option value="" disabled selected>Seleccione producto</option>';
        snapshot.forEach(docSnap=>{
            const prod=docSnap.data();
            const row=document.createElement("tr");
            row.innerHTML=`
                <td><input type="text" value="${prod.nombre}" class="edit-nombre"></td>
                <td><input type="text" value="${prod.descripcion}" class="edit-descripcion"></td>
                <td><input type="number" value="${prod.cantidad}" class="edit-cantidad"></td>
                <td><input type="text" value="${prod.unidad}" class="edit-unidad"></td>
                <td><input type="number" value="${prod.valor}" step="0.01" class="edit-valor"></td>
                <td>
                    <button class="btn-delete">Eliminar</button>
                    <button class="btn-primary btn-sm guardar">Guardar</button>
                </td>
            `;
            tablaProductos.appendChild(row);

            const opt=document.createElement("option");
            opt.value=prod.nombre; opt.textContent=prod.nombre;
            productoSelect.appendChild(opt);

            const btnGuardar=row.querySelector(".guardar");
            const btnEliminar=row.querySelector(".btn-delete");

            btnGuardar.addEventListener("click", async ()=>{
                await updateDoc(doc(db,'productos',docSnap.id), {
                    nombre: row.querySelector(".edit-nombre").value,
                    descripcion: row.querySelector(".edit-descripcion").value,
                    cantidad: row.querySelector(".edit-cantidad").value,
                    unidad: row.querySelector(".edit-unidad").value,
                    valor: row.querySelector(".edit-valor").value
                });
            });

            btnEliminar.addEventListener("click", ()=>eliminarProducto(docSnap.id));
        });
    });

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
        if(!/^\d+$/.test(numero)) return alert("Número de factura solo puede contener números");
        await addDoc(collection(db,'facturas'), {numero,proveedor,producto,monto,tipo,moneda});
        facturaForm.reset();
    });

    document.getElementById("numeroFactura").addEventListener("input", e=>{
        e.target.value = e.target.value.replace(/\D/g,'');
    });

    window.eliminarFactura = async id=>{ await deleteDoc(doc(db,'facturas',id)); };

    onSnapshot(collection(db,'facturas'), snapshot=>{
        tablaFacturas.innerHTML='';
        snapshot.forEach(docSnap=>{
            const fac=docSnap.data();
            const row=document.createElement("tr");
            row.innerHTML=`
                <td><input type="text" value="${fac.numero}" class="edit-numero" /></td>
                <td><input type="text" value="${fac.proveedor}" class="edit-proveedor" /></td>
                <td><input type="text" value="${fac.producto}" class="edit-producto" /></td>
                <td><input type="number" value="${fac.monto}" step="0.01" class="edit-monto" /></td>
                <td><input type="text" value="${fac.tipo}" class="edit-tipo" /></td>
                <td>
                    <button class="btn-delete">Eliminar</button>
                    <button class="btn-primary btn-sm guardar">Guardar</button>
                </td>
            `;
            tablaFacturas.appendChild(row);

            const btnGuardar=row.querySelector(".guardar");
            const btnEliminar=row.querySelector(".btn-delete");

            row.querySelector(".edit-numero").addEventListener("input", e=>{ e.target.value=e.target.value.replace(/\D/g,''); });

            btnGuardar.addEventListener("click", async ()=>{
                await updateDoc(doc(db,'facturas',docSnap.id), {
                    numero: row.querySelector(".edit-numero").value,
                    proveedor: row.querySelector(".edit-proveedor").value,
                    producto: row.querySelector(".edit-producto").value,
                    monto: row.querySelector(".edit-monto").value,
                    tipo: row.querySelector(".edit-tipo").value,
                    moneda: fac.moneda
                });
            });

            btnEliminar.addEventListener("click", ()=>eliminarFactura(docSnap.id));
        });
    });

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




