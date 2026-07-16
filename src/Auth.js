var SESSION_TTL_SECONDS = 6 * 60 * 60;

function hashPassword(password, salt) {
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password + salt);
  return digest.map(function (b) {
    return ('0' + (b & 0xFF).toString(16)).slice(-2);
  }).join('');
}

function generateSalt() {
  return Utilities.getUuid();
}

function propPrefix(role) {
  return role.toUpperCase();
}

function verifyPassword(role, password) {
  var props = PropertiesService.getScriptProperties();
  var salt = props.getProperty(propPrefix(role) + '_PASSWORD_SALT');
  var hash = props.getProperty(propPrefix(role) + '_PASSWORD_HASH');
  if (!salt || !hash) return false;
  return hashPassword(password, salt) === hash;
}

function setPassword(role, newPassword, sessionToken) {
  requireRole(sessionToken, 'admin');
  var salt = generateSalt();
  var props = PropertiesService.getScriptProperties();
  props.setProperty(propPrefix(role) + '_PASSWORD_SALT', salt);
  props.setProperty(propPrefix(role) + '_PASSWORD_HASH', hashPassword(newPassword, salt));
}

function createSession(role) {
  var token = Utilities.getUuid();
  CacheService.getScriptCache().put('session_' + token, role, SESSION_TTL_SECONDS);
  return token;
}

function login(role, password) {
  var normalizedRole = String(role || '').trim().toLowerCase();
  if (normalizedRole !== 'user' && normalizedRole !== 'admin') {
    throw new Error('역할이 올바르지 않습니다.');
  }
  if (!verifyPassword(normalizedRole, password)) {
    throw new Error('비밀번호가 올바르지 않습니다.');
  }
  return { token: createSession(normalizedRole), role: normalizedRole };
}

function getSessionRole(token) {
  if (!token) return null;
  return CacheService.getScriptCache().get('session_' + token);
}

function requireRole(token, role) {
  var actual = getSessionRole(token);
  if (!actual) {
    throw new Error('로그인이 필요합니다.');
  }
  if (role === 'admin' && actual !== 'admin') {
    throw new Error('권한이 없습니다.');
  }
  return actual;
}
