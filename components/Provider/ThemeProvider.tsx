'use client';

import { createContext, ReactNode, useContext, useState } from 'react';
import { THEME_CANVAS, THEME_COOKIE } from '@constants/theme';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ONE_YEAR = 60 * 60 * 24 * 365;

function persistTheme(isDark: boolean) {
  document.cookie = `${THEME_COOKIE}=${isDark ? 'dark' : 'light'}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}

export function ThemeProvider({
  children,
  initialIsDarkMode,
}: {
  children: ReactNode;
  initialIsDarkMode: boolean;
}) {
  const [isDarkMode, setIsDarkMode] = useState(initialIsDarkMode);

  const setTheme = (isDark: boolean) => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.style.backgroundColor = THEME_CANVAS[isDark ? 'dark' : 'light'];
    root.style.colorScheme = isDark ? 'dark' : 'light';
    setIsDarkMode(isDark);
    persistTheme(isDark);
  };

  const toggleDarkMode = () => {
    setTheme(!isDarkMode);
  };

  const setDarkMode = (isDark: boolean) => {
    setTheme(isDark);
  };

  const value = {
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    console.warn(
      'useTheme called outside ThemeProvider, using fallback values'
    );
    return {
      isDarkMode: false,
      toggleDarkMode: () => {},
      setDarkMode: () => {},
    };
  }
  return context;
}
