function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem(STORAGE_KEYS.darkMode, isDarkMode);
    applyDarkMode();
}

function applyDarkMode() {
    document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
    const icon = document.getElementById("darkmodeIcon");
    if (icon) icon.textContent = isDarkMode ? "☀️" : "🌙";
}

document.addEventListener("DOMContentLoaded", async () => {
    applyDarkMode();
    tableNumber = getTableNumber();
    const tableDisplay = document.getElementById("tableDisplay");
    if (tableDisplay) {
        tableDisplay.textContent = tableNumber ? `🪑 Table ${tableNumber}` : "";
        tableDisplay.style.display = tableNumber ? "block" : "none";
    }

    // === MIGRASI CART GUEST KE MEJA ===
    const oldCartKey = STORAGE_KEYS.cartPrefix + "guest";
    const newCartKey = STORAGE_KEYS.cartPrefix + (tableNumber || "guest");
    if (tableNumber && oldCartKey !== newCartKey) {
        const guestCart = localStorage.getItem(oldCartKey);
        if (guestCart && !localStorage.getItem(newCartKey)) {
            localStorage.setItem(newCartKey, guestCart);
            localStorage.removeItem(oldCartKey);
            console.log("Cart migrated from guest to table", tableNumber);
        }
    }
    loadCartFromLocal();

    // 1. Set default menu (dari state.js atau default-menu.js)
    setDefaultMenu();
    // 2. Render menu pertama kali (pasti ada karena setDefaultMenu sudah mengisi)
    renderMenu();

    // 3. Coba load dari API (jika sukses, menu akan di-refresh; jika gagal, tetap pakai default)
    showSkeletonLoading();
    try {
        await loadMenuFromSheet();
        // Jika loadMenuFromSheet berhasil mengubah menuData, render ulang
        renderMenu();
    } catch (err) {
        console.error("Error loading menu from API, using default menu:", err);
        // Tidak perlu render ulang karena default sudah tampil
    } finally {
        // Hilangkan skeleton jika perlu (opsional)
        // Tapi skeleton sudah diganti oleh renderMenu()
    }

    if (activeOrderId) {
        await resumeActiveOrderIfNeeded();
    } else {
        const fab = document.getElementById("orderStatusFab");
        if (fab) fab.style.display = "none";
    }


    // === MIGRASI CART GUEST KE MEJA (tambahan untuk draft) ===
    const oldCartKey = STORAGE_KEYS.cartPrefix + "guest";
    const newCartKey = STORAGE_KEYS.cartPrefix + (tableNumber || "guest");
    if (tableNumber && oldCartKey !== newCartKey) {
        const guestCart = localStorage.getItem(oldCartKey);
        if (guestCart && !localStorage.getItem(newCartKey)) {
            localStorage.setItem(newCartKey, guestCart);
            localStorage.removeItem(oldCartKey);
            console.log("Cart migrated from guest to table", tableNumber);
        }
    }
    loadCartFromLocal();

    // Pastikan default menu terisi sebelum render pertama
    setDefaultMenu();         // <- ini yang penting
    renderMenu();             // render pertama dengan default

    // Tampilkan skeleton lalu coba load dari API (jika berhasil, render ulang)
    showSkeletonLoading();
    await loadMenuFromSheet(); // ini akan mengganti menuData jika API sukses
    renderMenu();              // render ulang dengan data API (atau default jika gagal)

    if (activeOrderId) {
        await resumeActiveOrderIfNeeded();
    } else {
        const fab = document.getElementById("orderStatusFab");
        if (fab) fab.style.display = "none";
    }
});

window.onclick = function(event) {
    const modal              = document.getElementById("modal");
    const cartModal          = document.getElementById("cartModal");
    const quickModal         = document.getElementById("quickAddModal");
    const paymentChoiceModal = document.getElementById("paymentChoiceModal");
    if (event.target === modal)              closeModal();
    if (event.target === cartModal)          closeCart();
    if (event.target === quickModal)         closeQuickAddModal();
    if (event.target === paymentChoiceModal) closePaymentChoiceModal();
};
