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
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    loadCart();
    loadRecommendedProducts();
});

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
            alert('Stok tidak mencukupi');
        }
    }
}

/**
 * Remove item from cart
 */
function removeItem(productId) {
    const product = db.getProductById(productId);
    
    if (confirm(`Hapus ${product.name} dari keranjang?`)) {
        db.updateCartQuantity(productId, 0);
        loadCart();
        
        // Show toast notification
        showToast('Produk berhasil dihapus dari keranjang', 'success');
    }
}

/**
 * Clear entire cart
 */
function clearCart() {
    if (confirm('Kosongkan semua item di keranjang?')) {
        db.clearCart();
        loadCart();
        showToast('Keranjang berhasil dikosongkan', 'success');
    }
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
        alert('Masukkan kode promo terlebih dahulu');
        return;
    }

    // Demo promo codes
    const promoCodes = {
        'SEHAT10': { discount: 0.1, message: 'Diskon 10%' },
        'MEDIFREE': { discount: 0, shipping: true, message: 'Gratis Ongkir' },
        'WELCOME': { discount: 15000, message: 'Diskon Rp 15.000' }
    };

    if (promoCodes[code]) {
        showToast(`Kode promo berhasil dipakai! ${promoCodes[code].message} 🎉`, 'success');
        promoInput.value = '';
    } else {
        showToast('Kode promo tidak valid', 'error');
    }
}

/**
 * Process checkout
 */
function checkout() {
    const cart = db.getCart();
    
    if (cart.length === 0) {
        alert('Keranjang Anda masih kosong');
        return;
    }

    const result = db.checkout();
    
    if (result.success) {
        // Show success modal
        showSuccessModal(result);
        loadCart();
    } else {
        alert('Checkout gagal. Silakan coba lagi.');
    }
}

/**
 * Show success modal
 */
function showSuccessModal(result) {
    const modal = document.getElementById('successModal');
    const successMessage = document.getElementById('successMessage');
    const successTotal = document.getElementById('successTotal');
    const successItems = document.getElementById('successItems');

    if (successMessage) {
        successMessage.textContent = `Pesanan Anda telah kami terima dan sedang diproses. Terima kasih telah berbelanja di MediMart!`;
    }
    
    if (successTotal) {
        successTotal.textContent = Utils.formatPrice(result.total);
    }
    
    if (successItems) {
        successItems.textContent = `${result.items.length} item`;
    }

    if (modal) {
        modal.style.display = 'flex';
    }
}

/**
 * Close success modal
 */
function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
    }
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
        alert('Maaf, produk ini sedang habis');
        return;
    }

    if (db.addToCart(productId, 1)) {
        showToast(`${product.name} ditambahkan ke keranjang! 🛒`, 'success');
        loadCart();
        loadRecommendedProducts();
    } else {
        alert('Gagal menambahkan ke keranjang. Stok tidak mencukupi.');
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 24px;
        padding: 16px 24px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        font-weight: 600;
        font-size: 14px;
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
        max-width: 350px;
    `;
    
    const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    toast.innerHTML = `<span style="margin-right: 8px;">${icon}</span>${message}`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animation styles
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
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// Log
console.log('%c MediMart Cart Page ', 'background: #00B09B; color: white; font-size: 16px; font-weight: bold; padding: 10px;');
