# TieBlog 项目自动更新 + API 安全方案

## 核心问题

**如何安全地让 Agent 定时抓取 GitHub 项目，同时确保 API Key 不泄露？**

---

## 答案：API Key 放在 Vercel 环境变量中是安全的，但绝不能出现在前端代码中

### ❌ 危险做法（Key 会泄露）

```typescript
// 错误！打包后会被浏览器看到
const GITHUB_TOKEN = 'ghp_xxxxxxxxxxxx'  // 泄露！
fetch(`https://api.github.com/users/tie/repos?token=${GITHUB_TOKEN}`)
```

### ✅ 安全做法（Key 永远不会到前端）

```typescript
// api/projects.ts (Vercel Serverless Function)
export default async function handler(req) {
  // GITHUB_TOKEN 只在后端环境变量中，前端永远看不到
  const token = process.env.GITHUB_TOKEN
  
  const repos = await fetch('https://api.github.com/user/repos', {
    headers: { Authorization: `token ${token}` }
  })
  
  return new Response(JSON.stringify(repos))
}
```

**前端调用**（没有 Key，完全安全）：
```typescript
const projects = await fetch('/api/projects').then(r => r.json())
```

---

## 方案对比

| 方案 | 原理 | 安全性 | 复杂度 | 推荐度 |
|------|------|--------|--------|--------|
| **GitHub Actions** | 定时触发 → 抓取 → 生成静态文件 → 推送到仓库 | 最高 | 低 | ⭐⭐⭐ |
| **Vercel Serverless** | 前端请求 `/api/projects` → 后端调用 GitHub API | 高 | 中 | ⭐⭐⭐ |
| **Kimi Cron (本机)** | 每天定时运行 Agent → 更新本地文件 → 推送 | 最高 | 低 | ⭐⭐⭐ |
| **前端直接调用** | 浏览器直接请求 GitHub API | 低（Key 暴露） | 低 | ❌ |

---

## 推荐方案 A：GitHub Actions（最推荐）

**原理**：每天自动运行，抓取 GitHub 数据 → 生成 `projects.json` → 提交到仓库 → Vercel 自动重新部署

```yaml
# .github/workflows/update-projects.yml
name: Update Projects

on:
  schedule:
    - cron: '0 0 * * *'  # 每天 UTC 0 点
  workflow_dispatch:  # 手动触发

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Fetch GitHub Projects
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}  # GitHub 自动提供，安全
        run: |
          curl -H "Authorization: token $GITHUB_TOKEN" \
               https://api.github.com/users/tie/repos \
               > public/projects.json
      
      - name: Commit and Push
        run: |
          git config user.name "github-actions"
          git config user.email "actions@github.com"
          git add public/projects.json
          git diff --cached --quiet || git commit -m "chore: update projects"
          git push
```

**前端读取**：
```typescript
const projects = await fetch('/projects.json').then(r => r.json())
```

**优点**：
- ✅ `GITHUB_TOKEN` 存储在 GitHub Secrets，永远不出仓库
- ✅ 前端只读取静态 JSON，无需 API Key
- ✅ Vercel 自动检测 `push` 重新部署
- ✅ 每天自动更新，完全无人值守

---

## 推荐方案 B：Vercel Serverless Function

**原理**：前端请求 `/api/projects` → Vercel 后端调用 GitHub API → 返回数据

```typescript
// api/projects.ts
export default async function handler(req) {
  const token = process.env.GITHUB_TOKEN  // Vercel 环境变量
  
  const response = await fetch('https://api.github.com/user/repos', {
    headers: { Authorization: `token ${token}` }
  })
  
  const repos = await response.json()
  
  // 只返回需要的字段，过滤敏感信息
  const projects = repos.map(repo => ({
    name: repo.name,
    description: repo.description,
    stars: repo.stargazers_count,
    language: repo.language,
    url: repo.html_url,
    updated_at: repo.updated_at,
  }))
  
  return new Response(JSON.stringify(projects), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

**Vercel 环境变量设置**：
```bash
vercel env add GITHUB_TOKEN
type: secret
value: ghp_xxxxxxxxxxxx
```

**优点**：
- ✅ 实时数据，不是静态文件
- ✅ API Key 只在 Vercel 后端，前端看不到
- ✅ 可以添加缓存（每小时更新一次）

---

## 推荐方案 C：Kimi Cron + 推送（你已经在用 Kimi Work）

**原理**：利用 Kimi Work 的定时任务，每天运行 Agent 抓取 GitHub → 更新文件 → 推送

```
Kimi Cron (每天 9:00)
    ↓
调用 GitHub API (token 存储在 Kimi Vault)
    ↓
生成 projects.json
    ↓
git push 到仓库
    ↓
Vercel 自动重新部署
```

**Kimi Cron 配置**：
- 每天 9:00 运行
- 调用 GitHub API 抓取仓库
- 生成 `public/projects.json`
- `git push` 提交
- Vercel 自动检测并重新部署

**优点**：
- ✅ 完全自动化，不需要 GitHub Actions
- ✅ 可以用 Kimi Agent 做智能总结（不只是原始数据）
- ✅ API Key 存储在 Kimi Vault，安全

---

## Vercel 环境变量安全说明

| 环境 | API Key 暴露风险 |
|------|-----------------|
| `NEXT_PUBLIC_*` | ❌ 会暴露给前端（浏览器可见） |
| 普通 `GITHUB_TOKEN` | ✅ 只存在于后端，安全 |
| GitHub Actions `secrets` | ✅ GitHub 加密存储，安全 |
| Kimi Vault Memory | ✅ 本地加密，安全 |

### 安全规则

1. **前端代码中不要出现任何 API Key**（包括 `process.env` 的 `NEXT_PUBLIC_` 前缀）
2. **Vercel Serverless Function 中可以安全使用 `process.env`**
3. **GitHub Actions 的 `secrets` 是加密的，安全**
4. **Kimi Vault 存储的记忆是本地加密，安全**

---

## 推荐最终架构

```
┌─────────────────────────────────────────────────┐
│              GitHub (源码仓库)                   │
│  ┌──────────────────────────────────────────┐  │
│  │  .github/workflows/update-projects.yml     │  │
│  │  Kimi Cron / GitHub Actions 定时运行     │  │
│  │  → 抓取 GitHub API (token 在 secrets)   │  │
│  │  → 生成 public/projects.json              │  │
│  │  → git push 提交                          │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                    │
                    │ push 触发
                    ↓
┌─────────────────────────────────────────────────┐
│              Vercel (自动部署)                    │
│  ┌──────────────────────────────────────────┐  │
│  │  前端 (React + Vite)                     │  │
│  │  → 读取 /projects.json (静态文件)        │  │
│  │  → 无需 API Key                          │  │
│  │                                          │  │
│  │  API 代理:                               │  │
│  │  /api/chat → OpenAI API (key 在 env)    │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 总结

**你的担心是对的**：如果直接把 API Key 写进前端代码，部署到 Vercel 后会被浏览器看到。

**但正确做法下完全安全**：
- GitHub API Token 存在 GitHub Secrets / Vercel 后端环境变量
- 前端只读取静态 JSON 或调用 `/api/*` 代理
- API Key 永远不会出现在浏览器中

**建议**：用 **GitHub Actions** 方案（最稳定、最安全），或者 **Kimi Cron**（更灵活，Agent 可以智能总结）。

需要我帮你实现哪个方案？
