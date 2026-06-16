import { useState } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import Hero3D from './components/Hero3D';
import Projects from './components/Projects';
import { useTheme } from './components/ThemeProvider';
import { MessageCircle, Mail, Heart, X } from 'lucide-react';

function Footer() {
  const { currentTheme } = useTheme();
  const [qrModal, setQrModal] = useState<{ src: string; label: string } | null>(null);

  return (
    <>
      <footer className="relative w-full py-16 px-4 border-t" style={{ borderColor: `${currentTheme.glowColor}15` }}>
        <div className="max-w-6xl mx-auto">
          {/* 联系方式标题 */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-px" style={{ background: currentTheme.glowColor }} />
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: currentTheme.textColor }}>
              联系方式
            </h2>
            <div className="flex-1 h-px" style={{ background: `${currentTheme.glowColor}30` }} />
          </div>

          {/* 联系方式卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* QQ */}
            <button
              onClick={() => setQrModal({ src: '/qr/qq.png', label: 'QQ' })}
              className="group relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 text-left"
              style={{
                borderColor: `${currentTheme.glowColor}20`,
                background: `${currentTheme.bgColor}80`,
              }}
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `0 0 40px ${currentTheme.glowColor}15, inset 0 0 40px ${currentTheme.glowColor}05` }}
              />
              <div className="relative z-10 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${currentTheme.glowColor}15`, color: currentTheme.glowColor }}
                >
                  <MessageCircle size={24} />
                </div>
                <div>
                  <p className="text-xs font-mono mb-0.5" style={{ color: `${currentTheme.textColor}50` }}>QQ</p>
                  <p className="text-sm" style={{ color: `${currentTheme.textColor}70` }}>点击扫码</p>
                </div>
                <div className="ml-auto w-16 h-16 rounded-lg overflow-hidden border" style={{ borderColor: `${currentTheme.glowColor}20` }}>
                  <img src="/qr/qq.png" alt="QQ" className="w-full h-full object-cover" />
                </div>
              </div>
            </button>

            {/* 微信 */}
            <button
              onClick={() => setQrModal({ src: '/qr/wechat.png', label: '微信' })}
              className="group relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 text-left"
              style={{
                borderColor: `${currentTheme.glowColor}20`,
                background: `${currentTheme.bgColor}80`,
              }}
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `0 0 40px ${currentTheme.glowColor}15, inset 0 0 40px ${currentTheme.glowColor}05` }}
              />
              <div className="relative z-10 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${currentTheme.glowColor}15`, color: currentTheme.glowColor }}
                >
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-xs font-mono mb-0.5" style={{ color: `${currentTheme.textColor}50` }}>微信</p>
                  <p className="text-sm" style={{ color: `${currentTheme.textColor}70` }}>点击扫码</p>
                </div>
                <div className="ml-auto w-16 h-16 rounded-lg overflow-hidden border" style={{ borderColor: `${currentTheme.glowColor}20` }}>
                  <img src="/qr/wechat.png" alt="微信" className="w-full h-full object-cover" />
                </div>
              </div>
            </button>
          </div>

          {/* 底部版权 */}
          <div className="flex items-center justify-center gap-1 text-xs" style={{ color: `${currentTheme.textColor}40` }}>
            <span>Made with</span>
            <Heart size={12} style={{ color: currentTheme.glowColor }} />
            <span>by Tie</span>
          </div>
        </div>
      </footer>

      {/* 二维码放大模态框 */}
      {qrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-8"
          onClick={() => setQrModal(null)}
        >
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <button
              onClick={() => setQrModal(null)}
              className="absolute -top-10 right-0 p-2 rounded-lg hover:bg-white/10 transition"
            >
              <X size={20} className="text-white/60" />
            </button>
            <p className="text-sm font-semibold" style={{ color: currentTheme.textColor }}>
              扫描 {qrModal.label} 二维码
            </p>
            <div
              className="rounded-2xl overflow-hidden border p-2"
              style={{ borderColor: `${currentTheme.glowColor}30`, background: '#fff' }}
            >
              <img src={qrModal.src} alt={qrModal.label} className="w-64 h-64 object-contain" />
            </div>
          </div>
        </div>
      )}
    </>
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
