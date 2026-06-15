// ==========================================
// FILE: assets/js/user/order.js
// ==========================================
function renderOrderHistory() {
    const container = document.getElementById("order-status-container");
    if (!container) return;
    
    container.innerHTML = ""; // Bersihkan tampilan
    
    if (window.activeOrders.length === 0) {
        container.innerHTML = "<p>Tidak ada pesanan.</p>";
        return;
    }

    // Loop untuk menampilkan SEMUA pesanan tanpa menimpa
    window.activeOrders.forEach(order => {
        container.innerHTML += `
            <div class="order-card" style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px;">
                <p><strong>ID:</strong> ${order.id || 'N/A'}</p>
                <p><strong>Status:</strong> ${order.status || 'Menunggu'}</p>
                <p><strong>Total:</strong> Rp ${order.total ? order.total.toLocaleString() : '0'}</p>
            </div>
        `;
    });
}

// Jalankan saat halaman loading
document.addEventListener('DOMContentLoaded', renderOrderHistory);
