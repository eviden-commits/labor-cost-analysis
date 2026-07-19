function getEmployeeWageTrend(sessionToken, employeeId) {
  requireRole(sessionToken, 'admin');

  var wageRows = getSheet('WageRecords').getDataRange().getValues();
  var history = [];
  for (var i = 1; i < wageRows.length; i++) {
    if (String(wageRows[i][0]) === String(employeeId)) {
      history.push({ yearMonth: wageRows[i][1], wageType: wageRows[i][2], wage: wageRows[i][3] });
    }
  }
  history.sort(function (a, b) { return a.yearMonth < b.yearMonth ? -1 : (a.yearMonth > b.yearMonth ? 1 : 0); });

  var employeeRows = getSheet('EmployeeMaster').getDataRange().getValues();
  var maskedName = null;
  var jobType = null;
  for (var j = 1; j < employeeRows.length; j++) {
    if (String(employeeRows[j][0]) === String(employeeId)) {
      maskedName = employeeRows[j][1];
      jobType = employeeRows[j][4];
      break;
    }
  }

  return {
    employeeId: String(employeeId),
    maskedName: maskedName,
    jobType: jobType,
    history: history
  };
}

function getWageGrowth(sessionToken, wageType, fromMonth, toMonth) {
  requireRole(sessionToken, 'admin');

  var from = normalizeYearMonth_(fromMonth);
  var to = normalizeYearMonth_(toMonth);

  var wageRows = getSheet('WageRecords').getDataRange().getValues();
  var fromWages = [];
  var toWages = [];
  for (var i = 1; i < wageRows.length; i++) {
    if (wageRows[i][2] !== wageType) continue;
    var ym = wageRows[i][1];
    if (ym === from) fromWages.push(wageRows[i][3]);
    if (ym === to) toWages.push(wageRows[i][3]);
  }

  var fromAvg = mean_(fromWages);
  var toAvg = mean_(toWages);
  var growthPct = (fromAvg && toAvg) ? Math.round(((toAvg - fromAvg) / fromAvg) * 1000) / 10 : null;

  return {
    wageType: wageType,
    fromMonth: from,
    fromAvg: fromAvg,
    fromCount: fromWages.length,
    toMonth: to,
    toAvg: toAvg,
    toCount: toWages.length,
    growthPct: growthPct
  };
}
