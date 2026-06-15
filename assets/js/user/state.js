// ==========================================
// FILE: assets/js/user/state.js
// ==========================================

// 1. Inisialisasi Data dari localStorage (atau default jika kosong)
let cart = JSON.parse(localStorage.getItem('heritage_cart')) || [];
let activeOrder = JSON.parse(localStorage.getItem('heritage_activeOrder')) || null;

// 2. Fungsi Sinkronisasi (Save)
function syncCartState() {
    localStorage.setItem('heritage_cart', JSON.stringify(cart));
}

function syncOrderState() {
    localStorage.setItem('heritage_activeOrder', JSON.stringify(activeOrder));
}

// 3. Fungsi Pembersih (Setelah pembayaran sukses)
function clearUserSession() {
    localStorage.removeItem('heritage_cart');
    localStorage.removeItem('heritage_activeOrder');
    cart = [];
    activeOrder = null;
}
