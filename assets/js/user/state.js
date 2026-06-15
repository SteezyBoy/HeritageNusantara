// ==========================================
// FILE: assets/js/user/state.js
// ==========================================
// Pastikan data order dalam bentuk Array agar bisa menampung banyak data
window.activeOrders = JSON.parse(localStorage.getItem('heritage_activeOrders')) || [];

// Fungsi untuk memperbarui data dari Server (Apps Script)
function updateOrderState(newOrdersFromServer) {
    window.activeOrders = newOrdersFromServer;
    localStorage.setItem('heritage_activeOrders', JSON.stringify(window.activeOrders));
}
