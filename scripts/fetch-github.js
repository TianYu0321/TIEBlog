const fs = require('fs');
const path = require('path');

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'TianYu0321';  // 替换为你的 GitHub 用户名
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;  // GitHub Actions 自动提供

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

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

    // 2. 获取每个仓库的详细信息（语言、topics等）
    const projects = await Promise.all(
      repos.map(async (repo) => {
        // 获取 README 内容（用于 LLM 上下文）
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

    // 3. 写入 projects.json（前端展示用）
    const projectsData = projects.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
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

    // 4. 生成 LLM 上下文（用于 Agent 系统提示）
    const context = projects.map(p => {
      return `
## ${p.name}
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
