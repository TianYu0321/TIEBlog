# TieBlog 开发文档

> 不是设计文档，是开发任务文档。看到一条就做完一条，做完打勾。

---

## 1. 项目目标

TieBlog 是一个个人技术博客 / 作品集网站，核心目标是：

1. **展示个人项目** — 通过 GitHub 自动抓取，每天更新项目列表
2. **炫技入口** — 全屏 Teto 裸眼3D 视频 + 环境光主题系统
3. **AI 辅助开发实践** — 基于项目上下文的 AI Assistant，只回答项目相关问题

上线标准：打开页面 → 看到视频 → 点击 Agent 能对话 → 下拉能看到项目。就这么简单。

---

## 2. 当前状态

| 模块 | 状态 | 已知问题 | 下一步 |
|------|------|----------|--------|
| **TetoSurround** | ✅ 完成 | 视频无 poster，中文文件名需 encode | 加 poster 兜底图 |
| **Hero3D** | ✅ 完成 | — | — |
| **MusicPlayer** | ✅ 完成 | 只有 1 首歌，无 localStorage | 加歌单 + 本地持久化 |
| **AgentChat** | ✅ 本地完成 | 无输入长度限制、无错误兜底、无历史截断 | 加限制 + 错误处理 |
| **Projects** | ⚠️ mock 阶段 | 硬编码 6 个假项目，未接 GitHub 数据 | 接真实数据 + 白名单 |
| **GitHub 抓取** | ✅ 已配置 | 用户名是 `your-username` 占位符 | 替换真实用户名 |
| **API 安全** | ✅ 完成 | Edge Function 已做 | 加 rate limit（Vercel 层） |
| **部署** | ❌ 未验证 | 本地 build 通过，未上 Vercel | 配环境变量 + 部署 |

---

## 3. P0 上线任务（不做完不能上线）

### 3.1 视频背景兜底

**问题**：Teto 视频体积大，移动端可能加载失败；也没有 poster 图。

**验收标准**：
- [ ] `TetoSurround.tsx` 的 `<video>` 加 `poster` 属性，指向一张 1920x1080 的静态截图
- [ ] 生成 poster 图：从视频截取第一帧或关键帧，保存为 `public/video/poster.jpg`
- [ ] 视频 `src` 改回相对路径，但保留 `encodeURIComponent` 处理中文文件名
- [ ] 测试：禁用网络或把视频文件名改错，确认 poster 图显示正常

**改动位置**：`src/components/TetoSurround.tsx` 第 33-46 行

```tsx
<video
  ref={videoRef}
  src={VIDEO_MAIN}
  poster="/video/poster.jpg"  // ← 加这行
  muted loop playsInline preload="auto"
  ...
/>
```

---

### 3.2 Agent API 错误处理

**问题**：`/api/chat` 挂了、API Key 失效、用户输入超长，前端没有任何兜底。

**验收标准**：
- [ ] **输入长度限制**：`AgentChat.tsx` 输入框限制最大 500 字符，超长得截断或禁止发送
- [ ] **消息历史截断**：发送给 API 的消息总长度超过 4000 token 时，从最早的消息开始丢弃，保留系统提示 + 最近 10 轮对话
- [ ] **错误状态分类**：前端区分三种错误并给出不同提示：
  - API Key 未配置 → "Agent 服务未配置，请联系管理员"
  - API 服务商挂了 → "Agent 服务暂时不可用，请稍后重试"
  - 用户输入超限制 → "输入内容过长，请精简后重试"
- [ ] **重试按钮**：API 失败时消息气泡里显示"重试"按钮，点击后重新发送该消息
- [ ] **加载超时**：请求超过 30 秒未收到第一个 SSE chunk，自动显示超时提示

**改动位置**：`src/components/AgentChat.tsx`、`api/chat.ts`

---

### 3.3 GitHub 项目白名单

**问题**：`fetch-github.js` 抓取全部仓库，可能包含 fork 的、私人的、不想展示的项目。

**验收标准**：
- [ ] `scripts/fetch-github.js` 加 `PROJECT_WHITELIST` 数组，只抓取名单内的仓库
- [ ] 如果白名单为空，回退到抓取全部（向后兼容）
- [ ] 加 `PROJECT_BLACKLIST` 数组，排除特定仓库（如 `TieXe.github.io`、`test-repo` 等）
- [ ] 过滤条件：排除 fork 的仓库（`repo.fork === false`）
- [ ] 过滤条件：排除 archived 的仓库（`repo.archived === false`）
- [ ] 按 `stargazers_count` 降序排列，最多展示 12 个项目

**改动位置**：`scripts/fetch-github.js` 第 4-5 行加配置，第 22-25 行加过滤

```javascript
// 白名单：只抓取这些项目，空数组 = 全部
const PROJECT_WHITELIST = [];
// 黑名单：永远排除这些项目
const PROJECT_BLACKLIST = ['TieXe.github.io', 'test-repo'];
```

---

### 3.4 移动端基础适配

**问题**：目前只在桌面端测试，移动端大概率崩。

**验收标准**：
- [ ] 视频背景在移动端正常铺满（`object-fit: cover` + 确认无 overflow）
- [ ] Hero 标题在移动端缩小到 `text-3xl` 级别，不换行溢出
- [ ] 音乐播放器在移动端隐藏或改为底部浮动（`hidden md:block` 或 `bottom: 0` 重新定位）
- [ ] Agent 聊天窗口在移动端全屏（`w-full h-full`，取消 `max-w-2xl`）
- [ ] 项目卡片在移动端单列（`grid-cols-1`），已有，确认无水平滚动
- [ ] 测试：Chrome DevTools 切 iPhone 12 Pro 和 Pixel 5，确认无布局崩坏

**改动位置**：`src/components/Hero3D.tsx`、`MusicPlayer.tsx`、`AgentChat.tsx`

---

### 3.5 Vercel 部署验证

**问题**：代码在本地，没上过 Vercel。

**验收标准**：
- [ ] 在 Vercel Dashboard 创建项目，连接 GitHub 仓库
- [ ] 配置环境变量：
  - `OPENAI_API_KEY` = 你的真实 API Key
  - `OPENAI_BASE_URL` = `https://api.openai.com/v1`（或 Kimi/DeepSeek 等）
  - `OPENAI_MODEL` = `gpt-4o-mini`（或 `kimi-latest`、`deepseek-chat`）
- [ ] 确认 `api/chat.ts` 在 Vercel 上能被访问（`POST /api/chat` 返回 200）
- [ ] 确认 `public/projects.json` 和 `public/projects-context.md` 能被访问（GET 返回 200）
- [ ] 确认视频和音频文件在构建后被包含在 `dist/` 中（Vite 自动复制 `public/`）
- [ ] 端到端测试：打开部署后的 URL → 点击 Agent 对话 → 发送"介绍一下你的项目" → 收到正常回复

**部署后验证**：`curl -X POST https://your-domain.vercel.app/api/chat -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"hi"}]}'`

---

## 4. P1 体验优化（上线后做）

### 4.1 博客文章系统
- 从 markdown 文件生成文章列表
- 路由 `/blog/:slug`
- 文章用 `gray-matter` 解析 frontmatter

### 4.2 项目详情页
- 每个项目点击后展开详情页
- 展示 README 全文、技术栈、 star/fork 趋势
- 路由 `/project/:name`

### 4.3 SEO / Open Graph
- `index.html` 加 `<meta name="description">`、`<meta property="og:*">`
- 生成 `og:image`（项目截图或 Teto poster）
- 加 `robots.txt` 和 `sitemap.xml`

### 4.4 音乐播放器 localStorage
- 记住当前主题、音量、播放进度
- 页面刷新后恢复状态
- 实现：`localStorage.setItem('player-state', JSON.stringify(state))`

### 4.5 Agent 上下文优化
- 当前 `projects-context.md` 截断到 3000 字符，可能不够
- 按项目重要性排序，优先放高 star 项目
- 考虑把长 README 分段，只放技术栈和关键段落

---

## 5. P2 后续增强（有空再做）

| 功能 | 说明 | 复杂度 |
|------|------|--------|
| **Tool Calling Agent** | Agent 能调用工具：查 GitHub API、搜索文档、运行代码 | 高 |
| **RAG 项目文档** | 如果项目多到 50+，需要向量检索 | 中 |
| **GitHub 实时查询** | Agent 直接调用 GitHub API，不依赖每日抓取 | 中 |
| **后台管理** | 简单的 admin 页面，手动编辑项目信息、上传文章 | 中 |
| **访问统计** | 接入 Vercel Analytics 或 Plausible | 低 |

---

## 6. 组件任务

### 6.1 TetoSurround

**当前代码**：`src/components/TetoSurround.tsx`（72 行）

**核心逻辑**：
- 加载视频，GPU 加速渲染
- 三层叠加：视频层 + 暗角遮罩 + 呼吸光晕
- 首次点击页面触发 `play()`（绕过浏览器自动播放限制）

**验收清单**：
- [ ] 视频铺满全屏，无黑边（`object-fit: cover`）
- [ ] GPU 加速生效（`translateZ(0)` + `willChange: transform` + `contain`）
- [ ] 暗角遮罩边缘自然过渡（`radial-gradient`）
- [ ] 呼吸光晕跟随主题色变化（`currentTheme.glowColor`）
- [ ] 首次点击页面后视频自动播放（`window.addEventListener('click', ...)`）
- [ ] **P0**：加 `poster` 属性 + `public/video/poster.jpg`
- [ ] **P0**：确认中文文件名 `encodeURIComponent` 处理正确

**已知限制**：
- 视频 60fps 是原生帧率，有重复帧（需物理补帧工具处理，不在代码层面解决）
- 移动端可能加载慢，poster 是必要兜底

---

### 6.2 Hero3D

**当前代码**：`src/components/Hero3D.tsx`（186 行）

**核心逻辑**：
- 组合 TetoSurround + 标题 + 按钮 + 导航
- 底部 40px 羽化过渡（`linear-gradient`）
- 右侧挂载 MusicPlayer
- 顶部导航栏 + 主题切换圆点

**验收清单**：
- [ ] 标题文字在视频上清晰可读（黑色描边 + text-shadow）
- [ ] "TIE'S BLOG" 标签样式正确（黑色背景 + 主题色边框）
- [ ] "CREATE YOUR VISION" 发光效果正确（主题色 glow）
- [ ] Agent 按钮 hover 有发光动画
- [ ] 点击 Agent 按钮弹出 `AgentChat` 模态框
- [ ] 点击"查看项目"平滑滚动到 `#projects`
- [ ] 5 个主题切换按钮正常切换主题
- [ ] **P0**：移动端标题不溢出（`text-3xl` 级别）
- [ ] **P0**：音乐播放器在移动端正确处理（隐藏或重新定位）

---

### 6.3 MusicPlayer

**当前代码**：`src/components/MusicPlayer.tsx`（397 行）

**核心逻辑**：
- 右侧固定，48px 触发条 hover 展开到 320px 面板
- 播放/暂停、上一首/下一首、进度条、音量
- 播放列表展开/收起
- 频谱可视化（CSS 动画，随机高度，非真实音频分析）

**验收清单**：
- [ ] 鼠标移入 48px 触发条，面板展开（500ms ease-out）
- [ ] 鼠标移出面板，面板收缩（同动画）
- [ ] 播放/暂停按钮切换图标（Play ↔ Pause）
- [ ] 进度条可点击跳转（`onClick` 计算百分比）
- [ ] 当前时间 / 总时长显示正确（`MM:SS` 格式）
- [ ] 音量按钮点击静音/恢复（0 ↔ 0.8）
- [ ] 音量滑块 hover 显示，绝对定位不挤压布局
- [ ] 播放列表点击切歌
- [ ] 切歌时自动播放（`setTimeout(..., 100)`）
- [ ] 播放结束自动下一首（`onEnded`）
- [ ] **P0**：音频文件存在且能播放（`public/audio/` 目录）
- [ ] **P1**：加 `localStorage` 记住音量和播放状态
- [ ] **P1**：播放列表支持多首歌（目前只有 1 首）

**已知问题**：
- 切歌延迟 100ms 是 hack，需要确认 `audio.src` 切换后 `play()` 是否可靠
- 频谱可视化是 CSS 随机动画，不是真实音频分析（后续可接 Web Audio API AnalyserNode）

---

### 6.4 AgentChat

**当前代码**：`src/components/AgentChat.tsx`（325 行）

**核心逻辑**：
- 全屏模态框，消息气泡列表
- 加载 `projects-context.md` 注入系统提示
- 流式 SSE 解析，逐字追加到 assistant 消息
- 使用 `useRef` 同步最新状态，避免 `useCallback` 依赖问题

**验收清单**：
- [ ] 打开模态框显示欢迎消息
- [ ] 输入框能输入文字，回车发送
- [ ] 用户消息显示在右侧，Agent 消息显示在左侧
- [ ] 发送后显示"思考中..."加载状态
- [ ] 收到流式响应，逐字追加显示
- [ ] 关闭模态框后重新打开，历史记录保留（当前已保留在 state 中）
- [ ] 系统提示包含 `SYSTEM_PROMPT` + `projects-context.md`
- [ ] **P0**：输入框限制最大 500 字符
- [ ] **P0**：消息历史超过 10 轮时截断，保留系统提示 + 最近 10 轮
- [ ] **P0**：API 错误时显示具体错误提示（非通用"未知错误"）
- [ ] **P0**：请求超时 30 秒自动提示
- [ ] **P0**：移动端全屏（`w-full h-full`）

**API 调用链路**：
```
AgentChat → fetch('/api/chat') → Vercel Edge Function → OpenAI API → SSE 流式返回
```

---

### 6.5 Projects

**当前代码**：`src/components/Projects.tsx`（169 行）

**核心逻辑**：
- 硬编码 6 个 mock 项目，卡片式布局
- 响应式网格：`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- 每个卡片：图标 + 标题 + 描述 + 标签 + 链接

**验收清单**：
- [ ] 项目卡片正常渲染（6 个 mock 项目）
- [ ] 卡片 hover 有上移 + 光晕效果
- [ ] 标签显示正确（主题色边框 + 背景）
- [ ] 链接可点击（GitHub 源码、在线访问）
- [ ] **P0**：接入 `public/projects.json` 真实数据（替换硬编码）
- [ ] **P0**：数据加载失败时显示友好提示（"暂无项目数据"）
- [ ] **P0**：按 star 数排序，最多 12 个
- [ ] **P1**：点击卡片展开项目详情（或跳转 GitHub）

**数据切换方案**：
```typescript
// 当前：硬编码
const projects = [...]; // 6 个 mock

// 目标：fetch 真实数据
useEffect(() => {
  fetch('/projects.json')
    .then(r => r.json())
    .then(data => setProjects(data))
    .catch(() => setProjects([]));
}, []);
```

---

### 6.6 ThemeProvider

**当前代码**：`src/components/ThemeProvider.tsx`（84 行）

**核心逻辑**：
- React Context 管理当前主题
- 5 个预设主题，每个主题包含 `id/name/bgColor/glowColor/textColor/accentColor/description`
- 默认主题：`matrix`（Midnight Matrix，绿色）

**验收清单**：
- [ ] 切换主题时所有组件颜色联动（Hero 文字、播放器、卡片标签）
- [ ] 默认主题加载正确（matrix 绿色）
- [ ] 主题切换按钮当前主题高亮（`scale(1.3)` + 发光）
- [ ] 主题切换过渡平滑（CSS transition）
- [ ] **P1**：`localStorage` 记住用户上次选择的主题

---

## 7. API 与安全

### 7.1 当前安全状态

| 项 | 状态 | 说明 |
|----|------|------|
| API Key 放后端 | ✅ 已做 | `process.env.OPENAI_API_KEY`，前端看不到 |
| API Key 不在 GitHub | ✅ 已做 | 代码里没有 |
| 输入长度限制 | ❌ 未做 | `AgentChat.tsx` 没有 `maxLength` |
| 消息历史截断 | ❌ 未做 | 可能发送超长消息给 API |
| `max_tokens` 限制 | ✅ 已做 | Edge Function 里设了 1500 |
| Rate limit | ❌ 未做 | 需要 Vercel 层面或自己实现 |

### 7.2 需要加的安全限制（P0）

#### 1. 输入长度限制（前端）

**位置**：`src/components/AgentChat.tsx` 输入框

```tsx
<input
  maxLength={500}
  onChange={(e) => setInput(e.target.value.slice(0, 500))}
/>
<span>{input.length}/500</span>
```

#### 2. 消息历史截断（后端）

**位置**：`api/chat.ts`

```typescript
// 截断逻辑：保留 system + 最近 10 轮
const MAX_HISTORY = 10;
const systemMessages = messages.filter(m => m.role === 'system');
const userMessages = messages.filter(m => m.role !== 'system').slice(-MAX_HISTORY);
const truncatedMessages = [...systemMessages, ...userMessages];
```

#### 3. 单次请求 token 估算（后端）

```typescript
// 粗略估算：1 中文字 ≈ 1.5 token，1 英文字母 ≈ 0.3 token
function estimateTokens(messages) {
  return messages.reduce((acc, m) => acc + m.content.length * 0.8, 0);
}
// 如果超过 3500，继续截断
```

#### 4. Rate limit（Vercel 层面）

方案 A：Vercel 自带（Pro 计划）
方案 B：自己实现（简单计数器）

```typescript
// api/chat.ts 简单 rate limit（内存级，重启清空）
const requestCounts = new Map(); // IP -> { count, resetTime }

function checkRateLimit(ip: string) {
  const now = Date.now();
  const window = 60 * 1000; // 1 分钟
  const max = 10; // 每 IP 每分钟 10 次
  // ... 实现略
}
```

---

## 8. 静态资源规范

### 8.1 视频

| 文件 | 当前状态 | 规范 |
|------|----------|------|
| `6月15日.mp4` | 1920x1080, 60fps | 保留主文件，加 `poster.jpg` |
| `Teto摇（作者：Atena）.mp4` | 720x1280 | 用作竖屏版本或备选 |
| poster | ❌ 无 | 生成 `poster.jpg`（1920x1080，< 200KB） |

**命名规范**：
- 主视频：`teto-main.mp4`（建议重命名，避免中文）
- 备选视频：`teto-alt-{描述}.mp4`
- Poster：`teto-poster.jpg`

### 8.2 音频

| 文件 | 当前状态 | 规范 |
|------|----------|------|
| `Rezcaze,Hwungii,DJ VGK1 - FUNK NA MIRA.mp3` | 单文件 | 保留，但重命名为 `track-01-funk.mp3` |

**命名规范**：
- `track-01-{风格}.mp3`
- `track-02-{风格}.mp3`
- 避免空格和特殊字符，用 `-` 分隔

### 8.3 移动端低码率资源

**P1 考虑**：
- 视频：`teto-main-mobile.mp4`（720p，码率 1Mbps）
- 音频：`track-01-mobile.mp3`（128kbps）
- 通过 `navigator.connection.effectiveType` 判断网络质量，自动切换

---

## 9. 部署检查清单

### 9.1 代码层面

- [ ] `npm run build` 本地通过（0 错误，0 警告）
- [ ] `tsc -b` 通过（TypeScript 无类型错误）
- [ ] `public/projects.json` 存在（mock 或真实数据）
- [ ] `public/projects-context.md` 存在（mock 或真实数据）
- [ ] `public/video/` 目录存在，有视频文件 + poster.jpg
- [ ] `public/audio/` 目录存在，有音频文件

### 9.2 GitHub 仓库

- [ ] 代码已 push 到 GitHub
- [ ] `scripts/fetch-github.js` 中的 `GITHUB_USERNAME` 已替换为真实用户名
- [ ] `.github/workflows/update-projects.yml` 在工作流列表中可见
- [ ] GitHub Actions 手动触发一次，确认能生成 `projects.json` 和 `projects-context.md`

### 9.3 Vercel 配置

- [ ] 项目已创建，连接 GitHub 仓库
- [ ] 环境变量已配置：
  - `OPENAI_API_KEY` = sk-...
  - `OPENAI_BASE_URL` = https://api.openai.com/v1
  - `OPENAI_MODEL` = gpt-4o-mini
- [ ] 构建命令：`npm run build`
- [ ] 输出目录：`dist`
- [ ] 首次部署成功，无构建错误

### 9.4 端到端验证

- [ ] 打开部署 URL，页面加载正常，视频播放
- [ ] 点击"与 Agent 对话"，模态框弹出
- [ ] 发送"你好"，收到正常回复（流式显示）
- [ ] 发送"介绍一下你的项目"，回复包含项目信息
- [ ] 向下滚动到项目区，项目卡片正常显示
- [ ] 点击音乐播放器播放按钮，音频播放正常
- [ ] 切换主题，颜色变化正常
- [ ] 刷新页面，状态恢复（P1 阶段加 localStorage 后验证）

### 9.5 安全验证

- [ ] 浏览器 DevTools Network 面板，没有 `OPENAI_API_KEY` 出现在任何请求中
- [ ] 查看 `api/chat.ts` 源码，没有硬编码 API Key
- [ ] 查看 `.env.example`，没有真实 API Key

---

## 10. AI 编程工具开发约束

> 这部分是约束 Kimi（或任何 AI 编程工具）的行为准则，确保代码质量。

### 10.1 代码生成约束

1. **不要生成注释过度的代码** — 关键逻辑一行注释，不要每行都注释
2. **TypeScript 类型必须完整** — 不要写 `any`，接口必须定义清楚
3. **CSS 用 Tailwind 类优先** — 只有在动态主题色时才用 `style` 内联
4. **不要修改已验收的代码** — 除非明确说"修复 XX 问题"
5. **新增功能必须写验收标准** — 先写"怎么算完成"，再写代码

### 10.2 安全约束

1. **API Key 绝不进入前端** — 任何代码都不能把 Key 暴露给浏览器
2. **环境变量用 `process.env`** — 不要用 `import.meta.env` 给后端代码
3. **用户输入必须校验** — 长度、类型、内容，三层校验
4. **不要信任 AI 生成的正则** — 敏感操作（URL、HTML 过滤）用库而不是手写正则

### 10.3 性能约束

1. **视频用 `preload="auto"`** — 但确认体积 < 20MB，否则改 `preload="metadata"`
2. **音频文件 < 5MB** — 太大用压缩工具处理
3. **不要阻塞主线程** — 大数据处理用 `setTimeout` 分片或 Web Worker
4. **图片用 WebP** — 如果有图片资源，优先 WebP，fallback JPG

### 10.4 你现在最应该先做的 5 件事

按顺序，做完一条才能做下一条：

1. **改 `fetch-github.js` 的 `GITHUB_USERNAME`** — 替换为你的真实用户名，测试脚本能跑通
2. **给 AgentChat 加输入限制** — `maxLength={500}` + 错误分类提示
3. **生成 `public/video/poster.jpg`** — 从视频截一帧，保存，测试视频加载失败时显示 poster
4. **测试移动端** — Chrome DevTools 切 iPhone 12 Pro，记录所有布局问题，修完
5. **部署到 Vercel** — 配置环境变量，端到端测试 Agent 对话，确认项目列表正常显示

---

*文档版本：开发任务 v1.0*  
*状态：可执行*  
*更新规则：做完一条 P0 任务就更新当前状态表，不要等全部做完*
