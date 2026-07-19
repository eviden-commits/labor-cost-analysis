var assert = require('assert');
var trends = require('../src/Trends.js');

assert.deepStrictEqual(trends.monthRange_('2026.01', '2026.06'), [
  '2026.01', '2026.02', '2026.03', '2026.04', '2026.05', '2026.06'
]);
assert.deepStrictEqual(trends.monthRange_('2026.06', '2026.06'), ['2026.06']);
assert.deepStrictEqual(trends.monthRange_('2025.11', '2026.02'), [
  '2025.11', '2025.12', '2026.01', '2026.02'
]);

console.log('All trends tests passed.');
