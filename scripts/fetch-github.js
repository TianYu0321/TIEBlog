import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'TianYu0321';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const LLM_API_KEY = process.env.OPENAI_API_KEY;
const LLM_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const LLM_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// 调用 LLM 生成一句话总结
async function generateSummary(project) {
  if (!LLM_API_KEY) {
    console.warn(`⚠️ 未配置 OPENAI_API_KEY，跳过 ${project.name} 的 summary 生成`);
    return project.description || '暂无描述';
  }

  const prompt = `请用一句话总结这个 GitHub 项目。格式："这是一个基于 [主要技术栈] 的 [项目功能] 项目。" 只返回一句话，不要多余内容。

项目名：${project.name}
语言：${project.language || '未知'}
简介：${project.description || '无'}
README 开头：${project.readme.slice(0, 500)}`;

  try {
    const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: '你是一个技术文档总结助手。只返回一句话总结，不要任何解释。' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 100,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim();
    if (summary) {
      // 清理多余标点
      return summary.replace(/^["'`]+|["'`]+$/g, '').trim();
    }
  } catch (e) {
    console.error(`❌ ${project.name} summary 生成失败:`, e.message);
  }

  return project.description || '暂无描述';
}

async function fetchGitHub() {
  try {
    console.log(`🔍 Fetching repos for ${GITHUB_USERNAME}...`);

    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'TieBlog-Updater',
    };
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    // 1. 获取用户仓库列表
    const reposRes = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`,
      { headers }
    );

    if (!reposRes.ok) {
      throw new Error(`GitHub API error: ${reposRes.status}`);
    }

    const repos = await reposRes.json();

    // 2. 获取每个仓库的详细信息
    const projects = await Promise.all(
      repos.map(async (repo) => {
        let readme = '';
        try {
          const readmeRes = await fetch(
            `https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/readme`,
            { headers }
          );
          if (readmeRes.ok) {
            const readmeData = await readmeRes.json();
            readme = Buffer.from(readmeData.content, 'base64').toString('utf-8').slice(0, 2000);
          }
        } catch (e) {
          // 无 README 不报错
        }

        return {
          id: repo.id,
          name: repo.name,
          description: repo.description || '',
          url: repo.html_url,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          topics: repo.topics || [],
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          homepage: repo.homepage,
          readme: readme,
        };
      })
    );

    // 3. 用 LLM 生成每个项目的一句话总结
    console.log(`🤖 Generating summaries for ${projects.length} projects...`);
    const summaries = await Promise.all(
      projects.map(p => generateSummary(p))
    );

    // 4. 写入 projects.json（前端展示用）
    const projectsData = projects.map((p, i) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      summary: summaries[i],
      url: p.url,
      stars: p.stars,
      forks: p.forks,
      language: p.language,
      topics: p.topics,
      updated_at: p.updated_at,
      homepage: p.homepage,
    }));

    fs.writeFileSync(
      path.join(PUBLIC_DIR, 'projects.json'),
      JSON.stringify(projectsData, null, 2)
    );
    console.log(`✅ projects.json updated (${projectsData.length} projects)`);

    // 5. 生成 LLM 上下文（用于 Agent 系统提示）
    const context = projects.map((p, i) => {
      return `
## ${p.name}
- 总结: ${summaries[i]}
- 描述: ${p.description || '暂无描述'}
- 语言: ${p.language || 'N/A'}
- 标签: ${p.topics.join(', ') || '无'}
- 星标: ${p.stars} ⭐
- 链接: ${p.url}
- 更新: ${p.updated_at}
- README摘要: ${p.readme.slice(0, 500).replace(/\n/g, ' ')}
`;
    }).join('\n---\n');

    const systemContext = `# TieBlog 项目知识库

这是 TieBlog 所有者的 GitHub 项目列表，由 GitHub Actions 每天自动更新。

${context}

---
TieBlog 技术栈信息：
- 前端: React 19 + Vite + TypeScript + Tailwind CSS
- 部署: Vercel
- 特色: 裸眼3D Teto视频环绕 + 环境光系统 + 集成AI Agent
- 音乐: 自定义播放器（Web Audio API）

注意：以上信息由系统自动抓取，用户可以直接询问任何项目的技术细节。
`;

    fs.writeFileSync(
      path.join(PUBLIC_DIR, 'projects-context.md'),
      systemContext
    );
    console.log('✅ projects-context.md updated');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fetchGitHub();
