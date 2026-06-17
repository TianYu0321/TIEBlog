import { useTheme } from './ThemeProvider';
import { ExternalLink, Code2, Terminal, Database, Globe, Cpu, Palette, Layers } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GitHubProject {
  id: number;
  name: string;
  description: string | null;
  summary: string;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  updated_at: string;
  homepage: string | null;
}

interface Project {
  id: string;
  title: string;
  description: string;
  summary: string;
  tags: string[];
  icon: React.ReactNode;
  link?: string;
  github: string;
  stars: number;
  forks: number;
  language: string;
  updated_at: string;
}

// 语言到图标的映射
const languageIcons: Record<string, React.ReactNode> = {
  TypeScript: <Code2 size={24} />,
  JavaScript: <Code2 size={24} />,
  Python: <Terminal size={24} />,
  Go: <Database size={24} />,
  Rust: <Globe size={24} />,
  GLSL: <Palette size={24} />,
  HTML: <Layers size={24} />,
  CSS: <Layers size={24} />,
  Vue: <Layers size={24} />,
  React: <Cpu size={24} />,
};

function getIcon(language: string | null): React.ReactNode {
  if (!language) return <Code2 size={24} />;
  return languageIcons[language] || <Code2 size={24} />;
}

// 辅助函数：格式化更新时间
// 7 天内显示相对时间，7 天外显示绝对日期
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDay <= 0) return '刚刚更新';
  if (diffDay === 1) return '昨天';
  if (diffDay < 7) return `${diffDay} 天前`;
  // 7 天外显示绝对日期
  return isoDate.split('T')[0];
}

export default function Projects() {
  const { currentTheme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/projects.json')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load');
        return r.json();
      })
      .then((data: GitHubProject[]) => {
        const sorted = data
          .sort((a, b) => b.stars - a.stars)
          .slice(0, 12);

        const mapped: Project[] = sorted.map((p) => ({
          id: p.id.toString(),
          title: p.name,
          description: p.description || '暂无描述',
          summary: p.summary || p.description || '暂无描述',
          tags: [p.language || 'Unknown', ...p.topics.slice(0, 3)],
          icon: getIcon(p.language),
          link: p.homepage || undefined,
          github: p.url,
          stars: p.stars,
          forks: p.forks,
          language: p.language || 'Unknown',
          updated_at: p.updated_at,
        }));

        setProjects(mapped);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section id="projects" className="relative w-full py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-px" style={{ background: currentTheme.glowColor }} />
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: currentTheme.textColor }}>
              项目展示
            </h2>
          </div>
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: currentTheme.glowColor }} />
            <p className="mt-4 text-sm" style={{ color: `${currentTheme.textColor}60` }}>加载项目中...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || projects.length === 0) {
    return (
      <section id="projects" className="relative w-full py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-px" style={{ background: currentTheme.glowColor }} />
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: currentTheme.textColor }}>
              项目展示
            </h2>
          </div>
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: `${currentTheme.textColor}60` }}>
              暂无项目数据。请检查 GitHub Actions 是否已运行，或项目配置是否正确。
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="relative w-full py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-px" style={{ background: currentTheme.glowColor }} />
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: currentTheme.textColor }}>
            项目展示
          </h2>
          <div className="flex-1 h-px" style={{ background: `${currentTheme.glowColor}30` }} />
        </div>

        {/* 项目网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-2"
              style={{
                borderColor: `${currentTheme.glowColor}20`,
                background: `${currentTheme.bgColor}80`,
              }}
            >
              {/* hover光晕 */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `0 0 40px ${currentTheme.glowColor}15, inset 0 0 40px ${currentTheme.glowColor}05` }}
              />

              <div className="relative z-10">
                {/* 图标 + 语言 */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${currentTheme.glowColor}15`,
                      color: currentTheme.glowColor,
                    }}
                  >
                    {project.icon}
                  </div>
                  <span className="text-xs font-mono" style={{ color: `${currentTheme.textColor}40` }}>
                    {project.language}
                  </span>
                </div>

                {/* 标题 */}
                <h3 className="text-lg font-bold mb-2" style={{ color: currentTheme.textColor }}>
                  {project.title}
                </h3>

                {/* 描述：一句话总结，不截断 */}
                <p className="text-sm leading-relaxed mb-4" style={{ color: `${currentTheme.textColor}80` }}>
                  {project.summary}
                </p>

                {/* 更新时间：7天内相对，7天外绝对 */}
                <p className="text-[10px] font-mono mb-3" style={{ color: `${currentTheme.textColor}30` }}>
                  {formatDate(project.updated_at)}
                </p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-md text-xs font-mono"
                      style={{
                        background: `${currentTheme.glowColor}10`,
                        color: currentTheme.glowColor,
                        border: `1px solid ${currentTheme.glowColor}30`,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 统计 + 链接 */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-xs" style={{ color: `${currentTheme.textColor}40` }}>
                    <span>★ {project.stars}</span>
                    <span>⑂ {project.forks}</span>
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
                      style={{ color: `${currentTheme.textColor}60` }}
                    >
                      <Code2 size={14} />
                      <span>源码</span>
                    </a>
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
                        style={{ color: currentTheme.glowColor }}
                      >
                        <ExternalLink size={14} />
                        <span>访问</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
