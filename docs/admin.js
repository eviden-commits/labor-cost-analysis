if (sessionStorage.getItem('sessionRole') !== 'admin') {
  window.location.href = 'index.html';
}

function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

async function upload() {
  const file = document.getElementById('uploadFile').files[0];
  const msg = document.getElementById('uploadMsg');
  if (!file) {
    msg.innerText = '파일을 선택해주세요.';
    return;
  }
  msg.style.color = '';
  msg.innerText = '업로드 중...';
  document.getElementById('uploadBtn').disabled = true;

  const reader = new FileReader();
  reader.onload = async () => {
    const base64Data = reader.result.split(',')[1];
    try {
      const res = await apiPost('uploadContractFile', {
        token: sessionStorage.getItem('sessionToken'),
        base64Data,
        filename: file.name,
        mimeType: file.type
      });
      if (!res.ok) {
        msg.style.color = 'var(--error)';
        msg.innerText = '오류: ' + res.error.message;
      } else {
        msg.style.color = 'var(--success)';
        msg.innerText = res.data.count + '건 처리 완료 (배치 ' + res.data.batchId + ')';
      }
    } catch (err) {
      msg.style.color = 'var(--error)';
      msg.innerText = '오류: ' + err.message;
    } finally {
      document.getElementById('uploadBtn').disabled = false;
    }
  };
  reader.readAsDataURL(file);
}

async function changePassword() {
  const role = document.getElementById('pwRole').value;
  const newPassword = document.getElementById('newPassword').value;
  const msg = document.getElementById('pwMsg');
  if (!newPassword) {
    msg.innerText = '새 비밀번호를 입력해주세요.';
    return;
  }
  try {
    const res = await apiPost('setPassword', {
      role,
      newPassword,
      token: sessionStorage.getItem('sessionToken')
    });
    if (!res.ok) {
      msg.style.color = 'var(--error)';
      msg.innerText = '오류: ' + res.error.message;
    } else {
      msg.style.color = 'var(--success)';
      msg.innerText = '변경되었습니다.';
      document.getElementById('newPassword').value = '';
    }
  } catch (err) {
    msg.style.color = 'var(--error)';
    msg.innerText = '오류: ' + err.message;
  }
}

let trendChart = null;

async function loadTrend() {
  const employeeId = document.getElementById('trendEmployeeId').value.trim();
  const errorBox = document.getElementById('trendError');
  errorBox.innerText = '';
  if (!employeeId) {
    errorBox.innerText = '사번을 입력해주세요.';
    return;
  }

  try {
    const res = await apiPost('getEmployeeWageTrend', {
      token: sessionStorage.getItem('sessionToken'),
      employeeId
    });
    if (!res.ok) {
      errorBox.innerText = res.error.message;
      return;
    }

    const data = res.data;
    if (!data.history.length) {
      errorBox.innerText = '해당 사번의 급여 이력이 없습니다.';
      document.getElementById('trendResult').classList.add('hidden');
      return;
    }

    document.getElementById('trendResult').classList.remove('hidden');
    document.getElementById('trendSummary').innerText =
      (data.maskedName || employeeId) + ' (' + (data.jobType || '-') + ') · ' + data.history.length + '개월 이력';

    const ctx = document.getElementById('trendChart');
    if (trendChart) trendChart.destroy();
    trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.history.map((h) => h.yearMonth),
        datasets: [{
          label: '급여 (원)',
          data: data.history.map((h) => h.wage),
          borderColor: '#003a70',
          backgroundColor: 'rgba(0, 58, 112, 0.12)',
          fill: true,
          tension: 0.2
        }]
      },
      options: { plugins: { legend: { display: false } } }
    });
  } catch (err) {
    errorBox.innerText = err.message;
  }
}

async function loadGrowth() {
  const wageType = document.getElementById('growthWageType').value;
  const fromMonth = document.getElementById('growthFromMonth').value;
  const toMonth = document.getElementById('growthToMonth').value;
  const errorBox = document.getElementById('growthError');
  errorBox.innerText = '';

  if (!fromMonth || !toMonth) {
    errorBox.innerText = '비교할 시작월과 종료월을 선택해주세요.';
    return;
  }

  try {
    const res = await apiPost('getWageGrowth', {
      token: sessionStorage.getItem('sessionToken'),
      wageType,
      fromMonth,
      toMonth
    });
    if (!res.ok) {
      errorBox.innerText = res.error.message;
      return;
    }

    const data = res.data;
    document.getElementById('growthResult').classList.remove('hidden');
    document.getElementById('growthFromLabel').innerText = data.fromMonth + ' 평균 (' + data.fromCount + '명)';
    document.getElementById('growthFromAvg').innerText = formatWon(data.fromAvg);
    document.getElementById('growthToLabel').innerText = data.toMonth + ' 평균 (' + data.toCount + '명)';
    document.getElementById('growthToAvg').innerText = formatWon(data.toAvg);
    document.getElementById('growthPct').innerText =
      data.growthPct === null ? '비교 불가' : (data.growthPct > 0 ? '+' : '') + data.growthPct + '%';
  } catch (err) {
    errorBox.innerText = err.message;
  }
}

document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('uploadBtn').addEventListener('click', upload);
document.getElementById('pwBtn').addEventListener('click', changePassword);
document.getElementById('trendBtn').addEventListener('click', loadTrend);
document.getElementById('growthBtn').addEventListener('click', loadGrowth);
