var assert = require('assert');
var stats = require('../src/Stats.js');

assert.strictEqual(stats.median_([]), null);
assert.strictEqual(stats.median_([100]), 100);
assert.strictEqual(stats.median_([100, 200]), 150);
assert.strictEqual(stats.median_([100, 200, 300]), 200);

assert.deepStrictEqual(stats.ageBracket_(1996, 2026), { age: 30, bracketStart: 30, bracketEnd: 34, label: '30-34세' });
assert.deepStrictEqual(stats.ageBracket_(2004, 2026), { age: 22, bracketStart: 20, bracketEnd: 24, label: '20-24세' });
assert.deepStrictEqual(stats.ageBracket_(1987, 2026), { age: 39, bracketStart: 35, bracketEnd: 39, label: '35-39세' });

console.log('All stats tests passed.');
