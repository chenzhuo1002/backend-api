const express = require('express');
const store = require('../data/store');
const { success, error, generateId } = require('../utils/helpers');
const { signToken, signRefreshToken, verifyToken } = require('../utils/auth');
const { sendVerificationCode } = require('../services/sms');

const router = express.Router();

// 生成 6 位数字验证码
function generateSmsCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// POST /auth/sms/send
router.post('/sms/send', async (req, res) => {
  const { phone, scene } = req.body;
  if (!phone || !scene) {
    return res.status(400).json(error(10001, '参数错误'));
  }

  // 支持配置固定手机号+验证码，方便个人开发者调试
  const fixedPhone = process.env.SMS_FIXED_PHONE;
  const fixedCode = process.env.SMS_FIXED_CODE;
  const code = fixedPhone && fixedCode && phone === fixedPhone ? fixedCode : generateSmsCode();

  try {
    await sendVerificationCode(phone, code);
    store.verificationCodes[phone] = { code, expireAt: Date.now() + 5 * 60 * 1000 };
    res.json(success({ expireSeconds: 300 }, '验证码发送成功'));
  } catch (err) {
    console.error('[SMS Send Error]', err.message || err);
    res.status(500).json(error(20001, `短信发送失败：${err.message}`));
  }
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

// GET /auth/debug/sms-config
// 仅用于排查环境变量是否生效，不返回具体密钥/验证码
router.get('/debug/sms-config', (req, res) => {
  const fixedPhone = process.env.SMS_FIXED_PHONE || '';
  const { phone } = req.query;
  res.json(success({
    provider: process.env.SMS_PROVIDER || 'console',
    fixedPhoneConfigured: !!fixedPhone,
    fixedCodeConfigured: !!process.env.SMS_FIXED_CODE,
    fixedPhoneMatch: phone === fixedPhone,
  }));
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  res.json(success(null, '退出成功'));
});

module.exports = router;
