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
        const cartBtn = document.querySelector('.cart-btn'); // Get cart button

        if (user) {
            // Logged In
            if (authButtons) Utils.addClass(authButtons, 'hidden');
            if (userMenu) Utils.removeClass(userMenu, 'hidden');
            if (userName) userName.textContent = user.name;
            if (userAvatar) userAvatar.textContent = user.name.charAt(0).toUpperCase();

            // Hide Cart & Marketplace for Admin/Seller
            const tabMarketplace = Utils.$('tabMarketplace');
            if (cartBtn) {
                if (user.role === 'admin' || user.role === 'seller') {
                    cartBtn.style.display = 'none';
                    if (tabMarketplace) tabMarketplace.style.display = 'none';
                } else {
                    cartBtn.style.display = 'flex';
                    if (tabMarketplace) tabMarketplace.style.display = 'flex'; // Restore for customer
                }
            }
        } else {
            if (authButtons) Utils.removeClass(authButtons, 'hidden');
            if (userMenu) Utils.addClass(userMenu, 'hidden');

            // Guest sees marketplace
            const tabMarketplace = Utils.$('tabMarketplace');
            if (tabMarketplace) tabMarketplace.style.display = 'flex';
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
        // Toggle Tabs
        Utils.addClass(Utils.$('tabMarketplace'), 'active');
        Utils.removeClass(Utils.$('tabDashboard'), 'active');

        // Show Marketplace
        Utils.removeClass(Utils.$('marketplaceView'), 'hidden');

        // Hide Dashboards
        Utils.addClass(Utils.$('storeDashboardView'), 'hidden');
        Utils.addClass(Utils.$('customerDashboardView'), 'hidden');
        Utils.addClass(Utils.$('dashboardView'), 'hidden'); // Legacy safety

        this.renderMarketplace();
    }

    /**
     * Show dashboard view
     */
    showDashboard() {
        // Toggle Tabs
        Utils.removeClass(Utils.$('tabMarketplace'), 'active');
        Utils.addClass(Utils.$('tabDashboard'), 'active');

        // Hide Marketplace
        Utils.addClass(Utils.$('marketplaceView'), 'hidden');

        // Note: We don't manually unhide a specific dashboard here 
        // because renderDashboard() decides which one to show based on role.
        this.renderDashboard();
    }

    // ==========================================
    // Product Rendering
    // ==========================================

    /**
     * Render marketplace products
     * @param {string} category - Category filter (default: 'all')
     */
    renderMarketplace(category = 'all') {
        const container = Utils.$('marketplaceProducts');
        let products = this.db.getProducts();

        if (!container) return;

        // Apply category filter
        if (category !== 'all') {
            products = products.filter(p => p.category === category);
        }

        if (products.length === 0) {
            container.innerHTML = this.renderEmptyState('📦', 'Belum ada produk untuk kategori ini');
            return;
        }

        container.innerHTML = products.map(product =>
            this.renderProductCard(product, 'marketplace')
        ).join('');
    }

    /**
     * Render dashboard view
     */
    renderDashboard() {
        const user = this.db.getCurrentUser();

        const storeView = Utils.$('storeDashboardView');
        const customerView = Utils.$('customerDashboardView');

        // Safety check
        if (!storeView && !customerView) {
            console.error('Eras error: Dashboard views not found in DOM');
            return;
        }

        // Reset visibility (Hide both first)
        if (storeView) Utils.addClass(storeView, 'hidden');
        if (customerView) Utils.addClass(customerView, 'hidden');

        // 1. Guest Check
        if (!user) {
            // Show Store View as default but with Guest Content
            if (storeView) {
                Utils.removeClass(storeView, 'hidden');
                storeView.innerHTML = this._renderGuestMessage();
            }
            return;
        }

        // 2. Customer View logic
        if (user.role === 'customer') {
            if (customerView) {
                Utils.removeClass(customerView, 'hidden');
                this._renderCustomerDashboard(user);
            }
        }
        // 3. Admin/Seller View logic
        else if (user.role === 'admin' || user.role === 'seller') {
            if (storeView) {
                Utils.removeClass(storeView, 'hidden');
                this._renderStoreDashboard(user);
            }
        }
    }

    _renderGuestMessage() {
        return `
            <div class="dashboard-header">
                <h1>Dashboard Toko</h1>
                <p>Kelola produk obat Anda dengan mudah</p>
            </div>
            <div style="text-align: center; padding: 80px 20px;">
                <div style="font-size: 80px; margin-bottom: 24px;">🔐</div>
                <h2 style="font-size: 24px; margin-bottom: 12px; color: #1a1a1a;">Login Diperlukan</h2>
                <p style="color: #6b7280; margin-bottom: 32px; font-size: 16px;">
                    Silakan login untuk mengakses Dashboard.
                </p>
                <a href="login.html" class="btn-primary" style="display: inline-flex; text-decoration: none;">
                    Login Sekarang
                </a>
            </div>
        `;
    }

    _renderCustomerDashboard(user) {
        // Update Greeting
        const greeting = Utils.$('customerGreeting');
        if (greeting) greeting.textContent = `Halo, ${user.name}! 👋`;

        // Get Stats
        const orders = this.db.getUserOrders();
        const activeOrders = orders.filter(o => o.status === 'success').length;
        const totalSpent = orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + o.total, 0);

        // Update Stat Cards (if elements exist)
        const elTotal = Utils.$('custTotalOrders');
        const elActive = Utils.$('custActiveOrders');
        const elSpent = Utils.$('custTotalSpent');

        if (elTotal) elTotal.textContent = orders.length;
        if (elActive) elActive.textContent = activeOrders;
        if (elSpent) elSpent.textContent = Utils.formatPrice(totalSpent);

        // Filter Orders if Search Query exists
        if (this.currentCustomerSearchQuery) {
            const query = this.currentCustomerSearchQuery.toLowerCase();
            orders = orders.filter(o =>
                o.id.toLowerCase().includes(query) ||
                o.items.some(i => i.productName.toLowerCase().includes(query))
            );
        }

        // Render Table
        const tbody = Utils.$('orderHistoryBody');
        if (tbody) {
            if (orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="padding: 24px; text-align: center;">Tidak ada pesanan yang cocok</td></tr>';
            } else {
                tbody.innerHTML = orders.map(order => this._renderOrderRow(order)).join('');
            }
        }
    }

    _renderStoreDashboard(user) {
        const storeView = Utils.$('storeDashboardView');
        if (!storeView) return;

        // Default Tab Logic
        if (!this.currentStoreTab) {
            this.currentStoreTab = (user.role === 'admin') ? 'sellers' : 'products';
        }

        // Render Dashboard Shell with Tabs
        storeView.innerHTML = `
            <div class="dashboard-header">
                <h1>Dashboard Toko ${user.name}</h1>
                <p>Kelola toko dan pantau aktivitas pengguna</p>
            </div>
            
            <div class="store-tabs">
                ${user.role === 'admin' ? `
                    <!-- Admin Tabs -->
                    <button class="store-tab ${this.currentStoreTab === 'sellers' ? 'active' : ''}" onclick="app.switchStoreTab('sellers')">👥 Monitoring Seller</button>
                    <button class="store-tab ${this.currentStoreTab === 'settings' ? 'active' : ''}" onclick="app.switchStoreTab('settings')">⚙️ Pengaturan</button>
                ` : `
                    <!-- Seller Tabs -->
                    <button class="store-tab ${this.currentStoreTab === 'products' ? 'active' : ''}" onclick="app.switchStoreTab('products')">📦 Produk</button>
                    <button class="store-tab ${this.currentStoreTab === 'users' ? 'active' : ''}" onclick="app.switchStoreTab('users')">👥 Pengguna</button>
                    <button class="store-tab ${this.currentStoreTab === 'settings' ? 'active' : ''}" onclick="app.switchStoreTab('settings')">⚙️ Pengaturan</button>
                `}
            </div>

            <div id="storeContent" class="store-content">
                <!-- Dynamic Content -->
            </div>
        `;

        this._renderStoreContent(user);
    }

    _renderStoreContent(user) {
        const container = Utils.$('storeContent');
        if (!container) return;

        if (this.currentStoreTab === 'products') {
            this._renderStoreProducts(user, container);
        } else if (this.currentStoreTab === 'users') {
            this._renderStoreUsers(user, container);
        } else if (this.currentStoreTab === 'settings') {
            this._renderStoreSettings(user, container);
        } else if (this.currentStoreTab === 'sellers') {
            this._renderAdminSellers(user, container);
        } else if (this.currentStoreTab.startsWith('seller_detail_')) {
            const sellerId = parseInt(this.currentStoreTab.split('seller_detail_')[1]);
            this._renderSellerMonitor(sellerId, container);
        }
    }

    _renderAdminSellers(user, container) {
        const sellers = this.db.getAllUsers().filter(u => u.role === 'seller');

        container.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">Daftar Seller</h2>
            </div>
            <div class="products-grid">
                ${sellers.length ? sellers.map(seller => `
                    <div class="product-card" style="padding: 24px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px;">
                        <div style="font-size: 48px;">🏪</div>
                        <div style="font-weight: 600; font-size: 18px;">${seller.name}</div>
                        <div style="color: grey;">@${seller.username}</div>
                        <button class="btn-primary" onclick="app.switchStoreTab('seller_detail_${seller.id}')">
                            👁️ Monitor
                        </button>
                    </div>
                `).join('') : '<p>Belum ada seller terdaftar.</p>'}
            </div>
        `;
    }

    _renderSellerMonitor(sellerId, container) {
        const seller = this.db.getAllUsers().find(u => u.id === sellerId);
        if (!seller) return;

        // Reuse User List Logic but specific to this seller's customers
        const customers = this.db.getCustomersBySeller(seller.username); // Assuming logic uses username matcher in DB

        container.innerHTML = `
            <div style="margin-bottom: 24px;">
                <button class="btn-secondary" onclick="app.switchStoreTab('sellers')">⬅️ Kembali</button>
            </div>
            <div class="dashboard-header">
                <h2>Monitoring: ${seller.name}</h2>
                <p>Status dan daftar pelanggan dari seller ini.</p>
            </div>
            
            <div class="section-header">
                 <h2 class="section-title">Pelanggan Toko Ini</h2>
            </div>
            <div class="table-container" style="background: white; padding: 20px; border-radius: 12px; box-shadow: var(--shadow-sm);">
                ${customers.length === 0 ? '<p style="text-align:center; padding: 20px;">Belum ada pelanggan.</p>' : `
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="text-align: left; border-bottom: 2px solid #f3f4f6;">
                            <th style="padding: 12px;">ID</th>
                            <th style="padding: 12px;">Nama</th>
                            <th style="padding: 12px;">Email</th>
                            <th style="padding: 12px;">Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customers.map(u => `
                            <tr style="border-bottom: 1px solid #f3f4f6;">
                                <td style="padding: 12px;">#${u.id}</td>
                                <td style="padding: 12px;">
                                    <div style="font-weight: 600;">${u.name}</div>
                                </td>
                                <td style="padding: 12px;">${u.email}</td>
                                <td style="padding: 12px;">Customer</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                `}
            </div>
        `;
    }

    _renderStoreProducts(user, container) {
        const stats = this.db.getUserStats();

        container.innerHTML = `
            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-value">${stats.totalProducts}</div>
                    <div class="stat-label">Total Produk</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.totalStock}</div>
                    <div class="stat-label">Total Stok</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${Utils.formatPrice(stats.totalValue)}</div>
                    <div class="stat-label">Nilai Aset</div>
                </div>
            </div>

            <div class="section-header" style="justify-content: space-between;">
                <h2 class="section-title">Produk Saya</h2>
                <div style="display: flex; gap: 12px;">
                    <input type="text" id="storeSearchInput" placeholder="Cari nama atau kategori..." 
                           style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; width: 250px;"
                           onkeyup="app.searchStoreProducts()">
                    
                    <button class="btn-primary" onclick="app.openProductModal()">
                        <span>➕</span> Tambah
                    </button>
                </div>
            </div>
            <div class="products-grid" id="dashboardProducts"></div>
        `;


        this._renderStoreProductGrid(user);
    }

    _renderStoreProductGrid(user) {
        const grid = document.getElementById('dashboardProducts');
        if (!grid) return;

        let products = this.db.getUserProducts();

        // Filter by Search Query
        if (this.currentSearchQuery) {
            const lowerQuery = this.currentSearchQuery.toLowerCase();
            products = products.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.category.toLowerCase().includes(lowerQuery)
            );
        }

        if (products.length === 0) {
            grid.innerHTML = this.renderEmptyState('📦', 'Belum ada produk.');
        } else {
            grid.innerHTML = products.map(p => this.renderProductCard(p, 'dashboard')).join('');
        }
    }

    _renderStoreUsers(user, container) {
        let users = this.db.getAllUsers();

        // Filter: Seller only sees Customers
        if (user.role === 'seller') {
            users = users.filter(u => u.role === 'customer');
        }

        container.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">Manajemen Pengguna</h2>
            </div >
            <div class="table-container" style="background: white; padding: 20px; border-radius: 12px; box-shadow: var(--shadow-sm);">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="text-align: left; border-bottom: 2px solid #f3f4f6;">
                            <th style="padding: 12px;">ID</th>
                            <th style="padding: 12px;">Nama</th>
                            <th style="padding: 12px;">Email</th>
                            <th style="padding: 12px;">Role</th>
                            <th style="padding: 12px;">Tanggal Join</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(u => `
                            <tr style="border-bottom: 1px solid #f3f4f6;">
                                <td style="padding: 12px;">#${u.id}</td>
                                <td style="padding: 12px;">
                                    <div style="font-weight: 600;">${u.name || u.username}</div>
                                    <div style="font-size: 12px; color: #6b7280;">@${u.username}</div>
                                </td>
                                <td style="padding: 12px;">${u.email}</td>
                                <td style="padding: 12px;">
                                    <span class="product-badge" style="position: static; background: ${u.role === 'admin' ? '#ef4444' : u.role === 'seller' ? '#f59e0b' : '#3b82f6'};">
                                        ${u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td style="padding: 12px;">${new Date(u.createdAt).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    _renderStoreSettings(user, container) {
        container.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">Pengaturan Toko</h2>
            </div>
            <div class="settings-card" style="background: white; padding: 24px; border-radius: 12px; box-shadow: var(--shadow-sm); max-width: 600px;">
                <div class="form-group">
                    <label class="form-label">Nama Toko / Akun</label>
                    <input type="text" class="form-input" value="${user.name}" disabled style="background: #f9fafb;">
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" value="${user.email}" disabled style="background: #f9fafb;">
                </div>
                <div class="form-group">
                    <label class="form-label">Role</label>
                    <input type="text" class="form-input" value="${user.role.toUpperCase()}" disabled style="background: #f9fafb;">
                </div>
                <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
                        Area Berbahaya
                    </p>
                    <button class="btn-primary" style="background: #ef4444; border-color: #ef4444;" onclick="app.resetDatabase()">
                        ⚠️ Reset & Reload Database
                    </button>
                    <p style="color: #9ca3af; font-size: 12px; margin-top: 8px;">
                        Ini akan menghapus semua data dan memuat ulang data default ("Obat Pelicin", dll).
                    </p>
                </div>
            </div>
        `;
    }

    _renderOrderRow(order) {
        let statusBadge = '';
        if (order.status === 'success') statusBadge = '<span class="product-badge badge-success" style="background: #10b981; position: static;">Berhasil</span>';
        else if (order.status === 'cancelled') statusBadge = '<span class="product-badge badge-error" style="background: #ef4444; position: static;">Dibatalkan</span>';
        else statusBadge = '<span class="product-badge" style="background: #f59e0b; position: static;">Pending</span>';

        const date = new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        return `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 16px; font-weight: 600;">${order.id}</td>
                <td style="padding: 16px; color: var(--text-gray); font-size: 14px;">${date}</td>
                <td style="padding: 16px;">
                    <div style="font-size: 14px; max-width: 200px;">
                        ${order.items.map(i => `${i.productName} (${i.quantity}x)`).join(', ')}
                    </div>
                </td>
                <td style="padding: 16px; font-weight: 600;">${Utils.formatPrice(order.total)}</td>
                <td style="padding: 16px;">${statusBadge}</td>
                <td style="padding: 16px;">
                    <div style="display: flex; gap: 8px;">
                        ${order.status !== 'cancelled' ? `
                        <button class="btn-small btn-delete" style="padding: 6px 12px;" onclick="app.cancelOrder('${order.id}')" title="Batalkan Pesanan">
                            ❌ Batal
                        </button>` : ''}
                        <button class="btn-small" style="padding: 6px 12px; background: #9ca3af; color: white; border: none; border-radius: 8px; cursor: pointer;" onclick="app.deleteOrder('${order.id}')" title="Hapus Riwayat">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
            `;
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

        let badge = '';
        if (isOutOfStock) {
            badge = '<span class="product-badge badge-error">Stok Habis</span>';
        } else if (isLowStock) {
            badge = '<span class="product-badge badge-warning">Sisa Sedikit</span>';
        }

        // Category Icon/Badge
        const categoryBadge = `<span class="category-tag">${Utils.sanitizeHTML(product.category)}</span>`;

        // Actions based on view and role
        const user = this.db.getCurrentUser();
        const isAdminOrSeller = user && (user.role === 'admin' || user.role === 'seller');

        let actions = '';

        if (view === 'dashboard') {
            if (isAdminOrSeller && user.role !== 'admin') {
                actions = `
            <button class="btn-small btn-edit" onclick="app.openProductModal(${product.id})">
                        ✏️ Edit
                    </button>
            <button class="btn-small btn-delete" onclick="app.deleteProduct(${product.id})">
                🗑️ Hapus
            </button>
        `;
            } else {
                actions = `<span class="text-secondary" style="font-size: 12px; color: #6b7280;">View Only</span>`;
            }
        } else {
            // Marketplace View
            if (isAdminOrSeller) {
                // Admin sees Edit/Delete even in Marketplace
                actions = `
            <button class="btn-small btn-edit" onclick="app.openProductModal(${product.id})">
                        ✏️ Edit
                    </button>
            `;
            } else {
                // Customer / Guest
                actions = `
            <button class="btn-small btn-cart"
        onclick = "app.addToCart(${product.id})"
                            ${isOutOfStock ? 'disabled' : ''}>
                        🛒 ${isOutOfStock ? 'Habis' : 'Tambah'}
                    </button>
            `;
            }
        }

        return `
            <div class="product-card ${isOutOfStock ? 'out-of-stock' : ''}">
                <div class="product-image">
                    ${product.icon}
                    ${badge}
                </div>
                <div class="product-info">
                    <div class="product-meta-top">
                        ${categoryBadge}
                        <span class="stock-info ${isLowStock ? 'text-warning' : ''} ${isOutOfStock ? 'text-error' : ''}">
                            Stok: ${product.stock}
                        </span>
                    </div>
                    <div class="product-name" title="${Utils.sanitizeHTML(product.name)}">${Utils.sanitizeHTML(product.name)}</div>
                    <div class="product-price">${Utils.formatPrice(product.price)}</div>
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
