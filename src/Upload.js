var EMPLOYEE_MASTER_HEADERS = ['사번', '성명(마스킹)', '생년월일', '성별', '직종'];
var WAGE_RECORDS_HEADERS = ['사번', '계약연월', '노임구분', '급여', '업로드배치ID'];
var DEFAULT_XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function pad2(n) {
  return n < 10 ? '0' + n : String(n);
}

function loadSheetRows_(sheet) {
  var data = sheet.getDataRange().getValues();
  return { headers: data[0], rows: data.slice(1) };
}

function writeSheetRows_(sheet, headers, rows, textColumns) {
  var all = [headers].concat(rows);
  (textColumns || []).forEach(function (colIndex) {
    sheet.getRange(1, colIndex, all.length, 1).setNumberFormat('@');
  });
  sheet.getRange(1, 1, all.length, headers.length).setValues(all);
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

    var employeeSheet = ensureSheet('EmployeeMaster', EMPLOYEE_MASTER_HEADERS);
    var employeeData = loadSheetRows_(employeeSheet);
    var employeeIndexById = {};
    employeeData.rows.forEach(function (row, i) { employeeIndexById[row[0]] = i; });

    var wageSheet = ensureSheet('WageRecords', WAGE_RECORDS_HEADERS);
    var wageData = loadSheetRows_(wageSheet);
    var wageIndexByKey = {};
    wageData.rows.forEach(function (row, i) { wageIndexByKey[row[0] + '|' + row[1]] = i; });

    records.forEach(function (record) {
      var birthDate = record.birthYear + '-' + pad2(record.birthMonth) + '-' + pad2(record.birthDay);
      var employeeRow = [record.employeeId, record.maskedName, birthDate, record.gender, record.jobType];
      var empIndex = employeeIndexById[record.employeeId];
      if (empIndex === undefined) {
        employeeIndexById[record.employeeId] = employeeData.rows.length;
        employeeData.rows.push(employeeRow);
      } else {
        employeeData.rows[empIndex] = employeeRow;
      }

      var wageKey = record.employeeId + '|' + record.contractYearMonth;
      var wageRow = [record.employeeId, record.contractYearMonth, record.wageType, record.wage, batchId];
      var wageIndex = wageIndexByKey[wageKey];
      if (wageIndex === undefined) {
        wageIndexByKey[wageKey] = wageData.rows.length;
        wageData.rows.push(wageRow);
      } else {
        wageData.rows[wageIndex] = wageRow;
      }
    });

    writeSheetRows_(employeeSheet, employeeData.headers, employeeData.rows, [1, 3]);
    writeSheetRows_(wageSheet, wageData.headers, wageData.rows, [1, 2]);

    return { count: records.length, batchId: batchId };
  } finally {
    Drive.Files.update({ trashed: true }, tempFile.id);
  }
}
