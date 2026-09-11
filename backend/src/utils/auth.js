const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'petmate_dev_secret';
const TOKEN_EXPIRE = '2h';
const REFRESH_EXPIRE = '30d';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRE });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRE });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

module.exports = { signToken, signRefreshToken, verifyToken };
