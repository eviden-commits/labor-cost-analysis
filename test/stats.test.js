var assert = require('assert');
var stats = require('../src/Stats.js');

assert.strictEqual(stats.median_([]), null);
assert.strictEqual(stats.median_([100]), 100);
assert.strictEqual(stats.median_([100, 200]), 150);
assert.strictEqual(stats.median_([100, 200, 300]), 200);

assert.deepStrictEqual(stats.ageWindow_(30), { age: 30, min: 28, max: 32, label: '28-32세' });
assert.deepStrictEqual(stats.ageWindow_(40), { age: 40, min: 38, max: 42, label: '38-42세' });

// 1986년생(40세)과 1987년생(39세)처럼 고정 5세 구간이면 경계에서 갈리는 케이스가
// ±2세 슬라이딩 윈도우에서는 정상적으로 겹쳐야 한다
var candidateWindow = stats.ageWindow_(40);
var peerAge = 39;
assert.ok(peerAge >= candidateWindow.min && peerAge <= candidateWindow.max);

console.log('All stats tests passed.');
