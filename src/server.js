require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const petRoutes = require('./routes/pets');
const healthRoutes = require('./routes/health');
const reminderRoutes = require('./routes/reminders');
const shopRoutes = require('./routes/shop');
const communityRoutes = require('./routes/community');
const fileRoutes = require('./routes/files');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API 路由
app.use('/v1/auth', authRoutes);
app.use('/v1/users', userRoutes);
app.use('/v1/pets', petRoutes);
app.use('/v1/pets/:petId/health-records', healthRoutes);
app.use('/v1/reminders', reminderRoutes);
app.use('/v1/shop', shopRoutes);
app.use('/v1/community', communityRoutes);
app.use('/v1/files', fileRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ code: 10004, message: '接口不存在', data: null });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ code: 10005, message: '服务器内部错误', data: null });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PetMate 后端服务已启动: http://0.0.0.0:${PORT}`);
  console.log(`📱 React Native 开发请使用你电脑的局域网 IP，例如 http://192.168.x.x:${PORT}`);
});
