function showRoot(role) {
  document.getElementById('loginOverlay').classList.add('hidden');
  document.getElementById('userRoot').classList.add('hidden');
  document.getElementById('adminRoot').classList.add('hidden');
  document.getElementById(role === 'admin' ? 'adminRoot' : 'userRoot').classList.remove('hidden');
}

function showLogin() {
  document.getElementById('loginOverlay').classList.remove('hidden');
  document.getElementById('userRoot').classList.add('hidden');
  document.getElementById('adminRoot').classList.add('hidden');
}

function logout() {
  sessionStorage.clear();
  showLogin();
}

async function submitLogin() {
  const role = document.querySelector('input[name="loginRole"]:checked').value;
  const password = document.getElementById('loginPassword').value;
  const errorBox = document.getElementById('loginError');
  errorBox.innerText = '';

  try {
    const res = await apiPost('login', { role, password });
    if (!res.ok) {
      errorBox.innerText = res.error.message;
      return;
    }
    sessionStorage.setItem('sessionToken', res.data.token);
    sessionStorage.setItem('sessionRole', res.data.role);
    showRoot(res.data.role);
  } catch (err) {
    errorBox.innerText = err.message;
  }
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

document.getElementById('loginSubmitBtn').addEventListener('click', submitLogin);
document.getElementById('userLogoutBtn').addEventListener('click', logout);
document.getElementById('adminLogoutBtn').addEventListener('click', logout);
document.getElementById('uploadBtn').addEventListener('click', upload);
document.getElementById('pwBtn').addEventListener('click', changePassword);

const existingRole = sessionStorage.getItem('sessionRole');
if (existingRole) {
  showRoot(existingRole);
} else {
  showLogin();
}
