function doPost(e) {
  var payload = JSON.parse(e.postData.contents || "{}");
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("Partner Intake");

  if (!sheet) {
    sheet = spreadsheet.insertSheet("Partner Intake");
    sheet.appendRow([
      "submittedAt",
      "flowType",
      "source",
      "sourcePage",
      "sourceComponent",
      "partnerType",
      "organization",
      "contactName",
      "email",
      "phone",
      "venueName",
      "propertyName",
      "brandName",
      "category",
      "address",
      "website",
      "intent",
      "perkTitle",
      "perkValue",
      "perkDetails",
      "qrPlacement",
      "pilotWindow",
      "hours",
      "budget",
      "district",
      "objective",
      "campaignName",
      "currentUrl",
      "referrer",
      "userAgent",
    ]);
  }

  sheet.appendRow([
    payload.submittedAt || new Date().toISOString(),
    payload.flowType || "",
    payload.source || "",
    payload.sourcePage || "",
    payload.sourceComponent || "",
    payload.partnerType || "",
    payload.organization || "",
    payload.contactName || "",
    payload.email || "",
    payload.phone || "",
    payload.venueName || "",
    payload.propertyName || "",
    payload.brandName || "",
    payload.category || "",
    payload.address || "",
    payload.website || "",
    payload.intent || "",
    payload.perkTitle || "",
    payload.perkValue || "",
    payload.perkDetails || "",
    payload.qrPlacement || "",
    payload.pilotWindow || "",
    payload.hours || "",
    payload.budget || "",
    payload.district || "",
    payload.objective || "",
    payload.campaignName || "",
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
