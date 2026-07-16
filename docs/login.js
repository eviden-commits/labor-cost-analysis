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
    window.location.href = res.data.role === 'admin' ? 'admin.html' : 'user.html';
  } catch (err) {
    errorBox.innerText = err.message;
  }
}

document.getElementById('loginSubmitBtn').addEventListener('click', submitLogin);

if (sessionStorage.getItem('sessionRole')) {
  window.location.href = sessionStorage.getItem('sessionRole') === 'admin' ? 'admin.html' : 'user.html';
}
