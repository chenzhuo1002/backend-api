const express = require('express');
const store = require('../data/store');
const { success, error, generateId } = require('../utils/helpers');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /reminders
router.get('/', authMiddleware, (req, res) => {
  const list = store.reminders.filter(r => r.userId === req.userId);
  res.json(success({ list }));
});

// POST /reminders
router.post('/', authMiddleware, (req, res) => {
  const reminder = {
    id: generateId('r'),
    userId: req.userId,
    ...req.body,
    enabled: req.body.enabled ?? true,
  };
  store.reminders.push(reminder);
  res.json(success(reminder));
});

// PUT /reminders/:id
router.put('/:id', authMiddleware, (req, res) => {
  const reminder = store.reminders.find(r => r.id === req.params.id && r.userId === req.userId);
  if (!reminder) {
    return res.status(404).json(error(10004, '提醒不存在'));
  }
  Object.assign(reminder, req.body);
  res.json(success(reminder));
});

// DELETE /reminders/:id
router.delete('/:id', authMiddleware, (req, res) => {
  const idx = store.reminders.findIndex(r => r.id === req.params.id && r.userId === req.userId);
  if (idx === -1) {
    return res.status(404).json(error(10004, '提醒不存在'));
  }
  store.reminders.splice(idx, 1);
  res.json(success(null));
});

module.exports = router;
