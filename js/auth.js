/**
 * ==========================================
 * MediMart - Authentication Page
 * ==========================================
 * Handles login page functionality
 */

// Initialize database
const db = new (function() {
    // Minimal database class for login page
    this.KEYS = {
        USERS: 'medimart_users',
        CURRENT_USER: 'medimart_current_user'
    };

    this.load = function(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return null;
        }
    };

    this.save = function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
        }
    };

    this.getDefaultUsers = function() {
        return [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                name: 'Administrator',
                email: 'admin@medimart.com',
                role: 'admin'
            },
            {
                id: 2,
                username: 'seller1',
                password: 'seller123',
                name: 'Apotek Sehat',
                email: 'seller1@medimart.com',
                role: 'seller'
            },
            {
                id: 3,
                username: 'user',
                password: 'user123',
                name: 'John Doe',
                email: 'user@medimart.com',
                role: 'customer'
            }
        ];
    };

    // Initialize users if not exists
    this.users = this.load(this.KEYS.USERS) || this.getDefaultUsers();
    if (!this.load(this.KEYS.USERS)) {
        this.save(this.KEYS.USERS, this.users);
    }

    this.authenticate = function(username, password) {
        return this.users.find(u => 
            (u.username === username || u.email === username) && u.password === password
        );
    };

    this.login = function(username, password) {
        const user = this.authenticate(username, password);
        
        if (user) {
            const userData = {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role
            };
            this.save(this.KEYS.CURRENT_USER, userData);
            return { success: true, user: userData };
        }
        
        return { success: false, message: 'Username atau password salah' };
    };
})();

// Note: Removed auto-redirect check to allow direct access to main app

// Form submission handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
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
document.querySelector('.forgot-password')?.addEventListener('click', function(e) {
    e.preventDefault();
    alert('Fitur lupa password akan segera hadir! 🔐\nUntuk demo ini, silakan gunakan username dan password apa saja.');
});

// Handle "register" link
document.querySelector('.link-register')?.addEventListener('click', function(e) {
    e.preventDefault();
    alert('Fitur registrasi akan segera hadir! 📝\nUntuk demo ini, silakan langsung login dengan username dan password apa saja.');
});

// Add enter key support for password field
document.getElementById('password').addEventListener('keypress', function(e) {
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
