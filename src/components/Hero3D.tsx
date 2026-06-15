import { useState } from 'react';
import { useTheme, themes } from './ThemeProvider';
import TetoSurround from './TetoSurround';
import AgentChat from './AgentChat';
import MusicPlayer from './MusicPlayer';
import { ChevronDown, Sparkles, ArrowRight, MessageSquare } from 'lucide-react';

export default function Hero3D() {
  const { currentTheme, setTheme } = useTheme();
  const [showAgent, setShowAgent] = useState(false);

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* 3D 视频背景层 */}
      <div className="absolute inset-0 z-0">
        <TetoSurround />
      </div>

      {/* 底部羽化过渡：视频 → 项目区 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-10"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.85) 70%, #000 100%)`,
        }}
      />

      {/* ====== 右侧 Glassmorphism 音乐播放器（桌面端显示） ====== */}
      <div className="hidden md:block">
        <MusicPlayer />
      </div>

      {/* ====== 文字叠加层（偏下，vidraai 风格） ====== */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-24 pointer-events-none">
        
        {/* 标签：Personal Tech Blog — 书法/艺术字体风格 */}
        <div className="flex items-center gap-3 mb-5">
          <span 
            className="w-10 h-px" 
            style={{ 
              background: `linear-gradient(90deg, transparent, ${currentTheme.glowColor})`,
            }} 
          />
          <span 
            className="text-xs font-black tracking-[0.25em] uppercase px-4 py-1.5 rounded-full border"
            style={{ 
              color: currentTheme.glowColor,
              borderColor: `${currentTheme.glowColor}40`,
              background: `${currentTheme.glowColor}08`,
              fontFamily: "'Inter', 'Arial Black', sans-serif",
              letterSpacing: '0.25em',
              fontWeight: 900,
              fontSize: '11px',
            }}
          >
            TIE'S BLOG
          </span>
          <span 
            className="w-10 h-px" 
            style={{ 
              background: `linear-gradient(90deg, ${currentTheme.glowColor}, transparent)`,
            }} 
          />
        </div>

        {/* 大标题：CREATE YOUR VISION — 带描边确保可见 */}
        {/* 大标题：移动端缩小 */}
        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-center tracking-tight leading-none mb-4">
          <span 
            className="block"
            style={{
              color: '#fff',
              textShadow: `
                0 0 40px rgba(0,0,0,0.8),
                0 2px 10px rgba(0,0,0,0.5),
                0 4px 20px rgba(0,0,0,0.3)
              `,
            }}
          >
            CREATE
          </span>
          <span
            className="block"
            style={{
              color: currentTheme.glowColor,
              textShadow: `
                0 0 60px ${currentTheme.glowColor}50,
                0 0 120px ${currentTheme.glowColor}30,
                0 2px 10px rgba(0,0,0,0.5)
              `,
            }}
          >
            YOUR VISION
          </span>
        </h1>

        {/* 副标题：带模糊背景卡片 */}
        <div 
          className="px-6 py-2 rounded-full mb-6 backdrop-blur-md border"
          style={{
            background: 'rgba(0,0,0,0.3)',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <p className="text-center text-white/60 text-sm md:text-base leading-relaxed">
            全栈开发者 / 独立创作者 / 技术实验家
          </p>
        </div>

        {/* Agent 入口按钮：高端边框 + 发光 */}
        <button
          onClick={() => setShowAgent(true)}
          className="group relative flex items-center gap-3 px-8 py-4 rounded-full border transition-all hover:scale-105 pointer-events-auto"
          style={{
            borderColor: `${currentTheme.glowColor}40`,
            background: `${currentTheme.glowColor}06`,
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* 内部发光边框 */}
          <div 
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              boxShadow: `
                inset 0 0 20px ${currentTheme.glowColor}15,
                0 0 30px ${currentTheme.glowColor}20,
                0 0 60px ${currentTheme.glowColor}10
              `,
            }}
          />
          {/* 边框光 */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              border: `1px solid ${currentTheme.glowColor}30`,
              background: `linear-gradient(135deg, ${currentTheme.glowColor}08 0%, transparent 50%, ${currentTheme.glowColor}08 100%)`,
            }}
          />
          
          <MessageSquare size={18} style={{ color: currentTheme.glowColor }} />
          <span className="relative text-sm font-semibold tracking-wide" style={{ color: currentTheme.textColor }}>
            与 Agent 对话
          </span>
          <ArrowRight size={16} className="relative transition-transform group-hover:translate-x-1" style={{ color: currentTheme.glowColor }} />
        </button>

        {/* 向下滚动提示 */}
        <button
          onClick={scrollToProjects}
          className="flex flex-col items-center gap-1 mt-10 pointer-events-auto"
        >
          <span className="text-xs text-white/30">查看项目</span>
          <ChevronDown size={20} className="text-white/30 animate-bounce" />
        </button>
      </div>

      {/* ====== 顶部导航 ====== */}
      <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Sparkles size={20} style={{ color: currentTheme.glowColor }} />
          <span className="text-lg font-bold tracking-wider" style={{ color: currentTheme.textColor }}>
            TieBlog
          </span>
        </div>
        <div className="flex items-center gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t)}
              className="w-3 h-3 rounded-full transition-all hover:scale-125"
              style={{
                backgroundColor: t.glowColor,
                boxShadow: currentTheme.id === t.id ? `0 0 10px ${t.glowColor}` : 'none',
                transform: currentTheme.id === t.id ? 'scale(1.3)' : 'scale(1)',
              }}
              title={t.name}
            />
          ))}
        </div>
      </nav>

      {/* ====== Agent 聊天弹窗 ====== */}
      {showAgent && <AgentChat onClose={() => setShowAgent(false)} />}
    </section>
  );
}
