// ==========================================
// FILE: assets/js/user/state.js (BASIC RESET)
// ==========================================
window.cart = JSON.parse(localStorage.getItem('heritage_cart')) || [];
window.activeOrders = JSON.parse(localStorage.getItem('heritage_activeOrders')) || [];
