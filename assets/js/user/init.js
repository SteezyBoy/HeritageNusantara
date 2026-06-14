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

async function initApp() {
    applyDarkMode();
    tableNumber = getTableNumber();
    const tableDisplay = document.getElementById("tableDisplay");
    if (tableDisplay) {
        tableDisplay.textContent = tableNumber ? `🪑 Table ${tableNumber}` : "";
        tableDisplay.style.display = tableNumber ? "block" : "none";
    }
    loadCartFromLocal();
    showSkeletonLoading();
    await loadMenuFromSheet();
    // Jika menu masih kosong setelah 2 detik, coba muat ulang
    setTimeout(() => {
        const items = getAllItems();
        if (items.length === 0) {
            console.warn("Menu still empty, retrying load...");
            setDefaultMenu();
            renderMenu();
        }
    }, 3000);
    if (activeOrderId) {
        await resumeActiveOrderIfNeeded();
    } else {
        const fab = document.getElementById("orderStatusFab");
        if (fab) fab.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", initApp);

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
