// ==========================================
// FILE: assets/js/user/menu.js (STABILIZED)
// ==========================================
function renderMenu() {
    const menuList = document.getElementById("menu-list");
    if (!menuList) return;

    let items = [];
    // Gunakan menuData global yang sudah ada di sistem
    if (typeof menuData !== 'undefined') {
        if (typeof currentCategory === 'undefined' || currentCategory === "all") {
            items = [...(menuData.makanan || []), ...(menuData.minuman || []), ...(menuData.dessert || [])];
        } else {
            items = [...(menuData[currentCategory] || [])];
        }
    }

    // Filter ketersediaan dan pencarian
    items = items.filter(item => item.available !== false);
    if (typeof currentSearchKeyword !== 'undefined' && currentSearchKeyword.trim() !== "") {
        items = items.filter(item => item.name.toLowerCase().includes(currentSearchKeyword.toLowerCase()));
    }
    
    // Render ke HTML
    menuList.innerHTML = items.length === 0 ? '<p style="text-align:center;">Menu tidak tersedia atau tidak ditemukan.</p>' : "";
    
    items.forEach((item, index) => {
        const safeName = item.name.replace(/'/g, "\\'");
        const card = document.createElement("div");
        card.className = "menu-card";
        card.innerHTML = `
            <h3>${item.name}</h3>
            <p>${typeof formatPrice !== 'undefined' ? formatPrice(item.price) : item.price}</p>
            <button onclick="openQuickAddPopup('${safeName}')">Add</button>
        `;
        menuList.appendChild(card);
    });
}
