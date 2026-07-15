var assert = require('assert');
var pp = require('../src/Preprocess.js');

var referenceDate = new Date('2026-07-16');

// maskName
assert.strictEqual(pp.maskName('김하경'), '김OO');
assert.strictEqual(pp.maskName('황금길'), '황OO');
assert.strictEqual(pp.maskName('남궁민수'), '남OOO');

// resolveBirthYear - century inference relative to reference year
assert.strictEqual(pp.resolveBirthYear(96, 2026), 1996);
assert.strictEqual(pp.resolveBirthYear(4, 2026), 2004);
assert.strictEqual(pp.resolveBirthYear(26, 2026), 2026);
assert.strictEqual(pp.resolveBirthYear(27, 2026), 1927);

// parseBirthDate
var b = pp.parseBirthDate('961018', referenceDate);
assert.deepStrictEqual(b, { year: 1996, month: 10, day: 18 });

// parseContractRows against actual sample(2026-07) rows (row3 blank, row4/5 data)
var rows = [
  [],
  [],
  ['화성 소방설비 기계전기 유지보수', '직영', '370491', '김하경', '961018', '2', '여', null, '2026.06.23', '연장', 'N', '안전담당자', '일급', 130000, '2026.07.01', '2026.07.31'],
  ['평택 P5 그린동 PH1 HVAC 덕트공사', '공사관리', '387590', '황금길', '870715', '1', '남', null, '2026.06.29', '연장', 'N', '안전', '월급', 4600000, '2026.07.01', '2026.07.31']
];

var parsed = pp.parseContractRows(rows, referenceDate);
assert.strictEqual(parsed.length, 2);

assert.deepStrictEqual(parsed[0], {
  employeeId: '370491',
  maskedName: '김OO',
  gender: '여',
  birthYear: 1996,
  birthMonth: 10,
  birthDay: 18,
  jobType: '안전담당자',
  wageType: 'DAILY',
  wage: 130000,
  contractYearMonth: '2026.07'
});

assert.deepStrictEqual(parsed[1], {
  employeeId: '387590',
  maskedName: '황OO',
  gender: '남',
  birthYear: 1987,
  birthMonth: 7,
  birthDay: 15,
  jobType: '안전',
  wageType: 'MONTHLY',
  wage: 4600000,
  contractYearMonth: '2026.07'
});

// non-target 직종은 제외되어야 함
var withOtherJob = rows.concat([
  ['현장', '팀', '999999', '박공사', '900101', '1', '남', null, '2026.06.01', '연장', 'N', '공사', '월급', 3000000, '2026.07.01', '2026.07.31']
]);
assert.strictEqual(pp.parseContractRows(withOtherJob, referenceDate).length, 2);

console.log('All preprocess tests passed.');
