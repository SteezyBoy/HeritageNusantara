// ==================== API & CONFIG ====================
// File: js/api.js

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxTGELLcJersbyefdBk3ck8EnnXBF3OcRAUELjsYcEM5Vf3kjR8hxfFqXy3sGpskPLT_Q/exec";

// Fungsi umum untuk menembak API
async function fetchAPI(action, params = {}) {
    try {
        let url = `${APPS_SCRIPT_URL}?action=${action}`;
        
        // Jika ada parameter tambahan untuk method GET
        for (const key in params) {
            url += `&${key}=${encodeURIComponent(params[key])}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error(`API Error (${action}):`, error);
        return { status: "error", message: error.message };
    }
}

// Fungsi POST untuk mengirim data
async function postAPI(action, data) {
    try {
        const payload = { action: action, ...data };
        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        return await response.json();
    } catch (error) {
        console.error(`API POST Error (${action}):`, error);
        return { status: "error", message: error.message };
    }
}