// Contoh rendering di order.js
function renderOrderHistory() {
    const container = document.getElementById("order-status-container"); // Sesuaikan ID Anda
    container.innerHTML = ""; // Bersihkan layar

    // Looping melalui array pesanan
    window.activeOrders.forEach(order => {
        container.innerHTML += `
            <div class="order-card">
                <p>Order ID: ${order.id}</p>
                <p>Status: ${order.status}</p>
                <p>Total: ${order.total}</p>
            </div>
        `;
    });
}
