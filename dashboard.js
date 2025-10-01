// dashboard.js

// Cambiar de secciones
const menuItems = document.querySelectorAll(".sidebar ul li[data-section]");
const sections = document.querySelectorAll(".section");

menuItems.forEach(item => {
  item.addEventListener("click", () => {
    // quitar activo
    menuItems.forEach(i => i.classList.remove("active"));
    sections.forEach(s => s.classList.remove("active"));

    // activar el clicado
    item.classList.add("active");
    document.getElementById(item.getAttribute("data-section")).classList.add("active");
  });
});

// Cerrar sesión
document.getElementById("logout").addEventListener("click", () => {
  window.location.href = "index.html";
});

