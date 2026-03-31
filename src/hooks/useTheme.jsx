import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'dark', // 'dark', 'light', 'high-contrast'
  setTheme: () => null,
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check local storage first
    const savedTheme = localStorage.getItem('canvasflow-theme');
    if (savedTheme) return savedTheme;
    
    // Check OS preference
    if (window.matchMedia && window.matchMedia('(prefers-contrast: more)').matches) {
      return 'high-contrast';
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    
    return 'dark'; // Default
  });

  useEffect(() => {
    // Remove existing theme classes
    document.documentElement.classList.remove('theme-dark', 'theme-light', 'theme-high-contrast');
    
    // Add new theme class
    document.documentElement.classList.add(`theme-${theme}`);
    
    // Set color-scheme for native elements
    document.documentElement.style.colorScheme = theme === 'light' ? 'light' : 'dark';
    
    // For Tailwind standard dark mode compat
    if (theme === 'dark' || theme === 'high-contrast') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to local storage
    localStorage.setItem('canvasflow-theme', theme);
  }, [theme]);

  // Listen for system changes if no explicit preference is set
  useEffect(() => {
    const handleContrastChange = (e) => {
      if (e.matches && !localStorage.getItem('canvasflow-theme')) {
        setTheme('high-contrast');
      }
    };
    
    const mql = window.matchMedia('(prefers-contrast: more)');
    mql.addEventListener('change', handleContrastChange);
    return () => mql.removeEventListener('change', handleContrastChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
