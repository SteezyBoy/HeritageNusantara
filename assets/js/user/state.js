// ========================================================
// FILE: assets/js/user/state.js
// Mengelola penyimpanan data lokal agar tidak hilang saat refresh
// ========================================================

// Menggunakan 'window' agar variabel bisa diakses oleh file lain (cart.js, order.js, dll)
window.cart = JSON.parse(localStorage.getItem('heritage_cart')) || [];
window.activeOrders = JSON.parse(localStorage.getItem('heritage_activeOrders')) || [];

/**
 * Menyimpan data cart ke LocalStorage
 */
function syncCart() {
    localStorage.setItem('heritage_cart', JSON.stringify(window.cart));
}

/**
 * Menyimpan daftar pesanan ke LocalStorage
 * Menggunakan array agar tidak menimpa pesanan lama
 */
function syncOrders() {
    localStorage.setItem('heritage_activeOrders', JSON.stringify(window.activeOrders));
}

/**
 * Menambahkan pesanan baru ke daftar tanpa menghapus yang lama
 */
function addNewOrder(orderData) {
    window.activeOrders.push(orderData);
    syncOrders();
}

/**
 * Membersihkan cart setelah pembayaran sukses
 */
function clearCart() {
    window.cart = [];
    syncCart();
}

/**
 * Menghapus pesanan spesifik (Opsional: digunakan jika order sudah selesai/bayar)
 */
function removeOrder(orderId) {
    window.activeOrders = window.activeOrders.filter(o => o.id !== orderId);
    syncOrders();
}
