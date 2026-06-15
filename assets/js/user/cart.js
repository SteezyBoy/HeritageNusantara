// Contoh implementasi di dalam fungsi addToCart
function addToCart(item) {
    // ... logika lama Anda ...
    cart.push(item);
    
    // TAMBAHKAN INI:
    syncCartState(); 
}

// Lakukan hal yang sama pada fungsi updateCart atau removeCart
