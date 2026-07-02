# 陈医生音乐门诊 · 部署指南

一个平台，3 分钟上线，完全免费，不需要银行卡。

---

## 部署到 Vercel

所有逻辑（前端 + 推荐引擎）已整合到 Next.js 中，只需部署 `frontend` 目录。

### 1. 上传到 GitHub

```bash
git add .
git commit -m "陈医生音乐门诊 v1.0"
git remote add origin https://github.com/你的用户名/eason-clinic.git
git push -u origin main
```

### 2. 连接 Vercel

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录
2. 点击 **New Project** → 选择 `eason-clinic` 仓库
3. 配置：
   - **Root Directory**: `frontend`
   - **Framework**: Next.js（自动识别）
4. **不需要**设置任何环境变量
5. 点击 **Deploy**

### 3. 完成

等待 2 分钟，获得网址，例如 `https://eason-clinic.vercel.app`。

手机和电脑都能访问。

---

## 本地开发

```bash
cd frontend
npm install
npm run dev
```

打开 `http://localhost:3000`，所有功能（包括处方生成）都在本地运行。

---

## 项目结构说明

```
eason-clinic/
├─ frontend/                    # ← 只部署这个目录
│  ├─ src/
│  │  ├─ app/
│  │  │  ├─ page.tsx            # 首页
│  │  │  ├─ layout.tsx          # 根布局
│  │  │  └─ api/
│  │  │     └─ prescription/
│  │  │         └─ route.ts     # 推荐引擎 API
│  │  ├─ components/            # UI 组件
│  │  └─ lib/
│  │     ├─ data/
│  │     │  ├─ songs.ts         # 50 首歌曲数据
│  │     │  └─ mood_keywords.ts # 情绪关键词 + 模板
│  │     ├─ api.ts              # API 客户端
│  │     ├─ types.ts            # 类型定义
│  │     └─ utils.ts            # 工具函数
│  └─ public/assets/            # 图片素材
├─ backend/                     # 历史代码（不再使用）
└─ assets_raw/                  # 原始素材（不部署）
```
