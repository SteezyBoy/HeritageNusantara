// Ganti baris ini:
// let activeOrder = JSON.parse(localStorage.getItem('heritage_activeOrder')) || null;

// Menjadi ini:
let activeOrders = JSON.parse(localStorage.getItem('heritage_activeOrders')) || [];

// Dan perbarui fungsi sinkronisasi:
function syncOrderState() {
    localStorage.setItem('heritage_activeOrders', JSON.stringify(activeOrders));
}
