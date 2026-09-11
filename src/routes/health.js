const express = require('express');
const store = require('../data/store');
const { success, error, generateId } = require('../utils/helpers');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// GET /pets/:petId/health-records
router.get('/', authMiddleware, (req, res) => {
  const { petId } = req.params;
  const pet = store.pets.find(p => p.id === petId && p.userId === req.userId);
  if (!pet) {
    return res.status(404).json(error(10004, '宠物不存在'));
  }

  const { type = 'all', page = 1, pageSize = 20 } = req.query;
  let list = store.healthRecords.filter(r => r.petId === petId);
  if (type !== 'all') {
    list = list.filter(r => r.type === type);
  }
  list.sort((a, b) => new Date(b.date) - new Date(a.date));

  const total = list.length;
  const start = (page - 1) * pageSize;
  const paged = list.slice(start, start + pageSize);

  res.json(success({ total, page: Number(page), pageSize: Number(pageSize), list: paged }));
});

// POST /pets/:petId/health-records
router.post('/', authMiddleware, (req, res) => {
  const { petId } = req.params;
  const pet = store.pets.find(p => p.id === petId && p.userId === req.userId);
  if (!pet) {
    return res.status(404).json(error(10004, '宠物不存在'));
  }
  const record = {
    id: generateId('hr'),
    petId,
    type: req.body.type,
    title: req.body.title,
    desc: req.body.desc,
    date: req.body.date,
    value: req.body.value || null,
    unit: req.body.unit || null,
    createdAt: new Date().toISOString(),
  };
  store.healthRecords.push(record);
  res.json(success(record));
});

// DELETE /pets/:petId/health-records/:recordId
router.delete('/:recordId', authMiddleware, (req, res) => {
  const { petId, recordId } = req.params;
  const idx = store.healthRecords.findIndex(r => r.id === recordId && r.petId === petId);
  if (idx === -1) {
    return res.status(404).json(error(10004, '记录不存在'));
  }
  store.healthRecords.splice(idx, 1);
  res.json(success(null));
});

module.exports = router;
