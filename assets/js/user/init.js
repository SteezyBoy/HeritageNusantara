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
    loadCartFromLocal();

    // 1. Munculkan skeleton loading agar tidak ada kedipan menu yang tertimpa
    if (typeof showSkeletonLoading === "function") {
        showSkeletonLoading();
    }

    // 2. Tarik data dari Spreadsheet langsung
    await loadMenuFromSheet(); 
    
    // 3. Jika Spreadsheet kosong/gagal, baru jalankan default menu (sebagai cadangan)
    const totalItems = (menuData.makanan?.length || 0) + (menuData.minuman?.length || 0) + (menuData.dessert?.length || 0);
    if (totalItems === 0) {
        setDefaultMenu();
        renderMenu();
    }

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
