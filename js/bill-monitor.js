// ==================== BILL MONITOR ====================
// File: js/bill-monitor.js

function openBillModal() {
    document.getElementById("billModal").style.display = "flex";
}

function closeBillModal() {
    document.getElementById("billModal").style.display = "none";
    document.getElementById("billResult").style.display = "none";
    document.getElementById("billOrderId").value = "";
}

async function checkBillStatus() {
    const orderId = document.getElementById("billOrderId").value.trim();
    const resultDiv = document.getElementById("billResult");
    
    if (!orderId) {
        alert("Masukkan ID Pesanan terlebih dahulu.");
        return;
    }

    resultDiv.style.display = "block";
    resultDiv.innerHTML = `<div style="text-align:center;"><div class="loader" style="border:3px solid var(--border); border-top:3px solid var(--accent); border-radius:50%; width:24px; height:24px; animation:spin 1s linear infinite; margin:0 auto;"></div><p style="margin-top:10px; font-size:12px; color: var(--text-muted);">Mencari pesanan...</p></div>`;

    // Gunakan fungsi fetchAPI dari api.js
    const data = await fetchAPI("getOrderById", { id: orderId });

    if (data && data.status === "success" && data.order) {
        const o = data.order;
        let statusColor = o.status === "Selesai" ? "var(--green)" : (o.status === "Diproses" ? "var(--accent)" : "var(--text-muted)");
        
        resultDiv.innerHTML = `
            <h4 style="margin-bottom:10px; border-bottom:1px solid var(--border); padding-bottom:5px; color: var(--text-primary);">${o.orderId}</h4>
            <p style="font-size:13px; margin-bottom:5px; color: var(--text-secondary);"><strong>Status:</strong> <span style="color:${statusColor}; font-weight:600;">${o.status || 'Menunggu Konfirmasi'}</span></p>
            <p style="font-size:13px; margin-bottom:5px; color: var(--text-secondary);"><strong>Total:</strong> ${formatPrice(o.total)}</p>
            <p style="font-size:13px; margin-bottom:10px; color: var(--text-secondary);"><strong>Tipe:</strong> ${o.orderType}</p>
            <div style="font-size:12px; color:var(--text-muted); background:var(--bg); padding:8px; border-radius:6px; border: 1px solid var(--border);">
                ${o.items.map(i => `• ${i.qty}x ${i.name}`).join('<br>')}
            </div>
        `;
    } else {
        resultDiv.innerHTML = `<p style="color:var(--red); text-align:center; font-size:13px; margin:0;">Pesanan tidak ditemukan. Pastikan ID benar.</p>`;
    }
}

// Tambahkan event global untuk menutup semua modal jika background diklik
window.onclick = function(event) {
    const modal = document.getElementById("modal");
    const cartModal = document.getElementById("cartModal");
    const quickModal = document.getElementById("quickAddModal");
    const billModal = document.getElementById("billModal");
    
    if (event.target === modal) closeModal();
    if (event.target === cartModal) closeCart();
    if (event.target === quickModal) closeQuickAddModal();
    if (event.target === billModal) closeBillModal();
};