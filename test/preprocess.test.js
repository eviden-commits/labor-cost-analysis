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

// 안전담당자는 안전과 같은 인원이라 '안전'으로 정규화되어야 함
assert.deepStrictEqual(parsed[0], {
  employeeId: '370491',
  maskedName: '김OO',
  gender: '여',
  birthYear: 1996,
  birthMonth: 10,
  birthDay: 18,
  jobType: '안전',
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

// ERP 직종 필터에 없는 값(예: 오타/미분류)은 제외되어야 함
var withUnknownJob = rows.concat([
  ['현장', '팀', '999999', '박기타', '900101', '1', '남', null, '2026.06.01', '연장', 'N', '기타', '월급', 3000000, '2026.07.01', '2026.07.31']
]);
assert.strictEqual(pp.parseContractRows(withUnknownJob, referenceDate).length, 2);

// 공사/품질/공무/BIM/SHOP은 각자 고유 카테고리로 포함되어야 함 (안전과 달리 합치지 않음)
var withAllDepartments = rows.concat([
  ['현장', '팀', '111111', '박공사', '900101', '1', '남', null, '2026.06.01', '연장', 'N', '공사', '월급', 3000000, '2026.07.01', '2026.07.31'],
  ['현장', '팀', '222222', '이품질', '900101', '2', '여', null, '2026.06.01', '연장', 'N', '품질', '월급', 3000000, '2026.07.01', '2026.07.31'],
  ['현장', '팀', '333333', '최공무', '900101', '1', '남', null, '2026.06.01', '연장', 'N', '공무', '월급', 3000000, '2026.07.01', '2026.07.31'],
  ['현장', '팀', '444444', '정비임', '900101', '2', '여', null, '2026.06.01', '연장', 'N', 'BIM', '월급', 3000000, '2026.07.01', '2026.07.31'],
  ['현장', '팀', '555555', '한샵', '900101', '1', '남', null, '2026.06.01', '연장', 'N', 'SHOP', '월급', 3000000, '2026.07.01', '2026.07.31']
]);
var allDeptResults = pp.parseContractRows(withAllDepartments, referenceDate);
assert.strictEqual(allDeptResults.length, 7);
assert.deepStrictEqual(
  allDeptResults.slice(2).map(function (r) { return r.jobType; }),
  ['공사', '품질', '공무', 'BIM', 'SHOP']
);

// 팀명(B열)에 "용역"이 들어가면 제외되어야 함 (직종이 안전이어도)
var withServiceTeam = rows.concat([
  ['현장', '안전용역', '888888', '이용역', '950101', '2', '여', null, '2026.06.01', '연장', 'N', '안전', '일급', 130000, '2026.07.01', '2026.07.31']
]);
assert.strictEqual(pp.parseContractRows(withServiceTeam, referenceDate).length, 2);

// 단가가 90000원 이하(최초단가, 의미없는 값)면 제외되어야 함
var withPlaceholderWage = rows.concat([
  ['현장', '직영', '777777', '최최초', '950101', '2', '여', null, '2026.06.01', '연장', 'N', '안전', '일급', 90000, '2026.07.01', '2026.07.31']
]);
assert.strictEqual(pp.parseContractRows(withPlaceholderWage, referenceDate).length, 2);

console.log('All preprocess tests passed.');
