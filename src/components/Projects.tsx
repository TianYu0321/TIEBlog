import { useTheme } from './ThemeProvider';
import { ExternalLink, Code2, Globe, Terminal, Database, Palette, Cpu } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  icon: React.ReactNode;
  link?: string;
  github?: string;
}

const projects: Project[] = [
  {
    id: '1',
    title: 'TieBlog',
    description: '炫技个人博客 — 裸眼3D Teto环绕 + 环境光系统 + Agent集成',
    tags: ['React', 'Tailwind', 'CSS 3D'],
    icon: <Palette size={24} />,
    github: '#',
    link: '#',
  },
  {
    id: '2',
    title: 'AI Chat Platform',
    description: '基于大语言模型的智能对话平台，支持多轮上下文理解',
    tags: ['TypeScript', 'OpenAI', 'Next.js'],
    icon: <Cpu size={24} />,
    github: '#',
    link: '#',
  },
  {
    id: '3',
    title: 'Data Visualization Engine',
    description: '高性能数据可视化引擎，支持实时流数据渲染',
    tags: ['D3.js', 'WebGL', 'React'],
    icon: <Database size={24} />,
    github: '#',
  },
  {
    id: '4',
    title: 'DevTools Suite',
    description: '开发者工具套件，包含代码生成、调试、部署一站式工具',
    tags: ['Electron', 'Node.js', 'CLI'],
    icon: <Terminal size={24} />,
    github: '#',
  },
  {
    id: '5',
    title: 'Web3 Dashboard',
    description: '去中心化应用仪表盘，支持多链资产管理和交易分析',
    tags: ['Solidity', 'Ethers.js', 'Vue'],
    icon: <Globe size={24} />,
    github: '#',
    link: '#',
  },
  {
    id: '6',
    title: 'Code Playground',
    description: '在线代码编辑运行环境，支持多种语言和实时协作',
    tags: ['WebAssembly', 'Monaco', 'Socket.io'],
    icon: <Code2 size={24} />,
    github: '#',
  },
];

export default function Projects() {
  const { currentTheme } = useTheme();

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
                {/* 图标 */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: `${currentTheme.glowColor}15`,
                    color: currentTheme.glowColor,
                  }}
                >
                  {project.icon}
                </div>

                {/* 标题 */}
                <h3 className="text-lg font-bold mb-2" style={{ color: currentTheme.textColor }}>
                  {project.title}
                </h3>

                {/* 描述 */}
                <p className="text-sm leading-relaxed mb-4" style={{ color: `${currentTheme.textColor}80` }}>
                  {project.description}
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

                {/* 链接 */}
                <div className="flex gap-3">
                  {project.github && (
                    <a
                      href={project.github}
                      className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
                      style={{ color: `${currentTheme.textColor}60` }}
                    >
                      <Code2 size={14} />
                      <span>源码</span>
                    </a>
                  )}
                  {project.link && (
                    <a
                      href={project.link}
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
          ))}
        </div>
      </div>
    </section>
  );
}
