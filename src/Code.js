function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) || 'user-login';
  var file = PAGE_MAP[page] || PAGE_MAP['user-login'];
  return HtmlService.createTemplateFromFile(file)
    .evaluate()
    .setTitle('노무비 분석')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

var PAGE_MAP = {
  'user-login': 'UserLogin',
  'admin-login': 'AdminLogin',
  'user': 'UserDashboard',
  'admin': 'AdminDashboard'
};

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
