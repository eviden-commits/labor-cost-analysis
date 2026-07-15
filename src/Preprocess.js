var TARGET_JOB_TYPES = ['안전', '안전담당자'];

var COL = { C: 2, D: 3, E: 4, G: 6, L: 11, M: 12, N: 13, O: 14 };

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

    var jobType = row[COL.L];
    if (TARGET_JOB_TYPES.indexOf(jobType) === -1) return;

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
      wage: row[COL.N],
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
    TARGET_JOB_TYPES: TARGET_JOB_TYPES,
    COL: COL
  };
}
