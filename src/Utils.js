function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function successResponse_(data) {
  return { ok: true, data: data };
}

function errorResponse_(code, message) {
  return { ok: false, error: { code: code, message: message } };
}

function parsePostBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }
  try {
    return JSON.parse(e.postData.contents);
  } catch (err) {
    throw new Error('POST body JSON 파싱 실패: ' + err.message);
  }
}
