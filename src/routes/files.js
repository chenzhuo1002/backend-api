const express = require('express');
const { success } = require('../utils/helpers');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /files/upload-token
router.post('/upload-token', authMiddleware, (req, res) => {
  const { filename, mimeType } = req.body;
  const key = `uploads/${Date.now()}_${filename}`;
  res.json(success({
    uploadUrl: `http://localhost:${process.env.PORT || 3000}/files/upload`,
    accessUrl: `https://cdn.example.com/${key}`,
    fields: { key, mimeType },
  }));
});

module.exports = router;
