// ==========================================
// FILE: assets/js/user/state.js
// ==========================================
// Pastikan data adalah Array (keranjang untuk banyak order)
window.cart = JSON.parse(localStorage.getItem('heritage_cart')) || [];
window.activeOrders = JSON.parse(localStorage.getItem('heritage_activeOrders')) || [];

function syncCart() {
    localStorage.setItem('heritage_cart', JSON.stringify(window.cart));
}

function addOrder(newOrder) {
    window.activeOrders.push(newOrder); // Tambah data baru ke daftar yang ada
    localStorage.setItem('heritage_activeOrders', JSON.stringify(window.activeOrders));
}

function clearOrders() {
    window.activeOrders = [];
    localStorage.removeItem('heritage_activeOrders');
}
