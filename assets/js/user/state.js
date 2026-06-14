let currentCategory     = "all";
let currentItem         = null;
let cart                = [];
let currentSearchKeyword = "";
let quickAddItem        = null;
let quickQty            = 1;
let isDarkMode          = localStorage.getItem(STORAGE_KEYS.darkMode) === "true";

// ========== FALLBACK MENU (AGAR TIDAK KOSONG) ==========
const FALLBACK_MENU = {
    makanan: [
        { name: "Tahu Isi Goreng", category: "Appetizer", bestSeller: true, image: "images/TAHU ISI GORENG.jpeg", desc: "Tahu renyah yang digoreng keemasan.", price: 35000, available: true },
        { name: "Lumpia Semarang", category: "Appetizer", bestSeller: false, image: "images/LUMPIA SEMARANG.jpeg", desc: "Camilan legendaris khas Semarang.", price: 45000, available: true },
        { name: "Soto Ayam Lamongan", category: "Soup", bestSeller: true, image: "images/SOTO AYAM LAMONGAN.jpeg", desc: "Kuah soto kuning kaya rempah.", price: 40000, available: true },
        { name: "Nasi Goreng Kampung", category: "Main Course", bestSeller: true, image: "images/NASI GORENG KAMPUNG.jpeg", desc: "Nasi goreng beraroma terasi.", price: 75000, available: true },
        { name: "Rendang Daging Sapi", category: "Main Course", bestSeller: true, image: "images/RENDANG DAGING SAPI.jpeg", desc: "Mahakarya kuliner Minang.", price: 90000, available: true }
    ],
    minuman: [
        { name: "Es Teh", category: "Beverage", bestSeller: false, image: "images/ES TEH.jpeg", desc: "Seduhan teh melati dingin.", price: 25000, available: true },
        { name: "Kopi Bali", category: "Beverage", bestSeller: true, image: "images/KOPI BALI.jpeg", desc: "Kopi tubruk dari biji kopi Bali.", price: 30000, available: true }
    ],
    dessert: [
        { name: "Klepon", category: "Dessert", bestSeller: true, image: "images/KLEPON.jpeg", desc: "Jajanan pasar kenyal bertabur kelapa.", price: 30000, available: true }
    ]
};

// Inisialisasi menuData dengan fallback (deep copy)
let menuData = JSON.parse(JSON.stringify(FALLBACK_MENU));
// =====================================================

let activeOrderId       = localStorage.getItem(STORAGE_KEYS.activeOrderId) || null;
let tableNumber         = "";
let monitorInterval     = null;
let cashierPollInterval = null;

function getCartKey() {
    return STORAGE_KEYS.cartPrefix + (tableNumber || "guest");
}

function saveCartToLocal() {
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
}

function loadCartFromLocal() {
    const saved = localStorage.getItem(getCartKey());
    if (saved) {
        try { cart = JSON.parse(saved); } catch(e) { cart = []; }
        updateCartBadge();
    }
}
