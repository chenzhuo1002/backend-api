# 宠伴 PetMate 后端服务

一个基于 Express 的轻量级后端服务，用于本地开发和接口联调。数据存储在内存中，重启后恢复默认种子数据。

## 目录

- `src/server.js`：服务入口
- `src/routes/`：各模块接口
- `src/data/store.js`：内存数据与种子数据
- `src/middleware/auth.js`：JWT 认证中间件
- `src/utils/`：工具函数

## 快速开始

```bash
cd backend
npm install
npm start
```

开发热重载：

```bash
npm run dev
```

## 环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

可配置项：

- `PORT`：服务端口，默认 3000
- `JWT_SECRET`：JWT 签名密钥
- `NODE_ENV`：development / production

## 接口说明

完整接口规范见项目根目录 `docs/API.md`。

### 常用接口

- `POST /v1/auth/sms/send`：发送验证码（演示固定为 123456）
- `POST /v1/auth/login/phone`：手机号 + 验证码登录
- `GET /v1/users/me`：获取当前用户
- `GET /v1/pets`：获取宠物列表
- `GET /v1/pets/:petId/health-records`：获取健康记录
- `GET /v1/shop/products`：获取商品列表
- `GET /v1/community/posts`：获取社区动态

## 与 React Native 联调

1. 启动后端服务，记录服务地址，例如 `http://192.168.1.5:3000`。
2. 修改 `../src/config/api.js` 中的 `API_BASE_URL` 为后端地址（注意要带 `/v1`）。
3. React Native 端重新加载即可调用真实接口。

### 不同调试场景地址

| 场景 | 地址示例 |
|------|---------|
| 浏览器/Postman 本机测试 | `http://localhost:3000/v1` |
| Android 真机（同一局域网） | `http://192.168.x.x:3000/v1` |
| Android 模拟器 | `http://10.0.2.2:3000/v1` |
| iOS 模拟器 | `http://localhost:3000/v1` |

## 部署到生产

本服务仅用于开发和演示。生产环境建议：

1. 替换内存存储为数据库（MySQL / PostgreSQL / MongoDB）。
2. 使用真实短信服务发送验证码。
3. 配置 HTTPS、反向代理（Nginx/Caddy）。
4. 将 `JWT_SECRET` 设置为强随机字符串。
5. 使用 PM2、Docker 或云函数部署。

下面提供三种一键式云平台部署方案，按推荐程度排序：

---

### 方案一：Railway（推荐，简单免费额度足）

1.  fork 或上传本项目到 GitHub。
2.  登录 [Railway](https://railway.app/)，点击 **New Project → Deploy from GitHub repo**。
3.  选择本项目，`railway.json` 会自动识别 Dockerfile。
4.  在 Railway 面板添加环境变量：
    - `NODE_ENV` = `production`
    - `JWT_SECRET` = 强随机字符串（可用 `openssl rand -base64 32` 生成）
5.  部署完成后，Railway 会提供一个 HTTPS 域名，例如 `https://petmate-backend.up.railway.app`。
6.  将该域名 + `/v1` 填入 `../src/config/api.js` 的 `PROD_BASE_URL`。

---

### 方案二：Render

1.  登录 [Render](https://render.com/)，点击 **New → Web Service**。
2.  连接 GitHub 仓库，Render 会自动读取 `render.yaml`。
3.  确认启动命令为 `node src/server.js`，并设置环境变量 `JWT_SECRET`。
4.  部署完成后获取 HTTPS 域名，更新 RN 配置。

---

### 方案三：Fly.io

1.  安装 [flyctl](https://fly.io/docs/hands-on/install-flyctl/)。
2.  在 `backend/` 目录下执行：

    ```bash
    flyctl launch
    flyctl secrets set JWT_SECRET=$(openssl rand -base64 32)
    flyctl deploy
    ```

3.  部署完成后获取 `https://petmate-backend.fly.dev`，更新 RN 配置。

---

### 部署后验证

```bash
curl https://你的域名/health
```

应返回：

```json
{ "status": "ok", "time": "..." }
```

### 更新 React Native 生产地址

部署成功后，修改 `../src/config/api.js`：

```js
const PROD_BASE_URL = 'https://你的域名/v1';
```
