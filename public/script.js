// Function to make a request to the server and handle the response
async function makeRequest(url, method, data) {
    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response.json();  // Assuming server responds with JSON
}

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Handle the login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            try {
                const data = await makeRequest('/login', 'POST', { username, password });
                if (data.success) {
                    localStorage.setItem('username', username); // Store username
                    window.location.href = '/profile.html';  // Redirect to profile
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Login failed', error);
            }
        });
    }

    // Handle the registration form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;
            try {
                const data = await makeRequest('/register', 'POST', { username, password });
                if (data.success) {
                    alert('Registration successful! Please log in.');
                    window.location.href = '/';  // Redirect to login
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Registration failed', error);
            }
        });
    }

    // Handle logout
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', async function() {
            try {
                const data = await makeRequest('/logout', 'POST', {});
                if (data.success) {
                    localStorage.removeItem('username');  // Clear username
                    window.location.href = '/';  // Redirect to login
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Logout failed', error);
            }
        });
    }
});
