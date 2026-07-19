// ERP 직종 필터의 실제 카테고리 전체. 안전/안전담당자는 같은 인원을 가리키는
// 다른 표기라서 '안전' 하나로 합쳐서 저장한다 (2026-07-16 결정).
var JOB_TYPE_ALIASES = {
  'BIM': 'BIM',
  'SHOP': 'SHOP',
  '공무': '공무',
  '공사': '공사',
  '안전': '안전',
  '안전담당자': '안전',
  '품질': '품질'
};
var EXCLUDED_TEAM_KEYWORD = '용역';
var MIN_VALID_WAGE = 90000;

var COL = { B: 1, C: 2, D: 3, E: 4, G: 6, L: 11, M: 12, N: 13, O: 14 };

function maskName(name) {
  if (!name || name.length < 2) return name;
  return name.charAt(0) + 'O'.repeat(name.length - 1);
}

function resolveBirthYear(twoDigitYear, referenceYear) {
  var century = twoDigitYear <= (referenceYear % 100) ? 2000 : 1900;
  return century + twoDigitYear;
}

function parseBirthDate(yymmdd, referenceDate) {
  var yy = Number(yymmdd.substring(0, 2));
  return {
    year: resolveBirthYear(yy, referenceDate.getFullYear()),
    month: Number(yymmdd.substring(2, 4)),
    day: Number(yymmdd.substring(4, 6))
  };
}

function parseDotDate(dateStr) {
  var parts = dateStr.split('.');
  return { year: Number(parts[0]), month: Number(parts[1]), day: Number(parts[2]) };
}

function toYearMonth(dotDate) {
  var mm = dotDate.month < 10 ? '0' + dotDate.month : String(dotDate.month);
  return dotDate.year + '.' + mm;
}

function parseContractRows(rows, referenceDate) {
  var results = [];
  rows.forEach(function (row) {
    var employeeId = row[COL.C];
    if (!employeeId) return;

    var jobType = JOB_TYPE_ALIASES[row[COL.L]];
    if (!jobType) return;

    var teamName = row[COL.B];
    if (teamName && String(teamName).indexOf(EXCLUDED_TEAM_KEYWORD) !== -1) return;

    var wage = row[COL.N];
    if (!wage || wage <= MIN_VALID_WAGE) return;

    var birth = parseBirthDate(String(row[COL.E]), referenceDate);
    var contractStart = parseDotDate(row[COL.O]);

    results.push({
      employeeId: String(employeeId),
      maskedName: maskName(row[COL.D]),
      gender: row[COL.G],
      birthYear: birth.year,
      birthMonth: birth.month,
      birthDay: birth.day,
      jobType: jobType,
      wageType: row[COL.M] === '일급' ? 'DAILY' : 'MONTHLY',
      wage: wage,
      contractYearMonth: toYearMonth(contractStart)
    });
  });
  return results;
}

if (typeof module !== 'undefined') {
  module.exports = {
    maskName: maskName,
    resolveBirthYear: resolveBirthYear,
    parseBirthDate: parseBirthDate,
    parseDotDate: parseDotDate,
    toYearMonth: toYearMonth,
    parseContractRows: parseContractRows,
    JOB_TYPE_ALIASES: JOB_TYPE_ALIASES,
    EXCLUDED_TEAM_KEYWORD: EXCLUDED_TEAM_KEYWORD,
    MIN_VALID_WAGE: MIN_VALID_WAGE,
    COL: COL
  };
}
