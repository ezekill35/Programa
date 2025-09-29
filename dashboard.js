// Inicialización de Firebase
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ===== NAVEGACIÓN =====
const sections = {
    productos: document.getElementById('productos-section'),
    proveedores: document.getElementById('proveedores-section'),
    compras: document.getElementById('compras-section'),
    ventas: document.getElementById('ventas-section'),
    gastos: document.getElementById('gastos-section')
};

const navButtons = {
    productos: document.querySelector("button[onclick=\"showSection('productos')\"]"),
    proveedores: document.querySelector("button[onclick=\"showSection('proveedores')\"]"),
    compras: document.querySelector("button[onclick=\"showSection('compras')\"]"),
    ventas: document.querySelector("button[onclick=\"showSection('ventas')\"]"),
    gastos: document.querySelector("button[onclick=\"showSection('gastos')\"]")
};

function showSection(sectionName) {
    // Mostrar solo la sección seleccionada
    for (const key in sections) {
        if (key === sectionName) {
            sections[key].classList.add('active');
            navButtons[key].classList.add('active');
        } else {
            sections[key].classList.remove('active');
            navButtons[key].classList.remove('active');
        }
    }
}

// ===== LOGOUT =====
function logout() {
    auth.signOut().then(() => {
        window.location.href = "index.html";
    });
}

// ===== AGREGAR PRODUCTOS =====
function agregarProducto() {
    const producto = {
        sku: document.getElementById('producto-sku').value,
        nombre: document.getElementById('producto-nombre').value,
        marca: document.getElementById('producto-marca').value,
        precio: parseFloat(document.getElementById('producto-precio').value),
        stock: parseInt(document.getElementById('producto-stock').value),
        categoria: document.getElementById('producto-categoria').value
    };
    db.collection('productos').add(producto).then(() => {
        alert("Producto agregado correctamente");
        document.getElementById('form-producto').reset();
        cargarProductos();
    });
}

function cargarProductos() {
    const lista = document.getElementById('lista-productos');
    lista.innerHTML = "";
    db.collection('productos').get().then(snapshot => {
        snapshot.forEach(doc => {
            const data = doc.data();
            const div = document.createElement('div');
            div.textContent = `${data.sku} - ${data.nombre} - S/${data.precio}`;
            lista.appendChild(div);
        });
    });
}

// ===== AGREGAR PROVEEDORES =====
function agregarProveedor() {
    const proveedor = {
        ruc: document.getElementById('proveedor-ruc').value,
        nombre: document.getElementById('proveedor-nombre').value,
        contacto: document.getElementById('proveedor-contacto').value,
        telefono: document.getElementById('proveedor-telefono').value,
        fax: document.getElementById('proveedor-fax').value,
        direccion: document.getElementById('proveedor-direccion').value,
        productos: document.getElementById('proveedor-productos').value
    };
    db.collection('proveedores').add(proveedor).then(() => {
        alert("Proveedor agregado correctamente");
        document.getElementById('form-proveedor').reset();
        cargarProveedores();
    });
}

function cargarProveedores() {
    const lista = document.getElementById('lista-proveedores');
    lista.innerHTML = "";
    db.collection('proveedores').get().then(snapshot => {
        snapshot.forEach(doc => {
            const data = doc.data();
            const div = document.createElement('div');
            div.textContent = `${data.ruc} - ${data.nombre} - ${data.contacto}`;
            lista.appendChild(div);
        });
    });
}

// ===== LOGIN / REGISTRO =====
function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    auth.signInWithEmailAndPassword(email, password)
    .then(() => {
        window.location.href = "dashboard.html";
    })
    .catch(error => {
        document.getElementById('login-error').textContent = error.message;
    });
}

function register() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
        document.getElementById('register-success').textContent = "Cuenta creada exitosamente";
        document.getElementById('register-error').textContent = "";
        document.getElementById('form-register').reset();
    })
    .catch(error => {
        document.getElementById('register-error').textContent = error.message;
    });
}

// ===== CARGAR INICIAL =====
document.addEventListener('DOMContentLoaded', () => {
    showSection('productos');
    cargarProductos();
    cargarProveedores();
});


