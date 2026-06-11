// ==================== APPS SCRIPT BACKEND ====================
// Heritage Nusantara - Status per item, out of stock, history

const SHEET_NAME_ORDERS = "Pesanan";
const SHEET_NAME_MENU = "Menu";

function doGet(e) {
  const action = e?.parameter?.action || "";
  if (action === "getOrders") {
    return getOrders();
  } else if (action === "getStats") {
    return getStats();
  } else if (action === "getMenu") {
    return getMenu();
  } else if (action === "getAllOrders") {
    return getAllOrders();
  } else if (action === "getOrderById") {
    return getOrderById(e.parameter.id);
  }
  return ContentService.createTextOutput(JSON.stringify({ status: "ok", message: "Heritage API" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = body.action;
  if (action === "newOrder") {
    return saveOrder(body);
  } else if (action === "updateItemStatus") {
    return updateItemStatus(body.orderId, body.itemName, body.newStatus);
  } else if (action === "updateMenu") {
    return updateMenu(body.menu);
  }
  return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Unknown action" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// -------------------- HELPER SHEET --------------------
function getOrCreateSheet(name, headers) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// -------------------- ORDERS (dengan status per item) --------------------
function saveOrder(data) {
  // Headers: ID Pesanan, Waktu, No. Meja, Nama Item, Qty, Harga, Subtotal, Catatan, Status Item, Total, Waktu Selesai Order
  const headers = ["ID Pesanan", "Waktu", "No. Meja", "Nama Item", "Qty", "Harga", "Subtotal", "Catatan", "Status Item", "Total Order", "Waktu Selesai Order"];
  const sheet = getOrCreateSheet(SHEET_NAME_ORDERS, headers);
  const orderId = "ORD-" + Utilities.getUuid().slice(0, 8).toUpperCase();
  const now = new Date();
  let totalOrder = 0;
  const rows = [];
  for (let item of data.items) {
    const subtotal = item.qty * item.price;
    totalOrder += subtotal;
    rows.push([
      orderId, now, data.tableNumber, item.name, item.qty, item.price, subtotal, item.notes || "", "Baru", 0, ""
    ]);
  }
  // Isi total order di setiap baris (kolom ke-10)
  for (let i = 0; i < rows.length; i++) {
    rows[i][9] = totalOrder;
  }
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  return ContentService.createTextOutput(JSON.stringify({ status: "ok", orderId }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_ORDERS);
  if (!sheet) return ContentService.createTextOutput(JSON.stringify({ orders: [] })).setMimeType(ContentService.MimeType.JSON);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const ordersMap = new Map();
  for (let row of data) {
    const id = row[0];
    if (!ordersMap.has(id)) {
      ordersMap.set(id, {
        id: id,
        time: row[1],
        table: row[2],
        total: row[9],
        items: []
      });
    }
    ordersMap.get(id).items.push({
      name: row[3],
      qty: row[4],
      price: row[5],
      subtotal: row[6],
      notes: row[7],
      status: row[8]  // status per item
    });
  }
  const orders = Array.from(ordersMap.values()).reverse();
  return ContentService.createTextOutput(JSON.stringify({ orders })).setMimeType(ContentService.MimeType.JSON);
}

function getAllOrders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_ORDERS);
  if (!sheet) return ContentService.createTextOutput(JSON.stringify({ orders: [] })).setMimeType(ContentService.MimeType.JSON);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const ordersMap = new Map();
  for (let row of data) {
    const id = row[0];
    if (!ordersMap.has(id)) {
      ordersMap.set(id, {
        id: id,
        time: row[1],
        table: row[2],
        total: row[9],
        closed: row[10] ? true : false,
        items: []
      });
    }
    ordersMap.get(id).items.push({
      name: row[3],
      qty: row[4],
      price: row[5],
      subtotal: row[6],
      notes: row[7],
      status: row[8]
    });
  }
  const orders = Array.from(ordersMap.values()).reverse();
  return ContentService.createTextOutput(JSON.stringify({ orders })).setMimeType(ContentService.MimeType.JSON);
}

function getOrderById(orderId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_ORDERS);
  if (!sheet) return ContentService.createTextOutput(JSON.stringify({ order: null })).setMimeType(ContentService.MimeType.JSON);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const order = { id: orderId, items: [], total: 0, table: "", time: "", closed: false };
  let totalOrder = 0;
  for (let row of data) {
    if (row[0] === orderId) {
      order.table = row[2];
      order.time = row[1];
      order.closed = row[10] ? true : false;
      order.items.push({
        name: row[3],
        qty: row[4],
        price: row[5],
        subtotal: row[6],
        notes: row[7],
        status: row[8]
      });
      totalOrder = row[9];
    }
  }
  order.total = totalOrder;
  return ContentService.createTextOutput(JSON.stringify({ order })).setMimeType(ContentService.MimeType.JSON);
}

function updateItemStatus(orderId, itemName, newStatus) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_ORDERS);
  if (!sheet) return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Sheet not found" }));
  const data = sheet.getDataRange().getValues();
  let allItemsCompleted = true;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === orderId) {
      if (data[i][3] === itemName) {
        sheet.getRange(i + 1, 9).setValue(newStatus); // kolom 9 = Status Item
      }
      // Cek apakah masih ada item yang belum selesai
      if (data[i][8] !== "Selesai") allItemsCompleted = false;
    }
  }
  // Jika semua item sudah selesai, tandai order selesai (kolom 11 = Waktu Selesai Order)
  if (allItemsCompleted) {
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === orderId) {
        sheet.getRange(i + 1, 11).setValue(new Date());
        break;
      }
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ status: "ok" })).setMimeType(ContentService.MimeType.JSON);
}

function getStats() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_ORDERS);
  let totalOrders = 0, totalRevenue = 0, todayOrders = 0, todayRevenue = 0, topItems = {};
  if (sheet) {
    const data = sheet.getDataRange().getValues();
    const today = new Date().toDateString();
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const orderDate = new Date(row[1]).toDateString();
      const orderTotal = row[9];
      const itemStatus = row[8];
      const itemName = row[3];
      const qty = row[4];
      // Hitung hanya item yang sudah selesai
      if (itemStatus === "Selesai") {
        totalRevenue += row[6]; // subtotal
        if (orderDate === today) todayRevenue += row[6];
        topItems[itemName] = (topItems[itemName] || 0) + qty;
      }
      // Hitung order selesai jika semua item dalam order sudah selesai (cek per id)
    }
    // Hitung total orders yang selesai (semua item selesai)
    const ordersMap = new Map();
    for (let i = 1; i < data.length; i++) {
      const id = data[i][0];
      if (!ordersMap.has(id)) ordersMap.set(id, { allCompleted: true, completedCount: 0, totalItems: 0 });
      const stat = ordersMap.get(id);
      stat.totalItems++;
      if (data[i][8] === "Selesai") stat.completedCount++;
    }
    for (let [id, stat] of ordersMap) {
      if (stat.completedCount === stat.totalItems) totalOrders++;
      // Untuk todayOrders, hitung order yang selesai hari ini
      const orderDate = new Date(data.find(r => r[0] === id)[1]).toDateString();
      if (stat.completedCount === stat.totalItems && orderDate === today) todayOrders++;
    }
  }
  const topItemsArr = Object.entries(topItems).map(([name, qty]) => ({ name, qty })).sort((a,b)=>b.qty - a.qty).slice(0,5);
  const stats = { totalOrders, totalRevenue, todayOrders, todayRevenue, topItems: topItemsArr };
  return ContentService.createTextOutput(JSON.stringify({ stats })).setMimeType(ContentService.MimeType.JSON);
}

// -------------------- MENU --------------------
function getMenu() {
  const sheet = getOrCreateSheet(SHEET_NAME_MENU, ["category", "name", "price", "desc", "image", "bestSeller", "subcategory", "outOfStock"]);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const menu = { makanan: [], minuman: [], dessert: [] };
  for (let row of data) {
    const [cat, name, price, desc, image, bestSeller, subcat, outOfStock] = row;
    const item = {
      name,
      price: Number(price),
      desc,
      image,
      bestSeller: bestSeller === true || bestSeller === "true",
      category: subcat || cat,
      outOfStock: outOfStock === true || outOfStock === "true"
    };
    if (menu[cat]) menu[cat].push(item);
  }
  return ContentService.createTextOutput(JSON.stringify({ menu })).setMimeType(ContentService.MimeType.JSON);
}

function updateMenu(menuArray) {
  const sheet = getOrCreateSheet(SHEET_NAME_MENU, ["category", "name", "price", "desc", "image", "bestSeller", "subcategory", "outOfStock"]);
  sheet.clearContents();
  sheet.getRange(1,1,1,8).setValues([["category", "name", "price", "desc", "image", "bestSeller", "subcategory", "outOfStock"]]);
  const rows = [];
  for (let item of menuArray) {
    rows.push([
      item.category,
      item.name,
      item.price,
      item.desc,
      item.image,
      item.bestSeller ? "true" : "false",
      item.subcategory || item.category,
      item.outOfStock ? "true" : "false"
    ]);
  }
  if (rows.length) sheet.getRange(2, 1, rows.length, 8).setValues(rows);
  return ContentService.createTextOutput(JSON.stringify({ status: "ok" })).setMimeType(ContentService.MimeType.JSON);
}