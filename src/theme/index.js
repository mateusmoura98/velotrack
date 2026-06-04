import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { darkColors } from './dark';
import { lightColors } from './light';
import { getTheme, setTheme } from './colors';

export const ThemeContext = createContext({
  isDark: true,
  theme: 'dark',
  toggleTheme: () => {},
  colors: darkColors,
});

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState('dark');

  useEffect(() => {
    const saved = getTheme();
    setThemeMode(saved);
  }, []);

  const toggleTheme = useCallback(() => {
    const nextMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
    setTheme(nextMode);
  }, [themeMode]);

  const activeColors = themeMode === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        isDark: themeMode === 'dark',
        theme: themeMode,
        toggleTheme,
        colors: activeColors,
      }}
    >
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

export { useThemeColors } from './useThemeColors';

