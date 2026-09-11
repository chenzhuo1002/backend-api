const { v4: uuidv4 } = require('uuid');

function success(data = null, message = 'success') {
  return {
    code: 0,
    message,
    data,
    requestId: `req_${uuidv4().slice(0, 12)}`,
  };
}

function error(code, message) {
  return {
    code,
    message,
    data: null,
    requestId: `req_${uuidv4().slice(0, 12)}`,
  };
}

function generateId(prefix) {
  return `${prefix}_${uuidv4().slice(0, 8)}`;
}

module.exports = { success, error, generateId };
