import { auth, db } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", ()=>{

const secciones=document.querySelectorAll(".seccion");
const menuBtns=document.querySelectorAll(".menu-btn");
const logoutBtn=document.getElementById("logoutBtn");
const buscador=document.getElementById("buscadorGlobal");

const tablaProveedores=document.getElementById("tablaProveedores");
const tablaProductos=document.getElementById("tablaProductos");
const tablaFacturas=document.getElementById("tablaFacturas");

const proveedorSelect=document.getElementById("proveedorFactura");
const productoSelect=document.getElementById("productoFactura");

// Modal
const detalleModal=document.getElementById("detalleModal");
const tituloModal=document.getElementById("tituloModal");
const contenidoModal=document.getElementById("contenidoModal");
const cerrarModal=document.getElementById("cerrarModal");

cerrarModal.addEventListener("click", ()=>detalleModal.style.display="none");
window.addEventListener("click", e=>{if(e.target===detalleModal) detalleModal.style.display="none";});
function abrirModal(titulo,contenido){tituloModal.textContent=titulo; contenidoModal.textContent=contenido; detalleModal.style.display="flex";}

// NAV
menuBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    secciones.forEach(s=>s.style.display="none");
    document.getElementById(btn.dataset.target).style.display="block";
    menuBtns.forEach(b=>b.classList.remove("activo"));
    btn.classList.add("activo");
  });
});
document.getElementById("proveedores").style.display="block";

// LOGOUT
logoutBtn.addEventListener("click", ()=>signOut(auth).then(()=>window.location.href="index.html"));

// ================= PROVEEDORES =================
const proveedorForm=document.getElementById("proveedorForm");
let proveedoresList=[];
let editProveedorId=null;

proveedorForm.addEventListener("submit", async e=>{
    e.preventDefault();
    const ruc=document.getElementById("rucProveedor").value;
    const nombre=document.getElementById("nombreProveedor").value;
    const direccion=document.getElementById("direccionProveedor").value;
    if(!/^\d+$/.test(ruc)) return alert("RUC solo puede contener números");
    if(!ruc||!nombre||!direccion) return alert("Complete todos los campos");
    
    if(editProveedorId){
        await updateDoc(doc(db,'proveedores',editProveedorId),{ruc,nombre,direccion});
        editProveedorId=null;
    } else {
        await addDoc(collection(db,'proveedores'), {ruc,nombre,direccion});
    }
    proveedorForm.reset();
});

onSnapshot(collection(db,'proveedores'), snapshot=>{
    tablaProveedores.innerHTML='';
    proveedoresList=snapshot.docs.map(docSnap=>({id:docSnap.id, ...docSnap.data()}));
    proveedorSelect.innerHTML='<option value="" disabled selected>Seleccione proveedor</option>';
    proveedoresList.forEach(p=>{
        const row=document.createElement("tr");
        row.innerHTML=`
        <td>${p.ruc}</td><td>${p.nombre}</td><td>${p.direccion}</td>
        <td>
        <button class="btn-edit">✏️</button>
        <button class="btn-delete">🗑️</button>
        </td>`;
        tablaProveedores.appendChild(row);

        const opt=document.createElement("option");
        opt.value=p.nombre; opt.textContent=p.nombre;
        proveedorSelect.appendChild(opt);

        // Editar
        row.querySelector(".btn-edit").addEventListener("click", ()=>{
            document.getElementById("rucProveedor").value=p.ruc;
            document.getElementById("nombreProveedor").value=p.nombre;
            document.getElementById("direccionProveedor").value=p.direccion;
            editProveedorId=p.id;
        });
        // Eliminar
        row.querySelector(".btn-delete").addEventListener("click", async ()=>{
            if(confirm("Eliminar proveedor?")) await deleteDoc(doc(db,'proveedores',p.id));
        });
    });
});

// ================= PRODUCTOS =================
const productoForm=document.getElementById("productoForm");
let productosList=[];
let editProductoId=null;

productoForm.addEventListener("submit", async e=>{
    e.preventDefault();
    const nombre=document.getElementById("nombreProducto").value;
    const descripcion=document.getElementById("descripcionProducto").value;
    const cantidad=document.getElementById("cantidadProducto").value;
    const unidad=document.getElementById("unidadProducto").value;
    const valor=document.getElementById("valorUnitarioProducto").value;
    if(!nombre) return alert("Ingrese nombre del producto");

    if(editProductoId){
        await updateDoc(doc(db,'productos',editProductoId),{nombre,descripcion,cantidad,unidad,valor});
        editProductoId=null;
    } else {
        await addDoc(collection(db,'productos'),{nombre,descripcion,cantidad,unidad,valor});
    }
    productoForm.reset();
});

onSnapshot(collection(db,'productos'), snapshot=>{
    tablaProductos.innerHTML='';
    productosList=snapshot.docs.map(docSnap=>({id:docSnap.id, ...docSnap.data()}));
    productoSelect.innerHTML='<option value="" disabled selected>Seleccione producto</option>';
    productosList.forEach(p=>{
        const row=document.createElement("tr");
        row.innerHTML=`
        <td>${p.nombre}</td><td>${p.descripcion}</td><td>${p.cantidad}</td>
        <td>${p.unidad}</td><td>${p.valor}</td>
        <td>
        <button class="btn-edit">✏️</button>
        <button class="btn-delete">🗑️</button>
        </td>`;
        tablaProductos.appendChild(row);

        const opt=document.createElement("option");
        opt.value=p.nombre; opt.textContent=p.nombre;
        productoSelect.appendChild(opt);

        row.querySelector(".btn-edit").addEventListener("click", ()=>{
            document.getElementById("nombreProducto").value=p.nombre;
            document.getElementById("descripcionProducto").value=p.descripcion;
            document.getElementById("cantidadProducto").value=p.cantidad;
            document.getElementById("unidadProducto").value=p.unidad;
            document.getElementById("valorUnitarioProducto").value=p.valor;
            editProductoId=p.id;
        });

        row.querySelector(".btn-delete").addEventListener("click", async ()=>{
            if(confirm("Eliminar producto?")) await deleteDoc(doc(db,'productos',p.id));
        });
    });
});

// ================= FACTURAS =================
const facturaForm=document.getElementById("facturaForm");
let editFacturaId=null;

facturaForm.addEventListener("submit", async e=>{
    e.preventDefault();
    const numero=document.getElementById("numeroFactura").value;
    const proveedor=proveedorSelect.value;
    const producto=productoSelect.value;
    const monto=document.getElementById("montoFactura").value;
    const tipo=document.getElementById("tipoFactura").value;
    const moneda=document.getElementById("monedaFactura").value;
    if(!numero||!proveedor||!producto||!monto) return alert("Complete todos los campos");

    if(editFacturaId){
        await updateDoc(doc(db,'facturas',editFacturaId),{numero,proveedor,producto,monto,tipo,moneda});
        editFacturaId=null;
    } else {
        await addDoc(collection(db,'facturas'),{numero,proveedor,producto,monto,tipo,moneda});
    }
    facturaForm.reset();
});

onSnapshot(collection(db,'facturas'), snapshot=>{
    tablaFacturas.innerHTML='';
    snapshot.docs.forEach(docSnap=>{
        const f=docSnap.data();
        const row=document.createElement("tr");
        row.innerHTML=`
        <td>${f.numero}</td>
        <td>${f.proveedor}</td>
        <td>${f.producto}</td>
        <td>${f.moneda} ${f.monto}</td>
        <td>${f.tipo}</td>
        <td>
        <button class="btn-edit">✏️</button>
        <button class="btn-delete">🗑️</button>
        </td>`;
        tablaFacturas.appendChild(row);

        row.querySelector(".btn-edit").addEventListener("click", ()=>{
            document.getElementById("numeroFactura").value=f.numero;
            proveedorSelect.value=f.proveedor;
            productoSelect.value=f.producto;
            document.getElementById("montoFactura").value=f.monto;
            document.getElementById("tipoFactura").value=f.tipo;
            document.getElementById("monedaFactura").value=f.moneda;
            editFacturaId=docSnap.id;
        });

        row.querySelector(".btn-delete").addEventListener("click", async ()=>{
            if(confirm("Eliminar factura?")) await deleteDoc(doc(db,'facturas',docSnap.id));
        });
    });
});

// ================= BUSCADOR GLOBAL =================
buscador.addEventListener("keypress", async e=>{
    if(e.key==="Enter"){
        const txt=buscador.value.toLowerCase();
        if(!txt) return;
        const resultados=productosList.filter(p=>p.nombre.toLowerCase().includes(txt));
        if(resultados.length>0){
            const contenido=resultados.map(p=>`Nombre: ${p.nombre}\nDescripción: ${p.descripcion}\nCantidad: ${p.cantidad}\nUnidad: ${p.unidad}\nValor: ${p.valor}`).join("\n\n----------------\n\n");
            abrirModal("Productos relacionados",contenido);
        } else detalleModal.style.display="none";
    }
});

});





