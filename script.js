function showRegister() {
    document.getElementById('card-inner').classList.add('flip');
}

function showLogin() {
    document.getElementById('card-inner').classList.remove('flip');
}

function login() {
    // Tu lógica de login Firebase
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    console.log("Login", email, password);
}

function register() {
    // Tu lógica de registro Firebase
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    console.log("Register", email, password);
}



















