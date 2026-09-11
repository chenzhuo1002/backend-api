const express = require('express');
const store = require('../data/store');
const { success, error, generateId } = require('../utils/helpers');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /community/posts
router.get('/posts', authMiddleware, (req, res) => {
  const { type = 'recommend', petType, page = 1, pageSize = 20 } = req.query;
  let list = [...store.communityPosts];

  if (type === 'recommend') {
    list.sort((a, b) => b.likes - a.likes);
  } else {
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (petType && petType !== 'all') {
    list = list.filter(p => p.petType === petType);
  }

  const total = list.length;
  const start = (page - 1) * pageSize;
  const paged = list.slice(start, start + pageSize);

  res.json(success({ total, page: Number(page), pageSize: Number(pageSize), list: paged }));
});

// POST /community/posts
router.post('/posts', authMiddleware, (req, res) => {
  const user = store.users.find(u => u.id === req.userId);
  const post = {
    id: generateId('post'),
    author: {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
    },
    content: req.body.content,
    images: req.body.images || [],
    likes: 0,
    comments: 0,
    petType: req.body.petType || 'other',
    createdAt: new Date().toISOString(),
  };
  store.communityPosts.unshift(post);
  res.json(success(post));
});

// POST /community/posts/:id/like
router.post('/posts/:id/like', authMiddleware, (req, res) => {
  const post = store.communityPosts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json(error(10004, '动态不存在'));
  post.likes += 1;
  res.json(success(post));
});

// DELETE /community/posts/:id/like
router.delete('/posts/:id/like', authMiddleware, (req, res) => {
  const post = store.communityPosts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json(error(10004, '动态不存在'));
  post.likes = Math.max(0, post.likes - 1);
  res.json(success(post));
});

// GET /community/posts/:id/comments
router.get('/posts/:id/comments', authMiddleware, (req, res) => {
  res.json(success({ list: [] }));
});

// POST /community/posts/:id/comments
router.post('/posts/:id/comments', authMiddleware, (req, res) => {
  const post = store.communityPosts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json(error(10004, '动态不存在'));
  post.comments += 1;
  res.json(success({ id: generateId('c'), content: req.body.content, createdAt: new Date().toISOString() }));
});

module.exports = router;
