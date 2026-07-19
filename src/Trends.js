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

function monthRange_(fromYearMonth, toYearMonth) {
  var fromParts = fromYearMonth.split('.');
  var toParts = toYearMonth.split('.');
  var y = Number(fromParts[0]);
  var m = Number(fromParts[1]);
  var toY = Number(toParts[0]);
  var toM = Number(toParts[1]);

  var months = [];
  while (y < toY || (y === toY && m <= toM)) {
    months.push(y + '.' + (m < 10 ? '0' + m : String(m)));
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  return months;
}

function getWageGrowth(sessionToken, wageType, fromMonth, toMonth) {
  requireRole(sessionToken, 'admin');

  var from = normalizeYearMonth_(fromMonth);
  var to = normalizeYearMonth_(toMonth);
  var months = monthRange_(from, to);

  var wageRows = getSheet('WageRecords').getDataRange().getValues();
  var wagesByMonth = {};
  months.forEach(function (m) { wagesByMonth[m] = []; });
  for (var i = 1; i < wageRows.length; i++) {
    if (wageRows[i][2] !== wageType) continue;
    var ym = wageRows[i][1];
    if (wagesByMonth.hasOwnProperty(ym)) {
      wagesByMonth[ym].push(wageRows[i][3]);
    }
  }

  var series = months.map(function (m) {
    var wages = wagesByMonth[m];
    return { yearMonth: m, avg: mean_(wages), count: wages.length };
  });

  var firstAvg = null;
  var lastAvg = null;
  for (var j = 0; j < series.length; j++) {
    if (series[j].avg !== null) { firstAvg = series[j].avg; break; }
  }
  for (var k = series.length - 1; k >= 0; k--) {
    if (series[k].avg !== null) { lastAvg = series[k].avg; break; }
  }
  var growthPct = (firstAvg && lastAvg) ? Math.round(((lastAvg - firstAvg) / firstAvg) * 1000) / 10 : null;

  return {
    wageType: wageType,
    series: series,
    growthPct: growthPct
  };
}

if (typeof module !== 'undefined') {
  module.exports = { monthRange_: monthRange_ };
}
