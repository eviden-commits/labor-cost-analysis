function median_(sortedNumbers) {
  var n = sortedNumbers.length;
  if (n === 0) return null;
  var mid = Math.floor(n / 2);
  return n % 2 === 0 ? (sortedNumbers[mid - 1] + sortedNumbers[mid]) / 2 : sortedNumbers[mid];
}

var AGE_WINDOW_RADIUS = 2;

function ageWindow_(age) {
  var min = age - AGE_WINDOW_RADIUS;
  var max = age + AGE_WINDOW_RADIUS;
  return { age: age, min: min, max: max, label: min + '-' + max + '세' };
}

function checkWageAppropriateness(sessionToken, birthDate, desiredWage, wageType) {
  requireRole(sessionToken, 'user');

  var candidateYear = Number(String(birthDate).split('-')[0]);
  var referenceYear = new Date().getFullYear();
  var candidateAge = referenceYear - candidateYear;
  var window = ageWindow_(candidateAge);

  var employeeRows = getSheet('EmployeeMaster').getDataRange().getValues();
  var birthYearById = {};
  for (var i = 1; i < employeeRows.length; i++) {
    var empId = employeeRows[i][0];
    var birth = employeeRows[i][2];
    if (!empId || !birth) continue;
    birthYearById[empId] = Number(String(birth).split('-')[0]);
  }

  var wageRows = getSheet('WageRecords').getDataRange().getValues();
  var latestByEmployee = {};
  for (var j = 1; j < wageRows.length; j++) {
    var wEmpId = wageRows[j][0];
    var yearMonth = wageRows[j][1];
    var type = wageRows[j][2];
    var wage = wageRows[j][3];
    if (!wEmpId || type !== wageType) continue;
    var existing = latestByEmployee[wEmpId];
    if (!existing || yearMonth > existing.yearMonth) {
      latestByEmployee[wEmpId] = { yearMonth: yearMonth, wage: wage };
    }
  }

  var peerWages = [];
  Object.keys(latestByEmployee).forEach(function (empId) {
    var empBirthYear = birthYearById[empId];
    if (empBirthYear === undefined) return;
    var empAge = referenceYear - empBirthYear;
    if (empAge >= window.min && empAge <= window.max) {
      peerWages.push(latestByEmployee[empId].wage);
    }
  });

  peerWages.sort(function (a, b) { return a - b; });

  var result = {
    ageBracket: window.label,
    peerCount: peerWages.length,
    min: peerWages.length ? peerWages[0] : null,
    median: median_(peerWages),
    max: peerWages.length ? peerWages[peerWages.length - 1] : null,
    desiredWage: desiredWage,
    wageType: wageType
  };

  if (peerWages.length === 0) {
    result.verdict = '비교할 동일 연령대·노임구분 데이터가 없습니다.';
  } else if (desiredWage < result.min) {
    result.verdict = '동일 연령대 최저 급여보다 낮습니다.';
  } else if (desiredWage > result.max) {
    result.verdict = '동일 연령대 최고 급여보다 높습니다.';
  } else if (desiredWage < result.median) {
    result.verdict = '동일 연령대 중위 급여보다 낮은 편입니다.';
  } else {
    result.verdict = '동일 연령대 중위 급여 이상입니다.';
  }

  return result;
}

if (typeof module !== 'undefined') {
  module.exports = { median_: median_, ageWindow_: ageWindow_ };
}
