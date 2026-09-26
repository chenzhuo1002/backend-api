const express = require('express');
const store = require('../data/store');
const { success, error, generateId } = require('../utils/helpers');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /pets
router.get('/', authMiddleware, (req, res) => {
  const list = store.pets.filter(p => p.userId === req.userId);
  res.json(success({ list }));
});

// POST /pets
router.post('/', authMiddleware, (req, res) => {
  const { name, type, breed, birthday, weight, gender } = req.body;
  if (!name || !type) {
    return res.status(400).json(error(10001, '参数错误'));
  }
  const pet = {
    id: generateId('p'),
    name,
    type,
    breed: breed || '',
    age: '',
    weight: weight || 0,
    avatar: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${name}`,
    birthday: birthday || '',
    gender: gender || 'unknown',
    userId: req.userId,
  };
  store.pets.push(pet);
  res.json(success(pet));
});

// PUT /pets/:id
router.put('/:id', authMiddleware, (req, res) => {
  const pet = store.pets.find(p => p.id === req.params.id && p.userId === req.userId);
  if (!pet) {
    return res.status(404).json(error(10004, '宠物不存在'));
  }
  Object.assign(pet, req.body);
  res.json(success(pet));
});

// DELETE /pets/:id
router.delete('/:id', authMiddleware, (req, res) => {
  const idx = store.pets.findIndex(p => p.id === req.params.id && p.userId === req.userId);
  if (idx === -1) {
    return res.status(404).json(error(10004, '宠物不存在'));
  }
  store.pets.splice(idx, 1);
  res.json(success(null));
});

module.exports = router;
