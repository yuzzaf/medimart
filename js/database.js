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
            CURRENT_USER: 'medimart_current_user'
        };

        this.products = this.load(this.KEYS.PRODUCTS) || this.getDefaultProducts();
        this.users = this.load(this.KEYS.USERS) || this.getDefaultUsers();
        this.cart = this.load(this.KEYS.CART) || [];
        this.currentUser = this.load(this.KEYS.CURRENT_USER) || null;
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
                name: 'Paracetamol 500mg',
                category: 'Obat Bebas',
                description: 'Obat pereda nyeri dan penurun demam. Efektif untuk sakit kepala, sakit gigi, dan demam.',
                price: 15000,
                stock: 100,
                seller: 'Admin',
                icon: '💊'
            },
            {
                id: 2,
                name: 'Vitamin C 1000mg',
                category: 'Vitamin',
                description: 'Suplemen vitamin C untuk meningkatkan daya tahan tubuh. 1 tablet per hari.',
                price: 45000,
                stock: 75,
                seller: 'Admin',
                icon: '🍊'
            },
            {
                id: 3,
                name: 'Betadine Solution',
                category: 'Alat Kesehatan',
                description: 'Antiseptik untuk luka luar. Mencegah infeksi pada luka ringan.',
                price: 35000,
                stock: 50,
                seller: 'Admin',
                icon: '🩹'
            },
            {
                id: 4,
                name: 'Obat Batuk Herbal',
                category: 'Herbal',
                description: 'Obat batuk alami dari bahan herbal. Meredakan batuk dan tenggorokan gatal.',
                price: 28000,
                stock: 60,
                seller: 'Admin',
                icon: '🌿'
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
        const index = this.products.findIndex(p => p.id === id);
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
        this.products = this.products.filter(p => p.id !== id);
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
            p.sellerId === this.currentUser.id
        );
    }

    /**
     * Get product by ID
     * @param {number} id - Product ID
     * @returns {Object|null} Product or null
     */
    getProductById(id) {
        return this.products.find(p => p.id === id) || null;
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
     * Add product to cart
     * @param {number} productId - Product ID
     * @param {number} quantity - Quantity to add
     * @returns {boolean} Success status
     */
    addToCart(productId, quantity = 1) {
        const product = this.getProductById(productId);
        if (!product || product.stock < quantity) {
            return false;
        }

        const existing = this.cart.find(item => item.productId === productId);
        if (existing) {
            if (existing.quantity + quantity <= product.stock) {
                existing.quantity += quantity;
            } else {
                return false;
            }
        } else {
            this.cart.push({ productId, quantity });
        }
        
        this.save(this.KEYS.CART, this.cart);
        return true;
    }

    /**
     * Update cart item quantity
     * @param {number} productId - Product ID
     * @param {number} quantity - New quantity
     * @returns {boolean} Success status
     */
    updateCartQuantity(productId, quantity) {
        const product = this.getProductById(productId);
        if (!product) return false;

        const item = this.cart.find(item => item.productId === productId);
        if (!item) return false;

        if (quantity <= 0) {
            this.cart = this.cart.filter(item => item.productId !== productId);
        } else if (quantity <= product.stock) {
            item.quantity = quantity;
        } else {
            return false;
        }

        this.save(this.KEYS.CART, this.cart);
        return true;
    }

    /**
     * Get cart items with product details
     * @returns {Array} Cart items with product info
     */
    getCart() {
        return this.cart.map(item => ({
            ...item,
            product: this.getProductById(item.productId)
        })).filter(item => item.product !== null);
    }

    /**
     * Get cart total amount
     * @returns {number} Total price
     */
    getCartTotal() {
        return this.cart.reduce((sum, item) => {
            const product = this.getProductById(item.productId);
            return sum + (product ? product.price * item.quantity : 0);
        }, 0);
    }

    /**
     * Get total items in cart
     * @returns {number} Total quantity
     */
    getCartItemCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    /**
     * Clear cart
     */
    clearCart() {
        this.cart = [];
        this.save(this.KEYS.CART, this.cart);
    }

    /**
     * Process checkout (reduce stock)
     * @returns {Object} Checkout result
     */
    checkout() {
        const items = this.getCart();
        const total = this.getCartTotal();
        
        // Reduce stock for each item
        items.forEach(item => {
            const product = this.getProductById(item.productId);
            if (product) {
                product.stock -= item.quantity;
            }
        });
        
        this.save(this.KEYS.PRODUCTS, this.products);
        this.clearCart();
        
        return {
            success: true,
            items: items,
            total: total
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
     * Register new user
     * @param {Object} userData - User registration data
     * @returns {Object} Registration result
     */
    register(userData) {
        // Check if username already exists
        const existingUser = this.users.find(u => 
            u.username === userData.username || u.email === userData.email
        );
        
        if (existingUser) {
            return { 
                success: false, 
                message: 'Username atau email sudah terdaftar' 
            };
        }

        const newUser = {
            id: Date.now(),
            username: userData.username,
            password: userData.password,
            name: userData.name,
            email: userData.email,
            role: userData.role || 'customer',
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        this.save(this.KEYS.USERS, this.users);

        return { success: true, user: newUser };
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
