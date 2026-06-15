# 陈医生音乐门诊 · 部署指南

两个免费平台，10 分钟上线。

---

## 第一步：上传到 GitHub

```bash
# 在项目根目录
git add .
git commit -m "陈医生音乐门诊 v1.0"
git remote add origin https://github.com/你的用户名/eason-clinic.git
git push -u origin main
```

---

## 第二步：部署前端 → Vercel（免费）

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录
2. 点击 **New Project** → 选择 `eason-clinic` 仓库
3. 配置：
   - **Root Directory**: `frontend`
   - **Framework**: Next.js（自动识别）
4. 添加环境变量：
   - `NEXT_PUBLIC_API_BASE` = 先填 `http://localhost:8000`（等后端部署完再回来改）
5. 点击 **Deploy**
6. 等待 2 分钟 → 获得网址，例如 `https://eason-clinic.vercel.app`

---

## 第三步：部署后端 → Render（免费）

1. 打开 [render.com](https://render.com)，用 GitHub 登录
2. 点击 **New +** → **Web Service** → 选择 `eason-clinic` 仓库
3. 配置：
   - **Name**: `eason-clinic-api`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. 选择 **Free** 套餐
5. 点击 **Create Web Service**
6. 等待 3 分钟 → 获得网址，例如 `https://eason-clinic-api.onrender.com`

> ⚠️ 免费套餐有冷启动（15 秒左右），首次请求稍慢，之后正常。

---

## 第四步：连接前后端

1. 回到 Vercel 项目设置 → **Environment Variables**
2. 修改 `NEXT_PUBLIC_API_BASE` = `https://eason-clinic-api.onrender.com`
3. 点击 **Save** → Vercel 自动重新部署
4. 同时去 Render 项目设置 → **Environment Variables**
5. 添加 `FRONTEND_URL` = `https://eason-clinic.vercel.app`

---

## 完成 🎈

手机浏览器打开你的 Vercel 网址，就能访问了。

### 可选后续操作

- **自定义域名**：Vercel 和 Render 都支持绑定你自己的域名
- **国内加速**：如果国内访问慢，可以考虑用阿里云/腾讯云部署
- **后端保活**：Render 免费服务 15 分钟无请求会休眠，可以用 [cron-job.org](https://cron-job.org) 每 10 分钟 ping 一次

---

## 国内部署备选（如果 Vercel 太慢）

### 前端 → 阿里云 OSS + CDN

```bash
cd frontend
npm run build
# 把 .next 部署到阿里云 OSS，开 CDN 加速
```

### 后端 → 阿里云 ECS（约 ¥50/月）

```bash
# 在 ECS 上
git clone https://github.com/你的用户名/eason-clinic.git
cd eason-clinic/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
# 配置 nginx 反向代理 + SSL
```
