const express = require('express');
const store = require('../data/store');
const { success, error } = require('../utils/helpers');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /users/me
router.get('/me', authMiddleware, (req, res) => {
  const user = store.users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json(error(10004, '用户不存在'));
  }
  res.json(success(user));
});

// PUT /users/me
router.put('/me', authMiddleware, (req, res) => {
  const user = store.users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json(error(10004, '用户不存在'));
  }
  Object.assign(user, req.body);
  res.json(success(user));
});

module.exports = router;
