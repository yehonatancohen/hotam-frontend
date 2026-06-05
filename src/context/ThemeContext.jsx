import { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = {
  warm: {
    id: 'warm', label: 'חמים',
    bg: '#fcfbfa',
    bgAlt: '#f6f3ee',
    bgCard: '#ffffff',
    bgCardHover: '#faf9f7',
    text: '#201a16',
    textSub: '#52463e',
    textMuted: '#8a776c',
    accent: '#0d3b66',
    accentHover: '#07203b',
    accentText: '#ffffff',
    accentSubtle: 'rgba(13,59,102,0.06)',
    border: 'rgba(13,59,102,0.09)',
    borderStrong: 'rgba(13,59,102,0.2)',
    navBg: 'rgba(252,251,250,0.96)',
    shadow: '0 4px 24px rgba(32,26,22,0.05)',
    heroTint: 'linear-gradient(to left, rgba(252,251,250,0) 5%, rgba(252,251,250,0.82) 48%, rgba(252,251,250,0.99) 70%)',
  },
  dark: {
    id: 'dark', label: 'לילה',
    bg: '#110f0e',
    bgAlt: '#1a1715',
    bgCard: '#211e1b',
    bgCardHover: '#2a2622',
    text: '#f7f4eb',
    textSub: '#d4c9b8',
    textMuted: '#8c7f6f',
    accent: '#cfa052',
    accentHover: '#b88c3f',
    accentText: '#110f0e',
    accentSubtle: 'rgba(207,160,82,0.1)',
    border: 'rgba(207,160,82,0.15)',
    borderStrong: 'rgba(207,160,82,0.3)',
    navBg: 'rgba(17,15,14,0.97)',
    shadow: '0 4px 32px rgba(0,0,0,0.4)',
    heroTint: 'linear-gradient(to left, rgba(17,15,14,0) 5%, rgba(17,15,14,0.8) 46%, rgba(17,15,14,0.98) 70%)',
  },
  minimal: {
    id: 'minimal', label: 'נקי',
    bg: '#fafafa',
    bgAlt: '#f2f2f2',
    bgCard: '#ffffff',
    bgCardHover: '#f5f5f5',
    text: '#111111',
    textSub: '#555555',
    textMuted: '#888888',
    accent: '#000000',
    accentHover: '#222222',
    accentText: '#ffffff',
    accentSubtle: 'rgba(0,0,0,0.04)',
    border: 'rgba(0,0,0,0.08)',
    borderStrong: 'rgba(0,0,0,0.2)',
    navBg: 'rgba(250,250,250,0.96)',
    shadow: '0 4px 20px rgba(0,0,0,0.03)',
    heroTint: 'linear-gradient(to left, rgba(250,250,250,0) 5%, rgba(250,250,250,0.88) 48%, rgba(250,250,250,0.99) 70%)',
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
