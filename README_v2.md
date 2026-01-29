# 🏥 MediMart v2.0 - Evolution & Comparison

Dokumentasi ini menjelaskan evolusi MediMart dari versi awal (`README.md`) ke versi saat ini, menyoroti peningkatan arsitektur, fitur baru, dan penyempurnaan UX.

## 🔄 Ringkasan Perubahan Utama

| Fitur | Versi Awal (v1) | Versi Sekarang (v2) |
| :--- | :--- | :--- |
| **Arsitektur Dashboard** | Single Dashboard (Toggled JS) | **Strict Separation** (Store vs Customer Views) |
| **Role User** | Admin & Buyer (Campur) | **Admin** (Manager) & **Customer** (Shopper) Terpisah Tegas |
| **Pencarian (Search)** | Filter Dasar Marketplace | **Omni-Search**: Marketplace, Cart, Seller Dashboard, Customer History |
| **Keranjang (Cart)** | Akses Bebas | **Login Gate**: Tamu diblokir dari keranjang (Redirect Login) |
| **Checkout Flow** | Alert Sederhana | **Riwayat Transaksi Lengkap** & Stock Restoration saat Cancel |
| **Monitoring** | Admin hanya lihat Produk | **Admin melihat Seller Lain** & Monitor Pelanggan tiap Seller |

---

## 🏗️ Peningkatan Arsitektur

### 1. Strict Role Separation (Pemisahan Peran Tegas)
*   **v1**: Dashboard hanya disembunyikan/dimunculkan dengan CSS sederhana. Logika role tercampur di satu fungsi render.
*   **v2**:
    *   **Customer Dashboard**: Tampilan khusus riwayat belanja, statistik pengeluaran. Tidak ada tombol edit produk.
    *   **Store Dashboard**: Tampilan khusus manajemen produk. Admin bisa switch tab ke "Monitoring Seller".
    *   DOM untuk kedua dashboard dipisah (`#storeDashboardView` vs `#customerDashboardView`) untuk mencegah kebocoran tampilan.

### 2. Search Ecosystem (Ekosistem Pencarian)
Versi v1 hanya memiliki pencarian dasar di halaman depan. Versi v2 mengimplementasikan pencarian menyeluruh:
*   **Cart Redirect**: Mencari di halaman keranjang akan melempar user kembali ke marketplace dengan hasil pencarian siap saji.
*   **Real-time Dashboard**: Admin/Seller tidak perlu scroll manual 100 produk; cukup ketik nama/kategori.
*   **History Filter**: Customer bisa melacak "Obat Flu" yang dibeli bulan lalu lewat pencarian riwayat.

### 3. Database & Data Integrity
*   **v1**: Order tidak disimpan permanen (hanya alert sukses).
*   **v2**:
    *   Tabel `medimart_orders` menyimpan setiap transaksi.
    *   Fitur **"Cancel Order"** secara cerdas mengembalikan stok produk (`stock + qty`).
    *   Fitur **"Delete History"** menghapus jejak visual bagi user tanpa merusak data integritas internal (jika dikembangkan lebih lanjut ke soft-delete).

---

## 🛠️ Perbandingan Struktur Kode

### `ui.js`
*   **Baru**: Metode terpisah `_renderStoreDashboard` dan `_renderCustomerDashboard`.
*   **Baru**: Integrasi `searchStoreProducts()` dan `searchCustomerOrders()`.
*   **Baru**: Logic `renderProductCard` yang lebih defensif (tombol Cart hilang total bagi Admin).

### `app.js`
*   **Baru**: Routing URL param `?search=query` untuk mendukung redirect dari halaman lain.
*   **Baru**: `searchCustomerOrders` controller.

### `cart-page.js`
*   **Baru**: "Lock Screen" (Gembok) untuk tamu. Mencegah akses tanpa login.

---

## 🚀 Fitur yang Terealisasi (Dari "Future Enhancements" v1)

Beberapa poin di "Future Enhancements" `README.md` asli telah berhasil diimplementasikan:
-   ✅ **Order history**: Sekarang sudah ada lengkap dengan status dan tanggal.
-   [x] **User registration**: Masih simulasi login, tapi struktur data User sudah mendukung multi-role.
-   [x] **Real backend**: Masih localStorage, tapi struktur `Database` class sudah siap untuk di-swap dengan API call.

## 📝 Catatan Pengembang v2

Perubahan terbesar adalah pada **Mental Model Pengguna**:
*   Admin adalah MANAJER TERTINGGI (bisa lihat seller lain).
*   Seller adalah MANAJER TOKO (hanya lihat produk sendiri).
*   Customer adalah PEMBELI (hanya lihat riwayat & belanja).

Tidak ada lagi kebingungan "Admin kok bisa beli barang sendiri?". Tombol beli dimatikan untuk peran manajerial.
