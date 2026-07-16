if (!sessionStorage.getItem('sessionToken')) {
  window.location.href = 'index.html';
}

function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

let resultChart = null;

function formatWon(n) {
  return n === null || n === undefined ? '-' : Number(n).toLocaleString('ko-KR') + '원';
}

async function search() {
  const birthDate = document.getElementById('birthDate').value;
  const wageType = document.getElementById('wageType').value;
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
      desiredWage,
      wageType
    });

    if (!res.ok) {
      errorBox.innerText = res.error.message;
      return;
    }

    const data = res.data;
    document.getElementById('resultCard').classList.remove('hidden');
    document.getElementById('resultTitle').innerText = data.ageBracket + ' 비교 결과';
    document.getElementById('resultCount').innerText = data.peerCount + '명';
    document.getElementById('resultMin').innerText = formatWon(data.min);
    document.getElementById('resultMedian').innerText = formatWon(data.median);
    document.getElementById('resultMax').innerText = formatWon(data.max);
    document.getElementById('resultDesired').innerText = formatWon(data.desiredWage);
    document.getElementById('resultVerdict').innerText = data.verdict;

    const ctx = document.getElementById('resultChart');
    if (resultChart) resultChart.destroy();
    resultChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['최저', '중위', '희망급여', '최고'],
        datasets: [{
          label: '급여 (원)',
          data: [data.min, data.median, data.desiredWage, data.max],
          backgroundColor: ['#94a3b8', '#64748b', '#003a70', '#94a3b8']
        }]
      },
      options: { plugins: { legend: { display: false } } }
    });
  } catch (err) {
    errorBox.innerText = err.message;
  }
}

document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('searchBtn').addEventListener('click', search);
