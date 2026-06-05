import { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = {
  warm: {
    id: 'warm', label: 'חמים',
    bg: '#faf6f0',
    bgAlt: '#f0e6d2',
    bgCard: '#ffffff',
    bgCardHover: '#fdf8f2',
    text: '#2a1f12',
    textSub: '#5c4230',
    textMuted: '#9a7a5e',
    accent: '#005e97',
    accentHover: '#004875',
    accentText: '#ffffff',
    accentSubtle: 'rgba(0,94,151,0.08)',
    border: 'rgba(0,94,151,0.1)',
    borderStrong: 'rgba(0,94,151,0.22)',
    navBg: 'rgba(250,246,240,0.96)',
    shadow: '0 4px 32px rgba(0,94,151,0.1)',
    heroTint: 'linear-gradient(to left, rgba(250,246,240,0) 5%, rgba(250,246,240,0.82) 48%, rgba(250,246,240,0.99) 70%)',
  },
  dark: {
    id: 'dark', label: 'לילה',
    bg: '#141210',
    bgAlt: '#1e1a13',
    bgCard: '#242018',
    bgCardHover: '#2e2a20',
    text: '#f0e8d5',
    textSub: '#c0a878',
    textMuted: '#7a6248',
    accent: '#c8903c',
    accentHover: '#d8a04c',
    accentText: '#141210',
    accentSubtle: 'rgba(200,144,60,0.1)',
    border: 'rgba(200,144,60,0.13)',
    borderStrong: 'rgba(200,144,60,0.3)',
    navBg: 'rgba(20,18,16,0.97)',
    shadow: '0 4px 32px rgba(0,0,0,0.35)',
    heroTint: 'linear-gradient(to left, rgba(20,18,16,0) 5%, rgba(20,18,16,0.8) 46%, rgba(20,18,16,0.98) 70%)',
  },
  minimal: {
    id: 'minimal', label: 'נקי',
    bg: '#f4f3ef',
    bgAlt: '#e6e4dc',
    bgCard: '#ffffff',
    bgCardHover: '#f9f8f4',
    text: '#1a1816',
    textSub: '#484440',
    textMuted: '#888480',
    accent: '#1a1816',
    accentHover: '#3c3830',
    accentText: '#f4f3ef',
    accentSubtle: 'rgba(26,24,22,0.05)',
    border: 'rgba(26,24,22,0.09)',
    borderStrong: 'rgba(26,24,22,0.22)',
    navBg: 'rgba(244,243,239,0.96)',
    shadow: '0 4px 32px rgba(26,24,22,0.08)',
    heroTint: 'linear-gradient(to left, rgba(244,243,239,0) 5%, rgba(244,243,239,0.88) 48%, rgba(244,243,239,0.99) 70%)',
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    try {
      return localStorage.getItem('hotam_theme') || 'warm';
    } catch {
      return 'warm';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('hotam_theme', themeId);
    } catch {}
  }, [themeId]);

  const theme = THEMES[themeId] || THEMES.warm;

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
