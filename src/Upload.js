var EMPLOYEE_MASTER_HEADERS = ['사번', '성명(마스킹)', '생년월일', '성별', '직종'];
var WAGE_RECORDS_HEADERS = ['사번', '계약연월', '노임구분', '급여', '업로드배치ID'];
var DEFAULT_XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function pad2(n) {
  return n < 10 ? '0' + n : String(n);
}

function upsertEmployeeMaster(record) {
  var sheet = ensureSheet('EmployeeMaster', EMPLOYEE_MASTER_HEADERS);
  var rowIndex = findRowByValue(sheet, 0, record.employeeId);
  var birthDate = record.birthYear + '-' + pad2(record.birthMonth) + '-' + pad2(record.birthDay);
  var rowValues = [record.employeeId, record.maskedName, birthDate, record.gender, record.jobType];
  if (rowIndex === -1) {
    sheet.appendRow(rowValues);
  } else {
    sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
  }
}

function upsertWageRecord(record, batchId) {
  var sheet = ensureSheet('WageRecords', WAGE_RECORDS_HEADERS);
  var data = sheet.getDataRange().getValues();
  var targetRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === record.employeeId && String(data[i][1]) === record.contractYearMonth) {
      targetRow = i + 1;
      break;
    }
  }
  var rowValues = [record.employeeId, record.contractYearMonth, record.wageType, record.wage, batchId];
  if (targetRow === -1) {
    sheet.appendRow(rowValues);
  } else {
    sheet.getRange(targetRow, 1, 1, rowValues.length).setValues([rowValues]);
  }
}

function uploadContractFile(sessionToken, base64Data, filename, mimeType) {
  requireRole(sessionToken, 'admin');

  var bytes = Utilities.base64Decode(base64Data);
  var blob = Utilities.newBlob(bytes, mimeType || DEFAULT_XLSX_MIME, filename);

  var tempFile = Drive.Files.create(
    { name: filename, mimeType: MimeType.GOOGLE_SHEETS },
    blob
  );

  try {
    var tempSs = SpreadsheetApp.openById(tempFile.id);
    var rows = tempSs.getSheets()[0].getDataRange().getValues();
    var records = parseContractRows(rows, new Date());
    var batchId = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');

    records.forEach(function (record) {
      upsertEmployeeMaster(record);
      upsertWageRecord(record, batchId);
    });

    return { count: records.length, batchId: batchId };
  } finally {
    Drive.Files.update({ trashed: true }, tempFile.id);
  }
}
