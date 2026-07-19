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
        {
          label: '희망급여',
          data: [{ x: desiredWage, y: 0 }],
          backgroundColor: '#003a70',
          radius: 8,
          pointStyle: 'triangle'
        }
      ]
    },
    options: {
      scales: {
        y: { display: false, min: -1, max: 1 },
        x: { title: { display: true, text: '급여 (원)' } }
      },
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

async function search() {
  const birthDate = document.getElementById('birthDate').value;
  const jobType = document.getElementById('jobType').value;
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
      jobType,
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
      data.referenceMonth + ' 기준 · ' + data.ageLabel + ' · ' + data.genderFilter + ' · ' + data.jobTypeFilter + ' 비교 결과';
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
    companyChart = renderDotPlot('companyChart', companyChart, data.companyWages, data.desiredWage, '전체(' + data.wageType + ')');
  } catch (err) {
    errorBox.innerText = err.message;
  }
}

document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('searchBtn').addEventListener('click', search);
