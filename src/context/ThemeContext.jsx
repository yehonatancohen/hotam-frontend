import { createContext, useContext, useEffect, useState } from 'react';

// One palette for the whole site: a risograph zine. Paper stock and three
// flat inks: pink for action, blue for structure, yellow for highlight.
export const THEME = {
  bg: '#f3f3ef',           // paper stock
  bgAlt: '#e8e8e2',
  bgCard: '#ffffff',       // white sheet
  text: '#1d1d1f',
  textSub: '#45464b',
  textMuted: '#64656b',
  blue: '#0078bf',
  pink: '#ff48b0',
  yellow: '#ffe800',
  danger: '#c4122f',
  success: '#0f7a3d',
  border: 'rgba(29,29,31,0.14)',
  borderStrong: 'rgba(29,29,31,0.5)',
  // Legacy aliases still read by the customizer preview engine.
  accent: '#0078bf',
  accentHover: '#005a91',
  accentText: '#ffffff',
  accentSubtle: 'rgba(0,120,191,0.08)',
};

const ThemeContext = createContext();

const NAME_KEY = 'hotam_name';

function readName() {
  try { return localStorage.getItem(NAME_KEY) || '' } catch { return '' }
}

export function ThemeProvider({ children }) {
  // The visitor's name, typed once on the home door sign, follows them across the site.
  const [visitorName, setVisitorNameState] = useState(readName);

  const setVisitorName = (v) => {
    setVisitorNameState(v);
    try {
      if (v) localStorage.setItem(NAME_KEY, v);
      else localStorage.removeItem(NAME_KEY);
    } catch { /* storage unavailable */ }
  };

  useEffect(() => {
    const onStorage = (e) => { if (e.key === NAME_KEY) setVisitorNameState(e.newValue || '') };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: THEME, visitorName, setVisitorName }}>
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
