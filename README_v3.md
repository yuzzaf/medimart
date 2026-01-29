# 🚀 MediMart v3.0 - The Granular Commerce Update

**MediMart v3.0** adalah iterasi terbesar dalam evolusi marketplace ini. Fokus utama update ini adalah **Granularitas Transaksi** dan **Sinkronisasi Dua Arah** yang sempurna antara Seller dan Customer.

Dokumen ini disusun untuk kebutuhan presentasi Hackathon, menyoroti lompatan teknis dan UX dari versi sebelumnya.

---

## 📊 Evolusi Fitur: v1 vs v2 vs v3

| Fitur Utama | v1 (MVP) | v2 (Stable) | **v3 (Advanced - Current)** |
| :--- | :--- | :--- | :--- |
| **Status Pesanan** | Global (Per Invoice) | Global (Per Invoice) | **🧬 Granular (Per Item)** |
| **Logika Pembatalan** | Tidak Ada | Cancel Satu Invoice (Semua batal) | **🎯 Partial Cancel** (Bisa batal 1 barang saja) |
| **Kontrol Seller** | Upload Produk Saja | Monitoring Stok | **⚡ Full Control**: Lihat customer, **Tolak Pesanan**, Kelola Per Item |
| **Transparansi** | Minim Info | Dashboard Terisah | **👁️ Double-Blind Sync**: Customer lihat Nama Toko, Seller lihat Profile Customer |
| **Manajemen Stok** | Tidak Akurat | Basic Restore | **🛡️ Secure Restock**: Stok kembali otomatis *hanya* untuk item yang batal/ditolak |
| **UX Interaksi** | Page Reload (Kasar) | Page Reload | **✨ Seamless SPA-like**: Refresh view tanpa reload halaman |

---

## 💎 Sorotan Utama v3.0

### 1. 🧬 Arsitektur Status Granular (Per-Item Logic)
Inovasi teknis terbesar di v3.
*   **Masalah Lama**: Jika Customer membeli Kemeja (Toko A) dan Sepatu (Toko B) dalam satu pesanan, pembatalan Kemeja akan membatalkan *seluruh pesanan* termasuk Sepatu. Hal ini merugikan Toko B.
*   **Solusi v3**:
    *   Setiap *item* dalam array `orders.items` memiliki status independen (`pending`, `cancelled`, `rejected`, `success`).
    *   **Customer** bisa membatalkan *hanya* barang yang salah beli.
    *   **Seller** bisa menolak *hanya* barang dari tokonya yang kosong, tanpa membatalkan barang dari toko lain di invoice yang sama.
    *   **Visual**: Badge status muncul di *sebelah kanan setiap produk*, bukan lagi di header pesanan.

### 2. 🛡️ Seller Power Tools (Alat Kendali Penjual)
Memberdayakan Seller untuk mengelola bisnis mereka secara mandiri.
*   **Customer Orders Modal**: Seller kini bisa melihat daftar spesifik siapa saja yang membeli produk mereka.
*   **Tombol Tolak (Reject)**: Jika stok fisik habis atau harga salah, Seller bisa menekan tombol **"⛔ Tolak Order"**.
    *   Status item berubah menjadi "Ditolak Toko".
    *   Stok di sistem otomatis dikembalikan (Auto-Restock).
    *   Customer mendapat notifikasi visual di dashboard mereka.

### 3. ✨ UX/UI Polish & Interaction
Peningkatan pengalaman pengguna setara aplikasi modern.
*   **No-Reload Actions**: Membatalkan pesanan atau update produk tidak lagi me-refresh halaman browser. State aplikasi terjaga, transisi lebih halus.
*   **Rich Order History**: Tampilan riwayat pesanan kini memuat **Thumbnail Gambar Produk**, **Nama Toko**, dan status yang jelas. Tidak ada lagi teks buta.
*   **Smart Modals**: Tampilan popup (Lihat Pesanan, Crop Image) didesain responsif, rapi, dan informatif.

---

## 💻 Tech Stack & Kualitas Kode

Meskipun menggunakan **Vanilla JavaScript**, struktur kode v3 sangat modular dan mengikuti prinsip **Clean Architecture**:

1.  **`database.js` (The Brain)**: Menangani logika bisnis kompleks (e.g., `cancelOrderItem` validation, `updateGlobalStatus` calculation).
2.  **`ui.js` (The Face)**: Menangani rendering DOM yang dinamis. Menggunakan *Template Literals* untuk performa tinggi tanpa framework berat.
3.  **`app.js` (The Orchestrator)**: Menghubungkan UI dan Database tanpa coupling yang erat.

### Snippet Logika Granular (Preview Code)
```javascript
// database.js - cancelOrderItem
cancelOrderItem(orderId, productId) {
    const item = order.items.find(i => i.productId === productId);
    // Logika pertahanan: Hanya status pending yang bisa dibatalkan
    if (item && item.status === 'pending') {
        item.status = 'cancelled';
        product.stock += item.quantity; // Auto-Restock
        this.updateGlobalStatus(order); // Recalculate invoice status
        return true;
    }
}
```

---

## 🎯 Kesimpulan untuk Hackathon

**MediMart v3.0** bukan sekadar "toko online". Ini adalah **simulasi ekosistem e-commerce yang matang**.

Kami tidak hanya membangun fitur "Beli", tapi kami memikirkan *edge cases*:
*   "Bagaimana jika satu barang habis tapi yang lain ada?" -> **Granular Status**.
*   "Bagaimana jika Seller ingin membatalkan sepihak?" -> **Seller Reject**.
*   "Bagaimana menjaga Customer tetap nyaman?" -> **Seamless UI**.

v3.0 adalah bukti bahwa **Kompleksitas Bisnis** bisa diselesaikan dengan **Kode yang Bersih**.

---
*Built with ❤️ for Hackathon Phase 0*
