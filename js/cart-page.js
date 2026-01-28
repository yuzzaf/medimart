/**
 * ==========================================
 * MediMart - Cart Page
 * ==========================================
 * Handles cart page functionality
 */

// Initialize
const db = new Database();
let currentCart = [];

// Load cart on page load
document.addEventListener('DOMContentLoaded', function () {
    updateAuthUI();

    if (!db.isLoggedIn()) {
        renderGuestLockScreen();
    } else {
        loadCart();
        loadRecommendedProducts();
    }
});


function renderGuestLockScreen() {
    const container = document.querySelector('.cart-page-container');
    if (container) {
        container.innerHTML = `
            <div class="cart-content">
                <div class="dashboard-header" style="margin-bottom: 32px;">
                    <h1>Keranjang Belanja</h1>
                    <p>Selesaikan pesanan obat Anda</p>
                </div>
                
                <div style="
                    max-width: 600px; 
                    margin: 0 auto; 
                    text-align: center; 
                    padding: 60px 32px; 
                    background: white; 
                    border-radius: 20px; 
                    box-shadow: var(--shadow-md);
                ">
                    <div style="font-size: 80px; margin-bottom: 24px;">🔐</div>
                    <h2 style="font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 700; margin-bottom: 12px; color: #1a1a1a;">
                        Login Diperlukan
                    </h2>
                    <p style="color: #6b7280; margin-bottom: 32px; font-size: 16px; line-height: 1.6;">
                        Silakan login untuk melihat keranjang belanja Anda dan melanjutkan ke pembayaran.
                    </p>
                    
                    <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
                        <a href="login.html" class="btn-primary" style="
                            display: inline-flex; 
                            text-decoration: none; 
                            padding: 12px 32px;
                            border-radius: 12px;
                            font-size: 16px;
                        ">
                            Login Sekarang
                        </a>
                        <a href="index.html" class="btn-secondary" style="
                            display: inline-flex; 
                            text-decoration: none;
                            padding: 12px 32px;
                            border-radius: 12px;
                            font-size: 16px;
                            justify-content: center;
                        ">
                            Kembali ke Beranda
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Update authentication UI
 */
function updateAuthUI() {
    const user = db.getCurrentUser();
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');

    if (user) {
        authButtons.classList.add('hidden');
        userMenu.classList.remove('hidden');

        // Display user's full name
        if (userName) userName.textContent = user.name || user.username;
        if (userAvatar) {
            const initials = user.name
                ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                : user.username.charAt(0).toUpperCase();
            userAvatar.textContent = initials;
        }
    } else {
        authButtons.classList.remove('hidden');
        userMenu.classList.add('hidden');
    }
}

/**
 * Logout function
 */
function logout() {
    if (confirm('Yakin ingin logout?')) {
        db.logout();
        alert('Logout berhasil. Sampai jumpa! 👋');
        window.location.href = 'login.html';
    }
}

/**
 * Load and render cart
 */
function loadCart() {
    currentCart = db.getCart();
    updateCartBadge();
    renderCart();
    updateSummary();
}

/**
 * Update cart badge
 */
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const count = db.getCartItemCount();
    if (badge) {
        badge.textContent = count;
    }
}

/**
 * Render cart items
 */
function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    const itemCount = document.getElementById('itemCount');
    const btnClear = document.getElementById('btnClear');

    if (!container) return;

    if (currentCart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart-state">
                <div class="empty-cart-icon">🛒</div>
                <h3>Keranjang Anda Kosong</h3>
                <p>Yuk mulai belanja dan temukan produk kesehatan terbaik untuk Anda!</p>
                <a href="index.html" class="btn-shop-now">
                    <span>🏪</span>
                    <span>Mulai Belanja</span>
                </a>
            </div>
        `;

        if (itemCount) itemCount.textContent = '0';
        if (btnClear) btnClear.style.display = 'none';
        return;
    }

    if (itemCount) itemCount.textContent = currentCart.length;
    if (btnClear) btnClear.style.display = 'flex';

    container.innerHTML = currentCart.map(item => {
        const { product, quantity } = item;
        if (!product) return '';

        const subtotal = product.price * quantity;
        const maxQty = Math.min(product.stock, 99);

        return `
            <div class="cart-page-item" data-product-id="${product.id}">
                <div class="cart-item-img">${product.icon}</div>
                
                <div class="cart-item-details">
                    <div class="cart-item-category">${Utils.sanitizeHTML(product.category)}</div>
                    <div class="cart-item-name">${Utils.sanitizeHTML(product.name)}</div>
                    <div class="cart-item-price">${Utils.formatPrice(product.price)}</div>
                    <div class="cart-item-stock">Stok tersedia: ${product.stock}</div>
                </div>

                <div class="cart-item-actions">
                    <div class="cart-qty-control">
                        <button class="qty-btn-page" onclick="updateQuantity(${product.id}, -1)" ${quantity <= 1 ? 'disabled' : ''}>
                            −
                        </button>
                        <span class="qty-value-page">${quantity}</span>
                        <button class="qty-btn-page" onclick="updateQuantity(${product.id}, 1)" ${quantity >= maxQty ? 'disabled' : ''}>
                            +
                        </button>
                    </div>
                    
                    <div class="cart-item-subtotal">
                        Subtotal
                        <strong>${Utils.formatPrice(subtotal)}</strong>
                    </div>
                    
                    <button class="btn-remove-item" onclick="removeItem(${product.id})">
                        <span>🗑️</span>
                        <span>Hapus</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ... (previous code)

/**
 * Update item quantity
 */
function updateQuantity(productId, delta) {
    const cart = db.getCart();
    const item = cart.find(i => i.productId === productId);

    if (!item) return;

    const newQty = item.quantity + delta;

    if (db.updateCartQuantity(productId, newQty)) {
        loadCart();
    } else {
        if (newQty > item.quantity) {
            Utils.notify('Stok tidak mencukupi', 'error');
        }
    }
}

/**
 * Remove item from cart
 * No confirmation needed for better UX
 */
function removeItem(productId) {
    db.updateCartQuantity(productId, 0);
    loadCart();
    Utils.notify('Produk dihapus dari keranjang');
}

/**
 * Clear entire cart
 * No confirmation needed
 */
function clearCart() {
    db.clearCart();
    loadCart();
    Utils.notify('Keranjang dikosongkan');
}

/**
 * Update order summary
 */
function updateSummary() {
    const cart = db.getCart();
    const subtotal = db.getCartTotal();
    const itemCount = db.getCartItemCount();
    const shipping = 0; // Free shipping
    const discount = 0;
    const total = subtotal - discount + shipping;

    // Update summary elements
    const summaryItemCount = document.getElementById('summaryItemCount');
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const discountEl = document.getElementById('discount');
    const totalEl = document.getElementById('total');
    const btnCheckout = document.getElementById('btnCheckout');

    if (summaryItemCount) summaryItemCount.textContent = itemCount;
    if (subtotalEl) subtotalEl.textContent = Utils.formatPrice(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'GRATIS' : Utils.formatPrice(shipping);
    if (discountEl) discountEl.textContent = discount === 0 ? 'Rp 0' : '- ' + Utils.formatPrice(discount);
    if (totalEl) totalEl.textContent = Utils.formatPrice(total);

    if (btnCheckout) {
        btnCheckout.disabled = cart.length === 0;
    }
}

/**
 * Apply promo code
 */
function applyPromo() {
    const promoInput = document.getElementById('promoCode');
    const code = promoInput.value.trim().toUpperCase();

    if (!code) {
        Utils.notify('Masukkan kode promo terlebih dahulu', 'error');
        return;
    }

    // Demo promo codes
    const promoCodes = {
        'SEHAT10': { discount: 0.1, message: 'Diskon 10%' },
        'MEDIFREE': { discount: 0, shipping: true, message: 'Gratis Ongkir' },
        'WELCOME': { discount: 15000, message: 'Diskon Rp 15.000' }
    };

    if (promoCodes[code]) {
        Utils.notify(`Kode promo berhasil dipakai! ${promoCodes[code].message} 🎉`, 'success');
        promoInput.value = '';
    } else {
        Utils.notify('Kode promo tidak valid', 'error');
    }
}

/**
 * Redirect to checkout page
 */
function checkout() {
    const cart = db.getCart();

    if (cart.length === 0) {
        Utils.notify('Keranjang Anda masih kosong', 'error');
        return;
    }

    Utils.notify('Menuju pembayaran...', 'success');
    setTimeout(() => {
        window.location.href = 'checkout.html';
    }, 500);
}

/**
 * Load recommended products
 */
function loadRecommendedProducts() {
    const container = document.getElementById('recommendedProducts');
    if (!container) return;

    const allProducts = db.getProducts();
    const cartProductIds = currentCart.map(item => item.productId);

    // Get products not in cart
    const recommended = allProducts
        .filter(p => !cartProductIds.includes(p.id) && p.stock > 0)
        .slice(0, 4);

    if (recommended.length === 0) {
        container.innerHTML = '<p style="color: var(--text-gray);">Tidak ada rekomendasi saat ini</p>';
        return;
    }

    container.innerHTML = recommended.map(product => `
        <div class="product-card" onclick="addRecommendedToCart(${product.id})">
            <div class="product-image" style="height: 150px; font-size: 48px;">
                ${product.icon}
            </div>
            <div class="product-info">
                <div class="product-category">${Utils.sanitizeHTML(product.category)}</div>
                <div class="product-name" style="font-size: 14px;">${Utils.sanitizeHTML(product.name)}</div>
                <div class="product-price" style="font-size: 16px;">${Utils.formatPrice(product.price)}</div>
                <div class="product-actions">
                    <button class="btn-small btn-cart" style="font-size: 12px;">
                        🛒 Tambah
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Add recommended product to cart
 */
function addRecommendedToCart(productId) {
    const product = db.getProductById(productId);

    if (!product) return;

    if (product.stock === 0) {
        Utils.notify('Maaf, produk ini sedang habis', 'error');
        return;
    }

    if (db.addToCart(productId, 1)) {
        Utils.notify(`${product.name} ditambahkan ke keranjang! 🛒`, 'success');
        loadCart();
        loadRecommendedProducts();
    } else {
        Utils.notify('Gagal menambahkan ke keranjang. Stok tidak mencukupi.', 'error');
    }
}

// Log
console.log('%c MediMart Cart Page ', 'background: #00B09B; color: white; font-size: 16px; font-weight: bold; padding: 10px;');

/**
 * Search products (Redirect to Marketplace)
 */
function searchProducts(event) {
    // If triggered by keyup, only proceed on Enter
    if (event.type === 'keyup' && event.key !== 'Enter') {
        return;
    }

    const input = document.getElementById('searchInput');
    if (!input) return;

    const query = input.value.trim();
    if (query) {
        // Redirect to marketplace with search query
        window.location.href = `index.html?search=${encodeURIComponent(query)}`;
    }
}
