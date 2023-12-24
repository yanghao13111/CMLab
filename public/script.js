// 建立WebSocket連接
const ws = new WebSocket('ws://localhost:8081');

ws.onopen = function() {
    console.log('Connected to the WebSocket server');
};

ws.onmessage = function(event) {
    const [action, result] = event.data.split('|');
    switch(action) {
        case 'LOGIN_RESPONSE':
            if (result === 'SUCCESS') {
                window.location.href = '/profile.html';
            } else {
                alert('登錄失敗，請檢查您的帳號或密碼。');
            }
            break;
        case 'REGISTER_RESPONSE':
            if (result === 'SUCCESS') {
                alert('註冊成功，請登錄。');
                window.location.href = '/';
            } else {
                alert('註冊失敗，用戶名可能已存在。');
            }
            break;
    }
};

function login(username, password) {
    ws.send(`LOGIN|${username}|${password}`);
}

function register(username, password) {
    ws.send(`REGISTER|${username}|${password}`);
}

function logout() {
    ws.send('LOGOUT');
    localStorage.removeItem('username'); // 假設您在localStorage中儲存了用戶名
    window.location.href = '/';
}

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutButton = document.getElementById('logout');

    if (loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            login(username, password);
        };
    }

    if (registerForm) {
        registerForm.onsubmit = function(e) {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;
            register(username, password);
        };
    }

    if (logoutButton) {
        logoutButton.onclick = function(e) {
            e.preventDefault();
            logout();
        };
    }
});
