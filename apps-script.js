// ================================================================
// HERITAGE NUSANTARA - Google Apps Script
// Paste SELURUH kode ini ke Google Apps Script
// ================================================================

const SHEET_NAME_ORDERS = "Pesanan";
const SHEET_NAME_MENU   = "Menu";
const ADMIN_PASSWORD    = "heritage2026";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === "newOrder")     return handleNewOrder(data);
    if (data.action === "updateMenu")   return handleUpdateMenu(data);
    if (data.action === "updateStatus") return handleUpdateStatus(data);
    if (data.action === "deleteOrder")  return handleDeleteOrder(data);
    return respond({ status: "error", message: "Unknown action" });
  } catch(err) {
    return respond({ status: "error", message: err.toString() });
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    if (action === "getOrders") return handleGetOrders(e);
    if (action === "getMenu")   return handleGetMenu(e);
    if (action === "getStats")  return handleGetStats(e);
    if (action === "getOrderById") return handleGetOrderById(e);
    return respond({ status: "error", message: "Unknown action" });
  } catch(err) {
    return respond({ status: "error", message: err.toString() });
  }
}

// ── HELPERS ──────────────────────────────────────────────────────
function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground("#ff5400")
      .setFontColor("#ffffff")
      .setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ── ORDER HANDLERS ────────────────────────────────────────────────
function handleNewOrder(data) {
  const headers = [
    "ID Pesanan","Waktu","No. Meja","Nama Item","Qty","Harga Satuan",
    "Subtotal","Catatan","Total Order","Status"
  ];
  const sheet = getOrCreateSheet(SHEET_NAME_ORDERS, headers);

  const orderId   = "ORD-" + new Date().getTime();
  const timestamp = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  const tableNum  = data.tableNumber || "-";
  const total     = data.items.reduce((s, i) => s + i.price * i.qty, 0);

  data.items.forEach((item, idx) => {
    sheet.appendRow([
      orderId,
      timestamp,
      tableNum,
      item.name,
      item.qty,
      item.price,
      item.price * item.qty,
      item.notes || "-",
      idx === 0 ? total : "",
      "Baru"
    ]);
  });

  const lastRow = sheet.getLastRow();
  const startRow = lastRow - data.items.length + 1;
  sheet.getRange(startRow, 6, data.items.length, 3)
       .setNumberFormat("\"Rp \"#,##0");
  sheet.getRange(startRow, 1, data.items.length, headers.length)
       .setBackground("#fff7ed");

  return respond({ status: "ok", orderId: orderId });
}

function handleGetOrders(e) {
  const sheet = getOrCreateSheet(SHEET_NAME_ORDERS, [
    "ID Pesanan","Waktu","No. Meja","Nama Item","Qty","Harga Satuan",
    "Subtotal","Catatan","Total Order","Status"
  ]);

  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return respond({ status: "ok", orders: [] });

  const orderMap = {};
  rows.slice(1).forEach(row => {
    const id = row[0];
    if (!id) return;
    if (!orderMap[id]) {
      orderMap[id] = {
        id:        id,
        time:      row[1],
        table:     row[2],
        total:     row[8] || 0,
        status:    row[9],
        items:     []
      };
    }
    orderMap[id].items.push({
      name:     row[3],
      qty:      row[4],
      price:    row[5],
      subtotal: row[6],
      notes:    row[7]
    });
    if (row[8]) orderMap[id].total = row[8];
    orderMap[id].status = row[9];
  });

  const orders = Object.values(orderMap).reverse();
  return respond({ status: "ok", orders: orders });
}

function handleGetStats(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_ORDERS);
  if (!sheet) return respond({ status: "ok", stats: {} });

  const rows = sheet.getDataRange().getValues().slice(1);
  const today = new Date().toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" });

  let totalRevenue = 0, todayRevenue = 0, totalOrders = 0, todayOrders = new Set();
  const itemCount = {}, orderIds = new Set();

  rows.forEach(row => {
    const id = row[0]; if (!id) return;
    const rowDate = new Date(row[1]).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" });
    const subtotal = Number(row[6]) || 0;
    const itemName = row[3];
    const qty = Number(row[4]) || 0;

    totalRevenue += subtotal;
    itemCount[itemName] = (itemCount[itemName] || 0) + qty;

    if (!orderIds.has(id)) {
      orderIds.add(id);
      totalOrders++;
    }
    if (rowDate === today) {
      todayRevenue += subtotal;
      todayOrders.add(id);
    }
  });

  const topItems = Object.entries(itemCount)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({ name, qty }));

  return respond({
    status: "ok",
    stats: {
      totalRevenue,
      todayRevenue,
      totalOrders,
      todayOrders: todayOrders.size,
      topItems
    }
  });
}

// ── GET ORDER BY ID (BARU) ──────────────────────────────────────────
function handleGetOrderById(e) {
  const orderId = e.parameter.id;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_ORDERS);
  if (!sheet) return respond({ status: "error", message: "Sheet not found", order: null });
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return respond({ status: "ok", order: null });
  
  let orderItems = [];
  let orderTime = "", orderTable = "", orderStatus = "", orderTotal = 0;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === orderId) {
      orderTime = rows[i][1];
      orderTable = rows[i][2];
      orderTotal = rows[i][8];
      orderStatus = rows[i][9];
      orderItems.push({
        name: rows[i][3],
        qty: rows[i][4],
        price: rows[i][5],
        subtotal: rows[i][6],
        notes: rows[i][7],
        status: rows[i][9] // untuk sementara, semua item dapat status dari order
      });
    }
  }
  if (orderItems.length === 0) {
    return respond({ status: "ok", order: null });
  }
  const order = {
    id: orderId,
    time: orderTime,
    table: orderTable,
    total: orderTotal,
    status: orderStatus,
    items: orderItems
  };
  return respond({ status: "ok", order: order });
}

// ── UPDATE STATUS ─────────────────────────────────────────────────
function handleUpdateStatus(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_ORDERS);
  if (!sheet) return respond({ status: "error", message: "Sheet not found" });
  const rows = sheet.getDataRange().getValues();
  let found = false;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.orderId) {
      sheet.getRange(i+1, 10).setValue(data.newStatus);
      const color = data.newStatus === "Selesai" ? "#dcfce7"
                  : data.newStatus === "Diproses" ? "#fef9c3"
                  : "#fff7ed";
      sheet.getRange(i+1, 1, 1, 10).setBackground(color);
      found = true;
      break;
    }
  }
  if (!found) return respond({ status: "error", message: "Order not found" });
  return respond({ status: "ok" });
}

// ── DELETE ORDER ──────────────────────────────────────────
function handleDeleteOrder(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_ORDERS);
  if (!sheet) return respond({ status: "error", message: "Sheet not found" });
  const orderId = data.orderId;
  const rows = sheet.getDataRange().getValues();
  let rowsToDelete = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === orderId) {
      rowsToDelete.push(i + 1);
    }
  }
  if (rowsToDelete.length === 0) return respond({ status: "error", message: "Order not found" });
  rowsToDelete.reverse().forEach(rowNum => {
    sheet.deleteRow(rowNum);
  });
  return respond({ status: "ok" });
}

// ── MENU HANDLERS ─────────────────────────────────────────────────
function handleGetMenu(e) {
  const sheet = getOrCreateSheet(SHEET_NAME_MENU, [
    "Kategori","Nama","Harga","Deskripsi","Gambar","Best Seller"
  ]);
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return respond({ status: "ok", menu: [] });

  const menu = rows.slice(1).map(r => ({
    category:   r[0],
    name:       r[1],
    price:      Number(r[2]),
    desc:       r[3],
    image:      r[4],
    bestSeller: r[5] === true || r[5] === "TRUE" || r[5] === "true"
  }));
  return respond({ status: "ok", menu: menu });
}

function handleUpdateMenu(data) {
  const sheet = getOrCreateSheet(SHEET_NAME_MENU, [
    "Kategori","Nama","Harga","Deskripsi","Gambar","Best Seller"
  ]);
  if (sheet.getLastRow() > 1)
    sheet.getRange(2, 1, sheet.getLastRow()-1, 6).clearContent();

  const rows = data.menu.map(item => [
    item.category, item.name, item.price,
    item.desc, item.image, item.bestSeller
  ]);
  if (rows.length > 0)
    sheet.getRange(2, 1, rows.length, 6).setValues(rows);

  return respond({ status: "ok" });
}