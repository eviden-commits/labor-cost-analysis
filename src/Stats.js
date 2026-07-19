function median_(sortedNumbers) {
  var n = sortedNumbers.length;
  if (n === 0) return null;
  var mid = Math.floor(n / 2);
  return n % 2 === 0 ? (sortedNumbers[mid - 1] + sortedNumbers[mid]) / 2 : sortedNumbers[mid];
}

function mean_(numbers) {
  if (numbers.length === 0) return null;
  var sum = numbers.reduce(function (a, b) { return a + b; }, 0);
  return Math.round(sum / numbers.length);
}

var AGE_MODE_RADIUS = { exact: 0, window: 2 };
var LOW_SAMPLE_THRESHOLD = 5;

function ageWindow_(age, radius) {
  var min = age - radius;
  var max = age + radius;
  return {
    age: age,
    min: min,
    max: max,
    label: radius === 0 ? (age + '세 (동일 나이)') : (min + '-' + max + '세')
  };
}

function normalizeYearMonth_(yearMonth) {
  return String(yearMonth || '').replace(/-/g, '.');
}

// 희망급여가 오름차순 정렬된 sortedWages 안에서 상위 몇 번째/몇 %인지 계산
function rankFromTop_(sortedWages, desiredWage) {
  if (sortedWages.length === 0) return { rank: null, percentileFromTop: null };
  var higherCount = sortedWages.filter(function (w) { return w > desiredWage; }).length;
  var rank = higherCount + 1;
  var percentileFromTop = Math.round((rank / sortedWages.length) * 100);
  return { rank: rank, percentileFromTop: percentileFromTop };
}

function checkWageAppropriateness(sessionToken, birthDate, gender, jobType, desiredWage, wageType, ageMode, referenceMonth) {
  requireRole(sessionToken, 'user');

  var candidateYear = Number(String(birthDate).split('-')[0]);
  var referenceYear = new Date().getFullYear();
  var candidateAge = referenceYear - candidateYear;
  var radius = AGE_MODE_RADIUS.hasOwnProperty(ageMode) ? AGE_MODE_RADIUS[ageMode] : AGE_MODE_RADIUS.window;
  var window = ageWindow_(candidateAge, radius);
  var genderFilter = gender && gender !== 'ALL' ? gender : null;
  var jobTypeFilter = jobType && jobType !== 'ALL' ? jobType : null;

  var employeeRows = getSheet('EmployeeMaster').getDataRange().getValues();
  var birthYearById = {};
  var genderById = {};
  var jobTypeById = {};
  for (var i = 1; i < employeeRows.length; i++) {
    var empId = employeeRows[i][0];
    var birth = employeeRows[i][2];
    if (!empId || !birth) continue;
    birthYearById[empId] = Number(String(birth).split('-')[0]);
    genderById[empId] = employeeRows[i][3];
    jobTypeById[empId] = employeeRows[i][4];
  }

  var wageRows = getSheet('WageRecords').getDataRange().getValues();
  var wantedMonth = normalizeYearMonth_(referenceMonth);
  if (!wantedMonth) {
    for (var k = 1; k < wageRows.length; k++) {
      var rowMonth = wageRows[k][1];
      if (rowMonth && (!wantedMonth || rowMonth > wantedMonth)) {
        wantedMonth = rowMonth;
      }
    }
  }

  var wageByEmployee = {};
  for (var j = 1; j < wageRows.length; j++) {
    var wEmpId = wageRows[j][0];
    var yearMonth = wageRows[j][1];
    var type = wageRows[j][2];
    var wage = wageRows[j][3];
    if (!wEmpId || type !== wageType || yearMonth !== wantedMonth) continue;
    wageByEmployee[wEmpId] = wage;
  }

  var peerWages = [];
  var companyWages = [];
  Object.keys(wageByEmployee).forEach(function (empId) {
    var wage = wageByEmployee[empId];
    var empBirthYear = birthYearById[empId];
    if (empBirthYear === undefined) return;

    companyWages.push(wage);

    if (genderFilter && genderById[empId] !== genderFilter) return;
    if (jobTypeFilter && jobTypeById[empId] !== jobTypeFilter) return;
    var empAge = referenceYear - empBirthYear;
    if (empAge >= window.min && empAge <= window.max) {
      peerWages.push(wage);
    }
  });

  peerWages.sort(function (a, b) { return a - b; });
  companyWages.sort(function (a, b) { return a - b; });

  var rankInfo = rankFromTop_(peerWages, desiredWage);

  var result = {
    ageLabel: window.label,
    genderFilter: genderFilter || '전체',
    jobTypeFilter: jobTypeFilter || '전체',
    referenceMonth: wantedMonth || '(데이터 없음)',
    peerCount: peerWages.length,
    peerWages: peerWages,
    min: peerWages.length ? peerWages[0] : null,
    mean: mean_(peerWages),
    median: median_(peerWages),
    max: peerWages.length ? peerWages[peerWages.length - 1] : null,
    rank: rankInfo.rank,
    percentileFromTop: rankInfo.percentileFromTop,
    lowSample: peerWages.length > 0 && peerWages.length < LOW_SAMPLE_THRESHOLD,
    companyCount: companyWages.length,
    companyWages: companyWages,
    desiredWage: desiredWage,
    wageType: wageType
  };

  if (peerWages.length === 0) {
    result.verdict = '비교할 데이터가 없습니다.';
  } else if (desiredWage < result.min) {
    result.verdict = '최저 급여보다 낮습니다.';
  } else if (desiredWage > result.max) {
    result.verdict = '최고 급여보다 높습니다.';
  } else if (desiredWage < result.median) {
    result.verdict = '중위 급여보다 낮은 편입니다.';
  } else {
    result.verdict = '중위 급여 이상입니다.';
  }

  return result;
}

if (typeof module !== 'undefined') {
  module.exports = {
    median_: median_,
    mean_: mean_,
    ageWindow_: ageWindow_,
    normalizeYearMonth_: normalizeYearMonth_,
    rankFromTop_: rankFromTop_,
    LOW_SAMPLE_THRESHOLD: LOW_SAMPLE_THRESHOLD
  };
}
