// ================================================================
// HERITAGE NUSANTARA - Default Menu (Hardcoded, no dependency)
// ================================================================

const DEFAULT_MENU_DATA = {
    makanan: [
        { name: "Tahu Isi Goreng", category: "Appetizer", bestSeller: true, image: "", desc: "Tahu renyah yang digoreng keemasan, berisi sayuran segar pilihan.", price: 35000, available: true },
        { name: "Lumpia Semarang", category: "Appetizer", bestSeller: false, image: "", desc: "Camilan legendaris khas Semarang dengan isian rebung manis gurih.", price: 45000, available: true },
        { name: "Soto Ayam Lamongan", category: "Soup", bestSeller: true, image: "", desc: "Kuah soto kuning kaya rempah dengan suwiran ayam kampung.", price: 40000, available: true },
        { name: "Nasi Goreng Kampung", category: "Main Course", bestSeller: true, image: "", desc: "Nasi goreng beraroma terasi khas pedesaan.", price: 75000, available: true },
        { name: "Rendang Daging Sapi", category: "Main Course", bestSeller: true, image: "", desc: "Mahakarya kuliner Minang. Daging sapi pilihan.", price: 90000, available: true },
        { name: "Ayam Bakar Taliwang", category: "Main Course", bestSeller: true, image: "", desc: "Ayam kampung bakar bumbu pedas manis khas Lombok.", price: 85000, available: true }
    ],
    minuman: [
        { name: "Es Teh", category: "Beverage", bestSeller: false, image: "", desc: "Seduhan teh melati pilihan yang dihidangkan dingin.", price: 25000, available: true },
        { name: "Kopi Bali", category: "Beverage", bestSeller: true, image: "", desc: "Kopi tubruk dari biji kopi Bali premium.", price: 30000, available: true }
    ],
    dessert: [
        { name: "Klepon", category: "Dessert", bestSeller: true, image: "", desc: "Jajanan pasar kenyal bertabur kelapa parut segar.", price: 30000, available: true },
        { name: "Es Cendol", category: "Dessert", bestSeller: true, image: "", desc: "Paduan kenyalnya cendol pandan dan manisnya gula aren.", price: 45000, available: true }
    ]
};

function cloneDefaultMenu() {
    return JSON.parse(JSON.stringify(DEFAULT_MENU_DATA));
}
