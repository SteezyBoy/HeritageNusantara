// ==========================================
// FILE: assets/js/user/order.js
// ==========================================

// Fungsi sinkronisasi otomatis
function startAutoSync() {
    // Jalankan pengecekan setiap 5 detik
    setInterval(() => {
        if (typeof google !== 'undefined') {
            google.script.run
                .withSuccessHandler((serverOrders) => {
                    // Update data lokal dengan data terbaru dari Sheet
                    updateOrderState(serverOrders);
                    // Render ulang tampilan agar sesuai database
                    renderOrderHistory(); 
                })
                .getOrders(); // Fungsi ini harus ada di apps-script.js
        }
    }, 5000);
}

// Fungsi Render (Looping untuk menampilkan semua order)
function renderOrderHistory() {
    const container = document.getElementById("order-status-container");
    if (!container) return;
    
    container.innerHTML = ""; // Bersihkan tampilan lama
    
    if (window.activeOrders.length === 0) {
        container.innerHTML = "<p>Tidak ada pesanan aktif.</p>";
        return;
    }

    // Tampilkan semua order dari Array
    window.activeOrders.forEach(order => {
        container.innerHTML += `
            <div class="order-card">
                <p><strong>ID:</strong> ${order.id || 'N/A'}</p>
                <p><strong>Status:</strong> ${order.status || 'Menunggu'}</p>
                <p><strong>Total:</strong> Rp ${order.total ? order.total.toLocaleString() : '0'}</p>
            </div>
        `;
    });
}

// Panggil fungsi saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    renderOrderHistory(); // Tampilkan data dari localStorage dulu
    startAutoSync();      // Mulai sinkronisasi ke server
});
