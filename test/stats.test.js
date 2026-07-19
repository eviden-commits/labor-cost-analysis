var assert = require('assert');
var stats = require('../src/Stats.js');

assert.strictEqual(stats.median_([]), null);
assert.strictEqual(stats.median_([100]), 100);
assert.strictEqual(stats.median_([100, 200]), 150);
assert.strictEqual(stats.median_([100, 200, 300]), 200);

assert.deepStrictEqual(stats.ageWindow_(30, 2), { age: 30, min: 28, max: 32, label: '28-32세' });
assert.deepStrictEqual(stats.ageWindow_(40, 2), { age: 40, min: 38, max: 42, label: '38-42세' });
assert.deepStrictEqual(stats.ageWindow_(40, 0), { age: 40, min: 40, max: 40, label: '40세 (동일 나이)' });

// 1986년생(40세)과 1987년생(39세)처럼 고정 5세 구간이면 경계에서 갈리는 케이스가
// ±2세 슬라이딩 윈도우에서는 정상적으로 겹쳐야 한다
var candidateWindow = stats.ageWindow_(40, 2);
var peerAge = 39;
assert.ok(peerAge >= candidateWindow.min && peerAge <= candidateWindow.max);

assert.strictEqual(stats.normalizeYearMonth_('2026-07'), '2026.07');
assert.strictEqual(stats.normalizeYearMonth_('2026.07'), '2026.07');
assert.strictEqual(stats.normalizeYearMonth_(''), '');
assert.strictEqual(stats.normalizeYearMonth_(undefined), '');

assert.strictEqual(stats.mean_([]), null);
assert.strictEqual(stats.mean_([100]), 100);
assert.strictEqual(stats.mean_([100, 200, 300]), 200);
assert.strictEqual(stats.mean_([100, 200, 400]), 233); // 233.33 -> round

// rankFromTop_: sortedWages는 오름차순 정렬되어 있다고 가정
assert.deepStrictEqual(stats.rankFromTop_([], 5000), { rank: null, percentileFromTop: null });
var sorted = [3500000, 4000000, 4500000, 5000000, 6170000];
assert.deepStrictEqual(stats.rankFromTop_(sorted, 6170000), { rank: 1, percentileFromTop: 20 }); // 최고
assert.deepStrictEqual(stats.rankFromTop_(sorted, 3500000), { rank: 5, percentileFromTop: 100 }); // 최저
assert.deepStrictEqual(stats.rankFromTop_(sorted, 4500000), { rank: 3, percentileFromTop: 60 }); // 중간(자기 자신 포함 안 됨, 위에 2명)
assert.deepStrictEqual(stats.rankFromTop_(sorted, 9999999), { rank: 1, percentileFromTop: 20 }); // 전부보다 높음

assert.strictEqual(stats.LOW_SAMPLE_THRESHOLD, 5);

console.log('All stats tests passed.');
