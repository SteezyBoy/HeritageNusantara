// ==================== UTILITIES ====================
// File: js/utils.js

let isDarkMode = localStorage.getItem("hn_darkmode") === "true";

// Format Harga ke Rupiah
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

// Dark Mode Toggle
function applyDarkMode() {
    if (isDarkMode) {
        document.documentElement.setAttribute("data-theme", "dark");
        document.getElementById("theme-icon").textContent = "☀️";
    } else {
        document.documentElement.setAttribute("data-theme", "light");
        document.getElementById("theme-icon").textContent = "🌙";
    }
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem("hn_darkmode", isDarkMode);
    applyDarkMode();
}

// Skeleton Loading UI
function showSkeletonLoading() {
    const grid = document.getElementById("menu-grid");
    if (!grid) return;
    grid.innerHTML = Array(6).fill(`
        <div class="menu-card skeleton-card">
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton skeleton-text" style="width: 70%; margin-top: 15px;"></div>
            <div class="skeleton skeleton-text" style="width: 40%;"></div>
            <div class="skeleton skeleton-text" style="width: 90%; height: 10px;"></div>
            <div class="skeleton skeleton-text" style="width: 80%; height: 10px;"></div>
        </div>
    `).join("");
}

// Notifikasi Toast Share
function showShareToast(message) {
    const toast = document.createElement("div");
    toast.style.position = "fixed";
    toast.style.bottom = "30px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = "var(--text-primary)";
    toast.style.color = "var(--surface)";
    toast.style.padding = "10px 20px";
    toast.style.borderRadius = "30px";
    toast.style.fontSize = "14px";
    toast.style.zIndex = "9999";
    toast.style.boxShadow = "var(--shadow-md)";
    toast.innerText = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.5s ease";
        setTimeout(() => toast.remove(), 500);
    }, 2000);
}