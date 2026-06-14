// ================================================================
// HERITAGE NUSANTARA - User Menu
// ================================================================

async function loadMenuFromSheet() {
    const url = getAppsScriptUrl();
    if (!url || url === "PASTE_YOUR_APPS_SCRIPT_URL_HERE") {
        console.warn("URL Apps Script belum diset, pakai menu default");
        setDefaultMenu();
        return;
    }

    // === FIX MOBILE: Selalu load default menu dulu sebagai fallback ===
    // Ini memastikan menu SELALU tampil, bahkan jika fetch gagal di HP
    setDefaultMenu();

    try {
        // Timeout 8 detik - mobile network bisa lambat
        const fetchWithTimeout = Promise.race([
            fetchMenuFromApi(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout")), 8000)
            )
        ]);

        const data = await fetchWithTimeout;

        if (data && data.menu && data.menu.length > 0) {
            const newMenu = { makanan: [], minuman: [], dessert: [] };
            data.menu.forEach(item => {
                let categoryKey = "makanan";
                if (item.category === "minuman") categoryKey = "minuman";
                else if (item.category === "dessert") categoryKey = "dessert";
                else categoryKey = "makanan";
                newMenu[categoryKey].push({
                    name: item.name,
                    category: item.category,
                    bestSeller: item.bestSeller === true,
                    image: item.image,
                    desc: item.desc,
                    price: Number(item.price)
                });
            });
            // Hanya override jika data dari server valid (ada isinya)
            const total = newMenu.makanan.length + newMenu.minuman.length + newMenu.dessert.length;
            if (total > 0) {
                menuData = newMenu;
                console.log("Menu berhasil dimuat dari Google Sheets:", total, "item");
            }
        } else {
            console.warn("Data menu dari server kosong, tetap pakai default");
        }
    } catch (err) {
        console.error("Gagal mengambil menu dari Sheets, pakai default:", err);
        // menuData sudah di-set ke default di atas, tidak perlu panggil lagi
    }
}

function setDefaultMenu() {
    menuData = cloneDefaultMenu();
}

function getFilteredAndSortedItems() {
    let items = currentCategory === "all" ? getAllItems() : [...(menuData[currentCategory] || [])];
    if (currentSearchKeyword.trim() !== "") {
        items = items.filter(item =>
            item.name.toLowerCase().includes(currentSearchKeyword.toLowerCase())
        );
    }
    const sortValue = document.getElementById("sortMenu")?.value;
    if (sortValue === "az")   items.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortValue === "za")   items.sort((a, b) => b.name.localeCompare(a.name));
    else if (sortValue === "low")  items.sort((a, b) => a.price - b.price);
    else if (sortValue === "high") items.sort((a, b) => b.price - a.price);
    return items;
}

function renderMenu() {
    const items = getFilteredAndSortedItems();
    const menuList = document.getElementById("menu-list");
    if (!menuList) return;
    menuList.innerHTML = "";

    // === FIX: Jika masih kosong (harusnya tidak terjadi setelah fix di atas) ===
    const totalItems = getAllItems().length;
    if (items.length === 0 && totalItems === 0) {
        // menuData benar-benar kosong — paksa load default
        setDefaultMenu();
        const retryItems = getFilteredAndSortedItems();
        if (retryItems.length > 0) {
            renderItemsToList(retryItems, menuList);
            return;
        }
    }

    if (items.length === 0) {
        showEmptyState(currentSearchKeyword || currentCategory);
        return;
    }

    renderItemsToList(items, menuList);
}

function renderItemsToList(items, menuList) {
    items.forEach((item, index) => {
        const safeName = escapeJsString(item.name);
        const card = document.createElement("div");
        card.className = "menu-card";
        card.style.animationDelay = `${index * 0.06}s`;
        card.innerHTML = `
            <div class="image-wrapper">
                ${item.bestSeller ? `<div class="best-seller">🔥 BEST SELLER</div>` : ''}
                <img src="${item.image}" alt="${item.name}" loading="lazy" class="menu-img"
                     onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22240%22><rect fill=%22%23f1f5f9%22 width=%22400%22 height=%22240%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2240%22>🍽️</text></svg>'">
            </div>
            <div class="menu-info">
                <div class="food-tag">${item.category}</div>
                <h3>${item.name}</h3>
                <div class="price">${formatPrice(item.price)}</div>
                <p>${item.desc.substring(0, 80)}${item.desc.length > 80 ? '...' : ''}</p>
                <div class="card-actions">
                    <button class="detail-btn" onclick="openModalByName('${safeName}')">View Details</button>
                    <button class="add-to-cart-btn" onclick="openQuickAddPopup('${safeName}')">+ Add To Cart</button>
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
    setTimeout(() => renderMenu(), 400);
}
