document.addEventListener("DOMContentLoaded", async () => {
    applyDarkMode();
    tableNumber = getTableNumber();
    // ... baris lain tetap ...

    loadCartFromLocal();

    // 1. Tampilkan animasi loading saat menarik data dari API
    showSkeletonLoading();

    // 2. Coba muat menu dari Spreadsheet (API)
    await loadMenuFromSheet();
    
    // 3. Jika setelah ditarik API menuData masih kosong, baru pakai default
    const totalItems = menuData.makanan.length + menuData.minuman.length + menuData.dessert.length;
    if (totalItems === 0) {
        setDefaultMenu();
        renderMenu();
    }

    if (activeOrderId) {
        await resumeActiveOrderIfNeeded();
    } // ...
});
