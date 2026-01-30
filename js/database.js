/**
 * ==========================================
 * MediMart - Database Layer
 * ==========================================
 * Handles all data operations using localStorage
 * Simulates a real database with CRUD operations
 */

class Database {
    constructor() {
        this.KEYS = {
            PRODUCTS: 'medimart_products',
            USERS: 'medimart_users',
            CART: 'medimart_cart',
            CURRENT_USER: 'medimart_current_user',
            ORDERS: 'medimart_orders'
        };

        this.products = this.load(this.KEYS.PRODUCTS) || this.getDefaultProducts();
        this.users = this.load(this.KEYS.USERS) || this.getDefaultUsers();
        // Cart is now loaded per-user dynamically
        this.currentUser = this.load(this.KEYS.CURRENT_USER) || null;
        this.orders = this.load(this.KEYS.ORDERS) || this.getDefaultOrders();
    }

    /**
     * Get default orders for initial load
     */
    getDefaultOrders() {
        return [
            {
                id: 'ORD-DEFAULT',
                userId: 3, // John Doe
                items: [
                    {
                        productId: 1,
                        productName: 'Obat Stamina',
                        price: 25000,
                        quantity: 2,
                        icon: "💪",
                        sellerId: 2,
                        sellerName: 'Apotek Sehat'
                    }
                ],
                total: 50000,
                status: 'success',
                createdAt: new Date().toISOString()
            }
        ];
    }

    /**
     * Get default users for initial load
     * @returns {Array} Default users
     */
    getDefaultUsers() {
        return [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                name: 'Administrator',
                email: 'admin@medimart.com',
                role: 'admin',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                username: 'seller1',
                password: 'seller123',
                name: 'Apotek Sehat',
                email: 'seller1@medimart.com',
                role: 'seller',
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                username: 'user',
                password: 'user123',
                name: 'John Doe',
                email: 'user@medimart.com',
                role: 'customer',
                createdAt: new Date().toISOString()
            }
        ];
    }

    /**
     * Load data from localStorage
     * @param {string} key - Storage key
     * @returns {any} Parsed data or null
     */
    load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return null;
        }
    }

    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {any} data - Data to save
     */
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
        }
    }

    /**
     * Get default products for initial load
     * @returns {Array} Default products
     */
    getDefaultProducts() {
        return [
            {
                id: 1,
                name: 'Obat Stamina',
                category: 'Obat Bebas',
                description: 'Suplemen herbal peningkat stamina.',
                price: 25000,
                stock: 50,
                seller: 'seller1',
                sellerId: 2,
                sellerName: 'Apotek Sehat',
                icon: '💪',
                image: "../img/vitaminC.webp"
            },
            {
                id: 2,
                name: 'Minyak Kayu Putih',
                category: 'Herbal',
                description: 'Minyak ekaliptus murni untuk menghangatkan tubuh.',
                price: 18000,
                stock: 100,
                seller: 'seller1',
                sellerId: 2,
                sellerName: 'Apotek Sehat',
                icon: '🌿',
                image: "../img/minyakKayuPutih.jpg"
            },
            {
                id: 3,
                name: 'Balsem Otot Geliga',
                category: 'Obat Nyeri',
                description: 'Balsem untuk meredakan nyeri otot dan keseleo.',
                price: 12000,
                stock: 80,
                seller: 'seller1',
                sellerId: 2,
                sellerName: 'Apotek Sehat',
                icon: '🩹',
                image: "../img/balsemOtot.webp"
            },
            {
                id: 4,
                name: 'Kompres Demam',
                category: 'Alat Kesehatan',
                description: 'Plester kompres penurun panas instan.',
                price: 8000,
                stock: 200,
                seller: 'seller1',
                sellerId: 2,
                sellerName: 'Apotek Sehat',
                icon: '🩺',
                image: "../img/byebyefever.webp"
            }
        ];
    }

    // ==========================================
    // Product CRUD Operations
    // ==========================================

    /**
     * Add new product
     * @param {Object} product - Product data
     * @returns {Object} Added product
     */
    addProduct(product) {
        const newProduct = {
            ...product,
            id: Date.now(),
            seller: this.currentUser ? this.currentUser.username : 'Unknown',
            sellerId: this.currentUser ? this.currentUser.id : null,
            sellerName: this.currentUser ? this.currentUser.name : 'Unknown'
        };
        this.products.push(newProduct);
        this.save(this.KEYS.PRODUCTS, this.products);
        return newProduct;
    }

    /**
     * Update existing product
     * @param {number} id - Product ID
     * @param {Object} product - Updated product data
     * @returns {boolean} Success status
     */
    updateProduct(id, product) {
        const index = this.products.findIndex(p => String(p.id) === String(id));
        if (index !== -1) {
            this.products[index] = {
                ...this.products[index],
                ...product
            };
            this.save(this.KEYS.PRODUCTS, this.products);
            return true;
        }
        return false;
    }

    /**
     * Delete product
     * @param {number} id - Product ID
     * @returns {boolean} Success status
     */
    deleteProduct(id) {
        const initialLength = this.products.length;
        this.products = this.products.filter(p => String(p.id) !== String(id));
        if (this.products.length < initialLength) {
            this.save(this.KEYS.PRODUCTS, this.products);
            return true;
        }
        return false;
    }

    /**
     * Get all products
     * @returns {Array} All products
     */
    getProducts() {
        return this.products;
    }

    /**
     * Get products by current user
     * @returns {Array} User's products
     */
    getUserProducts() {
        if (!this.currentUser) return [];
        return this.products.filter(p =>
            p.seller === this.currentUser.username ||
            p.seller === this.currentUser.name ||
            String(p.sellerId) === String(this.currentUser.id)
        );
    }

    /**
     * Get product by ID
     * @param {number} id - Product ID
     * @returns {Object|null} Product or null
     */
    getProductById(id) {
        return this.products.find(p => String(p.id) === String(id)) || null;
    }

    /**
     * Search products
     * @param {string} query - Search query
     * @returns {Array} Matching products
     */
    searchProducts(query) {
        const lowerQuery = query.toLowerCase();
        return this.products.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery)
        );
    }

    // ==========================================
    // Shopping Cart Operations
    // ==========================================

    /**
     * Get user's cart (internal)
     */
    _getUserCart() {
        if (!this.currentUser) return [];
        // Initialize carts object if not exists
        const carts = this.load('medimart_carts') || {};
        return carts[this.currentUser.id] || [];
    }

    /**
     * Save user's cart
     */
    _saveUserCart(cartItems) {
        if (!this.currentUser) return;
        const carts = this.load('medimart_carts') || {};
        carts[this.currentUser.id] = cartItems;
        this.save('medimart_carts', carts);
    }

    /**
     * Add product to cart
     * @param {number} productId - Product ID
     * @param {number} quantity - Quantity to add
     * @returns {boolean} Success status
     */
    addToCart(productId, quantity = 1) {
        // Admin Restriction
        if (!this.currentUser || this.currentUser.role === 'admin') {
            return false;
        }

        const product = this.getProductById(productId);
        if (!product || product.stock < quantity) {
            return false;
        }

        let cart = this._getUserCart();
        const existing = cart.find(item => String(item.productId) === String(productId));

        if (existing) {
            if (existing.quantity + quantity <= product.stock) {
                existing.quantity += quantity;
            } else {
                return false;
            }
        } else {
            cart.push({ productId, quantity });
        }

        this._saveUserCart(cart);
        return true;
    }

    /**
     * Update cart item quantity
     * @param {number} productId - Product ID
     * @param {number} quantity - New quantity
     * @returns {boolean} Success status
     */
    updateCartQuantity(productId, quantity) {
        if (!this.currentUser) return false;

        const product = this.getProductById(productId);
        if (!product) return false;

        let cart = this._getUserCart();
        const item = cart.find(item => String(item.productId) === String(productId));
        if (!item) return false;

        if (quantity <= 0) {
            cart = cart.filter(item => String(item.productId) !== String(productId));
        } else if (quantity <= product.stock) {
            item.quantity = quantity;
        } else {
            return false;
        }

        this._saveUserCart(cart);
        return true;
    }

    /**
     * Get cart items with product details
     * @returns {Array} Cart items with product info
     */
    getCart() {
        const cart = this._getUserCart();
        return cart.map(item => ({
            ...item,
            product: this.getProductById(item.productId)
        })).filter(item => item.product !== null);
    }

    /**
     * Get cart total amount
     * @returns {number} Total price
     */
    getCartTotal() {
        const cart = this.getCart();
        return cart.reduce((sum, item) => {
            return sum + (item.product ? item.product.price * item.quantity : 0);
        }, 0);
    }

    /**
     * Get total items in cart
     * @returns {number} Total quantity
     */
    getCartItemCount() {
        const cart = this._getUserCart();
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    /**
     * Clear cart
     */
    clearCart() {
        this._saveUserCart([]);
    }

    /**
     * Create Order
     * @param {Array} items - Cart items
     * @param {number} total - Total price
     * @returns {Object} Order object
     */
    createOrder(items, total, shippingInfo, paymentMethod, promo, subtotal, discount) {
        if (!this.currentUser) return null;

        const newOrder = {
            id: 'ORD-' + Date.now().toString().slice(-6),
            userId: this.currentUser.id,
            items: items.map(i => ({
                productId: i.productId,
                productName: i.product.name,
                price: i.product.price,
                quantity: i.quantity,
                icon: i.product.icon,
                image: i.product.image || null,
                sellerId: i.product.sellerId,
                sellerName: i.product.sellerName,
                status: 'pending' // Item-level status
            })),
            total: total,
            subtotal: subtotal || total,
            discount: discount || 0,
            status: 'pending', // Global status (calculated)
            createdAt: new Date().toISOString(),
            shipping: shippingInfo || {},
            payment: paymentMethod || 'Transfer Bank',
            promoCode: promo ? promo.code : null
        };

        this.orders.unshift(newOrder); // Add to beginning
        try {
            this.save(this.KEYS.ORDERS, this.orders);
            console.log('Order saved successfully:', newOrder.id);
        } catch (e) {
            console.error('Failed to save order:', e);
        }
        return newOrder;
    }

    /**
     * Get orders for current user
     */
    getUserOrders() {
        if (!this.currentUser) return [];
        return this.orders.filter(o => String(o.userId) === String(this.currentUser.id));
    }

    /**
     * Accept Specific Seller Item (Seller Action)
     */
    acceptSellerItem(orderId, productId, sellerId) {
        // Use loose equality for order ID finding
        const order = this.orders.find(o => String(o.id) === String(orderId));
        if (!order) return false;

        const item = order.items.find(i => String(i.productId) === String(productId) && String(i.sellerId) === String(sellerId));
        if (!item) return false;

        const currentStatus = item.status || 'pending';

        if (currentStatus === 'pending') {
            item.status = 'success';
            this.updateGlobalStatus(order);
            this.save(this.KEYS.ORDERS, this.orders);
            return true;
        }
        return false;
    }

    /**
     * Accept All Seller's Items in an Order (Bulk)
     */
    acceptSellerItems(orderId, sellerId) {
        // Use loose equality
        const order = this.orders.find(o => o.id == orderId);
        if (!order) return false;

        let modified = false;

        order.items.forEach(item => {
            const currentStatus = item.status || 'pending';
            if (item.sellerId == sellerId && currentStatus === 'pending') {
                item.status = 'success';
                modified = true;
            }
        });

        if (modified) {
            this.updateGlobalStatus(order);
            this.save(this.KEYS.ORDERS, this.orders);
            return true;
        }
        return false;
    }

    /**
     * Reject Specific Seller Item (Seller Action)
     */
    rejectSellerItem(orderId, productId, sellerId) {
        const order = this.orders.find(o => String(o.id) === String(orderId));
        if (!order) return { success: false, message: 'Order not found: ' + orderId };

        const item = order.items.find(i => String(i.productId) === String(productId) && String(i.sellerId) === String(sellerId));
        if (!item) return { success: false, message: 'Item not found (Prod: ' + productId + ', Seller: ' + sellerId + ')' };

        const currentStatus = item.status || order.status || 'pending';

        // Allow idempotency
        if (currentStatus === 'rejected') {
            return { success: true, message: 'Item already rejected.' };
        }

        // Allow rejection if pending or even success (to fix errors)
        if (currentStatus === 'pending' || currentStatus === 'success') {
            item.status = 'rejected';

            // Restore stock
            const product = this.getProductById(productId);
            if (product) product.stock += item.quantity;

            this.updateGlobalStatus(order);
            this.save(this.KEYS.PRODUCTS, this.products);
            this.save(this.KEYS.ORDERS, this.orders);
            return { success: true };
        }
        return { success: false, message: 'Status cannot be rejected: ' + currentStatus };
    }

    /**
     * Reject Seller's Items in an Order (Bulk)
     * @param {string} orderId 
     * @param {number} sellerId 
     */
    rejectSellerItems(orderId, sellerId) {
        const order = this.orders.find(o => o.id == orderId);
        if (!order) return false;

        let modified = false;

        order.items.forEach(item => {
            const currentStatus = item.status || 'pending';
            // Allow rejection if pending or even success (legacy default)
            if (item.sellerId == sellerId && (currentStatus === 'pending' || currentStatus === 'success')) {
                item.status = 'rejected';

                // Restore stock
                const product = this.getProductById(item.productId);
                if (product) product.stock += item.quantity;

                modified = true;
            }
        });

        if (modified) {
            this.updateGlobalStatus(order);
            this.save(this.KEYS.PRODUCTS, this.products);
            this.save(this.KEYS.ORDERS, this.orders);
            return true;
        }
        return false;
    }

    /**
     * Cancel Specific Item (Customer Action)
     * @param {string} orderId 
     * @param {number} productId 
     */
    cancelOrderItem(orderId, productId) {
        console.log('DB Cancel Item:', orderId, productId);
        // Ensure string comparison for robustness
        const order = this.orders.find(o => String(o.id) === String(orderId));
        if (!order) return { success: false, message: 'Order not found: ' + orderId };

        const item = order.items.find(i => String(i.productId) === String(productId));
        if (!item) return { success: false, message: 'Item not found in order: ' + productId };

        const currentStatus = item.status || 'pending';
        console.log('Current Status:', currentStatus);

        // Allow idempotency: If already cancelled, return success to refresh UI
        if (currentStatus === 'cancelled') {
            return { success: true, message: 'Item already cancelled.' };
        }

        if (currentStatus === 'pending' || currentStatus === 'success') {
            try {
                item.status = 'cancelled';

                // Restore stock
                const product = this.getProductById(item.productId);
                if (product) product.stock += item.quantity;
                else console.warn('Product not found for stock restore:', item.productId);

                this.updateGlobalStatus(order);
                this.save(this.KEYS.PRODUCTS, this.products);
                this.save(this.KEYS.ORDERS, this.orders);
                return { success: true };
            } catch (e) {
                console.error('CRITICAL ERROR in cancelOrderItem:', e);
                return { success: false, message: 'Internal Error: ' + e.message };
            }
        }
        return { success: false, message: 'Item status cannot be cancelled: ' + currentStatus };
    }

    /**
     * Cancel Entire Order (Customer Action)
     * @param {string} orderId
     */
    cancelOrder(orderId) {
        const order = this.orders.find(o => o.id == orderId);
        if (!order) return false;

        if (order.status === 'cancelled') return false;

        let modified = false;

        order.items.forEach(item => {
            const currentStatus = item.status || 'pending';
            if (currentStatus !== 'cancelled' && currentStatus !== 'rejected') {
                item.status = 'cancelled';
                // Restore stock
                const product = this.getProductById(item.productId);
                if (product) product.stock += item.quantity;
                modified = true;
            }
        });

        if (modified) {
            order.status = 'cancelled';
            this.save(this.KEYS.PRODUCTS, this.products);
            this.save(this.KEYS.ORDERS, this.orders);
            return true;
        }
        return false;
    }

    /**
     * Recalculate Order Totals based on active items
     * @param {Object} order 
     */
    recalculateOrderTotals(order) {
        if (!order || !order.items) return;

        // 1. Calculate Subtotal of ACTIVE items only
        const activeItems = order.items.filter(i =>
            i.status !== 'cancelled' && i.status !== 'rejected'
        );

        const newSubtotal = activeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // 2. Adjust Discount (optional logic: keep fixed amount or percentage?)
        // For MVP: If discount was fixed amount, ensure it doesn't exceed subtotal
        let newDiscount = order.discount || 0;
        if (newDiscount > newSubtotal) {
            newDiscount = newSubtotal; // Cap discount at subtotal
        }

        // 3. Calculate Final Total
        let newTotal = newSubtotal - newDiscount;
        if (newTotal < 0) newTotal = 0;

        // 4. Update Order
        order.subtotal = newSubtotal;
        order.discount = newDiscount;
        order.total = newTotal;

        console.log(`Recalculated Order ${order.id}: Sub=${newSubtotal}, Disc=${newDiscount}, Total=${newTotal}`);
    }

    /**
     * Update Global Order Status based on Items
     */
    updateGlobalStatus(order) {
        if (!order || !order.items) return;

        const statuses = order.items.map(i => i.status || 'pending');

        // Logic Update:
        // 1. If ALL items are cancelled/rejected -> Global Cancelled
        // 2. If AT LEAST ONE item is success -> Global Success (even if others are cancelled/rejected/pending)
        // 3. Otherwise -> Pending

        const isAllFailed = statuses.every(s => s === 'cancelled' || s === 'rejected');
        const hasPending = statuses.some(s => s === 'pending');
        const hasSuccess = statuses.some(s => s === 'success');

        if (isAllFailed) {
            order.status = 'cancelled';
        } else if (hasPending) {
            order.status = 'pending';
        } else if (hasSuccess) {
            order.status = 'success';
        } else {
            order.status = 'pending';
        }

        // RECACLULATE PRICE whenever status changes
        this.recalculateOrderTotals(order);
    }

    /**
     * Delete Order (History)
     * @param {string} orderId 
     */
    deleteOrder(orderId) {
        const initialLength = this.orders.length;
        this.orders = this.orders.filter(o => o.id != orderId);
        if (this.orders.length < initialLength) {
            this.save(this.KEYS.ORDERS, this.orders);
            return true;
        }
        return false;
    }

    /**
     * Process checkout (reduce stock)
     * @returns {Object} Checkout result
     */
    /**
     * Process checkout (reduce stock)
     * @param {Object} shippingInfo - {name, phone, address}
     * @param {string} paymentMethod - Payment method name
     * @param {Object} promo - Promo code object (optional)
     * @returns {Object} Checkout result
     */
    checkout(shippingInfo, paymentMethod, promo = null) {
        const items = this.getCart();
        const subtotal = this.getCartTotal();
        let total = subtotal;
        let discount = 0;

        if (promo) {
            if (promo.discount < 1) {
                discount = subtotal * promo.discount;
            } else {
                discount = promo.discount;
            }
            total = subtotal - discount;
        }

        if (items.length === 0) {
            return { success: false, message: 'Keranjang kosong' };
        }

        // validate stock first
        const insufficientStock = items.find(item => {
            // Re-fetch product to get latest stock
            const product = this.getProductById(item.productId);
            return !product || product.stock < item.quantity;
        });

        if (insufficientStock) {
            const product = this.getProductById(insufficientStock.productId);
            return {
                success: false,
                message: `Stok tidak mencukupi untuk produk: ${product ? product.name : 'Unknown'}`
            };
        }

        // Reduce stock for each item
        items.forEach(item => {
            const product = this.getProductById(item.productId);
            if (product) {
                product.stock -= item.quantity;
            }
        });

        this.save(this.KEYS.PRODUCTS, this.products);

        // Save Order
        const order = this.createOrder(items, total, shippingInfo, paymentMethod, promo, subtotal, discount);

        this.clearCart();

        return {
            success: true,
            items: items,
            total: total,
            orderId: order ? order.id : null
        };
    }

    // ==========================================
    // Authentication Operations
    // ==========================================

    /**
     * Authenticate user with username and password
     * @param {string} username - Username or email
     * @param {string} password - Password
     * @returns {Object|null} User object if valid, null if invalid
     */
    authenticate(username, password) {
        const user = this.users.find(u =>
            (u.username === username || u.email === username) && u.password === password
        );

        return user || null;
    }

    /**
     * Login user
     * @param {string} username - Username or email
     * @param {string} password - Password
     * @returns {Object} Login result with success status and user data
     */
    /**
     * Register new user
     * @param {Object} userData - User data
     */
    register(userData) {
        // 1. Check if username exists
        const existingUser = this.users.find(u => u.username === userData.username);
        if (existingUser) {
            return { success: false, message: 'Username sudah digunakan!' };
        }

        // 2. Create new user
        const newUser = {
            id: Date.now(),
            username: userData.username,
            password: userData.password,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            createdAt: new Date().toISOString()
        };

        // 3. Save
        this.users.push(newUser);
        this.save(this.KEYS.USERS, this.users);

        // 4. Auto login
        this.currentUser = newUser;
        this.save(this.KEYS.CURRENT_USER, this.currentUser);

        return { success: true, user: newUser };
    }

    /**
     * Authenticate user
     * @param {string} username 
     * @param {string} password 
     */
    login(username, password) {
        const user = this.authenticate(username, password);

        if (user) {
            this.currentUser = {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role
            };
            this.save(this.KEYS.CURRENT_USER, this.currentUser);
            return { success: true, user: this.currentUser };
        }

        return { success: false, message: 'Username atau password salah' };
    }



    /**
     * Logout user
     */
    logout() {
        this.currentUser = null;
        this.cart = [];
        localStorage.removeItem(this.KEYS.CURRENT_USER);
        localStorage.removeItem(this.KEYS.CART);
    }

    /**
     * Get current logged in user
     * @returns {Object|null} Current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is logged in
     * @returns {boolean} Login status
     */
    isLoggedIn() {
        return this.currentUser !== null;
    }

    /**
     * Get all users (admin only)
     * @returns {Array} All users
     */
    getAllUsers() {
        return this.users;
    }

    /**
     * Get customers who bought from a specific seller
     * @param {number|string} sellerIdOrName 
     */
    getCustomersBySeller(sellerId) {
        const sIdString = String(sellerId);
        // 1. Find all orders containing items from this seller
        const sellerOrders = this.orders.filter(order =>
            order.items.some(item => {
                const product = this.getProductById(item.productId);
                return product && (String(product.sellerId) === sIdString || product.seller === sellerId);
            })
        );

        // 2. Extract unique User IDs (as strings for comparison)
        const custIds = [...new Set(sellerOrders.map(o => String(o.userId)))];

        // 3. Return User objects
        return this.users.filter(u => custIds.includes(String(u.id)));
    }

    // ==========================================
    // Statistics & Analytics
    // ==========================================

    /**
     * Get user's dashboard statistics
     * @returns {Object} Dashboard stats
     */
    getUserStats() {
        const products = this.getUserProducts();
        return {
            totalProducts: products.length,
            totalStock: products.reduce((sum, p) => sum + p.stock, 0),
            totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
        };
    }
}
