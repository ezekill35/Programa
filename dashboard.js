import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

function showAllSections() {
  document.querySelectorAll(".content-section").forEach(s=>s.classList.remove("active"));
}

window.showSection = function(section){
  showAllSections();
  document.getElementById(section+'-section').classList.add("active");
  document.querySelectorAll("#dashboard-menu .nav-link").forEach(b=>b.classList.remove("active"));
  document.querySelector(`#dashboard-menu .nav-link[onclick="showSection('${section}')"]`).classList.add("active");
}

// Ejemplo básico: agregar producto
window.addProduct = async function() {
  const name = document.getElementById("product-name").value;
  if(!name) return alert("Complete el nombre");
  await addDoc(collection(db,"productos"),{
    name,
    sku: document.getElementById("product-sku").value,
    brand: document.getElementById("product-brand").value,
    price: parseFloat(document.getElementById("product-price").value),
    stock: parseInt(document.getElementById("product-stock").value)
  });
  alert("Producto agregado");
  document.getElementById("add-product-form").reset();
}

// Ejemplo básico: agregar proveedor
window.addProvider = async function(){
  const contact = document.getElementById("provider-contact").value;
  if(!contact) return alert("Complete el contacto");
  await addDoc(collection(db,"proveedores"),{
    contact,
    name: document.getElementById("provider-name").value,
    phone: document.getElementById("provider-phone").value,
    fax: document.getElementById("provider-fax").value,
    products: document.getElementById("provider-products").value
  });
  alert("Proveedor agregado");
  document.getElementById("add-provider-form").reset();
}

// Facturas, Ventas y Gastos se agregan de forma similar usando addDoc a sus colecciones
window.addInvoice = async function(){
  await addDoc(collection(db,"facturas"),{
    ruc: document.getElementById("invoice-ruc").value,
    number: document.getElementById("invoice-number").value,
    provider: document.getElementById("invoice-provider").value,
    date: document.getElementById("invoice-date").value,
    total: parseFloat(document.getElementById("invoice-total").value)
  });
  alert("Factura agregada");
  document.getElementById("add-invoice-form").reset();
}

window.addSale = async function(){
  await addDoc(collection(db,"ventas"),{
    client: document.getElementById("sale-client").value,
    total: parseFloat(document.getElementById("sale-total").value)
  });
  alert("Venta registrada");
  document.getElementById("add-sale-form").reset();
}

window.addExpense = async function(){
  await addDoc(collection(db,"gastos"),{
    description: document.getElementById("expense-description").value,
    amount: parseFloat(document.getElementById("expense-amount").value),
    date: document.getElementById("expense-date").value
  });
  alert("Gasto registrado");
  document.getElementById("add-expense-form").reset();
}
