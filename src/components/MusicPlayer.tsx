import { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from './ThemeProvider';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, ListMusic, ChevronLeft } from 'lucide-react';

// 音频文件路径（从 public/audio 加载）
const AUDIO_DIR = '/audio/';

// 播放列表（与实际文件匹配）
interface Track {
  id: string;
  name: string;
  artist: string;
  file: string;
  duration: string;
}

const defaultTracks: Track[] = [
  { id: '1', name: 'FUNK NA MIRA', artist: 'Rezcaze, Hwungii, DJ VGK1', file: 'Rezcaze,Hwungii,DJ VGK1 - FUNK NA MIRA.mp3', duration: '03:24' },
];

export default function MusicPlayer() {
  const { currentTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [volume, setVolume] = useState(0.3);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPlayingRef = useRef(isPlaying);

  const tracks = defaultTracks;

  const tryPlay = useCallback(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  // 同步 isPlaying ref
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // 首次点击页面时自动播放（和视频同步）
  useEffect(() => {
    const handler = () => {
      if (!isPlayingRef.current) {
        tryPlay();
        setIsPlaying(true);
      }
    };
    window.addEventListener('tieblog-first-click', handler, { once: true });
    return () => window.removeEventListener('tieblog-first-click', handler);
  }, [tryPlay]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      tryPlay();
      setIsPlaying(true);
    }
  }, [isPlaying, tryPlay]);

  // 音量控制
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // 切换曲目
  const changeTrack = useCallback((index: number) => {
    setCurrentTrack(index);
    setProgress(0);
    setCurrentTime('00:00');
    setTimeout(() => {
      tryPlay();
      setIsPlaying(true);
    }, 100);
  }, [tryPlay]);

  // 进度更新
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        if (audioRef.current) {
          const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setProgress(isNaN(pct) ? 0 : pct);

          const mins = Math.floor(audioRef.current.currentTime / 60);
          const secs = Math.floor(audioRef.current.currentTime % 60);
          setCurrentTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        }
      }, 1000);
    } else if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying]);

  // 自动播放下一首
  const handleEnded = useCallback(() => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
    setTimeout(() => tryPlay(), 100);
  }, [tracks.length, tryPlay]);

  return (
    <>
      {/* 音频元素 */}
      <audio
        ref={audioRef}
        src={AUDIO_DIR + tracks[currentTrack].file}
        loop={false}
        onEnded={handleEnded}
        onLoadedMetadata={() => {
          if (isPlaying) tryPlay();
        }}
      />

      {/* ====== 右侧播放器容器（固定位置，不拦截hover） ====== */}
      <div
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center transition-all duration-500 ease-out"
        style={{
          transform: `translateY(-50%) translateX(${isExpanded ? '0' : 'calc(100% - 48px)'})`,
        }}
      >
        {/* 触发条（唯一hover触发区域） */}
        <div
          className="w-12 h-32 rounded-l-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all flex-shrink-0"
          style={{
            background: `linear-gradient(180deg, ${currentTheme.glowColor}15, ${currentTheme.glowColor}05)`,
            border: `1px solid ${currentTheme.glowColor}30`,
            borderRight: 'none',
            boxShadow: `-4px 0 20px ${currentTheme.glowColor}10`,
            backdropFilter: 'blur(12px)',
          }}
          onMouseEnter={() => setIsExpanded(true)}
        >
          <Music size={18} style={{ color: currentTheme.glowColor }} />
          <div className="flex flex-col gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-1 rounded-full transition-all"
                style={{
                  height: isPlaying ? `${12 + Math.random() * 16}px` : '4px',
                  background: currentTheme.glowColor,
                  opacity: isPlaying ? 0.8 : 0.4,
                  animation: isPlaying ? `equalizer ${0.5 + i * 0.2}s ease-in-out infinite alternate` : 'none',
                }}
              />
            ))}
          </div>
          <ChevronLeft size={14} style={{ color: currentTheme.glowColor, opacity: 0.6 }} />
        </div>

        {/* 播放器面板（hover保持展开） */}
        <div
          className="w-72 rounded-l-2xl overflow-hidden"
          style={{
            background: `linear-gradient(180deg, rgba(8,8,16,0.85) 0%, rgba(4,4,8,0.9) 100%)`,
            backdropFilter: 'blur(24px) saturate(1.3)',
            border: `1px solid rgba(255,255,255,0.08)`,
            borderRight: 'none',
            boxShadow: `
              -8px 0 40px rgba(0,0,0,0.4),
              0 0 60px ${currentTheme.glowColor}08,
              inset 0 1px 0 rgba(255,255,255,0.05)
            `,
          }}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          {/* 顶部：频谱可视化 */}
          <div className="h-12 flex items-end justify-center gap-[2px] px-5 pt-3 pb-1">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="w-[3px] rounded-full transition-all"
                style={{
                  height: isPlaying ? `${20 + Math.random() * 80}%` : '15%',
                  background: `linear-gradient(to top, ${currentTheme.glowColor}, ${currentTheme.glowColor}40)`,
                  opacity: isPlaying ? 0.9 : 0.3,
                  animation: isPlaying ? `equalizer ${0.3 + Math.random() * 0.8}s ease-in-out infinite alternate` : 'none',
                  animationDelay: `${i * 0.04}s`,
                }}
              />
            ))}
          </div>

          {/* 专辑封面区 */}
          <div className="px-5 py-3">
            <div
              className="w-full aspect-square rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.glowColor}12, ${currentTheme.glowColor}03)`,
                border: `1px solid ${currentTheme.glowColor}15`,
              }}
            >
              {/* 旋转光效 */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: `conic-gradient(from ${isPlaying ? '0deg' : '45deg'}, transparent, ${currentTheme.glowColor}20, transparent)`,
                  animation: isPlaying ? 'spin 8s linear infinite' : 'none',
                }}
              />
              <Music size={48} style={{ color: `${currentTheme.glowColor}40` }} />
            </div>
          </div>

          {/* 歌曲信息 */}
          <div className="px-5 pb-2 text-center">
            <p className="text-sm font-bold truncate" style={{ color: currentTheme.textColor }}>
              {tracks[currentTrack].name}
            </p>
            <p className="text-xs truncate mt-0.5" style={{ color: `${currentTheme.textColor}50` }}>
              {tracks[currentTrack].artist}
            </p>
          </div>

          {/* 进度条 */}
          <div className="px-5 py-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono" style={{ color: `${currentTheme.textColor}40` }}>
                {currentTime}
              </span>
              <div
                className="flex-1 h-1 rounded-full overflow-hidden relative cursor-pointer group"
                style={{ background: `${currentTheme.glowColor}10` }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = ((e.clientX - rect.left) / rect.width) * 100;
                  setProgress(pct);
                  if (audioRef.current) {
                    audioRef.current.currentTime = (pct / 100) * audioRef.current.duration;
                  }
                }}
              >
                <div
                  className="h-full rounded-full relative transition-all"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${currentTheme.glowColor}, ${currentTheme.glowColor}60)`,
                    boxShadow: `0 0 8px ${currentTheme.glowColor}50`,
                  }}
                >
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: currentTheme.glowColor,
                      boxShadow: `0 0 8px ${currentTheme.glowColor}`,
                    }}
                  />
                </div>
              </div>
              <span className="text-[10px] font-mono" style={{ color: `${currentTheme.textColor}40` }}>
                {tracks[currentTrack].duration}
              </span>
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-center gap-3 px-5 py-3">
            <button
              onClick={() => changeTrack((currentTrack - 1 + tracks.length) % tracks.length)}
              className="p-2 rounded-xl hover:bg-white/10 transition active:scale-95"
            >
              <SkipBack size={18} className="text-white/60" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3.5 rounded-full transition active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.glowColor}25, ${currentTheme.glowColor}08)`,
                border: `1px solid ${currentTheme.glowColor}35`,
                boxShadow: `0 0 24px ${currentTheme.glowColor}15, inset 0 1px 0 rgba(255,255,255,0.1)`,
              }}
            >
              {isPlaying ? (
                <Pause size={22} style={{ color: currentTheme.glowColor }} />
              ) : (
                <Play size={22} style={{ color: currentTheme.glowColor }} className="ml-0.5" />
              )}
            </button>

            <button
              onClick={() => changeTrack((currentTrack + 1) % tracks.length)}
              className="p-2 rounded-xl hover:bg-white/10 transition active:scale-95"
            >
              <SkipForward size={18} className="text-white/60" />
            </button>
          </div>

          {/* 播放列表切换 + 音量控制（滑块覆盖式） */}
          <div className="flex items-center justify-between px-5 pb-4">
            <button
              onClick={() => setShowPlaylist(!showPlaylist)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition hover:bg-white/10"
              style={{ color: `${currentTheme.textColor}60` }}
            >
              <ListMusic size={14} />
              <span>播放列表</span>
            </button>

            {/* 音量控制：滑块 + 按钮共享 hover 区域，避免滑块收起 */}
            <div
              className="relative flex items-center"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              {/* 音量滑块：absolute 向左弹出，覆盖 hover 区域 */}
              <div
                className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-2 transition-all duration-300 overflow-hidden pointer-events-none"
                style={{
                  width: showVolumeSlider ? '100px' : '0px',
                  opacity: showVolumeSlider ? 1 : 0,
                }}
              >
                <div
                  className="flex-1 h-1 rounded-full overflow-hidden cursor-pointer relative pointer-events-auto"
                  style={{ background: `${currentTheme.glowColor}15` }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    setVolume(Math.max(0, Math.min(1, pct)));
                  }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${volume * 100}%`,
                      background: `linear-gradient(90deg, ${currentTheme.glowColor}, ${currentTheme.glowColor}60)`,
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono w-5 text-right" style={{ color: `${currentTheme.textColor}50` }}>
                  {Math.round(volume * 100)}
                </span>
              </div>

              <button
                className="p-2 rounded-lg hover:bg-white/10 transition"
                onClick={() => {
                  if (volume > 0) {
                    setVolume(0);
                  } else {
                    setVolume(0.3);
                  }
                }}
              >
                {volume === 0 ? (
                  <VolumeX size={16} style={{ color: `${currentTheme.textColor}50` }} />
                ) : (
                  <Volume2 size={16} style={{ color: `${currentTheme.textColor}50` }} />
                )}
              </button>
            </div>
          </div>

          {/* 播放列表（展开） */}
          {showPlaylist && (
            <div
              className="mx-4 mb-4 rounded-xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid rgba(255,255,255,0.06)`,
              }}
            >
              {tracks.map((track, i) => (
                <button
                  key={track.id}
                  onClick={() => {
                    changeTrack(i);
                    setShowPlaylist(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition hover:bg-white/5"
                >
                  <span
                    className="text-xs font-mono w-5"
                    style={{ color: i === currentTrack ? currentTheme.glowColor : `${currentTheme.textColor}30` }}
                  >
                    {i === currentTrack ? (isPlaying ? '▶' : '❚❚') : `${i + 1}`.padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs truncate"
                      style={{ color: i === currentTrack ? currentTheme.glowColor : currentTheme.textColor }}
                    >
                      {track.name}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono" style={{ color: `${currentTheme.textColor}30` }}>
                    {track.duration}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
