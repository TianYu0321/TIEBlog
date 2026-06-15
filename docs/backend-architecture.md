# TieBlog 后端架构文档

## 1. 架构概述

```
┌─────────────────────────────────────────┐
│           前端 (TieBlog)                 │
│  React + Vite + 静态部署 (Vercel)       │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  AgentChat.tsx                  │    │
│  │  直接调用 OpenAI 兼容 API        │    │
│  │  (开发模式用 .env 配置)          │    │
│  └─────────────────────────────────┘    │
│                                         │
│  生产环境：API Key 通过 Vercel           │
│  Serverless Function 代理调用           │
└─────────────────────────────────────────┘
                    │
                    │ HTTP / SSE
                    │
┌─────────────────────────────────────────┐
│         后端代理层 (Vercel Edge)         │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  /api/chat (Serverless)         │    │
│  │  转发到 OpenAI / Kimi / etc.    │    │
│  │  隐藏 API Key，处理流式响应    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  环境变量: OPENAI_API_KEY, BASE_URL    │
│  支持: OpenAI, Kimi, DeepSeek, etc.    │
└─────────────────────────────────────────┘
```

## 2. 部署方案

### 方案 A：Vercel Serverless (推荐)

**前端**: 静态部署到 Vercel
**后端**: Vercel Edge Function 代理 API 调用

```typescript
// api/chat.ts (Vercel Edge Function)
export default async function handler(req) {
  const { messages, model } = await req.json();
  
  const response = await fetch(`${process.env.OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      messages,
      stream: true,
    }),
  });
  
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
```

**前端调用**:
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ messages, model: 'gpt-4o-mini' }),
});
// 处理 SSE 流式响应
```

### 方案 B：Cloudflare Workers

更轻量，全球边缘部署，免费额度高。

```typescript
// worker.ts
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/chat') {
      // 代理到 OpenAI API
      return proxyToOpenAI(request, env);
    }
    return new Response('Not Found', { status: 404 });
  }
};
```

### 方案 C：自建后端 (Node.js/Express)

适合需要更多自定义逻辑的场景。

```typescript
// server.ts
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.use('/api/chat', createProxyMiddleware({
  target: process.env.OPENAI_BASE_URL,
  changeOrigin: true,
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
  },
}));
app.listen(3001);
```

## 3. 环境变量配置

创建 `.env` 文件：

```
# OpenAI 兼容 API 配置
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
VITE_OPENAI_BASE_URL=https://api.openai.com/v1
VITE_OPENAI_MODEL=gpt-4o-mini

# 或其他提供商:
# VITE_OPENAI_BASE_URL=https://api.moonshot.cn/v1  (Kimi)
# VITE_OPENAI_BASE_URL=https://api.deepseek.com/v1  (DeepSeek)
```

## 4. 支持的 AI 提供商

| 提供商 | BASE_URL | 备注 |
|--------|----------|------|
| OpenAI | https://api.openai.com/v1 | 官方，功能最全 |
| Kimi | https://api.moonshot.cn/v1 | 中文能力强 |
| DeepSeek | https://api.deepseek.com/v1 | 性价比高 |
| Groq | https://api.groq.com/openai/v1 | 速度快 |
| 本地模型 | http://localhost:1234/v1 | LM Studio |

## 5. 安全注意事项

1. **API Key 不要暴露在前端代码中**（生产环境）
2. **使用代理层隐藏 API Key**
3. **设置请求限流**（Rate Limiting）
4. **添加 IP 白名单**（可选）
5. **使用环境变量管理敏感信息**

## 6. 快速部署

### Vercel (推荐)

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel --prod

# 4. 设置环境变量
vercel env add OPENAI_API_KEY
vercel env add OPENAI_BASE_URL
```

### 本地开发

```bash
# 前端
npm run dev

# 后端代理 (另开终端)
node server/proxy.js
```

---

*架构版本: v1.0*
*状态: 设计完成，待部署*
