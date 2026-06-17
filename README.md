# TieBlog

> Tie 的个人技术博客 — 裸眼3D Teto 视频环绕 + AI Agent + 环境光主题系统

**在线访问**: [https://tieblog.vercel.app](https://tieblog.vercel.app)

---

## 项目介绍

TieBlog 是一个**炫技型个人作品集网站**，核心目标是展示前端开发能力、AI 辅助开发实践，以及个人 GitHub 项目。

### 核心特性

| 特性 | 说明 |
|------|------|
| **裸眼3D 视频环绕** | 全屏 Teto 视频背景，CSS 3D 缓入效果，GPU 加速渲染 |
| **环境光主题系统** | 5 种预设主题（Matrix/Pure/Neon/Lo-Fi/Glitch），视频 + 音乐联动 |
| **AI Agent 聊天** | 基于项目上下文的专属 AI，只回答技术问题，拒绝闲聊 |
| **GitHub 自动同步** | 每周自动抓取 GitHub 仓库，LLM 生成一句话总结 |
| **音乐播放器** | 右侧玻璃态面板，频谱可视化，音量可调 |

---

## 技术栈

- **前端**: React 19 + Vite + TypeScript + Tailwind CSS v4
- **部署**: Vercel（静态前端 + Edge Function）
- **AI**: DeepSeek API（通过 Vercel Edge Function 代理）
- **CI**: GitHub Actions（每周自动抓取 GitHub 项目）

---

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/TianYu0321/TieBlog.git
cd TieBlog

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 环境变量

复制 `.env.example` 为 `.env.local`，填入：

```env
OPENAI_API_KEY=sk-your-deepseek-key
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
```

---

## 项目结构

```
TieBlog
├── .github/workflows/    # GitHub Actions 定时抓取
├── api/                  # Vercel Edge Function（API 代理）
├── scripts/              # GitHub 抓取脚本
├── public/               # 静态资源（视频、音频、项目数据）
├── src/components/       # React 组件
│   ├── TetoSurround.tsx  # 视频背景
│   ├── Hero3D.tsx        # 主页面
│   ├── MusicPlayer.tsx   # 音乐播放器
│   ├── AgentChat.tsx     # AI 聊天
│   ├── Projects.tsx      # 项目展示
│   └── ThemeProvider.tsx # 主题管理
└── design.md             # 开发文档
```

---

## 部署

1. 推送代码到 GitHub
2. Vercel 导入 GitHub 仓库
3. 配置环境变量（`OPENAI_API_KEY` 等）
4. 自动部署

---

## 联系

- **QQ**: [扫码添加](/qr/qq.png)
- **微信**: [扫码添加](/qr/wechat.png)

---

Made with ❤ by Tie
