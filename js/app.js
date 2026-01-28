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
        
        // Initial UI update
        this.ui.updateAuthUI();
        this.ui.renderDashboard();  // Show dashboard first
        this.ui.renderMarketplace(); // Pre-render marketplace
        this.ui.updateCartBadge();

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
            if (confirm(`${product.name} ditambahkan ke keranjang! 🛒\n\nLihat keranjang sekarang?`)) {
                window.location.href = 'cart.html';
            } else {
                this.ui.updateCartBadge();
            }
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
     * Search products
     */
    searchProducts() {
        this.debouncedSearch();
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
