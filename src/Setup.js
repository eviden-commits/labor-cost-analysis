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

function clearUploadedData() {
  var employeeSheet = getSheet('EmployeeMaster');
  if (employeeSheet.getLastRow() > 1) {
    employeeSheet.getRange(2, 1, employeeSheet.getLastRow() - 1, employeeSheet.getLastColumn()).clearContent();
  }

  var wageSheet = getSheet('WageRecords');
  if (wageSheet.getLastRow() > 1) {
    wageSheet.getRange(2, 1, wageSheet.getLastRow() - 1, wageSheet.getLastColumn()).clearContent();
  }

  return { cleared: true };
}

function initializeCredentials() {
  var props = PropertiesService.getScriptProperties();
  var result;

  if (props.getProperty('ADMIN_PASSWORD_HASH')) {
    result = { initialAdminPassword: '(이미 설정되어 있습니다. resetAdminPassword()를 실행해 재발급하세요.)' };
  } else {
    var initialAdminPassword = Utilities.getUuid().split('-')[0];
    var salt = generateSalt();
    props.setProperty('ADMIN_PASSWORD_SALT', salt);
    props.setProperty('ADMIN_PASSWORD_HASH', hashPassword(initialAdminPassword, salt));
    result = { initialAdminPassword: initialAdminPassword };
  }

  console.log(JSON.stringify(result));
  return result;
}

function resetAdminPassword() {
  var props = PropertiesService.getScriptProperties();
  var newPassword = Utilities.getUuid().split('-')[0];
  var salt = generateSalt();
  props.setProperty('ADMIN_PASSWORD_SALT', salt);
  props.setProperty('ADMIN_PASSWORD_HASH', hashPassword(newPassword, salt));

  var result = { newAdminPassword: newPassword };
  console.log(JSON.stringify(result));
  return result;
}
