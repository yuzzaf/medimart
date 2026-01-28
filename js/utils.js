/**
 * ==========================================
 * MediMart - Utility Functions
 * ==========================================
 * Helper functions for formatting, validation, etc.
 */

const Utils = {
    /**
     * Format price to Indonesian Rupiah
     * @param {number} price - Price to format
     * @returns {string} Formatted price
     */
    formatPrice(price) {
        return 'Rp ' + price.toLocaleString('id-ID');
    },

    /**
     * Get icon for product category
     * @param {string} category - Product category
     * @returns {string} Icon emoji
     */
    getIconForCategory(category) {
        const icons = {
            'Obat Bebas': '💊',
            'Obat Keras': '💉',
            'Vitamin': '🍊',
            'Alat Kesehatan': '🩹',
            'Herbal': '🌿'
        };
        return icons[category] || '💊';
    },

    /**
     * Validate product data
     * @param {Object} product - Product data
     * @returns {Object} Validation result
     */
    validateProduct(product) {
        const errors = [];

        if (!product.name || product.name.trim().length === 0) {
            errors.push('Nama produk wajib diisi');
        }

        if (!product.category || product.category.trim().length === 0) {
            errors.push('Kategori wajib dipilih');
        }

        if (!product.description || product.description.trim().length === 0) {
            errors.push('Deskripsi wajib diisi');
        }

        if (!product.price || product.price < 0) {
            errors.push('Harga harus lebih dari 0');
        }

        if (product.stock === undefined || product.stock < 0) {
            errors.push('Stok harus lebih dari atau sama dengan 0');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Show notification/alert
     * @param {string} message - Message to show
     * @param {string} type - Type: success, error, info
     */
    notify(message, type = 'info') {
        // Simple alert for now, can be replaced with custom notification
        alert(message);
    },

    /**
     * Confirm action
     * @param {string} message - Confirmation message
     * @returns {boolean} User confirmation
     */
    confirm(message) {
        return confirm(message);
    },

    /**
     * Debounce function for search
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Sanitize HTML to prevent XSS
     * @param {string} text - Text to sanitize
     * @returns {string} Sanitized text
     */
    sanitizeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Get element by ID
     * @param {string} id - Element ID
     * @returns {HTMLElement|null} Element or null
     */
    $(id) {
        return document.getElementById(id);
    },

    /**
     * Add class to element
     * @param {HTMLElement} element - Target element
     * @param {string} className - Class name
     */
    addClass(element, className) {
        if (element) {
            element.classList.add(className);
        }
    },

    /**
     * Remove class from element
     * @param {HTMLElement} element - Target element
     * @param {string} className - Class name
     */
    removeClass(element, className) {
        if (element) {
            element.classList.remove(className);
        }
    },

    /**
     * Toggle class on element
     * @param {HTMLElement} element - Target element
     * @param {string} className - Class name
     */
    toggleClass(element, className) {
        if (element) {
            element.classList.toggle(className);
        }
    },

    /**
     * Check if element has class
     * @param {HTMLElement} element - Target element
     * @param {string} className - Class name
     * @returns {boolean} Has class
     */
    hasClass(element, className) {
        return element ? element.classList.contains(className) : false;
    },

    /**
     * Generate unique ID
     * @returns {number} Timestamp-based ID
     */
    generateId() {
        return Date.now();
    },

    /**
     * Format date to Indonesian locale
     * @param {Date} date - Date object
     * @returns {string} Formatted date
     */
    formatDate(date) {
        return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    /**
     * Truncate text with ellipsis
     * @param {string} text - Text to truncate
     * @param {number} length - Max length
     * @returns {string} Truncated text
     */
    truncate(text, length) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }
};
