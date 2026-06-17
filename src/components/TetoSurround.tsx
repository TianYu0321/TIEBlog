import { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from './ThemeProvider';

// 视频文件路径
const VIDEO_MAIN = '/video/' + encodeURIComponent('6月15日.mp4');

export default function TetoSurround() {
  const { currentTheme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const tryPlay = useCallback(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  useEffect(() => {
    const handler = () => tryPlay();
    window.addEventListener('tieblog-first-click', handler, { once: true });
    return () => window.removeEventListener('tieblog-first-click', handler);
  }, [tryPlay]);

  // 检测移动端：preload 降级
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#000' }}>
      {/* 骨架状态：加载期间显示主题色脉冲 */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div
            className="w-full h-full"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, ${currentTheme.glowColor}08 0%, transparent 70%)`,
              animation: 'breathe 2s ease-in-out infinite',
            }}
          />
        </div>
      )}

      {/* 视频加载失败提示 */}
      {hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <p className="text-sm" style={{ color: `${currentTheme.textColor}50` }}>
            视频加载失败，请刷新页面重试
          </p>
        </div>
      )}

      {/* 视频层：独立 GPU 图层，缓入淡入 */}
      <div
        className="absolute inset-0"
        style={{
          transform: 'translateZ(0)',
          willChange: 'transform, opacity',
          contain: 'layout style paint',
          zIndex: 1,
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 1.5s ease-out',
        }}
      >
        <video
          ref={videoRef}
          src={VIDEO_MAIN}
          poster="/video/poster.jpg"
          muted
          loop
          playsInline
          preload={isMobile ? 'metadata' : 'auto'}
          className="w-full h-full"
          style={{
            objectFit: 'cover',
            display: 'block',
          }}
          onLoadedData={() => setIsLoaded(true)}
          onError={() => { setIsLoaded(true); setHasError(true); }}
        />
      </div>

      {/* 叠加层：暗角 + 边缘淡化 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background: `
            radial-gradient(ellipse 70% 55% at 50% 50%, transparent 30%, rgba(0,0,0,0.6) 75%, rgba(0,0,0,0.85) 100%)
          `,
          mixBlendMode: 'multiply',
        }}
      />

      {/* 呼吸光晕 */}
      <div
        className="absolute inset-0 pointer-events-none glow-breathe"
        style={{
          zIndex: 3,
          background: `radial-gradient(ellipse at 50% 60%, ${currentTheme.glowColor}06 0%, transparent 55%)`,
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
}
