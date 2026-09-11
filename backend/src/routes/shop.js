const express = require('express');
const store = require('../data/store');
const { success, error, generateId } = require('../utils/helpers');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /shop/categories
router.get('/categories', authMiddleware, (req, res) => {
  const { petType } = req.query;
  let list = store.shopCategories;
  if (petType && petType !== 'all') {
    list = list.filter(c => c.petType === petType || c.petType === 'all');
  }
  res.json(success({ list }));
});

// GET /shop/products
router.get('/products', authMiddleware, (req, res) => {
  const { categoryId, petType, page = 1, pageSize = 20 } = req.query;
  let list = store.products;
  if (categoryId) {
    list = list.filter(p => p.categoryId === categoryId);
  }
  if (petType && petType !== 'all') {
    list = list.filter(p => p.petType === petType || p.petType === 'all');
  }
  const total = list.length;
  const start = (page - 1) * pageSize;
  const paged = list.slice(start, start + pageSize);
  res.json(success({ total, page: Number(page), pageSize: Number(pageSize), list: paged }));
});

// GET /shop/products/:id
router.get('/products/:id', authMiddleware, (req, res) => {
  const product = store.products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json(error(10004, '商品不存在'));
  }
  res.json(success(product));
});

// GET /shop/cart
router.get('/cart', authMiddleware, (req, res) => {
  const cart = store.carts[req.userId] || { items: [] };
  res.json(success(cart));
});

// POST /shop/cart/items
router.post('/cart/items', authMiddleware, (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity) {
    return res.status(400).json(error(10001, '参数错误'));
  }
  if (!store.carts[req.userId]) {
    store.carts[req.userId] = { items: [] };
  }
  const product = store.products.find(p => p.id === productId);
  store.carts[req.userId].items.push({
    id: generateId('ci'),
    productId,
    quantity,
    name: product?.name,
    price: product?.price,
  });
  res.json(success(store.carts[req.userId]));
});

// PUT /shop/cart/items/:id
router.put('/cart/items/:id', authMiddleware, (req, res) => {
  const cart = store.carts[req.userId];
  if (!cart) return res.status(404).json(error(10004, '购物车为空'));
  const item = cart.items.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json(error(10004, '购物车项不存在'));
  Object.assign(item, req.body);
  res.json(success(cart));
});

// DELETE /shop/cart/items/:id
router.delete('/cart/items/:id', authMiddleware, (req, res) => {
  const cart = store.carts[req.userId];
  if (!cart) return res.status(404).json(error(10004, '购物车为空'));
  cart.items = cart.items.filter(i => i.id !== req.params.id);
  res.json(success(cart));
});

// POST /shop/orders
router.post('/orders', authMiddleware, (req, res) => {
  const { items, addressId, remark } = req.body;
  if (!items || !items.length) {
    return res.status(400).json(error(10001, '参数错误'));
  }
  const order = {
    id: generateId('o'),
    userId: req.userId,
    items,
    addressId,
    remark,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  if (!store.orders[req.userId]) store.orders[req.userId] = [];
  store.orders[req.userId].push(order);
  res.json(success(order));
});

// GET /shop/orders
router.get('/orders', authMiddleware, (req, res) => {
  const { status } = req.query;
  let list = store.orders[req.userId] || [];
  if (status) {
    list = list.filter(o => o.status === status);
  }
  res.json(success({ list }));
});

module.exports = router;
