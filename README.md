# 🏥 MediMart - Marketplace Obat Online

Marketplace untuk jual-beli produk kesehatan dan obat-obatan dengan arsitektur clean code dan halaman login terpisah.

## 📁 Struktur Folder

```
medimart/
├── login.html          # Halaman login terpisah
├── index.html          # Main application
├── css/
│   ├── login.css       # Login page styles
│   └── style.css       # Main app styles
├── js/
│   ├── auth.js         # Authentication logic
│   ├── database.js     # Data layer (localStorage)
│   ├── utils.js        # Helper functions
│   ├── ui.js           # UI rendering
│   └── app.js          # Main application controller
├── assets/             # (untuk gambar/icons di masa depan)
└── README.md           # Dokumentasi ini
```

## 🏗️ Arsitektur

### Clean Architecture (MVC Pattern)

**1. Authentication Layer (`auth.js`)**
- Login page logic
- Session management
- Auto-redirect if logged in

**2. Database Layer (`database.js`)**
- Mengelola semua operasi data
- CRUD products
- Shopping cart operations
- Authentication
- Menggunakan localStorage sebagai database

**3. UI Layer (`ui.js`)**
- Rendering semua komponen UI
- DOM manipulation
- Modal management
- Update state visual

**4. Utils Layer (`utils.js`)**
- Helper functions
- Formatting (harga, tanggal)
- Validation
- DOM utilities

**5. App Controller (`app.js`)**
- Koordinasi antara Database dan UI
- Event handling
- Business logic
- Entry point aplikasi

## ✨ Fitur

### 🔐 Halaman Login Terpisah
- ✅ Dedicated login page dengan UI modern
- ✅ Toggle password visibility
- ✅ Remember me functionality
- ✅ Guest mode (browse tanpa login)
- ✅ Auto-redirect jika sudah login
- ✅ Toast notifications
- ✅ Loading states

### 🏪 Marketplace
- ✅ Browse semua produk obat
- ✅ Search functionality dengan debouncing
- ✅ Shopping cart dengan quantity control
- ✅ Checkout system
- ✅ Stock management

### 📊 Dashboard Toko
- ✅ Statistik real-time (produk, stok, nilai inventory)
- ✅ CRUD produk lengkap
- ✅ Filter produk per user
- ✅ Stock alerts
- ✅ Protected route (harus login)

### 🔐 Authentication
- ✅ Login/Logout system
- ✅ User-specific dashboard
- ✅ Session management

### 💾 Database Features
- ✅ localStorage persistence
- ✅ Data validation
- ✅ Automatic ID generation
- ✅ Search functionality

## 🚀 Cara Menggunakan

### Quick Start
1. Buka `login.html` di browser
2. Login dengan username & password apa saja (demo mode)
3. Atau klik "Lanjut sebagai Tamu" untuk browse tanpa login
4. Browse produk di Marketplace
5. Login untuk akses Dashboard dan kelola produk

### Workflow
```
1. User buka login.html
   ↓
2. Login (atau guest mode)
   ↓
3. Redirect ke index.html (main app)
   ↓
4. Database.js load data dari localStorage
   ↓
5. UI.js render marketplace
   ↓
6. User CRUD produk → Database.js update data
   ↓
7. UI.js re-render dengan data baru
```

## 📝 API Reference

### Database Class

```javascript
// Products
db.addProduct(product)          // Create
db.getProducts()                // Read all
db.getProductById(id)           // Read one
db.updateProduct(id, product)   // Update
db.deleteProduct(id)            // Delete
db.searchProducts(query)        // Search

// Cart
db.addToCart(productId, qty)
db.getCart()
db.updateCartQuantity(productId, qty)
db.clearCart()
db.checkout()

// Auth
db.login(username)
db.logout()
db.getCurrentUser()
db.isLoggedIn()
```

### UI Class

```javascript
// Views
ui.showMarketplace()
ui.showDashboard()

// Rendering
ui.renderMarketplace()
ui.renderDashboard()
ui.renderCart()

// Modals
ui.openLoginModal()
ui.openProductModal(productId)
ui.closeProductModal()

// Updates
ui.updateAuthUI()
ui.updateCartBadge()
```

### Utils Object

```javascript
Utils.formatPrice(price)              // Format Rupiah
Utils.getIconForCategory(category)    // Get emoji icon
Utils.validateProduct(product)        // Validate data
Utils.notify(message)                 // Show alert
Utils.confirm(message)                // Show confirm
Utils.sanitizeHTML(text)              // Prevent XSS
```

## 🎨 Customization

### Mengubah Warna
Edit `css/style.css`:
```css
:root {
    --primary: #00B09B;      /* Warna utama */
    --secondary: #FF6B35;    /* Warna aksen */
    --text-dark: #1a1a1a;    /* Warna teks */
}
```

### Menambah Kategori Produk
Edit `index.html` dan `utils.js`:
```javascript
// utils.js
getIconForCategory(category) {
    const icons = {
        'Kategori Baru': '🔥'  // Tambah di sini
    };
}
```

### Menambah Field Produk
1. Update `database.js` - add field to product schema
2. Update `index.html` - add form input
3. Update `ui.js` - add to form handling
4. Update `utils.js` - add validation

## 🔒 Security

- ✅ XSS Prevention (sanitizeHTML)
- ✅ Input validation
- ✅ Safe localStorage usage
- ⚠️ **Note**: Ini demo project, password TIDAK di-hash

## 🐛 Debugging

Buka Console Browser (F12):
```javascript
// Check database
app.db.getProducts()
app.db.getCurrentUser()
app.db.getCart()

// Check UI state
app.ui.editingProductId

// Manual operations
app.db.addProduct({...})
app.ui.renderMarketplace()
```

## 📱 Responsive Design

- ✅ Mobile-friendly
- ✅ Tablet optimized
- ✅ Desktop enhanced
- Breakpoint: 768px

## 🚧 Future Enhancements

- [ ] Real backend API integration
- [ ] User registration
- [ ] Password hashing
- [ ] Image upload
- [ ] Order history
- [ ] Payment gateway
- [ ] Review & rating system
- [ ] Multi-language support

## 📄 License

Free to use for learning purposes.

## 👨‍💻 Developer Notes

### Code Style
- Gunakan ES6+ features
- Class-based architecture
- Descriptive naming
- Comprehensive comments
- Modular design

### Best Practices
- Separation of concerns
- Single responsibility
- DRY principle
- Error handling
- Data validation

---

**MediMart** - Built with ❤️ using Vanilla JavaScript
