/**
 * ==========================================
 * MediMart - UI Layer
 * ==========================================
 * Handles all UI rendering and DOM manipulation
 */

class UI {
    constructor(database) {
        this.db = database;
        this.editingProductId = null;
    }

    // ==========================================
    // UI State Management
    // ==========================================

    /**
     * Update UI based on authentication state
     */
    updateAuthUI() {
        const user = this.db.getCurrentUser();
        const authButtons = Utils.$('authButtons');
        const userMenu = Utils.$('userMenu');
        const userName = Utils.$('userName');
        const userAvatar = Utils.$('userAvatar');

        if (user) {
            Utils.addClass(authButtons, 'hidden');
            Utils.removeClass(userMenu, 'hidden');
            
            // Display user's full name instead of username
            if (userName) userName.textContent = user.name || user.username;
            if (userAvatar) {
                const initials = user.name 
                    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                    : user.username.charAt(0).toUpperCase();
                userAvatar.textContent = initials;
            }
        } else {
            Utils.removeClass(authButtons, 'hidden');
            Utils.addClass(userMenu, 'hidden');
        }
    }

    /**
     * Update cart badge count
     */
    updateCartBadge() {
        const badge = Utils.$('cartBadge');
        if (badge) {
            badge.textContent = this.db.getCartItemCount();
        }
    }

    /**
     * Show marketplace view
     */
    showMarketplace() {
        Utils.removeClass(Utils.$('marketplaceView'), 'hidden');
        Utils.addClass(Utils.$('dashboardView'), 'hidden');
        Utils.addClass(Utils.$('tabMarketplace'), 'active');
        Utils.removeClass(Utils.$('tabDashboard'), 'active');
        this.renderMarketplace();
    }

    /**
     * Show dashboard view
     */
    showDashboard() {
        Utils.addClass(Utils.$('marketplaceView'), 'hidden');
        Utils.removeClass(Utils.$('dashboardView'), 'hidden');
        Utils.removeClass(Utils.$('tabMarketplace'), 'active');
        Utils.addClass(Utils.$('tabDashboard'), 'active');
        this.renderDashboard();
    }

    // ==========================================
    // Product Rendering
    // ==========================================

    /**
     * Render marketplace products
     */
    renderMarketplace() {
        const container = Utils.$('marketplaceProducts');
        const products = this.db.getProducts();

        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = this.renderEmptyState('📦', 'Belum ada produk');
            return;
        }

        container.innerHTML = products.map(product => 
            this.renderProductCard(product, 'marketplace')
        ).join('');
    }

    /**
     * Render dashboard products
     */
    renderDashboard() {
        const container = Utils.$('dashboardProducts');
        if (!container) return;

        // Check if user is logged in
        if (!this.db.isLoggedIn()) {
            // Show guest message with login prompt
            const dashboardView = Utils.$('dashboardView');
            if (dashboardView) {
                dashboardView.innerHTML = `
                    <div class="dashboard-header">
                        <h1>Dashboard Toko</h1>
                        <p>Kelola produk obat Anda dengan mudah</p>
                    </div>
                    <div style="text-align: center; padding: 80px 20px;">
                        <div style="font-size: 80px; margin-bottom: 24px;">🔐</div>
                        <h2 style="font-size: 24px; margin-bottom: 12px; color: #1a1a1a;">Login untuk Mengelola Toko</h2>
                        <p style="color: #6b7280; margin-bottom: 32px; font-size: 16px;">
                            Silakan login untuk menambah, mengedit, dan menghapus produk Anda
                        </p>
                        <a href="login.html" style="
                            display: inline-flex;
                            align-items: center;
                            gap: 8px;
                            padding: 14px 32px;
                            background: linear-gradient(135deg, #00B09B, #009684);
                            color: white;
                            text-decoration: none;
                            border-radius: 12px;
                            font-weight: 700;
                            font-size: 16px;
                            box-shadow: 0 4px 12px rgba(0, 176, 155, 0.3);
                            transition: all 0.3s;
                        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                            <span>🔑</span>
                            <span>Login Sekarang</span>
                        </a>
                    </div>
                `;
            }
            return;
        }

        // User is logged in, show dashboard
        const products = this.db.getUserProducts();
        const stats = this.db.getUserStats();
        const currentUser = this.db.getCurrentUser();

        // Reset dashboard view if it was showing guest message
        const dashboardView = Utils.$('dashboardView');
        if (dashboardView && !dashboardView.querySelector('.dashboard-header + .section-header')) {
            dashboardView.innerHTML = `
                <div class="dashboard-header">
                    <h1>Dashboard Toko ${currentUser ? currentUser.name : 'Saya'}</h1>
                    <p>Kelola produk obat Anda dengan mudah</p>
                    <div class="dashboard-stats">
                        <div class="stat-card">
                            <div class="stat-value" id="totalProducts">0</div>
                            <div class="stat-label">Total Produk</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="totalStock">0</div>
                            <div class="stat-label">Total Stok</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="totalValue">Rp 0</div>
                            <div class="stat-label">Nilai Inventory</div>
                        </div>
                    </div>
                </div>
                <div class="section-header">
                    <h2 class="section-title">Produk Saya</h2>
                    <button class="btn-primary" onclick="app.openProductModal()">
                        <span>➕</span>
                        Tambah Produk
                    </button>
                </div>
                <div class="products-grid" id="dashboardProducts"></div>
            `;
        }

        // Update stats
        const totalProducts = Utils.$('totalProducts');
        const totalStock = Utils.$('totalStock');
        const totalValue = Utils.$('totalValue');

        if (totalProducts) totalProducts.textContent = stats.totalProducts;
        if (totalStock) totalStock.textContent = stats.totalStock;
        if (totalValue) totalValue.textContent = Utils.formatPrice(stats.totalValue);

        // Render products
        const productsContainer = Utils.$('dashboardProducts');
        if (!productsContainer) return;

        if (products.length === 0) {
            productsContainer.innerHTML = this.renderEmptyState(
                '📦', 
                'Belum ada produk. Mulai tambah produk pertama Anda!'
            );
            return;
        }

        productsContainer.innerHTML = products.map(product => 
            this.renderProductCard(product, 'dashboard')
        ).join('');
    }

    /**
     * Render product card
     * @param {Object} product - Product data
     * @param {string} view - View type: marketplace or dashboard
     * @returns {string} HTML string
     */
    renderProductCard(product, view) {
        const isOutOfStock = product.stock === 0;
        const isLowStock = product.stock < 10 && product.stock > 0;

        const badge = isLowStock 
            ? '<span class="product-badge">Stok Terbatas</span>' 
            : (isOutOfStock ? '<span class="product-badge">Habis</span>' : '');

        const actions = view === 'dashboard' 
            ? `
                <button class="btn-small btn-edit" onclick="app.openProductModal(${product.id})">
                    ✏️ Edit
                </button>
                <button class="btn-small btn-delete" onclick="app.deleteProduct(${product.id})">
                    🗑️ Hapus
                </button>
            `
            : `
                <button class="btn-small btn-cart" 
                        onclick="app.addToCart(${product.id})" 
                        ${isOutOfStock ? 'disabled' : ''}>
                    🛒 ${isOutOfStock ? 'Habis' : 'Tambah'}
                </button>
            `;

        return `
            <div class="product-card">
                <div class="product-image">
                    ${product.icon}
                    ${badge}
                </div>
                <div class="product-info">
                    <div class="product-category">${Utils.sanitizeHTML(product.category)}</div>
                    <div class="product-name">${Utils.sanitizeHTML(product.name)}</div>
                    <div class="product-price">${Utils.formatPrice(product.price)}</div>
                    <div class="product-stock">Stok: ${product.stock}</div>
                    <div class="product-actions">
                        ${actions}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render empty state
     * @param {string} icon - Icon emoji
     * @param {string} text - Message text
     * @returns {string} HTML string
     */
    renderEmptyState(icon, text) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">${icon}</div>
                <div class="empty-state-text">${Utils.sanitizeHTML(text)}</div>
            </div>
        `;
    }

    // ==========================================
    // Modal Management
    // ==========================================

    /**
     * Open product modal
     * @param {number|null} productId - Product ID for editing, null for new
     */
    openProductModal(productId = null) {
        const modal = Utils.$('productModal');
        const title = Utils.$('productModalTitle');
        
        if (productId) {
            this.editingProductId = productId;
            const product = this.db.getProductById(productId);
            
            if (product) {
                if (title) title.textContent = '✏️ Edit Produk';
                this.fillProductForm(product);
            }
        } else {
            this.editingProductId = null;
            if (title) title.textContent = '➕ Tambah Produk Baru';
            this.resetProductForm();
        }

        if (modal) modal.style.display = 'flex';
    }

    /**
     * Close product modal
     */
    closeProductModal() {
        const modal = Utils.$('productModal');
        if (modal) modal.style.display = 'none';
        
        this.editingProductId = null;
        this.resetProductForm();
    }

    /**
     * Fill product form with data
     * @param {Object} product - Product data
     */
    fillProductForm(product) {
        const fields = {
            'productName': product.name,
            'productCategory': product.category,
            'productDescription': product.description,
            'productPrice': product.price,
            'productStock': product.stock
        };

        Object.keys(fields).forEach(id => {
            const element = Utils.$(id);
            if (element) element.value = fields[id];
        });
    }

    /**
     * Reset product form
     */
    resetProductForm() {
        const fieldIds = [
            'productName', 
            'productCategory', 
            'productDescription', 
            'productPrice', 
            'productStock'
        ];

        fieldIds.forEach(id => {
            const element = Utils.$(id);
            if (element) element.value = '';
        });
    }

    /**
     * Get product form data
     * @returns {Object} Form data
     */
    getProductFormData() {
        return {
            name: Utils.$('productName')?.value || '',
            category: Utils.$('productCategory')?.value || '',
            description: Utils.$('productDescription')?.value || '',
            price: parseInt(Utils.$('productPrice')?.value || 0),
            stock: parseInt(Utils.$('productStock')?.value || 0),
            icon: Utils.getIconForCategory(Utils.$('productCategory')?.value || '')
        };
    }

    // ==========================================
    // Search
    // ==========================================

    /**
     * Search and render products
     */
    searchProducts() {
        const searchInput = Utils.$('searchInput');
        if (!searchInput) return;

        const query = searchInput.value.toLowerCase();
        const container = Utils.$('marketplaceProducts');
        
        if (!container) return;

        if (query.trim() === '') {
            this.renderMarketplace();
            return;
        }

        const products = this.db.searchProducts(query);

        if (products.length === 0) {
            container.innerHTML = this.renderEmptyState('🔍', 'Produk tidak ditemukan');
            return;
        }

        container.innerHTML = products.map(product => 
            this.renderProductCard(product, 'marketplace')
        ).join('');
    }
}
