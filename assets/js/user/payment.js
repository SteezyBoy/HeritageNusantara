// Tambahkan ini agar error 'is not defined' hilang
function stopCashierPaymentPoll() {
    console.log("Polling dihentikan.");
    // Jika Anda punya variabel interval, clear di sini
    if (typeof window.paymentInterval !== 'undefined') {
        clearInterval(window.paymentInterval);
    }
}
