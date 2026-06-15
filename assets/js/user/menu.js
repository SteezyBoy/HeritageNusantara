// ==========================================
// FILE: assets/js/user/state.js (STABILIZED)
// ==========================================
window.cart = JSON.parse(localStorage.getItem('heritage_cart')) || [];
window.activeOrders = JSON.parse(localStorage.getItem('heritage_activeOrders')) || [];

function saveOrders(ordersArray) {
    window.activeOrders = ordersArray;
    localStorage.setItem('heritage_activeOrders', JSON.stringify(ordersArray));
}

function addOrder(newOrder) {
    window.activeOrders.push(newOrder);
    localStorage.setItem('heritage_activeOrders', JSON.stringify(window.activeOrders));
}
