async function loadMenuFromSheet() {
    const url = getAppsScriptUrl();
    console.log("Apps Script URL:", url);
    
    // Jika URL tidak valid, langsung pakai default
    if (!url || url === "PASTE_YOUR_APPS_SCRIPT_URL_HERE" || url === "") {
        console.warn("Apps Script URL not set, using default menu");
        setDefaultMenu();
        renderMenu();
        return;
    }
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 detik timeout
        
        const response = await fetch(`${url}?action=getMenu`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        if (data.menu && Array.isArray(data.menu) && data.menu.length > 0) {
            const newMenu = { makanan: [], minuman: [], dessert: [] };
            data.menu.forEach(item => {
                let categoryKey = "makanan";
                if (item.category === "minuman") categoryKey = "minuman";
                else if (item.category === "dessert") categoryKey = "dessert";
                else categoryKey = "makanan";
                newMenu[categoryKey].push({
                    name: item.name,
                    category: item.category || "Menu",
                    bestSeller: item.bestSeller === true,
                    image: item.image || "",
                    desc: item.desc || "",
                    price: Number(item.price) || 0,
                    available: item.available !== false
                });
            });
            menuData = newMenu;
            console.log("Menu loaded from API:", menuData);
        } else {
            console.warn("API returned empty menu, using default");
            setDefaultMenu();
        }
    } catch (err) {
        console.error("Failed to load menu from Sheets, using default:", err);
        setDefaultMenu();
    }
    
    // Pastikan renderMenu dipanggil setelah menu siap
    renderMenu();
}

function setDefaultMenu() {
    menuData = cloneDefaultMenu();
    console.log("Default menu loaded:", menuData);
}

function getFilteredAndSortedItems() {
    let items = currentCategory === "all" ? getAllItems() : [...menuData[currentCategory]];
    // Filter out of stock
    items = items.filter(item => item.available !== false);
    // Filter search
    if (currentSearchKeyword.trim() !== "") {
        const kw = currentSearchKeyword.toLowerCase();
        items = items.filter(item => item.name.toLowerCase().includes(kw));
    }
    // Sort
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
    
    console.log("Rendering menu, items count:", items.length);
    
    if (items.length === 0) {
        // Tampilkan pesan lebih informatif
        menuList.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">🍽️</div>
            <h3>No menu found</h3>
            <p>No results for "${currentSearchKeyword || (currentCategory === 'all' ? 'all categories' : currentCategory)}"</p>
            <button class="empty-state-btn" onclick="clearSearch()">Clear Search</button>
            <button class="empty-state-btn" onclick="location.reload()" style="margin-top:10px;background:#64748b;">⟳ Refresh Page</button>
        </div>`;
        return;
    }
    
    menuList.innerHTML = "";
    items.forEach((item, index) => {
        const safeName = item.name.replace(/'/g, "\\'");
        const isAvailable = item.available !== false;
        const card = document.createElement("div");
        card.className = "menu-card";
        card.style.animationDelay = `${index * 0.06}s`;
        card.innerHTML = `
            <div class="image-wrapper">
                ${item.bestSeller ? `<div class="best-seller">🔥 BEST SELLER</div>` : ''}
                <img src="${item.image || 'images/placeholder.jpg'}" alt="${item.name}" loading="lazy" class="menu-img"
                     onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22240%22><rect fill=%22%23f1f5f9%22 width=%22400%22 height=%22240%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2240%22>🍽️</text></svg>'">
            </div>
            <div class="menu-info">
                <div class="food-tag">${item.category || "Menu"}</div>
                <h3>${item.name}</h3>
                <div class="price">${formatPrice(item.price)}</div>
                <p>${(item.desc || "").substring(0, 80)}${(item.desc || "").length > 80 ? '...' : ''}</p>
                <div class="card-actions">
                    <button class="detail-btn" onclick="openModalByName('${safeName}')">View Details</button>
                    ${isAvailable ? `<button class="add-to-cart-btn" onclick="openQuickAddPopup('${safeName}')">+ Add To Cart</button>` : '<button class="add-to-cart-btn" style="background:#64748b;cursor:not-allowed;" disabled>❌ Out of Stock</button>'}
                </div>
            </div>`;
        menuList.appendChild(card);
    });
}

function showEmptyState(keyword) {
    const menuList = document.getElementById("menu-list");
    menuList.innerHTML = `
    <div class="empty-state">
        <div class="empty-state-icon">🍽️</div>
        <h3>No menu found</h3>
        <p>No results for "<strong>${keyword}</strong>"</p>
        <button class="empty-state-btn" onclick="clearSearch()">Clear Search</button>
        <button class="empty-state-btn" onclick="location.reload()" style="margin-top:10px;background:#64748b;">⟳ Refresh Page</button>
    </div>`;
}

function clearSearch() {
    document.getElementById("searchInput").value = "";
    currentSearchKeyword = "";
    renderMenu();
}

function searchMenu() { 
    currentSearchKeyword = document.getElementById("searchInput").value; 
    renderMenu(); 
}

function sortMenu() { 
    renderMenu(); 
}

function changeCategory(btn, category) {
    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = category;
    currentSearchKeyword = "";
    document.getElementById("searchInput").value = "";
    showSkeletonLoading();
    setTimeout(() => renderMenu(), 200);
}
