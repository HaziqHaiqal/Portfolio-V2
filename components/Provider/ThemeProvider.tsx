'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
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

function syncDocumentTheme(isDark: boolean) {
  const canvas = THEME_CANVAS[isDark ? 'dark' : 'light'];
  const colorScheme = isDark ? 'dark' : 'light';
  const root = document.documentElement;

  root.classList.toggle('dark', isDark);
  root.style.backgroundColor = canvas;
  root.style.colorScheme = colorScheme;
  document.body.style.backgroundColor = canvas;

  document
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute('content', canvas));
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="color-scheme"]')
    .forEach((meta) => meta.setAttribute('content', colorScheme));

  document.querySelector('meta[data-portfolio-theme-color]')?.remove();
  const themeColorMeta = document.createElement('meta');
  themeColorMeta.name = 'theme-color';
  themeColorMeta.content = canvas;
  themeColorMeta.dataset.portfolioThemeColor = '';
  document.head.appendChild(themeColorMeta);
}

export function ThemeProvider({
  children,
  initialIsDarkMode,
}: {
  children: ReactNode;
  initialIsDarkMode: boolean;
}) {
  const [isDarkMode, setIsDarkMode] = useState(initialIsDarkMode);

  useEffect(() => {
    syncDocumentTheme(isDarkMode);
  }, [isDarkMode]);

  const setTheme = (isDark: boolean) => {
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
