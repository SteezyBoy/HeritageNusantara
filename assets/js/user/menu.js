// ==========================================
// FILE: assets/js/user/menu.js (STABILIZED)
// ==========================================
function renderMenu() {
    const menuList = document.getElementById("menu-list");
    if (!menuList) return;

    // 1. Ambil data dengan aman
    let items = [];
    if (typeof menuData !== 'undefined') {
        if (currentCategory === "all") {
            items = [...(menuData.makanan || []), ...(menuData.minuman || []), ...(menuData.dessert || [])];
        } else {
            items = [...(menuData[currentCategory] || [])];
        }
    }

    // 2. Filter & Sort
    items = items.filter(item => item.available !== false);
    if (currentSearchKeyword && currentSearchKeyword.trim() !== "") {
        items = items.filter(item => item.name.toLowerCase().includes(currentSearchKeyword.toLowerCase()));
    }
    
    // 3. Render
    menuList.innerHTML = items.length === 0 ? '<p style="text-align:center;">Menu tidak ditemukan.</p>' : "";
    
    items.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "menu-card";
        card.innerHTML = `
            <h3>${item.name}</h3>
            <p>${formatPrice(item.price)}</p>
            <button onclick="openQuickAddPopup('${item.name.replace(/'/g, "\\'")}')">Add</button>
        `;
        menuList.appendChild(card);
    });
}
