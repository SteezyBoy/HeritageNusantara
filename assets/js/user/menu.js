// ================================================================
// HERITAGE NUSANTARA - User Menu (Simplified, selalu tampil)
// ================================================================

function getAllItems() {
    if (!menuData) return [];
    const items = [];
    if (menuData.makanan) items.push(...menuData.makanan);
    if (menuData.minuman) items.push(...menuData.minuman);
    if (menuData.dessert) items.push(...menuData.dessert);
    return items;
}

function getFilteredAndSortedItems() {
    let items = currentCategory === "all" ? getAllItems() : [...(menuData[currentCategory] || [])];
    items = items.filter(item => item.available !== false);
    if (currentSearchKeyword.trim() !== "") {
        const kw = currentSearchKeyword.toLowerCase();
        items = items.filter(item => item.name.toLowerCase().includes(kw));
    }
    const sortValue = document.getElementById("sortMenu")?.value;
    if (sortValue === "az") items.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortValue === "za") items.sort((a, b) => b.name.localeCompare(a.name));
    else if (sortValue === "low") items.sort((a, b) => a.price - b.price);
    else if (sortValue === "high") items.sort((a, b) => b.price - a.price);
    return items;
}

function renderMenu() {
    const items = getFilteredAndSortedItems();
    const menuList = document.getElementById("menu-list");
    if (!menuList) return;
    
    if (items.length === 0) {
        menuList.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">🍽️</div>
            <h3>No menu found</h3>
            <p>Try refreshing the page</p>
            <button class="empty-state-btn" onclick="location.reload()">⟳ Refresh Page</button>
        </div>`;
        return;
    }
    
    menuList.innerHTML = "";
    items.forEach((item, index) => {
        const safeName = item.name.replace(/'/g, "\\'");
        const isAvailable = item.available !== false;
        const card = document.createElement("div");
        card.className = "menu-card";
        card.innerHTML = `
            <div class="image-wrapper">
                ${item.bestSeller ? '<div class="best-seller">🔥 BEST SELLER</div>' : ''}
                <img src="${item.image || ''}" alt="${item.name}" class="menu-img" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22240%22><rect fill=%22%23f1f5f9%22 width=%22400%22 height=%22240%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2240%22>🍽️</text></svg>'">
            </div>
            <div class="menu-info">
                <div class="food-tag">${item.category}</div>
                <h3>${item.name}</h3>
                <div class="price">${formatPrice(item.price)}</div>
                <p>${(item.desc || "").substring(0, 80)}</p>
                <div class="card-actions">
                    <button class="detail-btn" onclick="openModalByName('${safeName}')">View Details</button>
                    ${isAvailable ? `<button class="add-to-cart-btn" onclick="openQuickAddPopup('${safeName}')">+ Add To Cart</button>` : '<button class="add-to-cart-btn" disabled style="background:#64748b;">Out of Stock</button>'}
                </div>
            </div>`;
        menuList.appendChild(card);
    });
}

// API load opsional - TIDAK MEMBLOK RENDER
async function loadMenuFromSheet() {
    const url = getAppsScriptUrl();
    if (!url || url === "PASTE_YOUR_APPS_SCRIPT_URL_HERE") return;
    try {
        const response = await fetch(`${url}?action=getMenu`);
        const data = await response.json();
        if (data.menu && data.menu.length) {
            const newMenu = { makanan: [], minuman: [], dessert: [] };
            data.menu.forEach(item => {
                let cat = "makanan";
                if (item.category === "minuman") cat = "minuman";
                else if (item.category === "dessert") cat = "dessert";
                newMenu[cat].push({ ...item, price: Number(item.price), available: item.available !== false });
            });
            menuData = newMenu;
            renderMenu();
        }
    } catch(e) { console.warn("API failed, using default menu"); }
}

function changeCategory(btn, category) {
    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = category;
    currentSearchKeyword = "";
    document.getElementById("searchInput").value = "";
    renderMenu();
}

function searchMenu() { currentSearchKeyword = document.getElementById("searchInput").value; renderMenu(); }
function sortMenu() { renderMenu(); }
function clearSearch() { document.getElementById("searchInput").value = ""; currentSearchKeyword = ""; renderMenu(); }
