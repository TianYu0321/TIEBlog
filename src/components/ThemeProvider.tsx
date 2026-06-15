import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

export interface ThemeConfig {
  id: string;
  name: string;
  bgColor: string;
  glowColor: string;
  textColor: string;
  accentColor: string;
  description: string;
}

export const themes: ThemeConfig[] = [
  {
    id: 'matrix',
    name: 'Midnight Matrix',
    bgColor: '#0a0f0a',
    glowColor: '#00ff41',
    textColor: '#e0ffe0',
    accentColor: '#00ff41',
    description: '黑客帝国绿，科技感',
  },
  {
    id: 'pure',
    name: 'Pure White',
    bgColor: '#0a0a0a',
    glowColor: '#ffffff',
    textColor: '#f0f0f0',
    accentColor: '#ffffff',
    description: '极简白，纯净感',
  },
  {
    id: 'neon',
    name: 'Neon Tokyo',
    bgColor: '#0a0a12',
    glowColor: '#ff00aa',
    textColor: '#ffe0f5',
    accentColor: '#ff00aa',
    description: '粉紫霓虹，赛博朋克',
  },
  {
    id: 'lofi',
    name: 'Lo-Fi Chill',
    bgColor: '#0d0a0f',
    glowColor: '#ffa500',
    textColor: '#fff5e0',
    accentColor: '#ffa500',
    description: '暖橙色，舒适氛围',
  },
  {
    id: 'glitch',
    name: 'Glitch Core',
    bgColor: '#000000',
    glowColor: '#ff0000',
    textColor: '#ffe0e0',
    accentColor: '#ff0000',
    description: '红故障，张力感',
  },
];

interface ThemeContextType {
  currentTheme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: themes[0],
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setTheme] = useState(themes[0]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
