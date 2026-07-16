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

function initializeCredentials() {
  var props = PropertiesService.getScriptProperties();

  if (props.getProperty('ADMIN_PASSWORD_HASH')) {
    return { initialAdminPassword: '(이미 설정되어 있습니다. 변경하려면 어드민으로 로그인 후 비밀번호 변경 기능을 사용하세요.)' };
  }

  var initialAdminPassword = Utilities.getUuid().split('-')[0];
  var salt = generateSalt();
  props.setProperty('ADMIN_PASSWORD_SALT', salt);
  props.setProperty('ADMIN_PASSWORD_HASH', hashPassword(initialAdminPassword, salt));

  return { initialAdminPassword: initialAdminPassword };
}
