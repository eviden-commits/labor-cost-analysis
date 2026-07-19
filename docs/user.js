if (!sessionStorage.getItem('sessionToken')) {
  window.location.href = 'index.html';
}

function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

document.getElementById('logoutBtn').addEventListener('click', logout);
