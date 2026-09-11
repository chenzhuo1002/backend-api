const express = require('express');
const store = require('../data/store');
const { success, error, generateId } = require('../utils/helpers');
const { signToken, signRefreshToken, verifyToken } = require('../utils/auth');

const router = express.Router();

// POST /auth/sms/send
router.post('/sms/send', (req, res) => {
  const { phone, scene } = req.body;
  if (!phone || !scene) {
    return res.status(400).json(error(10001, '参数错误'));
  }
  const code = '123456'; // 演示固定验证码
  store.verificationCodes[phone] = { code, expireAt: Date.now() + 5 * 60 * 1000 };
  res.json(success({ expireSeconds: 300 }, '验证码发送成功'));
});

// POST /auth/login/phone
router.post('/login/phone', (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json(error(10001, '参数错误'));
  }

  const record = store.verificationCodes[phone];
  if (!record || record.code !== code || record.expireAt < Date.now()) {
    return res.status(400).json(error(20002, '验证码错误或已过期'));
  }

  let user = store.users.find(u => u.phone === phone);
  if (!user) {
    user = {
      id: generateId('u'),
      phone,
      nickname: `用户${phone.slice(-4)}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`,
      region: '北京',
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
  }

  const token = signToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  res.json(success({
    user,
    token,
    refreshToken,
    expireAt: Math.floor(Date.now() / 1000) + 2 * 60 * 60,
  }));
});

// POST /auth/token/refresh
router.post('/token/refresh', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json(error(10002, 'Refresh Token 无效'));
  }
  const newToken = signToken({ userId: decoded.userId });
  res.json(success({
    token: newToken,
    expireAt: Math.floor(Date.now() / 1000) + 2 * 60 * 60,
  }));
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  res.json(success(null, '退出成功'));
});

module.exports = router;
