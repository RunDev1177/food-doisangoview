const ss = SpreadsheetApp.getActiveSpreadsheet();

function doGet(e) {
  // ดึงข้อมูลจากแผ่นงานต่างๆ
  const tableSheet = ss.getSheetByName('Table');
  const menuSheet = ss.getSheetByName('Menus');
  const openTimeSheet = ss.getSheetByName('OpenTime');
  
  const tables = tableSheet ? tableSheet.getDataRange().getValues() : [];
  const menus = menuSheet ? menuSheet.getDataRange().getValues() : [];
  const openTime = openTimeSheet ? openTimeSheet.getDataRange().getValues() : [];

  const result = {
    tables: tables, // [ ["ลำดับ", "โต๊ะ"], ["1", "1"], ... ]
    menus: menus,
    config: {
      open: openTime[1] ? openTime[1][0] : "00:00",
      close: openTime[1] ? openTime[1][1] : "23:59"
    }
  };

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const orderSheet = ss.getSheetByName('Orders');
    
    // บันทึกออเดอร์ใหม่ลงใน Sheets (อิงตามคอลัมน์ใน DBFood - Orders.csv)
    // รหัสออเดอร์, รายการ, ราคารวม, โต๊ะที่, สถานะ, เวลา
    const orderId = "ORD-" + new Date().getTime().toString().slice(-6);
    const timeNow = Utilities.formatDate(new Date(), "GMT+7", "HH:mm:ss");
    
    orderSheet.appendRow([
      orderId,
      data.items,
      data.price,
      data.table,
      "รอดำเนินการ",
      timeNow
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: "success", id: orderId }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (f) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: f.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}