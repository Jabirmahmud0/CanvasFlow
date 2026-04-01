import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const THEME_KEY = 'canvasflow-theme';
const VALID_THEMES = ['dark', 'light', 'high-contrast'];

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored && VALID_THEMES.includes(stored)) return stored;
    // Respect system preference if no stored preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });

  const applyTheme = useCallback((newTheme) => {
    const root = document.documentElement;

    // Remove all theme classes then add the new one
    VALID_THEMES.forEach((t) => root.classList.remove(t));
    root.classList.add(newTheme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const themeColors = {
      dark: '#0D0D0D',
      light: '#F8FAFC',
      'high-contrast': '#000000',
    };
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColors[newTheme]);
    }

    // Persist
    localStorage.setItem(THEME_KEY, newTheme);

    // Notify canvas and other subscribers
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: newTheme } }));
  }, []);

  // Apply on mount + system preference changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Listen for system preference changes (auto-update if not manually set)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const stored = localStorage.getItem(THEME_KEY);
      if (!stored) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setTheme = useCallback((newTheme) => {
    if (!VALID_THEMES.includes(newTheme)) return;
    setThemeState(newTheme);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((current) => {
      const idx = VALID_THEMES.indexOf(current);
      return VALID_THEMES[(idx + 1) % VALID_THEMES.length];
    });
  }, []);

  const isDark = theme === 'dark' || theme === 'high-contrast';
  const isLight = theme === 'light';
  const isHighContrast = theme === 'high-contrast';

  const value = {
    theme,
    setTheme,
    cycleTheme,
    isDark,
    isLight,
    isHighContrast,
    themes: VALID_THEMES,
    // Canvas colors derived from theme
    canvasBackground: {
      dark: '#0D0D0D',
      light: '#F0F4F8',
      'high-contrast': '#000000',
    }[theme],
    gridColor: {
      dark: '#1E2A3B',
      light: '#C8D3E0',
      'high-contrast': '#555555',
    }[theme],
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
};

export default useTheme;
