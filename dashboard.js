import { db, auth } from './firebase.js';

window.logout = function() {
  auth.signOut().then(() => window.location.href = "index.html");
}

window.showSection = function(section) {
  document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(section + "-section").classList.add("active");

  document.querySelectorAll("#dashboard-menu .nav-link").forEach(link => link.classList.remove("active"));
  document.querySelector(`#dashboard-menu .nav-link[onclick="showSection('${section}')"]`).classList.add("active");
}
