if (!sessionStorage.getItem('sessionToken')) {
  window.location.href = 'index.html';
}

function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

let peerChart = null;
let companyChart = null;

function formatWon(n) {
  return n === null || n === undefined ? '-' : Number(n).toLocaleString('ko-KR') + '원';
}

function defaultReferenceMonth() {
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const mm = String(prevMonth.getMonth() + 1).padStart(2, '0');
  return prevMonth.getFullYear() + '-' + mm;
}

document.getElementById('referenceMonth').value = defaultReferenceMonth();

function verticalMarkerDataset_(x, yMin, yMax) {
  return {
    label: '희망급여',
    data: [{ x, y: yMin }, { x, y: yMax }],
    type: 'line',
    showLine: true,
    borderColor: '#b91c1c',
    borderWidth: 2,
    borderDash: [6, 4],
    pointRadius: 0,
    fill: false
  };
}

function renderDotPlot(canvasId, existingChart, wages, desiredWage, peerLabel) {
  const ctx = document.getElementById(canvasId);
  if (existingChart) existingChart.destroy();
  return new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: peerLabel,
          data: wages.map((w) => ({ x: w, y: 0 })),
          backgroundColor: '#94a3b8',
          radius: 5
        },
        verticalMarkerDataset_(desiredWage, -1.2, 1.2),
        {
          label: '희망급여',
          data: [{ x: desiredWage, y: 0.7 }],
          backgroundColor: '#b91c1c',
          borderColor: '#fff',
          borderWidth: 2,
          radius: 9,
          pointStyle: 'triangle'
        }
      ]
    },
    options: {
      scales: {
        y: { display: false, min: -1.2, max: 1.2 },
        x: { title: { display: true, text: '급여 (원)' } }
      },
      plugins: { legend: { position: 'bottom', labels: { filter: (item) => item.text !== '희망급여' || item.datasetIndex === 2 } } }
    }
  });
}

// 표본이 많을 때(전체 분포) 점이 뭉개지므로 정규분포 형태의 커널밀도추정 곡선으로 표시
function gaussianKDE_(values) {
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((a, b) => a + (b - mean) * (b - mean), 0) / n;
  const sd = Math.sqrt(variance) || 1;
  const bandwidth = Math.max(1.06 * sd * Math.pow(n, -0.2), 1);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.15 || bandwidth * 3;
  const steps = 80;
  const xs = [];
  const ys = [];
  for (let i = 0; i <= steps; i++) {
    const x = min - pad + ((max - min + 2 * pad) * i) / steps;
    const density = values.reduce((sum, v) => {
      const u = (x - v) / bandwidth;
      return sum + Math.exp(-0.5 * u * u);
    }, 0) / (n * bandwidth * Math.sqrt(2 * Math.PI));
    xs.push(x);
    ys.push(density);
  }
  return { xs, ys };
}

function renderDensityPlot(canvasId, existingChart, wages, desiredWage, label) {
  const ctx = document.getElementById(canvasId);
  if (existingChart) existingChart.destroy();

  if (wages.length < 2) {
    return renderDotPlot(canvasId, null, wages, desiredWage, label);
  }

  const { xs, ys } = gaussianKDE_(wages);
  const maxY = Math.max(...ys) * 1.15;

  return new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: label,
          data: xs.map((x, i) => ({ x, y: ys[i] })),
          borderColor: '#0056a3',
          backgroundColor: 'rgba(0, 58, 112, 0.12)',
          fill: true,
          pointRadius: 0,
          tension: 0.3,
          showLine: true
        },
        verticalMarkerDataset_(desiredWage, 0, maxY)
      ]
    },
    options: {
      scales: {
        x: { type: 'linear', title: { display: true, text: '급여 (원)' } },
        y: { display: false, min: 0, max: maxY }
      },
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

async function search() {
  const birthDate = document.getElementById('birthDate').value;
  const wageType = document.getElementById('wageType').value;
  const gender = document.getElementById('gender').value;
  const ageMode = document.getElementById('ageMode').value;
  const referenceMonth = document.getElementById('referenceMonth').value;
  const desiredWage = Number(document.getElementById('desiredWage').value);
  const errorBox = document.getElementById('searchError');
  errorBox.innerText = '';

  if (!birthDate || !desiredWage) {
    errorBox.innerText = '생년월일과 희망급여를 입력해주세요.';
    return;
  }

  try {
    const res = await apiPost('checkWageAppropriateness', {
      token: sessionStorage.getItem('sessionToken'),
      birthDate,
      gender,
      desiredWage,
      wageType,
      ageMode,
      referenceMonth
    });

    if (!res.ok) {
      errorBox.innerText = res.error.message;
      return;
    }

    const data = res.data;
    document.getElementById('resultCard').classList.remove('hidden');
    document.getElementById('resultTitle').innerText =
      data.referenceMonth + ' 기준 · ' + data.ageLabel + ' · ' + data.genderFilter + ' 비교 결과';
    document.getElementById('resultCount').innerText = data.peerCount + '명';
    document.getElementById('resultMin').innerText = formatWon(data.min);
    document.getElementById('resultMean').innerText = formatWon(data.mean);
    document.getElementById('resultMedian').innerText = formatWon(data.median);
    document.getElementById('resultMax').innerText = formatWon(data.max);
    document.getElementById('resultVerdict').innerText = '희망급여 ' + formatWon(data.desiredWage) + ' → ' + data.verdict;

    const rankBox = document.getElementById('resultRank');
    rankBox.innerText = data.rank
      ? '비교 인원 ' + data.peerCount + '명 중 ' + data.rank + '번째로 높음 (상위 ' + data.percentileFromTop + '%)'
      : '';

    document.getElementById('lowSampleWarning').classList.toggle('hidden', !data.lowSample);

    peerChart = renderDotPlot('peerChart', peerChart, data.peerWages, data.desiredWage, '동일 조건 비교군');
    companyChart = renderDensityPlot('companyChart', companyChart, data.companyWages, data.desiredWage, '전체(' + data.wageType + ')');
  } catch (err) {
    errorBox.innerText = err.message;
  }
}

document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('searchBtn').addEventListener('click', search);
