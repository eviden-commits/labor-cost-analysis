function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'healthCheck';
    var result;

    switch (action) {
      case 'healthCheck':
        result = successResponse_({ status: 'OK', system: '노무비 분석' });
        break;
      default:
        result = errorResponse_('UNKNOWN_ACTION', '알 수 없는 action입니다: ' + action);
    }

    return jsonOutput_(result);
  } catch (err) {
    return jsonOutput_(errorResponse_('DO_GET_ERROR', String(err.message || err)));
  }
}

function doPost(e) {
  try {
    var body = parsePostBody_(e);
    var action = body.action || '';
    var payload = body.payload || {};
    var result;

    switch (action) {
      case 'login':
        result = successResponse_(login(payload.role, payload.password));
        break;

      case 'uploadContractFile':
        result = successResponse_(uploadContractFile(
          payload.token, payload.base64Data, payload.filename, payload.mimeType
        ));
        break;

      case 'setPassword':
        setPassword(payload.role, payload.newPassword, payload.token);
        result = successResponse_({ changed: true });
        break;

      case 'checkWageAppropriateness':
        result = successResponse_(checkWageAppropriateness(
          payload.token, payload.birthDate, payload.gender, payload.jobType,
          payload.desiredWage, payload.wageType, payload.ageMode, payload.referenceMonth
        ));
        break;

      case 'getEmployeeWageTrend':
        result = successResponse_(getEmployeeWageTrend(payload.token, payload.employeeId));
        break;

      case 'getWageGrowth':
        result = successResponse_(getWageGrowth(
          payload.token, payload.wageType, payload.fromMonth, payload.toMonth
        ));
        break;

      default:
        result = errorResponse_('UNKNOWN_ACTION', '알 수 없는 action입니다: ' + action);
    }

    return jsonOutput_(result);
  } catch (err) {
    return jsonOutput_(errorResponse_('DO_POST_ERROR', String(err.message || err)));
  }
}
