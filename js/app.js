/**
 * ==========================================
 * MediMart - Main Application Controller
 * ==========================================
 * Coordinates between Database and UI layers
 * Entry point for all user interactions
 */

class App {
    constructor() {
        this.db = new Database();
        this.ui = new UI(this.db);
        this.init();
    }

    /**
     * Initialize application
     */
    init() {
        console.log('🚀 MediMart Application Started');

        const user = this.db.getCurrentUser();

        // Initial UI update
        this.ui.updateAuthUI();
        this.ui.updateCartBadge();

        // Role-Based Landing Page & URL Routing
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');

        if (user) {
            // Logged in
            if (tab === 'dashboard' || user.role === 'admin' || user.role === 'seller') {
                this.ui.showDashboard();
            } else {
                this.ui.renderMarketplace();
                this.ui.showMarketplace();

                // Check for search query
                const searchQuery = urlParams.get('search');
                if (searchQuery) {
                    const searchInput = document.getElementById('searchInput');
                    if (searchInput) {
                        searchInput.value = searchQuery;
                        this.ui.searchProducts();
                    }
                }
            }
        } else {
            // Guest Mode Logic
            const isGuestMode = sessionStorage.getItem('medimart_guest_mode') === 'true';

            if (isGuestMode) {
                // Guest Access Allowed
                if (tab === 'dashboard') {
                    // Allow guest to see "Login Required" dashboard
                    this.ui.showDashboard();
                } else {
                    this.ui.renderMarketplace();
                    this.ui.showMarketplace();
                }
            } else {
                // No Guest Flag -> Force Login
                window.location.href = 'login.html';
            }
        }

        // Setup debounced search
        this.debouncedSearch = Utils.debounce(() => {
            this.ui.searchProducts();
        }, 300);

        console.log('✅ Initialization Complete');
    }

    // ==========================================
    // Authentication Methods
    // ==========================================

    /**
     * Handle logout
     */
    logout() {
        if (Utils.confirm('Yakin ingin logout?')) {
            this.db.logout();
            Utils.notify('Logout berhasil. Sampai jumpa! 👋');
            // Redirect to login page
            window.location.href = 'login.html';
        }
    }

    // ==========================================
    // Product CRUD Methods
    // ==========================================

    /**
     * Open product modal for add/edit
     * @param {number|null} productId - Product ID for editing
     */
    openProductModal(productId = null) {
        this.ui.openProductModal(productId);
    }

    /**
     * Close product modal
     */
    closeProductModal() {
        this.ui.closeProductModal();
    }

    /**
     * Save product (create or update)
     * @param {Event} event - Form submit event
     */
    saveProduct(event) {
        event.preventDefault();

        const productData = this.ui.getProductFormData();

        // Validate
        const validation = Utils.validateProduct(productData);
        if (!validation.isValid) {
            Utils.notify('Error:\n' + validation.errors.join('\n'));
            return;
        }

        // Save or update
        if (this.ui.editingProductId) {
            if (this.db.updateProduct(this.ui.editingProductId, productData)) {
                Utils.notify('Produk berhasil diupdate! ✅');
            } else {
                Utils.notify('Gagal mengupdate produk');
                return;
            }
        } else {
            this.db.addProduct(productData);
            Utils.notify('Produk baru berhasil ditambahkan! 🎉');
        }

        this.ui.closeProductModal();
        this.ui.renderDashboard();
        this.ui.renderMarketplace();
    }

    /**
     * Delete product
     * @param {number} productId - Product ID
     */
    deleteProduct(productId) {
        if (!Utils.confirm('Yakin ingin menghapus produk ini?')) {
            return;
        }

        if (this.db.deleteProduct(productId)) {
            Utils.notify('Produk berhasil dihapus! 🗑️');
            this.ui.renderDashboard();
            this.ui.renderMarketplace();
        } else {
            Utils.notify('Gagal menghapus produk');
        }
    }

    // ==========================================
    // Shopping Cart Methods
    // ==========================================

    /**
     * Add product to cart
     * @param {number} productId - Product ID
     */
    addToCart(productId) {
        // Guest Check
        if (!this.db.isLoggedIn()) {
            Utils.notify('Silakan login untuk mulai berbelanja 🔐', 'info');
            return;
        }

        const product = this.db.getProductById(productId);

        if (!product) {
            Utils.notify('Produk tidak ditemukan');
            return;
        }

        if (product.stock === 0) {
            Utils.notify('Maaf, produk ini sedang habis');
            return;
        }

        if (this.db.addToCart(productId, 1)) {
            this.ui.updateCartBadge();
            Utils.notify(`${product.name} ditambahkan ke keranjang! 🛒`);
        } else {
            Utils.notify('Gagal menambahkan ke keranjang. Stok tidak mencukupi.');
        }
    }

    // ==========================================
    // View Navigation Methods
    // ==========================================

    /**
     * Show marketplace view
     */
    showMarketplace() {
        this.ui.showMarketplace();
    }

    /**
     * Show dashboard view
     */
    showDashboard() {
        this.ui.showDashboard();
    }

    /**
     * Filter products by category
     * @param {string} category - Category name or 'all'
     */
    filterProducts(category) {
        this.ui.renderMarketplace(category);

        // Update active filter button state
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => {
            const btnText = btn.innerText;
            const isActive =
                (category === 'all' && btnText.includes('Semua')) ||
                (category === 'Alat Kesehatan' && btnText.includes('Alkes')) ||
                btnText.includes(category);

            if (isActive) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * Cancel Order
     * @param {string} orderId 
     */
    cancelOrder(orderId) {
        if (!Utils.confirm('Yakin ingin membatalkan pesanan ini? Stok akan dikembalikan.')) return;

        if (this.db.cancelOrder(orderId)) {
            Utils.notify('Pesanan berhasil dibatalkan');
            this.ui.renderDashboard(); // Refresh
        } else {
            Utils.notify('Gagal membatalkan pesanan');
        }
    }

    /**
     * Delete Order from History
     * @param {string} orderId 
     */
    deleteOrder(orderId) {
        if (!Utils.confirm('Hapus riwayat pesanan ini?')) return;

        if (this.db.deleteOrder(orderId)) {
            Utils.notify('Riwayat pesanan dihapus');
            this.ui.renderDashboard(); // Refresh
        }
    }
    /**
     * Switch Store Dashboard Tab
     * @param {string} tabName - 'products', 'users', 'settings'
     */
    switchStoreTab(tabName) {
        this.ui.currentStoreTab = tabName;
        this.ui.renderDashboard();
    }

    /**
     * Search marketplace products
     */
    searchProducts() {
        this.debouncedSearch();
    }

    /**
     * Search Store Products
     */
    searchStoreProducts() {
        const input = document.getElementById('storeSearchInput');
        this.ui.currentSearchQuery = input ? input.value : '';
        this.ui._renderStoreProductGrid(this.db.getCurrentUser());
    }

    /**
     * Search Customer Orders
     */
    searchCustomerOrders() {
        const input = document.getElementById('custSearchInput');
        this.ui.currentCustomerSearchQuery = input ? input.value : '';
        this.ui._renderCustomerDashboard(this.db.getCurrentUser());
    }

    /**
     * Filter Store Products
     */
    filterStoreProducts(category, btnElement) {
        this.ui.currentCategory = category;

        // Update visual active state
        document.querySelectorAll('.store-content .filter-btn').forEach(b => b.classList.remove('active'));
        if (btnElement) btnElement.classList.add('active');

        this.ui._renderStoreProductGrid(this.db.getCurrentUser());
    }

    /**
     * Toggle Product Scope (Admin Only)
     */
    toggleProductScope() {
        this.ui.showAllProducts = !this.ui.showAllProducts;
        this.ui.renderDashboard(); // Re-render to update toggle button text
    }

    /**
     * Reset Database (Dev Tool)
     */
    resetDatabase() {
        if (confirm('⚠️ PERINGATAN: Semua data (User, Produk, Order) akan dihapus dan di-reset ke default.\n\nLanjutkan?')) {
            localStorage.clear();
            location.reload();
        }
    }
}

// ==========================================
// Initialize Application
// ==========================================

// Global app instance
let app;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new App();
    });
} else {
    app = new App();
}

// Log app info
console.log('%c MediMart - Marketplace Obat Online ', 'background: #00B09B; color: white; font-size: 16px; font-weight: bold; padding: 10px;');
console.log('%c Clean Architecture Implementation ', 'background: #FF6B35; color: white; font-size: 12px; padding: 5px;');
console.log('📦 Database Layer: localStorage-based');
console.log('🎨 UI Layer: Vanilla JS rendering');
console.log('🎯 App Layer: MVC controller');
