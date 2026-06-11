// ==================== CUSTOMER & MENU UI ====================
// File: js/customer.js

let currentCategory = "all";
let currentItem = null;
let currentSearchKeyword = "";
let menuData = { makanan: [], minuman: [], dessert: [] };

// Inisialisasi awal saat web dimuat
document.addEventListener("DOMContentLoaded", async () => {
    applyDarkMode();
    showSkeletonLoading();
    await loadMenu();
    renderMenu();
});

// Ambil data menu via API
async function loadMenu() {
    const data = await fetchAPI("getMenu");
    if (data && data.menu) {
        menuData = data.menu;
        // Pastikan tipe data benar
        for (let cat in menuData) {
            menuData[cat] = menuData[cat].map(item => ({
                ...item,
                price: Number(item.price),
                bestSeller: item.bestSeller === true || item.bestSeller === "true",
                outOfStock: item.outOfStock === true || item.outOfStock === "true"
            }));
        }
    } else {
        console.warn("Gagal load menu, menggunakan data kosong.");
    }
}

// Helper untuk mengambil semua menu jadi 1 array
function getAllItems() {
    return [...menuData.makanan, ...menuData.dessert, ...menuData.minuman];
}

// Logic Filter & Sort
function getFilteredAndSortedItems() {
    let items = currentCategory === "all" ? getAllItems() : [...(menuData[currentCategory] || [])];
    
    if (currentSearchKeyword.trim() !== "") {
        items = items.filter(item => item.name.toLowerCase().includes(currentSearchKeyword.toLowerCase()));
    }
    
    const sortValue = document.getElementById("sortMenu")?.value;
    if (sortValue === "az") items.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortValue === "za") items.sort((a, b) => b.name.localeCompare(a.name));
    else if (sortValue === "low") items.sort((a, b) => a.price - b.price);
    else if (sortValue === "high") items.sort((a, b) => b.price - a.price);
    
    return items;
}

// Render HTML Menu Card
function renderMenu() {
    const items = getFilteredAndSortedItems();
    const menuList = document.getElementById("menu-list");
    if (!menuList) return;
    
    menuList.innerHTML = "";
    
    if (items.length === 0) {
        showEmptyState(currentSearchKeyword || "kategori ini");
        return;
    }
    
    items.forEach((item, index) => {
        const safeName = item.name.replace(/'/g, "\\'");
        const isOutOfStock = item.outOfStock === true;
        
        const card = document.createElement("div");
        card.className = "menu-card";
        if (isOutOfStock) card.classList.add("out-of-stock");
        card.style.animationDelay = `${index * 0.06}s`;
        
        card.innerHTML = `
            <div class="image-wrapper">
                ${item.bestSeller ? `<div class="best-seller">🔥 BEST SELLER</div>` : ''}
                ${isOutOfStock ? `<div class="out-of-stock-badge">⛔ HABIS</div>` : ''}
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
                    <button class="add-to-cart-btn ${isOutOfStock ? 'disabled' : ''}" ${isOutOfStock ? 'disabled' : `onclick="openQuickAddPopup('${safeName}')"`}>${isOutOfStock ? 'Habis' : '+ Add To Cart'}</button>
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
        <h3>Tidak ada menu ditemukan</h3>
        <p>Hasil kosong untuk "<strong>${keyword}</strong>"</p>
        <button class="empty-state-btn" onclick="clearSearch()">Clear Search</button>
    </div>`;
}

// Aksi User pada Menu
function clearSearch() {
    document.getElementById("searchInput").value = "";
    currentSearchKeyword = "";
    renderMenu();
}
function searchMenu() { 
    currentSearchKeyword = document.getElementById("searchInput").value; 
    renderMenu(); 
}
function sortMenu() { renderMenu(); }
function changeCategory(btn, category) {
    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = category;
    currentSearchKeyword = "";
    document.getElementById("searchInput").value = "";
    showSkeletonLoading();
    setTimeout(() => renderMenu(), 400);
}

// ==================== MODAL DETAIL ====================
function openModalByName(itemName) {
    const items = getAllItems();
    currentItem = items.find(i => i.name === itemName);
    if (!currentItem) return;
    
    const isOutOfStock = currentItem.outOfStock === true;
    document.getElementById("modal-qty").innerText = "1";
    document.getElementById("modal-notes").value = "";
    document.getElementById("modal-image").src = currentItem.image;
    document.getElementById("modal-name").innerText = currentItem.name;
    document.getElementById("modal-category").innerText = currentItem.category;
    document.getElementById("modal-price").innerText = formatPrice(currentItem.price);
    document.getElementById("modal-desc").innerText = currentItem.desc;
    
    const addBtn = document.querySelector(".modal-add-btn");
    if (isOutOfStock) {
        addBtn.disabled = true;
        addBtn.textContent = "⛔ Habis";
        addBtn.style.background = "#ccc";
    } else {
        addBtn.disabled = false;
        addBtn.textContent = "Add To Cart";
        addBtn.style.background = "linear-gradient(105deg, var(--accent2), var(--accent))";
    }
    
    const scrollable = document.querySelector(".modal-scrollable");
    if (scrollable) scrollable.scrollTop = 0;
    document.getElementById("modal").style.display = "flex";
}

function closeModal() { 
    document.getElementById("modal").style.display = "none"; 
    currentItem = null; 
}

function increaseModalQty() {
    let s = document.getElementById("modal-qty");
    s.innerText = parseInt(s.innerText) + 1;
}
function decreaseModalQty() {
    let s = document.getElementById("modal-qty");
    let v = parseInt(s.innerText);
    if (v > 1) s.innerText = v - 1;
}

// Share
function shareItem() {
    if (!currentItem) return;
    const text = `🍽️ ${currentItem.name}\n${formatPrice(currentItem.price)}\n\n${currentItem.desc}\n\n— Heritage Nusantara`;
    if (navigator.share) {
        navigator.share({ title: currentItem.name, text: text }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text).then(() => {
            showShareToast("📋 Menu info copied!");
        }).catch(() => { showShareToast("💡 Share: " + currentItem.name); });
    }
}