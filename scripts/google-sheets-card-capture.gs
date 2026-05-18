function doPost(e) {
  var payload = JSON.parse(e.postData.contents || "{}");
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("Resident Card Leads");

  if (!sheet) {
    sheet = spreadsheet.insertSheet("Resident Card Leads");
    sheet.appendRow([
      "submittedAt",
      "flow",
      "source",
      "firstName",
      "mobile",
      "email",
      "building",
      "sessionId",
      "pagePath",
      "currentUrl",
      "referrer",
      "userAgent",
    ]);
  }

  sheet.appendRow([
    payload.submittedAt || new Date().toISOString(),
    payload.flow || "resident_card",
    payload.source || "",
    payload.firstName || "",
    payload.mobile || "",
    payload.email || "",
    payload.building || "",
    payload.sessionId || "",
    payload.pagePath || "",
    payload.currentUrl || "",
    payload.referrer || "",
    payload.userAgent || "",
  ]);

  var rowId = sheet.getLastRow();

  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      rowId: rowId,
      destination: "google-sheets",
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
