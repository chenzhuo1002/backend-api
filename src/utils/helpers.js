const { randomUUID } = require('crypto');

function genReqId() {
  return `req_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

function success(data = null, message = 'success') {
  return {
    code: 0,
    message,
    data,
    requestId: genReqId(),
  };
}

function error(code, message) {
  return {
    code,
    message,
    data: null,
    requestId: genReqId(),
  };
}

function generateId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 8)}`;
}

module.exports = { success, error, generateId };
