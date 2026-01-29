/**
 * ==========================================
 * MediMart - Authentication Page
 * ==========================================
 * Handles login page functionality
 */

// Initialize database
const db = new Database();

// Note: Removed auto-redirect check to allow direct access to main app

// Form submission handler
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Validation
    if (!username) {
        showError('Username tidak boleh kosong');
        return;
    }

    if (!password) {
        showError('Password tidak boleh kosong');
        return;
    }

    // Show loading state
    const loginBtn = document.querySelector('.btn-login');
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;

    // Simulate login process
    setTimeout(() => {
        // Authenticate user
        const result = db.login(username, password);

        if (result.success) {
            // Save remember me preference
            if (rememberMe) {
                localStorage.setItem('medimart_remember', 'true');
            }

            // Show success message
            showSuccess(`Selamat datang, ${result.user.name}! 🎉`);

            // Redirect to main app
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            // Show error message
            showError(result.message);

            // Remove loading state
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
        }
    }, 800); // Simulate network delay
});

/**
 * Handle Role Selection (Demo Feature)
 * @param {string} role - Selected role 'customer', 'seller', 'admin'
 */
function selectRole(role) {
    // 1. Update active tab
    const tabs = document.querySelectorAll('.role-tab');
    tabs.forEach(tab => {
        // Reset styles first
        tab.classList.remove('active');
        tab.style.background = 'transparent';
        tab.style.color = '#6b7280';
        tab.style.boxShadow = 'none';

        if (tab.getAttribute('onclick').includes(`'${role}'`)) {
            tab.classList.add('active');
            tab.style.background = 'white';
            tab.style.color = 'var(--primary)';
            tab.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
        }
    });

    // 2. Auto-fill Creds
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    if (role === 'admin') {
        usernameInput.value = 'admin';
        passwordInput.value = 'admin123';
    } else if (role === 'seller') {
        usernameInput.value = 'seller1';
        passwordInput.value = 'seller123';
    } else {
        usernameInput.value = 'user';
        passwordInput.value = 'user123';
    }
}

// Default role selection on load
document.addEventListener('DOMContentLoaded', () => {
    selectRole('customer');
});

/**
 * Toggle password visibility
 */
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleIcon.textContent = '👁️';
    }
}

/**
 * Continue as guest (browse without login)
 */
function continueAsGuest() {
    // Clear any existing user data
    localStorage.removeItem('medimart_current_user');

    // Set Guest Mode Flag (valid for this session only)
    sessionStorage.setItem('medimart_guest_mode', 'true');

    // Redirect to main app
    window.location.href = 'index.html';
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
    // Create toast notification
    const toast = createToast(message, 'error');
    document.body.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * Show success message
 * @param {string} message - Success message
 */
function showSuccess(message) {
    // Create toast notification
    const toast = createToast(message, 'success');
    document.body.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * Create toast notification element
 * @param {string} message - Message text
 * @param {string} type - Type: error or success
 * @returns {HTMLElement} Toast element
 */
function createToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        padding: 16px 24px;
        background: ${type === 'error' ? '#ef4444' : '#10b981'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        font-weight: 600;
        font-size: 14px;
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
        max-width: 350px;
    `;

    const icon = type === 'error' ? '❌' : '✅';
    toast.innerHTML = `<span style="margin-right: 8px;">${icon}</span>${message}`;

    return toast;
}

// Add animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);

// Handle "forgot password" link
document.querySelector('.forgot-password')?.addEventListener('click', function (e) {
    e.preventDefault();
    alert('Fitur lupa password akan segera hadir! 🔐\nUntuk demo ini, silakan gunakan username dan password apa saja.');
});

// Handle "register" link - Now handled by inline onclick, but adding cleaner listener just in case
// document.querySelector('.link-register')...

/**
 * Toggle between Login and Register views
 */
function toggleAuthMode() {
    const loginView = document.getElementById('loginView');
    const registerView = document.getElementById('registerView');

    if (loginView.style.display === 'none') {
        // Switch to Login
        loginView.style.display = 'block';
        registerView.style.display = 'none';
    } else {
        // Switch to Register
        loginView.style.display = 'none';
        registerView.style.display = 'block';
    }
}

// Handle Register Form Submission
document.getElementById('registerForm')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const role = document.querySelector('input[name="regRole"]:checked').value;
    const name = document.getElementById('regName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;

    if (!name || !username || !email || !password) {
        showError('Mohon lengkapi semua data ⚠️');
        return;
    }

    const userData = { role, name, username, email, password };

    // Call database register
    const result = db.register(userData);

    if (result.success) {
        showSuccess(`Registrasi Berhasil! Selamat datang, ${name} 🎉`);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        showError(result.message);
    }
});

// Add enter key support for password field
document.getElementById('password').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
});

// Log to console
console.log('%c MediMart Login ', 'background: #00B09B; color: white; font-size: 16px; font-weight: bold; padding: 10px;');
console.log('%c Demo Accounts ', 'background: #FF6B35; color: white; font-size: 12px; padding: 5px;');
console.log('Admin    → username: admin    | password: admin123');
console.log('Seller   → username: seller1  | password: seller123');
console.log('Customer → username: user     | password: user123');
