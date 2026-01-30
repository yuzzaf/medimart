/**
 * ==========================================
 * MediMart - Checkout Logic
 * ==========================================
 */

const db = new Database();
let currentCart = [];

document.addEventListener('DOMContentLoaded', () => {
    // Check if cart is empty
    currentCart = db.getCart();
    if (currentCart.length === 0) {
        alert('Keranjang belanja Anda kosong!');
        window.location.href = 'index.html';
        return;
    }

    // Load User Data if logged in
    const user = db.getCurrentUser();
    if (user) {
        if (document.getElementById('recipientName')) document.getElementById('recipientName').value = user.name || '';
    }

    renderOrderSummary();
});

function selectPayment(element) {
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    const radio = element.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
}

function renderOrderSummary() {
    const container = document.getElementById('checkoutItems');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');

    if (!container) return;

    // Render items compact
    container.innerHTML = currentCart.map(item => {
        const { product, quantity } = item;
        return `
            <div class="checkout-item">
                <div style="width: 50px; height: 50px; border-radius: 8px; background: #f3f4f6; margin-right: 12px; background-image: url('${product.image || ''}'); background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; overflow: hidden; font-size: 24px;">
                    ${product.image ? '' : product.icon}
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 10px; color: #6b7280; font-weight: 500; margin-bottom: 2px;">🏪 ${Utils.sanitizeHTML(product.sellerName || 'Toko Resmi')}</div>
                    <div style="font-weight: 600; font-size: 14px;">${Utils.sanitizeHTML(product.name)}</div>
                    <div style="font-size: 12px; color: var(--text-gray);">${quantity} x ${Utils.formatPrice(product.price)}</div>
                </div>
                <div style="font-weight: 600; font-size: 14px;">
                    ${Utils.formatPrice(product.price * quantity)}
                </div>
            </div>
        `;
    }).join('');

    const total = db.getCartTotal();

    // Check for stored promo
    const storedPromo = sessionStorage.getItem('medimart_promo');
    if (storedPromo && subtotalEl && totalEl) {
        const promo = JSON.parse(storedPromo);
        let discount = 0;

        if (promo.discount < 1) {
            discount = total * promo.discount;
        } else {
            discount = promo.discount;
        }

        // Add Discount Row if not exists (hacky but works for vanilla)
        let discountRow = document.getElementById('discountRow');
        if (!discountRow) {
            discountRow = document.createElement('div');
            discountRow.id = 'discountRow';
            discountRow.className = 'summary-row';
            discountRow.innerHTML = `<span>Diskon (${promo.code})</span><span class="text-success" id="discountValue"></span>`;
            // Insert before total
            totalEl.parentElement.before(discountRow);
        }

        document.getElementById('discountValue').textContent = '- ' + Utils.formatPrice(discount);

        subtotalEl.textContent = Utils.formatPrice(total);
        totalEl.textContent = Utils.formatPrice(total - discount);
    } else {
        if (subtotalEl) subtotalEl.textContent = Utils.formatPrice(total);
        if (totalEl) totalEl.textContent = Utils.formatPrice(total);
    }
}

function processCheckout() {
    // Validate Form
    const name = document.getElementById('recipientName').value;
    const phone = document.getElementById('recipientPhone').value;
    const address = document.getElementById('shippingAddress').value;

    if (!name || !phone || !address) {
        alert('Mohon lengkapi data pengiriman!');
        return;
    }

    const btn = document.getElementById('btnConfirm');
    const originalText = btn.innerHTML;

    // Loading State
    btn.disabled = true;
    btn.innerHTML = '<span class="loader"></span> Memproses...';

    // Utils.notify('Sedang memproses pembayaran...', 'info'); // Removed as requested

    const shippingInfo = {
        name,
        phone,
        address
    };

    // Get Payment Method
    const activePayment = document.querySelector('.payment-option.selected h4');
    const paymentMethod = activePayment ? activePayment.textContent : 'Transfer Bank';

    // Get Promo
    const storedPromo = sessionStorage.getItem('medimart_promo');
    const promo = storedPromo ? JSON.parse(storedPromo) : null;

    setTimeout(() => {
        const result = db.checkout(shippingInfo, paymentMethod, promo);

        if (result.success) {
            // Clear promo
            sessionStorage.removeItem('medimart_promo');
            showSuccessModal(result);
        } else {
            alert(result.message || 'Checkout gagal.');
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }, 1500);
}

function showSuccessModal(result) {
    const modal = document.getElementById('successModal');
    const orderId = document.getElementById('orderId');
    const successTotal = document.getElementById('successTotal');

    if (orderId) orderId.textContent = '#MED-' + Date.now().toString().slice(-6);
    if (successTotal) successTotal.textContent = Utils.formatPrice(result.total);

    if (modal) {
        modal.style.display = 'flex';
    }
}
