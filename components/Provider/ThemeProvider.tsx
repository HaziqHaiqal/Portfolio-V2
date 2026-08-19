"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "portfolio-theme";

// localStorage is the source of truth for the theme, surfaced to React via
// useSyncExternalStore. This is hydration-safe by construction — the server
// snapshot is always light and the client swaps to the stored value after
// hydration — so no setState-in-effect (or mounted flag) is needed.
const themeListeners = new Set<() => void>();

function subscribeToTheme(callback: () => void) {
  themeListeners.add(callback);
  window.addEventListener("storage", callback); // keep tabs in sync
  return () => {
    themeListeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function readStoredTheme(): boolean {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Handle both old and new storage formats
      return parsed.state ? parsed.state.isDarkMode : parsed.isDarkMode;
    }
  } catch (error) {
    console.warn("Error parsing saved theme:", error);
  }
  // No stored preference: fall back to the system setting.
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function writeStoredTheme(isDark: boolean) {
  localStorage.setItem(
    THEME_STORAGE_KEY,
    JSON.stringify({ state: { isDarkMode: isDark } }),
  );
  // The storage event only fires in other tabs, so notify this tab directly.
  themeListeners.forEach((listener) => listener());
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const isDarkMode = useSyncExternalStore(
    subscribeToTheme,
    readStoredTheme,
    () => false,
  );

  // Reflect the current theme on the document element.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    writeStoredTheme(!isDarkMode);
  };

  const setDarkMode = (isDark: boolean) => {
    writeStoredTheme(isDark);
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
    // Return fallback values instead of throwing error
    console.warn(
      "useTheme called outside ThemeProvider, using fallback values",
    );
    return {
      isDarkMode: false,
      toggleDarkMode: () => {},
      setDarkMode: () => {},
    };
  }
  return context;
}

// CSS classes hook for consistent styling
export function useThemeClasses() {
  const { isDarkMode } = useTheme();

  return {
    // Background variants
    bg: {
      primary: isDarkMode ? "bg-gray-800" : "bg-gray-50",
      secondary: isDarkMode ? "bg-gray-900" : "bg-white",
      card: isDarkMode ? "bg-gray-700/80" : "bg-white/80",
      surface: isDarkMode ? "bg-gray-700" : "bg-white",
    },

    // Text variants
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-300" : "text-gray-700",
      muted: isDarkMode ? "text-gray-400" : "text-gray-500",
      accent: "text-blue-600",
    },

    // Border variants
    border: {
      primary: isDarkMode ? "border-gray-700/20" : "border-white/20",
      secondary: isDarkMode ? "border-gray-700" : "border-gray-200",
      muted: isDarkMode ? "border-gray-600" : "border-gray-300",
    },

    // Interactive states
    hover: {
      bg: isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100/50",
      text: isDarkMode ? "hover:text-gray-200" : "hover:text-gray-800",
    },

    // Component-specific
    navbar: isDarkMode
      ? "bg-gray-800/70 border-gray-700/20"
      : "bg-white/70 border-white/20",
    modal: isDarkMode
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200",
  };
}
