import { ThemeProvider } from './components/ThemeProvider';
import Hero3D from './components/Hero3D';
import Projects from './components/Projects';
import { useTheme } from './components/ThemeProvider';
import { Code2, MessageCircle, AtSign, Heart } from 'lucide-react';

function Footer() {
  const { currentTheme } = useTheme();
  return (
    <footer className="relative w-full py-12 px-4 border-t" style={{ borderColor: `${currentTheme.glowColor}15` }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="text-lg font-bold" style={{ color: currentTheme.textColor }}>TieBlog</span>
          <p className="text-xs" style={{ color: `${currentTheme.textColor}50` }}>
            用代码构建想象中的世界
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="p-2 rounded-lg transition-all hover:bg-white/10" style={{ color: currentTheme.textColor }}>
            <Code2 size={20} />
          </a>
          <a href="#" className="p-2 rounded-lg transition-all hover:bg-white/10" style={{ color: currentTheme.textColor }}>
            <MessageCircle size={20} />
          </a>
          <a href="#" className="p-2 rounded-lg transition-all hover:bg-white/10" style={{ color: currentTheme.textColor }}>
            <AtSign size={20} />
          </a>
        </div>
        <div className="flex items-center gap-1 text-xs" style={{ color: `${currentTheme.textColor}40` }}>
          <span>Made with</span>
          <Heart size={12} style={{ color: currentTheme.glowColor }} />
          <span>by Tie</span>
        </div>
      </div>
    </footer>
  );
}

function App() {
  return (
    <ThemeProvider>
      <div className="relative min-h-screen">
        <Hero3D />
        <Projects />
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
