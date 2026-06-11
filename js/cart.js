// ==================== CART & CHECKOUT ====================
// File: js/cart.js

let cart = [];
let quickAddItem = null;
let quickQty = 1;
let pendingOrderData = null;

// ==================== QUICK ADD MODAL ====================
function openQuickAddPopup(itemName) {
    const items = getAllItems(); // dari customer.js
    quickAddItem = items.find(i => i.name === itemName);
    if (!quickAddItem) return;
    
    if (quickAddItem.outOfStock) {
        showShareToast("Item sedang habis!");
        return;
    }
    quickQty = 1;
    document.getElementById("quickQty").innerText = quickQty;
    document.getElementById("quickAddItemName").innerText = quickAddItem.name;
    document.getElementById("quickNotes").value = "";
    document.getElementById("quickAddModal").style.display = "flex";
}

function closeQuickAddModal() { 
    document.getElementById("quickAddModal").style.display = "none"; 
    quickAddItem = null; 
}
function increaseQuickQty() { 
    quickQty++; 
    document.getElementById("quickQty").innerText = quickQty; 
}
function decreaseQuickQty() { 
    if (quickQty > 1) { 
        quickQty--; 
        document.getElementById("quickQty").innerText = quickQty; 
    } 
}
function confirmQuickAdd() {
    if (!quickAddItem) return;
    const notes = document.getElementById("quickNotes").value.trim();
    addItemToCart(quickAddItem, quickQty, notes);
    closeQuickAddModal();
    showSuccessPopup();
}

function addToCartFromModal() {
    if (!currentItem) return; // currentItem dari customer.js
    if (currentItem.outOfStock) {
        showShareToast("Item sedang habis!");
        return;
    }
    const qty = parseInt(document.getElementById("modal-qty").innerText);
    const notes = document.getElementById("modal-notes").value.trim();
    addItemToCart(currentItem, qty, notes);
    closeModal();
    showSuccessPopup();
}

function showSuccessPopup(message = "Successfully added to cart!") {
    const popup = document.getElementById("success-popup");
    const msgElem = popup.querySelector("p");
    if (msgElem) msgElem.textContent = message;
    popup.classList.add("show");
    setTimeout(() => popup.classList.remove("show"), 2000);
}

// ==================== CART CORE ====================
function addItemToCart(item, qty, notes) {
    const existing = cart.find(c => c.name === item.name);
    if (existing) {
        existing.quantity += qty;
        if (notes) existing.notes = existing.notes ? existing.notes + "; " + notes : notes;
    } else {
        cart.push({ ...item, quantity: qty, notes: notes });
    }
    updateCartBadge();
    animateCartIcon();
}

function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById("cart-count");
    if (badge) badge.innerText = totalItems;
}

function animateCartIcon() {
    const btn = document.getElementById("cartIconBtn");
    if (!btn) return;
    btn.classList.remove("cart-pop");
    void btn.offsetWidth; // trigger reflow
    btn.classList.add("cart-pop");
    setTimeout(() => btn.classList.remove("cart-pop"), 500);
}

function updateCart() {
    updateCartBadge();
    const container = document.getElementById("cart-items");
    const emptyState = document.getElementById("cart-empty-state");
    if (!container) return;
    
    container.innerHTML = "";
    
    if (cart.length === 0) {
        if (emptyState) emptyState.style.display = "block";
        container.style.display = "none";
        const totalSpan = document.getElementById("cart-total");
        if (totalSpan) totalSpan.innerText = formatPrice(0);
        return;
    }
    
    if (emptyState) emptyState.style.display = "none";
    container.style.display = "block";
    
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
        <div class="cart-item-info">
            <strong>${item.name}</strong>
            <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
            ${item.notes ? `<span class="cart-notes">📝 ${item.notes}</span>` : ''}
        </div>
        <div class="cart-item-controls">
            <button class="btn-qty" onclick="changeCartQty(${index}, -1)">-</button>
            <span>${item.quantity}</span>
            <button class="btn-qty" onclick="changeCartQty(${index}, 1)">+</button>
            <button class="btn-remove" onclick="removeCartItem(${index})">🗑️</button>
        </div>`;
        container.appendChild(div);
    });
    const totalSpan = document.getElementById("cart-total");
    if (totalSpan) totalSpan.innerText = formatPrice(total);
}

function changeCartQty(index, amount) {
    cart[index].quantity += amount;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    updateCart();
}

function removeCartItem(index) { 
    cart.splice(index, 1); 
    updateCart(); 
}

function clearCart() {
    if (cart.length === 0) return;
    if (confirm("Clear all items from cart?")) { 
        cart = []; 
        updateCart(); 
    }
}

// ==================== CHECKOUT NAVIGATION ====================
function openCart() {
    updateCart();
    document.getElementById("cartModal").style.display = "block";
    document.getElementById("cart-screen").style.display = "block";
    document.getElementById("order-summary-screen").style.display = "none";
    document.getElementById("payment-screen").style.display = "none";
    document.getElementById("payment-confirm-screen").style.display = "none";
}

function closeCart() { 
    document.getElementById("cartModal").style.display = "none"; 
}

function openOrderSummary() {
    if (cart.length === 0) { showShareToast("🛒 Your cart is empty!"); return; }
    const summaryContainer = document.getElementById("order-summary-items");
    summaryContainer.innerHTML = "";
    let total = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
        summaryContainer.innerHTML += `
        <div class="summary-item">
            <div class="summary-item-left">
                <span class="summary-item-qty">${item.quantity}×</span>
                <span class="summary-item-name">${item.name}</span>
                ${item.notes ? `<span class="summary-item-note">📝 ${item.notes}</span>` : ''}
            </div>
            <span class="summary-item-price">${formatPrice(item.price * item.quantity)}</span>
        </div>`;
    });
    
    document.getElementById("order-summary-grand-total").innerText = formatPrice(total);
    const now = new Date();
    const timeStr = now.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
    document.getElementById("order-time-display").innerHTML = `🕐 Order Time: ${timeStr}`;
    
    document.getElementById("cart-screen").style.display = "none";
    document.getElementById("order-summary-screen").style.display = "block";
}

function openPayment() {
    if (cart.length === 0) { showShareToast("Cart kosong!"); return; }
    const tableNum = document.getElementById("tableNumber").value.trim() || "—";
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const now = new Date();
    const timeStr = now.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

    document.getElementById("payTableInfo").innerHTML = `🪑 Table: <strong>${tableNum}</strong>`;
    document.getElementById("payTotalInfo").innerHTML = `💰 Total: <strong>${formatPrice(total)}</strong>`;
    document.getElementById("payTimeInfo").innerHTML  = `🕐 Time: <strong>${timeStr}</strong>`;

    document.getElementById("order-summary-screen").style.display = "none";
    document.getElementById("payment-screen").style.display = "block";
    document.getElementById("payment-confirm-screen").style.display = "none";

    pendingOrderData = {
        tableNumber: tableNum,
        items: cart.map(item => ({
            name: item.name,
            qty: item.quantity,
            price: item.price,
            notes: item.notes || ""
        }))
    };
}

async function confirmPayment() {
    if (!pendingOrderData) return;

    const confirmBtn = document.querySelector("#payment-screen .checkout-btn");
    const originalText = confirmBtn.innerText;
    confirmBtn.innerText = "⏳ Memproses...";
    confirmBtn.disabled = true;

    document.getElementById("payment-screen").style.display = "none";
    document.getElementById("payment-confirm-screen").style.display = "block";
    document.getElementById("confirm-status").innerHTML = "⏳ Mengirim pesanan ke dapur...";

    // Tembak API via utils api.js
    const result = await postAPI("newOrder", pendingOrderData);

    if (result && result.status === "ok") {
        document.getElementById("confirm-status").innerHTML = "✅ Pesanan berhasil! Admin akan segera memproses.";
        cart = [];
        updateCartBadge();
        showSuccessPopup("Pembayaran berhasil! Pesanan diterima.");
        
        setTimeout(() => {
            closeCart();
            document.getElementById("payment-confirm-screen").style.display = "none";
            document.getElementById("payment-screen").style.display = "block";
            confirmBtn.innerText = originalText;
            confirmBtn.disabled = false;
            pendingOrderData = null;
        }, 3000);
    } else {
        document.getElementById("confirm-status").innerHTML = "❌ Gagal mengirim pesanan. Coba lagi.";
        setTimeout(() => {
            document.getElementById("payment-confirm-screen").style.display = "none";
            document.getElementById("payment-screen").style.display = "block";
            confirmBtn.innerText = originalText;
            confirmBtn.disabled = false;
        }, 2000);
    }
}

// Navigasi Kembali
function backToCart() {
    document.getElementById("order-summary-screen").style.display = "none";
    document.getElementById("cart-screen").style.display = "block";
}
function backToSummary() {
    document.getElementById("payment-screen").style.display = "none";
    document.getElementById("order-summary-screen").style.display = "block";
}