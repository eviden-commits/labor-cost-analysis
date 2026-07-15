function initializeWorkbook() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SPREADSHEET_ID');
  var ss;

  if (id) {
    ss = SpreadsheetApp.openById(id);
  } else {
    ss = SpreadsheetApp.create('노무비 분석 데이터');
    props.setProperty('SPREADSHEET_ID', ss.getId());
  }

  ensureSheet('EmployeeMaster', EMPLOYEE_MASTER_HEADERS);
  ensureSheet('WageRecords', WAGE_RECORDS_HEADERS);

  var defaultSheet = ss.getSheetByName('시트1') || ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  return { spreadsheetId: ss.getId(), url: ss.getUrl() };
}
