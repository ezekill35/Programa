// Mostrar/ocultar login y registro
const loginDiv = document.getElementById('loginDiv');
const registerDiv = document.getElementById('registerDiv');
document.getElementById('showRegister').addEventListener('click', e => {
    e.preventDefault();
    loginDiv.style.display = 'none';
    registerDiv.style.display = 'block';
});
document.getElementById('showLogin').addEventListener('click', e => {
    e.preventDefault();
    loginDiv.style.display = 'block';
    registerDiv.style.display = 'none';
});

// Registro
const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email
            });
            alert('Usuario registrado con éxito');
            registerForm.reset();
            loginDiv.style.display = 'block';
            registerDiv.style.display = 'none';
        })
        .catch(error => alert(error.message));
});

// Login
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => window.location.href = "dashboard.html")
        .catch(error => alert(error.message));
});

// Mantener sesión
auth.onAuthStateChanged(user => {
    if(user) {
        if(window.location.pathname.includes("index.html")) {
            window.location.href = "dashboard.html";
        }
    }
});




