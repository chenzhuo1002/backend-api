const { verifyToken } = require('../utils/auth');
const { error } = require('../utils/helpers');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  if (!token) {
    return res.status(401).json(error(10002, '未授权，Token 缺失'));
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json(error(10002, '未授权，Token 无效或已过期'));
  }

  req.userId = decoded.userId;
  next();
}

module.exports = { authMiddleware };
